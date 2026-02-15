#!/bin/bash

# Exit script on any error
set -e

# Optional: go to project root (if script is inside a subdirectory)
cd "$(dirname "$0")"

echo "📥 Fetching and force-pulling latest changes from origin/master..."
git fetch origin master
git reset --hard origin/master

echo "📦 Installing/updating dependencies..."
npm install

echo "🔧 Building the app for Web..."
npm run build:web

echo "🛑 Stopping current PM2 app..."
pm2 stop app || echo "App not running, skipping stop."

echo "🚀 Starting PM2 app..."
pm2 start app

echo "Reload File Access..."
chmod +x /root/wxapp/start.sh

echo "✅ Server update complete!"
