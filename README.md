# LionRocket AI Chat - JWT 인증 시스템

이 프로젝트는 **세션 대신 JWT(JSON Web Token) 인증**을 사용하는 AI 채팅 애플리케이션입니다.

## 🔐 JWT 인증 구현 완료

### ✅ 구현된 기능

- **Backend (FastAPI)**
  - JWT 토큰 생성 및 검증
  - 비밀번호 해싱 (bcrypt)
  - 사용자 인증 미들웨어
  - 역할 기반 접근 제어 (RBAC)
  - 회원가입/로그인/로그아웃 API

- **Frontend (Vue 3 + TypeScript)**
  - JWT 토큰 관리 (localStorage)
  - Axios 인터셉터 (자동 토큰 첨부)
  - 라우트 가드 (인증 상태 확인)
  - 자동 토큰 만료 처리
  - 관리자 권한 확인

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 환경 변수 파일 생성
cp .env.example .env

# JWT 시크릿 키 변경 (필수!)
# .env 파일에서 JWT_SECRET을 변경하세요
```

### 2. Backend 실행

```bash
cd backend

# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 초기화 및 서버 시작
python -m app.main
```

서버는 `http://localhost:8000`에서 실행됩니다.

### 3. Frontend 실행

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

프론트엔드는 `http://localhost:5173`에서 실행됩니다.

## 🔑 JWT 인증 흐름

### 1. 사용자 등록/로그인
```
사용자 → 로그인 → 서버에서 JWT 토큰 생성 → 클라이언트에 토큰 저장
```

### 2. API 요청
```
클라이언트 → Authorization: Bearer <JWT> → 서버에서 토큰 검증 → 응답
```

### 3. 토큰 만료 처리
```
만료된 토큰 → 401 Unauthorized → 자동 로그아웃 → 로그인 페이지로 이동
```

## 📁 주요 파일 구조

### Backend
```
backend/
├── app/
│   ├── auth/
│   │   ├── jwt.py           # JWT 토큰 생성/검증
│   │   ├── dependencies.py  # 인증 미들웨어
│   │   └── router.py        # 인증 API 엔드포인트
│   ├── models.py           # 데이터베이스 모델
│   ├── schemas.py          # Pydantic 스키마
│   ├── database.py         # 데이터베이스 설정
│   └── main.py            # FastAPI 앱 설정
└── requirements.txt        # Python 의존성
```

### Frontend
```
frontend/
├── src/
│   ├── stores/
│   │   └── auth.ts         # Pinia 인증 스토어
│   ├── views/
│   │   ├── LoginView.vue   # 로그인 페이지
│   │   ├── RegisterView.vue # 회원가입 페이지
│   │   ├── ChatView.vue    # 메인 채팅 페이지
│   │   └── AdminDashboard.vue # 관리자 대시보드
│   ├── router/
│   │   └── index.ts        # Vue Router + 가드
│   └── utils/
│       └── auth.ts         # JWT 토큰 유틸리티
└── package.json            # Node.js 의존성
```

## 🛡️ 보안 기능

### 1. JWT 토큰 보안
- **비밀키 보호**: 환경변수로 관리
- **토큰 만료**: 24시간 기본 설정
- **자동 갱신**: 만료 1시간 전 알림 (구현 가능)

### 2. 비밀번호 보안
- **bcrypt 해싱**: 안전한 비밀번호 저장
- **비밀번호 정책**: 최소 8자, 복합 문자 요구
- **중복 검사**: 사용자명/이메일 중복 방지

### 3. API 보안
- **CORS 설정**: 허용된 도메인만 접근
- **인증 미들웨어**: 보호된 엔드포인트 자동 검증
- **역할 기반 접근**: 관리자 권한 분리

## 🧪 테스트 방법

### 1. 회원가입 테스트
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 2. 로그인 테스트
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=Test123!"
```

### 3. 인증된 요청 테스트
```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## 🔧 환경 설정

### 필수 환경 변수
```env
# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# 데이터베이스
DATABASE_URL=sqlite:///./lionrocket.db

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📈 다음 단계

1. **채팅 기능 구현**: Claude API 연동
2. **리프레시 토큰**: 자동 토큰 갱신
3. **소셜 로그인**: OAuth 통합
4. **2FA 인증**: 추가 보안 레이어
5. **토큰 블랙리스트**: 로그아웃된 토큰 무효화

## 🐛 문제 해결

### 일반적인 오류

1. **401 Unauthorized**
   - JWT 토큰이 만료되었거나 유효하지 않음
   - 로그아웃 후 다시 로그인

2. **403 Forbidden**
   - 충분한 권한이 없음
   - 관리자 계정으로 로그인 필요

3. **CORS 오류**
   - `ALLOWED_ORIGINS` 환경 변수 확인
   - 프론트엔드 URL이 허용 목록에 있는지 확인

## 🤝 기여하기

이 프로젝트는 JWT 인증 시스템 학습을 위한 예제입니다. 
개선사항이나 버그 발견 시 이슈를 등록해 주세요!

---

**⚠️ 보안 주의사항**: 프로덕션 환경에서는 반드시 강력한 JWT 시크릿 키를 사용하고, HTTPS를 통해서만 토큰을 전송하세요.