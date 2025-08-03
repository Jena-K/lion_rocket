# Backend E2E Test Runner Script for Windows

Write-Host "🧪 Running LionRocket Backend E2E Tests..." -ForegroundColor Cyan

# Check if virtual environment exists
if (!(Test-Path ".venv")) {
    Write-Host "Error: Virtual environment not found." -ForegroundColor Red
    Write-Host "Please run .\dev.ps1 first to set up the environment."
    exit 1
}

# Set test environment variables
$env:TESTING = "true"
$env:DATABASE_URL = "sqlite:///:memory:"
$env:CLAUDE_API_KEY = "test-api-key"
$env:JWT_SECRET = "test-secret-key-for-jwt"

# Parse command line arguments
$pytestArgs = @()
$runCoverage = $false
$runSpecific = ""

for ($i = 0; $i -lt $args.Count; $i++) {
    switch ($args[$i]) {
        "--coverage" {
            $runCoverage = $true
        }
        "--e2e" {
            $pytestArgs += "-m", "e2e"
        }
        "--unit" {
            $pytestArgs += "-m", "unit"
        }
        "--auth" {
            $pytestArgs += "-m", "auth"
        }
        "--crud" {
            $pytestArgs += "-m", "crud"
        }
        "--integration" {
            $pytestArgs += "-m", "integration"
        }
        "--slow" {
            $pytestArgs += "-m", "slow"
        }
        "--file" {
            $i++
            $runSpecific = $args[$i]
        }
        "-v" {
            $pytestArgs += "-v"
        }
        "--verbose" {
            $pytestArgs += "-v"
        }
        "-x" {
            $pytestArgs += "-x"
        }
        "--exitfirst" {
            $pytestArgs += "-x"
        }
        default {
            Write-Host "Unknown option: $($args[$i])" -ForegroundColor Yellow
        }
    }
}

# Build pytest command
$pytestCmd = ".venv\Scripts\pytest.exe"

Write-Host "Running tests..." -ForegroundColor Blue

# Run tests
if ($runCoverage) {
    Write-Host "Running with coverage report..." -ForegroundColor Green
    if ($runSpecific) {
        & $pytestCmd $runSpecific $pytestArgs
    } else {
        & $pytestCmd $pytestArgs
    }
} else {
    Write-Host "Running without coverage..." -ForegroundColor Green
    if ($runSpecific) {
        & $pytestCmd $runSpecific $pytestArgs --no-cov
    } else {
        & $pytestCmd $pytestArgs --no-cov
    }
}

$exitCode = $LASTEXITCODE

# Display results
if ($exitCode -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed!" -ForegroundColor Red
}

# Show coverage report location if coverage was run
if ($runCoverage -and $exitCode -eq 0) {
    Write-Host "Coverage report generated at: htmlcov\index.html" -ForegroundColor Blue
}

# Usage information
if ($args.Count -eq 0) {
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\test.ps1                    # Run all tests"
    Write-Host "  .\test.ps1 --e2e             # Run only E2E tests"
    Write-Host "  .\test.ps1 --unit            # Run only unit tests"
    Write-Host "  .\test.ps1 --auth            # Run only auth tests"
    Write-Host "  .\test.ps1 --coverage        # Run with coverage report"
    Write-Host "  .\test.ps1 --file <path>     # Run specific test file"
    Write-Host "  .\test.ps1 -v                # Verbose output"
    Write-Host "  .\test.ps1 -x                # Stop on first failure"
    Write-Host ""
    Write-Host "Markers:" -ForegroundColor Yellow
    Write-Host "  --e2e          End-to-end tests"
    Write-Host "  --unit         Unit tests"
    Write-Host "  --auth         Authentication tests"
    Write-Host "  --crud         CRUD operation tests"
    Write-Host "  --integration  Integration tests"
    Write-Host "  --slow         Slow running tests"
}

exit $exitCode