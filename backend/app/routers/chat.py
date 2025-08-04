"""
Refactored chat router without chat creation.
Chats are logged directly with conversation context.
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
from app.models import User, Chat, Character, ConversationSummary
from app.schemas.chat import ChatCreate, ChatResponse, ChatRole
from app.services.chat_service import ChatService

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


async def get_recent_chats(
    db: AsyncSession,
    user_id: int,
    character_id: int,
    limit: int = 20
) -> List[Chat]:
    """Get recent chats between user and character"""
    # We use user_id and character_id combination to identify chats
    query = select(Chat).where(
        Chat.user_id == user_id,
        Chat.character_id == character_id
    ).order_by(Chat.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    chats = result.scalars().all()
    
    # Return in chronological order
    return list(reversed(chats))


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
    recent_chats: List[Chat]
) -> Optional[str]:
    """Generate a new conversation summary using Claude"""
    if len(recent_chats) < 10:  # Don't summarize if too few chats
        return None
    
    # Prepare conversation text
    conversation_text = ""
    for msg in recent_chats:
        role = "사용자" if msg.role == ChatRole.USER else "AI"
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
            chat_count=len(recent_chats)
        )
        db.add(summary)
        await db.commit()
        
        return summary_text
        
    except Exception as e:
        print(f"Failed to generate summary: {e}")
        return None


@router.post("", response_model=ChatResponse)
@router.post("/", response_model=ChatResponse)
async def send_chat(
    chat_create: ChatCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message and get AI response"""
    # Validate character exists
    character = await db.get(Character, chat_create.character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Create user chat
    user_chat = Chat(
        user_id=current_user.user_id,
        character_id=character.character_id,
        role=ChatRole.USER,
        content=chat_create.content,
        is_from_user=True
    )
    db.add(user_chat)
    await db.commit()
    await db.refresh(user_chat)
    
    print(f"✅ User chat saved: ID={user_chat.chat_id}, User={current_user.user_id}, Character={character.character_id}, Content='{chat_create.content[:50]}...'") 
    
    # Broadcast user message
    await manager.broadcast_to_user(
        current_user.user_id,
        {
            "type": "message",
            "character_id": character.character_id,
            "chat": ChatResponse.model_validate(user_chat).model_dump(),
        },
    )
    
    # Generate AI response asynchronously
    asyncio.create_task(
        generate_ai_response(
            user_chat,
            character,
            current_user.user_id,
            db
        )
    )
    
    return ChatResponse.model_validate(user_chat)


async def generate_ai_response(
    user_chat: Chat,
    character: Character,
    user_id: int,
    db: AsyncSession
):
    """Generate AI response using direct Anthropic API"""
    try:
        # Get recent conversation history
        recent_chats = await get_recent_chats(
            db, user_id, character.character_id, limit=20
        )
        
        # Get conversation summary
        conversation_summary = await get_conversation_summary(
            db, user_id, character.character_id
        )
        
        # Prepare messages for Claude
        messages = []
        for msg in recent_chats[:-1]:  # Exclude the current chat
            role = "user" if msg.role == ChatRole.USER else "assistant"
            messages.append({"role": role, "content": msg.content})
        
        # Add the current user message
        messages.append({"role": "user", "content": user_chat.content})
        
        # Prepare system prompt with character prompt and conversation context
        system_prompt = character.prompt
        if conversation_summary:
            system_prompt += f"\n\n[이전 대화 요약]\n{conversation_summary}\n\n위 요약을 참고하여 일관성 있는 대화를 이어가주세요."
        
        # Create AI message placeholder
        ai_chat = Chat(
            user_id=user_id,
            character_id=character.character_id,
            role=ChatRole.ASSISTANT,
            content="",
            token_cost=0  # Will be updated after response
        )
        db.add(ai_chat)
        await db.commit()
        await db.refresh(ai_chat)
        
        # Broadcast AI message start
        await manager.broadcast_to_user(
            user_id,
            {
                "type": "chat_start",
                "character_id": character.character_id,
                "chat": ChatResponse.model_validate(ai_chat).model_dump(),
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
        ai_chat.content = response.content[0].text
        await db.commit()
        
        print(f"✅ AI response saved: ID={ai_chat.chat_id}, Character={character.character_id}, Content='{response.content[0].text[:50]}...'")
        
        # Track token usage
        total_tokens = 0
        if hasattr(response, 'usage'):
            total_tokens = response.usage.input_tokens + response.usage.output_tokens
            # Update AI message with token cost
            ai_chat.token_cost = total_tokens
            await db.commit()
        
        # Update usage statistics with token information
        await ChatService.update_usage_stats(
            db, user_id, character.character_id, total_tokens
        )
        
        # Check if we need to generate a summary (every 20 chats)
        total_chats = len(recent_chats) + 2  # Include current exchange
        if total_chats % 20 == 0:
            await generate_conversation_summary(
                db, user_id, character.character_id, recent_chats + [user_chat, ai_chat]
            )
        
        # Broadcast completion
        await manager.broadcast_to_user(
            user_id,
            {
                "type": "chat_complete",
                "character_id": character.character_id,
                "chat": ChatResponse.model_validate(ai_chat).model_dump(),
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
        # Create a simple fallback response when AI service fails
        fallback_response = "죄송합니다. 현재 AI 서비스에 문제가 있어 응답을 생성할 수 없습니다. 잠시 후 다시 시도해주세요."
        
        # Update AI message with fallback response
        ai_chat.content = fallback_response
        await db.commit()
        
        # Broadcast fallback response
        await manager.broadcast_to_user(
            user_id,
            {
                "type": "chat_complete",
                "character_id": character.character_id,
                "chat": ChatResponse.model_validate(ai_chat).model_dump(),
                "is_fallback": True
            },
        )
        
        print(f"AI service error, using fallback response: {str(e)}")


@router.get("")
@router.get("/")
async def get_chats(
    character_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get chats between user and character"""
    # Verify character exists
    character = await db.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Get chats
    query = select(Chat).where(
        Chat.user_id == current_user.user_id,
        Chat.character_id == character_id
    ).order_by(Chat.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    chats = result.scalars().all()
    
    # Return in chronological order
    chats.reverse()
    
    return [ChatResponse.model_validate(chat) for chat in chats]


async def get_user_from_token(
    token: str, db: AsyncSession
) -> Optional[User]:
    """Get user from JWT token for SSE authentication"""
    from app.core.auth import verify_token
    from sqlalchemy import select
    
    payload = verify_token(token)
    if payload is None:
        return None

    username: str = payload.get("sub")
    if username is None:
        return None

    result = await db.execute(select(User).filter(User.username == username))
    user = result.scalar_one_or_none()
    return user


@router.get("/stream/{character_id}")
async def message_stream(
    character_id: int,
    request: Request,
    token: str = Query(..., description="JWT authentication token"),
    db: AsyncSession = Depends(get_db),
):
    """Server-Sent Events endpoint for real-time chats"""
    # Authenticate user from token
    current_user = await get_user_from_token(token, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
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
                    # Wait for chats with timeout for keep-alive
                    message = await asyncio.wait_for(queue.get(), timeout=30.0)
                    
                    # Only send chats for this character
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
    
    # Get recent chats
    recent_chats = await get_recent_chats(
        db, current_user.user_id, character_id, limit=50
    )
    
    if not recent_chats:
        return {"message": "No chats to summarize", "summary_created": False}
    
    # Generate summary
    summary = await generate_conversation_summary(
        db, current_user.user_id, character_id, recent_chats
    )
    
    return {
        "message": "Conversation ended",
        "summary_created": summary is not None
    }