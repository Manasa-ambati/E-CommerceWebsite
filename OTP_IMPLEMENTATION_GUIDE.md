# OTP Email Verification - Complete Implementation Guide

## 📋 Overview

This document describes the complete OTP (One-Time Password) email verification system implemented for:
- ✅ User Signup
- ✅ User Login (optional OTP-based)
- ✅ Forgot Password / Password Reset

---

## 🔄 Complete Flow Diagrams

### 1️⃣ **SIGNUP FLOW**

```
Frontend (Signup Page)
    ↓
User enters: First Name, Last Name, Email, Password, Phone
    ↓
Frontend validates all fields
    ↓
POST /api/auth/signup
    ↓
Backend:
  - Validates input
  - Checks if email exists
  - Creates user (email_verified = false)
  - Generates 6-digit OTP
  - Stores OTP in-memory (10 min expiry)
  - Sends OTP email
    ↓
Response: { requiresOtp: true }
    ↓
Frontend shows OTP verification screen
    ↓
User enters 6-digit OTP
    ↓
POST /api/auth/verify-otp
    ↓
Backend:
  - Verifies OTP
  - Marks email as verified
  - Generates JWT token
    ↓
Response: { token, user }
    ↓
Frontend stores token & redirects to home
```

### 2️⃣ **LOGIN FLOW**

```
Frontend (Login Page)
    ↓
User enters: Email, Password
    ↓
Frontend validates fields
    ↓
POST /api/auth/login
    ↓
Backend:
  - Finds user by email
  - Verifies password
  - Generates JWT token
    ↓
Response: { token, user }
    ↓
Frontend stores token & redirects
```

### 3️⃣ **FORGOT PASSWORD FLOW**

```
Frontend (Forgot Password Page)
    ↓
Step 1: User enters email
    ↓
POST /api/auth/forgot-password
    ↓
Backend:
  - Finds user by email
  - Generates 6-digit OTP
  - Stores OTP (10 min expiry)
  - Sends OTP email
    ↓
Response: { success: true }
    ↓
Frontend shows OTP verification screen
    ↓
Step 2: User enters 6-digit OTP
    ↓
Frontend validates OTP format
    ↓
Step 3: User enters new password
    ↓
POST /api/auth/reset-password
    ↓
Backend:
  - Verifies OTP
  - Validates new password
  - Updates password (encrypted)
  - Removes used OTP
    ↓
Response: { success: true }
    ↓
Frontend redirects to login page
```

---

## 🛠️ Backend Implementation

### **Endpoints**

#### 1. **Signup**
```
POST /api/auth/signup
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890"
}

Response (200):
{
  "success": true,
  "message": "Signup successful. OTP sent to your email.",
  "data": {
    "email": "john@example.com",
    "requiresOtp": true,
    "message": "Please verify your email with OTP sent to your registered email"
  }
}
```

#### 2. **Verify OTP**
```
POST /api/auth/verify-otp
Body: {
  "email": "john@example.com",
  "otp": "123456"
}

Response (200):
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER",
      "emailVerified": true
    }
  }
}
```

#### 3. **Login**
```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "emailVerified": true
  }
}
```

#### 4. **Forgot Password**
```
POST /api/auth/forgot-password
Body: {
  "email": "john@example.com"
}

Response (200):
{
  "success": true,
  "message": "OTP sent to your email. Please check your inbox.",
  "email": "john@example.com"
}
```

#### 5. **Reset Password**
```
POST /api/auth/reset-password
Body: {
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass456!"
}

Response (200):
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

#### 6. **Resend OTP**
```
POST /api/auth/resend-otp
Body: {
  "email": "john@example.com"
}

Response (200):
{
  "success": true,
  "message": "OTP resent successfully. Check your registered email."
}
```

---

## 🎨 Frontend Implementation

### **Validation Rules**

#### Login Form:
- ✅ Email: Required, valid format
- ✅ Password: Required

#### Signup Form:
- ✅ First Name: Required, min 2 chars, letters only
- ✅ Last Name: Required, min 2 chars, letters only
- ✅ Email: Required, valid format
- ✅ Password: 
  - Min 8 characters
  - 1 uppercase letter
  - 1 lowercase letter
  - 1 number
  - 1 special character
- ✅ Phone: Required, min 10 digits

#### Forgot Password:
- ✅ Email: Required, valid format, must exist in database
- ✅ OTP: Required, exactly 6 digits
- ✅ New Password: Same strength requirements as signup
- ✅ Confirm Password: Must match new password

---

## 📧 Email Configuration

### **Development (Local)**

Add to `application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### **Getting Gmail App Password:**
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App Passwords
4. Generate password for "Mail"
5. Use this password in configuration

### **Production (Railway)**

Set environment variables:
```
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password
```

---

## 🔐 Security Features

### **OTP Security:**
- ✅ 6-digit random OTP (1,000,000 combinations)
- ✅ 10-minute expiry
- ✅ Single use (deleted after verification)
- ✅ In-memory storage (not in database)
- ✅ Rate limiting (can be added)

### **Password Security:**
- ✅ BCrypt encryption
- ✅ Minimum 8 characters
- ✅ Complexity requirements
- ✅ Password strength indicator
- ✅ Confirm password matching

### **Email Security:**
- ✅ HTML formatted emails
- ✅ Professional branding
- ✅ OTP clearly displayed
- ✅ Expiry information included

---

## 🧪 Testing the Flow

### **Test Signup:**
```bash
# 1. Signup
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test1234!",
    "phone": "1234567890"
  }'

# 2. Check email for OTP

# 3. Verify OTP
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### **Test Forgot Password:**
```bash
# 1. Request password reset
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'

# 2. Check email for OTP

# 3. Reset password
curl -X POST http://localhost:8080/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "newPassword": "NewPass123!"
  }'
```

---

## 📊 Database Schema

### **User Entity:**
```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String firstName;
    private String lastName;
    private String email;
    private String password;  // BCrypt encrypted
    private String phone;
    private Role role;
    private boolean emailVerified;  // Set to true after OTP verification
    
    // Getters and setters...
}
```

---

## 🚀 Deployment Checklist

### **Before Production:**
- [ ] Configure production email credentials
- [ ] Remove debug endpoints (`/debug/*`)
- [ ] Enable rate limiting for OTP requests
- [ ] Add OTP attempt limits (max 3-5 attempts)
- [ ] Set up monitoring and logging
- [ ] Test email delivery in production
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS
- [ ] Set up database backups

---

## 🐛 Troubleshooting

### **Email Not Sending:**
1. Check email configuration in `application.properties`
2. Verify Gmail app password is correct
3. Check console logs for errors
4. Test with `/api/auth/debug/test-email` endpoint

### **OTP Not Verifying:**
1. Check OTP expiry (10 minutes)
2. Verify correct email is being used
3. Check if OTP was already used
4. Review server logs for OTP service errors

### **Common Errors:**
- `Invalid or expired OTP` → OTP expired or already used
- `No account found with this email` → Email not registered
- `Email already registered` → User already exists
- `Invalid credentials` → Wrong password

---

## 📈 Future Enhancements

- [ ] Add OTP rate limiting (max 3 requests per hour)
- [ ] Add SMS OTP option
- [ ] Add biometric authentication
- [ ] Add 2FA (Two-Factor Authentication)
- [ ] Add password breach detection
- [ ] Add account lockout after failed attempts
- [ ] Add email templates customization
- [ ] Add analytics for OTP delivery success rate

---

## 📞 Support

For issues or questions:
1. Check console logs for detailed error messages
2. Review this documentation
3. Test with debug endpoints
4. Check email configuration

---

**Last Updated:** April 8, 2026  
**Version:** 1.0.0
