"""
User-related Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema with common fields"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """Schema for user profile updates"""
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class UserLogin(BaseModel):
    """Schema for user login request"""
    username: str  # Can be username or email
    password: str


class UserResponse(UserBase):
    """Schema for user response (excludes sensitive data)"""
    id: int
    is_admin: bool
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserWithStats(UserResponse):
    """User response with usage statistics"""
    total_chats: int = 0
    total_tokens: int = 0
    total_characters: int = 0
    total_prompts: int = 0


class AdminUserResponse(UserResponse):
    """Enhanced user response for admin views"""
    total_chats: int
    total_tokens: int
    last_active: Optional[datetime]


class TokenResponse(BaseModel):
    """JWT token response after successful authentication"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse