"""
Conversation summary Pydantic schemas
"""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional


class ConversationSummaryBase(BaseModel):
    """Base schema for conversation summary"""
    summary: str = Field(..., description="Summarized conversation content")
    chat_count: int = Field(0, ge=0, description="Number of chats included in summary")


class ConversationSummaryCreate(ConversationSummaryBase):
    """Schema for creating a conversation summary"""
    user_id: int
    character_id: int


class ConversationSummaryResponse(ConversationSummaryBase):
    """Schema for conversation summary response"""
    conversation_summary_id: int
    user_id: int
    character_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ConversationSummaryListResponse(BaseModel):
    """Paginated conversation summary list response"""
    summaries: list[ConversationSummaryResponse]
    total: int
    skip: int
    limit: int