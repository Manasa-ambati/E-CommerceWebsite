@echo off
echo ========================================
echo  RESTARTING FRONTEND WITH NEW CHANGES
echo ========================================
echo.

echo [1/3] Finding process on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000"') do (
    echo Found PID: %%a
    taskkill /F /PID %%a >nul 2>&1
    echo Stopped process %%a
)
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Waiting for port to release...
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting fresh frontend server...
cd /d "%~dp0frontend"
start "E-Commerce Frontend" cmd /k "npm start"

echo.
echo ========================================
echo  FRONTEND RESTARTED!
echo ========================================
echo.
echo The browser should open automatically at:
echo http://localhost:3000
echo.
echo Wait 30-60 seconds for compilation.
echo Then test cart removal!
echo ========================================
pause
