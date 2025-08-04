# Admin User Management Test Guide

This guide helps you test the admin user management functionality after implementing real API integration.

## Prerequisites

1. **Backend Server Running**
   ```bash
   cd backend
   uvicorn app.main:main --reload
   ```

2. **Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Admin Account**
   - Username: `admin` (or whatever was set during initial setup)
   - Password: `adminpass123` (or your configured password)

## Test Scenarios

### 1. User List Loading
- Navigate to `/admin/dashboard/users`
- Verify that the user list loads automatically
- Check that pagination works correctly
- Confirm that user data (username, email, admin status, etc.) displays correctly

### 2. Search Functionality
- Type a username or email in the search box
- Verify that search is debounced (waits 500ms before searching)
- Check that results update correctly
- Test clearing the search to show all users again

### 3. Toggle Admin Status
- Find a non-admin user in the list
- Click the star/admin icon button
- Verify the success notification appears
- Check that the user's badge changes from "일반 사용자" to "관리자"
- Try toggling back to verify it works both ways
- Note: You cannot toggle your own admin status (button should be disabled)

### 4. Delete User
- Click the trash icon on a user row
- Verify the confirmation modal appears
- Click "취소" to test cancellation
- Click the trash icon again and click "삭제" to confirm
- Verify success notification appears
- Check that the user is removed from the list
- If deleting the last user on a page, verify it goes to the previous page

### 5. Error Handling
- Stop the backend server
- Try to perform any action (search, toggle admin, delete)
- Verify that error notifications appear
- Restart the backend and verify functionality resumes

### 6. Authentication
- Log out from the admin account
- Try to access `/admin/dashboard/users` directly
- Verify you're redirected to login
- Log in as a non-admin user (if available)
- Try to access the admin page - should be denied

## Implementation Changes Summary

1. **Removed Mock Data**
   - Deleted `generateMockUsers()` function
   - Removed `allMockUsers` ref

2. **Updated API Calls**
   - `fetchUsers()` now calls `adminService.getUsers()`
   - `toggleAdmin()` calls `adminService.toggleAdminStatus()`
   - `deleteUser()` calls `adminService.deleteUser()`

3. **Added Improvements**
   - Debounced search (500ms delay)
   - Proper error handling with console logging
   - Notification system integration (replaced alerts)
   - Better pagination handling when deleting users

4. **Security Features**
   - Authentication token automatically added by axios interceptor
   - Admin-only middleware on backend protects endpoints
   - Cannot modify your own admin status

## Troubleshooting

### "Network Error" or Connection Refused
- Ensure backend is running on port 8000
- Check CORS configuration allows your frontend URL
- Verify `VITE_API_URL` in `.env` or that default is correct

### 401 Unauthorized
- Your session may have expired
- Log out and log in again
- Check that you're logged in as an admin user

### 403 Forbidden
- The account doesn't have admin privileges
- Use the correct admin account

### Empty User List
- Check if there are users in the database
- Run the seed script if needed
- Check browser console for API errors

## Next Steps

1. Add user creation functionality
2. Implement user editing (email, password reset)
3. Add bulk operations (select multiple users)
4. Implement advanced filters (by date, status, etc.)
5. Add export functionality (CSV, Excel)
6. Implement real-time updates with WebSocket