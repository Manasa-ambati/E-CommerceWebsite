@echo off
echo ========================================
echo   Deploying to Railway...
echo ========================================
echo.

echo [1/4] Checking for uncommitted changes...
git status --porcelain
if %errorlevel% neq 0 (
    echo ERROR: Not a git repository!
    pause
    exit /b 1
)
echo.

echo [2/4] Committing changes...
git add .
git commit -m "Deploy to Railway - %date%"
if %errorlevel% neq 0 (
    echo No changes to commit or commit failed
)
echo.

echo [3/4] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Git push failed!
    pause
    exit /b 1
)
echo ✓ Code pushed to GitHub
echo.

echo [4/4] Triggering Railway deployment...
echo.
echo ========================================
echo  Next Steps:
echo ========================================
echo.
echo 1. Railway will auto-deploy in 2-5 minutes
echo 2. Check logs: railway logs --follow
echo 3. View site: railway open
echo 4. Clear browser cache: Ctrl+Shift+R
echo.
echo Monitoring deployment...
echo.

:: Wait a moment for Railway to detect changes
timeout /t 5 /nobreak >nul

:: Show logs
railway logs --follow

pause
