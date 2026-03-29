@echo off
echo ========================================
echo  Railway Deployment - Force Rebuild
echo ========================================
echo.

echo [Step 1] Checking Git status...
git status
echo.

echo [Step 2] Adding all changes...
git add .
if errorlevel 1 (
    echo ERROR: Git add failed!
    pause
    exit /b 1
)
echo ✓ Changes staged
echo.

echo [Step 3] Committing changes...
set commit_msg=Deploy to Railway - %date% %time%
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo WARNING: No changes to commit or commit failed
)
echo.

echo [Step 4] Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ERROR: Git push failed! Check your connection and branch name.
    pause
    exit /b 1
)
echo ✓ Code pushed to GitHub
echo.

echo ========================================
echo  Next Steps on Railway:
echo ========================================
echo.
echo 1. Go to https://railway.app
echo 2. Open your project
echo 3. Click "Deployments" tab
echo 4. Click "Redeploy" on latest deployment
echo    OR wait for auto-deployment to trigger
echo.
echo If build cache issues persist:
echo - Go to Settings ^→ Build
echo - Click "Clear Cache"
echo - Then redeploy
echo.
echo ========================================
echo  Deployment initiated! 🚀
echo ========================================
echo.
pause
