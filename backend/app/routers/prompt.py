from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user, require_admin
from app.models import User, CommonPrompt
from app.schemas.prompt import CommonPromptCreate, CommonPromptUpdate, CommonPromptResponse

router = APIRouter()


@router.get("/", response_model=List[CommonPromptResponse])
async def get_prompts(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get all common prompts"""
    prompts = db.query(CommonPrompt).all()
    return [CommonPromptResponse.from_orm(prompt) for prompt in prompts]


@router.get("/{prompt_id}", response_model=CommonPromptResponse)
async def get_prompt_details(
    prompt_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get a specific prompt by ID"""
    prompt = db.query(CommonPrompt).filter(CommonPrompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    return CommonPromptResponse.from_orm(prompt)


@router.post("/", response_model=CommonPromptResponse)
async def create_prompt(
    prompt_data: CommonPromptCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new common prompt (Admin only)"""
    # Check if prompt name already exists
    existing = db.query(CommonPrompt).filter(CommonPrompt.name == prompt_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Prompt name already exists")

    prompt = CommonPrompt(name=prompt_data.name, prompt_text=prompt_data.prompt_text)
    db.add(prompt)
    db.commit()
    db.refresh(prompt)

    return CommonPromptResponse.from_orm(prompt)


@router.put("/{prompt_id}", response_model=CommonPromptResponse)
async def update_prompt(
    prompt_id: int,
    prompt_data: CommonPromptUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a prompt (Admin only)"""
    prompt = db.query(CommonPrompt).filter(CommonPrompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    # Update fields if provided
    if prompt_data.name is not None:
        # Check if new name conflicts with another prompt
        existing = (
            db.query(CommonPrompt)
            .filter(CommonPrompt.name == prompt_data.name, CommonPrompt.id != prompt_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Prompt name already exists")
        prompt.name = prompt_data.name

    if prompt_data.prompt_text is not None:
        prompt.prompt_text = prompt_data.prompt_text

    db.commit()
    db.refresh(prompt)

    return CommonPromptResponse.from_orm(prompt)


@router.delete("/{prompt_id}")
async def delete_prompt(
    prompt_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)
):
    """Delete a prompt (Admin only)"""
    prompt = db.query(CommonPrompt).filter(CommonPrompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    db.delete(prompt)
    db.commit()

    return {"message": "Prompt deleted successfully"}
