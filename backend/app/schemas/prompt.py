"""
Prompt-related schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PromptBase(BaseModel):
    """Base prompt schema with common fields"""
    name: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)
    variables: Optional[List[str]] = []
    description: Optional[str] = None


class PromptCreate(PromptBase):
    """Schema for creating a new prompt template"""
    pass


class PromptUpdate(BaseModel):
    """Schema for updating prompt template"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    content: Optional[str] = Field(None, min_length=1)
    variables: Optional[List[str]] = None
    description: Optional[str] = None


class PromptResponse(PromptBase):
    """Schema for prompt response"""
    id: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Legacy schemas for CommonPrompt (deprecated)
class CommonPromptBase(BaseModel):
    """Base schema for common prompts (deprecated)"""
    name: str = Field(..., min_length=1, max_length=100)
    prompt_text: str = Field(..., min_length=1)


class CommonPromptCreate(CommonPromptBase):
    """Schema for creating common prompt (deprecated)"""
    pass


class CommonPromptUpdate(BaseModel):
    """Schema for updating common prompt (deprecated)"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    prompt_text: Optional[str] = Field(None, min_length=1)


class CommonPromptResponse(CommonPromptBase):
    """Schema for common prompt response (deprecated)"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True