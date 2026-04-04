# 🚨 Quick Fix for "npm: not found" Error

## ⚡ IMMEDIATE SOLUTION

The manual nixpacks.toml configuration is having issues. Let's use Railway's **automatic detection** instead.

### Step 1: Delete or Rename nixpacks.toml

```bash
# Option A: Delete it
rm nixpacks.toml

# Option B: Rename it (safer)
mv nixpacks.toml nixpacks.toml.backup
```

### Step 2: Configure in Railway Dashboard Only

Go to Railway Dashboard → Your Service → Settings:

```
Build Command: cd backend && mvn clean package -DskipTests && cd ../frontend && npm install && npm run build
Start Command: java -jar backend/target/*.jar
```

### Step 3: Add Environment Variables

In Railway → Variables, add these ESSENTIAL ones:

```bash
# Database (Railway auto-provides when you add MySQL)
MYSQLHOST=<from-railway-mysql>
MYSQLPORT=3306
MYSQLDATABASE=<from-railway-mysql>
MYSQLUSER=root
MYSQLPASSWORD=<from-railway-mysql>

# JWT Secret (generate your own)
jwt.secret=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# CORS (your Railway URL)
CORS_ALLOWED_ORIGINS=https://your-project.up.railway.app
```

### Step 4: Redeploy

Click "Redeploy" in Railway Dashboard.

---

## 🎯 Alternative: Use railway.json (Recommended)

Keep `nixpacks.toml` deleted and use this `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "java -jar backend/target/*.jar",
    "healthcheckPath": "/api/products/featured",
    "healthcheckTimeout": 300
  }
}
```

Nixpacks will **auto-detect** Java and Node.js!

---

## 🔧 Why This Happens

The `env.PATH` variable in nixpacks.toml doesn't work reliably because:

1. Nixpacks sets up PATH in a specific way
2. Manual PATH overrides can break the environment
3. Better to let Nixpacks handle it automatically

---

## ✅ What Works Best on Railway

### Option 1: Pure Auto-Detection (EASIEST) ⭐

**Files:** Just have `pom.xml` and `package.json`
**Config:** Nothing! Nixpacks figures it out.

### Option 2: Minimal railway.json

**File:** `railway.json` at root
**Content:** Only start command

### Option 3: Custom Build Command in UI

**Where:** Railway Dashboard → Settings
**What:** One-liner build command

---

## 📊 Comparison

| Method | Reliability | Complexity | Recommendation |
|--------|-------------|------------|----------------|
| ❌ Complex nixpacks.toml | Low | High | Avoid |
| ✅ Simple railway.json | High | Low | **BEST** |
| ✅ UI Build Command | High | Low | Good |
| ✅ Pure Auto-Detection | Medium | None | Try first |

---

## 🆘 If Still Failing

### Check These First:

1. **MySQL Connected?**
   - Railway Dashboard → Should show MySQL service connected
   - Variables tab → Should have MYSQL* variables auto-set

2. **Package Files Exist?**
   ```bash
   # Verify in GitHub
   ✅ /backend/pom.xml
   ✅ /frontend/package.json
   ```

3. **Branch Correct?**
   - Railway deploying from `main` branch?
   - Latest commits pushed?

### Emergency Fallback: Backend Only

Temporary minimal setup to get SOMETHING working:

**railway.json:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && java -jar target/*.jar"
  }
}
```

Add frontend later once backend works.

---

## 🎯 Recommended Action Plan

### Right Now (Get It Working):

1. ✅ **Delete nixpacks.toml**
2. ✅ **Create railway.json** (use template above)
3. ✅ **Add MySQL in Railway**
4. ✅ **Set jwt.secret variable**
5. ✅ **Redeploy**

### Later (Optimize):

- Add custom health checks
- Configure caching
- Optimize build times
- Set up staging environment

---

## 📞 Need Help?

If still failing after trying this:

1. **Share your Railway logs** (screenshot)
2. **Check railway.json syntax** (JSONLint.com)
3. **Verify MySQL is connected** (Railway Dashboard)
4. **Contact Railway Support** (Discord/Twitter)

---

## ✨ Success Example

Here's what successful deployment looks like:

```
✅ Detected Java project
✅ Detected Node.js project  
✅ Installing JDK 17
✅ Installing Node.js 20
✅ Installing Maven
✅ Running: mvn dependency:go-offline
✅ Running: npm install
✅ Building backend...
✅ Building frontend...
✅ Starting application...
🚀 App is live at https://your-app.up.railway.app
```

---

**Status:** Switch to railway.json for reliability! 🎉
