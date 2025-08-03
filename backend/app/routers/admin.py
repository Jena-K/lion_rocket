from typing import List, Optional
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.database import get_db
from app.auth.dependencies import require_admin
from app.models import User, Chat, Message, UsageStat
from app.schemas import (
    AdminUserResponse,
    AdminStatsResponse,
    ChatResponse,
    UsageStatResponse,
    PaginatedResponse,
)
from app.services import chat_service

router = APIRouter()


@router.get("/users", response_model=PaginatedResponse)
async def get_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get all users with their statistics (Admin only)"""
    skip = (page - 1) * limit

    # Get total user count
    total = db.query(User).count()

    # Get users with pagination
    users = db.query(User).offset(skip).limit(limit).all()

    # Build response with stats for each user
    user_responses = []
    for user in users:
        # Get user stats
        total_chats = db.query(Chat).filter(Chat.user_id == user.id).count()
        total_tokens = (
            db.query(func.sum(UsageStat.total_tokens)).filter(UsageStat.user_id == user.id).scalar()
            or 0
        )

        # Get last activity
        last_chat = (
            db.query(Chat)
            .filter(Chat.user_id == user.id)
            .order_by(Chat.last_message_at.desc())
            .first()
        )
        last_active = last_chat.last_message_at if last_chat else None

        # Create response
        user_response = AdminUserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            is_admin=user.is_admin,
            created_at=user.created_at,
            total_chats=total_chats,
            total_tokens=total_tokens,
            last_active=last_active,
        )
        user_responses.append(user_response)

    return PaginatedResponse(
        items=user_responses,
        total=total,
        page=page,
        pages=(total + limit - 1) // limit,
        limit=limit,
    )


@router.get("/users/{user_id}/chats", response_model=PaginatedResponse)
async def get_user_chats(
    user_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get all chats for a specific user (Admin only)"""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    skip = (page - 1) * limit

    # Get total chat count for user
    total = db.query(Chat).filter(Chat.user_id == user_id).count()

    # Get chats with pagination
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == user_id)
        .order_by(Chat.last_message_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    # Convert to response
    chat_responses = [ChatResponse.from_orm(chat) for chat in chats]

    return PaginatedResponse(
        items=chat_responses,
        total=total,
        page=page,
        pages=(total + limit - 1) // limit,
        limit=limit,
    )


@router.get("/users/{user_id}/usage", response_model=List[UsageStatResponse])
async def get_user_usage_stats(
    user_id: int,
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get usage statistics for a specific user (Admin only)"""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Default date range: last 30 days
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    # Get usage stats
    stats = chat_service.get_user_usage_stats(db, user_id, start_date, end_date)

    return [UsageStatResponse.from_orm(stat) for stat in stats]


@router.get("/stats/overview", response_model=AdminStatsResponse)
async def get_system_overview(
    current_admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    """Get system-wide statistics overview (Admin only)"""
    # User statistics
    total_users = db.query(User).count()

    # Active users today
    today = date.today()
    active_users_today = (
        db.query(func.count(func.distinct(Chat.user_id)))
        .filter(func.date(Chat.last_message_at) == today)
        .scalar()
        or 0
    )

    # Chat statistics
    total_chats = db.query(Chat).count()
    total_messages = db.query(Message).count()

    # Token usage
    total_tokens_used = db.query(func.sum(UsageStat.total_tokens)).scalar() or 0

    # Average tokens per user
    users_with_usage = db.query(func.count(func.distinct(UsageStat.user_id))).scalar() or 1
    average_tokens_per_user = total_tokens_used / users_with_usage if users_with_usage > 0 else 0

    return AdminStatsResponse(
        total_users=total_users,
        active_users_today=active_users_today,
        total_chats=total_chats,
        total_messages=total_messages,
        total_tokens_used=total_tokens_used,
        average_tokens_per_user=average_tokens_per_user,
    )


@router.post("/users/{user_id}/toggle-admin")
async def toggle_admin_status(
    user_id: int, current_admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    """Toggle admin status for a user (Admin only)"""
    # Prevent admin from modifying their own status
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot modify your own admin status")

    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Toggle admin status
    user.is_admin = not user.is_admin
    db.commit()

    return {
        "message": f"User {user.username} admin status changed to {user.is_admin}",
        "is_admin": user.is_admin,
    }


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int, current_admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    """Delete a user and all their data (Admin only)"""
    # Prevent admin from deleting themselves
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete user (cascading will handle related data)
    db.delete(user)
    db.commit()

    return {"message": f"User {user.username} and all related data deleted successfully"}
