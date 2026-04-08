# 🚀 Railway Deployment Guide - Complete OTP Email System

## 📋 Prerequisites

Before deploying to Railway, ensure you have:
- ✅ Railway account (https://railway.app)
- ✅ GitHub repository connected
- ✅ MySQL database provisioned in Railway
- ✅ Gmail account with App Password generated

---

## 🔑 Step 1: Generate Gmail App Password

### **Why?**
You need a Gmail App Password to send OTP emails from your application.

### **How to Generate:**

1. **Go to Google Account:**
   - Visit: https://myaccount.google.com/
   - Sign in with your Gmail account

2. **Enable 2-Step Verification:**
   - Go to **Security** → **2-Step Verification**
   - Turn it ON if not already enabled
   - Follow the setup wizard

3. **Generate App Password:**
   - Go to **Security** → **App Passwords**
   - Select app: **Mail**
   - Select device: **Other (Custom name)** → Enter "ShopEase App"
   - Click **Generate**
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
   - Remove spaces: `abcdefghijklmnop`

4. **Important:**
   - ⚠️ Save this password securely
   - ⚠️ You won't be able to see it again
   - ⚠️ Don't share it publicly

---

## 🔧 Step 2: Configure Railway Environment Variables

### **Access Railway Dashboard:**

1. Go to https://railway.app
2. Select your project
3. Click on your service
4. Go to **Variables** tab

### **Add These Environment Variables:**

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `MYSQLHOST` | From Railway MySQL | Database host |
| `MYSQLPORT` | From Railway MySQL | Database port (usually 3306) |
| `MYSQLDATABASE` | From Railway MySQL | Database name |
| `MYSQLUSER` | From Railway MySQL | Database username |
| `MYSQLPASSWORD` | From Railway MySQL | Database password |
| `SPRING_MAIL_HOST` | `smtp.gmail.com` | Gmail SMTP server |
| `SPRING_MAIL_PORT` | `587` | SMTP port |
| `SPRING_MAIL_USERNAME` | `your-email@gmail.com` | Your Gmail address |
| `SPRING_MAIL_PASSWORD` | `your-app-password` | Gmail App Password (16 chars) |
| `JWT_SECRET` | `your-secret-key-here` | Random secret for JWT tokens |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend-url.com` | Your frontend URL |
| `PORT` | `8080` | Application port |

### **How to Get MySQL Variables:**

1. In Railway, provision a **MySQL** database
2. Click on the MySQL service
3. Go to **Variables** tab
4. Copy these values:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

### **Example Configuration:**

```
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=myemail@gmail.com
SPRING_MAIL_PASSWORD=abcdefghijklmnop
JWT_SECRET=my-super-secret-key-for-jwt-tokens-12345
CORS_ALLOWED_ORIGINS=https://shopease-frontend.vercel.app
PORT=8080
```

---

## 📦 Step 3: Deploy to Railway

### **Option A: Deploy from GitHub (Recommended)**

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Railway deployment with OTP email"
   git push origin main
   ```

2. **Connect to Railway:**
   - Go to https://railway.app
   - Click **New Project**
   - Select **Deploy from GitHub repo**
   - Choose your repository

3. **Railway will automatically:**
   - Detect your `railway.json` configuration
   - Build the backend with Maven
   - Set up the MySQL database
   - Deploy the application

### **Option B: Deploy Using Railway CLI**

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

---

## ✅ Step 4: Verify Deployment

### **Check if Deployment Succeeded:**

1. Go to your Railway dashboard
2. Click on your service
3. Check the **Deployments** tab
4. Look for green ✅ (success) status

### **Test the Application:**

1. **Get your Railway URL:**
   - In Railway dashboard → **Settings** → **Domains**
   - Copy the generated URL (e.g., `https://ecommerce-production-xxxx.up.railway.app`)

2. **Test Health Check:**
   ```
   https://your-railway-url.up.railway.app/api/products/featured
   ```

3. **Test Email Configuration:**
   ```bash
   curl -X POST https://your-railway-url.up.railway.app/api/auth/debug/test-email \
     -H "Content-Type: application/json" \
     -d '{
       "email": "your-test-email@gmail.com",
       "name": "Test User"
     }'
   ```

---

## 📧 Step 5: Test OTP Email Flow

### **Test Signup with OTP:**

1. **Open your frontend:**
   ```
   https://your-frontend-url.com/signup
   ```

2. **Fill the signup form:**
   - First Name: Test
   - Last Name: User
   - Email: your-email@gmail.com
   - Password: SecurePass123!
   - Phone: 1234567890

3. **Submit the form**

4. **Check your email:**
   - You should receive an email from "ShopEase Team"
   - Subject: "Welcome to ShopEase - Email Verification OTP"
   - Contains 6-digit OTP code

5. **Enter OTP on the verification screen**

6. **Account verified!** ✅

### **Test Forgot Password:**

1. **Go to login page:**
   ```
   https://your-frontend-url.com/login
   ```

2. **Click "Forgot your password?"**

3. **Enter your registered email**

4. **Check email for OTP**

5. **Enter OTP and set new password**

6. **Login with new password** ✅

---

## 🔍 Step 6: Monitor Logs

### **View Logs in Railway:**

1. Go to Railway dashboard
2. Click on your service
3. Go to **Deployments** tab
4. Click on the latest deployment
5. View **Logs**

### **What to Look For:**

**Successful OTP Email:**
```
=== POST /api/auth/signup ===
Request: {name=Test User, email=test@gmail.com, ...}
✅ User created successfully: test@gmail.com
🔐 Generated OTP: 123456
📧 Sending OTP email to: Test <test@gmail.com>
✅ Email sent successfully
📧 OTP sent to: test@gmail.com
```

**Password Reset:**
```
=== POST /api/auth/forgot-password ===
Email: test@gmail.com
✅ User found: Test User
🔐 Generated OTP for password reset: 654321
📧 Password reset OTP sent to: test@gmail.com
```

**Email Errors:**
```
❌ Failed to send email: ...
```
If you see this, check your email configuration variables.

---

## 🛡️ Security Checklist for Production

### **Before Going Live:**

- [ ] Remove debug endpoints from `AuthController.java`:
  - `/api/auth/debug/enable-all-users`
  - `/api/auth/debug/verify-user`
  - `/api/auth/debug/auto-verify-all`
  - `/api/auth/debug/test-email`

- [ ] Set strong JWT_SECRET (minimum 32 characters)
- [ ] Enable HTTPS (Railway does this automatically)
- [ ] Set correct CORS_ALLOWED_ORIGINS (your frontend domain)
- [ ] Use strong database password
- [ ] Enable Railway's automatic backups
- [ ] Set up monitoring and alerts

### **Optional Enhancements:**

- [ ] Add rate limiting for OTP requests
- [ ] Add OTP attempt limits (max 3-5 attempts)
- [ ] Set up custom domain
- [ ] Enable Railway's protected service
- [ ] Add logging service (e.g., Logtail, Datadog)

---

## 🐛 Troubleshooting

### **Problem: Email Not Sending**

**Check:**
1. ✅ `SPRING_MAIL_USERNAME` is correct Gmail address
2. ✅ `SPRING_MAIL_PASSWORD` is App Password (not regular password)
3. ✅ 2-Step Verification is enabled on Gmail
4. ✅ Railway variables are saved and deployed
5. ✅ Check Railway logs for error messages

**Test:**
```bash
curl -X POST https://your-railway-url.up.railway.app/api/auth/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@gmail.com", "name": "Test"}'
```

### **Problem: Database Connection Failed**

**Check:**
1. ✅ MySQL database is provisioned in Railway
2. ✅ All MYSQL* variables are correct
3. ✅ Database is in the same Railway project
4. ✅ Check Railway logs for connection errors

### **Problem: CORS Errors**

**Fix:**
```
CORS_ALLOWED_ORIGINS=https://your-actual-frontend-domain.com
```
Make sure there are no trailing slashes or spaces.

### **Problem: OTP Not Verifying**

**Check:**
1. ✅ OTP is entered within 10 minutes
2. ✅ Correct email is being used
3. ✅ OTP hasn't been used already
4. ✅ Backend logs show OTP verification attempts

---

## 📊 Railway Service Architecture

```
┌─────────────────────────────────────────┐
│           RAILWAY PROJECT               │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Backend Service (Java/Spring)   │ │
│  │                                   │ │
│  │  - REST API Endpoints             │ │
│  │  - OTP Generation & Verification  │ │
│  │  - Email Service (Gmail SMTP)     │ │
│  │  - JWT Authentication             │ │
│  │  - MySQL Connection               │ │
│  └───────────────────────────────────┘ │
│              ↕                          │
│  ┌───────────────────────────────────┐ │
│  │   MySQL Database                  │ │
│  │                                   │ │
│  │  - User data                      │ │
│  │  - Products                       │ │
│  │  - Orders                         │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## 💰 Railway Pricing

### **Free Tier (Hobby Plan):**
- ✅ 500MB RAM
- ✅ 1GB disk storage
- ✅ No credit card required
- ✅ Sleeps after inactivity
- ✅ Perfect for testing

### **Pro Plan ($5/month):**
- ✅ 2GB RAM
- ✅ 5GB disk storage
- ✅ No sleep
- ✅ Custom domains
- ✅ Priority support

**For OTP email system, free tier is sufficient for testing!**

---

## 🎯 Quick Deployment Checklist

### **Before Deploying:**

- [ ] Gmail App Password generated
- [ ] All environment variables configured
- [ ] MySQL database provisioned
- [ ] Code pushed to GitHub
- [ ] `railway.json` configured
- [ ] CORS origins set correctly
- [ ] JWT secret set

### **After Deploying:**

- [ ] Application starts successfully
- [ ] Health check passes
- [ ] Email test succeeds
- [ ] Signup flow works
- [ ] OTP email received
- [ ] OTP verification works
- [ ] Forgot password flow works
- [ ] Login works with new password

---

## 📞 Support Resources

- **Railway Docs:** https://docs.railway.app
- **Spring Boot Mail:** https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.email
- **Gmail App Passwords:** https://support.google.com/accounts/answer/185833

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ Railway shows green deployment status  
✅ Health check endpoint responds  
✅ Test email endpoint sends email  
✅ Signup triggers OTP email  
✅ OTP verification activates account  
✅ Forgot password sends reset OTP  
✅ New password allows login  

---

**Last Updated:** April 8, 2026  
**Version:** 1.0.0  
**Status:** ✅ Ready for Production
