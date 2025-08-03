#!/bin/bash

# LionRocket Production Build Script
echo "🚀 Starting LionRocket Production Build..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Build timestamp
BUILD_TIME=$(date +"%Y-%m-%d %H:%M:%S")
echo -e "${BLUE}Build started at: $BUILD_TIME${NC}"

# Function to handle errors
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    exit 1
}

# Create build directory
echo -e "${GREEN}Creating build directories...${NC}"
mkdir -p build/frontend
mkdir -p build/backend

# Build Frontend
echo -e "\n${GREEN}=== Building Frontend ===${NC}"
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install || handle_error "Failed to install frontend dependencies"
fi

# Run type checking
echo -e "${BLUE}Running TypeScript type checking...${NC}"
npm run type-check || handle_error "TypeScript type checking failed"

# Build for production
echo -e "${BLUE}Building frontend for production...${NC}"
npm run build || handle_error "Frontend build failed"

# Copy build output
echo -e "${BLUE}Copying frontend build output...${NC}"
cp -r dist/* ../build/frontend/ || handle_error "Failed to copy frontend build"

cd ..

# Build Backend
echo -e "\n${GREEN}=== Building Backend ===${NC}"
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo -e "${BLUE}Creating backend virtual environment...${NC}"
    uv venv || handle_error "Failed to create virtual environment"
fi

# Install dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
uv pip install -r requirements.txt || handle_error "Failed to install backend dependencies"

# Run linting
echo -e "${BLUE}Running backend linting...${NC}"
if [ -f ".venv/Scripts/ruff.exe" ]; then
    .venv/Scripts/ruff check app || echo -e "${YELLOW}Warning: Linting issues found${NC}"
elif [ -f ".venv/bin/ruff" ]; then
    .venv/bin/ruff check app || echo -e "${YELLOW}Warning: Linting issues found${NC}"
fi

# Create production requirements
echo -e "${BLUE}Creating production requirements...${NC}"
uv pip freeze | grep -v "^-e" > ../build/backend/requirements-prod.txt

# Copy backend files
echo -e "${BLUE}Copying backend files...${NC}"
cp -r app ../build/backend/
cp pyproject.toml ../build/backend/
cp -r alembic ../build/backend/ 2>/dev/null || true
cp alembic.ini ../build/backend/ 2>/dev/null || true

# Copy environment example files
cp .env.example ../build/backend/

cd ..

# Create deployment configuration
echo -e "\n${GREEN}=== Creating Deployment Configuration ===${NC}"

# Create docker-compose for production
cat > build/docker-compose.prod.yml << 'EOF'
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
EOF

# Create backend Dockerfile
cat > build/backend/Dockerfile << 'EOF'
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
EOF

# Create frontend Dockerfile
cat > build/frontend/Dockerfile << 'EOF'
FROM nginx:alpine

# Copy built files
COPY . /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

# Create nginx configuration for frontend
cat > build/frontend/nginx.conf << 'EOF'
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
EOF

# Create build info
cat > build/BUILD_INFO.txt << EOF
LionRocket Production Build
Build Time: $BUILD_TIME
Frontend: Vue 3 + TypeScript + Vite
Backend: FastAPI + SQLAlchemy + UV
EOF

# Build summary
echo -e "\n${GREEN}=== Build Summary ===${NC}"
echo -e "${BLUE}Build Time:${NC} $BUILD_TIME"
echo -e "${BLUE}Frontend Output:${NC} build/frontend/"
echo -e "${BLUE}Backend Output:${NC} build/backend/"
echo -e "${BLUE}Docker Compose:${NC} build/docker-compose.prod.yml"

echo -e "\n${GREEN}✨ Build completed successfully!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Copy build/ directory to your production server"
echo "2. Set up environment variables in production"
echo "3. Run: docker-compose -f docker-compose.prod.yml up -d"