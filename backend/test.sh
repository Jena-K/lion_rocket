#!/bin/bash

# Backend E2E Test Runner Script
echo "🧪 Running LionRocket Backend E2E Tests..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo -e "${RED}Error: Virtual environment not found.${NC}"
    echo "Please run ./dev.sh first to set up the environment."
    exit 1
fi

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
if [ -f ".venv/Scripts/activate" ]; then
    source .venv/Scripts/activate
elif [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
else
    echo -e "${RED}Error: Could not find activation script${NC}"
    exit 1
fi

# Set test environment variables
export TESTING=true
export DATABASE_URL="sqlite:///:memory:"
export CLAUDE_API_KEY="test-api-key"
export JWT_SECRET="test-secret-key-for-jwt"

# Parse command line arguments
PYTEST_ARGS=""
RUN_COVERAGE=false
RUN_SPECIFIC=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage)
            RUN_COVERAGE=true
            shift
            ;;
        --e2e)
            PYTEST_ARGS="$PYTEST_ARGS -m e2e"
            shift
            ;;
        --unit)
            PYTEST_ARGS="$PYTEST_ARGS -m unit"
            shift
            ;;
        --auth)
            PYTEST_ARGS="$PYTEST_ARGS -m auth"
            shift
            ;;
        --crud)
            PYTEST_ARGS="$PYTEST_ARGS -m crud"
            shift
            ;;
        --integration)
            PYTEST_ARGS="$PYTEST_ARGS -m integration"
            shift
            ;;
        --slow)
            PYTEST_ARGS="$PYTEST_ARGS -m slow"
            shift
            ;;
        --file)
            RUN_SPECIFIC="$2"
            shift 2
            ;;
        -v|--verbose)
            PYTEST_ARGS="$PYTEST_ARGS -v"
            shift
            ;;
        -x|--exitfirst)
            PYTEST_ARGS="$PYTEST_ARGS -x"
            shift
            ;;
        *)
            echo -e "${YELLOW}Unknown option: $1${NC}"
            shift
            ;;
    esac
done

# Run tests
echo -e "${BLUE}Running tests...${NC}"

if [ "$RUN_COVERAGE" = true ]; then
    echo -e "${GREEN}Running with coverage report...${NC}"
    if [ -n "$RUN_SPECIFIC" ]; then
        pytest "$RUN_SPECIFIC" $PYTEST_ARGS
    else
        pytest $PYTEST_ARGS
    fi
else
    echo -e "${GREEN}Running without coverage...${NC}"
    if [ -n "$RUN_SPECIFIC" ]; then
        pytest "$RUN_SPECIFIC" $PYTEST_ARGS --no-cov
    else
        pytest $PYTEST_ARGS --no-cov
    fi
fi

# Capture exit code
EXIT_CODE=$?

# Display results
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed!${NC}"
fi

# Show coverage report location if coverage was run
if [ "$RUN_COVERAGE" = true ] && [ $EXIT_CODE -eq 0 ]; then
    echo -e "${BLUE}Coverage report generated at: htmlcov/index.html${NC}"
fi

# Usage information
if [ $# -eq 0 ]; then
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  ./test.sh                    # Run all tests"
    echo "  ./test.sh --e2e             # Run only E2E tests"
    echo "  ./test.sh --unit            # Run only unit tests"
    echo "  ./test.sh --auth            # Run only auth tests"
    echo "  ./test.sh --coverage        # Run with coverage report"
    echo "  ./test.sh --file <path>     # Run specific test file"
    echo "  ./test.sh -v                # Verbose output"
    echo "  ./test.sh -x                # Stop on first failure"
    echo ""
    echo -e "${YELLOW}Markers:${NC}"
    echo "  --e2e          End-to-end tests"
    echo "  --unit         Unit tests"
    echo "  --auth         Authentication tests"
    echo "  --crud         CRUD operation tests"
    echo "  --integration  Integration tests"
    echo "  --slow         Slow running tests"
fi

exit $EXIT_CODE