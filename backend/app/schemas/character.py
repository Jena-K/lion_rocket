"""
Character-related Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CharacterBase(BaseModel):
    """Base character schema with common fields"""
    name: str = Field(..., min_length=1, max_length=100)
    system_prompt: str = Field(..., min_length=1)
    description: Optional[str] = None


class CharacterCreate(CharacterBase):
    """Schema for creating a new character"""
    pass


class CharacterUpdate(BaseModel):
    """Schema for updating character details"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    system_prompt: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None


class CharacterResponse(CharacterBase):
    """Schema for character response"""
    id: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CharacterWithStats(CharacterResponse):
    """Character response with usage statistics"""
    chat_count: int = 0
    total_messages: int = 0
    last_used: Optional[datetime] = None


class CharacterListResponse(CharacterResponse):
    """Character response for list views"""
    chat_count: int = 0
    last_used: Optional[datetime] = None