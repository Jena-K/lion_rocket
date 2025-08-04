# Admin Login Implementation Guide

## Overview
This document describes the complete implementation of the admin login functionality for LionRocket, including backend API, frontend integration, and middleware configuration.

## Implementation Details

### 1. Backend Implementation

#### Admin Login Schema
Added to `backend/app/schemas/user.py`:
```python
class AdminLogin(BaseModel):
    """Schema for admin login request"""
    adminId: str = Field(..., min_length=3, max_length=50, description="Admin username")
    password: str = Field(..., min_length=6)
```

#### Admin Login Endpoint
Added to `backend/app/routers/auth.py`:
```python
@auth_router.post("/auth/admin/login")
```
- Validates admin credentials (adminId and password)
- Verifies user has `is_admin=True` 
- Returns JWT token with user information
- Returns 403 Forbidden if user is not an admin

### 2. Frontend Implementation

#### Auth Store Updates
Added to `frontend/src/stores/auth.ts`:
- New `AdminLoginCredentials` interface
- New `adminLogin` method that calls `/auth/admin/login` endpoint
- Validates response to ensure user is admin
- Shows Korean success notification

#### Admin Login View Updates
Updated `frontend/src/views/AdminLoginView.vue`:
- Replaced mock authentication with real API call
- Added error handling with notification system
- Maintains "Remember Me" functionality
- Redirects to admin dashboard on success

### 3. Middleware Integration

The admin authentication uses the existing middleware stack:
- **JWT Authentication**: OAuth2PasswordBearer scheme
- **Admin Verification**: `require_admin` dependency checks `is_admin` flag
- **CORS**: Configured to allow frontend from localhost:5173
- **Rate Limiting**: Applied to prevent brute force attacks

## Testing Instructions

### 1. Create Admin User
First, create an admin user in the database:

```python
# Using the test script
python backend/test_admin_login.py

# Or manually via SQL
INSERT INTO users (username, email, password_hash, is_admin) 
VALUES ('admin', 'admin@lionrocket.com', '<hashed_password>', true);
```

### 2. Start Services
```bash
# Backend (port 8000)
cd backend
uvicorn app.main:app --reload

# Frontend (port 5173)
cd frontend
npm run dev
```

### 3. Test Admin Login
1. Navigate to http://localhost:5173/admin/login
2. Enter admin credentials:
   - Admin ID: `admin`
   - Password: `[your_admin_password]`
3. Click "관리자 로그인" button
4. Should redirect to `/admin/dashboard` on success

### 4. Verify Authentication
- Check browser DevTools for JWT token in localStorage
- Verify API calls include `Authorization: Bearer <token>` header
- Test admin-only endpoints (e.g., `/admin/users`)

## Security Considerations

1. **Password Requirements**:
   - Minimum 6 characters (configurable)
   - Validated by `validate_password` function

2. **Admin Verification**:
   - Double-checks `is_admin` flag in both endpoint and frontend
   - Separate endpoint prevents regular users from attempting admin login

3. **Token Security**:
   - JWT tokens expire after 24 hours
   - Tokens stored in localStorage (consider httpOnly cookies for production)

4. **Error Messages**:
   - Generic error messages to prevent user enumeration
   - Detailed errors logged server-side only

## API Documentation

### Admin Login Endpoint
```
POST /auth/admin/login
Content-Type: application/json

Request Body:
{
  "adminId": "admin",
  "password": "password123"
}

Success Response (200 OK):
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@lionrocket.com",
    "is_admin": true,
    "created_at": "2024-01-01T00:00:00"
  }
}

Error Responses:
- 401 Unauthorized: Invalid credentials
- 403 Forbidden: User is not an admin
- 422 Unprocessable Entity: Validation error
```

## Troubleshooting

1. **CORS Issues**:
   - Ensure frontend URL is in `ALLOWED_ORIGINS` in backend config
   - Check proxy configuration in `vite.config.ts`

2. **Authentication Failures**:
   - Verify user exists with `is_admin=True`
   - Check password hash is correct
   - Ensure JWT secret keys match

3. **Frontend Errors**:
   - Check browser console for error messages
   - Verify API base URL in axios configuration
   - Ensure auth store is properly initialized

## Future Enhancements

1. Add two-factor authentication for admin accounts
2. Implement session management and logout from all devices
3. Add admin activity logging
4. Consider using httpOnly cookies for token storage
5. Add password reset functionality for admins