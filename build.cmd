@echo off
REM LionRocket Production Build Script for Windows CMD

echo Starting LionRocket Production Build...
echo.

REM Run the PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0build.ps1"