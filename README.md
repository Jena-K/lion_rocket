# LionRocket AI Chat Service
## 개요

Anthropic의 Claude AI를 활용하여 개발된 서비스입니다. Magic MCP를 프론트엔드 개발 파트너로, Playwright MCP를 이용한 테스트 효율화, Context7 MCP를 기술 문서 도우미로 활용하여 생산성 크게 높히는데 활용하였습니다.

### 기술 개요 
**기술 스택**: Python, FastAPI, Vue.js, TypeScript, Claude AI  
**AI 도구**: Claude AI, Magic MCP, Playwright MCP, Context7 MCP


### 주요 특징
- **다중 캐릭터 채팅**: 다양한 성격과 특성을 가진 AI 캐릭터들과의 개별 대화
- **실시간 채팅**: 빠른 응답 시간과 자연스러운 대화 흐름
- **관리자 대시보드**: 사용자, 캐릭터, 채팅 통계의 종합적 관리
- **사용량 통계**: 상세한 토큰 사용량 및 대화 통계 추적
- **보안 시스템**: JWT 기반 인증과 역할별 접근 제어

## 기술 스택 및 아키텍처

### Backend 기술 스택
- **Python (3.11+)
- **FastAPI 0.109.0**: 고성능 Python 웹 프레임워크
- **SQLAlchemy 2.0.25**: 현대적인 ORM과 비동기 데이터베이스 처리
- **Alembic**: 데이터베이스 마이그레이션 관리
- **Anthropic Claude API**: AI 대화 생성 엔진
- **JWT Authentication**: 보안 토큰 기반 인증 시스템
- **Rate Limiting**: SlowAPI를 통한 API 호출 제한

### Frontend 기술 스택
- **Node.js (18+)
- **Vue.js 3.3.8**: 현대적인 프론트엔드 프레임워크
- **TypeScript 5.2.0**: 타입 안전성을 위한 정적 타입 시스템
- **Pinia 2.1.7**: Vue 3 전용 상태 관리 라이브러리
- **Vite 7.0.6**: 빠른 개발 서버와 빌드 도구
- **Axios**: HTTP 클라이언트 라이브러리


## AI 기반 개발 방법론
다음과 같은 AI 도구들을 체계적으로 활용했습니다:

### Claude AI를 활용한 아키텍처 설계
**Claude AI**를 프로젝트의 핵심 아키텍트로 활용하여 전체 시스템 설계를 수행했습니다.
- **시스템 아키텍처 기획**: 마이크로서비스 구조와 API 설계 패턴 결정
- **데이터베이스 스키마 설계**: 정규화된 테이블 구조와 관계 설정
- **보안 아키텍처**: JWT 기반 인증 시스템과 역할별 접근 제어 설계

### Magic MCP를 통한 프론트엔드 개발
**Magic MCP (Model Context Protocol)**를 활용하여 프론트엔드 디자인과 개발을 자동화
- **UI 컴포넌트 자동 생성**: 디자인 시스템을 기반으로 한 일관된 컴포넌트 생성
- **반응형 디자인**: 모바일과 데스크톱 환경을 모두 고려한 적응형 레이아웃
- **Vue 3 최적화**: Composition API와 TypeScript를 활용한 현대적 프론트엔드 개발

### Playwright MCP를 통한 테스트 자동화
**Playwright MCP**를 사용하여 테스트 자동화
- **E2E 테스트**: 사용자 시나리오를 기반으로 한 전체 워크플로우 테스트

### Context7 MCP를 통한 문서 관리
**Context7 MCP**를 활용하여 최신 기술 문서에 기반한 개발을 수행
- **버전 호환성 관리**: 라이브러리 업데이트 시 호환성 문제 사전 방지
- **최신 베스트 프랙티스**: 각 기술의 최신 권장사항을 실시간 적용
- **문서 기반 코드 생성**: 공식 문서를 참조한 정확한 구현
- **의존성 관리**: 패키지 간 버전 충돌 방지와 최적화된 의존성 설정

## 개발 프로세스 및 품질 관리

### 코드 품질 관리
- **타입 검사**: TypeScript를 통한 프론트엔드 타입 안전성 보장

### 보안 구현
- **인증 시스템**: JWT 토큰 기반의 stateless 인증
- **권한 관리**: 사용자와 관리자 역할 분리
- **Rate Limiting**: API 남용 방지를 위한 요청 제한
- **CORS 설정**: 안전한 크로스 오리진 요청 관리
- **SQL Injection 방지**: SQLAlchemy ORM을 통한 안전한 데이터베이스 접근


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
