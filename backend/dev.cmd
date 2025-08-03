@echo off
REM Backend Development Script for Windows CMD

echo Starting LionRocket Backend Development Environment...
echo.

REM Run the PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0dev.ps1"