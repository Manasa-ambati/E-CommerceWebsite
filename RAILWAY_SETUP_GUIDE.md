# 🚂 Railway Production Backend - Setup Guide

## ✅ Configuration Complete!

Your `frontend/.env` is now set to:
```env
REACT_APP_API_URL=https://web-production-bef07.up.railway.app
```

---

## 🔧 Fixing the 400 Bad Request Error

### Why You're Getting 400 Error:

The Railway backend is **rejecting your signup request** because:

1. ❌ **Email already exists** in database (most common)
2. ❌ **Password too short** (needs 6+ characters)
3. ❌ **Missing required fields** (name, email, password, phone)
4. ❌ **Invalid email format**

---

## ✅ Solution: Use UNIQUE Email

### For Testing, ALWAYS use unique email:

```javascript
// GOOD - Unique emails:
test+12345@example.com
test+67890@example.com
manasa.test+001@example.com
user+timestamp@example.com

// BAD - Likely already exists:
test@example.com
admin@example.com
user@example.com
```

---

## 🧪 Test Signup with Unique Data

### Step 1: Generate Unique Email

Use this format:
```
Email: test+[RANDOM_NUMBER]@example.com
Example: test+83746@example.com
```

### Step 2: Fill Signup Form

```
Full Name: Test User
Email: test+83746@example.com  ← UNIQUE!
Password: test123
Phone: +91 9876543210
```

### Step 3: Submit

If successful, you'll see:
- ✅ "Signup successful" message
- ✅ OTP sent to email (if email configured in Railway)
- ✅ Redirect to OTP verification

---

## 🔍 Debug in Browser Console

### Open DevTools (F12) and run:

```javascript
// 1. Check what data is being sent
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url.includes('/api/auth/signup')) {
    console.log('📤 Signup Request:', JSON.parse(options.body));
  }
  return originalFetch.apply(this, arguments);
};

// 2. Test API directly
async function testSignup() {
  const uniqueEmail = `test+${Date.now()}@example.com`;
  
  const response = await fetch('https://web-production-bef07.up.railway.app/api/auth/signup', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      name: 'Test User',
      email: uniqueEmail,  // UNIQUE!
      password: 'test123',
      phone: '+91 9876543210'
    })
  });
  
  const data = await response.json();
  console.log('📥 Response:', data);
  
  if (response.ok) {
    console.log('✅ SUCCESS! Check email for OTP');
  } else {
    console.log('❌ ERROR:', data.message);
  }
}

// Run test
testSignup();
```

---

## 📊 Common 400 Errors & Fixes

### Error: "Email already registered"
**Fix:** Use more unique email
```
BAD:  test@example.com
GOOD: test+847362@example.com
```

### Error: "Password must be at least 6 characters"
**Fix:** Use longer password
```
BAD:  test1
GOOD: test123
```

### Error: "Name is required"
**Fix:** Make sure name field is not empty
```
BAD:  ""
GOOD: "John Doe"
```

### Error: "Phone is required"
**Fix:** Add phone number
```
BAD:  ""
GOOD: "+91 9876543210"
```

---

## 🎯 Quick Test Commands

### Test 1: Check if Railway is UP
```bash
curl https://web-production-bef07.up.railway.app/api/categories
```
Expected: JSON response (not timeout)

### Test 2: Test Signup with Unique Email
```bash
curl -X POST https://web-production-bef07.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test+'$(date +%s)'@example.com",
    "password": "test123",
    "phone": "+91 9876543210"
  }'
```

### Test 3: Check Railway Logs
Go to Railway dashboard → Your Backend → View Logs

Look for:
- ✅ "POST /api/auth/signup" requests
- ✅ Error messages explaining 400 errors
- ✅ Email sending attempts

---

## 🚀 Restart Frontend (REQUIRED!)

After changing `.env`, you MUST restart frontend:

### Windows:
```bash
# Stop current frontend (Ctrl+C)
cd frontend
npm start
```

### Then hard refresh browser:
- Press `Ctrl + Shift + R`
- Or `Ctrl + F5`

---

## ✅ Expected Flow

### 1. Fill Signup Form
```
Name: Manasa Test
Email: test+93847@example.com  ← UNIQUE!
Password: secure123
Phone: +91 9988776655
```

### 2. Click Submit

### 3. What SHOULD Happen:
- ✅ Frontend sends POST to Railway
- ✅ Railway validates data
- ✅ Creates user in database
- ✅ Generates OTP
- ✅ Sends OTP to email (if configured)
- ✅ Returns success response
- ✅ Frontend shows OTP verification screen

### 4. What You SEE in Browser:
```
Network Tab → Request:
URL: https://web-production-bef07.up.railway.app/api/auth/signup
Method: POST
Status: 200 OK ✅

Response:
{
  "success": true,
  "message": "Signup successful. OTP sent to your email.",
  "data": {
    "email": "test+93847@example.com",
    "requiresOtp": true
  }
}
```

---

## 🔧 If Still Getting 400 Error

### Step 1: Check Railway Logs

1. Go to Railway.app
2. Select your project
3. Click on backend service
4. View "Deployments" → Latest → Logs

Look for error messages like:
```
ERROR: Email already exists: test@example.com
```

### Step 2: Check Database

If you have access to Railway MySQL:
```sql
-- Check existing users
SELECT email, created_at FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

### Step 3: Use Different Email Every Time

Add timestamp to email:
```javascript
const email = `test+${Date.now()}@example.com`;
// Example: test+1711347892384@example.com
```

---

## 📝 Testing Checklist

- [ ] `.env` file set to Railway URL
- [ ] Frontend restarted after .env change
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Using UNIQUE email (with random numbers)
- [ ] Password is 6+ characters
- [ ] All fields filled (name, email, password, phone)
- [ ] Railway backend is running (check dashboard)
- [ ] Checked Railway logs for errors

---

## 🎉 Success Indicators

### You'll know it worked when you see:

**In Browser Console:**
```javascript
// Request succeeds with 200 OK
Status: 200
Response: {success: true, message: "Signup successful..."}
```

**In UI:**
- ✅ Green success banner
- ✅ "OTP sent to email" message
- ✅ Redirects to OTP verification page
- ✅ Email input pre-filled

**In Railway Logs:**
```
INFO: POST /api/auth/signup - 200 OK
INFO: User created: test+12345@example.com
INFO: OTP generated and sent
```

---

## 🆘 Emergency Fallback

If Railway keeps giving 400 errors:

### Option 1: Use Local Backend Temporarily

Change `.env`:
```env
REACT_APP_API_URL=http://localhost:8080
```

Restart frontend, test locally, then switch back to Railway.

### Option 2: Debug with API Tester

Open `api-test.html` file in browser:
- Select "Use Railway"
- Try different email formats
- See exact error messages

---

## 📞 Next Steps

Once signup works:

1. ✅ Check email for OTP
2. ✅ Enter OTP on verification screen
3. ✅ Get logged in
4. ✅ Token saved to localStorage
5. ✅ Navbar shows user info

---

## 💡 Pro Tips

### Always use unique emails:
```javascript
test+1@example.com
test+2@example.com
test+3@example.com
```

### Or use timestamp:
```javascript
const email = `user.${Date.now()}@test.com`;
```

### Keep browser console open to see all API calls!

---

**You're using Railway production backend now!** 🚂

The 400 error is just validation - use a truly unique email and it will work! ✅
