# Login & Signup Pages - Location Guide

## 📍 **Where to Find Login & Signup**

### **1. Access via URLs**

Simply navigate to these URLs in your browser:

```
🔐 Login Page:    http://localhost:3000/login
📝 Signup Page:   http://localhost:3000/signup
```

---

### **2. Access via Navbar Buttons** (NEW!)

The navbar now shows **Login** and **Sign Up** buttons when you're **NOT logged in**:

#### **When NOT Logged In:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  [Search Bar]        [Login] [Sign Up] [Wishlist] │
│                                  ↑         ↑                │
│                            Purple Btn  Green Btn           │
└─────────────────────────────────────────────────────────────┘
```

#### **When Logged In:**
```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo]  [Search Bar]        [Profile] [Orders] [Logout]        │
│                                   ↑       ↑        ↑             │
│                              User Menu  Orders  Red Btn         │
└──────────────────────────────────────────────────────────────────┘
```

---

### **3. File Locations**

#### **Frontend Pages:**

| Page | File Path | CSS |
|------|-----------|-----|
| **Login** | `frontend/src/pages/Login.tsx` | `frontend/src/pages/Auth.css` |
| **Signup** | `frontend/src/pages/Signup.tsx` | `frontend/src/pages/Auth.css` |

#### **Navbar Component:**

| Component | File Path | CSS |
|-----------|-----------|-----|
| **Navbar** | `frontend/src/components/Navbar.tsx` | `frontend/src/components/Navbar.css` |

---

## 🎨 **Button Styles**

### **Login Button:**
- **Color:** Purple gradient (#667eea → #764ba2)
- **Icon:** Login/Enter icon
- **Location:** Navbar (when not logged in)

### **Sign Up Button:**
- **Color:** Green gradient (#10b981 → #059669)
- **Icon:** User with plus icon
- **Location:** Navbar (when not logged in)

### **Logout Button:**
- **Color:** Red gradient (#ef4444 → #dc2626)
- **Icon:** Logout/Exit icon
- **Location:** Navbar (when logged in)

---

## 🔍 **How to Test**

### **Test 1: View Login/Signup Buttons**

1. **Make sure you're logged out:**
   ```javascript
   // Open browser console (F12)
   localStorage.removeItem('token');
   localStorage.removeItem('user');
   location.reload();
   ```

2. **Look at the navbar** - you should see:
   - ✅ Purple "Login" button
   - ✅ Green "Sign Up" button

3. **Click either button** - navigates to respective page

---

### **Test 2: Login Flow**

1. Click **"Login"** button in navbar
2. Enter credentials:
   - Email: Your registered email
   - Password: Your password
3. Click **"Login"** button
4. ✅ Should redirect to home page
5. ✅ Navbar now shows: Profile, Orders, Logout

---

### **Test 3: Signup Flow**

1. Click **"Sign Up"** button in navbar
2. Fill registration form:
   - First Name
   - Last Name
   - Email
   - Password
   - Confirm Password
   - Phone (optional)
3. Click **"Sign Up"**
4. Check backend console for OTP
5. Enter OTP
6. ✅ Verified and logged in!

---

## 🖼️ **Visual Layout**

### **Login Page Layout:**

```
┌─────────────────────────────────────────┐
│                                         │
│         ┌─────────────────────┐         │
│         │   Welcome Back      │         │
│         │  Login to continue  │         │
│         │                     │         │
│         │  Email: [_______]   │         │
│         │  Password: [____]   │         │
│         │                     │         │
│         │    [Login Button]   │         │
│         │                     │         │
│         │  Don't have account?│         │
│         │     Sign up here    │         │
│         └─────────────────────┘         │
│                                         │
└─────────────────────────────────────────┘
```

### **Signup Page Layout:**

```
┌─────────────────────────────────────────┐
│                                         │
│         ┌─────────────────────┐         │
│         │   Create Account    │         │
│         │  Join us today      │         │
│         │                     │         │
│         │  First: [___] Last:│         │
│         │  Email: [_______]   │         │
│         │  Phone: [_______]   │         │
│         │  Password: [____]   │         │
│         │  Confirm: [____]    │         │
│         │                     │         │
│         │   [Sign Up Button]  │         │
│         │                     │         │
│         │  Already have acct? │         │
│         │     Login here      │         │
│         └─────────────────────┘         │
│                                         │
└─────────────────────────────────────────┘
```

---

## ⚡ **Quick Navigation**

### **From Any Page:**

1. **Look at top-right corner** of navbar
2. **See Login/Sign Up buttons?** → Click them
3. **See Profile/Orders/Logout?** → You're already logged in

### **Keyboard Shortcuts:**

```
Alt + L  →  Go to /login  (if implemented)
Alt + S  →  Go to /signup (if implemented)
```

---

## 🔧 **Troubleshooting**

### **Issue: Can't see Login/Signup buttons**

**Possible Causes:**

1. **You're already logged in**
   - Check if navbar shows Profile/Orders/Logout
   - Solution: Logout first or open incognito window

2. **Frontend not running**
   - Check: http://localhost:3000
   - Solution: Run `npm start` in frontend folder

3. **AuthContext not working**
   - Open browser console (F12)
   - Look for errors related to AuthProvider
   - Solution: Check console for specific error

**Quick Fix:**
```javascript
// Force check authentication status
// Open browser console and run:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// If both are null, you should see Login/Signup buttons
// If not, refresh the page
location.reload();
```

---

### **Issue: Buttons not styled correctly**

**Solution:**
1. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Check if Navbar.css is loaded (F12 → Network tab)

---

## 📱 **Mobile View**

On mobile devices, the navbar adapts:

- Login/Signup buttons may be in a hamburger menu
- Icons remain visible
- Same functionality, compact layout

---

## 🎯 **Summary**

| Action | Where | What to Click |
|--------|-------|---------------|
| **Login** | Navbar (top-right) | Purple "Login" button |
| **Signup** | Navbar (top-right) | Green "Sign Up" button |
| **Direct URL** | Browser address bar | `/login` or `/signup` |
| **Logout** | Navbar (when logged in) | Red "Logout" button |

---

## 🚀 **Next Steps After Login**

Once logged in, you can:

✅ Access **Profile** page  
✅ View **Order History**  
✅ Add items to **Wishlist**  
✅ Add items to **Cart**  
✅ Complete **Checkout**  

All protected features are now available!
