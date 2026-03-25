# 🧪 Testing Locally - Password Login Fix

## ✅ Environment Setup Complete

### **Running Services:**

1. **Backend Server**
   - URL: `http://localhost:8080`
   - Status: Starting up...
   - Terminal: Check backend terminal for "Started EcommerceApplication"

2. **Frontend Server**
   - URL: `http://localhost:3000`
   - Status: ✅ Running
   - API URL configured to: `http://localhost:8080`

---

## 🎯 Test Password Login NOW

### **Step 1: Open Browser**
```
http://localhost:3000/login
```

### **Step 2: Select "Password Login" Tab**

### **Step 3: Enter Credentials**
```
Email: your@test.com
Password: yourpassword
```

### **Step 4: Click "Login"**

### **Step 5: Watch Console (F12)**

**Expected Logs:**
```
📤 Sending password login request: { email: "your@test.com", password: "***" }
=== POST /api/auth/login ===
Email: your@test.com
Has password: true
🔑 Attempting password-based login for: your@test.com
✅ Password verified for: your@test.com
✅ Password login successful for: your@test.com
📥 Login response received: { success: true, token: "..." }
```

### **Step 6: Success Indicators**
- ✅ Status: 200 OK (not 400!)
- ✅ Response contains JWT token
- ✅ Toast: "Login successful!"
- ✅ Redirected to homepage

---

## 🔍 Backend Logs to Watch For

When password login succeeds, you should see in backend terminal:

```
=== POST /api/auth/login ===
Email: user@example.com
Has password: true
🔑 Attempting password-based login for: user@example.com
✅ Password verified for: user@example.com
✅ Password verified for: user@example.com
✅ Password login successful for: user@example.com
```

**NOT the old error:**
```
❌ Duplicate entry ... for key 'otp_verifications.UK_...'
```

---

## 📊 Compare Both Login Methods

### **Test 1: Password Login**
```
Input: { email, password }
Result: Instant JWT token ✅
No OTP needed ✅
```

### **Test 2: OTP Login**
```
Input: { email only }
Result: OTP sent to email ✅
Must verify OTP ✅
```

Both should work without errors!

---

## 🐛 Troubleshooting

### **Issue: Backend not starting?**

**Check:**
1. Port 8080 not in use
2. Database connection working
3. Check backend terminal for errors

**Solution:**
```bash
# Kill any process on port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

---

### **Issue: Still getting 400 error?**

**Possible causes:**
1. Frontend pointing to wrong URL
2. Old backend code running
3. Browser cache

**Solutions:**
1. Check `.env` file: `REACT_APP_API_URL=http://localhost:8080`
2. Restart backend: `mvn spring-boot:run`
3. Clear browser cache: Ctrl+Shift+Delete
4. Hard refresh: Ctrl+F5

---

### **Issue: CORS error?**

Since both frontend and backend are on localhost, CORS should work automatically. The backend has:

```java
@CrossOrigin(
    origins = {
        "http://localhost:3000", // ✅ Local dev
        "https://web-production-bef07.up.railway.app"
    }
)
```

---

## 📋 Verification Checklist

After testing locally:

- [ ] Backend started successfully on port 8080
- [ ] Frontend started successfully on port 3000
- [ ] `.env` file points to `http://localhost:8080`
- [ ] Password login returns 200 OK
- [ ] Response contains JWT token
- [ ] No duplicate entry errors
- [ ] User logged in successfully
- [ ] Redirected to homepage
- [ ] Toast shows "Login successful!"

---

## 🎁 Benefits of Local Testing

1. ✅ **Faster iteration** - No wait for Railway deployment
2. ✅ **Better debugging** - See all logs in real-time
3. ✅ **Full control** - Can restart instantly
4. ✅ **No network delays** - Everything on your machine
5. ✅ **Easier troubleshooting** - Direct access to logs

---

## 🚀 Next Steps After Local Testing

Once confirmed working locally:

1. Commit changes (already done ✅)
2. Push to GitHub (already done ✅)
3. Wait for Railway deployment (~5 minutes)
4. Switch `.env` back to production URL
5. Test on production

---

## 💡 Pro Tips

### **Quick Backend Restart:**
```bash
cd backend
mvn clean spring-boot:run
```

### **Quick Frontend Restart:**
```bash
cd frontend
npm run clean
npm start
```

### **Watch Both Logs:**
- Open 2 terminal windows
- One for backend, one for frontend
- See full request/response flow

### **Test API Directly:**
```bash
# Test password login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

## ✅ Summary

**Current Status:**
- ✅ Backend running on `http://localhost:8080`
- ✅ Frontend running on `http://localhost:3000`
- ✅ API URL configured correctly
- ✅ Code includes dual auth fix

**Ready to test!** Open `http://localhost:3000/login` and try password login now! Should work perfectly with no duplicate entry errors! 🎉

---

**Monitor both terminals to see the full flow in action!** 👀
