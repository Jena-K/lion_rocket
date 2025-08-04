"""
Conversation summary model for storing summarized chat histories
"""
from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class ConversationSummary(Base):
    __tablename__ = "conversation_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    character_id = Column(Integer, ForeignKey("characters.character_id"), nullable=False, index=True)
    summary = Column(Text, nullable=False)
    message_count = Column(Integer, default=0, nullable=False)  # Number of messages included in this summary
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="conversation_summaries")
    character = relationship("Character", back_populates="conversation_summaries")