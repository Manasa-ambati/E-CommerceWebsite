# 🚀 Railway Environment Variables - Quick Setup

## 📋 Copy-Paste These Variables to Railway

### **Go to:** Railway Dashboard → Your Service → Variables Tab

---

## 🔑 Required Environment Variables

```bash
# MySQL Database (Get these from Railway MySQL service)
MYSQLHOST=containers-us-west-XXX.railway.app
MYSQLPORT=3306
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=your-mysql-password

# Email Configuration (Gmail)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-16-char-app-password

# Security
JWT_SECRET=your-random-secret-key-minimum-32-chars-here
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

# Application
PORT=8080
```

---

## 📧 How to Get Gmail App Password

### **Step-by-Step:**

1. **Visit:** https://myaccount.google.com/security

2. **Enable 2-Step Verification:**
   - Security → 2-Step Verification → Turn ON

3. **Generate App Password:**
   - Security → App Passwords
   - App: Select "Mail"
   - Device: Select "Other" → Type "ShopEase"
   - Click "Generate"
   - Copy the 16-character password (remove spaces)

4. **Example:**
   - Generated: `abcd efgh ijkl mnop`
   - Use: `abcdefghijklmnop`

---

## 🎯 Quick Setup Checklist

### **In Railway Dashboard:**

- [ ] Provision MySQL Database
- [ ] Copy MySQL variables to backend service
- [ ] Add email configuration variables
- [ ] Set JWT_SECRET (random 32+ chars)
- [ ] Set CORS_ALLOWED_ORIGINS (your frontend URL)
- [ ] Save all variables
- [ ] Redeploy application

### **After Deployment:**

- [ ] Check logs for startup errors
- [ ] Test health check endpoint
- [ ] Test email with debug endpoint
- [ ] Try signup flow
- [ ] Verify OTP email received

---

## 🧪 Test Email Configuration

### **After deploying, test with:**

```bash
curl -X POST https://your-railway-url.up.railway.app/api/auth/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com",
    "name": "Test User"
  }'
```

### **Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent! Check console and your inbox.",
  "otp": "123456"
}
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Wrong:
```
SPRING_MAIL_PASSWORD=my-gmail-regular-password
```

### ✅ Correct:
```
SPRING_MAIL_PASSWORD=abcdefghijklmnop
```
(App Password - 16 characters, no spaces)

---

### ❌ Wrong:
```
CORS_ALLOWED_ORIGINS=https://my-frontend.com/
```
(trailing slash)

### ✅ Correct:
```
CORS_ALLOWED_ORIGINS=https://my-frontend.com
```
(no trailing slash)

---

### ❌ Wrong:
```
JWT_SECRET=123
```
(too short)

### ✅ Correct:
```
JWT_SECRET=my-super-secret-key-for-jwt-tokens-12345678
```
(minimum 32 characters)

---

## 📊 Variable Reference Table

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `MYSQLHOST` | ✅ | `containers-us-west-XXX.railway.app` | From Railway MySQL |
| `MYSQLPORT` | ✅ | `3306` | From Railway MySQL |
| `MYSQLDATABASE` | ✅ | `railway` | From Railway MySQL |
| `MYSQLUSER` | ✅ | `root` | From Railway MySQL |
| `MYSQLPASSWORD` | ✅ | `your-db-password` | From Railway MySQL |
| `SPRING_MAIL_HOST` | ✅ | `smtp.gmail.com` | Gmail SMTP server |
| `SPRING_MAIL_PORT` | ✅ | `587` | SMTP port |
| `SPRING_MAIL_USERNAME` | ✅ | `you@gmail.com` | Your Gmail |
| `SPRING_MAIL_PASSWORD` | ✅ | `abcdefghijklmnop` | Gmail App Password |
| `JWT_SECRET` | ✅ | `random-32-chars-min` | JWT signing key |
| `CORS_ALLOWED_ORIGINS` | ✅ | `https://frontend.com` | Frontend URL |
| `PORT` | ✅ | `8080` | App port |

---

## 🔐 Security Notes

### **Keep These Secret:**
- ⚠️ `SPRING_MAIL_PASSWORD` - Never share publicly
- ⚠️ `MYSQLPASSWORD` - Database access
- ⚠️ `JWT_SECRET` - Token security

### **Best Practices:**
- ✅ Use strong, random JWT_SECRET
- ✅ Rotate passwords periodically
- ✅ Don't commit `.env` files to Git
- ✅ Use Railway's encrypted variables

---

## 🆘 Need Help?

### **Check Railway Logs:**
1. Railway Dashboard → Your Service
2. Click "Deployments"
3. View latest deployment logs
4. Look for errors

### **Common Log Messages:**

✅ **Success:**
```
📧 Sending OTP email to: User <email@gmail.com>
✅ Email sent successfully
```

❌ **Email Config Error:**
```
❌ Failed to send email: Authentication failed
```
→ Check `SPRING_MAIL_USERNAME` and `SPRING_MAIL_PASSWORD`

❌ **Database Error:**
```
Could not open JPA EntityManager Connection
```
→ Check all `MYSQL*` variables

---

## 🎉 Ready to Deploy!

Once all variables are set:
1. Save in Railway
2. Trigger redeploy
3. Monitor logs
4. Test the flow

**Your OTP email system will be live!** 🚀
