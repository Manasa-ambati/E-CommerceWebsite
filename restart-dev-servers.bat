@echo off
echo ========================================
echo  Restarting Development Servers
echo ========================================
echo.

echo [1/4] Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✓ Node processes stopped
echo.

echo [2/4] Checking backend on port 8080...
netstat -ano | findstr ":8080" >nul 2>&1
if errorlevel 1 (
    echo ⚠ Backend NOT running on port 8080
    echo Please start backend first!
    pause
    exit /b 1
) else (
    echo ✓ Backend is running on port 8080
)
echo.

echo [3/4] Waiting for port 3000 to be free...
timeout /t 3 /nobreak >nul
echo.

echo [4/4] Starting frontend development server...
cd frontend
start "React Frontend" cmd /k "npm start"
echo ✓ Frontend starting on http://localhost:3000
echo.

echo ========================================
echo  Development Servers Ready! 🚀
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Check the new terminal window for frontend logs.
echo Press any key to close this window...
pause >nul
