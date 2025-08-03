"""
Pydantic schemas package

This package contains all request/response schemas organized by domain.
Import commonly used schemas here for easy access.
"""
# User schemas
from .user import (
    UserBase, UserCreate, UserUpdate, UserLogin,
    UserResponse, UserWithStats, AdminUserResponse,
    TokenResponse
)

# Character schemas
from .character import (
    CharacterBase, CharacterCreate, CharacterUpdate,
    CharacterResponse, CharacterWithStats
)

# Chat schemas
from .chat import (
    MessageRole, ChatCreate, ChatResponse,
    MessageCreate, MessageResponse, ChatCreateWithMessage,
    MessageInChat, ChatWithMessages, ChatListResponse
)

# Prompt schemas
from .prompt import (
    PromptBase, PromptCreate, PromptUpdate, PromptResponse,
    CommonPromptBase, CommonPromptCreate, CommonPromptUpdate, CommonPromptResponse
)

# Stats schemas
from .stats import (
    UsageStatResponse, UsageOverview, DailyUsage,
    AdminStatsResponse, UserUsageStats
)

# Common schemas
from .common import (
    PaginationParams, PaginatedResponse,
    ErrorResponse, ValidationErrorResponse,
    SuccessResponse, DeleteResponse, HealthCheckResponse
)

# Export commonly used schemas
__all__ = [
    # User
    "UserCreate", "UserLogin", "UserResponse", "TokenResponse", "UserUpdate",
    # Character
    "CharacterCreate", "CharacterResponse", "CharacterUpdate",
    # Chat
    "ChatCreate", "ChatResponse", "MessageCreate", "MessageResponse",
    # Prompt
    "PromptCreate", "PromptResponse", "PromptUpdate",
    # Common
    "PaginationParams", "PaginatedResponse", "ErrorResponse",
    # Stats
    "AdminStatsResponse", "UsageStatResponse"
]