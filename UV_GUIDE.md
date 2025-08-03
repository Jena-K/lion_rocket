# 🚀 Lion Rocket UV 개발 가이드

UV를 사용하여 Lion Rocket 프로젝트의 프론트엔드와 백엔드를 통합 관리하는 방법을 안내합니다.

## 📋 UV란?

UV는 Rust로 작성된 매우 빠른 Python 패키지 매니저입니다. pip보다 10-100배 빠르며, 프로젝트 관리 기능을 제공합니다.

## 🔧 UV 설치

### Windows
```powershell
# PowerShell에서 실행
.\install-uv.ps1

# 또는 수동 설치
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### macOS/Linux
```bash
# 설치 스크립트 실행
chmod +x install-uv.sh
./install-uv.sh

# 또는 수동 설치
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## 🎯 UV 명령어

### 기본 명령어

```bash
# 모든 의존성 설치 (백엔드 + 프론트엔드)
uv run install

# 개발 서버 실행 (백엔드 + 프론트엔드)
uv run dev

# 백엔드만 실행
python run.py dev --backend-only

# 프론트엔드만 실행
python run.py dev --frontend-only
```

### 빌드 및 테스트

```bash
# 테스트 실행
uv run test

# 코드 포맷팅
uv run format

# 린팅
uv run lint
```

### 기타 작업

```bash
# 데이터베이스 작업은 백엔드 디렉토리에서 직접 실행
cd backend

# 데이터베이스 초기화
uv run python -m alembic upgrade head

# 마이그레이션 생성
uv run python -m alembic revision --autogenerate -m "migration message"

# Docker 작업
docker-compose build
docker-compose up -d
docker-compose down
docker-compose logs -f
```

## 🛠️ Python 스크립트 사용

Python 스크립트로도 서비스를 관리할 수 있습니다:

```bash
# 개발 서버 실행
python run.py dev

# 백엔드만 실행
python run.py dev --backend-only

# 프론트엔드만 실행
python run.py dev --frontend-only

# 의존성 설치
python run.py install

# 테스트 실행
python run.py test

# 코드 포맷팅
python run.py format

# 린팅
python run.py lint
```

## 📁 프로젝트 구조

```
lionrocket/
├── pyproject.toml          # 루트 UV 설정 (전체 프로젝트)
├── backend/
│   ├── pyproject.toml     # 백엔드 UV 설정
│   └── app/               # FastAPI 애플리케이션
├── frontend/
│   ├── pyproject.toml     # 프론트엔드 UV 설정
│   ├── package.json       # Node.js 의존성
│   └── src/               # Vue.js 애플리케이션
├── run.py                 # 통합 실행 스크립트
├── install-uv.sh          # UV 설치 (Unix)
└── install-uv.ps1         # UV 설치 (Windows)
```

## 🚀 빠른 시작

1. **UV 설치**
   ```bash
   # Windows
   .\install-uv.ps1
   
   # macOS/Linux
   ./install-uv.sh
   ```

2. **의존성 설치**
   ```bash
   uv run install
   ```

3. **개발 서버 실행**
   ```bash
   uv run dev
   ```

4. **브라우저에서 확인**
   - 백엔드 API: http://localhost:8000
   - API 문서: http://localhost:8000/docs
   - 프론트엔드: http://localhost:5173

## 💡 팁

### UV 가상환경

UV는 자동으로 가상환경을 관리합니다:

```bash
# 가상환경 생성 (자동)
uv venv

# 가상환경 활성화 (필요시)
# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

### 의존성 추가

```bash
# 백엔드 의존성 추가
cd backend
uv add fastapi

# 개발 의존성 추가
uv add --dev pytest

# requirements.txt에서 동기화
uv pip sync requirements.txt
```

### 성능 최적화

UV는 매우 빠르지만, 추가 최적화 팁:

1. **캐시 활용**: UV는 자동으로 패키지를 캐시합니다
2. **병렬 설치**: UV는 기본적으로 병렬로 패키지를 설치합니다
3. **Lock 파일**: `uv.lock` 파일로 정확한 버전 관리

## 🔍 문제 해결

### UV 명령을 찾을 수 없음
```bash
# PATH에 UV 추가
export PATH="$HOME/.cargo/bin:$PATH"
```

### 권한 오류
```bash
# Unix 시스템에서 실행 권한 부여
chmod +x install-uv.sh
chmod +x run.py
```

### 포트 충돌
```bash
# 다른 포트로 백엔드 실행
uv run dev-backend -- --port 8001
```

## 📚 추가 자료

- [UV 공식 문서](https://github.com/astral-sh/uv)
- [UV vs pip 성능 비교](https://astral.sh/blog/uv)
- [pyproject.toml 명세](https://peps.python.org/pep-0621/)

---

UV를 사용하면 Python과 Node.js 프로젝트를 하나의 도구로 효율적으로 관리할 수 있습니다! 🎉