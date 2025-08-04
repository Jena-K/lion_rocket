# Claude AI API Setup Guide

## Problem Identified

The Claude AI API was not working due to:
1. The `anthropic` package was commented out in `pyproject.toml`
2. The API response format didn't match what the frontend expected

## Solution Applied

### 1. Install Anthropic Package

The `anthropic` package was uncommented in `pyproject.toml`:

```toml
# Claude API
"anthropic==0.18.1",
```

To install the package, run:
```bash
cd backend
uv pip install anthropic
```

### 2. Fixed Claude Model Name

Updated the model name from `claude-3-sonnet` to `claude-3-sonnet-20240229` in `claude_service.py`.

### 3. Changed API Response Format

Modified the chat endpoint to return synchronous responses instead of using SSE:
- Frontend expects: `{user_message: {...}, ai_message: {...}}`
- Backend now returns both messages synchronously

## Testing the Integration

### 1. Check Claude Connection
```bash
cd backend
python test_claude_connection.py
```

### 2. Test Complete Chat Flow
```bash
cd backend
python test_chat_api_complete.py
```

### 3. Test from Frontend
1. Start the backend server
2. Start the frontend dev server
3. Login and select a character
4. Send a message in the chat

## Environment Variables

Make sure the Claude API key is set in one of these ways:
1. In `backend/.env` file:
   ```
   CLAUDE_API_KEY=sk-ant-api03-...
   ```
2. Or in `backend/app/core/config.py` (not recommended for production)

## Troubleshooting

### If API calls fail:
1. Check if the API key is valid
2. Verify the anthropic package is installed: `uv pip list | grep anthropic`
3. Check backend logs for specific error messages
4. Ensure you have internet connectivity for API calls

### Common Errors:
- **"AI 서비스에 일시적인 문제가 있어..."**: API key is invalid or package not installed
- **Timeout errors**: API response taking too long, check internet connection
- **Model not found**: Update to a valid Claude model name

## Security Notes

⚠️ **Important**: The API key is currently hardcoded in `config.py`. For production:
1. Move the API key to environment variables only
2. Never commit API keys to version control
3. Use a secure key management system