# Backend Development Script for Windows

Write-Host "🚀 Starting LionRocket Backend Development Environment..." -ForegroundColor Green

# Check if uv is installed
try {
    $null = Get-Command uv -ErrorAction Stop
} catch {
    Write-Host "Error: uv is not installed." -ForegroundColor Red
    Write-Host "Please install uv first: https://github.com/astral-sh/uv"
    exit 1
}

# Create virtual environment if it doesn't exist
if (!(Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Blue
    uv venv
}

# Install all dependencies (including dev)
Write-Host "Installing dependencies..." -ForegroundColor Blue
uv sync

# Load environment variables from .env file
if (Test-Path ".env") {
    Write-Host "Loading environment variables..." -ForegroundColor Blue
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, [System.EnvironmentVariableTarget]::Process)
        }
    }
}

# Run database migrations
Write-Host "Running database migrations..." -ForegroundColor Blue
if (Test-Path "alembic.ini") {
    & .venv\Scripts\alembic.exe upgrade head
    if ($LASTEXITCODE -ne 0) {
        Write-Host "No migrations to run" -ForegroundColor Yellow
    }
}

# Start the backend server
Write-Host "Starting backend server on http://localhost:8000" -ForegroundColor Green
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Blue
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

& .venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000