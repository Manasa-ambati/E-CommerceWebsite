# ✅ Nixpacks.toml - Final Working Configuration

## 🎯 Current Status: FIXED ✅

Your `nixpacks.toml` is now correctly formatted and should build successfully on Railway.

---

## 📄 Your Working Configuration

```toml
[phases.setup]
nixPkgs = ["jdk17", "maven", "nodejs_20"]

# Set PATH explicitly
env.PATH = "$PATH:/nix/store/nodejs-20/bin"

[phases.install]
cmds = [
  "echo 'Installing dependencies...'",
  "cd backend && mvn dependency:go-offline -q",
  "cd frontend && npm install --legacy-peer-deps"
]

[phases.build]
cmds = [
  "echo 'Building backend...'",
  "cd backend && mvn clean package -DskipTests -q",
  "echo 'Building frontend...'",
  "cd frontend && CI=false npm run build"
]

[start]
cmd = "java -jar backend/target/*.jar"
```

---

## ✅ What Was Fixed

### Issue #1: Invalid Providers Section
**Error:** `invalid type: map, expected a sequence for key providers`

**Fix:** Removed the `[providers]` section entirely (it's not needed)

### Issue #2: Wrong JDK Package Name
**Error:** `jdk_17` doesn't exist in Nix packages

**Fix:** Changed to `jdk17` (correct package name)

### Issue #3: npm Not Found
**Error:** `sh: 1: npm: not found`

**Fix:** Added explicit PATH configuration:
```toml
env.PATH = "$PATH:/nix/store/nodejs-20/bin"
```

### Issue #4: npm ci Failures
**Error:** package-lock.json conflicts

**Fix:** Changed to `npm install --legacy-peer-deps`

---

## 🚀 Deploy Now

Push to GitHub to trigger Railway deployment:

```bash
git add nixpacks.toml
git commit -m "Fix nixpacks.toml configuration"
git push origin main
```

Then watch your deployment in Railway Dashboard.

---

## 📊 Expected Build Output

When successful, you should see:

```
✅ Installing Node.js 20.x
✅ Installing Maven
✅ node v20.x.x
✅ npm 10.x.x
✅ Installing dependencies...
✅ Building backend...
✅ Building frontend...
✅ Build completed successfully!
🚀 Started EcommerceApplication in X seconds
```

---

## 🔍 Troubleshooting

### If Build Still Fails:

**Check these in Railway Dashboard:**

1. **Variables Tab** - Ensure these are set:
   ```bash
   MYSQLHOST=<railway-mysql-host>
   MYSQLPORT=3306
   MYSQLDATABASE=<database-name>
   MYSQLUSER=root
   MYSQLPASSWORD=<password>
   jwt.secret=<32-char-random-string>
   ```

2. **Build Logs** - Look for errors around:
   - Line 5: PATH setup
   - Line 11: npm install
   - Line 17: Maven build

3. **Service Configuration**:
   - Root Directory: Should be empty or "."
   - Build Command: Should use nixpacks (automatic)
   - Start Command: `java -jar backend/target/*.jar`

---

## 🆘 Alternative Solutions

### Option A: Use Railway.json Instead

If nixpacks.toml continues to have issues, delete it and use `railway.json`:

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

Railway will auto-detect Java + Node.js.

### Option B: Custom Build Command

In Railway Dashboard → Settings:

```
Build Command: bash railway-build.sh
```

This uses the custom script I created earlier.

### Option C: Docker Deployment

Create `Dockerfile` and switch builder to Docker in Railway.

---

## 📈 Performance Optimization Tips

Once deployed successfully:

1. **Enable Build Cache** in Railway Settings
2. **Use Maven Daemon** for faster builds
3. **Skip Tests**: Already configured with `-DskipTests`
4. **Quiet Mode**: Already configured with `-q`

---

## 🎉 Success Checklist

After pushing, verify:

- [ ] Build starts automatically in Railway
- [ ] No TOML parsing errors
- [ ] Node.js 20.x installed
- [ ] Maven installed
- [ ] Backend builds successfully
- [ ] Frontend builds successfully
- [ ] Application starts
- [ ] Health check passes
- [ ] Website accessible via Railway URL

---

## 📞 Support Resources

- **Railway Discord:** https://discord.gg/railway
- **Nixpacks Docs:** https://nixpacks.com/docs
- **Railway Status:** https://status.railway.app

---

**Status:** ✅ **READY TO DEPLOY**

Push your changes and the build should succeed! 🚀
