#!/bin/bash

# sixtyoneeighty Chat Deployment Script

echo "🚀 Deploying sixtyoneeighty Chat Application..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the application first
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. ✅ Test authentication (sign up/sign in)"
echo "2. ✅ Test chat functionality"
echo "3. ✅ Test file uploads"
echo "4. ✅ Test API endpoints"
echo ""
echo "🔗 Your app should be live at: https://your-app-name.vercel.app"
