@echo off
echo ========================================
echo   Clearing All Caches - E-Commerce App
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [1/4] Stopping any running npm processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Deleting node_modules cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✓ Cache deleted
) else (
    echo ℹ No cache found
)

echo [3/4] Deleting parcel cache...
if exist ".parcel-cache" (
    rmdir /s /q ".parcel-cache"
    echo ✓ Parcel cache deleted
) else (
    echo ℹ No parcel cache found
)

echo [4/4] Deleting build folder...
if exist "build" (
    rmdir /s /q "build"
    echo ✓ Build folder deleted
) else (
    echo ℹ No build folder found
)

echo.
echo ========================================
echo   ✓ ALL CLEAR COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Close ALL browser windows for localhost:3000
echo 2. Clear browser cache (Ctrl+Shift+Delete)
echo 3. Run: npm start
echo 4. Hard refresh: Ctrl+Shift+R
echo.
pause
