#!/bin/bash

# Railway Custom Build Script
# This script manually installs Node.js and Maven if not found

set -e

echo "🚀 Starting custom build process..."

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install Node.js if not found
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    apt-get update -qq
    apt-get install -y -qq curl
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs
fi

# Install Maven if not found
if ! command -v mvn &> /dev/null; then
    echo "📦 Installing Maven..."
    apt-get install -y -qq maven
fi

# Verify installations
echo "✅ Verifying installations..."
node --version
npm --version
java --version
mvn --version

# Build Backend
echo "🔨 Building Backend..."
cd backend
mvn clean package -DskipTests -q
echo "✅ Backend built successfully!"

# Build Frontend
echo "🎨 Building Frontend..."
cd ../frontend
npm install --legacy-peer-deps
CI=false npm run build
echo "✅ Frontend built successfully!"

echo "🎉 Build completed successfully!"
