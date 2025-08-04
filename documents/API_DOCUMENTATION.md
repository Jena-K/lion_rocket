# 📚 LionRocket AI Chat API Documentation

## 🚀 Overview

LionRocket AI Chat Service provides a RESTful API for AI-powered conversations using Claude 3. This documentation covers all available endpoints, authentication, and usage examples.

### Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://api.lionrocket.com`

### API Version
- **Current Version**: 1.0.0
- **OpenAPI Spec**: `/openapi.json`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Tokens must be included in the `Authorization` header as a Bearer token.

### Getting Started

1. **Register** a new account
2. **Login** to receive your JWT token
3. Include the token in all subsequent requests

```http
Authorization: Bearer <your-jwt-token>
```

### Token Information
- **Type**: Bearer JWT
- **Expiration**: 24 hours
- **Algorithm**: HS256

## 📊 Rate Limiting

- **General API**: 100 requests per minute
- **Chat Messages**: 20 messages per minute
- **Admin Endpoints**: 200 requests per minute

Exceeded limits return `429 Too Many Requests`.

## 🔌 API Endpoints

### 🏠 Health Check

#### GET /
Get API information and available endpoints.

**Response Example:**
```json
{
  "message": "LionRocket AI Chat API",
  "version": "1.0.0",
  "docs": "/docs",
  "redoc": "/redoc",
  "openapi": "/openapi.json"
}
```

#### GET /health
Check service health status.

**Response Example:**
```json
{
  "status": "healthy",
  "service": "LionRocket AI Chat"
}
```

### 🔑 Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- Must contain uppercase and lowercase letters
- Must contain at least one number
- Must contain at least one special character

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john.doe@example.com",
  "is_admin": false,
  "created_at": "2024-01-01T00:00:00"
}
```

#### POST /auth/login
Authenticate and receive JWT token.

**Request Body (form-data):**
```
username=john_doe
password=SecurePassword123!
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john.doe@example.com",
    "is_admin": false,
    "created_at": "2024-01-01T00:00:00"
  }
}
```

#### POST /auth/logout
Logout (client should discard token).

**Authorization Required**: ✅

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

#### GET /auth/me
Get current user information.

**Authorization Required**: ✅

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john.doe@example.com",
  "is_admin": false,
  "created_at": "2024-01-01T00:00:00"
}
```

### 💬 Chats

#### GET /api/chats
Get all chats for the current user.

**Authorization Required**: ✅

**Query Parameters:**
- `page` (int, default: 1): Page number
- `limit` (int, default: 20, max: 100): Items per page

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "user_id": 1,
      "character_id": 1,
      "created_at": "2024-01-01T00:00:00",
      "last_message_at": "2024-01-01T00:05:00"
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 2,
  "limit": 20
}
```

#### POST /api/chats
Create a new chat session.

**Authorization Required**: ✅

**Request Body:**
```json
{
  "character_id": 1,
  "initial_message": "Hello, I need help with Python" // optional
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "user_id": 1,
  "character_id": 1,
  "created_at": "2024-01-01T00:00:00",
  "last_message_at": "2024-01-01T00:00:00"
}
```

#### GET /api/chats/{chat_id}
Get chat details with messages.

**Authorization Required**: ✅

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "character_id": 1,
  "created_at": "2024-01-01T00:00:00",
  "last_message_at": "2024-01-01T00:05:00",
  "character": {
    "id": 1,
    "name": "Code Helper",
    "system_prompt": "You are a helpful programming assistant...",
    "created_by": 1,
    "created_at": "2024-01-01T00:00:00"
  },
  "messages": [
    {
      "id": 1,
      "chat_id": 1,
      "role": "user",
      "content": "Hello",
      "token_count": 2,
      "created_at": "2024-01-01T00:00:00"
    }
  ],
  "message_count": 5
}
```

#### DELETE /api/chats/{chat_id}
Delete a chat session.

**Authorization Required**: ✅

**Response (200 OK):**
```json
{
  "message": "Chat deleted successfully"
}
```

#### GET /api/chats/{chat_id}/messages
Get messages for a specific chat.

**Authorization Required**: ✅

**Query Parameters:**
- `limit` (int, optional): Maximum number of recent messages to return

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "chat_id": 1,
    "role": "user",
    "content": "Can you explain Python decorators?",
    "token_count": 8,
    "created_at": "2024-01-01T00:00:00"
  },
  {
    "id": 2,
    "chat_id": 1,
    "role": "assistant",
    "content": "Python decorators are a powerful feature...",
    "token_count": 150,
    "created_at": "2024-01-01T00:00:01"
  }
]
```

#### POST /api/chats/{chat_id}/messages
Send a message and receive AI response.

**Authorization Required**: ✅
**Rate Limit**: 20 messages/minute

**Request Body:**
```json
{
  "content": "Can you explain Python decorators?"
}
```

**Message Constraints:**
- Maximum length: 200 characters
- Cannot be empty or whitespace only

**Response (200 OK):**
```json
{
  "id": 3,
  "chat_id": 1,
  "role": "assistant",
  "content": "Python decorators are a powerful feature that allows you to modify...",
  "token_count": 150,
  "created_at": "2024-01-01T00:00:30"
}
```

### 🎭 Characters

#### GET /api/characters
Get all available AI characters.

**Authorization Required**: ✅

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Claude Assistant",
    "system_prompt": "You are Claude, a helpful AI assistant...",
    "created_by": 1,
    "created_at": "2024-01-01T00:00:00"
  },
  {
    "id": 2,
    "name": "Code Helper",
    "system_prompt": "You are a programming assistant...",
    "created_by": 1,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

#### GET /api/characters/{character_id}
Get character details with usage statistics.

**Authorization Required**: ✅

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Code Helper",
  "system_prompt": "You are a programming assistant...",
  "created_by": 1,
  "created_at": "2024-01-01T00:00:00",
  "chat_count": 25,
  "total_messages": 150
}
```

#### POST /api/characters
Create a new character (Admin only).

**Authorization Required**: ✅ (Admin)

**Request Body:**
```json
{
  "name": "Math Tutor",
  "system_prompt": "You are a patient math tutor..."
}
```

**Response (200 OK):**
```json
{
  "id": 3,
  "name": "Math Tutor",
  "system_prompt": "You are a patient math tutor...",
  "created_by": 1,
  "created_at": "2024-01-01T00:00:00"
}
```

#### PUT /api/characters/{character_id}
Update a character (Admin only).

**Authorization Required**: ✅ (Admin)

**Request Body:**
```json
{
  "name": "Advanced Math Tutor",
  "system_prompt": "You are an advanced mathematics tutor..."
}
```

#### DELETE /api/characters/{character_id}
Delete a character (Admin only).

**Authorization Required**: ✅ (Admin)

**Note**: Cannot delete characters that are being used in chats.

### 📋 Common Prompts

#### GET /api/prompts
Get all common prompt templates.

**Authorization Required**: ✅

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Code Review",
    "prompt_text": "Please review this code and suggest improvements...",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
]
```

#### POST /api/prompts
Create a new prompt (Admin only).

**Authorization Required**: ✅ (Admin)

#### PUT /api/prompts/{prompt_id}
Update a prompt (Admin only).

**Authorization Required**: ✅ (Admin)

#### DELETE /api/prompts/{prompt_id}
Delete a prompt (Admin only).

**Authorization Required**: ✅ (Admin)

### 👨‍💼 Admin Dashboard

All admin endpoints require admin role authorization.

#### GET /admin/users
Get all users with statistics.

**Authorization Required**: ✅ (Admin)

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 20, max: 100)

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 2,
      "username": "jane_smith",
      "email": "jane.smith@example.com",
      "is_admin": false,
      "created_at": "2024-01-01T00:00:00",
      "total_chats": 5,
      "total_tokens": 2500,
      "last_active": "2024-01-02T15:30:00"
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 8,
  "limit": 20
}
```

#### GET /admin/users/{user_id}/chats
Get all chats for a specific user.

**Authorization Required**: ✅ (Admin)

#### GET /admin/users/{user_id}/usage
Get usage statistics for a specific user.

**Authorization Required**: ✅ (Admin)

**Query Parameters:**
- `start_date` (date, optional): Start date (YYYY-MM-DD)
- `end_date` (date, optional): End date (YYYY-MM-DD)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "usage_date": "2024-01-02",
    "chat_count": 3,
    "total_tokens": 450,
    "created_at": "2024-01-02T00:00:00"
  }
]
```

#### GET /admin/stats/overview
Get system-wide statistics.

**Authorization Required**: ✅ (Admin)

**Response (200 OK):**
```json
{
  "total_users": 150,
  "active_users_today": 45,
  "total_chats": 1250,
  "total_messages": 8500,
  "total_tokens_used": 125000,
  "average_tokens_per_user": 833.33
}
```

#### POST /admin/users/{user_id}/toggle-admin
Toggle admin status for a user.

**Authorization Required**: ✅ (Admin)

**Note**: Cannot modify your own admin status.

#### DELETE /admin/users/{user_id}
Delete a user and all their data.

**Authorization Required**: ✅ (Admin)

**Note**: Cannot delete your own account.

## 🔴 Error Responses

All errors follow a consistent format:

```json
{
  "detail": "Error description",
  "status": 400
}
```

### Common Error Codes

| Status Code | Description | Example |
|-------------|-------------|---------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid or missing JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 422 | Validation Error | Request body validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Validation Error Format

```json
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "ensure this value has at least 8 characters",
      "type": "value_error.any_str.min_length",
      "ctx": {"limit_value": 8}
    }
  ],
  "status": 422
}
```

## 🛡️ Security Headers

All API responses include security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'...`

## 📈 Response Headers

Additional headers included in responses:

- `X-Request-ID`: Unique request identifier
- `X-Response-Time`: Response time in seconds
- `X-Response-Time-Ms`: Response time in milliseconds
- `X-API-Version`: Current API version
- `X-Process-Time`: Server processing time

## 🧪 Testing

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Example cURL Commands

#### Register User
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=Test123!@#"
```

#### Send Message
```bash
curl -X POST http://localhost:8000/api/chats/1/messages \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, Claude!"
  }'
```

## 📝 Changelog

### Version 1.0.0 (2024-01-01)
- Initial release
- JWT authentication
- Chat management
- Character system
- Admin dashboard
- Rate limiting
- Comprehensive logging

---

For more information or support, contact support@lionrocket.com