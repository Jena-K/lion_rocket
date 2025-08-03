# LionRocket Production Build Script for Windows

Write-Host "🚀 Starting LionRocket Production Build..." -ForegroundColor Green

# Build timestamp
$BuildTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "Build started at: $BuildTime" -ForegroundColor Blue

# Function to handle errors
function Handle-Error {
    param($Message)
    Write-Host "Error: $Message" -ForegroundColor Red
    exit 1
}

# Create build directory
Write-Host "Creating build directories..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "build\frontend" | Out-Null
New-Item -ItemType Directory -Force -Path "build\backend" | Out-Null

# Build Frontend
Write-Host "`n=== Building Frontend ===" -ForegroundColor Green
Push-Location frontend

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Failed to install frontend dependencies"
    }
}

# Run type checking
Write-Host "Running TypeScript type checking..." -ForegroundColor Blue
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Handle-Error "TypeScript type checking failed"
}

# Build for production
Write-Host "Building frontend for production..." -ForegroundColor Blue
npm run build
if ($LASTEXITCODE -ne 0) {
    Handle-Error "Frontend build failed"
}

# Copy build output
Write-Host "Copying frontend build output..." -ForegroundColor Blue
Copy-Item -Path "dist\*" -Destination "..\build\frontend\" -Recurse -Force

Pop-Location

# Build Backend
Write-Host "`n=== Building Backend ===" -ForegroundColor Green
Push-Location backend

# Create virtual environment if it doesn't exist
if (!(Test-Path ".venv")) {
    Write-Host "Creating backend virtual environment..." -ForegroundColor Blue
    uv venv
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Failed to create virtual environment"
    }
}

# Install dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Blue
uv pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Handle-Error "Failed to install backend dependencies"
}

# Run linting
Write-Host "Running backend linting..." -ForegroundColor Blue
if (Test-Path ".venv\Scripts\ruff.exe") {
    & .venv\Scripts\ruff.exe check app
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Linting issues found" -ForegroundColor Yellow
    }
}

# Create production requirements
Write-Host "Creating production requirements..." -ForegroundColor Blue
uv pip freeze | Where-Object { $_ -notmatch "^-e" } | Out-File -FilePath "..\build\backend\requirements-prod.txt" -Encoding utf8

# Copy backend files
Write-Host "Copying backend files..." -ForegroundColor Blue
Copy-Item -Path "app" -Destination "..\build\backend\" -Recurse -Force
Copy-Item -Path "pyproject.toml" -Destination "..\build\backend\" -Force
if (Test-Path "alembic") {
    Copy-Item -Path "alembic" -Destination "..\build\backend\" -Recurse -Force
}
if (Test-Path "alembic.ini") {
    Copy-Item -Path "alembic.ini" -Destination "..\build\backend\" -Force
}

# Copy environment example files
Copy-Item -Path ".env.example" -Destination "..\build\backend\" -Force

Pop-Location

# Create deployment configuration
Write-Host "`n=== Creating Deployment Configuration ===" -ForegroundColor Green

# Create docker-compose for production
@'
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - APP_ENV=production
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
'@ | Out-File -FilePath "build\docker-compose.prod.yml" -Encoding utf8

# Create backend Dockerfile
@'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements-prod.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements-prod.txt

# Copy application
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini .

# Create data directory
RUN mkdir -p /app/data

# Run migrations and start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
'@ | Out-File -FilePath "build\backend\Dockerfile" -Encoding utf8

# Create frontend Dockerfile
@'
FROM nginx:alpine

# Copy built files
COPY . /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
'@ | Out-File -FilePath "build\frontend\Dockerfile" -Encoding utf8

# Create nginx configuration for frontend
@'
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Vue Router support
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Auth proxy
    location /auth {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
'@ | Out-File -FilePath "build\frontend\nginx.conf" -Encoding utf8

# Create build info
@"
LionRocket Production Build
Build Time: $BuildTime
Frontend: Vue 3 + TypeScript + Vite
Backend: FastAPI + SQLAlchemy + UV
"@ | Out-File -FilePath "build\BUILD_INFO.txt" -Encoding utf8

# Build summary
Write-Host "`n=== Build Summary ===" -ForegroundColor Green
Write-Host "Build Time: $BuildTime" -ForegroundColor Blue
Write-Host "Frontend Output: build\frontend\" -ForegroundColor Blue
Write-Host "Backend Output: build\backend\" -ForegroundColor Blue
Write-Host "Docker Compose: build\docker-compose.prod.yml" -ForegroundColor Blue

Write-Host "`n✨ Build completed successfully!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy build\ directory to your production server"
Write-Host "2. Set up environment variables in production"
Write-Host "3. Run: docker-compose -f docker-compose.prod.yml up -d"