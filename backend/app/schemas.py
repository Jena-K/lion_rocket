from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum


# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# Character schemas
class CharacterBase(BaseModel):
    name: str
    system_prompt: str


class CharacterCreate(CharacterBase):
    pass


class CharacterResponse(CharacterBase):
    id: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True


# Chat schemas
class ChatCreate(BaseModel):
    character_id: int


class ChatResponse(BaseModel):
    id: int
    user_id: int
    character_id: int
    created_at: datetime
    last_message_at: Optional[datetime]

    class Config:
        from_attributes = True


# Message schemas
class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class MessageCreate(BaseModel):
    content: str = Field(
        ..., min_length=1, max_length=200, description="Message content (max 200 characters)"
    )

    @validator("content")
    def validate_content(cls, v):
        if not v or not v.strip():
            raise ValueError("Message content cannot be empty")
        return v.strip()


class MessageResponse(BaseModel):
    id: int
    chat_id: int
    role: MessageRole
    content: str
    token_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# Common Prompt schemas
class CommonPromptBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    prompt_text: str = Field(..., min_length=1)


class CommonPromptCreate(CommonPromptBase):
    pass


class CommonPromptUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    prompt_text: Optional[str] = Field(None, min_length=1)


class CommonPromptResponse(CommonPromptBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Usage Statistics schemas
class UsageStatResponse(BaseModel):
    id: int
    user_id: int
    usage_date: date
    chat_count: int
    total_tokens: int
    created_at: datetime

    class Config:
        from_attributes = True


class UsageOverview(BaseModel):
    total_chats: int
    total_tokens: int
    average_tokens_per_chat: float
    period_start: date
    period_end: date


# Enhanced response schemas with relationships
class MessageInChat(MessageResponse):
    pass


class ChatWithMessages(ChatResponse):
    character: CharacterResponse
    messages: List[MessageInChat] = []
    message_count: int = 0


class CharacterWithStats(CharacterResponse):
    chat_count: int = 0
    total_messages: int = 0


class UserWithStats(UserResponse):
    total_chats: int = 0
    total_tokens: int = 0


# Pagination schemas
class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    pages: int
    limit: int


# Admin schemas
class AdminUserResponse(UserResponse):
    total_chats: int
    total_tokens: int
    last_active: Optional[datetime]


class AdminStatsResponse(BaseModel):
    total_users: int
    active_users_today: int
    total_chats: int
    total_messages: int
    total_tokens_used: int
    average_tokens_per_user: float


# Error schemas
class ErrorResponse(BaseModel):
    detail: str
    status: int


class ValidationErrorResponse(BaseModel):
    detail: List[Dict[str, Any]]
    status: int = 422


# Chat creation with initial message
class ChatCreateWithMessage(ChatCreate):
    initial_message: Optional[str] = Field(None, max_length=200)
