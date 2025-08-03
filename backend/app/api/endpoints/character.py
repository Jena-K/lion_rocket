from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func
import aiofiles
import os
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.character import Character
from app.schemas.character import (
    CharacterCreate,
    CharacterUpdate,
    CharacterResponse,
    CharacterListResponse,
)

router = APIRouter()

# Upload directory for character avatars
UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=CharacterResponse)
async def create_character(
    character_create: CharacterCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new character"""
    character = Character(**character_create.dict(), creator_id=current_user.id)

    db.add(character)
    await db.commit()
    await db.refresh(character)

    return CharacterResponse.from_orm(character)


@router.get("/", response_model=CharacterListResponse)
async def list_characters(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[str] = None,
    include_private: bool = False,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List characters with pagination and filtering"""
    query = select(Character)

    # Filter by visibility
    if not include_private or not current_user:
        query = query.where(Character.is_private == False)
    elif include_private and current_user:
        # Include user's private characters
        query = query.where(
            or_(Character.is_private == False, Character.creator_id == current_user.id)
        )

    # Search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Character.name.ilike(search_pattern),
                Character.description.ilike(search_pattern),
                Character.tags.ilike(search_pattern),
            )
        )

    # Category filter
    if category:
        query = query.where(Character.category == category)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # Get paginated results
    query = query.order_by(Character.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    characters = result.scalars().all()

    return CharacterListResponse(
        characters=[CharacterResponse.from_orm(char) for char in characters],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/my", response_model=CharacterListResponse)
async def list_my_characters(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List characters created by the current user"""
    query = select(Character).where(Character.creator_id == current_user.id)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # Get paginated results
    query = query.order_by(Character.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    characters = result.scalars().all()

    return CharacterListResponse(
        characters=[CharacterResponse.from_orm(char) for char in characters],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/{character_id}", response_model=CharacterResponse)
async def get_character(
    character_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific character"""
    character = await db.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Check access to private characters
    if character.is_private:
        if not current_user or character.creator_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied to private character")

    return CharacterResponse.from_orm(character)


@router.put("/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: int,
    character_update: CharacterUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a character"""
    character = await db.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Check ownership
    if character.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the creator can update this character")

    # Update fields
    update_data = character_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(character, field, value)

    character.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(character)

    return CharacterResponse.from_orm(character)


@router.delete("/{character_id}")
async def delete_character(
    character_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a character"""
    character = await db.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Check ownership
    if character.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the creator can delete this character")

    # Delete avatar file if exists
    if character.avatar_url and character.avatar_url.startswith("/uploads/"):
        file_path = character.avatar_url[1:]  # Remove leading slash
        if os.path.exists(file_path):
            os.remove(file_path)

    await db.delete(character)
    await db.commit()

    return {"message": "Character deleted successfully"}


@router.post("/{character_id}/avatar")
async def upload_avatar(
    character_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload avatar for a character"""
    character = await db.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Check ownership
    if character.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the creator can update this character")

    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save file
    async with aiofiles.open(file_path, "wb") as buffer:
        content = await file.read()
        await buffer.write(content)

    # Delete old avatar if exists
    if character.avatar_url and character.avatar_url.startswith("/uploads/"):
        old_file_path = character.avatar_url[1:]  # Remove leading slash
        if os.path.exists(old_file_path):
            os.remove(old_file_path)

    # Update character
    character.avatar_url = f"/uploads/avatars/{filename}"
    character.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(character)

    return {"avatar_url": character.avatar_url}
