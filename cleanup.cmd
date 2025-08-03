@echo off
REM LionRocket Cleanup Script for Windows CMD

echo Starting LionRocket cleanup...
echo.

REM Run the PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0cleanup.ps1"