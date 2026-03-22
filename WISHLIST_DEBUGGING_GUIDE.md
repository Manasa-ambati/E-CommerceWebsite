# Wishlist Functionality Debugging Guide

## Changes Made

I've made several improvements to fix the wishlist functionality:

### Backend Changes:

1. **SecurityConfig.java** - Added `/api/reviews/**` to authenticated endpoints
2. **WishlistController.java** - Added detailed logging to track requests and errors
3. **V2__create_wishlist_table.sql** - Created migration script to ensure wishlist_items table exists

### Frontend Changes:

1. **ProductDetail.tsx** - Enhanced error handling and added debugging logs
2. **Wishlist.tsx** - Added token validation and better error messages
3. **Home.tsx** - Improved authentication checks and user feedback

## How to Test

### Option 1: Using the Web Application

1. **Make sure both backend and frontend are running:**
   - Backend: http://localhost:8080
   - Frontend: http://localhost:3000

2. **Login to your account:**
   - Go to http://localhost:3000
   - Click "Login" and enter your credentials
   - Make sure you successfully log in

3. **Test from Product Detail Page:**
   - Navigate to any product
   - Click the heart icon (♡) to add to wishlist
   - You should see:
     - Console logs showing token status
     - Alert saying "Added to wishlist"
     - Heart icon changes to filled (♥) and turns red
   - Click again to remove - should show "Removed from wishlist"

4. **Test from Home Page:**
   - Go to home page
   - Click heart icon on any product card
   - Should see similar behavior as above

5. **Test Wishlist Page:**
   - Navigate to "My Wishlist" from navbar
   - Should see all products you've added
   - Try removing items or moving to cart

### Option 2: Using the Test HTML File

1. Open `wishlist-test.html` in your browser
2. Login with your credentials
3. Test each API endpoint individually

### Option 3: Browser Console Debugging

1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform wishlist actions
4. Look for these logs:
   ```
   Toggle wishlist: {productId: X, isInWishlist: false, hasToken: true}
   Add response: {success: true, message: "...", data: {...}}
   ```

## Common Issues & Solutions

### Issue 1: "Please login to use wishlist feature"
**Problem:** You're not logged in or token is missing

**Solution:**
```javascript
// Check if you're logged in
console.log(localStorage.getItem('token'));
// If null, login again
```

### Issue 2: Network Error / CORS Error
**Problem:** Backend not running or CORS blocking

**Solution:**
1. Verify backend is running at http://localhost:8080
2. Check browser console for CORS errors
3. Make sure backend logs show requests

### Issue 3: "Failed to update wishlist"
**Problem:** Database issue or authentication problem

**Solution:**
1. Check backend terminal for error logs
2. Look for lines starting with `=== POST /api/wishlist/add ===`
3. Check if User ID is being extracted correctly

### Issue 4: Nothing happens when clicking heart icon
**Problem:** JavaScript error or event handler not working

**Solution:**
1. Check browser console for errors
2. Verify the button has the correct onClick handler
3. Try refreshing the page

## Backend Logs to Watch For

When you add to wishlist, you should see:
```
=== POST /api/wishlist/add ===
Product ID: 1
Authentication: Present
Principal: user@example.com
User ID: 1
Added item with ID: 1
```

If there's an error, you'll see:
```
Error in addToWishlist: [error message]
[java stack trace]
```

## Frontend Console Logs

When adding to wishlist:
```
Toggle wishlist: {productId: 1, isInWishlist: false, hasToken: true, token: "eyJhbGc..."}
Add response: {success: true, message: "Product added to wishlist", data: {...}}
```

## API Endpoints Reference

- **GET** `/api/wishlist` - Get all wishlist items
- **POST** `/api/wishlist/add?productId={id}` - Add item to wishlist
- **DELETE** `/api/wishlist/remove?productId={id}` - Remove item from wishlist
- **GET** `/api/wishlist/check?productId={id}` - Check if product is in wishlist

All endpoints require `Authorization: Bearer {token}` header.

## Quick Database Check

Run this SQL query to verify wishlist table exists:
```sql
SELECT * FROM wishlist_items;
```

If table doesn't exist, restart the backend and Hibernate will create it automatically (since `spring.jpa.hibernate.ddl-auto=update`).

## Token Verification

To verify your token is valid:
```javascript
// In browser console
const token = localStorage.getItem('token');
console.log('Token:', token);
console.log('Token parts:', token ? token.split('.') : 'No token');
```

A valid JWT has 3 parts separated by dots.

## Next Steps

If wishlist still doesn't work after these fixes:

1. **Check both backend and frontend consoles** for error messages
2. **Verify you're logged in** by checking localStorage
3. **Try the test HTML file** to isolate the issue
4. **Share the error logs** from both backend and frontend consoles

## Files Modified

- `backend/src/main/java/com/ecommerce/config/SecurityConfig.java`
- `backend/src/main/java/com/ecommerce/controller/WishlistController.java`
- `backend/src/main/resources/db/migration/V2__create_wishlist_table.sql` (new)
- `frontend/src/pages/ProductDetail.tsx`
- `frontend/src/pages/Wishlist.tsx`
- `frontend/src/pages/Home.tsx`
- `wishlist-test.html` (new)
