# LionRocket Development Startup Script for Windows

Write-Host "🚀 Starting LionRocket Development Environment..." -ForegroundColor Green

# Check if uv is installed
try {
    $null = Get-Command uv -ErrorAction Stop
} catch {
    Write-Host "Error: uv is not installed." -ForegroundColor Red
    Write-Host "Please run: .\install-uv.ps1"
    exit 1
}

# Store process information
$processes = @()

# Function to cleanup on exit
function Cleanup {
    Write-Host "`nShutting down services..." -ForegroundColor Yellow
    
    foreach ($proc in $processes) {
        if ($proc -and !$proc.HasExited) {
            Stop-Process -Id $proc.Id -Force
            Write-Host "$($proc.ProcessName) stopped" -ForegroundColor Blue
        }
    }
    
    exit 0
}

# Register cleanup on exit
Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

try {
    # Start Backend
    Write-Host "Starting Backend..." -ForegroundColor Green
    Push-Location backend

    # Create virtual environment if it doesn't exist
    if (!(Test-Path ".venv")) {
        Write-Host "Creating backend virtual environment..." -ForegroundColor Blue
        uv venv
    }

    # Install dependencies
    Write-Host "Installing backend dependencies..." -ForegroundColor Blue
    uv pip install -r requirements.txt

    # Start backend server
    Write-Host "Starting backend server on http://localhost:8000" -ForegroundColor Green
    $backendProcess = Start-Process -FilePath ".\.venv\Scripts\python.exe" `
        -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" `
        -WorkingDirectory (Get-Location) `
        -PassThru -NoNewWindow
    $processes += $backendProcess

    Pop-Location

    # Wait a bit for backend to start
    Start-Sleep -Seconds 3

    # Start Frontend
    Write-Host "Starting Frontend..." -ForegroundColor Green
    Push-Location frontend

    # Install dependencies if needed
    if (!(Test-Path "node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Blue
        npm install
    }

    # Start frontend dev server
    Write-Host "Starting frontend server on http://localhost:5173" -ForegroundColor Green
    $frontendProcess = Start-Process -FilePath "npm" `
        -ArgumentList "run", "dev" `
        -WorkingDirectory (Get-Location) `
        -PassThru -NoNewWindow
    $processes += $frontendProcess

    Pop-Location

    # Show status
    Write-Host "`n🎉 LionRocket is running!" -ForegroundColor Green
    Write-Host "Backend: http://localhost:8000" -ForegroundColor Blue
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor Blue
    Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Blue
    Write-Host "`nPress Ctrl+C to stop all services" -ForegroundColor Yellow

    # Keep script running
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Check if processes are still running
        $stillRunning = $false
        foreach ($proc in $processes) {
            if ($proc -and !$proc.HasExited) {
                $stillRunning = $true
            }
        }
        
        if (!$stillRunning) {
            Write-Host "All processes have stopped." -ForegroundColor Red
            break
        }
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Cleanup
} finally {
    Cleanup
}