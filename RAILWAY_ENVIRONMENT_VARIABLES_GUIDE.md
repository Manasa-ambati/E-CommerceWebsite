# Railway Environment Variables - Complete Guide

## 🎯 Backend Environment Variables (Spring Boot)

### Required Variables (Must Add)

Add these in Railway Dashboard → Your Service → Variables:

```bash
# Database Configuration (Railway MySQL)
MYSQLHOST=railway-mysql-host.railway.internal
MYSQLPORT=3306
MYSQLDATABASE=ecommerce_db
MYSQLUSER=root
MYSQLPASSWORD=<your-mysql-password>

# OR if using Railway's auto-generated MySQL service:
# Railway automatically provides these when you add MySQL:
# MYSQLHOST, MYSQLPORT, MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD
```

### Essential Security Variables

```bash
# JWT Secret (REQUIRED - Change this!)
# Generate a strong random string (min 32 characters)
jwt.secret=super-secret-jwt-key-min-32-characters-long-random-string-xyz123

# JWT Expiration (milliseconds)
# 86400000 = 24 hours
jwt.expiration=86400000
```

### Email Configuration (Optional but Recommended)

```bash
# Gmail SMTP Configuration
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-specific-password
SPRING_MAIL_AUTH=true
SPRING_MAIL_STARTTLS=true
```

**Note:** Your current `application.properties` has hardcoded email credentials. For security, move them to Railway variables:

```properties
# Current (INSECURE - committed to Git):
spring.mail.password=jquuoblzfirduagv

# Should be (SECURE - in Railway Variables):
spring.mail.password=${SPRING_MAIL_PASSWORD}
```

### CORS Configuration

```bash
# Production frontend URL (replace with your actual Railway frontend URL)
CORS_ALLOWED_ORIGINS=https://your-frontend-production.up.railway.app

# Or allow multiple origins:
CORS_ALLOWED_ORIGINS=https://your-backend.up.railway.app,https://your-frontend.up.railway.app

# For development (allow all - NOT recommended for production):
CORS_ALLOWED_ORIGINS=*
```

### Server Configuration

```bash
# Railway uses dynamic port allocation
# This is already configured in application.properties line 5:
# server.port=${PORT:8080}
# No need to set PORT variable manually - Railway sets it automatically
```

### Optional Performance Variables

```bash
# Logging Level
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_ECOMMERCE=DEBUG

# File Upload Limits
SPRING_SERVLET_MULTIPART_MAX_FILE_SIZE=10MB
SPRING_SERVLET_MULTIPART_MAX_REQUEST_SIZE=10MB

# Database Connection Pool
HIKARI_MAXIMUM_POOL_SIZE=10
HIKARI_MINIMUM_IDLE=5
HIKARI_IDLE_TIMEOUT=300000
```

---

## 🎨 Frontend Environment Variables (React)

### If Deploying Frontend Separately

Create `.env.production` file in `frontend/` directory:

```bash
# Production API URL (Your Railway Backend URL)
REACT_APP_API_URL=https://your-backend-production.up.railway.app

# Environment
REACT_APP_ENV=production

# API Timeout (milliseconds)
REACT_APP_API_TIMEOUT=10000

# Default page size for pagination
REACT_APP_DEFAULT_PAGE_SIZE=12

# OTP expiry in minutes
REACT_APP_OTP_EXPIRY_MINUTES=5
```

### If Using Monorepo Setup (Recommended)

Since you're deploying both together with nixpacks.toml, the frontend will use the backend's environment.

Update `frontend/.env`:

```bash
# For local development
REACT_APP_API_URL=http://localhost:8080

# For production build (Railway)
# This gets overridden by Railway environment variable
REACT_APP_API_URL=${REACT_APP_API_URL}
```

Then set `REACT_APP_API_URL` in Railway Variables (same as backend).

---

## 📋 Complete Variable List by Priority

### 🔴 CRITICAL (Must Have)

**Backend:**
```bash
MYSQLHOST=<railway-mysql-host>
MYSQLPORT=3306
MYSQLDATABASE=ecommerce_db
MYSQLUSER=root
MYSQLPASSWORD=<password>
jwt.secret=<strong-random-32-char-string>
```

**Frontend:**
```bash
REACT_APP_API_URL=https://your-backend.up.railway.app
```

### 🟡 IMPORTANT (Should Have)

**Backend:**
```bash
CORS_ALLOWED_ORIGINS=https://your-frontend.up.railway.app
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=<app-password>
SPRING_MAIL_AUTH=true
SPRING_MAIL_STARTTLS=true
```

### 🟢 OPTIONAL (Nice to Have)

**Backend:**
```bash
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_ECOMMERCE=DEBUG
jwt.expiration=86400000
HIKARI_MAXIMUM_POOL_SIZE=10
```

**Frontend:**
```bash
REACT_APP_ENV=production
REACT_APP_API_TIMEOUT=10000
REACT_APP_DEFAULT_PAGE_SIZE=12
REACT_APP_OTP_EXPIRY_MINUTES=5
```

---

## 🔐 How to Add Variables in Railway

### Step-by-Step Instructions

1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Select your project

2. **Navigate to Variables**
   - Click on your service
   - Go to "Variables" tab

3. **Add New Variable**
   - Click "New Variable" button
   - Enter variable name and value
   - Click "Add"

4. **Repeat for All Variables**
   - Add each variable one by one
   - Values are encrypted automatically

5. **Redeploy**
   - After adding variables, trigger redeploy
   - Changes take effect on next deployment

---

## 🛡️ Security Best Practices

### ✅ DO:
- Use Railway Variables for ALL sensitive data
- Generate strong random secrets
- Use environment-specific values
- Rotate secrets periodically
- Use app-specific passwords for email

### ❌ DON'T:
- Commit `.env` files to Git
- Hardcode passwords in code
- Use weak secrets
- Share credentials in plain text
- Use production secrets in development

---

## 🔧 Quick Setup Commands

### Generate Strong JWT Secret

```bash
# Option 1: Using openssl
openssl rand -base64 32

# Option 2: Using node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Example output (use your own, not this one):
# x7XJ9vKqP3mN8wL2yR5tU6iO4pA1sD0fG9hB8cE7aZ
```

### Get Railway MySQL Credentials

After adding MySQL to Railway:

1. Go to MySQL service in Railway
2. Click "Connect" → "Copy Connection String"
3. Parse the connection string:
   ```
   mysql://user:password@host:port/database
   ```
4. Extract individual values:
   - `MYSQLHOST` = host
   - `MYSQLPORT` = port (usually 3306)
   - `MYSQLDATABASE` = database
   - `MYSQLUSER` = user
   - `MYSQLPASSWORD` = password

---

## 📊 Variable Reference Table

| Variable | Service | Required | Default | Description |
|----------|---------|----------|---------|-------------|
| `MYSQLHOST` | Backend | ✅ Yes | - | MySQL hostname |
| `MYSQLPORT` | Backend | ✅ Yes | 3306 | MySQL port |
| `MYSQLDATABASE` | Backend | ✅ Yes | ecommerce_db | Database name |
| `MYSQLUSER` | Backend | ✅ Yes | root | Database username |
| `MYSQLPASSWORD` | Backend | ✅ Yes | - | Database password |
| `jwt.secret` | Backend | ✅ Yes | - | JWT signing key (min 32 chars) |
| `jwt.expiration` | Backend | ⚠️ Recommended | 86400000 | Token validity (ms) |
| `CORS_ALLOWED_ORIGINS` | Backend | ⚠️ Recommended | * | Allowed frontend URLs |
| `SPRING_MAIL_HOST` | Backend | ⚠️ Recommended | smtp.gmail.com | SMTP server |
| `SPRING_MAIL_PORT` | Backend | ⚠️ Recommended | 587 | SMTP port |
| `SPRING_MAIL_USERNAME` | Backend | ⚠️ Recommended | - | Email address |
| `SPRING_MAIL_PASSWORD` | Backend | ⚠️ Recommended | - | Email password |
| `REACT_APP_API_URL` | Frontend | ✅ Yes | http://localhost:8080 | Backend API URL |
| `REACT_APP_ENV` | Frontend | ⚠️ Recommended | development | Environment name |
| `REACT_APP_API_TIMEOUT` | Frontend | ⚠️ Recommended | 10000 | API timeout (ms) |

---

## 🆘 Troubleshooting

### Issue: "Cannot connect to database"

**Solution:** Check MySQL variables are correct:
```bash
# Verify in Railway MySQL console
echo $MYSQLHOST
echo $MYSQLPORT
echo $MYSQLDATABASE
echo $MYSQLUSER
echo $MYSQLPASSWORD
```

### Issue: "CORS error" in browser console

**Solution:** Set correct CORS origin:
```bash
CORS_ALLOWED_ORIGINS=https://your-exact-domain.up.railway.app
```

### Issue: "JWT token invalid"

**Solution:** Ensure secret is set and long enough:
```bash
# Must be at least 32 characters
jwt.secret=this-is-a-very-long-random-string-for-security
```

### Issue: Email not sending

**Solution:** Verify SMTP credentials:
```bash
# For Gmail, use App Password, not regular password
# Generate at: myaccount.google.com/apppasswords
SPRING_MAIL_PASSWORD=16-character-app-password
```

---

## 📝 Sample Complete Configuration

### Backend Variables (Copy & Paste Template)

```bash
# Database
MYSQLHOST=mysql-12345-67890.railway.internal
MYSQLPORT=3306
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=AbCdEfGhIjKlMnOpQrStUvWxYz

# Security
jwt.secret=x7XJ9vKqP3mN8wL2yR5tU6iO4pA1sD0fG9hB8cE7aZ6yX5wV4uT3sR2qP1oN0mL
jwt.expiration=86400000

# CORS
CORS_ALLOWED_ORIGINS=https://my-ecommerce-app.up.railway.app

# Email
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=myemail@gmail.com
SPRING_MAIL_PASSWORD=abcd efgh ijkl mnop  # Gmail app password
SPRING_MAIL_AUTH=true
SPRING_MAIL_STARTTLS=true

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_ECOMMERCE=DEBUG
```

### Frontend Variables

```bash
REACT_APP_API_URL=https://my-ecommerce-app.up.railway.app
REACT_APP_ENV=production
REACT_APP_API_TIMEOUT=10000
REACT_APP_DEFAULT_PAGE_SIZE=12
REACT_APP_OTP_EXPIRY_MINUTES=5
```

---

## ✅ Pre-Deployment Checklist

Before deploying to Railway, verify:

- [ ] All 🔴 CRITICAL variables added
- [ ] JWT secret is strong (32+ characters)
- [ ] MySQL credentials are correct
- [ ] CORS allows your frontend domain
- [ ] Email credentials use app-specific password
- [ ] No hardcoded secrets in code
- [ ] `.env` files are in `.gitignore`
- [ ] Frontend API URL points to production backend

---

## 🎉 Post-Deployment Verification

After deployment, test that variables are working:

1. **Check Backend Logs**
   ```
   Railway → Logs → Look for:
   ✅ "Connected to database"
   ✅ "Started EcommerceApplication"
   ```

2. **Test API Endpoint**
   ```bash
   curl https://your-backend.up.railway.app/api/products
   ```

3. **Test Frontend Connection**
   ```
   Open browser console → Network tab
   Verify API calls go to correct URL
   ```

4. **Test Email Sending**
   ```
   Try signup → Verify OTP email arrives
   ```

---

**Status:** Ready to configure Railway environment variables! 🚀

Copy the relevant sections above and add them to your Railway dashboard.
