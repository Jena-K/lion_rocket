# Lion Rocket Project Context

## 프로젝트 구조 분석

### 🏗️ 전체 구조
```
lionrocket/
├── backend/          # FastAPI 백엔드
│   └── app/         # 애플리케이션 코드
│       ├── auth/    # 인증 관련 모듈
│       ├── main.py  # FastAPI 앱 진입점
│       ├── models.py
│       ├── schemas.py
│       └── database.py
├── frontend/         # Vue 3 프론트엔드
│   ├── src/         # 소스 코드
│   │   ├── views/   # 페이지 컴포넌트
│   │   ├── stores/  # Pinia 상태 관리
│   │   ├── router/  # Vue Router
│   │   └── utils/   # 유틸리티
│   └── vite.config.ts
├── nginx/           # Nginx 설정
├── docs/            # 문서
└── docker-compose.yml
```

### 📦 기술 스택

#### Backend
- **Framework**: FastAPI
- **Database**: SQLite
- **Authentication**: JWT (python-jose)
- **AI**: Anthropic Claude API
- **주요 라이브러리**:
  - sqlalchemy: ORM
  - pydantic: 데이터 검증
  - passlib[bcrypt]: 비밀번호 해싱
  - python-dotenv: 환경변수 관리
  - slowapi: Rate limiting

#### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Router**: Vue Router 4
- **HTTP Client**: Axios
- **UI Framework**: Tailwind CSS (예정)
- **TypeScript**: 타입 안정성

### 🔧 환경 설정

#### 필수 환경변수 (.env)
```env
# Claude API
CLAUDE_API_KEY=sk-ant-api03-xxxxx...
CLAUDE_MODEL=claude-3-opus-20240229

# JWT 인증
JWT_SECRET=g2FcqkMCHPVJD1uoRWsY4XAbE875LzN9
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# 관리자 계정
DEFAULT_ADMIN_USERNAME=rowan
DEFAULT_ADMIN_EMAIL=mirue104@gmail.com
DEFAULT_ADMIN_PASSWORD=LionRocket3061@

# 데이터베이스
DATABASE_URL=sqlite:///./data/app.db
```

### 🚀 개발 서버 설정

#### Backend (FastAPI)
- **포트**: 8000
- **CORS**: localhost:3000, localhost:5173 허용
- **자동 재시작**: uvicorn --reload

#### Frontend (Vite)
- **포트**: 5173
- **프록시 설정**: /auth, /api → localhost:8000
- **Hot Module Replacement**: 활성화

### 📁 구현된 파일

#### Backend 구현 파일
- `backend/app/main.py` - FastAPI 앱 설정
- `backend/app/auth/jwt.py` - JWT 토큰 관리
- `backend/app/auth/router.py` - 인증 라우터
- `backend/app/auth/dependencies.py` - 인증 의존성
- `backend/app/models.py` - SQLAlchemy 모델
- `backend/app/schemas.py` - Pydantic 스키마
- `backend/app/database.py` - 데이터베이스 설정

#### Frontend 구현 파일
- `frontend/src/main.ts` - Vue 앱 진입점
- `frontend/src/App.vue` - 루트 컴포넌트
- `frontend/src/router/index.ts` - 라우터 설정
- `frontend/src/stores/auth.ts` - 인증 상태 관리
- `frontend/src/utils/auth.ts` - 인증 유틸리티
- `frontend/src/views/LoginView.vue` - 로그인 페이지
- `frontend/src/views/RegisterView.vue` - 회원가입 페이지
- `frontend/src/views/ChatView.vue` - 채팅 페이지
- `frontend/src/views/AdminDashboard.vue` - 관리자 대시보드

### 📊 데이터베이스 스키마

#### 주요 테이블
1. **users** - 사용자 정보
   - id, username, email, password_hash, is_admin

2. **characters** - AI 캐릭터
   - id, name, system_prompt, created_by

3. **chats** - 채팅 세션
   - id, user_id, character_id, created_at

4. **messages** - 채팅 메시지
   - id, chat_id, role, content, token_count

5. **usage_stats** - 사용량 통계
   - id, user_id, usage_date, chat_count, total_tokens

6. **common_prompts** - 공용 프롬프트
   - id, name, prompt_text

### 🔐 보안 설정

#### 인증 방식
- **JWT Bearer Token**: API 요청 시 헤더에 포함
- **비밀번호**: bcrypt 해싱
- **Rate Limiting**: 100 req/min (일반), 20 msg/min (채팅)

#### CORS 설정
- 개발 환경: localhost:3000, localhost:5173
- 프로덕션: 환경변수로 설정

### 📝 API 엔드포인트

#### 인증 (/auth)
- POST /auth/register - 회원가입
- POST /auth/login - 로그인 (JWT 토큰 발급)
- POST /auth/logout - 로그아웃
- GET /auth/me - 현재 사용자 정보

#### 채팅 (/api)
- GET /api/chats - 채팅 목록
- POST /api/chats - 새 채팅 생성
- GET /api/chats/{id} - 채팅 상세
- POST /api/chats/{id}/messages - 메시지 전송

#### 관리자 (/admin)
- GET /admin/users - 사용자 목록
- GET /admin/users/{id}/chats - 사용자 채팅 기록
- GET /admin/stats/overview - 전체 통계

### 🎯 현재 구현 상태

#### ✅ 완료된 작업
- 프로젝트 구조 설계
- 데이터베이스 스키마
- API 명세서
- Docker 설정
- 환경변수 구성
- 기본 백엔드 구조
- 기본 프론트엔드 구조

#### 🔄 진행 중
- JWT 인증 시스템 구현
- 기본 페이지 컴포넌트
- Pinia 상태 관리

#### ⏳ 대기 중
- Claude API 통합
- 채팅 기능 구현
- 관리자 대시보드
- UI 스타일링 (Tailwind CSS)
- 테스트 코드

### 🐳 Docker 구성

#### Services
1. **frontend**: Vue 개발 서버
2. **backend**: FastAPI 서버
3. **nginx**: 리버스 프록시

#### 실행 명령
```bash
docker-compose up -d
```

### 📚 참고 문서
- [아키텍처 설계](ARCHITECTURE.md)
- [API 명세서](API_SPECIFICATION.md)
- [데이터베이스 스키마](DATABASE_SCHEMA.sql)
- [보안 구현](SECURITY_IMPLEMENTATION.md)
- [Claude API 통합](CLAUDE_API_INTEGRATION.md)
- [환경변수 관리](ENV_MANAGEMENT.md)
- [설정 가이드](SETUP_GUIDE.md)