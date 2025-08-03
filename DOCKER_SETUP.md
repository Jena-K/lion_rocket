# Docker Setup Guide for LionRocket

This guide explains how to run the LionRocket project using Docker Compose with Python 3.11.0.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose (included with Docker Desktop)
- Git

## Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd lionrocket
```

### 2. Set up environment variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Claude API key
# CLAUDE_API_KEY=your-actual-api-key-here
```

### 3. Start the application

**Using the helper scripts:**

Windows (PowerShell):
```powershell
.\docker-up.ps1
```

Linux/Mac:
```bash
chmod +x docker-up.sh
./docker-up.sh
```

**Or manually with docker-compose:**
```bash
docker-compose up --build
```

## Services

The Docker Compose setup includes the following services:

### 1. PostgreSQL Database (`db`)
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Credentials**: postgres/postgres (configurable via .env)
- **Database**: lionrocket

### 2. Backend API (`backend`)
- **Python**: 3.11.0
- **Package Manager**: UV (Astral)
- **Framework**: FastAPI
- **Port**: 8000
- **URL**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

### 3. Frontend (`frontend`)
- **Node**: 20-alpine
- **Framework**: Vue 3 + Vite
- **Port**: 5173
- **URL**: http://localhost:5173

### 4. pgAdmin (development only)
- **Port**: 5050
- **URL**: http://localhost:5050
- **Email**: admin@lionrocket.com
- **Password**: admin

### 5. Nginx (production profile)
- **Port**: 80
- **URL**: http://localhost

## Environment Variables

Key environment variables (configure in `.env`):

```env
# Backend
CLAUDE_API_KEY=your-claude-api-key
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://postgres:postgres@db:5432/lionrocket

# Frontend
VITE_API_BASE_URL=http://localhost:8000

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=lionrocket

# pgAdmin (development)
PGADMIN_EMAIL=admin@lionrocket.com
PGADMIN_PASSWORD=admin
```

## Common Commands

### Start all services
```bash
docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop services
```bash
# Stop services (preserves data)
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### Rebuild services
```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build backend
```

### Access service shells
```bash
# Backend shell
docker-compose exec backend bash

# Frontend shell
docker-compose exec frontend sh

# Database shell
docker-compose exec db psql -U postgres -d lionrocket
```

### Run database migrations
```bash
docker-compose exec backend python manage.py migrate
```

### Run tests
```bash
# Backend tests
docker-compose exec backend pytest

# Frontend tests
docker-compose exec frontend npm test
```

## Development Workflow

1. **Hot Reload**: Both backend and frontend support hot reload in development mode
2. **Volume Mounts**: Source code is mounted, so changes are reflected immediately
3. **Database Persistence**: PostgreSQL data persists in Docker volumes
4. **pgAdmin**: Access at http://localhost:5050 for database management

### Adding Python Dependencies

Using UV in the backend container:
```bash
docker-compose exec backend uv pip install <package>
docker-compose exec backend uv pip freeze > requirements.txt
```

### Adding Node Dependencies

```bash
docker-compose exec frontend npm install <package>
```

## Production Deployment

For production, use the production profile:

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start with production profile
docker-compose --profile production up -d
```

This will:
- Use optimized production builds
- Enable Nginx reverse proxy
- Disable development features (hot reload, debug mode)
- Use production environment variables

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Database connection issues
```bash
# Check if database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Test connection
docker-compose exec db pg_isready
```

### Port conflicts
If ports are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Change host port
```

### Permission issues
```bash
# Fix ownership (Linux/Mac)
sudo chown -R $USER:$USER .
```

## Architecture

```
lionrocket/
├── docker-compose.yml          # Main compose file
├── docker-compose.override.yml # Development overrides
├── docker-compose.prod.yml     # Production overrides
├── .env.example               # Environment template
├── backend/
│   ├── Dockerfile            # Python 3.11.0 + UV
│   ├── pyproject.toml        # Python dependencies
│   └── app/                  # FastAPI application
├── frontend/
│   ├── Dockerfile            # Node.js development
│   ├── Dockerfile.prod       # Nginx production
│   ├── nginx.conf           # Nginx configuration
│   └── src/                 # Vue application
└── nginx/
    └── nginx.conf           # Main proxy configuration
```

## Security Notes

1. **Change default passwords** in production
2. **Use strong SECRET_KEY** for JWT tokens
3. **Configure ALLOWED_ORIGINS** for CORS
4. **Use HTTPS** in production (configure in Nginx)
5. **Never commit .env** file with real credentials

## Support

For issues:
1. Check service logs: `docker-compose logs -f [service]`
2. Verify environment variables in `.env`
3. Ensure Docker daemon is running
4. Check system resources (disk space, memory)