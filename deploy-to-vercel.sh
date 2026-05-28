#!/bin/bash

# ============================================================================
# TeslaInvest Vercel Deployment Script
# ============================================================================
# This script automates the deployment setup for Vercel
# Run from project root directory
# ============================================================================

set -e  # Exit on error

echo "🚀 TeslaInvest Vercel Deployment Setup"
echo "========================================"
echo ""

# Step 1: Update API URLs
echo "📝 Step 1: Updating API URLs..."
if [ -f "app.js" ]; then
  sed -i '' 's|http://localhost:8000/api|/api|g' app.js
  echo "   ✅ Updated app.js"
fi

for file in pages/*.html; do
  if [ -f "$file" ]; then
    sed -i '' 's|http://localhost:8000/api|/api|g' "$file"
    echo "   ✅ Updated $file"
  fi
done

echo ""

# Step 2: Initialize Git if needed
echo "📦 Step 2: Initializing Git repository..."
if [ ! -d ".git" ]; then
  git init
  echo "   ✅ Git initialized"
else
  echo "   ✅ Git already initialized"
fi

echo ""

# Step 3: Add and commit changes
echo "💾 Step 3: Committing changes..."
git add .
git commit -m "Prepare for Vercel deployment" --allow-empty
echo "   ✅ Changes committed"

echo ""

# Step 4: Check if Vercel CLI is installed
echo "🔍 Step 4: Checking for Vercel CLI..."
if ! command -v vercel &> /dev/null; then
  echo "   ⚠️  Vercel CLI not found. Installing..."
  npm install -g vercel
  echo "   ✅ Vercel CLI installed"
else
  echo "   ✅ Vercel CLI is installed"
fi

echo ""
echo "✨ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Set your GitHub remote:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/investment-site.git"
echo "   git push -u origin main"
echo ""
echo "2. Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "3. Set environment variables in Vercel Dashboard:"
echo "   - MONGODB_URI: your_mongodb_connection_string"
echo "   - JWT_SECRET: your_generated_secret"
echo "   - FRONTEND_URL: https://your-project.vercel.app"
echo ""
echo "4. Test your deployment:"
echo "   https://your-project.vercel.app"
echo ""
