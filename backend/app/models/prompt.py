"""
Prompt model for reusable prompt templates
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class Prompt(Base):
    """User-created prompt templates"""
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    content = Column(Text, nullable=False)
    variables = Column(JSON, nullable=True)  # List of variable names in the prompt
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="created_prompts")


class CommonPrompt(Base):
    """System-wide common prompts (deprecated - use Prompt instead)"""
    __tablename__ = "common_prompts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    prompt_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())