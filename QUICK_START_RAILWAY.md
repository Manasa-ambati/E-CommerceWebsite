# 🚀 Quick Deploy to Railway - ShopEase E-Commerce

## ⚡ Fast Track Deployment (5 Minutes)

### Step 1: Build & Prepare (Local)

**Option A: Automated Script (Windows)**
```bash
deploy-to-railway.bat
```

**Option B: Manual Commands**
```bash
# Build React
cd frontend
npm run build

# Copy to Spring Boot
xcopy /E /I /Y build\* ..\backend\src\main\resources\static\

# Build Spring Boot
cd ..\backend
mvn clean package -DskipTests
```

### Step 2: Push to GitHub

```bash
cd ..
git init
git add .
git commit -m "Deploy to Railway"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shopease-ecommerce.git
git push -u origin main
```

### Step 3: Deploy on Railway

1. **Go to [Railway](https://railway.app/)**
2. **Login with GitHub**
3. **Click "New Project"** → **"Deploy from GitHub repo"**
4. **Select your repository**: `shopease-ecommerce`
5. **Wait for auto-build** (Railway will detect Java + Node.js)

### Step 4: Add Database

1. In Railway dashboard, click **"+ New"**
2. Select **"Database"** → **"MySQL"**
3. Wait for provisioning (1-2 minutes)

### Step 5: Configure Environment Variables

In Railway service → **Variables** tab, add:

```bash
# JWT Secret (generate your own)
JWT_SECRET_KEY=my-super-secret-key-change-this-please-12345

# CORS (your Railway domain - get it after deployment)
CORS_ALLOWED_ORIGINS=*

# Port (Railway sets this automatically)
PORT=8080
```

**Note:** MySQL variables (`MYSQLHOST`, `MYSQLPORT`, etc.) are auto-provided by Railway!

### Step 6: Generate Domain

1. Go to **"Settings"** tab
2. Click **"Generate Domain"**
3. Your app is live at: `https://your-app.railway.app` 🎉

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend loads at Railway domain
- [ ] Can access `/api/categories` (should return JSON)
- [ ] Can access `/api/products` (should return JSON)
- [ ] Login/Signup works
- [ ] Database is connected

---

## 🔧 Troubleshooting

### App Won't Start
**Check logs in Railway dashboard → Deployments → Latest**

Common issues:
- Missing environment variables
- Database not connected
- Build errors

### Database Connection Error
Ensure MySQL service is running in Railway and variables are set.

### Frontend Not Loading
Verify React build files are in `backend/src/main/resources/static/`

---

## 📊 Monitoring

- **Logs**: Railway Dashboard → Your Service → Deployments
- **Database**: Click MySQL service → View Data
- **Resources**: Check CPU/Memory usage

---

## 🎯 Useful Commands

### View Railway Logs
```bash
railway login
railway logs
```

### Redeploy
```bash
git push
# Railway auto-deploys on every push to main
```

### Rollback
```bash
# In Railway dashboard, click previous deployment → "Redeploy"
```

---

## 💰 Railway Free Tier Limits

- **500 hours/month** execution time
- **$5 credit** per month
- **Sleeps after inactivity** (upgrade to keep alive 24/7)

---

## 🆘 Need Help?

1. Check `RAILWAY_DEPLOYMENT.md` for detailed guide
2. Railway Docs: https://docs.railway.app
3. Railway Discord: https://discord.gg/railway

---

**🚀 Happy Deploying!**

Your e-commerce platform is now live on Railway!
