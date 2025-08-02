# API Specification

## Base URL
- Development: `http://localhost:8000`
- Production: `https://api.lionrocket.com`

## Authentication
모든 API 요청(인증 엔드포인트 제외)은 JWT 토큰이 필요합니다.

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## API Endpoints

### 1. Authentication Endpoints

#### 회원가입
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 로그인
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "is_admin": false
  }
}
```

#### 로그아웃
```http
POST /auth/logout
```

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

#### 현재 사용자 정보
```http
GET /auth/me
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "is_admin": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 2. Chat Endpoints

#### 채팅 목록 조회
```http
GET /api/chats
```

**Query Parameters:**
- `page` (int): 페이지 번호 (default: 1)
- `limit` (int): 페이지당 항목 수 (default: 20)

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "character": {
        "id": 1,
        "name": "친절한 도우미"
      },
      "last_message": "안녕하세요!",
      "last_message_at": "2024-01-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "pages": 1
}
```

#### 새 채팅 생성
```http
POST /api/chats
```

**Request Body:**
```json
{
  "character_id": 1
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user_id": 1,
  "character": {
    "id": 1,
    "name": "친절한 도우미",
    "system_prompt": "..."
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 특정 채팅 조회
```http
GET /api/chats/{chat_id}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "character": {
    "id": 1,
    "name": "친절한 도우미",
    "system_prompt": "..."
  },
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "안녕하세요",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "안녕하세요! 무엇을 도와드릴까요?",
      "created_at": "2024-01-01T00:00:01Z"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 채팅 삭제
```http
DELETE /api/chats/{chat_id}
```

**Response (204 No Content)**

### 3. Message Endpoints

#### 메시지 전송
```http
POST /api/chats/{chat_id}/messages
```

**Request Body:**
```json
{
  "content": "안녕하세요" // 최대 200자
}
```

**Response (201 Created):**
```json
{
  "user_message": {
    "id": 1,
    "role": "user",
    "content": "안녕하세요",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "assistant_message": {
    "id": 2,
    "role": "assistant",
    "content": "안녕하세요! 무엇을 도와드릴까요?",
    "token_count": 15,
    "created_at": "2024-01-01T00:00:01Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "detail": "Message content exceeds 200 characters limit"
}
```

#### 메시지 목록 조회
```http
GET /api/chats/{chat_id}/messages
```

**Query Parameters:**
- `page` (int): 페이지 번호 (default: 1)
- `limit` (int): 페이지당 항목 수 (default: 50)

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "role": "user",
      "content": "안녕하세요",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "안녕하세요! 무엇을 도와드릴까요?",
      "token_count": 15,
      "created_at": "2024-01-01T00:00:01Z"
    }
  ],
  "total": 2,
  "page": 1,
  "pages": 1
}
```

### 4. Character Endpoints

#### 캐릭터 목록 조회
```http
GET /api/characters
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "name": "친절한 도우미",
      "system_prompt": "당신은 친절하고 도움이 되는 AI 도우미입니다.",
      "created_by": {
        "id": 1,
        "username": "admin"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 3
}
```

#### 캐릭터 생성 (Admin Only)
```http
POST /api/characters
```

**Request Body:**
```json
{
  "name": "새로운 캐릭터",
  "system_prompt": "당신은..."
}
```

**Response (201 Created):**
```json
{
  "id": 4,
  "name": "새로운 캐릭터",
  "system_prompt": "당신은...",
  "created_by": {
    "id": 1,
    "username": "admin"
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 캐릭터 수정 (Admin Only)
```http
PUT /api/characters/{character_id}
```

**Request Body:**
```json
{
  "name": "수정된 캐릭터",
  "system_prompt": "수정된 프롬프트"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "수정된 캐릭터",
  "system_prompt": "수정된 프롬프트",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### 캐릭터 삭제 (Admin Only)
```http
DELETE /api/characters/{character_id}
```

**Response (204 No Content)**

### 5. Common Prompt Endpoints

#### 공용 프롬프트 목록 조회
```http
GET /api/prompts
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "name": "한국어 응답",
      "prompt_text": "모든 응답은 한국어로 작성해주세요.",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 3
}
```

#### 프롬프트 생성 (Admin Only)
```http
POST /api/prompts
```

**Request Body:**
```json
{
  "name": "새 프롬프트",
  "prompt_text": "프롬프트 내용"
}
```

**Response (201 Created):**
```json
{
  "id": 4,
  "name": "새 프롬프트",
  "prompt_text": "프롬프트 내용",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 프롬프트 수정 (Admin Only)
```http
PUT /api/prompts/{prompt_id}
```

**Request Body:**
```json
{
  "name": "수정된 프롬프트",
  "prompt_text": "수정된 내용"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "수정된 프롬프트",
  "prompt_text": "수정된 내용",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### 프롬프트 삭제 (Admin Only)
```http
DELETE /api/prompts/{prompt_id}
```

**Response (204 No Content)**

### 6. Admin Endpoints (Admin Only)

#### 사용자 목록 조회
```http
GET /admin/users
```

**Query Parameters:**
- `page` (int): 페이지 번호 (default: 1)
- `limit` (int): 페이지당 항목 수 (default: 20)

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "is_admin": false,
      "created_at": "2024-01-01T00:00:00Z",
      "last_active": "2024-01-01T12:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "pages": 1
}
```

#### 특정 사용자 채팅 기록
```http
GET /admin/users/{user_id}/chats
```

**Query Parameters:**
- `page` (int): 페이지 번호 (default: 1)
- `limit` (int): 페이지당 항목 수 (default: 20)

**Response (200 OK):**
```json
{
  "user": {
    "id": 2,
    "username": "testuser"
  },
  "chats": [
    {
      "id": 1,
      "character": {
        "id": 1,
        "name": "친절한 도우미"
      },
      "message_count": 10,
      "total_tokens": 500,
      "created_at": "2024-01-01T00:00:00Z",
      "last_message_at": "2024-01-01T12:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "pages": 1
}
```

#### 특정 사용자 사용량 통계
```http
GET /admin/users/{user_id}/usage
```

**Query Parameters:**
- `start_date` (date): 시작 날짜 (YYYY-MM-DD)
- `end_date` (date): 종료 날짜 (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "user": {
    "id": 2,
    "username": "testuser"
  },
  "usage_stats": [
    {
      "date": "2024-01-01",
      "chat_count": 5,
      "total_tokens": 1500
    },
    {
      "date": "2024-01-02",
      "chat_count": 3,
      "total_tokens": 800
    }
  ],
  "summary": {
    "total_chats": 8,
    "total_tokens": 2300,
    "average_tokens_per_chat": 287.5
  }
}
```

#### 전체 시스템 통계
```http
GET /admin/stats/overview
```

**Response (200 OK):**
```json
{
  "users": {
    "total": 100,
    "active_today": 25,
    "active_this_week": 60,
    "active_this_month": 85
  },
  "chats": {
    "total": 1500,
    "today": 120,
    "this_week": 450,
    "this_month": 1200
  },
  "tokens": {
    "total": 150000,
    "today": 12000,
    "this_week": 45000,
    "this_month": 120000
  },
  "popular_characters": [
    {
      "id": 1,
      "name": "친절한 도우미",
      "usage_count": 600
    },
    {
      "id": 2,
      "name": "전문 상담사",
      "usage_count": 450
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "detail": "Too many requests. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

- 일반 사용자: 100 requests/minute
- 채팅 메시지: 20 messages/minute
- 관리자: 200 requests/minute

## Pagination

모든 목록 조회 API는 다음과 같은 페이지네이션 응답 형식을 따릅니다:

```json
{
  "items": [],
  "total": 100,
  "page": 1,
  "pages": 5,
  "limit": 20
}
```