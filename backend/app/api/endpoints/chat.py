from typing import List, Optional, AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import json
import asyncio
from datetime import datetime
from sse_starlette.sse import EventSourceResponse

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.chat import Chat, Message
from app.models.character import Character
from app.schemas.chat import (
    ChatCreate,
    ChatResponse,
    MessageCreate,
    MessageResponse,
    ChatListResponse,
)
from app.services.claude_service import ClaudeService

router = APIRouter()
claude_service = ClaudeService()


# Store SSE connections for broadcasting
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, List[asyncio.Queue]] = {}

    def add_connection(self, user_id: int, queue: asyncio.Queue):
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(queue)

    def remove_connection(self, user_id: int, queue: asyncio.Queue):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(queue)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def broadcast_to_user(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            for queue in self.active_connections[user_id]:
                await queue.put(message)


manager = ConnectionManager()


@router.post("/", response_model=ChatResponse)
async def create_chat(
    chat_create: ChatCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new chat session"""
    # Verify character exists and user has access
    character = await db.get(Character, chat_create.character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    if character.is_private and character.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to private character")

    # Create chat
    chat = Chat(
        user_id=current_user.id,
        character_id=chat_create.character_id,
        title=chat_create.title or f"Chat with {character.name}",
    )

    db.add(chat)
    await db.commit()
    await db.refresh(chat)

    return ChatResponse.from_orm(chat)


@router.get("/", response_model=ChatListResponse)
async def list_chats(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    character_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's chats with pagination"""
    query = select(Chat).where(Chat.user_id == current_user.id)

    if character_id:
        query = query.where(Chat.character_id == character_id)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # Get paginated results
    query = query.order_by(Chat.updated_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    chats = result.scalars().all()

    return ChatListResponse(
        chats=[ChatResponse.from_orm(chat) for chat in chats], total=total, skip=skip, limit=limit
    )


@router.get("/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get a specific chat"""
    chat = await db.get(Chat, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if chat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return ChatResponse.from_orm(chat)


@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Delete a chat and all its messages"""
    chat = await db.get(Chat, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if chat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    await db.delete(chat)
    await db.commit()

    return {"message": "Chat deleted successfully"}


@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
async def list_messages(
    chat_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List messages in a chat"""
    # Verify chat access
    chat = await db.get(Chat, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if chat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get messages
    query = select(Message).where(Message.chat_id == chat_id)
    query = query.order_by(Message.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    messages = result.scalars().all()

    # Reverse to get chronological order
    messages.reverse()

    return [MessageResponse.from_orm(msg) for msg in messages]


@router.post("/{chat_id}/messages", response_model=MessageResponse)
async def send_message(
    chat_id: int,
    message_create: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message and get AI response"""
    # Verify chat access
    chat = await db.get(Chat, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if chat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Create user message
    user_message = Message(chat_id=chat_id, content=message_create.content, is_from_user=True)
    db.add(user_message)
    await db.commit()
    await db.refresh(user_message)

    # Broadcast user message via SSE
    await manager.broadcast_to_user(
        current_user.id,
        {
            "type": "message",
            "chat_id": chat_id,
            "message": MessageResponse.from_orm(user_message).dict(),
        },
    )

    # Generate AI response asynchronously
    asyncio.create_task(generate_ai_response(chat_id, chat, user_message, current_user.id, db))

    return MessageResponse.from_orm(user_message)


async def generate_ai_response(
    chat_id: int, chat: Chat, user_message: Message, user_id: int, db: AsyncSession
):
    """Generate AI response in the background"""
    try:
        # Get character
        character = await db.get(Character, chat.character_id)

        # Get conversation history
        query = select(Message).where(Message.chat_id == chat_id)
        query = query.order_by(Message.created_at.asc()).limit(20)
        result = await db.execute(query)
        messages = result.scalars().all()

        # Prepare context
        conversation_history = []
        for msg in messages[:-1]:  # Exclude the current message
            role = "user" if msg.is_from_user else "assistant"
            conversation_history.append({"role": role, "content": msg.content})

        # Stream response from Claude
        response_content = ""
        ai_message = Message(chat_id=chat_id, content="", is_from_user=False)
        db.add(ai_message)
        await db.commit()
        await db.refresh(ai_message)

        # Broadcast initial AI message
        await manager.broadcast_to_user(
            user_id,
            {
                "type": "message_start",
                "chat_id": chat_id,
                "message": MessageResponse.from_orm(ai_message).dict(),
            },
        )

        # Stream response chunks
        async for chunk in claude_service.generate_response_stream(
            user_message.content, character.system_prompt, conversation_history
        ):
            response_content += chunk

            # Broadcast chunk
            await manager.broadcast_to_user(
                user_id,
                {
                    "type": "message_chunk",
                    "chat_id": chat_id,
                    "message_id": ai_message.id,
                    "chunk": chunk,
                },
            )

        # Update message with complete response
        ai_message.content = response_content
        await db.commit()

        # Update chat timestamp
        chat.updated_at = datetime.utcnow()
        await db.commit()

        # Broadcast completion
        await manager.broadcast_to_user(
            user_id,
            {
                "type": "message_complete",
                "chat_id": chat_id,
                "message": MessageResponse.from_orm(ai_message).dict(),
            },
        )

    except Exception as e:
        # Broadcast error
        await manager.broadcast_to_user(
            user_id, {"type": "error", "chat_id": chat_id, "error": str(e)}
        )


@router.get("/{chat_id}/stream")
async def message_stream(
    chat_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Server-Sent Events endpoint for real-time messages"""
    # Verify chat access
    chat = await db.get(Chat, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if chat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    async def event_generator():
        queue = asyncio.Queue()
        manager.add_connection(current_user.id, queue)

        try:
            # Send initial connection event
            yield {"event": "connected", "data": json.dumps({"chat_id": chat_id})}

            # Keep connection alive and send events
            while True:
                if await request.is_disconnected():
                    break

                try:
                    # Wait for messages with timeout for keep-alive
                    message = await asyncio.wait_for(queue.get(), timeout=30.0)

                    # Only send messages for this chat
                    if message.get("chat_id") == chat_id:
                        yield {"event": message.get("type", "message"), "data": json.dumps(message)}
                except asyncio.TimeoutError:
                    # Send keep-alive ping
                    yield {
                        "event": "ping",
                        "data": json.dumps({"timestamp": datetime.utcnow().isoformat()}),
                    }

        finally:
            manager.remove_connection(current_user.id, queue)

    return EventSourceResponse(event_generator())


# Import function count for proper operation
from sqlalchemy import func
