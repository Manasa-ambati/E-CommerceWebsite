# 🚨 URGENT FIX - Choose Your Backend

## You Have TWO Options:

---

## OPTION 1: Use LOCAL Backend (Recommended for Testing) ✅

Your frontend is currently trying to connect to Railway, but you want to test locally.

### Quick Fix:

1. **STOP current frontend** (Ctrl+C in terminal)

2. **Verify .env file has local URL:**
   ```
   REACT_APP_API_URL=http://localhost:8080
   ```

3. **RESTART frontend:**
   ```bash
   cd frontend
   npm start
   ```

4. **Hard refresh browser:**
   - Press `Ctrl + Shift + R` (Windows)
   - Or `Ctrl + F5`

### Why This Happens:
- React loads `.env` variables ONLY on startup
- Changing `.env` doesn't update until you restart the dev server

---

## OPTION 2: Use PRODUCTION Backend (Railway)

If you WANT to use Railway production backend:

### The Problem:
You're getting `400 Bad Request` which means:
- Railway server IS running ✅
- But it's rejecting your signup request ❌

### Possible Reasons:

1. **Missing required fields** in signup form
2. **Password too short** (needs 6+ characters)
3. **Email already exists**
4. **Phone number format invalid**

### Fix:

Make sure your signup form includes ALL required fields:
```typescript
{
  "name": "John Doe",        // Full name (required)
  "email": "john@example.com", // Valid email
  "password": "secure123",     // Min 6 characters
  "phone": "+91 9876543210"    // Valid phone
}
```

### Check Railway Logs:

Go to Railway dashboard → Your Backend → View Logs to see the actual error.

---

## CURRENT SITUATION Analysis:

Looking at your errors:
```
POST https://web-production-bef07.up.railway.app/api/auth/signup 400 (Bad Request)
```

This means:
- ✅ Frontend IS connecting to Railway
- ✅ Railway server is responding
- ❌ Railway is rejecting the request with 400 error

### Most Likely Cause:

Your signup form is missing required data or has invalid data.

### Quick Test:

Open browser console and run:
```javascript
// Test signup API directly
fetch('https://web-production-bef07.up.railway.app/api/auth/signup', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Test User',
    email: 'test' + Date.now() + '@example.com', // Unique email
    password: 'test123',
    phone: '+91 9999999999'
  })
}).then(r => r.json()).then(console.log)
```

Check the response to see the exact error.

---

## RECOMMENDED WORKFLOW:

### For Development:
```
Frontend: http://localhost:3000
Backend:  http://localhost:8080
```

### For Production:
```
Frontend: Deployed to Vercel/Netlify
Backend:  Railway (https://web-production-bef07.up.railway.app)
```

---

## STEP-BY-STEP FIX (Local Testing):

1. **Kill all Node processes** (just to be sure)
   ```bash
   taskkill /F /IM node.exe
   ```

2. **Verify backend is running locally:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   Look for: `Tomcat started on port(s): 8080`

3. **Update frontend/.env:**
   ```env
   REACT_APP_API_URL=http://localhost:8080
   ```

4. **Restart frontend:**
   ```bash
   cd frontend
   npm start
   ```

5. **Clear browser cache:**
   - Open DevTools (F12)
   - Right-click Refresh button
   - Select "Empty Cache and Hard Reload"

6. **Test signup:**
   - Go to http://localhost:3000/signup
   - Fill ALL fields
   - Submit

---

## IF YOU WANT TO USE RAILWAY:

The 400 error means your signup data is invalid. Check:

✅ Name: Not empty  
✅ Email: Valid format  
✅ Password: At least 6 characters  
✅ Phone: Not empty  

Example valid signup:
```json
{
  "name": "Manasa Ambati",
  "email": "manasa.test@example.com",
  "password": "password123",
  "phone": "+91 9876543210"
}
```

---

## Debug Command:

Run this in browser console to see what's being sent:
```javascript
// Intercept all API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('API Call:', args[0], args[1]);
  return originalFetch.apply(this, args);
};
```

Then try signup again - you'll see exactly what data is being sent!

---

## Summary:

**Current Issue:** Frontend connecting to Railway, getting 400 errors

**Solution:** Either:
1. ✅ Restart frontend to use LOCAL backend (recommended)
2. 🔧 Fix signup form data for Railway backend

Choose option 1 for easiest testing!
