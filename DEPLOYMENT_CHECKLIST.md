# ✅ Railway Deployment Checklist

## 📋 Pre-Deployment Checklist

### Code Preparation
- [ ] Run `npm run build` in frontend directory
- [ ] Copy build files to `backend/src/main/resources/static/`
- [ ] Verify `index.html` exists in static folder
- [ ] Update `application.properties` with environment variables
- [ ] Test locally: `mvn spring-boot:run`

### Files Created
- [ ] `Procfile` (in root)
- [ ] `railway.json` (in root)
- [ ] `nixpacks.toml` (in root)
- [ ] `.gitignore` (updated)
- [ ] `RAILWAY_DEPLOYMENT.md` (guide)
- [ ] `QUICK_START_RAILWAY.md` (quick guide)

### GitHub Repository
- [ ] Initialize Git repository
- [ ] Add all files: `git add .`
- [ ] Commit: `git commit -m "Prepare for Railway deployment"`
- [ ] Create main branch: `git branch -M main`
- [ ] Create GitHub repo (if not exists)
- [ ] Push to GitHub: `git push -u origin main`

---

## 🚀 Railway Setup Checklist

### Account & Project
- [ ] Sign up/Login to [Railway](https://railway.app/)
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your repository
- [ ] Wait for auto-detection (Java + Node.js)

### Database Setup
- [ ] Click "+ New" in project
- [ ] Select "Database" → "MySQL"
- [ ] Wait for provisioning (1-2 minutes)
- [ ] Note down database credentials (auto-generated)

### Environment Variables
In Railway Service → Variables tab:

**Required Variables:**
- [ ] `JWT_SECRET_KEY` (generate strong random key)
- [ ] `CORS_ALLOWED_ORIGINS` (set to `*` or your domain)
- [ ] `PORT` (Railway sets this automatically usually)

**Auto-provided by Railway (MySQL):**
- [ ] `MYSQLHOST` ✓ (automatic)
- [ ] `MYSQLPORT` ✓ (automatic)
- [ ] `MYSQLDATABASE` ✓ (automatic)
- [ ] `MYSQLUSER` ✓ (automatic)
- [ ] `MYSQLPASSWORD` ✓ (automatic)

### Domain Configuration
- [ ] Go to Settings tab
- [ ] Click "Generate Domain"
- [ ] Note your domain: `https://your-app.railway.app`
- [ ] Update `CORS_ALLOWED_ORIGINS` with your domain (optional)

---

## ✅ Post-Deployment Verification

### Frontend Checks
- [ ] Visit Railway domain in browser
- [ ] Homepage loads correctly
- [ ] Navbar displays properly
- [ ] Footer is visible
- [ ] Responsive design works on mobile
- [ ] Can navigate to Products page
- [ ] Can navigate to Categories page

### Backend API Checks
- [ ] Access `/api/categories` - returns JSON
- [ ] Access `/api/products` - returns JSON
- [ ] Access `/api/auth/login` - login endpoint exists
- [ ] Access `/api/auth/signup` - signup endpoint exists

### Authentication Checks
- [ ] User registration works
- [ ] User login works
- [ ] JWT token is generated
- [ ] Protected routes require authentication
- [ ] Logout functionality works

### Database Checks
- [ ] MySQL service is running
- [ ] Can view database in Railway dashboard
- [ ] Tables are created automatically
- [ ] Can insert/query data

### Integration Checks
- [ ] Add to cart works
- [ ] Wishlist functionality works
- [ ] Order placement works
- [ ] Profile updates work
- [ ] Search functionality works

---

## 🔧 Troubleshooting Checklist

### If App Won't Start
- [ ] Check Railway logs (Deployments → Latest)
- [ ] Verify `pom.xml` has correct configuration
- [ ] Ensure Procfile has correct JAR name
- [ ] Check Java version compatibility (should be 17)

### If Database Connection Fails
- [ ] Verify MySQL service is running
- [ ] Check environment variables are set
- [ ] Ensure connection string uses Railway variables
- [ ] Try manual database connection test

### If Frontend Doesn't Load
- [ ] Verify files in `backend/src/main/resources/static/`
- [ ] Check `index.html` exists
- [ ] Ensure no 404 errors in browser console
- [ ] Clear browser cache and reload

### If APIs Return 404
- [ ] Check controller mappings
- [ ] Verify application context path
- [ ] Check CORS configuration
- [ ] Review SecurityConfig settings

### If CORS Errors Occur
- [ ] Update `SecurityConfig.java` CORS settings
- [ ] Set `CORS_ALLOWED_ORIGINS` environment variable
- [ ] Ensure backend allows frontend domain

---

## 📊 Monitoring & Maintenance

### Regular Checks
- [ ] Monitor CPU/Memory usage in Railway dashboard
- [ ] Check error logs weekly
- [ ] Review database size
- [ ] Monitor API response times

### Monthly Tasks
- [ ] Update dependencies (npm packages, Maven dependencies)
- [ ] Review Railway usage (avoid overage charges)
- [ ] Backup database (export important data)
- [ ] Check for security updates

### Quarterly Tasks
- [ ] Performance optimization review
- [ ] Code cleanup and refactoring
- [ ] Update documentation
- [ ] Test all features end-to-end

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ **Frontend accessible** at Railway domain without errors
✅ **Backend APIs respond** with proper JSON data
✅ **Authentication works** (login/signup/logout)
✅ **Database connected** and tables created
✅ **All CRUD operations** work (Create, Read, Update, Delete)
✅ **Responsive design** works on all devices
✅ **No console errors** in browser
✅ **No server errors** in Railway logs

---

## 🆘 Getting Help

### Resources
- **Detailed Guide**: `RAILWAY_DEPLOYMENT.md`
- **Quick Start**: `QUICK_START_RAILWAY.md`
- **Railway Docs**: https://docs.railway.app
- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **React Docs**: https://react.dev

### Community Support
- **Railway Discord**: https://discord.gg/railway
- **Stack Overflow**: Tag with `railway-app`
- **GitHub Issues**: Your repository issues

---

## 🎉 Deployment Complete!

Once all checkboxes are ticked:

🚀 Your app is **LIVE** on Railway!
💾 Database is **CONNECTED**!
🔒 Security is **CONFIGURED**!
📱 Frontend is **RESPONSIVE**!
⚡ APIs are **WORKING**!

**Share your live URL:** `https://your-app.railway.app`

---

**Last Updated:** 2026-03-22
**Project:** ShopEase E-Commerce Platform
**Status:** Ready for Production Deployment ✅
