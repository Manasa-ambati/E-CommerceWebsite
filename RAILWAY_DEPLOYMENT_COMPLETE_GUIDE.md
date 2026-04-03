# Railway Deployment Guide - Complete Setup

## ✅ Nixpacks Configuration Fixed

The `nixpacks.toml` syntax error has been resolved. The file now has proper TOML syntax with:
- Comma-separated array values
- Properly closed string quotes

---

## 🚀 Railway Deployment Configuration

### Current Setup Status

Your Railway service is configured to deploy the **frontend** directory, but since you have a **monorepo** (both backend and frontend), you need to adjust the configuration.

---

## Option 1: Deploy Full Stack (Recommended) ⭐

This deploys both Spring Boot backend and React frontend together.

### Step 1: Update Root Directory Settings

In Railway Dashboard:

```
Root Directory: (leave empty or use ".")
Build Command: See nixpacks.toml below
Start Command: java -jar backend/target/*.jar
```

### Step 2: Verify nixpacks.toml

Your fixed `nixpacks.toml` should look like this:

```toml
[phases.setup]
nixPkgs = ["jdk_17", "maven", "nodejs_20"]

[phases.install]
cmds = [
  "cd backend && mvn dependency:go-offline",
  "cd frontend && npm ci"
]

[phases.build]
cmds = [
  "echo 'Building backend...'",
  "cd backend && mvn clean package -DskipTests",
  "echo 'Building frontend...'",
  "cd frontend && CI=false npm run build"
]

[start]
cmd = "java -jar backend/target/*.jar"
```

### Step 3: Configure Environment Variables

In Railway → Variables, add:

```bash
# Server Configuration
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=production

# Database (if using PostgreSQL)
DATABASE_URL=${{ secrets.POSTGRES_CONNECTION_URL }}

# Frontend API URL
REACT_APP_API_URL=https://your-railway-domain.up.railway.app

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Step 4: Update application.properties

Create or update `backend/src/main/resources/application-production.properties`:

```properties
# Production Database
spring.datasource.url=${DATABASE_URL}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# JPA Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# Server
server.port=${SERVER_PORT:8080}

# JWT
app.jwt.secret=${JWT_SECRET}
app.jwt.expiration-ms=86400000

# CORS
app.cors.allowed-origins=${REACT_APP_API_URL}

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Logging
logging.level.root=INFO
logging.level.com.ecommerce=DEBUG
logging.file.name=logs/application.log
```

### Step 5: Add PostgreSQL Database

In Railway Dashboard:

1. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Connect it to your service
3. Railway will automatically set `DATABASE_URL` environment variable

### Step 6: Configure Build & Deploy

In Railway Service Settings:

```
✅ Networking: Public
✅ Region: US West (California, USA)
✅ Replicas: 1
✅ CPU: 2 vCPU
✅ Memory: 1 GB
✅ Builder: Railpack (default)
✅ Build Command: (uses nixpacks.toml automatically)
✅ Start Command: java -jar backend/target/*.jar
```

---

## Option 2: Separate Services (Advanced)

Deploy backend and frontend as separate services.

### Backend Service

```
Root Directory: backend
Build Command: mvn clean package -DskipTests
Start Command: java -jar target/*.jar
```

### Frontend Service

```
Root Directory: frontend
Build Command: CI=false npm run build
Start Command: serve -s build -l $PORT
```

**Note:** You'll need to configure CORS properly and set API URLs.

---

## 🔧 Troubleshooting Common Issues

### Issue 1: Build Fails with "Out of Memory"

**Solution:** Increase memory in Railway or optimize build:

```toml
# In nixpacks.toml
[phases.build]
cmds = [
  "export MAVEN_OPTS='-Xmx512m'",
  "cd backend && mvn clean package -DskipTests -T 1C"
]
```

### Issue 2: Port Binding Error

**Solution:** Ensure app binds to correct port:

```properties
# In application-production.properties
server.port=${PORT:8080}
```

Railway sets `PORT` environment variable automatically.

### Issue 3: Frontend Can't Connect to Backend

**Solution:** Set correct API URL:

```javascript
// In frontend/.env.production
REACT_APP_API_URL=https://your-domain.up.railway.app
```

### Issue 4: Database Connection Fails

**Solution:** Check DATABASE_URL is set and PostgreSQL is connected.

Test connection:
```bash
# In Railway shell
psql $DATABASE_URL
```

### Issue 5: Static Files Not Serving

**Solution:** Configure Spring to serve React build:

```java
// In EcommerceApplication.java or new config
@Controller
public class StaticConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .addResourceLocations("file:frontend/build/");
    }
    
    @RequestMapping(value = "/{path:[^\\\\]*}")
    public String forward() {
        return "forward:/";
    }
}
```

---

## 📊 Pre-Deployment Checklist

Before deploying, ensure:

- [x] `nixpacks.toml` is properly formatted ✅
- [ ] PostgreSQL database added in Railway
- [ ] All environment variables configured
- [ ] `application-production.properties` created
- [ ] Frontend `.env.production` updated with Railway URL
- [ ] Database migrations ready (Flyway scripts in `backend/src/main/resources/db/migration/`)
- [ ] Admin user creation script ready
- [ ] CORS configured for production domain
- [ ] JWT secret is strong (min 32 characters)

---

## 🎯 Post-Deployment Steps

After successful deployment:

### 1. Access Your App
```
https://your-project.up.railway.app
```

### 2. Create Admin User

Use signup form, then manually promote to admin in database:

```sql
-- In Railway PostgreSQL console
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'admin@example.com';
```

### 3. Add Sample Products

Use admin dashboard to add products, or create Flyway migration:

```sql
-- V2__insert_sample_data.sql
INSERT INTO products (name, description, price, discount_price, stock_quantity, 
                     category_id, sku, images, tags, rating, review_count, 
                     featured, active, created_at, updated_at)
VALUES 
('Product 1', 'Description 1', 99.99, 79.99, 100, 1, 'PROD-001', 
 '["https://via.placeholder.com/400"]', '["tag1"]', 4.5, 10, 
 true, true, NOW(), NOW());
```

### 4. Monitor Logs

Check Railway logs for errors:
```
Logs → View real-time logs
```

Look for:
- ✅ "Started EcommerceApplication" - Backend started successfully
- ✅ "Connected to database" - Database connection OK
- ❌ Any ERROR messages

---

## 🔐 Security Best Practices

### Environment Variables
Never commit sensitive data to Git. Use Railway Variables:

```bash
# Essential Secrets
JWT_SECRET=<strong-random-string>
DATABASE_URL=<auto-generated-by-railway>
SMTP_PASSWORD=<email-app-password>
```

### CORS Configuration
Only allow your Railway domain:

```java
@CrossOrigin(
    origins = {"https://your-domain.up.railway.app"},
    allowCredentials = "true"
)
```

### Database
Use parameterized queries (JPA does this automatically).

Enable SSL for database connections.

---

## 📈 Performance Optimization

### 1. Enable Caching

```properties
# application-production.properties
spring.cache.type=caffeine
spring.cache.caffeine.spec=maximumSize=10000,expireAfterAccess=3600
```

### 2. Database Connection Pool

```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
```

### 3. GZIP Compression

Spring Boot enables this by default for responses.

### 4. Static Assets

Serve from CDN (Cloudflare, CloudFront) for better performance.

---

## 🆘 Emergency Rollback

If deployment fails:

1. Go to Railway Dashboard
2. Click on deployment history
3. Select previous successful deployment
4. Click **"Redeploy"**

Or fix the issue and push to main branch:
```bash
git add .
git commit -m "Fix deployment issue"
git push origin main
```

---

## 📞 Support Resources

- **Railway Docs:** https://docs.railway.app
- **Nixpacks Docs:** https://nixpacks.com
- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **React Docs:** https://react.dev

---

## ✅ Quick Deploy Commands

After fixing nixpacks.toml:

```bash
# 1. Test build locally (optional)
docker run --rm -v $(pwd):/app nixpacks build

# 2. Commit changes
git add nixpacks.toml
git commit -m "Fix nixpacks configuration syntax"

# 3. Push to trigger deployment
git push origin main

# 4. Watch deployment in Railway dashboard
# Go to https://railway.app/project/your-project
```

---

## 🎉 Success Indicators

Your deployment is successful when you see:

✅ Build completes without errors  
✅ Application starts: "Started EcommerceApplication in X seconds"  
✅ Health check passes  
✅ Website accessible via Railway URL  
✅ No error logs in last 5 minutes  
✅ Database connected successfully  
✅ Frontend loads and can connect to backend API  

---

**Status:** ✅ **nixpacks.toml FIXED** - Ready to deploy!

Push your changes to GitHub and Railway will automatically rebuild with the corrected configuration. 🚀
