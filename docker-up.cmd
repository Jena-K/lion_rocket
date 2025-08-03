@echo off
REM Docker Compose startup script for LionRocket (Windows CMD)

echo Starting LionRocket with Docker Compose...

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please edit .env file with your configuration (especially CLAUDE_API_KEY)
    echo Then run this script again.
    exit /b 1
)

REM Build and start services
echo Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service status
echo Checking service status...
docker-compose ps

echo.
echo LionRocket is starting up!
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:5173
echo Database: PostgreSQL on localhost:5432
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo To stop and remove data: docker-compose down -v