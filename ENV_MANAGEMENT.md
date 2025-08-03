# 환경변수 관리 가이드 (과제용 단순화 버전)

## 파일 구조

```
lionrocket/
├── .env                  # 실제 사용되는 환경변수 (Git에서 제외)
├── .env.example          # 환경변수 템플릿 (Git에 포함)
└── .gitignore           # .env 파일 제외 설정
```

## 환경변수 파일 용도

### `.env`
- **실제 사용되는 환경변수 파일**
- 절대 Git에 커밋하지 않음
- 각 개발자가 로컬에서 생성 및 관리
- 과제 제출 시에는 별도로 전달

### `.env.example`
- 환경변수 템플릿
- Git에 포함되어 다른 개발자들이 참고
- 실제 값은 포함하지 않음

## 설정 방법

### 1. 초기 설정
```bash
# .env.example을 복사하여 .env 생성
cp .env.example .env

# .env 파일 편집
nano .env  # 또는 선호하는 에디터 사용
```

### 2. 필수 환경변수 설정

#### Claude API Key
```env
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```
- [Anthropic Console](https://console.anthropic.com/)에서 발급
- 절대 공유하지 않기

#### 데이터베이스
```env
DATABASE_URL=sqlite:///./data/app.db
```
- 개발: SQLite 사용
- 프로덕션: PostgreSQL 권장

#### 보안 키
```env
JWT_SECRET=your_super_secret_key_here
```
- 최소 32자 이상의 랜덤 문자열
- 온라인 생성기 사용 가능

## 환경별 실행

### 개발 환경
```bash
# .env 파일 사용 (기본)
docker-compose up

# 특정 환경 파일 사용
docker-compose --env-file .env.development up
```

### 프로덕션 환경
```bash
# 프로덕션 환경변수 설정
cp .env.production .env
# 실제 값으로 수정 후
docker-compose -f docker-compose.prod.yml up
```

## Python에서 환경변수 사용

```python
# backend/app/config.py
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Claude API
    claude_api_key: str
    claude_model: str = "claude-3-opus-20240229"
    claude_max_tokens: int = 1000
    claude_temperature: float = 0.7
    
    # Database
    database_url: str = "sqlite:///./data/app.db"
    
    # JWT Authentication
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Application
    debug: bool = False
    secret_key: str
    
    # Admin
    default_admin_username: str
    default_admin_email: str
    default_admin_password: str
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## Vue.js에서 환경변수 사용

```javascript
// frontend/.env.local
VUE_APP_API_URL=http://localhost:8000
VUE_APP_TITLE=Lion Rocket

// 사용
const apiUrl = process.env.VUE_APP_API_URL
```

## 보안 주의사항

### DO ✅
- `.env` 파일은 항상 `.gitignore`에 포함
- 환경변수는 최소 권한 원칙 적용
- 프로덕션 키는 별도 관리
- 정기적으로 키 순환

### DON'T ❌
- 환경변수를 코드에 하드코딩
- `.env` 파일을 Git에 커밋
- 환경변수를 로그에 출력
- 개발/프로덕션 키 공유

## 환경변수 검증

```python
# backend/app/main.py
from app.config import settings

def validate_environment():
    """시작 시 필수 환경변수 검증"""
    required_vars = [
        "CLAUDE_API_KEY",
        "JWT_SECRET",
        "DATABASE_URL"
    ]
    
    missing = []
    for var in required_vars:
        if not getattr(settings, var.lower(), None):
            missing.append(var)
    
    if missing:
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

# 앱 시작 시 실행
validate_environment()
```

## Docker에서 환경변수 관리

### docker-compose.yml
```yaml
services:
  backend:
    env_file:
      - .env
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
```

### Dockerfile
```dockerfile
# 빌드 시 환경변수 사용 (주의: 이미지에 포함됨)
ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}

# 런타임 환경변수는 docker-compose나 docker run에서 주입
```

## 문제 해결

### 환경변수가 로드되지 않을 때
1. `.env` 파일 위치 확인 (프로젝트 루트)
2. 파일 권한 확인 (`chmod 600 .env`)
3. 환경변수 이름 오타 확인
4. Docker 재시작

### 환경변수 우선순위
1. 시스템 환경변수
2. `.env` 파일
3. 기본값 (코드에 정의)

## 프로덕션 배포 시

### 1. 환경변수 설정
- AWS: Parameter Store, Secrets Manager
- Azure: Key Vault
- Google Cloud: Secret Manager
- Heroku: Config Vars
- Docker: Docker Secrets

### 2. CI/CD 파이프라인
```yaml
# GitHub Actions 예시
- name: Deploy
  env:
    CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## 참고 자료
- [12 Factor App - Config](https://12factor.net/config)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Python-dotenv Documentation](https://pypi.org/project/python-dotenv/)