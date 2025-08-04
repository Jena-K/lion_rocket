"""
Pydantic schemas package

This package contains all request/response schemas organized by domain.
Import commonly used schemas here for easy access.
"""
# User schemas
from .user import (
    UserBase, UserCreate, UserUpdate, UserLogin,
    UserResponse, UserWithStats, AdminUserResponse,
    TokenResponse, AdminUserPaginatedResponse
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
    MessageInChat, ChatWithMessages, ChatListResponse, ChatPaginatedResponse
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
    # Common
    "PaginationParams", "PaginatedResponse", "ErrorResponse",
    # Stats
    "AdminStatsResponse", "UsageStatResponse"
]

# Rebuild models to resolve forward references
ChatWithMessages.model_rebuild()