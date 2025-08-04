# Admin API Documentation

## Overview

The LionRocket Admin API provides comprehensive administrative functionality for managing users, characters, and monitoring system statistics. All admin endpoints require authentication with admin privileges and are protected by multiple layers of middleware for security, audit logging, rate limiting, and validation.

## Table of Contents

1. [Authentication](#authentication)
2. [Middleware Pipeline](#middleware-pipeline)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Security Considerations](#security-considerations)

## Authentication

All admin endpoints require JWT authentication with admin privileges.

### Headers Required
```
Authorization: Bearer <jwt_token>
```

### Admin Login
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=admin&password=<password>&grant_type=password
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

## Middleware Pipeline

The admin API is protected by a comprehensive middleware pipeline:

### 1. Admin Audit Log Middleware
- **Purpose**: Logs all admin actions for audit trails
- **Features**:
  - Captures request details (method, path, body, user)
  - Logs response status and processing time
  - Different log levels for different actions (READ, MODIFY, DELETE)
  - Redacts sensitive information (passwords)

### 2. Admin Rate Limit Middleware
- **Purpose**: Prevents abuse and ensures system stability
- **Limits**:
  - READ operations: 100 requests per minute
  - WRITE operations: 30 requests per minute
  - DELETE operations: 10 requests per minute
- **Scope**: Per-user rate limiting

### 3. Admin Security Middleware
- **Purpose**: Enhanced security checks and headers
- **Features**:
  - Detects suspicious patterns (SQL injection, XSS, path traversal)
  - Adds security headers to responses
  - Double-checks admin privileges
- **Security Headers**:
  ```
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  ```

### 4. Admin Request Validation Middleware
- **Purpose**: Validates request parameters
- **Validations**:
  - Page numbers: 1-10000
  - Limit per page: 1-100
  - ID values: valid integers (1-2147483647)
  - Query parameter format validation

## API Endpoints

### User Management

#### Get Users List
```http
GET /admin/users?page=1&limit=20
```

Response:
```json
{
  "items": [
    {
      "id": 1,
      "username": "kimjiyoung",
      "email": "jiyoung.kim@example.com",
      "is_admin": false,
      "created_at": "2024-01-15T09:30:00Z",
      "total_chats": 45,
      "total_tokens": 125000,
      "last_active": "2024-01-20T14:23:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 8,
  "limit": 20
}
```

#### Get User Details
```http
GET /admin/users/{user_id}
```

Response:
```json
{
  "id": 1,
  "username": "kimjiyoung",
  "email": "jiyoung.kim@example.com",
  "is_admin": false,
  "created_at": "2024-01-15T09:30:00Z"
}
```

#### Update User
```http
PUT /admin/users/{user_id}
Content-Type: application/json

{
  "email": "new.email@example.com",
  "is_admin": true
}
```

#### Toggle Admin Status
```http
POST /admin/users/{user_id}/toggle-admin
```

Response:
```json
{
  "id": 1,
  "username": "kimjiyoung",
  "email": "jiyoung.kim@example.com",
  "is_admin": true,
  "created_at": "2024-01-15T09:30:00Z"
}
```

#### Delete User
```http
DELETE /admin/users/{user_id}
```

Response:
```json
{
  "message": "User deleted successfully"
}
```

#### Get User Chats
```http
GET /admin/users/{user_id}/chats?page=1&limit=20
```

Response:
```json
{
  "items": [
    {
      "id": 1,
      "user_id": 1,
      "character_id": 2,
      "created_at": "2024-01-20T10:30:00Z",
      "message_count": 15,
      "total_tokens": 3500
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 3,
  "limit": 20
}
```

#### Get User Usage Statistics
```http
GET /admin/users/{user_id}/usage?start_date=2024-01-01&end_date=2024-01-31
```

Response:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "usage_date": "2024-01-20",
    "chat_count": 5,
    "total_tokens": 12500,
    "created_at": "2024-01-20T23:59:59Z"
  }
]
```

### Character Management

#### Get Characters List
```http
GET /admin/characters?page=1&limit=20
```

Response:
```json
{
  "items": [
    {
      "id": 1,
      "name": "코딩 선생님",
      "gender": "male",
      "intro": "프로그래밍을 쉽고 재미있게 가르쳐드리는 친절한 코딩 선생님입니다.",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "total_chats": 150,
      "total_messages": 2300
    }
  ],
  "total": 6,
  "page": 1,
  "pages": 1,
  "limit": 20
}
```

#### Create Character
```http
POST /admin/characters
Content-Type: application/json

{
  "name": "새로운 캐릭터",
  "gender": "female",
  "intro": "캐릭터 소개",
  "personality": "친절하고 도움이 되는 성격",
  "greeting": "안녕하세요! 만나서 반가워요.",
  "context": "교육 도우미 AI",
  "example_dialogues": ["예시 대화 1", "예시 대화 2"],
  "is_active": true
}
```

#### Update Character
```http
PUT /admin/characters/{character_id}
Content-Type: application/json

{
  "name": "업데이트된 이름",
  "is_active": false
}
```

#### Delete Character
```http
DELETE /admin/characters/{character_id}
```

Response:
```json
{
  "message": "Character deleted successfully"
}
```

#### Get Character Statistics
```http
GET /admin/characters/{character_id}/stats
```

Response:
```json
{
  "character_id": 1,
  "character_name": "코딩 선생님",
  "total_chats": 150,
  "total_messages": 2300,
  "total_users": 45,
  "average_messages_per_chat": 15.3,
  "active_chats_today": 12,
  "tokens_used_today": 45000
}
```

### Dashboard Statistics

#### Get System Overview
```http
GET /admin/stats/overview
```

Response:
```json
{
  "total_users": 1234,
  "active_users_today": 87,
  "total_chats": 5678,
  "total_messages": 45892,
  "total_tokens_used": 2456789,
  "average_tokens_per_user": 1993
}
```

#### Get Character Usage Statistics
```http
GET /admin/stats/character-usage
```

Response:
```json
[
  {
    "character_id": 1,
    "character_name": "코딩 선생님",
    "chat_count": 150,
    "message_count": 2300,
    "token_count": 567890,
    "user_count": 45,
    "average_chat_length": 15.3
  }
]
```

#### Get Daily Statistics
```http
GET /admin/stats/daily?days=7
```

Response:
```json
[
  {
    "date": "2024-01-20",
    "new_users": 12,
    "active_users": 87,
    "total_chats": 234,
    "total_messages": 3456,
    "total_tokens": 123456
  }
]
```

### Admin Logout

#### Logout
```http
POST /admin/logout
```

Response:
```json
{
  "message": "Logged out successfully"
}
```

## Error Handling

The API uses standard HTTP status codes and returns errors in a consistent format:

```json
{
  "detail": "Error message",
  "status": 400
}
```

### Common Error Codes

- **400 Bad Request**: Invalid request parameters or body
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User lacks admin privileges
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **422 Unprocessable Entity**: Validation error
- **500 Internal Server Error**: Server error

### Rate Limit Error Response
```json
{
  "detail": "Rate limit exceeded. Max 100 read requests per minute.",
  "status": 429
}
```

## Security Considerations

### Best Practices

1. **Token Security**
   - Store JWT tokens securely (httpOnly cookies or secure storage)
   - Implement token expiration and refresh mechanisms
   - Never log or expose tokens

2. **HTTPS Only**
   - Always use HTTPS in production
   - Enable HSTS headers

3. **Input Validation**
   - All inputs are validated by middleware
   - SQL injection protection through parameterized queries
   - XSS protection through proper encoding

4. **Audit Trail**
   - All admin actions are logged
   - Logs include timestamp, user, action, and result
   - Sensitive data is redacted from logs

5. **Rate Limiting**
   - Prevents brute force attacks
   - Ensures system stability
   - Per-user limits prevent single user abuse

### Security Headers

All admin responses include security headers:
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `Content-Security-Policy: default-src 'self'` - Restricts resource loading
- `Strict-Transport-Security` - Forces HTTPS connections

## Testing

### Running Tests

1. **Unit Tests**: Test individual middleware components
2. **Integration Tests**: Use `test_admin_api.py` and `test_admin_middleware.py`
3. **Security Tests**: Verify authentication and authorization

### Test Coverage

- Authentication and authorization
- All CRUD operations
- Rate limiting behavior
- Security pattern detection
- Error handling
- Audit logging

## Development Tips

1. **Local Development**
   - Use the provided test scripts for development
   - Monitor server logs for audit trail
   - Test with different user roles

2. **Frontend Integration**
   - CORS is configured for common development ports
   - Use the admin service module (`admin.service.ts`)
   - Handle rate limit errors gracefully

3. **Production Deployment**
   - Review and adjust rate limits
   - Set up log rotation for audit logs
   - Monitor admin activity regularly
   - Implement alerting for suspicious patterns