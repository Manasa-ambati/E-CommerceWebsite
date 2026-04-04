#!/bin/bash

# Railway Custom Build Script
set -e

echo "🚀 Starting build process..."

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found"
    exit 1
fi

# Build Backend
echo "🔨 Building Backend..."
cd backend
mvn clean package -DskipTests
echo "✅ Backend built successfully!"

# List JAR files created
echo "📦 JAR files created:"
ls -lh target/*.jar 2>/dev/null || echo "No JAR files found!"

echo "🎉 Build completed!"
