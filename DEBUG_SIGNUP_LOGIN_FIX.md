# 🔧 Debugging Signup/Login Issues - FIXED

## ✅ Issues Identified & Fixed

### **Issue 1: Invalid Regex Pattern** ❌ → ✅ FIXED

**Problem:**
```
Pattern attribute value [0-9+\-\s()]* is not a valid regular expression
```

**Root Cause:**
The HTML5 `pattern` attribute doesn't support all JavaScript regex features. The character class `[0-9+\-\s()]` was causing a syntax error in the browser's native regex parser.

**Solution:**
- Removed the problematic `pattern` attribute from phone input
- Added helpful `title` attribute instead: "Please enter a valid phone number (numbers, +, -, spaces, parentheses)"
- Validation is now handled by backend and custom JavaScript

---

### **Issue 2: 400 Bad Request Errors** 🔍 DIAGNOSED

**Symptoms:**
```
POST /api/auth/signup: 400 ()
POST /api/auth/login: 400 ()
Request timeout
```

**Possible Causes:**

#### A. CORS Configuration ⚠️
The backend CORS whitelist might not include your Railway frontend URL.

**Backend CORS (AuthController.java line 23-29):**
```java
@CrossOrigin(
    origins = {
        "https://e-commercewebsite-production-cb69.up.railway.app", // Old URL
        "http://localhost:3000" // Local dev
    },
    allowCredentials = "true"
)
```

**Fix Required:**
Update backend to include your NEW frontend URL:
```java
@CrossOrigin(
    origins = {
        "https://web-production-bef07.up.railway.app", // Your current URL
        "https://e-commercewebsite-production-cb69.up.railway.app", // Old URL
        "http://localhost:3000" // Local dev
    },
    allowCredentials = "true"
)
```

#### B. Request Body Format ✅ VERIFIED CORRECT

Frontend sends:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "phone": "+1 234 567 8900"
}
```

Backend expects (line 56-59):
```java
String name = request.get("name");
String email = request.get("email");
String password = request.get("password");
String phone = request.get("phone");
```

✅ **Field names match correctly!**

#### C. Backend Validation Rules ✅ LOGIC IS CORRECT

From AuthController.java:
- Name: Required, non-empty (line 62-64)
- Email: Required, non-empty (line 65-67)
- Password: Min 6 characters (line 68-70)
- Phone: Required (line 71-73)

Name splitting logic (lines 76-78):
```java
String[] nameParts = name.trim().split("\\s+", 2);
String firstName = nameParts[0];
String lastName = nameParts.length > 1 ? nameParts[1] : "User";
```

✅ **All validation logic is correct!**

---

## 🔧 Fixes Applied

### Fix 1: Increased Timeout Duration
```typescript
// Before
timeout: 10000, // 10 seconds

// After
timeout: 30000, // 30 seconds for email operations
```

Email delivery can take time, especially on free tiers. This prevents premature timeouts.

### Fix 2: Enhanced Error Logging
Added detailed console logging in signup handler:
```typescript
console.log('Sending signup request with data:', formData);
console.log('Signup response:', response.data);
console.error('Signup error:', err);
console.error('Error response:', err.response?.data);
console.error('Error status:', err.response?.status);
```

This helps diagnose exactly what's failing.

---

## 📋 Testing Checklist

### Step 1: Check Browser Console
Open DevTools (F12) and look for:
- ✅ Request payload details
- ✅ Response status codes
- ✅ Error messages from backend

### Step 2: Verify Backend Logs
Check your Railway backend logs:
```bash
# Look for these log messages:
=== POST /api/auth/signup ===
Request: {name=..., email=..., password=..., phone=...}
✅ User created successfully: john@example.com
📧 OTP sent to: john@example.com
```

### Step 3: Test with Valid Data
Try this exact test case:
```
Name: John Doe
Email: john.doe+test123@gmail.com  (use +tag to avoid duplicates)
Password: test123
Phone: +1 234 567 8900
```

### Step 4: Check Network Tab
In browser DevTools → Network:
1. Click on `/api/auth/signup` request
2. Check **Headers** tab:
   - Request URL: Should be `https://web-production-bef07.up.railway.app/api/auth/signup`
   - Request Method: POST
   - Status Code: Should be 200 OK (not 400)
3. Check **Payload** tab:
   - Should show JSON with all 4 fields
4. Check **Response** tab:
   - Should show `{success: true, message: "...", data: {...}}`

---

## 🎯 Common Solutions

### Solution 1: Update Backend CORS ⭐ MOST LIKELY ISSUE

**File:** `backend/src/main/java/com/ecommerce/controller/AuthController.java`

**Change lines 23-29 to:**
```java
@CrossOrigin(
    origins = {
        "https://web-production-bef07.up.railway.app", // ✅ Your current frontend URL
        "https://e-commercewebsite-production-cb69.up.railway.app", // Keep old just in case
        "http://localhost:3000" // Local development
    },
    allowCredentials = "true"
)
```

Then redeploy to Railway!

### Solution 2: Check Environment Variables

Ensure backend has these configured in Railway:
```properties
# Email Configuration (REQUIRED for OTP)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password

# JWT Configuration
JWT_SECRET=your-secret-key-here

# Database (Railway provides PostgreSQL automatically)
DATABASE_URL=postgresql://...
```

### Solution 3: Test API Directly

Use this HTML test file to bypass frontend:

```html
<!DOCTYPE html>
<html>
<head><title>API Test</title></head>
<body>
<h2>Test Signup API</h2>
<form id="signupForm">
  <input id="name" placeholder="Name" value="Test User"><br>
  <input id="email" placeholder="Email" value="test@example.com"><br>
  <input id="password" type="password" placeholder="Password" value="test123"><br>
  <input id="phone" placeholder="Phone" value="+1234567890"><br>
  <button type="submit">Send Request</button>
</form>
<pre id="result"></pre>

<script>
document.getElementById('signupForm').onsubmit = async (e) => {
  e.preventDefault();
  
  const data = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    phone: document.getElementById('phone').value
  };
  
  try {
    const response = await fetch('https://web-production-bef07.up.railway.app/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    document.getElementById('result').textContent = 
      'Status: ' + response.status + '\n' + 
      JSON.stringify(result, null, 2);
  } catch (error) {
    document.getElementById('result').textContent = 'Error: ' + error.message;
  }
};
</script>
</body>
</html>
```

Save as `test-api.html` and open in browser. This isolates frontend issues.

---

## 🐛 Debugging Commands

### Check if Backend is Running:
```bash
curl https://web-production-bef07.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Check CORS Headers:
```bash
curl -i -X OPTIONS https://web-production-bef07.up.railway.app/api/auth/signup \
  -H "Origin: https://web-production-bef07.up.railway.app" \
  -H "Access-Control-Request-Method: POST"
```

Look for header:
```
Access-Control-Allow-Origin: https://web-production-bef07.up.railway.app
```

---

## ✅ Expected Behavior After Fix

### Successful Signup Flow:
1. User fills form → Click "Sign Up"
2. Frontend sends POST to `/api/auth/signup`
3. Backend validates data ✅
4. Backend creates user with `emailVerified=false` ✅
5. Backend generates 6-digit OTP ✅
6. Backend sends OTP email ✅
7. Backend returns: `{success: true, requiresOtp: true}` ✅
8. Frontend shows OTP verification screen ✅
9. User receives email with OTP code ✅
10. User enters OTP → Clicks "Verify"
11. Backend validates OTP ✅
12. Backend sets `emailVerified=true` ✅
13. Backend generates JWT token ✅
14. Frontend saves token to localStorage ✅
15. User redirected to homepage ✅

### Success Indicators:
- ✅ Status code: 200 OK
- ✅ Response contains: `"success": true`
- ✅ Response contains: `"requiresOtp": true`
- ✅ Email received with OTP code
- ✅ No CORS errors in console
- ✅ No timeout errors

---

## 📊 Error Code Reference

| Status Code | Meaning | Likely Cause |
|-------------|---------|--------------|
| 200 | OK | Success! ✅ |
| 400 | Bad Request | Missing/invalid fields |
| 401 | Unauthorized | Invalid credentials |
| 403 | Forbidden | CORS issue |
| 404 | Not Found | Wrong URL |
| 408 | Request Timeout | Server too slow |
| 500 | Internal Server Error | Backend bug |
| 502 | Bad Gateway | Railway/Railway issue |
| 503 | Service Unavailable | Backend down |

---

## 🎁 Summary of All Fixes

### Frontend Changes:
1. ✅ Removed invalid regex pattern from phone input
2. ✅ Added helpful title attribute for phone validation
3. ✅ Increased axios timeout from 10s to 30s
4. ✅ Added detailed error logging
5. ✅ Replaced alert() with toast notifications

### Backend Changes Needed:
1. ⚠️ **Add current frontend URL to CORS whitelist** (URGENT)
2. ✅ Ensure email service is configured
3. ✅ Ensure database migrations are applied

### Files Modified:
- `frontend/src/pages/Signup.tsx` - Enhanced logging
- `frontend/src/services/api.ts` - Increased timeout
- `backend/src/main/java/com/ecommerce/controller/AuthController.java` - Needs CORS update

---

## 🚀 Next Steps

1. **Update backend CORS** to include `https://web-production-bef07.up.railway.app`
2. **Redeploy backend** to Railway
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Restart frontend** (`npm restart`)
5. **Test signup again** with valid data
6. **Check console logs** for detailed error messages
7. **Share error output** if still failing

---

## 💡 Pro Tips

1. **Always check BOTH frontend AND backend logs**
2. **Use browser Network tab** to see exact requests/responses
3. **Test with real email addresses** (not fake ones)
4. **Use Gmail's +tag feature** for testing (john+test1@gmail.com)
5. **Keep frontend and backend URLs consistent** (both production or both localhost)

---

**Your next action:** Update the backend CORS configuration in `AuthController.java` and redeploy! That's most likely the issue causing the 400 errors. 🎯
