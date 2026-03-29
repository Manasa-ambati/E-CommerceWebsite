# 🔐 Clear Old Authentication Data

## ⚠️ Problem: "User not found" Error

You're seeing errors like:
```
UsernameNotFoundException: User not found with email: hp@gmail.com
```

This happens because your browser has **old JWT tokens** from previous sessions stored in localStorage, but the new H2 database doesn't have that user.

---

## ✅ Quick Fix (3 Steps)

### Step 1: Clear Browser Storage

#### Chrome/Edge:
1. Open your app at `http://localhost:3000`
2. Press **F12** to open DevTools
3. Go to **Application** tab (Chrome) or **Storage** tab (Edge)
4. Expand **Local Storage** → `http://localhost:3000`
5. Click **Clear All** button or delete these keys:
   - `token`
   - `user`
   - `cart`
   - `wishlist`
6. **Refresh the page** (Ctrl+R or F5)

#### Firefox:
1. Open your app at `http://localhost:3000`
2. Press **F12** to open DevTools
3. Go to **Storage** tab
4. Expand **Local Storage** → `http://localhost:3000`
5. Right-click → **Delete All**
6. **Refresh the page** (Ctrl+R or F5)

---

### Step 2: Restart Backend (to create test users)

The backend needs to restart so it can create the test users in the database.

**Option A: Use the script**
```bash
.\start-backend-local.bat
```

**Option B: Manual restart**
1. In the terminal where backend is running, press **Ctrl+C**
2. Run again:
```bash
cd backend
mvn spring-boot:run -Dspring.profiles.active=local
```

Wait for the message: `Started EcommerceApplication in X.XX seconds`

---

### Step 3: Login with Test Account

After restarting and clearing storage:

#### Option 1: Create New Account
1. Go to http://localhost:3000
2. Click **Sign Up**
3. Register with any email
4. Since it's local dev, no OTP required!
5. You'll be logged in automatically

#### Option 2: Use Pre-created Test Accounts

**Admin Account:**
- Email: `admin@eshop.com`
- Password: `admin123`

**Customer Account:**
- Email: `customer@test.com`
- Password: `password123`

---

## 🧪 Verify It Works

After clearing storage and restarting:

1. **Open browser**: http://localhost:3000
2. **Check console** (F12): Should see NO errors
3. **Products should load** without "Failed to load products" message
4. **No authentication errors** in console
5. **Can browse products**, add to cart, etc.

---

## 🔍 Debug: Check if Users Exist

If still having issues, verify users were created:

### Method 1: H2 Console
1. Open: http://localhost:8080/h2-console
2. Settings:
   - JDBC URL: `jdbc:h2:mem:ecommerce_db`
   - Username: `sa`
   - Password: (leave empty)
3. Click **Connect**
4. Run query: `SELECT * FROM users;`
5. Should see admin and customer users

### Method 2: Check Backend Logs
Look for these messages in the terminal:
```
Hibernate: insert into users ...
```

---

## 🛡️ Prevention

To avoid this issue in the future:

### When Switching Databases:
Always clear browser localStorage when:
- Switching from Railway backend to local backend
- Changing database configurations
- Getting authentication errors

### Make it a Habit:
Before testing:
1. Clear localStorage
2. Refresh page
3. Login fresh

---

## 📝 Quick Reference Commands

### Clear Everything & Restart:
```powershell
# Kill all processes
taskkill /F /IM java.exe
taskkill /F /IM node.exe

# Start backend
.\start-backend-local.bat

# Start frontend (new terminal)
cd frontend
npm start
```

### Then in Browser:
1. Open DevTools (F12)
2. Application → Local Storage → Clear All
3. Refresh page (F5)

---

## ✨ Test Credentials Summary

| Account Type | Email | Password | Role |
|-------------|-------|----------|------|
| **Admin** | admin@eshop.com | admin123 | ADMIN |
| **Customer** | customer@test.com | password123 | CUSTOMER |

---

## 🎯 Expected Behavior After Fix

✅ Products load successfully  
✅ No "User not found" errors  
✅ Can add items to cart  
✅ Can add items to wishlist  
✅ Can browse all pages  
✅ Clean console (no red errors)  

---

**Status:** Ready to test after clearing storage and restarting backend
