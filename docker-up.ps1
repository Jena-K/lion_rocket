# Docker Compose startup script for LionRocket (PowerShell)

Write-Host "Starting LionRocket with Docker Compose..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Please edit .env file with your configuration (especially CLAUDE_API_KEY)" -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

# Build and start services
Write-Host "Building and starting services..." -ForegroundColor Cyan
docker-compose up --build -d

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check service status
Write-Host "Checking service status..." -ForegroundColor Cyan
docker-compose ps

# Check if all services are running
$runningServices = docker-compose ps --services --filter "status=running" | Measure-Object -Line
$totalServices = docker-compose ps --services | Measure-Object -Line

if ($runningServices.Lines -ne $totalServices.Lines) {
    Write-Host "Some services failed to start. Showing logs..." -ForegroundColor Red
    docker-compose logs
}

Write-Host ""
Write-Host "LionRocket is starting up!" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Database: PostgreSQL on localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "To stop: docker-compose down" -ForegroundColor Yellow
Write-Host "To stop and remove data: docker-compose down -v" -ForegroundColor Yellow