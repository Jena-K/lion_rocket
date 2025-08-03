"""
Statistics and usage tracking schemas
"""
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List


class UsageStatResponse(BaseModel):
    """Schema for usage statistics response"""
    id: int
    user_id: int
    usage_date: date
    chat_count: int
    message_count: int
    total_tokens: int
    input_tokens: int
    output_tokens: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UsageOverview(BaseModel):
    """Schema for usage overview/summary"""
    total_chats: int
    total_messages: int
    total_tokens: int
    input_tokens: int
    output_tokens: int
    average_tokens_per_chat: float
    average_tokens_per_message: float
    period_start: date
    period_end: date


class DailyUsage(BaseModel):
    """Schema for daily usage summary"""
    date: date
    chat_count: int
    message_count: int
    total_tokens: int


class AdminStatsResponse(BaseModel):
    """Schema for admin dashboard statistics"""
    total_users: int
    active_users_today: int
    active_users_this_week: int
    active_users_this_month: int
    total_chats: int
    total_messages: int
    total_characters: int
    total_prompts: int
    total_tokens_used: int
    average_tokens_per_user: float
    average_chats_per_user: float


class UserUsageStats(BaseModel):
    """Schema for individual user usage statistics"""
    user_id: int
    username: str
    total_chats: int
    total_messages: int
    total_tokens: int
    last_active: Optional[datetime] = None
    daily_usage: List[DailyUsage] = []