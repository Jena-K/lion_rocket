"""
Statistics and usage tracking schemas
"""
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional, List


class UsageStatResponse(BaseModel):
    """Schema for usage statistics response"""
    usage_stat_id: int
    user_id: int
    usage_date: date
    chat_count: int
    token_count: int
    input_tokens: int
    output_tokens: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UsageOverview(BaseModel):
    """Schema for usage overview/summary"""
    total_chats: int
    total_tokens: int
    total_input_tokens: int
    total_output_tokens: int
    period_start: date
    period_end: date


class DailyUsage(BaseModel):
    """Schema for daily usage summary"""
    date: date
    chat_count: int
    token_count: int
    input_tokens: int
    output_tokens: int


class AdminStatsResponse(BaseModel):
    """Schema for admin dashboard statistics"""
    total_users: int
    active_users_today: int
    total_conversations: int
    total_chats: int




class UserUsageStats(BaseModel):
    """Schema for individual user usage statistics"""
    user_id: int
    username: str
    total_chats: int
    total_tokens: int
    total_input_tokens: int
    total_output_tokens: int
    last_active: Optional[datetime] = None
    daily_usage: List[DailyUsage] = []