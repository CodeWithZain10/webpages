@echo off
REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

REM Check if npm is installed
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install Node.js which includes npm.
    pause
    exit /b
)

echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    pause
    exit /b
)

REM Check if .env exists, if not create one
if not exist ".env" (
    echo Creating .env file...
    copy /y NUL .env >nul
    echo VITE_SUPABASE_URL=your_supabase_url >> .env
    echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key >> .env
    echo Please edit the .env file and add your Supabase credentials
    pause
)

echo Starting development server...
call npm run dev

REM Keep the window open
pause
