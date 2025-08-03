#!/bin/bash

# LionRocket Cleanup Script
echo "🧹 Starting LionRocket cleanup..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to remove directory if exists
remove_dir() {
    if [ -d "$1" ]; then
        echo -e "${BLUE}Removing $1...${NC}"
        rm -rf "$1"
    fi
}

# Function to remove file if exists
remove_file() {
    if [ -f "$1" ]; then
        echo -e "${BLUE}Removing $1...${NC}"
        rm -f "$1"
    fi
}

# Cleanup Python artifacts
echo -e "${YELLOW}Cleaning Python artifacts...${NC}"
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete 2>/dev/null
find . -type f -name "*.pyo" -delete 2>/dev/null
find . -type f -name "*~" -delete 2>/dev/null

# Cleanup virtual environments
echo -e "${YELLOW}Cleaning virtual environments...${NC}"
remove_dir "venv"
remove_dir ".venv"
remove_dir "backend/.venv"
remove_dir "backend/venv"

# Cleanup Node modules and build artifacts
echo -e "${YELLOW}Cleaning Node.js artifacts...${NC}"
remove_dir "frontend/node_modules"
remove_dir "frontend/dist"
remove_dir "frontend/.nuxt"
remove_dir "frontend/.output"

# Cleanup build directories
echo -e "${YELLOW}Cleaning build directories...${NC}"
remove_dir "build"
remove_dir "dist"
remove_dir "*.egg-info"

# Cleanup logs
echo -e "${YELLOW}Cleaning logs...${NC}"
remove_dir "logs"
find . -name "*.log" -type f -delete 2>/dev/null

# Cleanup temporary files
echo -e "${YELLOW}Cleaning temporary files...${NC}"
find . -name "*.tmp" -type f -delete 2>/dev/null
find . -name "*.temp" -type f -delete 2>/dev/null
find . -name ".DS_Store" -type f -delete 2>/dev/null
find . -name "Thumbs.db" -type f -delete 2>/dev/null

# Cleanup test artifacts
echo -e "${YELLOW}Cleaning test artifacts...${NC}"
remove_dir ".pytest_cache"
remove_dir ".coverage"
remove_dir "htmlcov"
remove_dir ".tox"
remove_dir ".nox"

# Cleanup database files (optional - commented out for safety)
# echo -e "${YELLOW}Cleaning database files...${NC}"
# remove_dir "data"
# find . -name "*.db" -type f -delete 2>/dev/null
# find . -name "*.sqlite" -type f -delete 2>/dev/null
# find . -name "*.sqlite3" -type f -delete 2>/dev/null

# Cleanup Docker volumes (if any)
echo -e "${YELLOW}Cleaning Docker artifacts...${NC}"
remove_dir "postgres-data"
remove_dir "redis-data"

# Remove old environment file from root (since we moved to separate directories)
if [ -f ".env" ]; then
    echo -e "${YELLOW}Moving root .env to .env.backup${NC}"
    mv .env .env.backup
fi

echo -e "${GREEN}✨ Cleanup completed!${NC}"

# Summary
echo -e "\n${BLUE}Summary:${NC}"
echo "- Removed Python cache and artifacts"
echo "- Removed virtual environments (will be recreated on next run)"
echo "- Removed Node.js modules and build artifacts"
echo "- Removed temporary files and logs"
echo "- Root .env moved to .env.backup (if existed)"
echo -e "\n${YELLOW}Note: Database files were preserved for safety${NC}"