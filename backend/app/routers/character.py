from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.auth.dependencies import get_current_user, require_admin
from app.models import User, Character, Chat
from app.schemas import CharacterCreate, CharacterResponse, CharacterWithStats, PaginatedResponse

router = APIRouter()


@router.get("/", response_model=List[CharacterResponse])
async def get_characters(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get all available characters"""
    characters = db.query(Character).all()
    return [CharacterResponse.from_orm(char) for char in characters]


@router.get("/{character_id}", response_model=CharacterWithStats)
async def get_character_details(
    character_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get character details with usage statistics"""
    character = db.query(Character).filter(Character.id == character_id).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Get chat statistics for this character
    chat_count = db.query(Chat).filter(Chat.character_id == character_id).count()
    total_messages = (
        db.query(func.count(Chat.id))
        .join(Chat.messages)
        .filter(Chat.character_id == character_id)
        .scalar()
        or 0
    )

    # Build response
    response = CharacterWithStats.from_orm(character)
    response.chat_count = chat_count
    response.total_messages = total_messages

    return response


@router.post("/", response_model=CharacterResponse)
async def create_character(
    character_data: CharacterCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new character (Admin only)"""
    # Check if character name already exists
    existing = db.query(Character).filter(Character.name == character_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Character name already exists")

    character = Character(
        name=character_data.name,
        system_prompt=character_data.system_prompt,
        created_by=current_user.id,
    )
    db.add(character)
    db.commit()
    db.refresh(character)

    return CharacterResponse.from_orm(character)


@router.put("/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: int,
    character_data: CharacterCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a character (Admin only)"""
    character = db.query(Character).filter(Character.id == character_id).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Check if new name conflicts with another character
    if character_data.name != character.name:
        existing = (
            db.query(Character)
            .filter(Character.name == character_data.name, Character.id != character_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Character name already exists")

    # Update character
    character.name = character_data.name
    character.system_prompt = character_data.system_prompt

    db.commit()
    db.refresh(character)

    return CharacterResponse.from_orm(character)


@router.delete("/{character_id}")
async def delete_character(
    character_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)
):
    """Delete a character (Admin only)"""
    character = db.query(Character).filter(Character.id == character_id).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Check if character is being used in any chats
    chat_count = db.query(Chat).filter(Chat.character_id == character_id).count()
    if chat_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete character. It is being used in {chat_count} chats.",
        )

    db.delete(character)
    db.commit()

    return {"message": "Character deleted successfully"}
