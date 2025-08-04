# Security Implementation Details

## 보안 아키텍처 개요

AI Chat Service는 다층 보안 아키텍처를 구현하여 사용자 데이터와 시스템을 보호합니다.

## 1. 인증 및 권한 관리

### JWT (JSON Web Token) 구현

#### 토큰 생성
```python
# backend/app/auth/jwt.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None
```

#### 토큰 검증 미들웨어
```python
# backend/app/auth/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    username = verify_token(token)
    if username is None:
        raise credentials_exception
    
    user = await get_user_by_username(username)
    if user is None:
        raise credentials_exception
    
    return user

async def require_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user
```

### 비밀번호 보안

#### 비밀번호 해싱
```python
# backend/app/auth/password.py
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# 비밀번호 정책
def validate_password(password: str) -> bool:
    """
    비밀번호 정책:
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
```

## 2. API 보안

### Rate Limiting
```python
# backend/app/middleware/rate_limit.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per minute"]
)

# 채팅 메시지 전용 제한
chat_limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["20 per minute"]
)

# FastAPI 앱에 적용
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 엔드포인트별 적용
@app.post("/api/chats/{chat_id}/messages")
@limiter.limit("20 per minute")
async def send_message(chat_id: int, message: MessageCreate):
    # 메시지 처리 로직
    pass
```

### Input Validation & Sanitization
```python
# backend/app/schemas/message.py
from pydantic import BaseModel, Field, validator
import html
import re

class MessageCreate(BaseModel):
    content: str = Field(..., max_length=200)
    
    @validator('content')
    def sanitize_content(cls, v):
        # HTML 태그 제거
        v = html.escape(v)
        
        # SQL Injection 방지를 위한 특수문자 검증
        dangerous_patterns = [
            r"(union|select|insert|update|delete|drop|exec|script)",
            r"(--|\||;|\/\*|\*\/)"
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, v, re.IGNORECASE):
                raise ValueError("Invalid content detected")
        
        return v.strip()
```

### CORS 설정
```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:8080").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)
```

## 3. 데이터 보호

### 데이터베이스 보안
```python
# backend/app/config.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# SQLite 보안 설정
DATABASE_URL = os.getenv("DATABASE_URL")

# WAL 모드 활성화 및 보안 설정
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False,
        "timeout": 30,
        "isolation_level": "SERIALIZABLE"
    }
)

# 데이터베이스 파일 권한 설정 (Unix/Linux)
if os.path.exists("./data/app.db"):
    os.chmod("./data/app.db", 0o600)  # 소유자만 읽기/쓰기
```

### 환경변수 보안
```python
# backend/app/config.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # 필수 환경변수
    claude_api_key: str
    jwt_secret: str
    
    # 선택적 환경변수 with 기본값
    database_url: str = "sqlite:///./data/app.db"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # 환경변수 검증
    @validator('jwt_secret')
    def validate_jwt_secret(cls, v):
        if len(v) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters long")
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

## 4. API 키 보안

### Claude API 키 관리
```python
# backend/app/services/claude_service.py
import anthropic
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class ClaudeService:
    def __init__(self):
        self.api_key = os.getenv("CLAUDE_API_KEY")
        if not self.api_key:
            raise ValueError("CLAUDE_API_KEY not found in environment")
        
        self.client = anthropic.Anthropic(
            api_key=self.api_key,
            max_retries=3,
            timeout=30.0
        )
    
    async def send_message(self, system_prompt: str, user_message: str) -> dict:
        try:
            # API 키가 로그에 노출되지 않도록 주의
            logger.info("Sending message to Claude API")
            
            response = await self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1000,
                temperature=0.7,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_message}
                ]
            )
            
            return {
                "content": response.content[0].text,
                "token_count": response.usage.total_tokens
            }
            
        except Exception as e:
            # API 키가 포함된 에러 메시지 필터링
            error_msg = str(e)
            if self.api_key in error_msg:
                error_msg = error_msg.replace(self.api_key, "***")
            
            logger.error(f"Claude API error: {error_msg}")
            raise
```

## 5. 세션 보안

### Frontend 토큰 관리
```typescript
// frontend/src/utils/auth.ts
class TokenManager {
    private static TOKEN_KEY = 'auth_token'
    
    static setToken(token: string): void {
        // localStorage 대신 httpOnly 쿠키 권장 (프로덕션)
        localStorage.setItem(this.TOKEN_KEY, token)
        
        // 토큰 만료 시간 설정
        const expiry = new Date().getTime() + (24 * 60 * 60 * 1000)
        localStorage.setItem('token_expiry', expiry.toString())
    }
    
    static getToken(): string | null {
        const expiry = localStorage.getItem('token_expiry')
        if (expiry && new Date().getTime() > parseInt(expiry)) {
            this.removeToken()
            return null
        }
        
        return localStorage.getItem(this.TOKEN_KEY)
    }
    
    static removeToken(): void {
        localStorage.removeItem(this.TOKEN_KEY)
        localStorage.removeItem('token_expiry')
    }
}

// Axios 인터셉터 설정
axios.interceptors.request.use(
    (config) => {
        const token = TokenManager.getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            TokenManager.removeToken()
            router.push('/login')
        }
        return Promise.reject(error)
    }
)
```

## 6. 로깅 및 모니터링

### 보안 이벤트 로깅
```python
# backend/app/middleware/security_logger.py
import logging
from datetime import datetime
from fastapi import Request

security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)

# 보안 이벤트 로깅
class SecurityEventLogger:
    @staticmethod
    async def log_login_attempt(username: str, success: bool, ip: str):
        security_logger.info(f"Login attempt - User: {username}, Success: {success}, IP: {ip}")
    
    @staticmethod
    async def log_admin_access(user_id: int, endpoint: str, ip: str):
        security_logger.info(f"Admin access - User ID: {user_id}, Endpoint: {endpoint}, IP: {ip}")
    
    @staticmethod
    async def log_rate_limit_exceeded(ip: str, endpoint: str):
        security_logger.warning(f"Rate limit exceeded - IP: {ip}, Endpoint: {endpoint}")
    
    @staticmethod
    async def log_suspicious_activity(ip: str, activity: str):
        security_logger.warning(f"Suspicious activity - IP: {ip}, Activity: {activity}")
```

## 7. 프로덕션 보안 체크리스트

### 배포 전 확인사항
- [ ] 모든 환경변수가 안전하게 설정되었는지 확인
- [ ] JWT_SECRET이 충분히 복잡하고 긴지 확인 (최소 32자)
- [ ] DEBUG 모드가 비활성화되었는지 확인
- [ ] HTTPS가 활성화되었는지 확인
- [ ] 데이터베이스 백업 전략이 수립되었는지 확인
- [ ] 로그에 민감한 정보가 노출되지 않는지 확인
- [ ] Rate limiting이 적절히 설정되었는지 확인
- [ ] CORS 설정이 프로덕션 도메인만 허용하는지 확인

### 보안 헤더 설정 (Nginx)
```nginx
# 프로덕션 nginx.conf에 추가
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## 8. 보안 업데이트 및 유지보수

### 정기적인 보안 점검
1. **의존성 업데이트**: 매월 보안 패치 확인 및 업데이트
2. **로그 분석**: 주간 보안 로그 분석 및 이상 징후 확인
3. **접근 권한 검토**: 분기별 사용자 권한 및 관리자 권한 검토
4. **백업 테스트**: 월간 백업 복구 테스트
5. **보안 스캔**: 분기별 취약점 스캔 실행

### 사고 대응 계획
1. **즉시 대응**: 보안 사고 발견 시 즉시 시스템 격리
2. **조사**: 로그 분석 및 영향 범위 파악
3. **복구**: 백업에서 시스템 복구 및 보안 패치 적용
4. **보고**: 영향받은 사용자에게 통지 및 대응 방안 안내
5. **개선**: 사고 원인 분석 및 재발 방지 대책 수립