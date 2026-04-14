#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Building El Coro Dashboard..."
npm run build
echo "Build complete."
echo ""
echo "To deploy to VPS:"
echo "  rsync -avz --exclude node_modules --exclude .next/cache ./ YOUR_VPS_USER@VPS:/home/YOUR_VPS_USER/el-coro-dashboard/"
echo "  ssh YOUR_VPS_USER@VPS 'cd /home/YOUR_VPS_USER/el-coro-dashboard && npm install --production && pm2 restart el-coro-dashboard || pm2 start npm --name el-coro-dashboard -- start'"
echo ""
echo "Dashboard will be available at port 3200 via Cloudflare Tunnel"
