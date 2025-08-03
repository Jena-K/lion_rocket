# UV Installation Script for Lion Rocket (Windows)

Write-Host "🚀 Installing UV for Lion Rocket..." -ForegroundColor Green

# Install UV using the official installer
try {
    Invoke-RestMethod https://astral.sh/uv/install.ps1 | Invoke-Expression
    Write-Host "✅ UV installed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to install UV: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your PowerShell or Command Prompt"
Write-Host "2. Run: uv --version to verify installation"
Write-Host "3. Run: uv run install to install all dependencies"
Write-Host "4. Run: uv run dev to start the development servers"