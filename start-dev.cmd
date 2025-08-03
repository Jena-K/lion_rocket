@echo off
REM LionRocket Development Startup Script for Windows CMD

echo Starting LionRocket Development Environment...
echo.

REM Run the PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1"