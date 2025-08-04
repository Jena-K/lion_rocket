"""
Character model for AI character/persona management
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from .base import Base


class GenderEnum(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"


class Character(Base):
    __tablename__ = "characters"

    character_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    gender = Column(Enum(GenderEnum), nullable=False)
    intro = Column(Text, nullable=False)  # 간단소개
    personality_tags = Column(JSON, nullable=False)  # 성격태그 (list of strings)
    interest_tags = Column(JSON, nullable=False)  # 관심사 태그 (list of strings)
    prompt = Column(Text, nullable=False)  # 프롬프트
    avatar_url = Column(String(500), nullable=True)  # Avatar image URL
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="created_characters")
    chats = relationship("Chat", back_populates="character", cascade="all, delete-orphan")
    conversation_summaries = relationship("ConversationSummary", back_populates="character", cascade="all, delete-orphan")
    usage_stats = relationship("UsageStat", back_populates="character", cascade="all, delete-orphan")