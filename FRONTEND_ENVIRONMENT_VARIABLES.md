# Frontend Environment Variables - Railway Deployment

## 🎯 Quick Answer: What to Add

### For Monorepo Deployment (Backend + Frontend Together) ⭐ RECOMMENDED

If you're using the `railway.json` approach and deploying both together:

**In Railway Dashboard → Variables:**

```bash
# ONLY THIS ONE IS NEEDED:
REACT_APP_API_URL=https://your-railway-domain.up.railway.app
```

That's it! The build will use this during the build process.

---

### For Separate Frontend Deployment

If deploying frontend as a separate service:

**Create `.env.production` in `frontend/` folder:**

```bash
# Production API URL (Your Railway Backend URL)
REACT_APP_API_URL=https://your-backend-api.up.railway.app

# Environment
REACT_APP_ENV=production

# API Timeout (milliseconds)
REACT_APP_API_TIMEOUT=10000

# Default page size for product listings
REACT_APP_DEFAULT_PAGE_SIZE=12

# OTP expiry time in minutes
REACT_APP_OTP_EXPIRY_MINUTES=5
```

---

## 📋 Complete Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_API_URL` | ✅ YES | http://localhost:8080 | **Backend API endpoint URL** |
| `REACT_APP_ENV` | ⚠️ Optional | development | Environment name (production/staging) |
| `REACT_APP_API_TIMEOUT` | ⚠️ Optional | 10000 | API request timeout in ms |
| `REACT_APP_DEFAULT_PAGE_SIZE` | ⚠️ Optional | 12 | Products per page |
| `REACT_APP_OTP_EXPIRY_MINUTES` | ⚠️ Optional | 5 | OTP validity duration |

---

## 🔧 How to Set Variables

### Method 1: In Railway Dashboard (For Monorepo)

1. Go to Railway Dashboard: https://railway.app
2. Select your project
3. Click "Variables" tab
4. Click "New Variable"
5. Add:
   ```
   Name: REACT_APP_API_URL
   Value: https://your-project.up.railway.app
   ```
6. Click "Add"
7. Redeploy

### Method 2: Create .env.production File (For Separate Deploy)

Create file: `frontend/.env.production`

```bash
REACT_APP_API_URL=https://your-backend.up.railway.app
REACT_APP_ENV=production
REACT_APP_API_TIMEOUT=10000
```

**Important:** Add `.env.production` to `.gitignore` if it contains secrets!

---

## 🎨 Development vs Production

### Current Setup (`.env` - Development)

Your current `.env` is for **local development**:

```bash
REACT_APP_API_URL=http://localhost:8080  # ✅ Correct for local
REACT_APP_ENV=development                 # ✅ Correct for local
```

This is perfect for running locally with `npm start`.

### Production Setup

For production on Railway, you need:

```bash
REACT_APP_API_URL=https://actual-domain.up.railway.app  # Your live URL
REACT_APP_ENV=production                                 # Marks as prod build
```

---

## 🚀 When Building on Railway

### During Build Process

Railway will:

1. Read `REACT_APP_API_URL` from Railway Variables
2. Run `npm run build` in frontend folder
3. React replaces `process.env.REACT_APP_API_URL` with actual value
4. Build output has correct API URL baked in

### At Runtime

The built files use the **build-time** value of `REACT_APP_API_URL`.

**Important:** This is NOT runtime! You can't change it without rebuilding.

---

## ❓ Common Questions

### Q: Do I need to add all variables to Railway?

**A:** NO! Only add what you need:

**Minimal (Just get it working):**
```bash
REACT_APP_API_URL=https://your-app.up.railway.app
```

**Complete (Best practice):**
```bash
REACT_APP_API_URL=https://your-app.up.railway.app
REACT_APP_ENV=production
REACT_APP_API_TIMEOUT=10000
```

### Q: Can I use different URLs for dev and prod?

**A:** YES! That's exactly what we do:

- `.env` → Local development (localhost:8080)
- Railway Variables → Production (railway domain)
- `.env.production` → Alternative for separate deploy

### Q: Where do I find my Railway URL?

**A:** In Railway Dashboard:

1. Go to your service
2. Look at top: `https://xxxx-production.up.railway.app`
3. Copy that URL
4. Use as `REACT_APP_API_URL`

### Q: Backend and frontend on different URLs?

**A:** Yes! Set accordingly:

```bash
# If backend is at: https://api.myapp.com
# And frontend at: https://myapp.com

# Frontend variable:
REACT_APP_API_URL=https://api.myapp.com
```

### Q: Do I need .env.production file?

**A:** Depends on deployment method:

| Deployment Method | Need .env.production? |
|-------------------|----------------------|
| Monorepo (railway.json) | ❌ NO - Use Railway Variables |
| Separate Frontend Service | ✅ YES - Or use Railway Variables |
| Vercel/Netlify | ✅ YES - Or their env UI |

---

## 🔐 Security Notes

### ✅ Safe to Commit to Git:

```bash
REACT_APP_ENV=production
REACT_APP_API_TIMEOUT=10000
REACT_APP_DEFAULT_PAGE_SIZE=12
```

### ❌ NEVER Commit These:

```bash
# If you had any (you don't currently):
REACT_APP_SECRET_KEY=xxx
REACT_APP_API_TOKEN=xxx
```

Use Railway Variables for secrets instead!

---

## 📊 Your Current Setup

Based on your files, here's what you have:

### Development (`.env`) - ✅ Good!

```bash
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development
REACT_APP_API_TIMEOUT=10000
```

### What You Need for Railway:

**In Railway Dashboard → Variables:**

```bash
# Replace with YOUR actual Railway URL
REACT_APP_API_URL=https://tnwd-mMi9-production.up.railway.app
```

**Optional but recommended:**

```bash
REACT_APP_ENV=production
REACT_APP_API_TIMEOUT=10000
```

---

## 🛠️ Step-by-Step Setup

### Right Now (Get It Working):

1. **Find Your Railway URL**
   - Railway Dashboard → Copy your domain
   - Example: `https://tnwd-mMi9-production.up.railway.app`

2. **Add to Railway Variables**
   - Railway → Your Service → Variables
   - New Variable: `REACT_APP_API_URL`
   - Value: Your URL from step 1

3. **Redeploy**
   - Click "Deployments" → "Redeploy"
   - Wait 2-3 minutes
   - Frontend now calls correct backend!

### Later (Optimize):

Add these to Railway Variables too:

```bash
REACT_APP_ENV=production
REACT_APP_API_TIMEOUT=10000
REACT_APP_DEFAULT_PAGE_SIZE=12
REACT_APP_OTP_EXPIRY_MINUTES=5
```

---

## 🧪 Testing

After setting variables:

### 1. Check Build Logs

In Railway → Deployments → Latest:

```
✅ REACT_APP_API_URL set to https://...
✅ Building frontend...
✅ Build completed successfully
```

### 2. Test in Browser

1. Open your Railway URL
2. Open DevTools (F12)
3. Go to Network tab
4. Make an API call
5. Verify it goes to correct URL:
   ```
   Request URL: https://your-railway-url.up.railway.app/api/products
   NOT: http://localhost:8080/api/products
   ```

### 3. Check Console

In browser console:

```javascript
// Should show production URL, not localhost
console.log(process.env.REACT_APP_API_URL)
// Should print: "https://your-app.up.railway.app"
```

---

## 🆘 Troubleshooting

### Issue: Still calling localhost

**Cause:** Build used old value

**Fix:**
```bash
# In Railway Dashboard:
1. Delete old deployment
2. Trigger new build (push commit or manual redeploy)
3. Watch logs to confirm new REACT_APP_API_URL is used
```

### Issue: CORS errors after deploy

**Cause:** Backend CORS doesn't allow frontend URL

**Fix:** Add to Railway Variables (backend):
```bash
CORS_ALLOWED_ORIGINS=https://your-frontend.up.railway.app
```

### Issue: .env.production not working

**Cause:** File not being read

**Fix:** Ensure file is named exactly `.env.production` (not `.env.prod` or `env.production`)

---

## ✨ Summary

### Minimal Setup (Just 1 Variable):

```bash
# In Railway Dashboard → Variables:
REACT_APP_API_URL=https://your-railway-domain.up.railway.app
```

### Optimal Setup (4 Variables):

```bash
# In Railway Dashboard → Variables:
REACT_APP_API_URL=https://your-railway-domain.up.railway.app
REACT_APP_ENV=production
REACT_APP_API_TIMEOUT=10000
REACT_APP_DEFAULT_PAGE_SIZE=12
REACT_APP_OTP_EXPIRY_MINUTES=5
```

### Don't Forget:

- ✅ Keep `.env` for local development
- ✅ Use Railway Variables for production
- ✅ Rebuild after changing variables
- ✅ Test API calls in browser console

---

**Status:** Add just `REACT_APP_API_URL` to Railway Variables and redeploy! 🚀
