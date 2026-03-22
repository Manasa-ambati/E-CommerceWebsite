# 🚀 Railway Deployment Guide for ShopEase E-Commerce

## ✅ Prerequisites Completed
- React frontend built
- Spring Boot backend ready
- MySQL database configuration

---

## 📁 Step 1: Project Structure Setup

### 1.1 Build React App
```bash
cd frontend
npm run build
```

### 1.2 Copy Build to Spring Boot
Copy contents from `frontend/build/` to `backend/src/main/resources/static/`

**Files to copy:**
- `asset-manifest.json`
- `favicon.ico`
- `index.html`
- `logo192.png`
- `logo512.png`
- `manifest.json`
- `robots.txt`
- `static/` (entire folder)

---

## 🔧 Step 2: Configure Spring Boot for Production

### 2.1 Update application.properties
Create/Update `backend/src/main/resources/application.properties`:

```properties
# Database Configuration (Railway Auto-provides)
spring.datasource.url=jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=${MYSQLUSER}
spring.datasource.password=${MYSQLPASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Server Port (Railway uses dynamic port)
server.port=${PORT:8080}

# Flyway Migration
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true

# CORS Configuration (for production)
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:*}

# File Upload Limits
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB

# Logging
logging.level.com.ecommerce=DEBUG
logging.level.org.springframework.web=INFO
```

### 2.2 Create Production Profile
Create `backend/src/main/resources/application-production.properties`:

```properties
# Production-specific settings
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
logging.level.com.ecommerce=INFO
logging.level.org.springframework.web=WARN
```

---

## 📝 Step 3: Create Required Configuration Files

### 3.1 Procfile (Root Directory)
Create `Procfile` in project root:

```
web: java -jar target/ecommerce-backend-0.0.1-SNAPSHOT.jar
```

### 3.2 railway.json (Root Directory)
Create `railway.json` in project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "java -jar target/ecommerce-backend-0.0.1-SNAPSHOT.jar",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3.3 .gitignore (Root Directory)
Ensure you have proper `.gitignore`:

```
# Compiled class files
*.class

# Log files
*.log

# BlueJ files
*.ctxt

# Mobile Tools for Java (J2ME)
.mtj.tmp/

# Package Files
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# Virtual machine crash logs
hs_err_pid*

# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar

# Node (for frontend development)
frontend/node_modules/
frontend/build/

# IDE
.idea/
*.iml
*.ipr
*.iws
.project
.classpath
.settings/
.vscode/

# OS
.DS_Store
Thumbs.db

# Environment variables
.env
.env.local
.env.production

# Database
*.db
*.sqlite
```

### 3.4 nixpacks.toml (Optional - Root Directory)
Create `nixpacks.toml` for better build control:

```toml
[phases.setup]
nixPkgs = ["jdk17", "maven", "nodejs-18_x"]

[phases.install]
cmds = [
  "cd frontend && npm ci",
  "cd frontend && npm run build",
  "cp -r frontend/build/* backend/src/main/resources/static/",
  "cd backend && mvn clean package -DskipTests"
]

[phases.build]
cmds = ["echo 'Build completed'"]

[start]
cmd = "cd backend && java -jar target/ecommerce-backend-0.0.1-SNAPSHOT.jar"
```

---

## 🗄️ Step 4: Update pom.xml for Production

Ensure your `backend/pom.xml` has these configurations:

```xml
<project>
    <!-- ... existing configurations ... -->
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
            
            <!-- Frontend Maven Plugin to auto-build React -->
            <plugin>
                <groupId>com.github.eirslett</groupId>
                <artifactId>frontend-maven-plugin</artifactId>
                <version>1.12.1</version>
                <configuration>
                    <workingDirectory>../frontend</workingDirectory>
                    <installDirectory>target</installDirectory>
                </configuration>
                <executions>
                    <execution>
                        <id>install node and npm</id>
                        <goals>
                            <goal>install-node-and-npm</goal>
                        </goals>
                        <configuration>
                            <nodeVersion>v18.16.0</nodeVersion>
                            <npmVersion>9.5.1</npmVersion>
                        </configuration>
                    </execution>
                    <execution>
                        <id>npm install</id>
                        <goals>
                            <goal>npm</goal>
                        </goals>
                        <configuration>
                            <arguments>ci</arguments>
                        </configuration>
                    </execution>
                    <execution>
                        <id>npm run build</id>
                        <goals>
                            <goal>npm</goal>
                        </goals>
                        <configuration>
                            <arguments>run build</arguments>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 🚀 Step 5: Deploy to Railway

### 5.1 Push to GitHub

```bash
# Navigate to project root
cd C:\Users\HOME\OneDrive\Desktop\ecommercewebsite

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Railway deployment"

# Create main branch
git branch -M main

# Add remote repository (replace with your GitHub username and repo)
git remote add origin https://github.com/YOUR_USERNAME/shopease-ecommerce.git

# Push to GitHub
git push -u origin main
```

### 5.2 Connect to Railway

1. **Go to [Railway](https://railway.app/)**
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `shopease-ecommerce`
6. **Railway will auto-detect Java** and start building

### 5.3 Add MySQL Database

1. In Railway dashboard, click **"+ New"**
2. Select **"Database"** → **"MySQL"** or **"PostgreSQL"**
3. Wait for database to provision
4. Click on the database service
5. Go to **"Variables"** tab
6. Note down these environment variables:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

### 5.4 Configure Environment Variables

In your Railway service dashboard:

1. Click on your service
2. Go to **"Variables"** tab
3. Add these variables:

```bash
# Database (Railway auto-provides these)
MYSQLHOST=<from Railway MySQL>
MYSQLPORT=<from Railway MySQL>
MYSQLDATABASE=<from Railway MySQL>
MYSQLUSER=<from Railway MySQL>
MYSQLPASSWORD=<from Railway MySQL>

# Application
PORT=8080
CORS_ALLOWED_ORIGINS=*
NODE_ENV=production

# JWT Secret (generate a strong secret)
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
```

---

## ⚙️ Step 6: Update Backend Code for Production

### 6.1 Update SecurityConfig.java
Ensure CORS is configured for production:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/categories/**", "/api/products/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/", "/index.html", "/static/**", "/asset-manifest.json").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*")); // In production, specify exact origins
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

## 🎯 Step 7: Final Deployment

### 7.1 Build Locally (Optional but Recommended)

```bash
cd backend
mvn clean package -DskipTests
```

### 7.2 Deploy

1. Railway will automatically build when you push to GitHub
2. Monitor the build logs in Railway dashboard
3. Once deployed, click **"Generate Domain"**
4. Your app will be live at: `https://your-app.railway.app`

---

## 🔍 Step 8: Troubleshooting

### ❌ Issue: Build Fails
**Solution:**
- Check Railway build logs
- Ensure `pom.xml` is correct
- Verify Node.js version in nixpacks.toml

### ❌ Issue: MySQL Connection Error
**Solution:**
```properties
# Try this alternative connection string
spring.datasource.url=jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

### ❌ Issue: React Not Loading
**Solution:**
- Verify files are in `src/main/resources/static/`
- Check that `index.html` exists
- Ensure Spring Boot serves static content

### ❌ Issue: CORS Errors
**Solution:**
- Update `SecurityConfig.java` with proper CORS settings
- Set `CORS_ALLOWED_ORIGINS` environment variable

---

## 📊 Monitoring & Logs

### View Logs in Railway:
1. Go to Railway dashboard
2. Click on your service
3. Click **"Deployments"**
4. Click on latest deployment
5. View real-time logs

### Access Database:
1. Click on MySQL service
2. Use provided credentials to connect
3. Or use Railway's web-based database viewer

---

## 🎉 Success! Your App is Live

After successful deployment:

✅ Frontend accessible at Railway domain
✅ Backend APIs working
✅ Database connected
✅ Automatic redeployment on git push

---

## 💡 Pro Tips

1. **Use Railway CLI** for local testing:
   ```bash
   npm i -g @railway/cli
   railway login
   railway link
   railway up
   ```

2. **Enable Auto-Deploy**: Railway automatically deploys on every push to main branch

3. **Monitor Resources**: Check CPU/Memory usage in Railway dashboard

4. **Custom Domain**: Add custom domain in Railway settings

5. **Environment Variables**: Use Railway's secrets management for sensitive data

6. **Backups**: Set up automatic database backups

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Spring Boot Docs: https://spring.io/projects/spring-boot
- React Docs: https://react.dev

---

**🚀 Happy Deploying!**
