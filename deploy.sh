#!/bin/bash

# Business Loan Portal - Deployment Script
echo "🚀 Starting deployment of Business Loan Portal..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build files are in the 'dist' directory"
    echo ""
    echo "🌐 Ready for deployment to:"
    echo "   - Vercel: vercel --prod"
    echo "   - Netlify: netlify deploy --prod --dir=dist"
    echo "   - Manual: Upload 'dist' folder to your hosting provider"
    echo ""
    echo "🔧 Environment variables needed for production:"
    echo "   - VITE_API_URL=https://your-backend-domain.vercel.app"
    echo "   - VITE_APP_ENVIRONMENT=production"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
