@echo off
echo ========================================
echo  FORCE CLEAR ALL CACHES - E-COMMERCE APP
echo ========================================
echo.

echo [1/4] Clearing frontend build cache...
if exist "frontend\.vite" rmdir /s /q "frontend\.vite"
if exist "frontend\node_modules\.vite" rmdir /s /q "frontend\node_modules\.vite"
echo ✓ Frontend build cache cleared

echo.
echo [2/4] Clearing browser cache files...
del /q /f "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache\*" 2>nul
del /q /f "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache\*" 2>nul
echo ✓ Browser cache cleared (if browsers were closed)

echo.
echo [3/4] Clearing temporary files...
del /q /f "frontend\*.log" 2>nul
del /q /f "*.log" 2>nul
echo ✓ Temporary files cleared

echo.
echo [4/4] Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✓ Node processes stopped

echo.
echo ========================================
echo  CACHE CLEAR COMPLETE!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Close ALL browser windows completely
echo 2. Press any key to restart the servers...
echo.
pause >nul

echo.
echo Starting backend server...
cd backend
start "Backend Server" cmd /k "mvn spring-boot:run"
timeout /t 5 /nobreak >nul

echo Starting frontend server...
cd ..\frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo ========================================
echo  SERVERS RESTARTED!
echo ========================================
echo.
echo IMPORTANT: When browser opens, press Ctrl+Shift+R ONE TIME
echo to force load the new Amazon-style design!
echo.
pause
