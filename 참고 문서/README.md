# 🚀 LionRocket - AI Chat Service

AI 캐릭터와 자연스러운 대화를 나눌 수 있는 현대적인 웹 서비스입니다.

## 📋 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [빠른 시작](#-빠른-시작)
- [프로젝트 구조](#-프로젝트-구조)
- [API 문서](#-api-문서)
- [주요 화면](#-주요-화면)
- [환경 설정](#-환경-설정)
- [개발 가이드](#-개발-가이드)
- [Docker 사용법](#-docker-사용법)

## 🌟 주요 기능

### 🤖 AI 채팅 시스템
- **Claude API 통합**: Anthropic의 Claude AI를 활용한 자연스러운 대화
- **캐릭터 기반 채팅**: 다양한 성격과 배경을 가진 AI 캐릭터와 대화
- **대화 요약 기능**: 20개 메시지마다 자동으로 대화 내용 요약
- **이전 대화 기억**: 과거 대화 내용을 바탕으로 일관성 있는 대화 진행

### 👥 사용자 관리
- **회원가입/로그인**: JWT 기반 인증 시스템
- **사용자 프로필**: 개인 정보 관리 및 수정
- **채팅 히스토리**: 개인별 대화 기록 저장 및 조회

### 🎭 캐릭터 관리
- **캐릭터 생성**: 이름, 성격, 배경설정이 포함된 AI 캐릭터 제작
- **아바타 업로드**: 캐릭터별 프로필 이미지 설정
- **캐릭터 선택**: 다양한 캐릭터 중 대화 상대 선택

### 🛡️ 관리자 기능
- **사용자 관리**: 전체 사용자 조회 및 관리
- **캐릭터 관리**: 시스템 내 모든 캐릭터 관리
- **채팅 로그 조회**: 사용자별 대화 내역 모니터링
- **시스템 통계**: 사용량 및 성능 지표 확인

## 🛠 기술 스택

### Backend
- **FastAPI** (0.109.0) - 고성능 Python 웹 프레임워크
- **SQLAlchemy** (2.0.25) - 비동기 ORM
- **Alembic** (1.13.1) - 데이터베이스 마이그레이션
- **Anthropic Claude API** (0.18.1) - AI 채팅 서비스
- **JWT Authentication** - 토큰 기반 인증
- **SQLite** - 경량 데이터베이스
- **Pydantic** (2.5.3) - 데이터 검증

### Frontend
- **Vue.js 3** (3.3.8) - 현대적인 프론트엔드 프레임워크
- **TypeScript** (5.2.0) - 타입 안전성
- **Vite** (7.0.6) - 빠른 빌드 도구
- **Pinia** (2.1.7) - Vue 상태 관리
- **Vue Router** (4.2.5) - 클라이언트 사이드 라우팅
- **Axios** (1.6.0) - HTTP 클라이언트

### 개발 도구
- **Docker** - 컨테이너화
- **Alembic** - 데이터베이스 스키마 관리
- **Black, Flake8, MyPy** - Python 코드 품질 도구
- **Prettier** - 코드 포매팅

## 🚀 빠른 시작

### 📋 사전 요구사항
- Python 3.11+
- Node.js 18+
- Git

### ⚡ 자동 설정 (권장)
```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd lionrocket

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 Claude API 키 등 필요한 값 설정

# 3. 자동 설정 실행
python setup.py
```

### 🔧 수동 설정

#### Backend 설정
```bash
cd backend

# 의존성 설치 (uv 사용 권장)
uv pip install -r requirements.txt
# 또는 pip install -r requirements.txt

# 데이터베이스 초기화
alembic upgrade head

# 서버 실행
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend 설정
```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 🌐 접속 정보
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs
- **관리자 계정**: admin / admin123

## 📁 프로젝트 구조

```
lionrocket/
├── 📁 backend/                 # FastAPI 백엔드
│   ├── 📁 app/
│   │   ├── 📁 routers/         # API 엔드포인트
│   │   │   ├── auth.py         # 인증 관련
│   │   │   ├── chat.py         # 채팅 기능
│   │   │   ├── character.py    # 캐릭터 관리
│   │   │   └── admin.py        # 관리자 기능
│   │   ├── 📁 models/          # 데이터베이스 모델
│   │   │   ├── user.py         # 사용자 모델
│   │   │   ├── character.py    # 캐릭터 모델
│   │   │   ├── chat.py         # 채팅 모델
│   │   │   └── conversation_summary.py  # 대화 요약
│   │   ├── 📁 schemas/         # Pydantic 스키마
│   │   ├── 📁 services/        # 비즈니스 로직
│   │   │   ├── chat_service.py # 채팅 서비스
│   │   │   └── claude_service.py # Claude API 연동
│   │   ├── 📁 middleware/      # 미들웨어
│   │   │   ├── core.py         # 핵심 미들웨어
│   │   │   ├── admin.py        # 관리자 미들웨어
│   │   │   └── rate_limit.py   # 속도 제한
│   │   └── 📁 core/            # 핵심 설정
│   ├── 📁 alembic/             # 데이터베이스 마이그레이션
│   ├── 📁 uploads/avatars/     # 업로드된 아바터 이미지
│   ├── requirements.txt        # Python 의존성
│   ├── pyproject.toml         # 프로젝트 설정
│   └── Dockerfile             # Docker 설정
├── 📁 frontend/               # Vue.js 프론트엔드
│   ├── 📁 src/
│   │   ├── 📁 components/     # 재사용 가능한 컴포넌트
│   │   ├── 📁 views/          # 페이지 컴포넌트
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   ├── CharacterSelectionView.vue
│   │   │   ├── ChatView.vue
│   │   │   └── 📁 admin/      # 관리자 페이지
│   │   ├── 📁 services/       # API 서비스
│   │   ├── 📁 stores/         # Pinia 상태 관리
│   │   ├── 📁 types/          # TypeScript 타입 정의
│   │   └── 📁 utils/          # 유틸리티 함수
│   ├── 📁 public/             # 정적 파일
│   └── package.json           # Node.js 의존성
├── 📁 images/                 # 스크린샷 및 문서용 이미지
├── .env.example               # 환경변수 예시
├── setup.py                   # 자동 설정 스크립트
└── README.md                  # 프로젝트 문서
```

## 📚 API 문서

### 🔗 주요 엔드포인트

#### 인증 (Authentication)
- `POST /auth/register` - 사용자 회원가입
- `POST /auth/login` - 사용자 로그인
- `GET /auth/me` - 현재 사용자 정보

#### 캐릭터 (Characters)
- `GET /characters` - 캐릭터 목록 조회
- `POST /characters` - 캐릭터 생성
- `PUT /characters/{id}` - 캐릭터 수정
- `DELETE /characters/{id}` - 캐릭터 삭제
- `POST /characters/{id}/avatar` - 아바타 업로드

#### 채팅 (Chats)
- `POST /chats` - 메시지 전송 및 AI 응답 받기
- `GET /chats` - 채팅 히스토리 조회
- `POST /chats/end-conversation/{character_id}` - 대화 종료 및 요약

#### 관리자 (Admin)
- `GET /admin/users` - 전체 사용자 조회
- `GET /admin/characters` - 전체 캐릭터 조회
- `GET /admin/chats/{user_id}` - 특정 사용자 채팅 로그

### 📖 상세 API 문서
서버 실행 후 http://localhost:8000/docs 에서 Swagger UI를 통한 상세 API 문서를 확인할 수 있습니다.

## 🖼 주요 화면

### 사용자 화면
- **로그인/회원가입**: 간편한 사용자 등록 및 인증
- **캐릭터 선택**: 다양한 AI 캐릭터 중 대화 상대 선택
- **채팅 화면**: 실시간 AI와의 대화, 메시지 히스토리 표시

### 관리자 화면
- **관리자 대시보드**: 시스템 전체 현황 및 통계
- **사용자 관리**: 전체 사용자 목록 및 정보
- **캐릭터 관리**: 시스템 내 모든 캐릭터 관리
- **채팅 로그**: 사용자별 대화 내역 모니터링

## ⚙️ 환경 설정

### 필수 환경 변수
```bash
# 데이터베이스
DATABASE_URL=sqlite:///./data/lionrocket.db

# 보안
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here

# Claude API (선택사항)
CLAUDE_API_KEY=your-claude-api-key-here

# 관리자 계정
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123

# 개발 설정
DEBUG=true
ENVIRONMENT=development
```

### Claude API 설정
1. [Anthropic Console](https://console.anthropic.com/)에서 API 키 발급
2. `.env` 파일에 `CLAUDE_API_KEY` 설정
3. API 키가 없으면 대체 응답 메시지가 표시됩니다

## 💻 개발 가이드

### 백엔드 개발
```bash
# 개발 서버 실행 (자동 리로드)
cd backend
python -m uvicorn app.main:app --reload

# 데이터베이스 마이그레이션
alembic revision --autogenerate -m "migration message"
alembic upgrade head

# 코드 포매팅
black app/
flake8 app/
mypy app/
```

### 프론트엔드 개발
```bash
# 개발 서버 실행
cd frontend
npm run dev

# 타입 체크
npm run type-check

# 프로덕션 빌드
npm run build
```

### 데이터베이스 스키마
- **users**: 사용자 정보 (ID, 이메일, 비밀번호, 생성일 등)
- **characters**: AI 캐릭터 (ID, 이름, 프롬프트, 아바타, 생성자 등)
- **chats**: 채팅 메시지 (ID, 사용자, 캐릭터, 내용, 역할, 토큰 비용 등)
- **conversation_summaries**: 대화 요약 (사용자-캐릭터별 대화 요약)
- **usage_stats**: 사용 통계 (API 호출, 토큰 사용량 등)

## 🐳 Docker 사용법

### 백엔드 Docker 실행
```bash
cd backend

# 이미지 빌드
docker build -t lionrocket-backend .

# 개발 모드 실행
docker run -p 8000:8000 -e DEPLOYMENT_MODE=development lionrocket-backend

# 프로덕션 모드 실행
docker run -p 8000:8000 -e DEPLOYMENT_MODE=production lionrocket-backend
```
