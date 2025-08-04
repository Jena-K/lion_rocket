# Backend Server Restart Instructions

The AsyncSession error you're experiencing is because the server is running old code. The current code has already been fixed with proper async/await syntax.

## Steps to Fix:

1. **Stop the current server**:
   - Press `Ctrl+C` in the terminal where the server is running
   - Or close the terminal window

2. **Clear Python cache** (optional but recommended):
   ```bash
   # In Windows Command Prompt or PowerShell
   cd C:\projects\lionrocket\backend
   
   # Remove Python cache files
   for /r %i in (__pycache__) do rmdir /s /q "%i"
   
   # Or in Git Bash
   find . -type d -name __pycache__ -exec rm -rf {} +
   ```

3. **Restart the server**:
   ```bash
   cd C:\projects\lionrocket\backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## What was fixed:

The old synchronous code:
```python
# This causes AttributeError with AsyncSession
user = db.query(User).filter(User.username == username).first()
```

Has been replaced with proper async code:
```python
# Correct async syntax
result = await db.execute(select(User).filter(User.username == username))
user = result.scalar_one_or_none()
```

## All async patterns in the codebase:

1. **app/core/auth.py** - ✅ Already using async/await
2. **app/routers/auth.py** - ✅ Already using async/await  
3. **app/auth/dependencies.py** - ✅ Already using async/await

The code is already fixed. You just need to restart the server to load the updated code!