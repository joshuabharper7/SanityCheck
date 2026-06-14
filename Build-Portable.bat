@echo off
SETLOCAL EnableDelayedExpansion
TITLE SanityCheck Portable Builder

echo ====================================================
echo           SanityCheck Portable Builder
echo ====================================================
echo.

:: 1. Standard Production Build
echo [1/5] Building production application...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b
)

:: 2. Setup Directory
echo [2/5] Initializing release directory...
set "REL_DIR=SanityCheck-Portable"
if exist "%REL_DIR%" rd /s /q "%REL_DIR%"
mkdir "%REL_DIR%"

:: 3. Copy Standalone Files
echo [3/5] Copying application files...
xcopy /s /e /i /y ".next\standalone" "%REL_DIR%" >nul
xcopy /s /e /i /y "public" "%REL_DIR%\public" >nul
xcopy /s /e /i /y ".next\static" "%REL_DIR%\.next\static" >nul

:: [NEW] Force remove persistent sharp artifacts that cause ERR_DLOPEN_FAILED on Windows
if exist "%REL_DIR%\node_modules\next\node_modules\@img" rd /s /q "%REL_DIR%\node_modules\next\node_modules\@img"
if exist "%REL_DIR%\node_modules\next\node_modules\sharp" rd /s /q "%REL_DIR%\node_modules\next\node_modules\sharp"

copy "SanityCheck.exe" "%REL_DIR%\SanityCheck.exe" >nul
copy "Start-SanityCheck.bat" "%REL_DIR%\Start-SanityCheck.bat" >nul
copy "Setup-Shortcut.ps1" "%REL_DIR%\Setup-Shortcut.ps1" >nul

:: 4. Bundle Node.js
echo [4/5] Bundling Node.js runtime...
mkdir "%REL_DIR%\runtime"
where node > temp_node_path.txt
set /p NODE_PATH=<temp_node_path.txt
del temp_node_path.txt
:: Get the directory of the node executable
for %%i in ("%NODE_PATH%") do set "NODE_DIR=%%~dpi"
copy "%NODE_DIR%node.exe" "%REL_DIR%\runtime\node.exe" >nul

:: 5. Create Portable Entry Point
echo [5/5] Creating portable launcher...
(
echo @echo off
echo set "PATH=%%~dp0runtime;%%PATH%%"
echo start "" "%%~dp0SanityCheck.exe"
) > "%REL_DIR%\Run-Portable.bat"

echo.
echo ====================================================
echo SUCCESS: Portable distribution created in:
echo   \%REL_DIR%\
echo.
echo You can zip this folder and share it.
echo Users just need to run 'Run-Portable.bat'.
echo ====================================================
echo.
pause
