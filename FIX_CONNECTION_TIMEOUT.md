# Connection Timeout Fix

## Problem
You're getting this error: `index.tsx:25 Request timeout. Check your connection.`

## Root Cause
Your frontend `.env` file is pointing to the **production Railway URL**:
```
REACT_APP_API_URL=https://web-production-bef07.up.railway.app
```

But your backend is running **locally on port 8080**.

## Solution

### Option 1: Use Local Backend (Recommended for Development)

1. **Update frontend/.env file:**
   ```bash
   REACT_APP_API_URL=http://localhost:8080
   ```

2. **Restart Frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Make sure Backend is running:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

### Option 2: Use Production Backend

If you want to use the production backend on Railway:

1. **Keep frontend/.env as is:**
   ```bash
   REACT_APP_API_URL=https://web-production-bef07.up.railway.app
   ```

2. **Check if Railway server is running:**
   - Go to Railway dashboard
   - Make sure the backend service is deployed and running
   - Check Railway logs for errors

## Quick Test

To verify which backend you're connecting to:

### Test Local Backend:
```bash
curl http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com"}'
```

### Test Production Backend:
```bash
curl https://web-production-bef07.up.railway.app/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com"}'
```

## Recommended Setup

For **local development**, use:
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`

For **production**, use:
- Backend: Railway URL
- Frontend: Deployed to Vercel/Netlify/Railway

## Environment-Specific Configuration

Create two environment files:

### .env.local (for local development)
```
REACT_APP_API_URL=http://localhost:8080
```

### .env.production (for production)
```
REACT_APP_API_URL=https://web-production-bef07.up.railway.app
```

Then build accordingly:
- Local: `npm start` (uses .env)
- Production: `npm run build` (uses .env.production)
