@echo off
echo ========================================
echo  ShopEase Railway Deployment Script
echo ========================================
echo.

echo [1/5] Building React Frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: React build failed!
    pause
    exit /b 1
)
echo ✓ React build completed
echo.

echo [2/5] Copying build files to Spring Boot...
xcopy /E /I /Y build\* ..\backend\src\main\resources\static\
if errorlevel 1 (
    echo ERROR: Failed to copy build files!
    pause
    exit /b 1
)
echo ✓ Build files copied successfully
echo.

cd ..\backend

echo [3/5] Cleaning previous builds...
call mvn clean
if errorlevel 1 (
    echo WARNING: Maven clean failed, continuing...
)
echo.

echo [4/5] Building Spring Boot application...
call mvn package -DskipTests
if errorlevel 1 (
    echo ERROR: Maven build failed!
    pause
    exit /b 1
)
echo ✓ Spring Boot build completed
echo.

echo [5/5] Verifying JAR file...
if exist "target\ecommerce-backend-0.0.1-SNAPSHOT.jar" (
    echo ✓ JAR file created successfully
) else (
    echo ERROR: JAR file not found!
    pause
    exit /b 1
)
echo.

echo ========================================
echo  Build Completed Successfully! 🎉
echo ========================================
echo.
echo Next Steps:
echo 1. Push code to GitHub
echo 2. Deploy on Railway
echo 3. Add MySQL database on Railway
echo 4. Configure environment variables
echo.
echo For detailed instructions, see RAILWAY_DEPLOYMENT.md
echo.
pause
