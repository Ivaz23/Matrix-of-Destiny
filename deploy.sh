#!/bin/bash
# ==============================================================================
# Chubuk Matrix Portal — VPS Deployment & Launch Script (Ubuntu / Debian)
# Works on any VPS: Hetzner, Timeweb, Beget, DigitalOcean, Selectel, VDSina
# ==============================================================================

set -e

echo "🔮 ========================================================="
echo "✨ Chubuk Matrix & Spiritual Portal — VPS Setup & Deploy"
echo "🔮 ========================================================="

# Detect current directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "📂 Project Directory: $PROJECT_DIR"

# 1. Check & Install Node.js 22 if not present
if ! command -v node &> /dev/null; then
    echo "📦 Node.js not found. Installing Node.js 22..."
    sudo apt-get update -y
    sudo apt-get install -y curl ca-certificates gnupg
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✅ Node version: $(node -v)"
echo "✅ NPM version: $(npm -v)"

# 2. Check and install PM2 process manager
if ! command -v pm2 &> /dev/null; then
    echo "⚙️ Installing PM2 process manager globally..."
    sudo npm install -g pm2
fi

# 3. Handle .env configuration
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "🔑 Creating .env file from template..."
    cat <<EOT > "$PROJECT_DIR/.env"
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=
EOT
    echo "⚠️ .env file created! Don't forget to put your GEMINI_API_KEY inside .env if needed."
fi

# 4. Install dependencies and build project
echo "📦 Installing project dependencies..."
npm install

echo "🔨 Building frontend and production backend bundle..."
npm run build

# 5. Start / Restart application via PM2
echo "🚀 Starting application via PM2..."
pm2 delete chubuk-matrix 2>/dev/null || true
pm2 start dist/server.cjs --name "chubuk-matrix" --env production --update-env

# Save PM2 list and configure startup on system boot
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME || true

echo "🔍 Waiting 3 seconds for server boot..."
sleep 3

# 6. Verify health status
if command -v curl &> /dev/null; then
    echo "🩺 Checking health status..."
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || true)
    if [ "$STATUS" = "200" ]; then
        echo "✅ Health check passed: HTTP 200 OK!"
    else
        echo "⚠️ Health check returned status: $STATUS (check logs with 'pm2 logs chubuk-matrix')"
    fi
fi

echo "========================================================="
echo "🎉 Chubuk Matrix is successfully deployed and running!"
echo "🌐 URL: http://localhost:3000"
echo "📋 View logs anytime: pm2 logs chubuk-matrix"
echo "🔄 Restart anytime: pm2 restart chubuk-matrix"
echo "========================================================="
