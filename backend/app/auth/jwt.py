from datetime import datetime, timedelta
from typing import Optional
import os
from jose import JWTError, jwt
import bcrypt

# JWT 설정
SECRET_KEY = os.getenv("JWT_SECRET", "your-super-secret-key-change-this-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """JWT 액세스 토큰 생성"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    """JWT 토큰 검증"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None


def get_password_hash(password: str) -> str:
    """비밀번호 해싱"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호 검증"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def validate_password(password: str) -> bool:
    """
    비밀번호 정책 검증:
    - 최소 8자 이상
    - 대문자, 소문자, 숫자, 특수문자 중 3가지 이상 포함
    """
    if len(password) < 8:
        return False

    criteria = 0
    if any(c.isupper() for c in password):
        criteria += 1
    if any(c.islower() for c in password):
        criteria += 1
    if any(c.isdigit() for c in password):
        criteria += 1
    if any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        criteria += 1

    return criteria >= 3
