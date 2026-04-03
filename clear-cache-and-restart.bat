@echo off
echo ========================================
echo  Clearing Frontend Cache & Restarting
echo ========================================
echo.

echo [1/3] Removing build folder...
if exist "build" rmdir /s /q "build"
echo ✓ Build folder removed

echo.
echo [2/3] Clearing node_modules cache...
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
echo ✓ Cache cleared

echo.
echo [3/3] Starting frontend server...
echo.
echo ========================================
echo  Server starting on http://localhost:3000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
