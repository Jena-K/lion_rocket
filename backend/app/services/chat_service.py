from datetime import datetime, date
from typing import Optional, List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models import Chat, Message, UsageStat, ConversationSummary
from app.schemas.chat import MessageRole
from app.services.claude_service import claude_service


class ChatService:
    """Service for managing chat operations and usage tracking"""

    @staticmethod
    async def create_chat(db: AsyncSession, user_id: int, character_id: int) -> Chat:
        """Create a new chat session"""
        chat = Chat(user_id=user_id, character_id=character_id, last_message_at=datetime.utcnow())
        db.add(chat)
        await db.commit()
        await db.refresh(chat)
        return chat

    @staticmethod
    async def get_user_chats(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 20) -> List[Chat]:
        """Get all chats for a user with pagination"""
        result = await db.execute(
            select(Chat)
            .filter(Chat.user_id == user_id)
            .order_by(Chat.last_message_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    async def get_chat_by_id(db: AsyncSession, chat_id: int, user_id: int) -> Optional[Chat]:
        """Get a specific chat if it belongs to the user"""
        result = await db.execute(
            select(Chat).filter(Chat.id == chat_id, Chat.user_id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def delete_chat(db: AsyncSession, chat_id: int, user_id: int) -> bool:
        """Delete a chat if it belongs to the user"""
        result = await db.execute(
            select(Chat).filter(Chat.id == chat_id, Chat.user_id == user_id)
        )
        chat = result.scalar_one_or_none()

        if chat:
            await db.delete(chat)
            await db.commit()
            return True
        return False

    @staticmethod
    async def add_message(
        db: AsyncSession, chat_id: int, role: MessageRole, content: str, token_count: int = 0
    ) -> Message:
        """Add a message to a chat"""
        message = Message(chat_id=chat_id, role=role, content=content, token_count=token_count)
        db.add(message)

        # Update chat's last message time
        chat = await db.get(Chat, chat_id)
        if chat:
            chat.last_message_at = datetime.utcnow()

        await db.commit()
        await db.refresh(message)
        return message

    @staticmethod
    async def get_chat_messages(db: AsyncSession, chat_id: int, limit: Optional[int] = None) -> List[Message]:
        """Get messages for a chat, optionally limited to recent messages"""
        query = select(Message).filter(Message.chat_id == chat_id)

        if limit:
            # Get the most recent messages but return in chronological order
            result = await db.execute(
                query.order_by(Message.created_at.desc()).limit(limit)
            )
            messages = result.scalars().all()
            return list(reversed(messages))

        result = await db.execute(query.order_by(Message.created_at.asc()))
        return result.scalars().all()

    @staticmethod
    async def update_usage_stats(db: AsyncSession, user_id: int, tokens_used: int) -> None:
        """Update user's usage statistics for today"""
        today = date.today()

        # Get or create today's usage stat
        result = await db.execute(
            select(UsageStat).filter(
                UsageStat.user_id == user_id, 
                UsageStat.usage_date == today
            )
        )
        usage_stat = result.scalar_one_or_none()

        if not usage_stat:
            usage_stat = UsageStat(user_id=user_id, usage_date=today, chat_count=0, total_tokens=0)
            db.add(usage_stat)

        # Update stats
        usage_stat.chat_count += 1
        usage_stat.total_tokens += tokens_used
        await db.commit()

    @staticmethod
    async def get_user_usage_stats(
        db: AsyncSession,
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[UsageStat]:
        """Get usage statistics for a user within a date range"""
        query = select(UsageStat).filter(UsageStat.user_id == user_id)

        if start_date:
            query = query.filter(UsageStat.usage_date >= start_date)
        if end_date:
            query = query.filter(UsageStat.usage_date <= end_date)

        result = await db.execute(query.order_by(UsageStat.usage_date.desc()))
        return result.scalars().all()

    @staticmethod
    async def get_chat_count_for_user(db: AsyncSession, user_id: int) -> int:
        """Get total number of chats for a user"""
        result = await db.execute(
            select(func.count()).select_from(Chat).filter(Chat.user_id == user_id)
        )
        return result.scalar() or 0

    @staticmethod
    async def get_message_count_for_chat(db: AsyncSession, chat_id: int) -> int:
        """Get total number of messages in a chat"""
        result = await db.execute(
            select(func.count()).select_from(Message).filter(Message.chat_id == chat_id)
        )
        return result.scalar() or 0

    @staticmethod
    async def get_latest_conversation_summary(
        db: AsyncSession, user_id: int, character_id: int
    ) -> Optional[ConversationSummary]:
        """Get the most recent conversation summary for a user-character pair"""
        result = await db.execute(
            select(ConversationSummary)
            .filter(
                and_(
                    ConversationSummary.user_id == user_id,
                    ConversationSummary.character_id == character_id
                )
            )
            .order_by(ConversationSummary.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_conversation_summary(
        db: AsyncSession,
        user_id: int,
        character_id: int,
        summary: str,
        message_count: int
    ) -> ConversationSummary:
        """Create a new conversation summary"""
        summary_obj = ConversationSummary(
            user_id=user_id,
            character_id=character_id,
            summary=summary,
            message_count=message_count
        )
        db.add(summary_obj)
        await db.commit()
        await db.refresh(summary_obj)
        return summary_obj

    @staticmethod
    async def generate_conversation_summary(
        db: AsyncSession,
        chat_id: int,
        user_id: int,
        character_id: int,
        force: bool = False
    ) -> Optional[ConversationSummary]:
        """Generate a conversation summary if needed (every 20 messages or when forced)"""
        # Get the message count
        message_count = await ChatService.get_message_count_for_chat(db, chat_id)
        
        # Check if we need to summarize (every 20 messages or forced)
        if not force and message_count % 20 != 0:
            return None
            
        # Get the latest 20 messages
        recent_messages = await ChatService.get_chat_messages(db, chat_id, limit=20)
        
        if not recent_messages:
            return None
            
        # Get the latest conversation summary if it exists
        latest_summary = await ChatService.get_latest_conversation_summary(db, user_id, character_id)
        
        # Prepare the conversation history for summarization
        conversation_text = ""
        for msg in recent_messages:
            role = "사용자" if msg.role == MessageRole.USER else "AI"
            conversation_text += f"{role}: {msg.content}\n\n"
        
        # Create the summarization prompt
        summary_prompt = f"""다음은 사용자와 AI 캐릭터 간의 최근 대화 내용입니다.

{conversation_text}

"""
        
        if latest_summary:
            summary_prompt += f"""이전 대화 요약:
{latest_summary.summary}

"""
        
        summary_prompt += """위 대화 내용을 바탕으로, 다음 사항을 포함하여 간결하게 요약해주세요:
1. 대화의 주요 주제
2. 사용자의 관심사나 선호도
3. 중요한 정보나 결정사항
4. 대화의 감정적 톤이나 분위기

요약은 200자 이내로 작성해주세요."""

        # Generate summary using Claude API
        try:
            # Create a temporary character for summarization
            from app.models import Character
            summary_character = Character(
                name="Summary Assistant",
                prompt="당신은 대화 내용을 요약하는 전문가입니다. 핵심 정보를 놓치지 않으면서도 간결하게 요약해주세요."
            )
            
            # Generate summary
            summary_text, _, _ = await claude_service.generate_response(
                [],  # No previous messages
                summary_character,
                summary_prompt,
                conversation_summary=None
            )
            
            if summary_text:
                # Create new conversation summary
                return await ChatService.create_conversation_summary(
                    db,
                    user_id=user_id,
                    character_id=character_id,
                    summary=summary_text,
                    message_count=message_count
                )
        except Exception as e:
            # Log error but don't fail the chat
            print(f"Failed to generate conversation summary: {e}")
            
        return None

    @staticmethod
    async def get_conversation_context(
        db: AsyncSession,
        user_id: int,
        character_id: int,
        chat_id: int,
        include_recent_messages: int = 10
    ) -> Dict[str, any]:
        """Get conversation context including summary and recent messages"""
        context = {
            "summary": None,
            "recent_messages": [],
            "message_count": 0
        }
        
        # Get the latest conversation summary
        latest_summary = await ChatService.get_latest_conversation_summary(db, user_id, character_id)
        if latest_summary:
            context["summary"] = latest_summary.summary
            
        # Get recent messages from current chat
        if include_recent_messages > 0:
            recent_messages = await ChatService.get_chat_messages(db, chat_id, limit=include_recent_messages)
            context["recent_messages"] = [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "created_at": msg.created_at
                }
                for msg in recent_messages
            ]
            
        # Get total message count
        context["message_count"] = await ChatService.get_message_count_for_chat(db, chat_id)
        
        return context


# Singleton instance
chat_service = ChatService()