# Claude Model Name Fix Guide

## Issue
The model name `claude-3-sonnet-20240229` returns a 404 error, indicating it's not available with the current API key or SDK version.

## Solution Steps

### 1. Update Anthropic Package
The issue might be due to using an older version of the anthropic SDK (0.18.1). Update to the latest version:

```bash
cd backend
uv pip install anthropic --upgrade
```

### 2. Use Correct Model Names

Based on the anthropic SDK version and API key type, use one of these model names:

#### For Latest SDK (0.25.0+):
- `claude-3-haiku-20240307` - Fastest and most cost-effective Claude 3 model (default)
- `claude-3-opus-20240229` - Most capable Claude 3 model
- `claude-3-5-sonnet-20241022` - Latest Claude 3.5 Sonnet

#### For Older SDK or Legacy Keys:
- `claude-2.1` - Stable Claude 2.1 model
- `claude-2.0` - Claude 2.0 model
- `claude-instant-1.2` - Fast, cost-effective model

### 3. Test Models
Run the test scripts to find which models work with your API key:

```bash
# Test different model names
python test_claude_models.py

# Simple test with common models
python test_claude_simple.py

# Check anthropic version
python check_anthropic_version.py
```

### 4. Update claude_service.py

Once you find a working model, update the service:

```python
self.model = "claude-3-haiku-20240307"  # Using Haiku for fast and cost-effective responses
```

### 5. Verify API Key Type

Some API keys only have access to certain models:
- Legacy keys: May only support Claude 2.x models
- New keys: Support Claude 3 family
- Trial keys: May have limited model access

### 6. Complete Testing

After updating:
1. Restart the backend server
2. Run `python test_claude_connection.py`
3. Test chat functionality in the frontend

## Troubleshooting

### If all models fail with 404:
1. Your API key might be invalid or expired
2. Check if the key starts with `sk-ant-api03-`
3. Try generating a new API key from Anthropic Console

### If authentication fails:
1. Verify the API key is correctly set in `.env` or `config.py`
2. Check for any whitespace or quotes around the key
3. Ensure the key hasn't been revoked

### If models work in test but not in app:
1. Check if anthropic package is properly installed: `uv pip list | grep anthropic`
2. Restart the backend server completely
3. Check for any import errors in the logs