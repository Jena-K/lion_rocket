# LionRocket AI Chat 설정 가이드 - JWT 인증 시스템

## 🔐 JWT 인증 시스템 구현 완료

이 가이드는 **세션 대신 JWT(JSON Web Token)를 사용하는** AI 채팅 시스템의 설정 방법을 설명합니다.

## 📋 사전 요구사항

- Docker & Docker Compose
- Node.js 18+ (로컬 개발 시)
- Python 3.10+ (로컬 개발 시)
- PostgreSQL (Docker 또는 로컬)

## 🚀 빠른 시작 (Docker)

### 1. 프로젝트 클론 및 환경 설정

```bash
# 프로젝트 디렉토리로 이동
cd lionrocket

# 환경 변수 설정
cp .env.example .env

# 환경 변수 편집 (중요!)
nano .env
```

### 2. 필수 환경 변수 설정

`.env` 파일에서 다음 항목들을 설정하세요:

```env
# JWT 보안 설정 (필수!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-at-least-32-characters-long
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Claude API (필수!)
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# 데이터베이스
DATABASE_URL=postgresql://lionrocket:password@db:5432/lionrocket_db
```

### 3. Docker로 전체 시스템 실행

```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 4. 서비스 접속

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs

## 🔧 로컬 개발 환경 설정

### Backend 설정

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
export JWT_SECRET="your-super-secret-jwt-key"
export DATABASE_URL="sqlite:///./lionrocket.db"
export ANTHROPIC_API_KEY="your-anthropic-api-key"

# 서버 실행
python -m app.main
```

### Frontend 설정

```bash
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정
echo "VITE_API_URL=http://localhost:8000" > .env.local

# 개발 서버 실행
npm run dev
```

## 🔑 JWT 인증 테스트

### 1. 새 사용자 등록

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 2. 로그인 및 JWT 토큰 획득

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=Test123!@#"
```

응답 예시:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "is_admin": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. JWT 토큰으로 인증된 요청

```bash
# 토큰을 변수에 저장
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 현재 사용자 정보 조회
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 🛡️ 보안 설정 체크리스트

### ✅ JWT 보안
- [ ] `JWT_SECRET`이 최소 32자 이상의 강력한 키로 설정됨
- [ ] 프로덕션에서 `JWT_SECRET`이 안전하게 관리됨
- [ ] 토큰 만료 시간이 적절히 설정됨 (기본 24시간)

### ✅ 비밀번호 보안
- [ ] bcrypt 해싱 사용 (구현됨)
- [ ] 비밀번호 정책 적용 (최소 8자, 복합 문자)
- [ ] 사용자명/이메일 중복 검사 (구현됨)

### ✅ API 보안
- [ ] CORS 설정이 적절히 구성됨
- [ ] 프로덕션에서 HTTPS 사용
- [ ] Rate limiting 설정 (구현 예정)

## 🔍 문제 해결

### 자주 발생하는 오류

#### 1. JWT 토큰 관련 오류

**오류**: `{"detail": "Could not validate credentials"}`

**해결방법**:
- JWT_SECRET이 올바르게 설정되었는지 확인
- 토큰이 만료되지 않았는지 확인
- Authorization 헤더 형식 확인: `Bearer <token>`

#### 2. CORS 오류

**오류**: `Access to XMLHttpRequest has been blocked by CORS policy`

**해결방법**:
- `ALLOWED_ORIGINS` 환경 변수에 프론트엔드 URL 추가
- 개발 환경: `http://localhost:3000,http://localhost:5173`

#### 3. 데이터베이스 연결 오류

**오류**: `Connection to database failed`

**해결방법**:
- PostgreSQL 서비스가 실행 중인지 확인
- `DATABASE_URL`이 올바르게 설정되었는지 확인
- Docker: `docker-compose logs db`로 데이터베이스 로그 확인

#### 4. 비밀번호 정책 오류

**오류**: `Password does not meet security requirements`

**해결방법**:
- 최소 8자 이상
- 대문자, 소문자, 숫자, 특수문자 중 3가지 이상 포함
- 예시: `Test123!@#`

## 📊 모니터링 및 로깅

### 로그 확인 (Docker)

```bash
# 전체 로그
docker-compose logs

# 특정 서비스 로그
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

### 로그 확인 (로컬)

```bash
# Backend 로그는 콘솔에 출력
# Frontend 로그는 브라우저 개발자 도구에서 확인
```

## 🔄 데이터베이스 관리

### 초기 데이터 생성

```bash
# Docker 환경
docker-compose exec backend python -c "
from app.database import create_tables
create_tables()
"

# 로컬 환경
cd backend
python -c "
from app.database import create_tables
create_tables()
"
```

### 관리자 계정 생성

```bash
# API를 통해 일반 사용자 생성 후 직접 DB에서 is_admin=true 설정
# 또는 별도 스크립트 작성
```

## 🚀 프로덕션 배포

### 환경 변수 보안

```env
# 프로덕션 환경 변수 예시
JWT_SECRET=production-super-secret-key-at-least-32-characters-long-and-random
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=8
DATABASE_URL=postgresql://user:password@prod-db:5432/lionrocket_prod
ANTHROPIC_API_KEY=your-production-anthropic-key
ENVIRONMENT=production
DEBUG=false
ALLOWED_ORIGINS=https://yourdomain.com
```

### HTTPS 설정

```nginx
# nginx.conf 예시
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Authorization $http_authorization;
    }
    
    location / {
        proxy_pass http://frontend:3000;
    }
}
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 환경 변수가 올바르게 설정되었는지
2. 모든 서비스가 정상 실행 중인지
3. JWT 토큰이 유효한지
4. API 엔드포인트가 올바른지

추가 도움이 필요하면 이슈를 등록해 주세요!

---

**🎉 축하합니다!** JWT 인증 시스템이 성공적으로 구현되었습니다. 이제 세션 대신 안전한 JWT 토큰을 사용하여 사용자 인증을 처리합니다.