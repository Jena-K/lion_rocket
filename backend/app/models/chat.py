"""
Chat model for direct chat logging
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class Chat(Base):
    __tablename__ = "chats"

    chat_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    character_id = Column(Integer, ForeignKey("characters.character_id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    token_cost = Column(Integer, default=0)  # Token cost for this chat (0 for user chats)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_chat_at = Column(DateTime(timezone=True), nullable=True)  # Last interaction time
    
    # Relationships
    user = relationship("User", back_populates="chats")
    character = relationship("Character", back_populates="chats")