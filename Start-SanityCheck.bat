@echo off
SETLOCAL EnableDelayedExpansion
TITLE SanityCheck Launcher

echo ====================================================
echo           SanityCheck: Local AI Interviewer
echo ====================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! 
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Detect if we are in the source root or standalone folder
if exist "package.json" (
    echo [INFO] Source directory detected. Starting in development mode...
    set "RUN_DIR=."
    set "CMD=npm run dev"
) else if exist "server.js" (
    echo [INFO] Running from standalone directory.
    set "RUN_DIR=."
    set "CMD=node server.js"
) else if exist ".next\standalone\server.js" (
    echo [INFO] Production standalone build detected.
    echo [WARN] Running standalone from source requires manual asset mapping.
    echo [WARN] Falling back to dev mode for reliability.
    set "RUN_DIR=."
    set "CMD=npm run dev"
) else (
    echo [ERROR] Could not detect a valid SanityCheck installation.
    pause
    exit /b
)

:: Check if port 3333 is already in use
netstat -ano | findstr :3333 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [WARN] Port 3333 is already in use. 
    echo If SanityCheck is already running, you can just open your browser to http://localhost:3333
    echo.
    set /p "choice=Try to launch anyway? (y/n): "
    if /i "!choice!" neq "y" exit /b
)

echo [LAUNCH] Starting SanityCheck server...
echo [INFO] The server window must remain open while using the app.
echo.

:: Set Port for standalone mode
set PORT=3333

:: Start the server in a new window so this script can continue to open the browser
start "SanityCheck Server" /D "%RUN_DIR%" %CMD%

echo [WAIT] Waiting for server to initialize...
timeout /t 5 /nobreak >nul

echo [OPEN] Launching browser to http://localhost:3333...
start http://localhost:3333

echo.
echo ====================================================
echo [SUCCESS] SanityCheck is now running on Port 3333!
echo Close the "SanityCheck Server" window to stop.
echo ====================================================
echo.
pause
