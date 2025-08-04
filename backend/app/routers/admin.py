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


def validate_user_id(user_id: str) -> int:
    """Validate and convert user_id string to integer"""
    if user_id in ["undefined", "null", ""]:
        raise HTTPException(status_code=400, detail="Invalid user ID: cannot be undefined or empty")
    
    try:
        return int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid user ID: must be a valid integer")


@router.get("/users", response_model=AdminUserPaginatedResponse)
async def get_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
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
    user_id: str,
    character_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get chats for a specific user (Admin only)"""
    user_id_int = validate_user_id(user_id)
    
    # Verify user exists
    user_result = await db.execute(select(User).where(User.user_id == user_id_int))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    skip = (page - 1) * limit

    # Build query
    query = select(Chat).where(Chat.user_id == user_id_int)
    count_query = select(func.count()).select_from(Chat).where(Chat.user_id == user_id_int)
    
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
    user_id: str,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get character chat statistics for a specific user (Admin only)"""
    user_id_int = validate_user_id(user_id)
    
    # Verify user exists
    user_result = await db.execute(select(User).where(User.user_id == user_id_int))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get characters that the user has chatted with
    characters_query = await db.execute(
        select(Character, func.count(Chat.chat_id).label('chat_count'))
        .join(Chat, Character.character_id == Chat.character_id)
        .where(Chat.user_id == user_id_int)
        .group_by(Character.character_id)
        .order_by(func.max(Chat.created_at).desc())
    )
    
    character_stats = []
    for character, chat_count in characters_query:
        # Get first and last chat times
        first_chat_result = await db.execute(
            select(Chat.created_at)
            .where(and_(Chat.user_id == user_id_int, Chat.character_id == character.character_id))
            .order_by(Chat.created_at.asc())
            .limit(1)
        )
        first_chat_time = first_chat_result.scalar()
        
        last_chat_result = await db.execute(
            select(Chat.created_at)
            .where(and_(Chat.user_id == user_id_int, Chat.character_id == character.character_id))
            .order_by(Chat.created_at.desc())
            .limit(1)
        )
        last_chat_time = last_chat_result.scalar()
        
        # Count unique conversation sessions (simplified - just count days with chats)
        conversation_days_result = await db.execute(
            select(func.count(func.distinct(func.date(Chat.created_at))))
            .where(and_(Chat.user_id == user_id_int, Chat.character_id == character.character_id))
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
    user_id: str,
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get usage statistics for a specific user (Admin only)"""
    user_id_int = validate_user_id(user_id)
    
    # Verify user exists
    user_result = await db.execute(select(User).where(User.user_id == user_id_int))
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
            UsageStat.user_id == user_id_int,
            UsageStat.usage_date >= start_date,
            UsageStat.usage_date <= end_date
        )
    ).order_by(UsageStat.usage_date.desc())
    
    result = await db.execute(query)
    stats = result.scalars().all()

    return [UsageStatResponse.model_validate(stat) for stat in stats]




@router.post("/users/{user_id}/toggle-admin", response_model=AdminUserResponse)
async def toggle_admin_status(
    user_id: str, current_admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    """Toggle admin status for a user (Admin only)"""
    user_id_int = validate_user_id(user_id)
    
    # Prevent admin from modifying their own status
    if user_id_int == current_admin.user_id:
        raise HTTPException(status_code=400, detail="Cannot modify your own admin status")

    # Get user
    user_result = await db.execute(select(User).where(User.user_id == user_id_int))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Toggle admin status
    user.is_admin = not user.is_admin
    await db.commit()
    await db.refresh(user)

    # Get user stats to return complete AdminUserResponse
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

    # Return complete AdminUserResponse
    return AdminUserResponse(
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


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update user information (Admin only)"""
    user_id_int = validate_user_id(user_id)
    
    # Get user
    user = await db.get(User, user_id_int)
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
    user_id: str, current_admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    """Delete a user and all their data (Admin only)"""
    user_id_int = validate_user_id(user_id)
    
    # Prevent admin from deleting their own account
    if user_id_int == current_admin.user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Get user
    user = await db.get(User, user_id_int)
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
    limit: int = Query(20, ge=1),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get all characters across all users (Admin only) with statistics"""
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
    
    # Enhance characters with statistics
    enhanced_characters = []
    for character in characters:
        # Get chat count for this character
        chat_count_query = select(func.count(Chat.chat_id)).where(
            Chat.character_id == character.character_id
        )
        chat_count = await db.scalar(chat_count_query) or 0
        
        # Get unique users count for this character
        unique_users_query = select(func.count(func.distinct(Chat.user_id))).where(
            Chat.character_id == character.character_id
        )
        unique_users = await db.scalar(unique_users_query) or 0
        
        # Create response with statistics
        char_response = create_character_response(character)
        char_response.chat_count = chat_count
        char_response.unique_users = unique_users
        
        enhanced_characters.append(char_response)
    
    return CharacterListResponse(
        characters=enhanced_characters,
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




