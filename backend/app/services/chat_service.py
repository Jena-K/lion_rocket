from datetime import datetime, date
from typing import Optional, List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models import Chat, UsageStat, ConversationSummary
from app.schemas.chat import ChatRole
from app.services.claude_service import claude_service


class ChatService:
    """Service for managing chat operations and usage tracking"""

    @staticmethod
    async def update_usage_stats(
        db: AsyncSession, 
        user_id: int,
        character_id: int,
        token_count: int = 0
    ) -> None:
        """Update user's usage statistics for today"""
        today = date.today()

        # Get or create today's usage stat for user and character
        result = await db.execute(
            select(UsageStat).filter(
                UsageStat.user_id == user_id,
                UsageStat.character_id == character_id, 
                UsageStat.usage_date == today
            )
        )
        usage_stat = result.scalar_one_or_none()

        if not usage_stat:
            usage_stat = UsageStat(
                user_id=user_id,
                character_id=character_id,
                usage_date=today, 
                chat_count=0,
                token_count=0
            )
            db.add(usage_stat)

        # Update stats
        usage_stat.chat_count += 1
        usage_stat.token_count += token_count
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
    async def get_total_user_tokens(db: AsyncSession, user_id: int) -> int:
        """Get total tokens used by a user"""
        result = await db.execute(
            select(func.sum(UsageStat.token_count)).filter(UsageStat.user_id == user_id)
        )
        return result.scalar() or 0

    @staticmethod
    async def get_user_chat_count(db: AsyncSession, user_id: int) -> int:
        """Get total chat count for a user"""
        result = await db.execute(
            select(func.count()).select_from(Chat).filter(Chat.user_id == user_id)
        )
        return result.scalar() or 0

    @staticmethod
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


# Create singleton instance
chat_service = ChatService()