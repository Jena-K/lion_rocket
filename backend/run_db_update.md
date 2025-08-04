# SQLite 데이터베이스 Character 테이블 created_by 업데이트 가이드

Character 테이블의 모든 레코드에서 `created_by` 컬럼 값을 1로 설정하는 방법입니다.

## 방법 1: Python 스크립트 사용 (권장)

백엔드 서버가 실행된 후에 사용하세요:

```bash
cd backend
python update_character_created_by.py
```

## 방법 2: SQL 스크립트 직접 실행

데이터베이스 파일 경로를 찾아서 직접 SQLite 명령으로 실행:

```bash
# 데이터베이스 파일 위치 확인 (config.py에서 DATABASE_URL 확인)
# 기본값: ./data/lionrocket.db

# SQLite CLI로 스크립트 실행
sqlite3 data/lionrocket.db < update_created_by.sql
```

## 방법 3: SQLite CLI로 직접 실행

```bash
# SQLite CLI 접속
sqlite3 data/lionrocket.db

# SQL 명령어 직접 실행
.headers on
.mode column

-- 현재 상태 확인
SELECT id, name, created_by FROM character;

-- 모든 character의 created_by를 1로 업데이트
UPDATE character SET created_by = 1;

-- 업데이트된 행 수 확인
SELECT changes();

-- 결과 확인
SELECT id, name, created_by FROM character;

-- 종료
.quit
```

## 방법 4: 백엔드 서버 실행 후 Python 스크립트

1. 먼저 백엔드 서버를 시작하여 데이터베이스를 초기화:
```bash
cd backend
uvicorn app.main:app --reload
```

2. 서버가 시작된 후 새 터미널에서:
```bash
python update_character_created_by.py
```

## 업데이트 확인

업데이트 후 다음 명령으로 확인:

```sql
SELECT id, name, created_by FROM character;
```

모든 캐릭터의 `created_by` 값이 1이어야 합니다.

## 주의사항

- 이 작업은 모든 캐릭터 레코드를 수정하므로 백업을 권장합니다
- `created_by = 1`은 관리자 사용자(ID: 1)를 의미합니다
- 업데이트 전에 관리자 사용자(ID: 1)가 존재하는지 확인하세요