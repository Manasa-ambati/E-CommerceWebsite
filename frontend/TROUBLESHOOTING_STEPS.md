# 🔧 Troubleshooting Guide - Fix Persistent Issues

## ⚠️ If You're Still Seeing Issues

### Issue 1: "Password Login" / "OTP Login" Tabs Still Visible

**Cause:** Browser cache or old build files

**Solution:**
```bash
# 1. Stop the development server (Ctrl+C)
# 2. Clear browser cache completely
# 3. Delete node_modules/.cache
# 4. Restart server

cd c:\Users\HOME\OneDrive\Desktop\E-CommerceProject\frontend
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
npm start
```

**Verify:**
- Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Open DevTools → Network tab → Check "Disable cache"
- Reload page

---

### Issue 2: Password Eye Icon Not Showing

**Cause:** Inline styles might not be applying

**Check:**
1. Right-click password field → Inspect Element
2. Look for the eye icon button
3. Verify it has these styles:
   ```css
   position: absolute;
   right: 10px;
   top: 50%;
   transform: translateY(-50%);
   ```

**Solution if missing:**
Open `Login.tsx` lines 101-130 and verify the button exists.

---

### Issue 3: Search Bar Not Visible on Mobile

**Cause:** CSS not reloaded or wrong breakpoint

**Test:**
```javascript
// Open browser console and run:
const searchForm = document.querySelector('.search-form');
console.log('Search form exists:', !!searchForm);
console.log('Search form display:', searchForm?.style.display);
console.log('Window width:', window.innerWidth);
```

**Expected Output:**
- `Search form exists: true`
- `Search form display: "flex"` (at ≤767px)
- `Window width: [your mobile width]`

**If not visible:**
1. Check browser width (must be ≤ 767px)
2. Press F12 → Device mode
3. Set width to 700px
4. Hard refresh: `Ctrl+Shift+R`

**CSS Force Fix:**
Add to `Navbar.css` line 788:
```css
@media (max-width: 767px) {
  .search-form {
    display: flex !important;  /* Already there, verify it's saved */
    visibility: visible !important;
    opacity: 1 !important;
  }
}
```

---

### Issue 4: Hamburger Shows Double Lines

**Cause:** Old CSS cached or animation not updating

**Check Current CSS:**
Open DevTools → Console and run:
```javascript
const middleSpan = document.querySelector('.mobile-toggle.active span:nth-child(2)');
const style = window.getComputedStyle(middleSpan);
console.log('Transform:', style.transform);
console.log('Opacity:', style.opacity);
```

**Expected:**
- `Transform: matrix(1, 0, 0, 1, 10, 0)` or similar with positive X
- `Opacity: 0`

**If showing negative value (-10px):**
Your CSS file hasn't reloaded. Do this:

1. Open `Navbar.css`
2. Find line 716
3. Verify it says: `transform: translateX(10px);` (positive 10)
4. If correct but still broken → CLEAR CACHE

**Cache Clear Command:**
```bash
cd c:\Users\HOME\OneDrive\Desktop\E-CommerceProject\frontend
Remove-Item -Recurse -Force .parcel-cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
npm start
```

---

### Issue 5: Profile Shows "User" Instead of Name

**Cause:** localStorage has old data format

**Check localStorage:**
```javascript
// Run in browser console:
const user = JSON.parse(localStorage.getItem('user'));
console.log('User object:', user);
console.log('Has name field?', 'name' in user);
console.log('Has firstName field?', 'firstName' in user);
```

**If shows `firstName` instead of `name`:**
Old login data is cached. Clear it:

```javascript
// Run in browser console:
localStorage.removeItem('user');
localStorage.removeItem('token');
// Then login again
```

**After Login, Verify:**
```javascript
console.log(JSON.parse(localStorage.getItem('user')));
// Should show: { id: X, email: "...", name: "Manasa Ambati", role: "..." }
```

---

## 🧪 Complete Verification Steps

### Step 1: Verify Login Form Has NO Tabs
```bash
1. Navigate to http://localhost:3000/login
2. Should see: Single form with Email + Password
3. Should NOT see: Any tabs saying "Password Login" or "OTP Login"
4. Count forms: Only ONE form should exist
```

**DevTools Check:**
```javascript
document.querySelectorAll('form').length // Should be 1
document.querySelectorAll('.auth-tab').length // Should be 0
```

---

### Step 2: Verify Password Eye Icon
```bash
1. Go to /login
2. Look at password field
3. Should see eye icon 👁️ on right side
4. Click it → password becomes visible
5. Click again → password hides
```

**DevTools Check:**
```javascript
const eyeButton = document.querySelector('button[aria-label*="password"]');
console.log('Eye button exists:', !!eyeButton);
console.log('Current type:', document.querySelector('input[type="password"]')?.type || 'text');
```

---

### Step 3: Verify Mobile Searchbar
```bash
1. Press F12
2. Click device icon (Ctrl+Shift+M)
3. Set width to 700px
4. Look for search bar below logo
5. Should be FULL WIDTH and VISIBLE
```

**DevTools Check:**
```javascript
const searchForm = document.querySelector('.search-form');
const rect = searchForm.getBoundingClientRect();
console.log('Search form visible:', rect.width > 0 && rect.height > 0);
console.log('Search form width:', rect.width);
console.log('Computed display:', getComputedStyle(searchForm).display);
```

---

### Step 4: Verify Hamburger Clean X
```bash
1. Resize to 700px width
2. Click hamburger menu
3. Look at the icon
4. Should be CLEAN X shape
5. NO double lines or extra marks
```

**DevTools Check:**
```javascript
const spans = document.querySelectorAll('.mobile-toggle span');
spans.forEach((span, i) => {
  const style = window.getComputedStyle(span);
  console.log(`Span ${i}:`, {
    transform: style.transform,
    opacity: style.opacity
  });
});
// Middle span (index 1) should have opacity: 0
```

---

### Step 5: Verify Username Display
```bash
1. Login with your account
2. Click profile dropdown
3. Should show YOUR NAME (e.g., "Manasa Ambati")
4. Should NOT show "User"
5. Check mobile menu also shows name
```

**DevTools Check:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('User name field:', user?.name);
console.log('User firstName field:', user?.firstName);
console.log('Display name should be:', user?.name || user?.email || 'Guest');
```

---

## 🚀 Nuclear Option - Complete Refresh

If NOTHING works, do this:

```bash
# Stop server
Ctrl+C

# Clear ALL caches
cd c:\Users\HOME\OneDrive\Desktop\E-CommerceProject\frontend
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .parcel-cache -ErrorAction SilentlyContinue

# Clear browser cache
# Chrome: Ctrl+Shift+Delete → Cached images/files → Clear data
# Firefox: Ctrl+Shift+Delete → Cache → Clear Now

# Rebuild
npm run build

# Start fresh
npm start

# Hard refresh browser
Ctrl+Shift+R
```

---

## 📞 Report Specific Issue

If still having issues, tell me EXACTLY:

1. **Which issue?** (Pick number 1-5 from above)
2. **What you see?** (Screenshot description)
3. **What you expect?** (Describe correct behavior)
4. **Browser console errors?** (Copy/paste any red errors)
5. **DevTools output?** (Run the checks above and share results)

Example:
```
Issue #3: Search bar not visible on mobile
What I see: Empty space where search should be at 700px width
Expected: Search bar full width below logo
Console: "Search form exists: true" but "display: none"
```

Then I can give you the EXACT fix for that specific problem!
