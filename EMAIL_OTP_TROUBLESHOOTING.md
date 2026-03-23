# Email OTP Troubleshooting Guide

## Issue: Not Receiving OTP Verification Email

### Current Configuration

Your application is configured to send emails using:
- **SMTP Host:** smtp.gmail.com
- **SMTP Port:** 587 (TLS)
- **Email:** manasaambati244@gmail.com
- **Password:** [App Password configured]

---

## 🔍 Step-by-Step Troubleshooting

### 1. Check Console Logs

When you request an OTP, check the backend console for these messages:

**✅ Success:**
```
========================================
Attempting to send OTP email to: John (john@example.com)
OTP: 123456
========================================

✅ OTP email sent successfully to: john@example.com
Check spam/junk folder if not in inbox!
```

**❌ Failure:**
```
========================================
Attempting to send OTP email to: John (john@example.com)
OTP: 123456
========================================

❌ MessagingException - Failed to send OTP email to: john@example.com
Error details: [error message]
```

If you see the failure message, continue troubleshooting below.

---

### 2. Verify Gmail App Password

The password in `application.properties` MUST be a Gmail **App Password**, not your regular Gmail password.

#### How to Generate Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Select **Security** from the left menu
3. Enable **2-Step Verification** (if not already enabled)
4. Go back to Security → **2-Step Verification** → Scroll down to **App passwords**
5. Click **App passwords**
6. Select app: **Mail**
7. Select device: **Other (Custom name)** → Enter "ShopEase"
8. Click **Generate**
9. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
10. **Remove spaces** and update in `application.properties`:

```properties
spring.mail.password=abcdefghijklmnop
```

---

### 3. Test Email Connection

Use the test endpoint to verify email configuration:

**Request:**
```bash
POST http://localhost:8080/api/auth/debug/test-email
Content-Type: application/json

{
  "email": "your-email@example.com",
  "name": "Your Name"
}
```

**Using cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/debug/test-email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"your-email@example.com\",\"name\":\"Test User\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent! Check console and your inbox.",
  "otp": "123456"
}
```

---

### 4. Check Spam/Junk Folder

Gmail and other email providers sometimes mark automated emails as spam.

**What to do:**
1. Check your **Spam** or **Junk** folder
2. Search for subject: "ShopEase - Email Verification OTP"
3. Mark as "Not Spam" if found
4. Add sender to contacts: `manasaambati244@gmail.com`

---

### 5. Common Error Messages & Solutions

#### Error: "Authentication failed"
**Cause:** Wrong password or app password not generated

**Solution:**
```properties
# Regenerate Gmail App Password (see step 2)
spring.mail.password=new-app-password-here
```

---

#### Error: "Connection timed out" or "Connect timed out"
**Cause:** Firewall blocking port 587 or internet connection issue

**Solution:**
1. Check internet connection
2. Disable firewall temporarily for testing
3. Try alternative port 465 (SSL):

```properties
spring.mail.port=465
spring.mail.properties.mail.smtp.starttls.enable=false
spring.mail.properties.mail.smtp.ssl.enable=true
```

---

#### Error: "Relay access denied" or "Sender not permitted"
**Cause:** Gmail username doesn't match 'from' address

**Solution:** Ensure both are the same:
```properties
spring.mail.username=manasaambati244@gmail.com
spring.mail.from=manasaambati244@gmail.com
```

---

#### Error: "Invalid Addresses" or "Recipient address rejected"
**Cause:** Invalid recipient email format

**Solution:** Verify email format is correct (e.g., `user@example.com`)

---

### 6. Alternative: Use Console OTP

For development/testing, OTPs are always printed to console even if email fails:

```
========================================
Attempting to send OTP email to: John (john@example.com)
OTP: 123456
========================================
```

You can use this OTP directly for testing without waiting for email.

---

### 7. Enable Mail Debug Logging

To see detailed SMTP communication, add to `application.properties`:

```properties
spring.mail.properties.mail.debug=true
logging.level.jakarta.mail=DEBUG
```

This will show full SMTP conversation in console logs.

---

### 8. Check Email Quota/Limits

Gmail has sending limits:
- **500 emails per day** for free Gmail accounts
- **100 recipients per message** maximum

If you've exceeded limits, wait 24 hours or use a different email service.

---

## 🚀 Quick Test Commands

### Test Signup Flow:

```bash
# 1. Signup (triggers OTP)
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890"
  }'

# 2. Check console for OTP, then verify
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

---

## 📧 Alternative Email Services

If Gmail continues to have issues, consider:

### SendGrid (Free tier: 100 emails/day)
```properties
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=apikey
spring.mail.password=YOUR_SENDGRID_API_KEY
```

### AWS SES (Free tier: 62,000 emails/month from EC2)
```properties
spring.mail.host=email-smtp.us-east-1.amazonaws.com
spring.mail.port=587
spring.mail.username=YOUR_AWS_SMTP_USERNAME
spring.mail.password=YOUR_AWS_SMTP_PASSWORD
```

---

## ✅ Verification Checklist

- [ ] Gmail App Password generated (not regular password)
- [ ] App password updated in `application.properties`
- [ ] Backend server restarted after password change
- [ ] Test email endpoint works (`/api/auth/debug/test-email`)
- [ ] Checked spam/junk folder
- [ ] Console shows "✅ OTP email sent successfully"
- [ ] Internet connection is stable
- [ ] Email quota not exceeded

---

## 🆘 Still Not Working?

### Last Resort Options:

1. **Use Console OTP:** Copy OTP from console logs (always available)

2. **Disable Email Temporarily:** Set `emailVerified=true` during signup

3. **Use Different Email Provider:** Try Outlook, Yahoo, etc.

4. **Check Gmail Settings:**
   - Visit: https://support.google.com/mail/answer/7126229
   - Review "Third-party app passwords" section

5. **Contact Support:** If all else fails, there may be account-specific restrictions

---

## 📝 Current Test Email Template

The email sent includes:
- ✅ Professional HTML design with ShopEase branding
- ✅ Large, clear OTP code display
- ✅ Expiration notice (10 minutes)
- ✅ Security warnings
- ✅ Mobile-responsive layout

Example preview:
```
┌─────────────────────────────────────┐
│  🛒 ShopEase                        │
│  Your One-Stop Shopping Destination │
├─────────────────────────────────────┤
│  Hello John!                        │
│                                     │
│  Your Verification Code:            │
│  ┌───────────────────┐              │
│  │    1 2 3 4 5 6    │              │
│  │  Valid 10 min     │              │
│  └───────────────────┘              │
│                                     │
│  Happy Shopping! 🎉                 │
└─────────────────────────────────────┘
```

---

## 🔐 Security Notes

⚠️ **Important Security Reminders:**

1. **Never commit real passwords to Git**
   - Use environment variables in production
   - Add `application.properties` to `.gitignore`

2. **Rotate App Passwords Regularly**
   - Generate new passwords every 90 days
   - Revoke old unused passwords

3. **Monitor Email Activity**
   - Check Gmail dashboard for suspicious activity
   - Review sent items regularly

4. **Production Deployment**
   - Use Railway environment variables:
   ```
   SPRING_MAIL_PASSWORD=your-app-password
   ```
   - Update `application.properties` to use:
   ```properties
   spring.mail.password=${SPRING_MAIL_PASSWORD}
   ```

---

## Summary

**Most common issue:** Using regular Gmail password instead of App Password

**Quick fix:** Generate Gmail App Password → Update config → Restart server → Test

**Fallback:** Always use OTP from console logs for development testing

Good luck! 🚀
