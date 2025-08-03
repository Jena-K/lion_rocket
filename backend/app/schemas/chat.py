"""
Chat and Message schemas for request/response validation
"""
from __future__ import annotations

from pydantic import BaseModel, Field, validator
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from enum import Enum

if TYPE_CHECKING:
    from .character import CharacterResponse


class MessageRole(str, Enum):
    """Enum for message roles"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatCreate(BaseModel):
    """Schema for creating a new chat"""
    character_id: int


class ChatResponse(BaseModel):
    """Schema for chat response"""
    id: int
    user_id: int
    character_id: int
    title: Optional[str] = None
    created_at: datetime
    last_message_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    """Schema for creating a new message"""
    content: str = Field(
        ..., 
        min_length=1, 
        max_length=4000,  # Increased limit for longer conversations
        description="Message content"
    )
    chat_id: Optional[int] = None  # Optional for new chat creation
    character_id: Optional[int] = None  # Required if chat_id is not provided

    @validator("content")
    def validate_content(cls, v):
        if not v or not v.strip():
            raise ValueError("Message content cannot be empty")
        return v.strip()


class MessageResponse(BaseModel):
    """Schema for message response"""
    id: int
    chat_id: int
    role: MessageRole
    content: str
    token_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatCreateWithMessage(ChatCreate):
    """Schema for creating a chat with an initial message"""
    initial_message: str = Field(..., min_length=1, max_length=4000)


class MessageInChat(MessageResponse):
    """Message schema for inclusion in chat responses"""
    pass


class ChatWithMessages(ChatResponse):
    """Chat response with messages and character info"""
    messages: List[MessageInChat] = []
    message_count: int = 0
    
    # Include character info
    character: Optional[CharacterResponse] = None


class ChatListResponse(ChatResponse):
    """Chat response for list views with summary info"""
    message_count: int = 0
    last_message: Optional[str] = None
    character_name: Optional[str] = None