# Backend Structure - Modernized Setup

## Overview

The backend has been restructured as a completely standalone Python project with its own isolated environment. This follows modern Python development best practices for monorepo structures.

## Key Changes

### 1. Isolated Environment
- **Before**: Shared UV workspace at project root
- **After**: Dedicated `backend/.venv/` virtual environment
- **Benefit**: Complete isolation from other project components

### 2. Standalone Configuration
- **Location**: `backend/pyproject.toml`
- **Features**: 
  - Self-contained dependency management
  - Independent build configuration
  - Isolated development tools

### 3. Directory Structure
```
lionrocket/
├── backend/                    # Standalone backend project
│   ├── .venv/                 # Isolated virtual environment
│   ├── .env                   # Backend-specific environment
│   ├── pyproject.toml         # Backend project configuration
│   ├── requirements.txt       # Production dependencies
│   ├── dev.sh/ps1/cmd        # Development scripts
│   ├── manage.py             # Management commands
│   └── app/                  # Application code
├── frontend/                  # Separate frontend project
└── [root scripts]            # Project-wide scripts

```

## Development Workflow

### Backend-Only Development

Work directly in the backend directory:

```bash
cd backend
./dev.sh  # or dev.ps1 on Windows
```

This provides:
- Isolated Python environment
- Fast dependency installation with UV
- Hot reload development server
- No interference with frontend

### Full-Stack Development

From project root:

```bash
./start-dev.sh  # or start-dev.ps1 on Windows
```

This:
- Starts both frontend and backend
- Uses backend's isolated environment
- Maintains service coordination

## Benefits of New Structure

1. **Independence**: Backend can be developed, tested, and deployed separately
2. **Clarity**: Clear separation of concerns between services
3. **Flexibility**: Easy to add more services or switch technologies
4. **Performance**: UV caching works per-project for faster installs
5. **Portability**: Backend folder can be moved to separate repository if needed

## Migration Notes

### For Existing Developers

1. Root-level `pyproject.toml` and `uv.lock` have been removed
2. All Python dependencies are now in `backend/requirements.txt`
3. Virtual environment is at `backend/.venv/` not `.venv/`
4. Run UV commands from within the backend directory

### Commands Mapping

| Old Command | New Command |
|-------------|-------------|
| `uv pip install` (root) | `cd backend && uv pip install` |
| `python run.py dev` | `python run.py dev` (unchanged) |
| N/A | `cd backend && ./dev.sh` (backend only) |

## Best Practices

1. **Always use UV** within the backend directory
2. **Keep dependencies** in `pyproject.toml` for development
3. **Use manage.py** for common backend tasks
4. **Commit uv.lock** in backend for reproducible builds
5. **Environment files** stay in their respective directories

## Tool Versions

- Python: 3.11+
- UV: Latest version
- FastAPI: 0.109.0
- SQLAlchemy: 2.0.25

This structure provides a clean, maintainable, and scalable foundation for the LionRocket backend service.