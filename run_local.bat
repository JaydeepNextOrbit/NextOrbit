@echo off
cd /d "%~dp0"
echo Starting local Vite development server...
npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start server.
    echo Please make sure Node.js is installed on your system.
)
pause
