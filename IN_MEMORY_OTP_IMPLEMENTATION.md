# In-Memory OTP Implementation Guide

## Overview

The application now uses **in-memory OTP storage** instead of persisting OTPs to the database. This approach:
- ✅ Eliminates database writes for OTP generation
- ✅ Automatically expires OTPs after 10 minutes
- ✅ Sends OTPs via email to the user's registered email address
- ✅ Improves security by not storing OTPs permanently

---

## Architecture

### Components

1. **OtpService** (`com.ecommerce.service.OtpService`)
   - Thread-safe in-memory storage using `ConcurrentHashMap`
   - Automatic cleanup of expired OTPs
   - One-time use (OTP removed after verification)

2. **EmailService** (`com.ecommerce.service.EmailService`)
   - Sends OTP emails to users
   - Falls back to console logging if email service unavailable

3. **AuthController** (`com.ecommerce.controller.AuthController`)
   - Generates OTPs during signup/login
   - Stores OTPs in-memory via `OtpService`
   - Verifies OTPs before issuing JWT tokens

4. **User Entity**
   - Removed `otp` and `otpExpiry` fields
   - Only stores `emailVerified` status

---

## How It Works

### Signup Flow

```
User submits signup form
    ↓
Backend creates user account (email_verified = true)
    ↓
Backend generates 6-digit OTP
    ↓
OTP stored in-memory (not in database)
    ↓
OTP sent to user's registered email
    ↓
User receives OTP via email
    ↓
User enters OTP in verification form
    ↓
Backend verifies OTP from memory
    ↓
JWT token issued on success
```

### Login Flow (Existing Users)

```
User enters email/password
    ↓
Backend validates credentials
    ↓
Backend generates 6-digit OTP
    ↓
OTP stored in-memory (not in database)
    ↓
OTP sent to user's registered email
    ↓
User enters OTP
    ↓
Backend verifies OTP from memory
    ↓
JWT token issued on success
```

---

## API Endpoints

### 1. POST `/api/auth/signup`
Creates new user and sends OTP to email.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

**Response:**
```json
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

---

### 2. POST `/api/auth/login`
Sends OTP to existing user's email.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "data": {
    "email": "john@example.com",
    "requiresOtp": true,
    "message": "Please enter OTP sent to your registered email"
  }
}
```

---

### 3. POST `/api/auth/verify-otp`
Verifies OTP and returns JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
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

---

### 4. POST `/api/auth/resend-otp`
Resends OTP to user's email.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully. Check your registered email."
}
```

---

## Key Features

### 1. No Database Persistence
- OTPs are stored in `ConcurrentHashMap<String, OtpData>`
- No database writes for OTP generation
- Reduced database load

### 2. Automatic Expiration
- OTPs expire after 10 minutes
- Automatic cleanup thread removes expired OTPs
- Memory-efficient

### 3. One-Time Use
- OTP is removed immediately after successful verification
- Prevents replay attacks

### 4. Email Delivery
- OTP sent to user's registered email address
- Professional email template
- Console fallback for development

### 5. Thread-Safe
- Uses `ConcurrentHashMap` for concurrent access
- Safe for multi-threaded environments

---

## Configuration

### Email Configuration

Update `application.properties` with your email credentials:

```properties
# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### OTP Settings

Modify in `OtpService.java`:
- Default expiry: 10 minutes (line 22)
- OTP length: 6 digits (line 83 in AuthController)

---

## Testing

### Manual Testing

1. **Signup Test:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123",
       "phone": "1234567890"
     }'
   ```
   
   Check console for OTP (if email not configured).

2. **Verify OTP:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "otp": "123456"
     }'
   ```

3. **Resend OTP:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/resend-otp \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com"
     }'
   ```

---

## Monitoring

Check active OTPs (for debugging):
```java
int activeCount = otpService.getActiveOtpCount();
System.out.println("Active OTPs: " + activeCount);
```

Clear all OTPs (testing only):
```java
otpService.clearAll();
```

---

## Security Considerations

✅ **Pros:**
- OTPs not persisted (reduced attack surface)
- Automatic expiration
- One-time use prevents replay attacks
- Email delivery ensures only rightful owner receives OTP

⚠️ **Considerations:**
- OTPs lost on server restart (acceptable for short-lived codes)
- Memory usage scales with active users (automatic cleanup mitigates this)
- For production, consider Redis for distributed deployments

---

## Database Migration

Run the migration to remove OTP columns:

```sql
-- V4__remove_otp_columns.sql
ALTER TABLE users DROP COLUMN IF EXISTS otp;
ALTER TABLE users DROP COLUMN IF EXISTS otp_expiry;
```

Flyway will automatically apply this migration on next startup.

---

## Troubleshooting

### Issue: OTP not received via email
**Solution:** Check console logs - OTP is printed there as fallback.

### Issue: "Invalid or expired OTP"
**Solution:** 
- Ensure OTP is entered within 10 minutes
- Check if OTP was already used (one-time use only)
- Request a new OTP using resend endpoint

### Issue: Memory concerns
**Solution:** Monitor active OTP count and adjust expiry time if needed.

---

## Next Steps

1. Configure production email service (SendGrid, AWS SES, etc.)
2. Add rate limiting for OTP requests
3. Implement OTP attempt limits (e.g., max 3 attempts)
4. Consider Redis for horizontal scaling

---

## Summary

✅ OTPs sent to registered email during signup  
✅ OTPs NOT persisted to database  
✅ In-memory storage with automatic expiration  
✅ Email delivery with console fallback  
✅ Secure one-time use verification  

This implementation provides a clean, efficient OTP verification system without database persistence!
