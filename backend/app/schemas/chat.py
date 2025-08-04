"""
Chat schemas for request/response validation
"""
from __future__ import annotations

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum


class ChatRole(str, Enum):
    """Enum for chat roles"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


# MessageRole removed - use ChatRole instead


class ChatCreate(BaseModel):
    """Schema for creating a new chat"""
    content: str = Field(
        ..., 
        min_length=1, 
        max_length=200,  # Limited to 200 characters per user request
        description="Chat content (max 200 characters)"
    )
    character_id: int = Field(..., description="ID of the character to chat with")

    @field_validator("content")
    def validate_content(cls, v):
        if not v or not v.strip():
            raise ValueError("Chat content cannot be empty")
        # Ensure content doesn't exceed 200 characters after stripping
        stripped = v.strip()
        if len(stripped) > 200:
            raise ValueError("Chat content cannot exceed 200 characters")
        return stripped


class ChatResponse(BaseModel):
    """Schema for chat response"""
    chat_id: int
    user_id: int
    character_id: int
    role: ChatRole
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatMessageResponse(BaseModel):
    """Response containing both user and AI messages"""
    user_message: ChatResponse
    ai_message: ChatResponse