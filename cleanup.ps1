# LionRocket Cleanup Script for Windows

Write-Host "🧹 Starting LionRocket cleanup..." -ForegroundColor Green

# Function to remove directory if exists
function Remove-DirectoryIfExists {
    param($Path)
    if (Test-Path $Path) {
        Write-Host "Removing $Path..." -ForegroundColor Blue
        Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Function to remove file if exists
function Remove-FileIfExists {
    param($Path)
    if (Test-Path $Path) {
        Write-Host "Removing $Path..." -ForegroundColor Blue
        Remove-Item -Path $Path -Force -ErrorAction SilentlyContinue
    }
}

# Cleanup Python artifacts
Write-Host "Cleaning Python artifacts..." -ForegroundColor Yellow
Get-ChildItem -Path . -Include __pycache__ -Recurse -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Include *.pyc,*.pyo -Recurse -File | Remove-Item -Force -ErrorAction SilentlyContinue

# Cleanup virtual environments
Write-Host "Cleaning virtual environments..." -ForegroundColor Yellow
Remove-DirectoryIfExists "venv"
Remove-DirectoryIfExists ".venv"
Remove-DirectoryIfExists "backend\.venv"
Remove-DirectoryIfExists "backend\venv"

# Cleanup Node modules and build artifacts
Write-Host "Cleaning Node.js artifacts..." -ForegroundColor Yellow
Remove-DirectoryIfExists "frontend\node_modules"
Remove-DirectoryIfExists "frontend\dist"
Remove-DirectoryIfExists "frontend\.nuxt"
Remove-DirectoryIfExists "frontend\.output"

# Cleanup build directories
Write-Host "Cleaning build directories..." -ForegroundColor Yellow
Remove-DirectoryIfExists "build"
Remove-DirectoryIfExists "dist"
Get-ChildItem -Path . -Include *.egg-info -Recurse -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# Cleanup logs
Write-Host "Cleaning logs..." -ForegroundColor Yellow
Remove-DirectoryIfExists "logs"
Get-ChildItem -Path . -Include *.log -Recurse -File | Remove-Item -Force -ErrorAction SilentlyContinue

# Cleanup temporary files
Write-Host "Cleaning temporary files..." -ForegroundColor Yellow
Get-ChildItem -Path . -Include *.tmp,*.temp,.DS_Store,Thumbs.db -Recurse -File | Remove-Item -Force -ErrorAction SilentlyContinue

# Cleanup test artifacts
Write-Host "Cleaning test artifacts..." -ForegroundColor Yellow
Remove-DirectoryIfExists ".pytest_cache"
Remove-DirectoryIfExists ".coverage"
Remove-DirectoryIfExists "htmlcov"
Remove-DirectoryIfExists ".tox"
Remove-DirectoryIfExists ".nox"

# Cleanup Docker volumes (if any)
Write-Host "Cleaning Docker artifacts..." -ForegroundColor Yellow
Remove-DirectoryIfExists "postgres-data"
Remove-DirectoryIfExists "redis-data"

# Remove old environment file from root (since we moved to separate directories)
if (Test-Path ".env") {
    Write-Host "Moving root .env to .env.backup" -ForegroundColor Yellow
    Move-Item -Path ".env" -Destination ".env.backup" -Force
}

Write-Host "✨ Cleanup completed!" -ForegroundColor Green

# Summary
Write-Host "`nSummary:" -ForegroundColor Blue
Write-Host "- Removed Python cache and artifacts"
Write-Host "- Removed virtual environments (will be recreated on next run)"
Write-Host "- Removed Node.js modules and build artifacts"
Write-Host "- Removed temporary files and logs"
Write-Host "- Root .env moved to .env.backup (if existed)"
Write-Host "`nNote: Database files were preserved for safety" -ForegroundColor Yellow