#!/bin/bash

# Backend Development Script
echo "🚀 Starting LionRocket Backend Development Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo -e "${RED}Error: uv is not installed.${NC}"
    echo "Please install uv first: https://github.com/astral-sh/uv"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo -e "${BLUE}Creating virtual environment...${NC}"
    uv venv
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
uv pip install -r requirements.txt
uv pip install -e .

# Install dev dependencies
echo -e "${BLUE}Installing dev dependencies...${NC}"
uv pip install --dev

# Run database migrations
echo -e "${BLUE}Running database migrations...${NC}"
if [ -f "alembic.ini" ]; then
    .venv/bin/alembic upgrade head || echo -e "${YELLOW}No migrations to run${NC}"
fi

# Find Python executable
if [ -f ".venv/Scripts/python.exe" ]; then
    PYTHON_CMD=".venv/Scripts/python.exe"
elif [ -f ".venv/Scripts/python" ]; then
    PYTHON_CMD=".venv/Scripts/python"
elif [ -f ".venv/bin/python" ]; then
    PYTHON_CMD=".venv/bin/python"
else
    echo -e "${RED}Error: Python executable not found${NC}"
    exit 1
fi

# Start the backend server
echo -e "${GREEN}Starting backend server on http://localhost:8000${NC}"
echo -e "${BLUE}API Documentation: http://localhost:8000/docs${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"

$PYTHON_CMD -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000