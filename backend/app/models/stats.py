"""
Statistics and usage tracking models
"""
from sqlalchemy import Column, Integer, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class UsageStat(Base):
    """Daily usage statistics per user and character"""
    __tablename__ = "usage_stats"

    usage_stat_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    character_id = Column(Integer, ForeignKey("characters.character_id"), nullable=False, index=True)
    usage_date = Column(Date, nullable=False, index=True)
    chat_count = Column(Integer, default=0)  # Number of chat interactions
    token_count = Column(Integer, default=0)  # Total tokens used
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="usage_stats")
    character = relationship("Character", back_populates="usage_stats")

    # Unique constraint on user_id + usage_date
    __table_args__ = (
        {'mysql_engine': 'InnoDB'}
    )