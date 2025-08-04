from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta

from app.database import get_db
from app.models import User
from app.schemas.user import UserCreate, UserResponse, TokenResponse, UserLogin, AdminLogin
from app.auth.jwt import (
    create_access_token,
    verify_password,
    get_password_hash,
    validate_password,
    ACCESS_TOKEN_EXPIRE_HOURS,
)
from app.auth.dependencies import get_current_user
from app.middleware.rate_limit import rate_limit
import logging

logger = logging.getLogger(__name__)
auth_router = APIRouter()


@auth_router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Create a new user account with username, email, and password",
)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user account.

    Password requirements:
    - Minimum 8 characters
    - Must contain uppercase and lowercase letters
    - Must contain at least one number
    - Must contain at least one special character

    Args:
        user_data: User registration information
        db: Database session

    Returns:
        UserResponse: Created user information (without password)

    Raises:
        HTTPException: If username/email already exists or password is invalid
    """

    # 사용자명 중복 검사
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered"
        )

    # 이메일 중복 검사
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # 비밀번호 정책 검증
    if not validate_password(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password does not meet security requirements",
        )

    # 새 사용자 생성
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username, email=user_data.email, password_hash=hashed_password
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    return db_user


@auth_router.post(
    "/login",
    response_model=TokenResponse,
    summary="User login",
    description="Authenticate user and receive JWT token",
)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """
    Authenticate user and generate JWT token.

    The token expires after 24 hours and must be included in subsequent requests
    as a Bearer token in the Authorization header.

    Args:
        form_data: OAuth2 form with username and password
        db: Database session

    Returns:
        TokenResponse: JWT access token and user information

    Raises:
        HTTPException: If credentials are invalid
    """

    # 사용자 인증
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.password_hash):
        logger.warning(f"Failed login attempt for username: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # JWT 토큰 생성
    access_token_expires = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    logger.info(f"User {user.username} logged in successfully")
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@auth_router.post("/logout")
async def logout():
    """사용자 로그아웃 (클라이언트 측에서 토큰 삭제)"""
    return {"message": "Successfully logged out"}


@auth_router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """현재 사용자 정보 조회"""
    return current_user


@auth_router.post(
    "/admin/login",
    response_model=TokenResponse,
    summary="Admin login",
    description="Authenticate admin user and receive JWT token",
)
async def admin_login(admin_data: AdminLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticate admin user and generate JWT token.
    
    Only users with is_admin=True can login through this endpoint.
    
    Args:
        admin_data: Admin login credentials with adminId and password
        db: Database session
        
    Returns:
        TokenResponse: JWT access token and admin user information
        
    Raises:
        HTTPException: If credentials are invalid or user is not an admin
    """
    
    # Find user by username (adminId)
    result = await db.execute(select(User).where(User.username == admin_data.adminId))
    user = result.scalar_one_or_none()
    
    # Verify user exists and password is correct
    if not user or not verify_password(admin_data.password, user.password_hash):
        logger.warning(f"Failed admin login attempt for adminId: {admin_data.adminId}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify user has admin privileges
    if not user.is_admin:
        logger.warning(f"Non-admin user {user.username} attempted admin login")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required.",
        )
    
    # Generate JWT token
    access_token_expires = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    logger.info(f"Admin {user.username} logged in successfully")
    return {"access_token": access_token, "token_type": "bearer", "user": user}
