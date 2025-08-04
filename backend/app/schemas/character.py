"""
Character-related Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum


class GenderEnum(str, Enum):
    male = "male"
    female = "female"


class CharacterBase(BaseModel):
    """Base character schema with common fields"""
    name: str = Field(..., min_length=1, max_length=100)
    gender: GenderEnum
    intro: str = Field(..., min_length=1, description="간단소개")
    personality_tags: List[str] = Field(..., min_items=1, description="성격태그")
    interest_tags: List[str] = Field(..., min_items=1, description="관심사 태그")
    prompt: str = Field(..., min_length=1, description="프롬프트")


class CharacterCreate(CharacterBase):
    """Schema for creating a new character"""
    pass


class CharacterUpdate(BaseModel):
    """Schema for updating character details"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    gender: Optional[GenderEnum] = None
    intro: Optional[str] = Field(None, min_length=1)
    personality_tags: Optional[List[str]] = Field(None, min_items=1)
    interest_tags: Optional[List[str]] = Field(None, min_items=1)
    prompt: Optional[str] = Field(None, min_length=1)


class CharacterResponse(CharacterBase):
    """Schema for character response"""
    character_id: int
    created_by: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    avatar_url: Optional[str] = Field(None, description="Avatar image URL")
    
    # Optional statistics fields for admin endpoints
    chat_count: Optional[int] = Field(None, description="Total number of chats for this character")
    unique_users: Optional[int] = Field(None, description="Number of unique users who chatted with this character")

    model_config = ConfigDict(from_attributes=True)


class CharacterWithStats(CharacterResponse):
    """Character response with usage statistics"""
    chat_count: int = 0
    total_chats: int = 0
    last_used: Optional[datetime] = None


class CharacterListResponse(BaseModel):
    """Paginated character list response"""
    characters: list[CharacterResponse]
    total: int
    skip: int
    limit: int


class CharacterSelectionResponse(BaseModel):
    """Response for character selection"""
    message: str
    character: CharacterResponse