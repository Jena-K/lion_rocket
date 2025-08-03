# LionRocket Backend

FastAPI-based backend service for the LionRocket AI Chat application.

## Overview

This is a standalone Python backend using:
- **FastAPI** for the REST API framework
- **SQLAlchemy** for database ORM
- **UV** for fast Python package management
- **SQLite** for local development database
- **Anthropic Claude API** for AI chat functionality

## Project Structure

```
backend/
├── .venv/              # Virtual environment (auto-created)
├── .env                # Environment variables (create from .env.example)
├── app/
│   ├── api/           # API endpoints
│   ├── auth/          # Authentication logic
│   ├── core/          # Core configuration
│   ├── middleware/    # Custom middleware
│   ├── models.py      # Database models
│   ├── schemas.py     # Pydantic schemas
│   ├── services/      # Business logic
│   └── main.py        # FastAPI application
├── tests/             # Test files
├── alembic/           # Database migrations
├── pyproject.toml     # Project configuration
├── requirements.txt   # Production dependencies
├── dev.sh            # Unix/Linux dev script
├── dev.ps1           # Windows PowerShell dev script
├── dev.cmd           # Windows CMD dev script
└── manage.py         # Management commands
```

## Quick Start

### Prerequisites
- Python 3.11+
- UV package manager ([install guide](https://github.com/astral-sh/uv))

### Setup

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**

   **Windows (PowerShell):**
   ```powershell
   .\dev.ps1
   ```

   **Windows (CMD):**
   ```cmd
   dev.cmd
   ```

   **Unix/Linux/Mac:**
   ```bash
   ./dev.sh
   ```

The server will start at http://localhost:8000 with API docs at http://localhost:8000/docs

## Development

### Virtual Environment

The virtual environment is created automatically in `backend/.venv/` when you run the dev scripts. UV manages all Python dependencies within this isolated environment.

### Manual Setup

If you prefer manual setup:

```bash
# Create virtual environment
uv venv

# Install dependencies
uv pip install -r requirements.txt
uv pip install -e .

# Install dev dependencies
uv pip install --dev

# Run migrations
.venv/bin/alembic upgrade head  # or .venv\Scripts\alembic.exe on Windows

# Start server
.venv/bin/python -m uvicorn app.main:app --reload
```

### Management Commands

Use `manage.py` for common tasks:

```bash
# Install all dependencies
python manage.py install

# Run tests
python manage.py test

# Run linting
python manage.py lint

# Format code
python manage.py format

# Run migrations
python manage.py migrate

# Create new migration
python manage.py migrate --create "Add user preferences"
```

### Environment Variables

Key environment variables (see `.env.example` for full list):

- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: Application secret key
- `CLAUDE_API_KEY`: Anthropic Claude API key
- `JWT_SECRET`: JWT token secret
- `DEBUG`: Enable debug mode

### API Endpoints

Main endpoint groups:
- `/auth/*` - Authentication (login, register, token refresh)
- `/api/chat/*` - Chat functionality
- `/api/characters/*` - Character management
- `/api/prompts/*` - Prompt templates
- `/api/admin/*` - Admin functions

See http://localhost:8000/docs for interactive API documentation.

## Testing

Run tests with:
```bash
python manage.py test
# or
.venv/bin/pytest
```

## Code Quality

The project uses:
- **Black** for code formatting
- **Ruff** for linting
- **MyPy** for type checking

Run all checks:
```bash
python manage.py lint
python manage.py format
```

## Deployment

For production deployment:

1. Set production environment variables
2. Use proper database (PostgreSQL recommended)
3. Run with production ASGI server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

See the main project README for Docker deployment options.

## Troubleshooting

### Common Issues

1. **UV not found**: Install UV from https://github.com/astral-sh/uv
2. **Port already in use**: Change port in dev script or kill existing process
3. **Database errors**: Delete `data/` folder and run migrations again
4. **Import errors**: Ensure you're using the virtual environment

### Development Tips

- The virtual environment is isolated within the backend directory
- All Python commands should use the `.venv` Python interpreter
- UV caches packages for fast reinstallation
- Hot reload is enabled in development mode