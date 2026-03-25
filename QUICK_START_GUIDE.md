# Quick Start Guide - OTP Authentication System

## 🚀 Setup Instructions

### Backend Setup

1. **Database Migration**
   ```bash
   cd backend
   mvn flyway:migrate
   ```
   
   This will create the `otp_verifications` table automatically.

2. **Email Configuration** (Already configured in application.properties)
   - Current email: manasaambati244@gmail.com
   - Password: jquuoblzfirduagv (Gmail App Password)
   
   **For Production (Railway):**
   Set these environment variables:
   ```
   SPRING_MAIL_USERNAME=your-email@gmail.com
   SPRING_MAIL_PASSWORD=your-app-password
   ```

3. **Run Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   
   Backend runs on: http://localhost:8080

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run Frontend**
   ```bash
   npm start
   ```
   
   Frontend runs on: http://localhost:3000

---

## 🎯 Testing the Flow

### Test 1: New User Signup
1. Go to http://localhost:3000/signup
2. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: your-email@example.com
   - Password: test123
   - Phone: +91 9876543210
3. Click "Sign Up"
4. Check your email for OTP
5. Enter OTP on verification screen
6. ✅ You're logged in!

### Test 2: Existing User Login (OTP Method)
1. Go to http://localhost:3000/login
2. Click "OTP Login" tab
3. Enter your registered email
4. Click "Send OTP"
5. Check email for OTP
6. Enter OTP and verify
7. ✅ Logged in!

### Test 3: Existing User Login (Email/Password)
1. Go to http://localhost:3000/login
2. Click "Email Login" tab
3. Enter email and password
4. Click "Login"
5. ✅ If it's a new device, you'll get OTP for security

---

## 💾 LocalStorage Features

The system automatically stores:

1. **Saved Email** (30 days)
   - Key: `ecommerce_saved_email`
   - Used for quick login next time

2. **Last Login Time**
   - Key: `ecommerce_last_login`
   - Tracks user activity

3. **User Email**
   - Key: `ecommerce_user_email`
   - Current logged-in user

4. **Pending Signup** (temporary)
   - Key: `ecommerce_pending_signup`
   - Stores signup data during OTP verification

### Access LocalStorage Data

Open browser console and type:
```javascript
// View all ecommerce keys
Object.keys(localStorage).filter(k => k.startsWith('ecommerce_'))

// Get specific value
localStorage.getItem('ecommerce_saved_email')

// Clear all ecommerce data
localStorage.clear() // or use storageService.clear()
```

---

## 📧 Email Testing

### Check if Email Service is Working

**Option 1: Use Debug Endpoint**
```bash
curl -X POST http://localhost:8080/api/auth/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","name":"Test"}'
```

**Option 2: Check Backend Console**
When OTP is sent, you'll see:
```
📧 Sending OTP email to: Test <your-email@example.com>
✅ OTP stored in database for: your-email@example.com
✅ Email sent successfully to: Test <your-email@example.com>
```

### If Email Fails

1. **Check Gmail App Password**
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate new app password for "Mail"
   - Update in application.properties or Railway env vars

2. **Manual Verification (Development)**
   ```sql
   -- Verify user manually in database
   UPDATE users SET email_verified = true WHERE email = 'your-email@example.com';
   ```

3. **Use Debug Endpoint**
   ```bash
   curl -X POST http://localhost:8080/api/auth/debug/verify-user \
     -H "Content-Type: application/json" \
     -d '{"email":"your-email@example.com"}'
   ```

---

## 🗄️ Database Queries

### Check OTPs
```sql
-- View all OTPs
SELECT * FROM otp_verifications ORDER BY created_at DESC;

-- View unexpired OTPs
SELECT * FROM otp_verifications 
WHERE expiry_time > NOW() AND verified = false;

-- Count active OTPs
SELECT COUNT(*) FROM otp_verifications 
WHERE expiry_time > NOW() AND verified = false;
```

### Check Users
```sql
-- View all users
SELECT * FROM users;

-- Check email verification status
SELECT email, first_name, email_verified, created_at 
FROM users 
ORDER BY created_at DESC;
```

---

## 🎨 UI Features

### Login Page
- **Two Modes**: Email/Password and OTP Login
- **Tab Switching**: Click tabs to switch modes
- **Auto-save Email**: Remembers email for next time
- **OTP Resend**: 30-second cooldown timer
- **Error Messages**: Red banner with helpful messages
- **Responsive**: Works on mobile and desktop

### Signup Page
- **Green Theme**: Success-oriented design
- **Form Validation**: Real-time input validation
- **OTP Verification**: Beautiful centered OTP input
- **Resend Button**: Cooldown timer prevents spam
- **Terms Text**: Legal compliance
- **Mobile Friendly**: Responsive layout

---

## 🔧 Troubleshooting

### Backend Won't Start
```bash
# Check Java version (need Java 17+)
java -version

# Clean and rebuild
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Won't Start
```bash
# Delete node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### OTP Not Sending
1. Check backend console for errors
2. Verify email credentials in application.properties
3. Test with debug endpoint first
4. Check spam folder

### Database Errors
```bash
# Drop and recreate database
mysql -u root -p
DROP DATABASE IF EXISTS ecommerce_db;
CREATE DATABASE ecommerce_db;

# Restart backend - Flyway will migrate
```

---

## 📊 API Testing with Postman/curl

### 1. Signup
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "test123",
    "phone": "+91 9876543210"
  }'
```

### 2. Login (Request OTP)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```

### 3. Verify OTP
```bash
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

### 4. Resend OTP
```bash
curl -X POST http://localhost:8080/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```

---

## ✅ Implementation Checklist

### Backend
- [x] OtpVerification entity created
- [x] OtpVerificationRepository created
- [x] OtpService updated (database-backed)
- [x] Database migration created (V5)
- [x] EmailService configured
- [x] AuthController endpoints working

### Frontend
- [x] storageService created
- [x] Login.tsx enhanced with tabs
- [x] Login.css improved
- [x] Signup.tsx enhanced with better UX
- [x] Signup.css improved
- [x] LocalStorage integration complete

### Features
- [x] OTP sent via email
- [x] OTP stored in database
- [x] OTP expiration (10 minutes)
- [x] One-time use enforcement
- [x] Email verification on signup
- [x] Login with OTP option
- [x] LocalStorage for key-value data
- [x] Auto-save email preference
- [x] Resend OTP functionality
- [x] Beautiful, responsive UI

---

## 🎉 Ready to Use!

Your E-Commerce authentication system is now fully functional with:

1. ✅ **Professional UI** - Beautiful login/signup pages
2. ✅ **Email OTP** - Secure email-based verification
3. ✅ **Database Storage** - Persistent OTP storage
4. ✅ **LocalStorage** - Client-side data management
5. ✅ **Dual Login** - Email/Password OR OTP methods
6. ✅ **Responsive Design** - Works on all devices

Start the application and test it out! 🚀

---

## 📞 Need Help?

- **Check Logs**: Backend console shows detailed OTP flow
- **Database**: Query `otp_verifications` table to see OTPs
- **Browser Console**: Check localStorage with `storageService.getAllKeys()`
- **Debug Endpoints**: Use `/api/auth/debug/*` endpoints for testing

Happy Coding! 💻✨
