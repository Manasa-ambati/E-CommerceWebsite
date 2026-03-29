# Railway Deployment Troubleshooting Guide

## Why Changes Aren't Applied on Railway

### Common Issues:

1. **Changes Not Pushed to GitHub**
   - Railway deploys from your Git repository (GitHub/GitLab)
   - Local changes won't appear unless committed and pushed
   
2. **Build Cache Issues**
   - Railway caches builds for faster deployments
   - Sometimes cache needs to be cleared

3. **Wrong Branch Deployed**
   - Check which branch Railway is deploying from
   - Default is usually `main` or `master`

4. **Environment Variables Missing**
   - Some changes require environment variable updates

---

## Quick Fixes

### Method 1: Force Redeploy (Recommended)

1. **Commit and push all changes:**
   ```bash
   git status
   git add .
   git commit -m "Latest updates"
   git push origin main
   ```

2. **Force Railway to rebuild:**
   - Go to Railway dashboard
   - Navigate to your project
   - Click on "Deployments" tab
   - Click "Redeploy" on the latest deployment
   - OR click "Deploy new version" after pushing changes

3. **Clear build cache (if needed):**
   - In Railway dashboard
   - Go to Settings → Build
   - Click "Clear Cache"
   - Trigger new deployment

---

### Method 2: Use Railway CLI

```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Force deploy
railway up --force

# Or deploy with rebuild
railway up --rebuild
```

---

### Method 3: Manual Trigger via Git

```bash
# Make a small change to trigger rebuild
echo "# Force rebuild $(date)" >> README.md
git add .
git commit -m "chore: force rebuild"
git push origin main
```

---

## Verification Steps

### 1. Check Deployment Logs
- Go to Railway dashboard
- Click on your service
- View "Deployments" tab
- Check logs for build errors

### 2. Verify Build Process
Look for these in logs:
```
✓ Building backend...
✓ Building frontend...
✓ JAR file created
✓ Application started
```

### 3. Test Your Changes
After deployment:
```bash
# Test backend API
curl https://your-app.railway.app/api/products/featured

# Test frontend
Open https://your-app.railway.app in browser
```

---

## Common Build Issues & Solutions

### Issue: Frontend changes not showing
**Solution:**
- Ensure frontend builds successfully: `cd frontend && npm run build`
- Check that build files are in `frontend/build/`
- Verify nixpacks.toml has correct build commands

### Issue: Backend changes not showing
**Solution:**
- Ensure Maven build succeeds: `cd backend && mvn clean package`
- Check JAR file is created in `backend/target/`
- Verify application.properties has correct settings

### Issue: Database changes not applied
**Solution:**
- Check Flyway migrations are running
- Verify database connection in Railway env variables
- Check migration scripts in `src/main/resources/db/migration`

---

## Environment Variables Checklist

Make sure these are set in Railway dashboard:

```bash
# Database
DATABASE_URL=mysql://user:pass@host:port/dbname
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_HOST=your_host
DB_PORT=3306
DB_NAME=your_database

# JWT Secret
JWT_SECRET=your_secret_key_here

# Email (if using OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Spring Profiles
SPRING_PROFILES_ACTIVE=production
```

---

## Deployment Workflow

1. **Make changes locally**
2. **Test locally:**
   ```bash
   # Run full build locally
   .\deploy-to-railway.bat
   ```
3. **Commit changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```
4. **Push to GitHub:**
   ```bash
   git push origin main
   ```
5. **Railway auto-deploys** (or manually trigger)
6. **Monitor deployment logs**
7. **Test deployed changes**

---

## Emergency Rollback

If something goes wrong:

1. Go to Railway dashboard
2. Click "Deployments"
3. Find last working deployment
4. Click "Rollback"

---

## Need More Help?

Check Railway documentation:
- https://docs.railway.app/deployments
- https://docs.railway.app/building/builds

Or contact Railway support through their Discord.
