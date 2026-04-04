# 🚀 Complete Railway Setup Guide - E-Commerce Project

## 📋 Overview

You have 3 services in Railway:
1. **MySQL Database** - Data storage
2. **Backend (Spring Boot)** - API server
3. **Frontend (React)** - User interface

---

## ⚡ QUICK START - Follow These Steps in Order

### PHASE 1: Configure MySQL Database

#### Step 1.1: Get MySQL Connection Details

1. Go to Railway Dashboard → Your MySQL Service
2. Click **"Connect"** tab
3. Copy these values (you'll need them):
   ```
   MYSQLHOST = mysql-xxxx-xxxx.railway.internal
   MYSQLPORT = 3306
   MYSQLDATABASE = railway (or your database name)
   MYSQLUSER = root
   MYSQLPASSWORD = <copy-the-password>
   ```

4. **Screenshot or save these credentials** - You'll add them to Backend next!

---

### PHASE 2: Configure Backend Service

#### Step 2.1: Enable Public Networking

1. Go to Railway Dashboard → **Backend Service**
2. Click **"Networking"** tab
3. Toggle **"Public Networking"** to ON
4. Wait 30 seconds
5. A URL will appear: `https://backend-xxx-production.up.railway.app`
6. **COPY THIS URL** - You need it for Frontend!

#### Step 2.2: Add Environment Variables

In Railway Dashboard → Backend Service → **"Variables"** tab:

Click "New Variable" and add these one by one:

```bash
# === DATABASE (From MySQL Connect tab) ===
MYSQLHOST=mysql-xxxx-xxxx.railway.internal
MYSQLPORT=3306
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=<paste-your-mysql-password>

# === SECURITY (Generate your own JWT secret) ===
jwt.secret=x7XJ9vKqP3mN8wL2yR5tU6iO4pA1sD0fG9hB8cE7aZ6yX5wV4uT3sR2qP1oN0mL

# === CORS (Allow your frontend URL) ===
CORS_ALLOWED_ORIGINS=https://e-commercewebsite-production-f839.up.railway.app

# === EMAIL CONFIGURATION (Optional but recommended) ===
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=manasaambati244@gmail.com
SPRING_MAIL_PASSWORD=<your-gmail-app-password>
SPRING_MAIL_AUTH=true
SPRING_MAIL_STARTTLS=true

# === LOGGING (Optional) ===
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_ECOMMERCE=DEBUG
```

**How to generate JWT secret:**
```bash
# Run locally or use this example:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: x7XJ9vKqP3mN8wL2yR5tU6iO4pA1sD0fG9hB8cE7aZ6yX5wV4uT3sR2qP1oN0mL
# Use the output as jwt.secret value
```

**How to get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Click "Generate"
4. Copy the 16-character password (no spaces)
5. Use this in `SPRING_MAIL_PASSWORD`

#### Step 2.3: Configure Build & Start Commands

In Railway Dashboard → Backend Service → **"Settings"** tab:

**Build Command:**
```
mvn clean package -DskipTests
```

**Start Command:**
```
java -jar backend/target/*.jar
```

**Healthcheck Path:**
```
/api/products/featured
```

**Healthcheck Timeout:**
```
300
```

#### Step 2.4: Redeploy Backend

1. Go to Backend Service → **"Deployments"** tab
2. Click **"Redeploy"** button
3. Wait 3-5 minutes
4. Watch logs for: ✅ "Started EcommerceApplication"

---

### PHASE 3: Configure Frontend Service

#### Step 3.1: Add Environment Variables

In Railway Dashboard → Frontend Service → **"Variables"** tab:

Add these variables:

```bash
# === BACKEND API URL (Use YOUR backend Railway URL) ===
REACT_APP_API_URL=https://backend-xxx-production.up.railway.app

# === ENVIRONMENT (Optional) ===
REACT_APP_ENV=production

# === TIMEOUT (Optional) ===
REACT_APP_API_TIMEOUT=10000

# === PAGINATION (Optional) ===
REACT_APP_DEFAULT_PAGE_SIZE=12

# === OTP (Optional) ===
REACT_APP_OTP_EXPIRY_MINUTES=5
```

**⚠️ IMPORTANT:** Replace `https://backend-xxx-production.up.railway.app` with YOUR actual backend URL from Step 2.1!

#### Step 3.2: Configure Build & Start Commands

In Railway Dashboard → Frontend Service → **"Settings"** tab:

**Build Command:**
```
CI=false npm run build
```

**Start Command:**
```
npx serve -s build -l $PORT
```

#### Step 3.3: Redeploy Frontend

1. Go to Frontend Service → **"Deployments"** tab
2. Click **"Redeploy"** button
3. Wait 2-3 minutes

---

### PHASE 4: Verify Everything Works

#### Step 4.1: Check Backend is Running

1. Open browser
2. Go to: `https://your-backend-url.up.railway.app/api/products/featured`
3. Should see JSON response with products

**Example:**
```json
{
  "success": true,
  "data": [...]
}
```

If you see JSON → ✅ Backend is working!

#### Step 4.2: Check Frontend is Running

1. Open browser
2. Go to: `https://e-commercewebsite-production-f839.up.railway.app`
3. Should see your e-commerce homepage

#### Step 4.3: Test Full Integration

1. Open Frontend URL in browser
2. Try browsing products
3. Try adding to cart
4. Try signup/login

**Open DevTools (F12) → Network tab:**
- All API calls should go to: `https://your-backend-url.up.railway.app/api/...`
- No errors in Console tab
- Status codes should be 200 OK

---

## 🔧 Troubleshooting

### Issue 1: Backend Won't Start

**Check Logs:**
```
Railway → Backend → Deployments → Click latest → View Logs
```

**Look for errors:**
- ❌ "Cannot connect to database" → Check MySQL credentials
- ❌ "Port already in use" → Railway uses dynamic ports, check application.properties
- ❌ "Failed to start" → Check jwt.secret is set

**Fix:**
```bash
# Verify all variables are set correctly:
MYSQLHOST, MYSQLPORT, MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD
jwt.secret (must be 32+ characters)
CORS_ALLOWED_ORIGINS (must include your frontend URL)
```

### Issue 2: Frontend Can't Connect to Backend

**Symptoms:**
- Frontend loads but shows no products
- Console errors: "Failed to fetch" or CORS errors
- Network tab shows requests failing

**Solution:**

1. **Check REACT_APP_API_URL is correct:**
   ```bash
   # In Frontend Variables:
   REACT_APP_API_URL=https://actual-backend-url.up.railway.app
   ```

2. **Verify CORS in Backend:**
   ```bash
   # In Backend Variables:
   CORS_ALLOWED_ORIGINS=https://e-commercewebsite-production-f839.up.railway.app
   ```

3. **Test Backend Directly:**
   ```
   Visit: https://your-backend-url.up.railway.app/api/products/featured
   Should return JSON
   ```

4. **Rebuild Frontend:**
   - After changing REACT_APP_API_URL, must rebuild frontend
   - Frontend → Deployments → Redeploy

### Issue 3: Database Errors

**Symptoms:**
- "Cannot connect to database"
- "Table doesn't exist"

**Solution:**

1. **Verify MySQL is connected to project:**
   ```
   Railway Dashboard → Should show all 3 services in same project
   ```

2. **Check MySQL credentials match exactly:**
   ```bash
   # Compare with MySQL Connect tab:
   MYSQLHOST=
   MYSQLPORT=
   MYSQLDATABASE=
   MYSQLUSER=
   MYSQLPASSWORD=
   ```

3. **Wait for Flyway migrations:**
   - On first startup, Flyway creates tables automatically
   - Takes 1-2 minutes
   - Check logs for: "Flyway migration completed"

### Issue 4: Email Not Sending

**Symptoms:**
- Signup works but no OTP email arrives

**Solution:**

1. **Use Gmail App Password, not regular password:**
   ```
   https://myaccount.google.com/apppasswords
   Generate password for "Mail"
   Use 16-character code (no spaces)
   ```

2. **Verify email variables:**
   ```bash
   SPRING_MAIL_HOST=smtp.gmail.com
   SPRING_MAIL_PORT=587
   SPRING_MAIL_USERNAME=your-email@gmail.com
   SPRING_MAIL_PASSWORD=<app-password-not-regular>
   SPRING_MAIL_AUTH=true
   SPRING_MAIL_STARTTLS=true
   ```

3. **Check backend logs:**
   ```
   Look for: "Sending email to..."
   If not appearing, email service not configured
   ```

---

## 📊 Complete Configuration Summary

### MySQL Service
```
✅ No configuration needed
✅ Railway auto-manages
✅ Copy credentials for Backend
```

### Backend Service
```
✅ Public Networking: ENABLED
✅ Build Command: mvn clean package -DskipTests
✅ Start Command: java -jar backend/target/*.jar
✅ Healthcheck: /api/products/featured

Variables:
- MYSQLHOST (from MySQL)
- MYSQLPORT (3306)
- MYSQLDATABASE (from MySQL)
- MYSQLUSER (root)
- MYSQLPASSWORD (from MySQL)
- jwt.secret (32+ char random string)
- CORS_ALLOWED_ORIGINS (frontend URL)
- SPRING_MAIL_* (email config)
```

### Frontend Service
```
✅ Public Networking: Already enabled (has URL)
✅ Build Command: CI=false npm run build
✅ Start Command: npx serve -s build -l $PORT

Variables:
- REACT_APP_API_URL (backend Railway URL)
- REACT_APP_ENV=production (optional)
- REACT_APP_API_TIMEOUT=10000 (optional)
```

---

## 🎯 Final Checklist

Before testing, verify:

- [ ] MySQL service running and connected to project
- [ ] Backend has all 5 MySQL variables set
- [ ] Backend has jwt.secret (32+ characters)
- [ ] Backend has CORS_ALLOWED_ORIGINS with frontend URL
- [ ] Backend Public Networking enabled
- [ ] Backend shows a Railway URL
- [ ] Frontend has REACT_APP_API_URL with backend URL
- [ ] Both services redeployed after adding variables
- [ ] No errors in deployment logs
- [ ] Backend healthcheck passes: `/api/products/featured` returns JSON
- [ ] Frontend loads without console errors

---

## 🆘 Emergency Support

If still stuck:

1. **Share screenshots of:**
   - Railway project showing all 3 services
   - Backend Variables tab
   - Frontend Variables tab
   - Latest deployment logs (both services)

2. **Check Railway status:**
   - https://status.railway.app

3. **Contact Railway support:**
   - Discord: https://discord.gg/railway
   - Twitter: @Railway

---

## ✨ Success Indicators

Your setup is complete when:

✅ All 3 services show "Running" in Railway  
✅ Backend URL accessible: `https://backend-xxx.up.railway.app/api/products/featured`  
✅ Frontend URL accessible: `https://e-commercewebsite-production-f839.up.railway.app`  
✅ Can browse products on frontend  
✅ Can add to cart  
✅ Can sign up and receive OTP email  
✅ Can login  
✅ No errors in browser console  

---

## 🎉 You're Done!

Follow these steps in order, and your e-commerce app will be live on Railway!

**Estimated time:** 15-20 minutes total

**Need help?** Share what step you're stuck on and I'll guide you through!
