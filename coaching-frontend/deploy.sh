#!/bin/bash

# Production Deployment Script for Coaching Management System Frontend

echo "=========================================="
echo "Coaching Management System - Production Build"
echo "=========================================="

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  Warning: .env.production file not found!"
    echo "Creating .env.production with production API URL..."
    echo "NEXT_PUBLIC_API_URL=http://93.127.140.63:4000/api" > .env.production
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Run linting
echo ""
echo "🔍 Running linter..."
npm run lint || echo "⚠️  Linting issues found, but continuing..."

# Build for production
echo ""
echo "🏗️  Building for production..."
NODE_ENV=production npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "To start the production server, run:"
    echo "  npm start"
    echo ""
    echo "Or use PM2:"
    echo "  pm2 start ecosystem.config.js"
else
    echo ""
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

