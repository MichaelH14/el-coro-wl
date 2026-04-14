#!/bin/bash
# Deploy El Coro VPS workers
# Usage: ./deploy.sh [rollback]

set -e

VPS_USER="${EL_CORO_VPS_USER:-YOUR_VPS_USER}"
VPS_HOST="${EL_CORO_VPS_HOST:-YOUR_VPS_IP}"
REMOTE_DIR="${EL_CORO_REMOTE_DIR:-/home/${VPS_USER}/el-coro-vps}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[deploy]${NC} $1"; }
err() { echo -e "${RED}[deploy]${NC} $1" >&2; }

if [ "$1" = "rollback" ]; then
    log "Rolling back to previous version..."
    ssh "${VPS_USER}@${VPS_HOST}" "
        cd ${REMOTE_DIR} && \
        if [ -d .backup ]; then
            pm2 stop ecosystem.config.js 2>/dev/null || true
            cp -r .backup/* .
            npm install --production
            pm2 restart ecosystem.config.js
            pm2 save
            echo 'Rollback complete'
        else
            echo 'ERROR: No backup found'
            exit 1
        fi
    "
    log "Rollback finished."
    exit 0
fi

log "Deploying El Coro VPS workers..."

# Step 1: Verify SSH access
log "Checking VPS connectivity..."
ssh -q "${VPS_USER}@${VPS_HOST}" "echo 'VPS reachable'" || {
    err "Cannot reach VPS. Aborting."
    exit 1
}

# Step 2: Create backup on VPS
log "Creating backup of current version..."
ssh "${VPS_USER}@${VPS_HOST}" "
    mkdir -p ${REMOTE_DIR}/.backup && \
    cd ${REMOTE_DIR} && \
    cp -r *.js package.json ecosystem.config.js .backup/ 2>/dev/null || true
"

# Step 3: Rsync files (excluding node_modules, logs, data files)
log "Syncing files to VPS..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '*.log' \
    --exclude '.backup' \
    --exclude 'monitor-logs.json' \
    --exclude 'support-tickets.json' \
    --exclude 'growth-metrics.json' \
    "${SCRIPT_DIR}/" "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"

# Step 4: Install dependencies and restart
log "Installing dependencies and restarting workers..."
ssh "${VPS_USER}@${VPS_HOST}" "
    cd ${REMOTE_DIR} && \
    npm install --production && \
    pm2 restart ecosystem.config.js && \
    pm2 save
"

# Step 5: Quick health check (wait 5s then check PM2)
log "Waiting 5s for stabilization..."
sleep 5
ssh "${VPS_USER}@${VPS_HOST}" "pm2 status" | grep -E "el-coro" || {
    warn "Workers may not have started correctly. Check pm2 logs."
}

log "Deploy complete."
