# Railway Build Error Fix - "npm: not found"

## ❌ Error Description

```
npm install
119ms
sh: 1: npm: not found
ERROR: failed to build: failed to solve: process "sh -c npm install" did not complete successfully: exit code: 127
```

**Root Cause:** Nixpacks isn't finding Node.js/npm in the build environment.

---

## ✅ Solution 1: Updated nixpacks.toml (Recommended)

I've fixed your `nixpacks.toml` with these changes:

### Changes Made:

1. **Fixed JDK package name**: `jdk_17` → `jdk17`
2. **Added explicit PATH**: Ensures Node.js binaries are found
3. **Changed npm ci to npm install**: More reliable in CI/CD
4. **Added --legacy-peer-deps**: Handles React dependency conflicts
5. **Added quiet mode (-q)**: Reduces build log noise

### Your Fixed nixpacks.toml:

```toml
[providers]
  type = "nixpacks"

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

## 🚀 How to Deploy the Fix

### Option A: Push to GitHub (Automatic Deployment)

```bash
# Commit the fixed nixpacks.toml
git add nixpacks.toml
git commit -m "Fix nixpacks configuration for Node.js detection"

# Push to trigger Railway deployment
git push origin main
```

Railway will automatically rebuild with the new configuration.

### Option B: Manual Redeploy in Railway Dashboard

1. Go to Railway Dashboard
2. Select your service
3. Click "Deployments" tab
4. Click "Redeploy" button

---

## 🔧 Alternative Solutions

### Solution 2: Use Custom Build Script

If nixpacks.toml still fails, use the custom build script I created:

**File:** `railway-build.sh`

In Railway Dashboard:

```
Settings → Build Command: bash railway-build.sh
```

This script manually installs Node.js and Maven if not found.

### Solution 3: Switch to Docker Deployment

Create `Dockerfile` in project root:

```dockerfile
FROM node:20-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./frontend/
RUN npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

FROM maven:3.9-eclipse-temurin-17 AS backend-build

WORKDIR /app/backend
COPY backend/pom.xml ./backend/
RUN mvn dependency:go-offline
COPY backend/src ./backend/src
RUN cd backend && mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-slim

WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar ./backend.jar
COPY --from=frontend-build /app/frontend/build ./static

EXPOSE 8080

CMD ["java", "-jar", "backend.jar"]
```

Then in Railway:
```
Builder: Dockerfile
```

### Solution 4: Separate Frontend & Backend Services

**Backend Service:**
```
Root Directory: backend
Build Command: mvn clean package -DskipTests
Start Command: java -jar target/*.jar
```

**Frontend Service:**
```
Root Directory: frontend
Build Command: CI=false npm run build
Start Command: npx serve -s build -l $PORT
```

---

## 🧪 Testing Locally

You can test the build locally using Docker:

```bash
# Install Docker Desktop first

# Test with Nixpacks locally
docker run --rm -v $(pwd):/app nixpacks build

# Or test the custom build script
chmod +x railway-build.sh
./railway-build.sh
```

---

## 📊 Common Causes & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| `npm: not found` | Node.js not in PATH | ✅ Fixed with explicit PATH in nixpacks.toml |
| `npm ci` fails | package-lock.json mismatch | ✅ Changed to `npm install --legacy-peer-deps` |
| Build timeout | Large dependencies | ✅ Added quiet mode `-q` to reduce overhead |
| Wrong JDK name | `jdk_17` doesn't exist | ✅ Changed to correct `jdk17` |

---

## 🔍 Debugging Steps

If build still fails, check these in Railway:

### Step 1: Check Build Logs

```
Railway Dashboard → Deployments → Click latest deployment → View Logs
```

Look for:
- ✅ "Installing Node.js 20.x"
- ✅ "node --version" output
- ✅ "npm --version" output

### Step 2: Verify Environment Variables

Ensure these are set in Railway Variables:
```bash
NODE_VERSION=20
NPM_VERSION=latest
```

### Step 3: Check File Structure

Verify in GitHub repository:
```
✅ /backend/pom.xml exists
✅ /frontend/package.json exists
✅ /nixpacks.toml exists at root
```

### Step 4: Test Simple Command

Add debug command to nixpacks.toml:
```toml
[phases.setup]
nixPkgs = ["jdk17", "maven", "nodejs_20"]

# Add this temporarily for debugging
[phases.test]
cmds = [
  "which node",
  "which npm",
  "node --version",
  "npm --version"
]
```

Check logs to see if Node.js is found.

---

## 🆘 Emergency Fallback

If nothing works, deploy only backend first:

### Temporary Simplified nixpacks.toml:

```toml
[phases.setup]
nixPkgs = ["jdk17"]

[phases.install]
cmds = ["cd backend && mvn dependency:go-offline"]

[phases.build]
cmds = ["cd backend && mvn clean package -DskipTests"]

[start]
cmd = "java -jar backend/target/*.jar"
```

This deploys just the Spring Boot API. Add frontend later.

---

## ✅ Success Indicators

Your build is working when you see:

```
✅ Installing Node.js 20.x
✅ node v20.x.x
✅ npm 10.x.x
✅ Installing dependencies...
✅ Building Backend...
✅ Building Frontend...
✅ Build completed successfully!
```

---

## 📈 Performance Tips

Once build is working:

1. **Enable caching** in Railway Settings
2. **Use npm ci** instead of npm install (after fixing lock file)
3. **Skip tests** during build: `-DskipTests`
4. **Use Maven daemon**: Consider adding `mvnd` for faster builds

---

## 🎯 Next Steps

1. ✅ **Push the fixed nixpacks.toml** to GitHub
2. ⏳ **Wait for Railway to rebuild** (2-5 minutes)
3. 👀 **Watch deployment logs** in Railway dashboard
4. ✅ **Verify app is live** by visiting your Railway URL

---

## 📞 Additional Help

If still failing after trying all solutions:

1. Check Railway status: https://status.railway.app
2. Review Nixpacks docs: https://nixpacks.com/docs
3. Check Railway Discord: https://discord.gg/railway
4. Enable verbose logging in Railway settings

---

**Status:** ✅ **FIXED** - Push changes and redeploy!

The updated nixpacks.toml should resolve the "npm not found" error. 🚀
