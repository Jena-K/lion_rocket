# Admin API Testing Guide

This guide explains how to test the admin API endpoints that have been implemented.

## Prerequisites

1. Make sure the database is running (PostgreSQL)
2. Admin user must exist with credentials: `admin` / `lemonT104!`

## Starting the Server

```bash
# From the backend directory
python run_server.py

# Or using uvicorn directly
uvicorn app.main:app --reload
```

## Running Admin Tests

1. **Ensure the server is running** on http://localhost:8000

2. **Run the admin test script**:
```bash
python test_admin_api.py
```

This will test all admin endpoints including:
- Admin login
- User management (list, update, toggle admin, delete)
- Character management (list, create, update, toggle active, delete)
- Dashboard statistics (system overview, character stats, usage by date)

## Admin Endpoints Overview

### Authentication
- `POST /api/auth/admin/login` - Admin login with adminId and password

### User Management
- `GET /api/admin/users` - Get all users with pagination
- `PUT /api/admin/users/{user_id}` - Update user information
- `POST /api/admin/users/{user_id}/toggle-admin` - Toggle admin status
- `DELETE /api/admin/users/{user_id}` - Delete user and all related data
- `GET /api/admin/users/{user_id}/chats` - Get user's chat history
- `GET /api/admin/users/{user_id}/usage` - Get user's usage statistics

### Character Management
- `GET /api/admin/characters` - Get all characters with filtering
- `POST /api/admin/characters` - Create new character
- `PUT /api/admin/characters/{character_id}` - Update character
- `POST /api/admin/characters/{character_id}/toggle-active` - Toggle active status
- `DELETE /api/admin/characters/{character_id}` - Delete character

### Dashboard & Statistics
- `GET /api/admin/stats/overview` - System-wide statistics
- `GET /api/admin/dashboard/character-stats` - Character-wise statistics
- `GET /api/admin/dashboard/usage-by-date` - Daily usage trends

## Manual Testing with cURL

### Admin Login
```bash
curl -X POST http://localhost:8000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"adminId": "admin", "password": "lemonT104!"}'
```

Save the token from the response and use it in subsequent requests.

### Get All Users (with token)
```bash
curl -X GET http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Character
```bash
curl -X POST http://localhost:8000/api/admin/characters \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Character",
    "gender": "female",
    "intro": "안녕하세요!",
    "personality_tags": ["친절한", "활발한"],
    "interest_tags": ["음악", "영화"],
    "prompt": "You are a friendly character."
  }'
```

## Notes

1. **Admin Logout**: Currently handled client-side by removing the token. The token remains valid until it expires.

2. **Token Expiration**: Tokens expire after the configured duration (default: 24 hours).

3. **Admin Permissions**: Only users with `is_admin=true` can access these endpoints.

4. **Data Cascade**: Deleting users or characters will cascade delete all related data (chats, messages, etc.).

## Troubleshooting

1. **Connection Refused**: Make sure the server is running on port 8000
2. **401 Unauthorized**: Check that you're using a valid admin token
3. **403 Forbidden**: Ensure the user has admin privileges
4. **404 Not Found**: Verify the endpoint URL and that the resource exists