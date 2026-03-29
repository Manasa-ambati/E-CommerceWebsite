@echo off
echo ========================================
echo  Starting Backend - Local Development
echo ========================================
echo.
echo Using H2 in-memory database for local testing...
echo.

cd backend

echo Cleaning previous build...
call mvn clean

echo Building application...
call mvn package -DskipTests

echo.
echo Starting Spring Boot server with 'local' profile...
echo Database: H2 (in-memory)
echo Console: http://localhost:8080/h2-console
echo API: http://localhost:8080/api/
echo.

call mvn spring-boot:run -Dspring.profiles.active=local

pause
