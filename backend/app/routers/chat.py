"""
Refactored chat router without chat creation.
Messages are logged directly with conversation context.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import json
import asyncio
from datetime import datetime
from sse_starlette.sse import EventSourceResponse
from anthropic import Anthropic, APIError, APIConnectionError, RateLimitError
import os

from app.database import get_db
from app.core.auth import get_current_user
from app.models import User, Message, Character, ConversationSummary
from app.schemas.chat import MessageCreate, MessageResponse, MessageRole

router = APIRouter()

# Initialize Anthropic client directly
anthropic_client = Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-3-sonnet-20240229")
CLAUDE_MAX_TOKENS = int(os.getenv("CLAUDE_MAX_TOKENS", "1000"))
CLAUDE_TEMPERATURE = float(os.getenv("CLAUDE_TEMPERATURE", "0.7"))


# Connection manager for SSE
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


async def get_recent_messages(
    db: AsyncSession,
    user_id: int,
    character_id: int,
    limit: int = 20
) -> List[Message]:
    """Get recent messages between user and character"""
    # Note: Since we removed chat_id, we need a new way to identify messages
    # We'll use user_id and character_id combination
    query = select(Message).where(
        Message.user_id == user_id,
        Message.character_id == character_id
    ).order_by(Message.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    # Return in chronological order
    return list(reversed(messages))


async def get_conversation_summary(
    db: AsyncSession,
    user_id: int,
    character_id: int
) -> Optional[str]:
    """Get the latest conversation summary"""
    query = select(ConversationSummary).where(
        ConversationSummary.user_id == user_id,
        ConversationSummary.character_id == character_id
    ).order_by(ConversationSummary.created_at.desc()).limit(1)
    
    result = await db.execute(query)
    summary = result.scalar_one_or_none()
    
    return summary.summary if summary else None


async def generate_conversation_summary(
    db: AsyncSession,
    user_id: int,
    character_id: int,
    recent_messages: List[Message]
) -> Optional[str]:
    """Generate a new conversation summary using Claude"""
    if len(recent_messages) < 10:  # Don't summarize if too few messages
        return None
    
    # Prepare conversation text
    conversation_text = ""
    for msg in recent_messages:
        role = "사용자" if msg.role == MessageRole.USER else "AI"
        conversation_text += f"{role}: {msg.content}\n\n"
    
    # Get existing summary if any
    existing_summary = await get_conversation_summary(db, user_id, character_id)
    
    # Create summarization prompt
    prompt = f"""다음은 사용자와 AI 캐릭터 간의 최근 대화 내용입니다.

{conversation_text}

"""
    
    if existing_summary:
        prompt += f"""이전 대화 요약:
{existing_summary}

"""
    
    prompt += """위 대화 내용을 바탕으로, 다음 사항을 포함하여 간결하게 요약해주세요:
1. 대화의 주요 주제
2. 사용자의 관심사나 선호도
3. 중요한 정보나 결정사항
4. 대화의 감정적 톤이나 분위기

요약은 200자 이내로 작성해주세요."""

    try:
        # Use Anthropic directly for summarization
        response = anthropic_client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=500,
            temperature=0.3,  # Lower temperature for more consistent summaries
            system="당신은 대화 내용을 요약하는 전문가입니다. 핵심 정보를 놓치지 않으면서도 간결하게 요약해주세요.",
            messages=[{"role": "user", "content": prompt}]
        )
        
        summary_text = response.content[0].text
        
        # Save the new summary
        summary = ConversationSummary(
            user_id=user_id,
            character_id=character_id,
            summary=summary_text,
            message_count=len(recent_messages)
        )
        db.add(summary)
        await db.commit()
        
        return summary_text
        
    except Exception as e:
        print(f"Failed to generate summary: {e}")
        return None


@router.post("/messages", response_model=MessageResponse)
async def send_message(
    message_create: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message and get AI response"""
    # Validate character exists
    character = await db.get(Character, message_create.character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Create user message (without chat_id)
    user_message = Message(
        user_id=current_user.user_id,
        character_id=character.character_id,
        role=MessageRole.USER,
        content=message_create.content,
        is_from_user=True
    )
    db.add(user_message)
    await db.commit()
    await db.refresh(user_message)
    
    # Broadcast user message
    await manager.broadcast_to_user(
        current_user.user_id,
        {
            "type": "message",
            "character_id": character.character_id,
            "message": MessageResponse.model_validate(user_message).model_dump(),
        },
    )
    
    # Generate AI response asynchronously
    asyncio.create_task(
        generate_ai_response(
            user_message,
            character,
            current_user.user_id,
            db
        )
    )
    
    return MessageResponse.model_validate(user_message)


async def generate_ai_response(
    user_message: Message,
    character: Character,
    user_id: int,
    db: AsyncSession
):
    """Generate AI response using direct Anthropic API"""
    try:
        # Get recent conversation history
        recent_messages = await get_recent_messages(
            db, user_id, character.character_id, limit=20
        )
        
        # Get conversation summary
        conversation_summary = await get_conversation_summary(
            db, user_id, character.character_id
        )
        
        # Prepare messages for Claude
        messages = []
        for msg in recent_messages[:-1]:  # Exclude the current message
            role = "user" if msg.role == MessageRole.USER else "assistant"
            messages.append({"role": role, "content": msg.content})
        
        # Add the current user message
        messages.append({"role": "user", "content": user_message.content})
        
        # Prepare system prompt with character prompt and conversation context
        system_prompt = character.prompt
        if conversation_summary:
            system_prompt += f"\n\n[이전 대화 요약]\n{conversation_summary}\n\n위 요약을 참고하여 일관성 있는 대화를 이어가주세요."
        
        # Create AI message placeholder
        ai_message = Message(
            user_id=user_id,
            character_id=character.character_id,
            role=MessageRole.ASSISTANT,
            content="",
            is_from_user=False
        )
        db.add(ai_message)
        await db.commit()
        await db.refresh(ai_message)
        
        # Broadcast AI message start
        await manager.broadcast_to_user(
            user_id,
            {
                "type": "message_start",
                "character_id": character.character_id,
                "message": MessageResponse.model_validate(ai_message).model_dump(),
            },
        )
        
        # Call Anthropic API directly
        response = anthropic_client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=CLAUDE_MAX_TOKENS,
            temperature=CLAUDE_TEMPERATURE,
            system=system_prompt,
            messages=messages
        )
        
        # Update AI message with response
        ai_message.content = response.content[0].text
        ai_message.token_count = response.usage.input_tokens + response.usage.output_tokens
        await db.commit()
        
        # Check if we need to generate a summary (every 20 messages)
        total_messages = len(recent_messages) + 2  # Include current exchange
        if total_messages % 20 == 0:
            await generate_conversation_summary(
                db, user_id, character.character_id, recent_messages + [user_message, ai_message]
            )
        
        # Broadcast completion
        await manager.broadcast_to_user(
            user_id,
            {
                "type": "message_complete",
                "character_id": character.character_id,
                "message": MessageResponse.model_validate(ai_message).model_dump(),
            },
        )
        
    except RateLimitError as e:
        error_msg = "AI service is currently busy. Please try again later."
        await manager.broadcast_to_user(
            user_id,
            {"type": "error", "character_id": character.character_id, "error": error_msg}
        )
    except APIConnectionError as e:
        error_msg = "Unable to connect to AI service. Please check your connection."
        await manager.broadcast_to_user(
            user_id,
            {"type": "error", "character_id": character.character_id, "error": error_msg}
        )
    except APIError as e:
        error_msg = f"AI service error: {str(e)}"
        await manager.broadcast_to_user(
            user_id,
            {"type": "error", "character_id": character.character_id, "error": error_msg}
        )
    except Exception as e:
        await manager.broadcast_to_user(
            user_id,
            {"type": "error", "character_id": character.character_id, "error": str(e)}
        )


@router.get("/messages")
async def get_messages(
    character_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get messages between user and character"""
    # Verify character exists
    character = await db.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Get messages
    query = select(Message).where(
        Message.user_id == current_user.user_id,
        Message.character_id == character_id
    ).order_by(Message.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    # Return in chronological order
    messages.reverse()
    
    return [MessageResponse.model_validate(msg) for msg in messages]


@router.get("/stream/{character_id}")
async def message_stream(
    character_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Server-Sent Events endpoint for real-time messages"""
    # Verify character exists
    character = await db.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    async def event_generator():
        queue = asyncio.Queue()
        manager.add_connection(current_user.user_id, queue)
        
        try:
            # Send initial connection event
            yield {
                "event": "connected",
                "data": json.dumps({"character_id": character_id})
            }
            
            # Keep connection alive and send events
            while True:
                if await request.is_disconnected():
                    break
                
                try:
                    # Wait for messages with timeout for keep-alive
                    message = await asyncio.wait_for(queue.get(), timeout=30.0)
                    
                    # Only send messages for this character
                    if message.get("character_id") == character_id:
                        yield {
                            "event": message.get("type", "message"),
                            "data": json.dumps(message)
                        }
                except asyncio.TimeoutError:
                    # Send keep-alive ping
                    yield {
                        "event": "ping",
                        "data": json.dumps({"timestamp": datetime.utcnow().isoformat()}),
                    }
        
        finally:
            manager.remove_connection(current_user.user_id, queue)
    
    return EventSourceResponse(event_generator())


@router.post("/end-conversation/{character_id}")
async def end_conversation(
    character_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Force conversation summarization for a character"""
    # Verify character exists
    character = await db.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Get recent messages
    recent_messages = await get_recent_messages(
        db, current_user.user_id, character_id, limit=50
    )
    
    if not recent_messages:
        return {"message": "No messages to summarize", "summary_created": False}
    
    # Generate summary
    summary = await generate_conversation_summary(
        db, current_user.user_id, character_id, recent_messages
    )
    
    return {
        "message": "Conversation ended",
        "summary_created": summary is not None
    }