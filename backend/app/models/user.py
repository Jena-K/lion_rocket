"""
User model for authentication and user management
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")
    created_characters = relationship("Character", back_populates="creator", cascade="all, delete-orphan")
    created_prompts = relationship("Prompt", back_populates="creator", cascade="all, delete-orphan")
    usage_stats = relationship("UsageStat", back_populates="user", cascade="all, delete-orphan")