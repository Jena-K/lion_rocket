#!/bin/bash

# Lion Rocket E2E Test Runner Script

echo "🚀 Lion Rocket E2E Test Suite"
echo "============================="

# Function to display usage
usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  --install        Install Playwright and dependencies"
    echo "  --all           Run all tests"
    echo "  --auth          Run authentication tests"
    echo "  --chat          Run chat tests"
    echo "  --character     Run character tests"
    echo "  --admin         Run admin tests"
    echo "  --api           Run API integration tests"
    echo "  --visual        Run visual regression tests"
    echo "  --headed        Run tests in headed mode"
    echo "  --debug         Run tests in debug mode"
    echo "  --ui            Run tests with Playwright UI"
    echo "  --report        Show test report"
    echo "  --coverage      Generate coverage report"
    echo "  --help          Show this help message"
    exit 1
}

# Parse command line arguments
COMMAND=""
EXTRA_ARGS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --install)
            COMMAND="install"
            shift
            ;;
        --all)
            COMMAND="test"
            shift
            ;;
        --auth)
            COMMAND="test:auth"
            shift
            ;;
        --chat)
            COMMAND="test:chat"
            shift
            ;;
        --character)
            COMMAND="test"
            EXTRA_ARGS="character/"
            shift
            ;;
        --admin)
            COMMAND="test:admin"
            shift
            ;;
        --api)
            COMMAND="test:api"
            shift
            ;;
        --visual)
            COMMAND="test"
            EXTRA_ARGS="visual/"
            shift
            ;;
        --headed)
            COMMAND="test:headed"
            shift
            ;;
        --debug)
            COMMAND="test:debug"
            shift
            ;;
        --ui)
            COMMAND="test:ui"
            shift
            ;;
        --report)
            COMMAND="report"
            shift
            ;;
        --coverage)
            COMMAND="coverage"
            shift
            ;;
        --help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Default to running all tests if no command specified
if [ -z "$COMMAND" ]; then
    COMMAND="test"
fi

# Change to tests directory
cd "$(dirname "$0")"

# Execute the appropriate command
case $COMMAND in
    install)
        echo "📦 Installing Playwright and dependencies..."
        npm install
        npx playwright install
        npx playwright install-deps
        ;;
    test)
        echo "🧪 Running all E2E tests..."
        npm run test $EXTRA_ARGS
        ;;
    test:auth)
        echo "🔐 Running authentication tests..."
        npm run test auth/
        ;;
    test:chat)
        echo "💬 Running chat tests..."
        npm run test chat/
        ;;
    test:admin)
        echo "👨‍💼 Running admin tests..."
        npm run test admin/
        ;;
    test:api)
        echo "🔌 Running API integration tests..."
        npm run test api/
        ;;
    test:headed)
        echo "👀 Running tests in headed mode..."
        npm run test:headed $EXTRA_ARGS
        ;;
    test:debug)
        echo "🐛 Running tests in debug mode..."
        npm run test:debug $EXTRA_ARGS
        ;;
    test:ui)
        echo "🖥️ Running tests with Playwright UI..."
        npm run test:ui $EXTRA_ARGS
        ;;
    report)
        echo "📊 Opening test report..."
        npm run report
        ;;
    coverage)
        echo "📈 Generating coverage report..."
        npm run test -- --reporter=json
        echo "Coverage report generated in playwright-report/"
        ;;
esac

# Check test results
if [ $? -eq 0 ]; then
    echo "✅ Tests completed successfully!"
else
    echo "❌ Tests failed!"
    exit 1
fi