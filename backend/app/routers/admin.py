from typing import List, Optional
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, and_, select, or_
from app.database import get_db
from app.auth.dependencies import require_admin
from app.models import User, Chat, UsageStat, Character
from app.schemas.user import AdminUserResponse, AdminUserPaginatedResponse
from app.schemas.stats import AdminStatsResponse, UsageStatResponse
from app.schemas.chat import ChatResponse, ChatRole
from app.schemas.character import CharacterCreate, CharacterUpdate, CharacterResponse, CharacterListResponse
from app.routers.character import create_character_response, get_avatar_path_from_filename
from app.schemas.user import UserUpdate, UserResponse

router = APIRouter()


@router.get("/users", response_model=AdminUserPaginatedResponse)
async def get_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get all users with their statistics (Admin only)"""
    skip = (page - 1) * limit

    # Get total user count
    total_result = await db.execute(select(func.count()).select_from(User))
    total = total_result.scalar()

    # Get users with pagination
    users_result = await db.execute(select(User).offset(skip).limit(limit))
    users = users_result.scalars().all()

    # Build response with stats for each user
    user_responses = []
    for user in users:
        # Get user stats
        total_chats_result = await db.execute(
            select(func.count(func.distinct(Chat.character_id)))
            .select_from(Chat)
            .where(Chat.user_id == user.user_id)
        )
        total_chats = total_chats_result.scalar()

        # Get last activity
        last_chat_result = await db.execute(
            select(Chat)
            .where(Chat.user_id == user.user_id)
            .order_by(Chat.created_at.desc())
            .limit(1)
        )
        last_chat = last_chat_result.scalar_one_or_none()
        last_active = last_chat.created_at if last_chat else None


        # Get total tokens used by this user
        total_tokens_result = await db.execute(
            select(func.coalesce(func.sum(UsageStat.token_count), 0))
            .where(UsageStat.user_id == user.user_id)
        )
        total_tokens = total_tokens_result.scalar() or 0

        # Create response
        user_response = AdminUserResponse(
            user_id=user.user_id,
            username=user.username,
            email=user.email,
            is_admin=user.is_admin,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
            total_chats=total_chats,
            total_tokens=total_tokens,
            last_active=last_active,
        )
        user_responses.append(user_response)

    return AdminUserPaginatedResponse(
        items=user_responses,
        total=total,
        page=page,
        pages=(total + limit - 1) // limit,
        limit=limit,
    )


@router.get("/users/{user_id}/chats")
async def get_user_chats(
    user_id: int,
    character_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get chats for a specific user (Admin only)"""
    # Verify user exists
    user_result = await db.execute(select(User).where(User.user_id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    skip = (page - 1) * limit

    # Build query
    query = select(Chat).where(Chat.user_id == user_id)
    count_query = select(func.count()).select_from(Chat).where(Chat.user_id == user_id)
    
    if character_id:
        query = query.where(Chat.character_id == character_id)
        count_query = count_query.where(Chat.character_id == character_id)
    
    # Get total chat count
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Get chats with pagination
    chats_result = await db.execute(
        query.order_by(Chat.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    chats = chats_result.scalars().all()

    # Convert to response
    chat_responses = [ChatResponse.model_validate(chat) for chat in chats]

    return {
        "items": chat_responses,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
        "limit": limit,
    }


@router.get("/users/{user_id}/characters")
async def get_user_character_stats(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get character chat statistics for a specific user (Admin only)"""
    # Verify user exists
    user_result = await db.execute(select(User).where(User.user_id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get characters that the user has chatted with
    characters_query = await db.execute(
        select(Character, func.count(Chat.chat_id).label('chat_count'))
        .join(Chat, Character.character_id == Chat.character_id)
        .where(Chat.user_id == user_id)
        .group_by(Character.character_id)
        .order_by(func.max(Chat.created_at).desc())
    )
    
    character_stats = []
    for character, chat_count in characters_query:
        # Get first and last chat times
        first_chat_result = await db.execute(
            select(Chat.created_at)
            .where(and_(Chat.user_id == user_id, Chat.character_id == character.character_id))
            .order_by(Chat.created_at.asc())
            .limit(1)
        )
        first_chat_time = first_chat_result.scalar()
        
        last_chat_result = await db.execute(
            select(Chat.created_at)
            .where(and_(Chat.user_id == user_id, Chat.character_id == character.character_id))
            .order_by(Chat.created_at.desc())
            .limit(1)
        )
        last_chat_time = last_chat_result.scalar()
        
        # Count unique conversation sessions (simplified - just count days with chats)
        conversation_days_result = await db.execute(
            select(func.count(func.distinct(func.date(Chat.created_at))))
            .where(and_(Chat.user_id == user_id, Chat.character_id == character.character_id))
        )
        conversation_count = conversation_days_result.scalar() or 1
        
        # Calculate average chats per conversation and duration
        avg_chats_per_conversation = chat_count / conversation_count if conversation_count > 0 else 0
        
        # Simplified duration calculation (assume 30 seconds per chat on average)
        avg_chat_duration = int(avg_chats_per_conversation * 0.5)  # minutes
        
        character_stats.append({
            "character_id": character.character_id,
            "name": character.name,
            "avatar_url": character.avatar_url,
            "chatCount": conversation_count,
            "messageCount": chat_count,
            "lastChatDate": last_chat_time,
            "firstChatDate": first_chat_time,
            "avgMessagesPerChat": round(avg_chats_per_conversation, 1),
            "avgChatDuration": avg_chat_duration
        })
    
    return character_stats


@router.get("/users/{user_id}/usage", response_model=List[UsageStatResponse])
async def get_user_usage_stats(
    user_id: int,
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get usage statistics for a specific user (Admin only)"""
    # Verify user exists
    user_result = await db.execute(select(User).where(User.user_id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Default date range: last 30 days
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    # Get usage stats
    query = select(UsageStat).where(
        and_(
            UsageStat.user_id == user_id,
            UsageStat.usage_date >= start_date,
            UsageStat.usage_date <= end_date
        )
    ).order_by(UsageStat.usage_date.desc())
    
    result = await db.execute(query)
    stats = result.scalars().all()

    return [UsageStatResponse.model_validate(stat) for stat in stats]


@router.get("/stats/overview", response_model=AdminStatsResponse)
async def get_system_overview(
    current_admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    """Get system-wide statistics overview (Admin only)"""
    # User statistics
    total_users_result = await db.execute(select(func.count()).select_from(User))
    total_users = total_users_result.scalar()

    # Active users today
    today = date.today()
    active_users_result = await db.execute(
        select(func.count(func.distinct(Chat.user_id)))
        .where(func.date(Chat.created_at) == today)
    )
    active_users_today = active_users_result.scalar() or 0

    # Conversation statistics (unique user-character pairs)
    total_conversations_result = await db.execute(
        select(func.count(func.distinct(func.concat(Chat.user_id, '-', Chat.character_id))))
        .select_from(Chat)
    )
    total_conversations = total_conversations_result.scalar()
    total_chats_result = await db.execute(select(func.count()).select_from(Chat))
    total_chats = total_chats_result.scalar()


    return AdminStatsResponse(
        total_users=total_users,
        active_users_today=active_users_today,
        total_conversations=total_conversations,
        total_chats=total_chats,
    )


@router.post("/users/{user_id}/toggle-admin")
async def toggle_admin_status(
    user_id: int, current_admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    """Toggle admin status for a user (Admin only)"""
    # Prevent admin from modifying their own status
    if user_id == current_admin.user_id:
        raise HTTPException(status_code=400, detail="Cannot modify your own admin status")

    # Get user
    user_result = await db.execute(select(User).where(User.user_id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Toggle admin status
    user.is_admin = not user.is_admin
    await db.commit()

    return {
        "message": f"User {user.username} admin status changed to {user.is_admin}",
        "is_admin": user.is_admin,
    }


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update user information (Admin only)"""
    # Get user
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    
    return {"message": "User updated successfully", "user": UserResponse.model_validate(user)}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int, current_admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    """Delete a user and all their data (Admin only)"""
    # Prevent admin from deleting their own account
    if user_id == current_admin.user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Get user
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user (cascading will handle related data)
    await db.delete(user)
    await db.commit()
    
    return {"message": f"User {user.username} and all related data deleted successfully"}


# Character Management Endpoints

@router.get("/characters", response_model=CharacterListResponse)
async def get_all_characters(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get all characters across all users (Admin only)"""
    # Build query
    query = select(Character)
    
    # Apply filters
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Character.name.ilike(search_pattern),
                Character.intro.ilike(search_pattern),
            )
        )
    
    if is_active is not None:
        query = query.where(Character.is_active == is_active)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Get paginated results
    query = query.order_by(Character.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    characters = result.scalars().all()
    
    return CharacterListResponse(
        characters=[create_character_response(char) for char in characters],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.post("/characters", response_model=CharacterResponse, status_code=201)
async def create_character_admin(
    character_create: CharacterCreate,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new character as admin"""
    character = Character(**character_create.model_dump(), created_by=current_admin.user_id)
    
    db.add(character)
    await db.commit()
    await db.refresh(character)
    
    return create_character_response(character)


@router.put("/characters/{character_id}", response_model=CharacterResponse)
async def update_character_admin(
    character_id: int,
    character_update: CharacterUpdate,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update any character (Admin only)"""
    character = await db.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Update fields
    update_data = character_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(character, field, value)
    
    character.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(character)
    
    return create_character_response(character)


@router.post("/characters/{character_id}/toggle-active")
async def toggle_character_active(
    character_id: int,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Toggle character active status (Admin only)"""
    character = await db.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Toggle active status
    character.is_active = not character.is_active
    character.updated_at = datetime.utcnow()
    await db.commit()
    
    return {
        "message": f"Character {character.name} active status changed to {character.is_active}",
        "is_active": character.is_active,
    }


@router.delete("/characters/{character_id}")
async def delete_character_admin(
    character_id: int,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete any character (Admin only)"""
    character = await db.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Delete avatar file if it exists
    if character.avatar_url:
        avatar_path = get_avatar_path_from_filename(f"{character.avatar_url}.png")
        if avatar_path.exists():
            try:
                avatar_path.unlink()
            except Exception:
                pass  # Don't fail deletion if avatar file can't be removed

    # Delete character (cascading will handle related data)
    await db.delete(character)
    await db.commit()
    
    return {"message": f"Character {character.name} and all related data deleted successfully"}


# Dashboard Endpoints

@router.get("/dashboard/character-stats")
async def get_character_statistics(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get statistics for all characters (Admin only)"""
    # Get all characters with their stats
    characters_result = await db.execute(
        select(Character).order_by(Character.created_at.desc())
    )
    characters = characters_result.scalars().all()
    
    character_stats = []
    
    for character in characters:
        # Get conversation count for this character (unique users)
        conversation_count_result = await db.execute(
            select(func.count(func.distinct(Chat.user_id)))
            .where(Chat.character_id == character.character_id)
        )
        conversation_count = conversation_count_result.scalar() or 0
        
        # Get chat count for this character
        chat_count_result = await db.execute(
            select(func.count())
            .select_from(Chat)
            .where(Chat.character_id == character.character_id)
        )
        chat_count = chat_count_result.scalar() or 0
        
        
        # Get unique users who chatted with this character
        unique_users = conversation_count  # Already calculated above
        
        # Get last chat time
        last_chat_result = await db.execute(
            select(Chat.created_at)
            .where(Chat.character_id == character.character_id)
            .order_by(Chat.created_at.desc())
            .limit(1)
        )
        last_chat_time = last_chat_result.scalar()
        
        character_stats.append({
            "character_id": character.character_id,
            "character_name": character.name,
            "is_active": character.is_active,
            "creator_id": character.created_by,
            "created_at": character.created_at,
            "conversation_count": conversation_count,
            "chat_count": chat_count,
            "unique_users": unique_users,
            "last_message_time": last_chat_time,
        })
    
    return {
        "total_characters": len(characters),
        "active_characters": sum(1 for c in characters if c.is_active),
        "character_stats": character_stats,
    }


@router.get("/dashboard/simple-stats")
async def get_simple_dashboard_stats(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get simple dashboard statistics - only chat count and user count (Admin only)"""
    # Total number of chats
    total_chats_result = await db.execute(select(func.count()).select_from(Chat))
    total_chats = total_chats_result.scalar() or 0
    
    # Total registered users 
    total_users_result = await db.execute(select(func.count()).select_from(User))
    total_users = total_users_result.scalar() or 0
    
    return {
        "total_chats": total_chats,
        "total_users": total_users
    }


@router.get("/dashboard/usage-by-date")
async def get_usage_by_date(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get daily usage statistics (Admin only)"""
    # Default date range: last 30 days
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Get daily usage stats
    usage_result = await db.execute(
        select(
            UsageStat.usage_date,
            func.sum(UsageStat.chat_count).label("total_chats"),
            func.count(func.distinct(UsageStat.user_id)).label("active_users"),
        )
        .where(and_(UsageStat.usage_date >= start_date, UsageStat.usage_date <= end_date))
        .group_by(UsageStat.usage_date)
        .order_by(UsageStat.usage_date.desc())
    )
    
    daily_stats = []
    for row in usage_result:
        daily_stats.append({
            "date": row.usage_date,
            "total_chats": row.total_chats or 0,
            "active_users": row.active_users or 0,
        })
    
    # Calculate totals for the period
    period_totals_result = await db.execute(
        select(
            func.sum(UsageStat.chat_count).label("total_chats"),
            func.count(func.distinct(UsageStat.user_id)).label("unique_users"),
        ).where(and_(UsageStat.usage_date >= start_date, UsageStat.usage_date <= end_date))
    )
    period_totals = period_totals_result.one()
    
    return {
        "start_date": start_date,
        "end_date": end_date,
        "period_totals": {
            "total_chats": period_totals.total_chats or 0,
            "unique_users": period_totals.unique_users or 0,
        },
        "daily_stats": daily_stats,
    }
