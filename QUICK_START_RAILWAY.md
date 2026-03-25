# 🚂 RAILWAY BACKEND - QUICK START

## ✅ You Chose: Railway Production Backend

---

## ⚡ 3-Step Fix

### Step 1: RESTART Frontend NOW

**Stop current frontend:**
- Press `Ctrl + C` in the terminal

**Start fresh:**
```bash
cd frontend
npm start
```

**Wait for:** `Compiled successfully!`

---

### Step 2: Clear Browser Cache

**Hard refresh:**
- Press `Ctrl + Shift + R` (Windows)
- Or `Ctrl + F5`

---

### Step 3: Test Signup with UNIQUE Email

**Go to:** http://localhost:3000/signup

**Fill form:**
```
Name: Test User
Email: test+99887@example.com  ← MUST BE UNIQUE!
Password: test123
Phone: +91 9876543210
```

**Click:** Sign Up

---

## 🎯 Expected Result

### ✅ If Successful:
- Green success message
- "OTP sent to your email"
- Redirects to OTP verification
- Check your email for 6-digit code

### ❌ If Still 400 Error:

**Most likely cause:** Email already exists

**Fix:** Use MORE unique email:
```
test+776655@example.com
test+443322@example.com  
manasa+001@test.com
```

---

## 🔍 Debug in Browser

### Open DevTools (F12) → Console

**Run this to see what's happening:**
```javascript
// See all API calls
console.log('Watching API calls...');

// Test directly
fetch('https://web-production-bef07.up.railway.app/api/auth/signup', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Test',
    email: 'test+' + Math.random() + '@example.com',
    password: 'test123',
    phone: '+91 9876543210'
  })
}).then(r => r.json()).then(console.log);
```

---

## 📊 Check Railway Status

### Is Railway Backend Running?

**Test in browser:**
```
https://web-production-bef07.up.railway.app/api/categories
```

**Expected:** JSON response (not timeout)

**If timeout:** Railway backend is down - check Railway dashboard

---

## 🆘 Common Issues

### Issue: "Request timeout"
**Cause:** Frontend still using old config

**Fix:**
1. Stop frontend (Ctrl+C)
2. Restart: `npm start`
3. Hard refresh: Ctrl+Shift+R

---

### Issue: "400 Bad Request"
**Cause:** Invalid signup data

**Fix:**
- Use UNIQUE email (add random numbers)
- Password must be 6+ characters
- Fill ALL fields

---

### Issue: "Failed to load resource"
**Cause:** Network error or CORS

**Fix:**
- Check internet connection
- Try in incognito mode
- Wait 30 seconds and retry

---

## ✅ Success Checklist

Before testing, verify:

- [ ] `.env` file has Railway URL
- [ ] Frontend restarted after .env change
- [ ] Browser cache cleared
- [ ] Using UNIQUE email (with random numbers)
- [ ] All form fields filled
- [ ] Railway backend is running

---

## 🎉 What Should Happen

1. Fill signup form with unique email
2. Click submit
3. API call goes to Railway
4. Server validates and creates user
5. OTP generated and stored in database
6. Email sent (if configured)
7. Frontend shows OTP screen
8. You enter OTP
9. Logged in successfully!

---

## 💡 Pro Tip

**Always use emails like:**
```
test+12345@example.com
test+67890@example.com
user+randomnumber@example.com
```

**NOT:**
```
test@example.com  ← Probably exists
admin@example.com ← Definitely exists
```

---

## 📞 Next Steps After Signup Works

1. ✅ Check email for OTP
2. ✅ Enter OTP on verification screen  
3. ✅ Get logged in automatically
4. ✅ Token saved to localStorage
5. ✅ Navbar shows your name
6. ✅ Can shop on homepage!

---

## 🔧 Railway Dashboard

**Check logs at:**
```
https://railway.app/project/your-project/backend
```

Look for:
- POST /api/auth/signup requests
- Error messages
- Email sending logs

---

**Your `.env` is set to Railway!** 

**Now restart frontend and test with UNIQUE email!** 🚀

Any issues? Check `RAILWAY_SETUP_GUIDE.md` for detailed troubleshooting.
