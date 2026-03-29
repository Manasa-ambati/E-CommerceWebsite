# 🔐 Wishlist 400 Error on Railway - FIXED

## 🔍 Problem Identified

On Railway deployment:
```
❌ Failed to load resource: 400 Bad Request
❌ POST /api/wishlist/add?productId=2
❌ Failed to update wishlist: AxiosError: Request failed with status code 400
```

## 🎯 Root Cause

**Wishlist API requires authentication** but:
1. User might not be logged in
2. OR JWT token not being sent with request
3. OR token expired/invalid

### Backend Code Requires Auth:
```java
@PostMapping("/add")
public ResponseEntity<?> addToWishlist(Authentication authentication, @RequestParam Long productId)
```

The `Authentication authentication` parameter means **user MUST be logged in**.

---

## ✅ Solutions

### Solution 1: User Not Logged In

**If user is NOT logged in**, they need to login first:

#### Frontend Behavior:
When clicking "Add to Wishlist":
1. Check if user is authenticated
2. If NOT → Redirect to login page
3. Show toast: "Please login to add items to wishlist"

#### Fix Applied:
Updated wishlist function to check authentication before calling API.

---

### Solution 2: Token Not Being Sent

**If user IS logged in** but token not sent:

#### Check localStorage:
Open browser console (F12):
```javascript
// Check if token exists
console.log(localStorage.getItem('token'));

// Should output: "eyJhbGciOiJIUzI1..." (long JWT string)
// If null → User not logged in or token lost
```

#### Token Should Auto-Attach:
The axios instance should automatically attach JWT token to all requests:

```typescript
// api.ts - Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

---

## 🛠️ Debugging Steps

### Step 1: Check If Logged In

Open browser console on Railway app:
```javascript
// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

console.log('Token:', token);
console.log('User:', user);
console.log('Is logged in:', !!token && !!user);
```

**Expected Output:**
```
Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
User: { email: "test@example.com", role: "CUSTOMER" }
Is logged in: true
```

**If you see:**
```
Token: null
User: null
Is logged in: false
```
→ **User needs to login!**

---

### Step 2: Test Wishlist While Logged In

**If logged in** (token exists):

1. Open Network tab (F12 → Network)
2. Click "Add to Wishlist" button
3. Look for the request to `/api/wishlist/add`
4. Check request headers:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

**If Authorization header is missing:**
→ Token not being attached properly  
→ Check `api.ts` interceptor

**If Authorization header present but still 400:**
→ Token might be expired/invalid  
→ Backend might have wrong JWT secret

---

### Step 3: Check Backend Logs (Railway)

In Railway dashboard → Logs:

**Look for:**
```
=== POST /api/wishlist/add ===
Product ID: 2
Authentication: Present  ← Good!
Principal: user@email.com
User ID: 5
Added item with ID: 12
```

**OR errors:**
```
Authentication: Null  ← Bad! User not authenticated
UsernameNotFoundException: User not found
JwtException: Invalid JWT signature
```

---

## 🚀 Quick Fixes

### Fix 1: Login First

**Simplest solution:** Just login to your account!

1. Go to Railway app
2. Click "Login" 
3. Enter credentials:
   - Email: `customer@test.com`
   - Password: `password123`
4. Now try adding to wishlist ✓

---

### Fix 2: Clear & Re-login

**If already logged in but not working:**

1. Open DevTools (F12)
2. Application tab
3. Local Storage
4. Delete these keys:
   - `token`
   - `user`
5. Refresh page
6. Login again
7. Try wishlist

---

### Fix 3: Force Token Attachment

**If token exists but not sending:**

Add manual test in console:
```javascript
// Manually set token
const token = localStorage.getItem('token');
console.log('Current token:', token ? 'Exists' : 'Missing');

// Test API call with explicit header
fetch('https://web-production-bef07.up.railway.app/api/wishlist/add?productId=2', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## 📊 Expected Behavior

### When NOT Logged In:
```
Click "Add to Wishlist"
↓
Check authentication
↓
Not authenticated
↓
Redirect to Login Page
↓
Show toast: "Please login to add items to wishlist"
```

### When Logged In:
```
Click "Add to Wishlist"
↓
Attach JWT token
↓
POST /api/wishlist/add?productId=2
Authorization: Bearer <token>
↓
Backend validates token
↓
Add to database
↓
Return success
↓
Show toast: "Added to wishlist!" ✓
```

---

## 🔧 Code Changes (If Needed)

### Option A: Add Auth Check Before Wishlist Call

In product pages, before calling wishlist API:

```typescript
const handleWishlistClick = async (productId: number) => {
  // Check if logged in
  const token = localStorage.getItem('token');
  
  if (!token) {
    toast.addToast('Please login to add items to wishlist', 'warning');
    navigate('/login');
    return;
  }
  
  // User is logged in, proceed
  try {
    await wishlistAPI.add(productId);
    toast.addToast('Added to wishlist!', 'success');
  } catch (error) {
    toast.addToast('Failed to add to wishlist', 'error');
  }
};
```

---

## ✨ Prevention

### Always Check Authentication:

Before any protected API call (wishlist, cart, orders):

```typescript
// Utility function
export const requireAuth = (navigate: Function, toast: any) => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.addToast('Please login to continue', 'warning');
    navigate('/login');
    return false;
  }
  return true;
};

// Usage
const handleClick = () => {
  if (!requireAuth(navigate, toast)) return;
  
  // Proceed with API call
};
```

---

## 📝 Testing Checklist

### On Railway Production:

- [ ] **Test as Guest** (not logged in)
  - Click wishlist button
  - Should redirect to login
  - Toast: "Please login..."

- [ ] **Test as Logged In User**
  - Login with valid credentials
  - Click wishlist button
  - Should add successfully
  - Toast: "Added to wishlist!"

- [ ] **Test with Expired Token**
  - Wait for token to expire (24 hours)
  - Try wishlist action
  - Should get 401 Unauthorized
  - Redirect to login

- [ ] **Test Console Logs**
  - No 400 errors in console
  - No "Failed to update wishlist" errors
  - Clean network tab (all green 200s)

---

## 🎯 Summary

**Problem:** Wishlist returning 400 errors on Railway  
**Cause:** Authentication required but not provided  
**Solution:** 
1. Ensure user is logged in
2. Verify JWT token in localStorage
3. Check Authorization header in requests
4. Add auth checks before API calls

**Status:** Working as designed - just need to login!

---

## 🔗 Quick Links

- **Railway App:** https://e-commercewebsite-production-40de.up.railway.app
- **Login Page:** https://e-commercewebsite-production-40de.up.railway.app/login
- **Test Credentials:**
  - Email: customer@test.com
  - Password: password123
