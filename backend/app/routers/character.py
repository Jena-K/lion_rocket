from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func
import aiofiles
import os
import uuid
from datetime import datetime
from pathlib import Path

from app.database import get_db
from app.core.auth import get_current_user
from app.models import User, Character
from app.schemas.character import (
    CharacterCreate,
    CharacterUpdate,
    CharacterResponse,
    CharacterListResponse,
    CharacterSelectionResponse,
)

router = APIRouter()

# Upload directory for character avatars
UPLOAD_DIR = Path("app/uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Supported image formats for avatars
SUPPORTED_IMAGE_FORMATS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}

def get_avatar_path_from_filename(filename: str) -> Path:
    """Get the avatar file path from filename"""
    return UPLOAD_DIR / filename

def create_character_response(character: Character) -> CharacterResponse:
    """Create a CharacterResponse with avatar_url"""
    response_data = character.__dict__.copy()
    
    # Map character_id to id for API response compatibility
    if 'character_id' in response_data:
        response_data['id'] = response_data['character_id']
    
    return CharacterResponse.model_validate(response_data)


@router.post("/", response_model=CharacterResponse, status_code=201)
async def create_character(
    character_create: CharacterCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new character"""
    character = Character(**character_create.model_dump(), created_by=current_user.user_id)

    db.add(character)
    await db.commit()
    await db.refresh(character)

    return create_character_response(character)


@router.get("/", response_model=CharacterListResponse)
async def list_characters(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List characters with pagination and filtering"""
    # Get only characters created by the current user
    query = select(Character).where(Character.created_by == current_user.user_id)

    # Search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Character.name.ilike(search_pattern),
                Character.intro.ilike(search_pattern),
            )
        )

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


@router.get("/available", response_model=CharacterListResponse)
async def list_available_characters(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all active characters available for selection"""
    # Get all active characters regardless of creator
    query = select(Character).where(Character.is_active == True)

    # Search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Character.name.ilike(search_pattern),
                Character.intro.ilike(search_pattern),
            )
        )

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # Get paginated results - order by created_at to show newest first
    query = query.order_by(Character.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    characters = result.scalars().all()

    return CharacterListResponse(
        characters=[create_character_response(char) for char in characters],
        total=total,
        skip=skip,
        limit=limit,
    )



@router.get("/active", response_model=CharacterResponse)
async def get_active_character(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the currently active character for the user"""
    # Find the active character for the current user
    query = select(Character).where(
        and_(
            Character.created_by == current_user.user_id,
            Character.is_active == True
        )
    )
    result = await db.execute(query)
    character = result.scalar_one_or_none()
    
    if not character:
        raise HTTPException(status_code=404, detail="No active character found")
    
    return create_character_response(character)


@router.get("/{character_id}", response_model=CharacterResponse)
async def get_character(
    character_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific character"""
    # Query by character_id column
    query = select(Character).where(Character.character_id == character_id)
    result = await db.execute(query)
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # No ownership check needed - users can view any character for chatting
    # Ownership check should only be enforced for update/delete operations

    return create_character_response(character)


@router.put("/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: int,
    character_update: CharacterUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a character"""
    # Query by character_id column
    query = select(Character).where(Character.character_id == character_id)
    result = await db.execute(query)
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Check ownership
    if character.created_by != current_user.user_id:
        raise HTTPException(status_code=403, detail="Only the creator can update this character")

    # Update fields
    update_data = character_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(character, field, value)

    character.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(character)

    return create_character_response(character)


@router.delete("/{character_id}")
async def delete_character(
    character_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a character"""
    # Query by character_id column
    query = select(Character).where(Character.character_id == character_id)
    result = await db.execute(query)
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Check ownership
    if character.created_by != current_user.user_id:
        raise HTTPException(status_code=403, detail="Only the creator can delete this character")

    # Delete avatar file if it exists
    if character.avatar_url:
        avatar_path = get_avatar_path_from_filename(f"{character.avatar_url}.png")
        if avatar_path.exists():
            try:
                avatar_path.unlink()
            except Exception as e:
                # Log error but don't fail the deletion
                print(f"Failed to delete avatar file during character deletion: {e}")

    await db.delete(character)
    await db.commit()

    return {"message": "Character deleted successfully"}


@router.post("/{character_id}/select", response_model=CharacterSelectionResponse)
async def select_character(
    character_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Select a character as active"""
    # Query by character_id column
    query = select(Character).where(Character.character_id == character_id)
    result = await db.execute(query)
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # No ownership check needed - users can select any character for chatting

    # Deactivate all other characters for this user
    query = select(Character).where(
        and_(
            Character.created_by == current_user.user_id,
            Character.is_active == True
        )
    )
    result = await db.execute(query)
    active_characters = result.scalars().all()
    
    for active_char in active_characters:
        active_char.is_active = False

    # Activate the selected character
    character.is_active = True
    character.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(character)

    return CharacterSelectionResponse(
        message="Character selected successfully",
        character=create_character_response(character)
    )


@router.get("/{character_id}/avatar")
async def get_character_avatar(
    character_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a character's avatar image"""
    # Check if character exists
    # Query by character_id column
    query = select(Character).where(Character.character_id == character_id)
    result = await db.execute(query)
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Check if character has avatar_url
    if not character.avatar_url:
        raise HTTPException(status_code=404, detail="No avatar set for this character")
    
    # avatar_url contains the filename
    avatar_path = get_avatar_path_from_filename(f"{character.avatar_url}.png")
    if not avatar_path.exists():
        raise HTTPException(status_code=404, detail="Avatar file not found")
    
    return FileResponse(
        path=str(avatar_path),
        media_type="image/png",
        filename=f"character_{character_id}_avatar.png"
    )


@router.post("/{character_id}/avatar")
async def upload_character_avatar(
    character_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload/update a character's avatar image"""
    # Check if character exists and user has permission
    # Query by character_id column
    query = select(Character).where(Character.character_id == character_id)
    result = await db.execute(query)
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Check ownership (admins can update any character)
    if not current_user.is_admin and character.created_by != current_user.user_id:
        raise HTTPException(status_code=403, detail="Access denied to this character")
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Validate file type is PNG or can be converted
    if file.content_type not in ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]:
        raise HTTPException(status_code=400, detail="Unsupported image format. Please upload PNG, JPEG, GIF, or WebP")
    
    # If character already has an avatar, delete the old file
    if character.avatar_url:
        old_avatar_path = get_avatar_path_from_filename(f"{character.avatar_url}.png")
        if old_avatar_path.exists():
            try:
                old_avatar_path.unlink()
            except Exception:
                pass
    
    # Generate unique filename for avatar
    avatar_filename = str(uuid.uuid4())
    avatar_path = get_avatar_path_from_filename(f"{avatar_filename}.png")
    
    try:
        # Save file as PNG (all avatars stored as PNG)
        async with aiofiles.open(avatar_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Update character's avatar_url with just the filename (without extension)
        character.avatar_url = avatar_filename
        character.updated_at = datetime.utcnow()
        await db.commit()
        
        return {
            "message": "Avatar uploaded successfully",
            "avatar_url": character.avatar_url
        }
        
    except Exception as e:
        # Try to clean up the file if save failed
        if avatar_path.exists():
            try:
                avatar_path.unlink()
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=f"Failed to save avatar: {str(e)}")


@router.delete("/{character_id}/avatar")
async def delete_character_avatar(
    character_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a character's avatar image"""
    # Check if character exists and user has permission
    # Query by character_id column
    query = select(Character).where(Character.character_id == character_id)
    result = await db.execute(query)
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Check ownership (admins can delete any character's avatar)
    if not current_user.is_admin and character.created_by != current_user.user_id:
        raise HTTPException(status_code=403, detail="Access denied to this character")
    
    # Check if character has an avatar
    if not character.avatar_url:
        raise HTTPException(status_code=404, detail="Character has no avatar")
    
    # Delete the avatar file
    avatar_path = get_avatar_path_from_filename(f"{character.avatar_url}.png")
    if avatar_path.exists():
        try:
            avatar_path.unlink()
        except Exception as e:
            # Log error but continue with database update
            print(f"Failed to delete avatar file: {e}")
    
    # Clear avatar_url and update timestamp
    character.avatar_url = None
    character.updated_at = datetime.utcnow()
    await db.commit()
    
    return {"message": "Avatar deleted successfully"}
