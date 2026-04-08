@echo off
echo ========================================
echo   Railway Deployment Helper
echo ========================================
echo.

echo Step 1: Checking Git Status...
git status
echo.

echo Step 2: Adding all changes...
git add .
echo.

echo Step 3: Committing changes...
git commit -m "Deploy OTP email system to Railway"
echo.

echo Step 4: Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo   Deployment Steps:
echo ========================================
echo.
echo 1. Go to https://railway.app
echo 2. Select your project
echo 3. Railway will auto-deploy from GitHub
echo 4. Monitor deployment in Dashboard
echo.
echo ========================================
echo   Environment Variables Needed:
echo ========================================
echo.
echo MySQL Variables (from Railway MySQL):
echo   - MYSQLHOST
echo   - MYSQLPORT
echo   - MYSQLDATABASE
echo   - MYSQLUSER
echo   - MYSQLPASSWORD
echo.
echo Email Configuration:
echo   - SPRING_MAIL_HOST=smtp.gmail.com
echo   - SPRING_MAIL_PORT=587
echo   - SPRING_MAIL_USERNAME=your-email@gmail.com
echo   - SPRING_MAIL_PASSWORD=your-app-password
echo.
echo Security:
echo   - JWT_SECRET=random-32-chars-minimum
echo   - CORS_ALLOWED_ORIGINS=https://your-frontend.com
echo   - PORT=8080
echo.
echo ========================================
echo.
echo For detailed guide, see:
echo   - RAILWAY_DEPLOYMENT_GUIDE.md
echo   - RAILWAY_ENV_VARIABLES.md
echo.
echo ========================================
pause
