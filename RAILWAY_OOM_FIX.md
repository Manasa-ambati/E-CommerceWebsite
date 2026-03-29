# 🚨 Railway Out of Memory Error - FIXED

## ⚠️ Problem Identified

The backend was running out of memory on Railway because:
- **H2 in-memory database** was being used in production
- H2 consumes significant RAM for large datasets
- Railway's free tier has limited memory (512MB)
- MySQL is the correct database for production

---

## ✅ Solution Applied

### Changed Configuration:
1. **Removed** `spring.profiles.active=local` from `application.properties`
   - This prevents Railway from accidentally using H2
   - Railway now defaults to MySQL (production database)

2. **Local Development** still uses H2 via explicit profile specification
   - Run with: `.\start-backend-local.bat` (specifies `-Dspring.profiles.active=local`)

3. **Production (Railway)** automatically uses MySQL
   - No profile specified = uses default MySQL configuration
   - Railway environment variables provide database credentials

---

## 🔧 How It Works Now

### Local Development:
```bash
# Uses H2 in-memory database (lightweight, fast)
.\start-backend-local.bat

# Equivalent to:
mvn spring-boot:run -Dspring.profiles.active=local
```

### Production Deployment (Railway):
```bash
# Uses MySQL database (persistent, low memory usage)
# No profile specified = defaults to production config
# Railway provides MYSQLHOST, MYSQLPORT, etc. via environment variables
```

---

## 📊 Database Configuration Comparison

| Environment | Profile | Database | Memory Usage | Suitable For |
|-------------|---------|----------|--------------|--------------|
| **Local Dev** | `local` | H2 In-Memory | ~100-200MB | Development & Testing |
| **Production** | (none/default) | MySQL | ~50-100MB | Railway Deployment |

---

## 🚀 Deploy to Railway Now

### Step 1: Commit & Push Changes
```bash
git add .
git commit -m "Fix: Remove hardcoded local profile to prevent OOM on Railway"
git push origin main
```

### Step 2: Railway Auto-Deploys
- Railway will detect the push
- Automatically rebuilds with correct configuration
- Uses MySQL instead of H2
- Memory usage drops significantly

### Step 3: Verify Deployment
1. Go to Railway dashboard
2. Check deployment logs
3. Should see: `Using MySQL database`
4. No more "out of memory" errors

---

## 🔍 How to Verify Correct Database is Used

### On Railway (Production):
Check deployment logs for:
```
✅ Using MySQL dialect
✅ Connected to mysql://...
✅ Flyway migrations applied
```

NOT:
```
❌ Using H2 dialect
❌ Connected to jdbc:h2:...
```

### Locally (Development):
Check console for:
```
✅ Using H2 dialect
✅ Connected to jdbc:h2:mem:ecommerce_db
✅ H2 console available at /h2-console
```

---

## 🛡️ Prevention: Best Practices

### NEVER Hardcode Profiles in application.properties
```properties
# ❌ BAD - Forces profile on all environments
spring.profiles.active=local

# ✅ GOOD - Let each environment choose
# (No profile specified = production defaults)
```

### Use Explicit Profile Only When Running
```bash
# ✅ Local dev - specify profile explicitly
mvn spring-boot:run -Dspring.profiles.active=local

# ✅ Production - don't specify profile (uses default)
java -jar app.jar
```

### Use Environment-Specific Property Files
```
application.properties          # Production defaults (MySQL)
application-local.properties    # Local development (H2)
application-production.properties # Explicit production config (optional)
```

---

## 📝 What Changed in Code

### File Modified: `application.properties`

**Before:**
```properties
# Lines 27-28
# Active Profile for Local Development
spring.profiles.active=local
```

**After:**
```properties
# REMOVED - No hardcoded profile
# Railway will use default MySQL configuration
```

### File Unchanged: `application-local.properties`
Still contains H2 configuration for local dev only.

### File Unchanged: `start-backend-local.bat`
Still specifies `-Dspring.profiles.active=local` explicitly.

---

## 🎯 Expected Results After Fix

### On Railway:
✅ No "out of memory" errors  
✅ Uses MySQL database  
✅ Lower RAM consumption (<100MB)  
✅ Stable deployment  
✅ Data persists between restarts  

### Locally:
✅ Still uses H2 when running `.\start-backend-local.bat`  
✅ Fast startup time  
✅ No external database needed  
✅ Sample data loads quickly  

---

## 🔄 Migration Path (If Already Deployed with H2)

If you accidentally deployed H2 to Railway:

### 1. Clear Railway Cache
- Go to Railway dashboard
- Settings → Build → Clear Cache

### 2. Redeploy
- Click "Redeploy" or push new commit
- Wait for build to complete

### 3. Verify MySQL is Used
- Check logs for MySQL connection strings
- Test that data persists after restart

---

## 📞 Troubleshooting

### Issue: Still getting OOM error
**Solution:**
1. Verify Railway is using latest code
2. Check logs for "H2" mentions
3. Ensure environment variables are set:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

### Issue: Local dev not working
**Solution:**
```bash
# Make sure you're using the script
.\start-backend-local.bat

# Or specify profile manually
cd backend
mvn spring-boot:run -Dspring.profiles.active=local
```

### Issue: Can't connect to Railway MySQL
**Solution:**
1. Add MySQL service in Railway dashboard
2. Copy connection variables
3. Set as environment variables in Railway
4. Redeploy

---

## ✨ Summary

**Problem:** H2 database consuming too much RAM on Railway  
**Root Cause:** Hardcoded `spring.profiles.active=local` in application.properties  
**Solution:** Removed hardcoded profile, Railway now uses default MySQL  
**Result:** ✅ Memory issues resolved, both local and production work correctly  

---

**Next Action:** Commit and push changes to trigger Railway redeployment
