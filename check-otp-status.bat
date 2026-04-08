@echo off
echo ============================================
echo   OTP EMAIL DIAGNOSTIC CHECK
echo ============================================
echo.

echo [1/5] Checking if backend is running...
curl -s http://localhost:8080/api/products/featured >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 8080
) else (
    echo ❌ Backend is NOT running!
    echo.
    echo Please start the backend first:
    echo   cd backend
    echo   mvn spring-boot:run
    echo.
    pause
    exit /b 1
)
echo.

echo [2/5] Checking email configuration...
curl -s -X POST http://localhost:8080/api/auth/debug/test-email ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"manasaambati244@gmail.com\", \"name\": \"Test User\"}" > test-result.json 2>&1

findstr "success" test-result.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Email configuration found
    type test-result.json
) else (
    echo ⚠️  Email might not be configured properly
    echo Check backend console for errors
)
echo.

echo [3/5] Testing signup endpoint...
curl -s -X POST http://localhost:8080/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Test User\", \"email\": \"manasaambati244@gmail.com\", \"password\": \"Test1234!\", \"phone\": \"1234567890\"}" > signup-result.json 2>&1

findstr "requiresOtp" signup-result.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Signup endpoint working, OTP should be sent
    type signup-result.json
) else (
    echo ❌ Signup endpoint error
    type signup-result.json
)
echo.

echo [4/5] Checking for common issues...
echo.
echo Common reasons for not receiving OTP:
echo   1. Backend console shows "MailSender not configured"
echo   2. Gmail App Password is incorrect
echo   3. Email went to Spam/Junk folder
echo   4. 2-Step Verification not enabled on Gmail
echo   5. Environment variables not set
echo.

echo [5/5] Quick fixes...
echo.
echo To manually verify a user (bypass OTP):
echo   curl -X POST http://localhost:8080/api/auth/debug/verify-user ^
echo     -H "Content-Type: application/json" ^
echo     -d "{\"email\": \"your-email@gmail.com\"}"
echo.
echo To auto-verify ALL users:
echo   curl -X POST http://localhost:8080/api/auth/debug/auto-verify-all
echo.

echo ============================================
echo   CHECK YOUR BACKEND CONSOLE LOGS
echo ============================================
echo.
echo Look for these messages when you signup:
echo   ✅ "OTP email SENT SUCCESSFULLY" - Email sent!
echo   ❌ "MailSender not configured" - Email not configured
echo   ❌ "EMAIL FAILED" - Configuration error
echo.
echo Then check your email inbox (and spam folder)!
echo.

del test-result.json 2>nul
del signup-result.json 2>nul

pause
