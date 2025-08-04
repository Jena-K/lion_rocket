# 캐릭터 데이터 설정 가이드

실제 캐릭터 데이터를 사용하기 위한 백엔드 설정 가이드입니다.

## 1. 데이터베이스 초기화

백엔드 서버를 시작하여 데이터베이스 테이블을 자동으로 생성합니다:

```bash
cd backend
uvicorn app.main:app --reload
```

서버가 시작되면 다음 로그가 표시됩니다:
```
INFO:__main__:Creating database tables...
INFO:__main__:Database tables created successfully
```

## 2. 관리자 계정 생성

관리자 계정을 생성합니다:

```bash
python create_admin.py
```

## 3. 캐릭터 데이터 생성

실제 캐릭터 데이터를 생성합니다:

```bash
python create_characters.py
```

이 스크립트는 다음 3개의 캐릭터를 생성합니다:
- **민준**: 차분하고 창의적인 남성 캐릭터
- **서연**: 논리적이면서 따뜻한 여성 프로그래머
- **지우**: 활발하고 유머러스한 여성 캐릭터

## 4. 캐릭터 확인

생성된 캐릭터를 확인합니다:

```bash
python verify_characters.py
```

## 5. 프론트엔드 테스트

백엔드 서버가 실행 중인 상태에서 프론트엔드를 시작합니다:

```bash
cd frontend
npm run dev
```

이제 캐릭터 선택 페이지(`/characters`)에서 실제 데이터를 확인할 수 있습니다.

## 문제 해결

### 데이터베이스 파일 권한 오류
- `data/` 디렉토리가 존재하는지 확인
- 디렉토리 권한을 확인하고 필요시 수정

### 캐릭터가 표시되지 않는 경우
1. 백엔드 서버가 실행 중인지 확인
2. 브라우저 개발자 도구에서 네트워크 탭 확인
3. API 엔드포인트 URL이 올바른지 확인 (`/characters/available`)

### URL 변경 후 문제 발생
- 새로운 URL 구조: `/characters/` (기존: `/api/characters/`)
- 백엔드와 프론트엔드 모두 업데이트되었는지 확인

## API 엔드포인트

캐릭터 관련 주요 엔드포인트:
- `GET /characters/available` - 사용 가능한 캐릭터 목록
- `GET /characters/active` - 현재 활성 캐릭터
- `POST /characters/{id}/select` - 캐릭터 선택