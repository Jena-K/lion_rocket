# Environment Structure Documentation

## Overview
LionRocket project has been restructured to separate frontend and backend environments with isolated virtual environments and configuration files.

## Directory Structure
```
lionrocket/
├── backend/
│   ├── .venv/              # Backend virtual environment (auto-created)
│   ├── .env                # Backend environment variables
│   ├── .env.example        # Backend environment template
│   └── app/                # Backend application code
├── frontend/
│   ├── node_modules/       # Frontend dependencies (auto-installed)
│   ├── .env                # Frontend environment variables
│   ├── .env.example        # Frontend environment template
│   └── src/                # Frontend application code
├── start-dev.sh            # Unix/Linux startup script
├── start-dev.ps1           # Windows PowerShell startup script
├── start-dev.cmd           # Windows CMD startup script
├── cleanup.sh              # Unix/Linux cleanup script
├── cleanup.ps1             # Windows PowerShell cleanup script
├── cleanup.cmd             # Windows CMD cleanup script
└── run.py                  # Python-based development runner

```

## Environment Files

### Backend (.env)
Located at `backend/.env`, contains:
- Database configuration
- Security keys (JWT, SECRET_KEY)
- Claude API credentials
- Server settings
- Rate limiting configuration
- Admin credentials

### Frontend (.env)
Located at `frontend/.env`, contains:
- API URLs
- WebSocket configuration
- App settings
- Feature flags

## Startup Scripts

### For Windows Users:
```bash
# Using PowerShell
.\start-dev.ps1

# Using CMD
start-dev.cmd

# Using Python
python run.py dev
```

### For Unix/Linux/Mac Users:
```bash
# Using shell script
./start-dev.sh

# Using Python
python run.py dev
```

## Cleanup Scripts

### For Windows Users:
```bash
# Using PowerShell
.\cleanup.ps1

# Using CMD
cleanup.cmd
```

### For Unix/Linux/Mac Users:
```bash
./cleanup.sh
```

## Virtual Environment Management

### Backend
- Virtual environment is automatically created in `backend/.venv/`
- Dependencies are installed from `backend/requirements.txt`
- Uses `uv` for fast Python package management

### Frontend
- Dependencies are installed in `frontend/node_modules/`
- Uses `npm` for package management
- Automatically installs on first run

## Features

1. **Isolated Environments**: Backend and frontend have separate virtual environments
2. **Automatic Setup**: Virtual environments and dependencies are installed automatically
3. **Unified Startup**: Single command starts both services
4. **Clean Shutdown**: Ctrl+C stops all services gracefully
5. **Easy Cleanup**: Remove all generated files and caches with cleanup scripts

## Security Notes

⚠️ **Important**: The `.env` files contain sensitive information (API keys, passwords). 
- Never commit `.env` files to version control
- Use `.env.example` files as templates
- All `.env` files are already added to `.gitignore`

## Development Workflow

1. **First Time Setup**:
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd lionrocket
   
   # Copy environment templates
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit .env files with your credentials
   ```

2. **Start Development**:
   ```bash
   # Windows
   .\start-dev.ps1
   
   # Unix/Linux/Mac
   ./start-dev.sh
   ```

3. **Access Services**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

4. **Clean Up** (when needed):
   ```bash
   # Windows
   .\cleanup.ps1
   
   # Unix/Linux/Mac
   ./cleanup.sh
   ```

## Troubleshooting

### UV Not Installed
If you see "uv is not installed", run:
```bash
# Windows
.\install-uv.ps1

# Unix/Linux/Mac
./install-uv.sh
```

### Port Already in Use
If ports 8000 or 5173 are already in use:
1. Stop the conflicting service, or
2. Modify the port numbers in the respective `.env` files

### Permission Denied (Unix/Linux/Mac)
Make scripts executable:
```bash
chmod +x start-dev.sh cleanup.sh
```