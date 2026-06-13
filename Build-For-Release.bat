@echo off
TITLE SanityCheck Release Builder

echo ====================================================
echo           SanityCheck Release Builder
echo ====================================================
echo.

echo [1/4] Building production application...
call npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b
)

echo [2/4] Finalizing standalone directory...
:: Next.js standalone doesn't copy public or static by default
xcopy /s /e /i /y "public" ".next\standalone\public" >nul
xcopy /s /e /i /y ".next\static" ".next\standalone\.next\static" >nul

echo [3/4] Adding launcher and setup scripts to release folder...
copy "SanityCheck.exe" ".next\standalone\SanityCheck.exe" >nul
copy "Start-SanityCheck.bat" ".next\standalone\Start-SanityCheck.bat" >nul
copy "Setup-Shortcut.ps1" ".next\standalone\Setup-Shortcut.ps1" >nul
copy "public\logo.ico" ".next\standalone\public\logo.ico" >nul
xcopy /i /y "public\logo.png" ".next\standalone\public\logo.png" >nul

echo [4/4] Release preparation complete!
echo.
echo ====================================================
echo SUCCESS: The '.next\standalone' folder is now ready.
echo You can zip this folder and share it with others.
echo They just need to run 'Start-SanityCheck.bat' inside it.
echo ====================================================
echo.
pause
