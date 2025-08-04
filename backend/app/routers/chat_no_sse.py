"""
Chat router without SSE - using simple request-response pattern.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import json
from datetime import datetime

from app.database import get_db
from app.core.auth import get_current_user
from app.models import User, Chat, Character, ConversationSummary
from app.schemas.chat import ChatCreate, ChatResponse, ChatRole, ChatMessageResponse
from app.services.chat_service import ChatService
from app.services.claude_service import claude_service

router = APIRouter()


async def get_recent_chats(
    db: AsyncSession,
    user_id: int,
    character_id: int,
    limit: int = 20
) -> List[Chat]:
    """Get recent chats between user and character"""
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
    recent_chats: List[Chat],
    force_summary: bool = False
) -> Optional[str]:
    """Generate conversation summary using Claude API
    
    Args:
        db: Database session
        user_id: User ID
        character_id: Character ID
        recent_chats: List of recent chat messages
        force_summary: Force summary generation even with few messages (for end conversation)
    """
    # Don't summarize if too few chats (unless forced)
    if not force_summary and len(recent_chats) < 10:
        return None
    
    try:
        # Get the most recent summary for this user-character pair
        previous_summary = await get_conversation_summary(db, user_id, character_id)
        
        # Prepare conversation history for summarization
        conversation_text = ""
        for chat in recent_chats[-20:]:  # Use last 20 messages
            role = "사용자" if chat.role == ChatRole.USER else "캐릭터"
            conversation_text += f"{role}: {chat.content}\n"
        
        # Build the summary prompt
        if previous_summary:
            summary_prompt = f"""이전 대화 요약:
{previous_summary}

새로운 대화 내용:
{conversation_text}

위의 이전 요약과 새로운 대화 내용을 종합하여, 전체 대화의 흐름을 반영한 새로운 요약을 작성해주세요. 
주요 주제, 관계의 발전, 중요한 사건이나 정보를 포함하여 3-4문장으로 요약해주세요."""
        else:
            summary_prompt = f"""다음 대화 내용을 간결하게 요약해주세요. 주요 주제, 분위기, 대화의 흐름을 포함하여 2-3문장으로 요약해주세요.

대화 내용:
{conversation_text}"""
        
        messages = [{"role": "user", "content": summary_prompt}]
        
        summary_text, _ = await claude_service.generate_response(
            messages=messages,
            system_prompt="당신은 대화 내용을 정확하고 간결하게 요약하는 전문가입니다. 이전 요약이 있다면 그것을 바탕으로 새로운 정보를 통합하여 포괄적인 요약을 만들어주세요.",
            max_tokens=300
        )
        
        # Save the AI-generated summary
        summary = ConversationSummary(
            user_id=user_id,
            character_id=character_id,
            summary=summary_text,
            message_count=len(recent_chats)
        )
        db.add(summary)
        await db.commit()
        
        print(f"[OK] Generated conversation summary for user {user_id} and character {character_id}")
        return summary_text
        
    except Exception as e:
        print(f"[ERROR] Failed to generate AI summary: {e}")
        # Simple fallback without elaborate mock data
        summary_text = f"최근 {len(recent_chats)}개의 메시지로 구성된 대화가 있었습니다."
        
        summary = ConversationSummary(
            user_id=user_id,
            character_id=character_id,
            summary=summary_text,
            message_count=len(recent_chats)
        )
        db.add(summary)
        await db.commit()
        
        return summary_text


@router.post("", response_model=ChatMessageResponse)
@router.post("/", response_model=ChatMessageResponse)
async def send_chat(
    chat_create: ChatCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message and get AI response synchronously"""
    try:
        print(f"[DEBUG] Received chat request: user_id={current_user.user_id}, character_id={chat_create.character_id}, content='{chat_create.content[:50]}...'")
        
        # Validate character exists
        character = await db.get(Character, chat_create.character_id)
        if not character:
            print(f"[ERROR] Character not found: character_id={chat_create.character_id}")
            raise HTTPException(status_code=404, detail="Character not found")
        
        print(f"[DEBUG] Character found: {character.name}")
        
        # Create user chat
        user_chat = Chat(
            user_id=current_user.user_id,
            character_id=character.character_id,
            role=ChatRole.USER,
            content=chat_create.content,
        )
        db.add(user_chat)
        await db.commit()
        await db.refresh(user_chat)
        
        print(f"[OK] User chat saved: ID={user_chat.chat_id}, User={current_user.user_id}, Character={character.character_id}, Content='{chat_create.content[:50]}...'") 
        
        # Get recent conversation history
        recent_chats = await get_recent_chats(
            db, current_user.user_id, character.character_id, limit=20
        )
        
        # Get conversation summary
        conversation_summary = await get_conversation_summary(
            db, current_user.user_id, character.character_id
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
        
        # Generate Claude API response
        print(f"[DEBUG] Generating AI response...")
        claude_response, total_tokens = await claude_service.generate_chat_response(
            user_message=user_chat.content,
            character_prompt=character.prompt,
            conversation_history=messages[:-1],  # Exclude current message
            conversation_summary=conversation_summary
        )
        
        # Create AI message
        ai_chat = Chat(
            user_id=current_user.user_id,
            character_id=character.character_id,
            role=ChatRole.ASSISTANT,
            content=claude_response,
            token_cost=total_tokens
        )
        db.add(ai_chat)
        await db.commit()
        await db.refresh(ai_chat)
        
        # Log response type
        is_fallback = not claude_service.is_available() or "AI 서비스에 일시적인 문제" in claude_response
        response_type = "FALLBACK" if is_fallback else "CLAUDE_API"
        print(f"[OK] {response_type} response saved: ID={ai_chat.chat_id}, Character={character.character_id}, Tokens={total_tokens}, Content='{claude_response[:50]}...'")
        
        # Update usage statistics with token information
        try:
            await ChatService.update_usage_stats(
                db, current_user.user_id, character.character_id, total_tokens
            )
        except Exception as e:
            print(f"[WARNING] Failed to update usage stats: {e}")
            # Don't fail the whole request just because of stats update
            await db.rollback()
            # Re-commit the chat messages
            await db.commit()
        
        # Check if we need to generate a summary (every 20 chats)
        total_chats = len(recent_chats) + 2  # Include current exchange
        if total_chats % 20 == 0:
            await generate_conversation_summary(
                db, current_user.user_id, character.character_id, 
                recent_chats + [user_chat, ai_chat]
            )
        
        # Return both user and AI messages
        return ChatMessageResponse(
            user_message=ChatResponse.model_validate(user_chat),
            ai_message=ChatResponse.model_validate(ai_chat)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Unexpected error in send_chat: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Create error response
        error_chat = Chat(
            user_id=current_user.user_id,
            character_id=chat_create.character_id,
            role=ChatRole.ASSISTANT,
            content="죄송합니다. 현재 AI 서비스에 문제가 있어 응답을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.",
            token_cost=0
        )
        db.add(error_chat)
        await db.commit()
        await db.refresh(error_chat)
        
        return ChatMessageResponse(
            user_message=ChatResponse.model_validate(user_chat),
            ai_message=ChatResponse.model_validate(error_chat)
        )


@router.get("")
@router.get("/")
async def get_chats(
    character_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1),
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
    
    # Generate summary (force=True for end conversation)
    summary = await generate_conversation_summary(
        db, current_user.user_id, character_id, recent_chats, force_summary=True
    )
    
    return {
        "message": "Conversation ended",
        "summary_created": summary is not None
    }