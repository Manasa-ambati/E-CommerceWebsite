# User Authentication Guide - OTP Verification via Email

## Overview

The e-commerce platform uses **email-based OTP (One-Time Password) verification** for user authentication. This ensures that all registered users have verified email addresses, improving security and reducing fake accounts.

---

## Authentication Flow

### 1. **Signup Process**

```
User fills signup form
    ↓
Backend creates user account (email_verified = false)
    ↓
Backend generates 6-digit OTP
    ↓
OTP sent to user's email + stored in database
    ↓
User receives OTP verification screen
    ↓
User enters OTP
    ↓
Backend validates OTP
    ↓
Email marked as verified + JWT token generated
    ↓
User logged in successfully
```

#### API Endpoints:

**POST** `/api/auth/signup`
```json
Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}

Response (Success):
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete registration.",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "requiresOtp": true
}
```

**POST** `/api/auth/verify-otp`
```json
Request:
{
  "email": "john@example.com",
  "otp": "123456"
}

Response (Success):
{
  "success": true,
  "message": "Email verified successfully!",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER"
    }
  }
}
```

**POST** `/api/auth/resend-otp`
```json
Request:
{
  "email": "john@example.com"
}

Response:
{
  "success": true,
  "message": "New OTP sent to your email"
}
```

---

### 2. **Login Process**

```
User enters credentials
    ↓
Backend validates credentials
    ↓
Check if email is verified
    ↓
If NOT verified → Generate & send OTP → Show OTP screen
    ↓
If verified → Generate JWT token
    ↓
User logged in
```

#### API Endpoint:

**POST** `/api/auth/login`
```json
Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response (Success - Email Verified):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}

Response (Email Not Verified):
{
  "success": false,
  "message": "EMAIL_NOT_VERIFIED",
  "requiresOtp": true
}
```

---

## Email Configuration

### Setup Gmail App Password

The application uses Gmail SMTP to send OTP emails. Follow these steps to configure:

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/security

2. **Enable 2-Step Verification:**
   - If not already enabled, turn on 2-Step Verification

3. **Generate App Password:**
   - Visit: https://myaccount.google.com/apppasswords
   - Select 'Mail' and your device
   - Click 'Generate'
   - Copy the 16-character password (remove spaces)

4. **Update application.properties:**
   ```properties
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-16-char-app-password
   spring.mail.properties.mail.smtp.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true
   ```

### Current Configuration

**File:** `backend/src/main/resources/application.properties`

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=manasaambati244@gmail.com
spring.mail.password=            # TODO: Add your Gmail App Password here
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

⚠️ **IMPORTANT:** Without the app password, emails won't be sent, but OTPs will still be printed to the backend console for testing.

---

## OTP Details

### OTP Specifications:

- **Format:** 6-digit numeric code (e.g., `123456`)
- **Validity:** 10 minutes from generation
- **Delivery:** Email + Backend Console
- **Storage:** Database (users table: `otp`, `otp_expiry` columns)

### Where to Find OTP:

1. **Email Inbox** (if email configured correctly)
2. **Backend Terminal Console** (always available):
   ```
   ========================================
   OTP for John (john@example.com): 123456
   ========================================
   ```

---

## Testing the Authentication

### Test Scenario 1: New User Signup

1. Navigate to `/signup`
2. Fill in the form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - Password: `test123`
   - Confirm Password: `test123`
   - Phone: `1234567890`
3. Click "Sign Up"
4. Check backend console for OTP (or email inbox)
5. Enter OTP in the verification form
6. Click "Verify Email"
7. ✅ Should redirect to home page as logged-in user

### Test Scenario 2: Login with Unverified Email

1. Create a new account but DON'T verify the OTP
2. Navigate to `/login`
3. Enter credentials
4. System will automatically send OTP
5. Check email/console for OTP
6. Enter OTP
7. ✅ Should verify and login

### Test Scenario 3: Resend OTP

1. During signup or login OTP screen
2. Click "Resend OTP" button
3. ✅ Should receive new OTP via email/console

---

## Database Schema

### Users Table Structure:

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    role ENUM('CUSTOMER', 'ADMIN') DEFAULT 'CUSTOMER',
    email_verified BOOLEAN DEFAULT false,
    otp VARCHAR(255),
    otp_expiry DATETIME(6),
    created_at DATETIME(6),
    updated_at DATETIME(6)
);
```

### Key Fields:

- `email_verified`: `false` = needs OTP verification
- `otp`: Stores current OTP (null after verification)
- `otp_expiry`: OTP expiration time (null after verification)

---

## Security Features

### Password Encryption:
- BCrypt password hashing (strong, salted hash)
- Passwords never stored in plain text

### Token Security:
- JWT tokens expire after 24 hours (configurable)
- Tokens signed with 256-bit secret key
- Required for all authenticated endpoints

### OTP Security:
- 6-digit random OTP (1,000,000 combinations)
- 10-minute expiration window
- Automatically invalidated after use
- Rate-limited via resend functionality

---

## Troubleshooting

### Issue 1: OTP Email Not Received

**Symptoms:** User doesn't receive OTP email

**Solutions:**
1. Check backend console - OTP is always printed there
2. Verify Gmail app password is configured in `application.properties`
3. Check spam/junk folder
4. Verify email address is correct
5. Check backend logs for email sending errors

**Quick Fix (Development):**
```bash
# Check backend terminal for OTP output
tail -f backend/logs/application.log | grep "OTP for"
```

### Issue 2: "Invalid OTP" Error

**Possible Causes:**
1. OTP expired (10-minute limit)
2. Wrong OTP entered
3. Using old OTP after resend

**Solution:**
- Click "Resend OTP" to get a fresh code
- Ensure OTP is entered within 10 minutes
- Double-check the 6 digits

### Issue 3: "Email already registered"

**Cause:** Email exists in database

**Solutions:**
1. Try logging in instead
2. If unverified, login will trigger OTP
3. Use different email address

### Issue 4: Login succeeds but no token received

**Cause:** Email not verified and OTP flow not triggered

**Solution:**
- Check if `requiresOtp: true` in response
- OTP should be sent automatically
- Complete OTP verification

---

## Frontend Integration

### Storage After Authentication:

After successful login/signup verification:

```javascript
localStorage.setItem('token', response.data.data.token);
localStorage.setItem('user', JSON.stringify(response.data.data.user));
```

### Auth Context Usage:

```typescript
import { useAuth } from './context/authContext';

const { user, login, logout } = useAuth();

// Check if logged in
if (user) {
  console.log('Logged in as:', user.email);
}

// Logout
logout();
```

### Protected Routes:

```typescript
<Route
  path="/wishlist"
  element={
    <ProtectedRoute>
      <Wishlist />
    </ProtectedRoute>
  }
/>
```

---

## Backend Logs to Monitor

### Successful Signup:
```
OTP for John (john@example.com): 123456
OTP email sent successfully to: john@example.com
```

### Successful Login:
```
User authenticated: john@example.com
JWT token generated for: john@example.com
```

### OTP Verification:
```
OTP verified for: john@example.com
Email marked as verified
```

### Failed Attempts:
```
Invalid OTP for: john@example.com
OTP expired for: john@example.com
Email already verified. Please login.
```

---

## API Testing with cURL

### Signup:
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890"
  }'
```

### Verify OTP:
```bash
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## Summary

✅ **Signup** → OTP sent → Verify → Logged in  
✅ **Login** → Check verified → If not, send OTP → Verify → Logged in  
✅ **Email** → Configured via Gmail SMTP  
✅ **Console** → Always shows OTP for testing  
✅ **Security** → BCrypt + JWT + OTP expiration  
✅ **UX** → Clear error messages + resend option  

For issues, check backend console logs first!
