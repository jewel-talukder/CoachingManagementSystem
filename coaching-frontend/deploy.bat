@echo off
REM Production Deployment Script for Coaching Management System Frontend (Windows)

echo ==========================================
echo Coaching Management System - Production Build
echo ==========================================
echo.

REM Check if .env.production exists
if not exist .env.production (
    echo Warning: .env.production file not found!
    echo Creating .env.production with production API URL...
    echo NEXT_PUBLIC_API_URL=http://93.127.140.63:4000/api > .env.production
)

REM Install dependencies
echo.
echo Installing dependencies...
call npm install

REM Run linting
echo.
echo Running linter...
call npm run lint
if errorlevel 1 (
    echo Warning: Linting issues found, but continuing...
)

REM Build for production
echo.
echo Building for production...
set NODE_ENV=production
call npm run build

if errorlevel 1 (
    echo.
    echo Build failed! Please check the errors above.
    exit /b 1
) else (
    echo.
    echo Build successful!
    echo.
    echo To start the production server, run:
    echo   npm start
    echo.
    echo Or use PM2:
    echo   pm2 start ecosystem.config.js
)

pause

