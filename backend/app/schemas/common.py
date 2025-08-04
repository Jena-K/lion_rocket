"""
Common/shared schemas used across the application
"""
from pydantic import BaseModel, Field
from typing import Any, List, Dict, Optional, TypeVar, Generic


# Generic type for paginated items
T = TypeVar('T')


class PaginationParams(BaseModel):
    """Schema for pagination parameters"""
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(20, ge=1, le=100, description="Items per page")
    
    def get_offset(self) -> int:
        """Calculate offset for database queries"""
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic schema for paginated responses"""
    items: List[T]
    total: int
    page: int
    pages: int
    limit: int


class ErrorResponse(BaseModel):
    """Schema for error responses"""
    detail: str
    status: int
    type: Optional[str] = None
    instance: Optional[str] = None


class ValidationErrorResponse(BaseModel):
    """Schema for validation error responses"""
    detail: List[Dict[str, Any]]
    status: int = 422
    type: str = "validation_error"


class SuccessResponse(BaseModel):
    """Schema for simple success responses"""
    success: bool = True
    message: Optional[str] = None


class DeleteResponse(BaseModel):
    """Schema for delete operation responses"""
    success: bool = True
    message: str = "Resource deleted successfully"
    id: Optional[int] = None


class HealthCheckResponse(BaseModel):
    """Schema for health check responses"""
    status: str  # "healthy", "degraded", "unhealthy"
    service: str
    version: Optional[str] = None
    timestamp: str
    checks: Optional[Dict[str, Any]] = None


def create_paginated_response(items: List[T], total: int, page: int, limit: int) -> PaginatedResponse[T]:
    """Create a paginated response - utility function"""
    pages = (total + limit - 1) // limit  # Ceiling division
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        pages=pages,
        limit=limit
    )