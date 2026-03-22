# 🛍️ ShopEase - Modern E-Commerce Platform

A full-stack e-commerce application built with React (Frontend) and Spring Boot (Backend), ready for deployment on Railway.

![Status](https://img.shields.io/badge/status-ready%20for%20deployment-brightgreen)
![Java](https://img.shields.io/badge/Java-17-orange)
![React](https://img.shields.io/badge/React-18-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen)
![Railway](https://img.shields.io/badge/Railway-ready-purple)

---

## ✨ Features

### Frontend (React)
- 🎨 Modern, responsive UI with gradient designs
- 📱 Fully responsive for all devices (iPhone, Samsung, tablets, desktops)
- 🔐 User authentication (Login/Signup)
- 🛒 Shopping cart management
- ❤️ Wishlist functionality
- 🔍 Advanced search with filters
- 📦 Order tracking
- 👤 User profile management
- ⭐ Product reviews
- 💳 Checkout process
- 🎯 Admin dashboard

### Backend (Spring Boot)
- 🔒 JWT-based security
- 🗄️ MySQL database integration
- 📊 RESTful APIs
- 📧 Email notifications
- 🖼️ File upload support
- 🔄 Automatic database migrations (Flyway)
- 🌐 CORS configuration

---

## 🚀 Quick Deploy to Railway

### Option 1: One-Click Deploy (Recommended)
```bash
# Windows
.\deploy-to-railway.bat
```

### Option 2: Manual Build
```bash
# Build React
cd frontend
npm run build

# Copy to Spring Boot
xcopy /E /I /Y build\* ..\backend\src\main\resources\static\

# Build Spring Boot
cd ..\backend
mvn clean package -DskipTests

# Push to GitHub
git add .
git commit -m "Deploy to Railway"
git push -u origin main
```

### Deploy on Railway
1. Go to [Railway](https://railway.app/)
2. Login with GitHub
3. Create new project from your repo
4. Add MySQL database
5. Configure environment variables
6. Generate domain

📖 **Detailed Guide**: See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
⚡ **Quick Start**: See [QUICK_START_RAILWAY.md](QUICK_START_RAILWAY.md)
✅ **Checklist**: See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 📱 Device Responsiveness

Optimized for 15+ device sizes:
- 📱 iPhone SE, XR, 12 Pro, 14 Pro Max
- 📱 iPixel, Samsung Galaxy S8, S20 Ultra
- 📲 Tablets (iPad Portrait/Landscape)
- 💻 Laptops (1280px - 1920px)
- 🖥️ Desktops (2560px+)

---

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- React Router
- Context API for state management
- CSS3 with custom animations

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- MySQL
- JWT Authentication
- Flyway Migrations

### DevOps
- Railway (Deployment)
- GitHub (Version Control)
- Maven (Build Tool)
- npm (Package Manager)

---

## 📁 Project Structure

```
shopease-ecommerce/
├── backend/
│   ├── src/main/
│   │   ├── java/com/ecommerce/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── repository/
│   │   │   ├── security/
│   │   │   └── service/
│   │   └── resources/
│   │       ├── static/          # React build files
│   │       └── application.properties
│   └── pom.xml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── Procfile                    # Railway start command
├── railway.json                # Railway config
├── nixpacks.toml              # Build automation
├── RAILWAY_DEPLOYMENT.md      # Deployment guide
├── QUICK_START_RAILWAY.md     # Quick start
├── DEPLOYMENT_CHECKLIST.md    # Checklist
└── deploy-to-railway.bat      # Automation script
```

---

## 🔧 Configuration

### Environment Variables (Railway)
```bash
# Required
JWT_SECRET_KEY=your-secret-key-here
CORS_ALLOWED_ORIGINS=*
PORT=8080

# Auto-provided by Railway (MySQL)
MYSQLHOST
MYSQLPORT
MYSQLDATABASE
MYSQLUSER
MYSQLPASSWORD
```

---

## 🎯 Key Features Implementation

### Navbar
- Responsive logo and menu toggle
- Search bar with camera & voice search
- Mobile-friendly hamburger menu
- Cart & wishlist badges
- User profile dropdown

### Footer
- Social media icons (6 platforms)
- Newsletter subscription
- QR code for app download
- App store buttons
- Payment method icons
- Quick links & customer service

### Responsive Design
- Custom breakpoints for specific devices
- Fluid typography
- Adaptive layouts
- Touch-friendly controls

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) | Comprehensive deployment guide with all steps |
| [QUICK_START_RAILWAY.md](QUICK_START_RAILWAY.md) | 5-minute quick start guide |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Complete checklist for deployment |
| [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) | Summary of all deployment features |

---

## 🏃 Local Development

### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
mvn spring-boot:run
```

---

## ✅ Deployment Status

- [x] React build automation
- [x] Spring Boot integration
- [x] Railway configuration files
- [x] Environment variable setup
- [x] Database configuration
- [x] CORS configuration
- [x] Responsive design (all devices)
- [x] Documentation complete
- [x] Deployment scripts ready

---

## 🆘 Support

- 📖 **Docs**: See documentation files above
- 💬 **Railway**: https://docs.railway.app
- 🎮 **Discord**: https://discord.gg/railway
- 🐛 **Issues**: GitHub Issues

---

## 📄 License

This project is created for educational/deployment purposes.

---

## 🎉 Ready to Deploy!

All configuration files are prepared. Follow the quick start guide to deploy in 5 minutes!

**Start here**: [QUICK_START_RAILWAY.md](QUICK_START_RAILWAY.md)

---

**Happy Coding! 🚀**
