# localStorage Debugging Guide

## Enhanced Debugging Features Added

I've added extensive logging to help identify exactly where the token/user data is being lost.

## How to Debug

### Step 1: Open Browser DevTools
- Press **F12** or **Ctrl+Shift+J** (Windows/Linux) / **Cmd+Option+J** (Mac)
- Go to the **Console** tab

### Step 2: Clear Console
- Click the 🚫 button to clear previous logs
- This ensures you see fresh logs only

### Step 3: Login
- Go to `http://localhost:3000/login`
- Enter your credentials
- Click Login

### Step 4: Watch Console Output

You should see detailed logs like this:

```
🔵 LOGIN FORM SUBMITTED!
Email: user@example.com
Password: ***

Attempting login with: { email: 'user@example.com', password: '***' }

=== LOGIN RESPONSE DEBUG ===
Full response object: {...}
response.data: {...}
Type of response.data: object
Keys in response.data: ['success', 'data', 'message']
response.data.success: true
response.data.data: {...}
response.data.data.token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
response.data.token (direct): undefined
===========================

✓ Token found at: response.data.data.token

Extracted userData: { id: '123', email: 'user@example.com', name: 'User Name' }
Extracted token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

=== STORING AUTH DATA ===
Token to save: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User data to save: { id: '123', email: 'user@example.com', name: 'User Name' }

=== AFTER STORAGE ===
Token saved: YES ✓
User saved: YES ✓
Saved token length: 245
Saved user: {"id":"123","email":"user@example.com","name":"User Name"}
======================
```

### Step 5: Navigate to Home
After login, you should see:

```
🔵 Navbar mounted - checking auth state...

=== AUTH STATE CHECK STARTED ===
Raw token from localStorage: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Raw user from localStorage: {"id":"123","email":"user@example.com","name":"User Name"}
Token type: string
Token is empty string: false
Token is null: false
Token length: 245
================================

✓ User is LOGGED IN
User loaded successfully: { id: '123', email: 'user@example.com', name: 'User Name' }
✅ Auth check COMPLETE
```

### Step 6: Refresh Page (F5)
You should see the SAME auth check logs, confirming data persists.

## Common Issues & Solutions

### Issue 1: "No token found anywhere in response"

**Symptom:**
```
❌ ERROR: No token found anywhere in response!
Response structure: {...}
```

**Possible Causes:**
1. Backend not returning token correctly
2. API response structure changed
3. Network error

**Solution:**
- Check the "Response structure" log to see what backend actually returned
- Verify backend is sending token in response
- Check if token is at a different path (accessToken, jwt, etc.)

### Issue 2: "Failed to save authentication data"

**Symptom:**
```
❌ CRITICAL: localStorage.setItem failed!
```

**Possible Causes:**
1. Browser storage disabled
2. Private/Incognito mode restrictions
3. Storage quota exceeded
4. CORS issues

**Solution:**
- Try in normal browsing mode (not incognito)
- Clear browser cache and cookies
- Check if localStorage is enabled in browser settings
- Try a different browser

### Issue 3: Token shows "NONE" on page refresh

**Symptom:**
On refresh, console shows:
```
Raw token from localStorage: NONE
✗ User is LOGGED OUT
```

**Possible Causes:**
1. Token not being saved properly
2. Different origin/domain on refresh
3. Browser clearing storage
4. Code not reaching localStorage.setItem

**Solution:**
- Check Step 4 logs - was token saved initially?
- Verify you're on same URL before/after refresh
- Check Application → Local Storage in DevTools
- Look for any errors in console

### Issue 4: Token exists but Profile doesn't show

**Symptom:**
```
Raw token from localStorage: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✓ User is LOGGED IN
User loaded successfully: {...}
✅ Auth check COMPLETE
```
But Profile icon doesn't appear.

**Possible Causes:**
1. React state not updating
2. Component not re-rendering
3. CSS hiding the element

**Solution:**
- Check if isLoggedIn state is true in React DevTools
- Verify component is rendering
- Check for CSS issues

## Manual Verification Steps

### Method 1: Check localStorage Directly

1. Open DevTools
2. Go to **Application** tab
3. Expand **Local Storage** on left
4. Click on your domain (e.g., `http://localhost:3000`)
5. Look for keys:
   - `token` - should be a long JWT string
   - `user` - should be JSON object

If keys are missing → Login didn't save properly
If keys exist → Storage is working, issue is elsewhere

### Method 2: Console Commands

Run these in DevTools Console:

```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));

// Check if user exists
console.log('User:', localStorage.getItem('user'));

// Parse and display user
const user = JSON.parse(localStorage.getItem('user'));
console.log('Parsed user:', user);

// Check all localStorage keys
console.log('All keys:', Object.keys(localStorage));
```

### Method 3: Test Storage Manually

Run in Console:

```javascript
// Test writing to localStorage
localStorage.setItem('test', 'hello');
console.log('Test value saved:', localStorage.getItem('test'));

// Remove test
localStorage.removeItem('test');
```

If this fails → localStorage is broken/disabled

## Expected Flow

```
Login Form Submit
  ↓
API Call
  ↓
Receive Response with Token
  ↓
Save to localStorage (CHECK THIS STEP)
  ↓
Verify Save Success (LOOK FOR LOGS)
  ↓
Dispatch Events
  ↓
Navbar Catches Events
  ↓
Navbar Reads from localStorage (CHECK THIS STEP)
  ↓
Parse Token & User
  ↓
Update State
  ↓
Show Profile Icon ✓
```

## Quick Diagnostic Commands

Copy-paste these into your console to quickly diagnose:

```javascript
// Full diagnostic
console.log('=== QUICK DIAGNOSTIC ===');
console.log('1. Token exists?', !!localStorage.getItem('token'));
console.log('2. User exists?', !!localStorage.getItem('user'));
console.log('3. Token value:', localStorage.getItem('token')?.substring(0, 50) + '...');
console.log('4. User value:', localStorage.getItem('user'));
console.log('5. All storage keys:', Object.keys(localStorage));
console.log('========================');
```

## Files with Enhanced Logging

1. ✅ `/frontend/src/pages/Login.tsx` - Detailed login response and storage logging
2. ✅ `/frontend/src/components/Navbar.tsx` - Detailed auth state checking logging
3. ✅ `/frontend/auth-test.html` - Standalone testing utility

## Next Steps

If after checking all logs you still have issues:

1. **Take screenshot** of console logs
2. **Copy** the console output
3. **Check** Application → Local Storage manually
4. **Share** the diagnostic output

This will help pinpoint exactly where the issue is occurring!
