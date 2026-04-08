# 🔧 OTP Email Not Received - Troubleshooting Guide

## ❌ Problem: Not receiving OTP email after signup

---

## ✅ Quick Fix - 3 Options

### **Option 1: Configure Email (Recommended for Production)**

You need to add Gmail App Password configuration.

#### **For Local Development:**

Create a file `backend/src/main/resources/application-local.properties`:

```properties
# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-gmail-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
spring.mail.properties.mail.smtp.connectiontimeout=10000
spring.mail.properties.mail.smtp.timeout=10000
spring.mail.properties.mail.smtp.writetimeout=10000
spring.mail.test-connection=false
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail
- `your-gmail-app-password` with Gmail App Password (16 chars)

#### **For Railway Deployment:**

Add these environment variables in Railway Dashboard → Variables:
```
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-gmail-app-password
```

---

### **Option 2: Use Debug Endpoint (Quick Testing)**

Bypass email verification for testing:

```bash
# After signup, manually verify the user
curl -X POST http://localhost:8080/api/auth/debug/verify-user \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@gmail.com"}'
```

**Or use the auto-verify all endpoint:**
```bash
curl -X POST http://localhost:8080/api/auth/debug/auto-verify-all
```

This will verify ALL unverified users in the database.

---

### **Option 3: Check Console Logs**

When you signup, check the backend console for these messages:

#### **✅ If Email is Configured:**
```
=== POST /api/auth/signup ===
✅ User created successfully: your-email@gmail.com
📧 Sending OTP email to: YourName <your-email@gmail.com>
✅ OTP email SENT SUCCESSFULLY to: your-email@gmail.com
📬 Please check inbox (and spam folder)
📧 OTP sent to: your-email@gmail.com
```

#### **❌ If Email is NOT Configured:**
```
=== POST /api/auth/signup ===
✅ User created successfully: your-email@gmail.com
📧 Sending OTP email to: YourName <your-email@gmail.com>
⚠️  MailSender not configured - skipping email send
💡 To enable email, add these Railway environment variables:
   SPRING_MAIL_USERNAME=your-email@gmail.com
   SPRING_MAIL_PASSWORD=your-app-password
📧 OTP sent to: your-email@gmail.com
```

---

## 📋 Step-by-Step Troubleshooting

### **Step 1: Check Backend Console Logs**

Look for the signup attempt and see what message appears.

### **Step 2: Verify Email Configuration**

#### **For Local Development:**

Check if environment variables are set:

**Windows (Command Prompt):**
```cmd
echo %SPRING_MAIL_USERNAME%
echo %SPRING_MAIL_PASSWORD%
```

**Windows (PowerShell):**
```powershell
$env:SPRING_MAIL_USERNAME
$env:SPRING_MAIL_PASSWORD
```

**If empty, you need to set them!**

#### **Set Environment Variables (Windows):**

**Temporary (current session only):**
```powershell
$env:SPRING_MAIL_HOST="smtp.gmail.com"
$env:SPRING_MAIL_PORT="587"
$env:SPRING_MAIL_USERNAME="your-email@gmail.com"
$env:SPRING_MAIL_PASSWORD="your-app-password"
```

**Permanent (System Environment Variables):**
1. Open System Properties
2. Environment Variables
3. Add new user variables:
   - `SPRING_MAIL_HOST` = `smtp.gmail.com`
   - `SPRING_MAIL_PORT` = `587`
   - `SPRING_MAIL_USERNAME` = `your-email@gmail.com`
   - `SPRING_MAIL_PASSWORD` = `your-app-password`
4. Restart your terminal/IDE

---

### **Step 3: Generate Gmail App Password**

If you don't have an App Password:

1. **Go to:** https://myaccount.google.com/security

2. **Enable 2-Step Verification:**
   - Click "2-Step Verification"
   - Turn it ON
   - Follow the setup

3. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter: "ShopEase App"
   - Click **Generate**
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
   - Remove spaces: `abcdefghijklmnop`

4. **Use this password** in your configuration

---

### **Step 4: Check Spam/Junk Folder**

Sometimes emails go to spam:
- ✅ Check your Spam/Junk folder
- ✅ Check Promotions tab (Gmail)
- ✅ Add `manasaambati244@gmail.com` to contacts

---

### **Step 5: Test Email Manually**

Use the test endpoint:

```bash
curl -X POST http://localhost:8080/api/auth/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent! Check console and your inbox.",
  "otp": "123456"
}
```

Check your email for the test OTP.

---

## 🔍 Common Issues & Solutions

### **Issue 1: "MailSender not configured"**

**Cause:** Environment variables not set

**Solution:**
```bash
# Set environment variables
$env:SPRING_MAIL_USERNAME="your-email@gmail.com"
$env:SPRING_MAIL_PASSWORD="your-app-password"

# Restart backend
cd backend
mvn spring-boot:run
```

---

### **Issue 2: "Authentication failed"**

**Cause:** Wrong password or not using App Password

**Solution:**
- ✅ Make sure you're using **App Password**, not regular Gmail password
- ✅ App Password is 16 characters (no spaces)
- ✅ 2-Step Verification must be enabled

---

### **Issue 3: "Connection timed out"**

**Cause:** Network/firewall blocking SMTP

**Solution:**
- ✅ Check internet connection
- ✅ Firewall may be blocking port 587
- ✅ Try different network

---

### **Issue 4: Email sent but not received**

**Cause:** Email filtered or delayed

**Solution:**
- ✅ Check Spam/Junk folder
- ✅ Check Promotions tab (Gmail)
- ✅ Wait 1-2 minutes (can be delayed)
- ✅ Check email address is correct
- ✅ Try a different email address

---

## 🚀 Quick Start - Get It Working Now

### **For Immediate Testing (Bypass Email):**

1. **Sign up a user** through the frontend

2. **Manually verify the user:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/debug/verify-user \
     -H "Content-Type: application/json" \
     -d '{"email": "your-signup-email@gmail.com"}'
   ```

3. **Login successfully** ✅

### **For Proper Email Setup:**

1. **Generate Gmail App Password** (see Step 3 above)

2. **Set environment variables:**
   ```powershell
   $env:SPRING_MAIL_USERNAME="your-email@gmail.com"
   $env:SPRING_MAIL_PASSWORD="your-16-char-app-password"
   ```

3. **Restart backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

4. **Test signup again** - You should receive OTP email! ✅

---

## 📊 Debug Checklist

Run through this checklist:

- [ ] Backend is running on port 8080
- [ ] Check console logs for signup attempt
- [ ] Look for "MailSender not configured" message
- [ ] If configured, look for "Email sent successfully"
- [ ] Check Spam/Junk folder
- [ ] Test with debug/test-email endpoint
- [ ] Verify Gmail App Password is correct
- [ ] Verify 2-Step Verification is enabled
- [ ] Environment variables are set
- [ ] Backend was restarted after setting variables

---

## 🆘 Still Not Working?

### **Get the OTP from Console (Development Mode)**

If email is configured but not working, the OTP is printed in console logs:

```
🔐 Generated OTP: 123456
```

Use this OTP to verify your account.

### **Or Use Database Directly:**

Connect to your MySQL database and run:
```sql
UPDATE user SET email_verified = true WHERE email = 'your-email@gmail.com';
```

Then login normally.

---

## ✅ Success Indicators

You'll know it's working when:

✅ Console shows: `✅ OTP email SENT SUCCESSFULLY`  
✅ Email arrives in inbox (or spam)  
✅ Email contains 6-digit OTP code  
✅ OTP verification succeeds  
✅ User can login after verification  

---

**Need more help? Check the backend console logs for specific error messages!**
