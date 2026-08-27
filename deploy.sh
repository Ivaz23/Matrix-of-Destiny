#!/bin/bash
# Chubuk Matrix Portal — 1-Click VPS Deployment Script for Ubuntu / Debian

set -e

echo "🔮 ====================================================="
echo "✨ Chubuk Matrix & Spiritual Portal — VPS Setup Script"
echo "🔮 ====================================================="

# 1. Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Check and install Docker & Docker Compose if missing
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

if ! command -v docker compose &> /dev/null; then
    echo "🐳 Installing Docker Compose plugin..."
    sudo apt-get install -y docker-compose-plugin
fi

# 3. Create deployment directory
APP_DIR="/opt/chubuk-matrix"
echo "📂 Setting up application directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 4. Check for .env file
if [ ! -f "$APP_DIR/.env" ]; then
    echo "🔑 Creating .env file..."
    cat <<EOT > $APP_DIR/.env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=
EOT
    echo "⚠️ Please edit $APP_DIR/.env and add your GEMINI_API_KEY!"
fi

# 5. Build and start containers
echo "🚀 Building and starting containers with Docker Compose..."
cd $APP_DIR
docker compose down || true
docker compose up -d --build

echo "✅ ====================================================="
echo "🎉 Chubuk Matrix is running successfully on port 3000!"
echo "🌐 Health check: http://localhost:3000/api/health"
echo "🔮 ====================================================="
