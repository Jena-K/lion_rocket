#!/bin/bash

# LionRocket Development Startup Script
echo "🚀 Starting LionRocket Development Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo -e "${RED}Error: uv is not installed.${NC}"
    echo "Please run: ./install-uv.sh"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    
    # Kill backend process
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${BLUE}Backend stopped${NC}"
    fi
    
    # Kill frontend process
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${BLUE}Frontend stopped${NC}"
    fi
    
    exit 0
}

# Set trap for cleanup on exit
trap cleanup EXIT INT TERM

# Start Backend
echo -e "${GREEN}Starting Backend...${NC}"
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo -e "${BLUE}Creating backend virtual environment...${NC}"
    uv venv
fi

# Install dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
uv pip install -r requirements.txt

# Find Python executable in virtual environment
# Check multiple possible locations for cross-platform compatibility
if [ -f ".venv/Scripts/python.exe" ]; then
    # Windows path (Git Bash, MSYS, Cygwin)
    PYTHON_CMD=".venv/Scripts/python.exe"
    echo -e "${BLUE}Detected Windows environment${NC}"
elif [ -f ".venv/Scripts/python" ]; then
    # Windows path without .exe
    PYTHON_CMD=".venv/Scripts/python"
elif [ -f ".venv/bin/python" ]; then
    # Unix-like path (Linux, macOS, WSL)
    PYTHON_CMD=".venv/bin/python"
    echo -e "${BLUE}Detected Unix-like environment${NC}"
else
    echo -e "${RED}Error: Python executable not found in virtual environment${NC}"
    echo -e "${YELLOW}Recreating virtual environment...${NC}"
    rm -rf .venv
    uv venv
    
    # After recreation, check again
    if [ -f ".venv/Scripts/python.exe" ]; then
        PYTHON_CMD=".venv/Scripts/python.exe"
    elif [ -f ".venv/Scripts/python" ]; then
        PYTHON_CMD=".venv/Scripts/python"
    elif [ -f ".venv/bin/python" ]; then
        PYTHON_CMD=".venv/bin/python"
    else
        echo -e "${RED}Error: Failed to create virtual environment properly${NC}"
        exit 1
    fi
    
    # Reinstall dependencies after recreation
    echo -e "${BLUE}Reinstalling dependencies...${NC}"
    uv pip install -r requirements.txt
fi

# Start backend server
echo -e "${GREEN}Starting backend server on http://localhost:8000${NC}"
$PYTHON_CMD -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

# Wait a bit for backend to start
sleep 3

# Start Frontend
echo -e "${GREEN}Starting Frontend...${NC}"
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install
fi

# Start frontend dev server
echo -e "${GREEN}Starting frontend server on http://localhost:5173${NC}"
npm run dev &
FRONTEND_PID=$!

cd ..

# Show status
echo -e "\n${GREEN}🎉 LionRocket is running!${NC}"
echo -e "${BLUE}Backend:${NC} http://localhost:8000"
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}API Docs:${NC} http://localhost:8000/docs"
echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"

# Keep script running
wait