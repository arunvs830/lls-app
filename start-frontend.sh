#!/bin/bash

# LLS App - Frontend Development Server Starter
# This script ensures the correct environment and starts the dev server

echo "🚀 Starting LLS App Frontend Development Server..."
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    NODE_ENV=development npm install
    echo ""
fi

# Check if vite is installed
if [ ! -f "node_modules/.bin/vite" ]; then
    echo "⚠️  Vite not found. Reinstalling dependencies..."
    rm -rf node_modules package-lock.json
    NODE_ENV=development npm install
    echo ""
fi

# Start the development server
echo "✨ Starting Vite development server..."
echo "📍 Server will be available at: http://localhost:6001"
echo ""
NODE_ENV=development npm run dev
