@echo off
REM Script to clean and restart the frontend development server

echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Cleaning cache...
if exist "node_modules\.cache" (
    rmdir /s /q node_modules\.cache
    echo Cache cleaned successfully
) else (
    echo No cache to clean
)

echo Starting development server...
npm start
