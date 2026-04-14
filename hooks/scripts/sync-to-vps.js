#!/usr/bin/env node
'use strict';

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..');
const VPS_USER = process.env.EL_CORO_VPS_USER || '';
const VPS_HOST = process.env.EL_CORO_VPS_HOST || '';
const REMOTE_DIR = process.env.EL_CORO_REMOTE_DIR || `/home/${VPS_USER}/el-coro-vps`;

const SSH_OPTS = ['-o', 'ConnectTimeout=3', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=no'];

function scp(localPath, remoteName) {
  return new Promise((resolve) => {
    if (!fs.existsSync(localPath)) {
      resolve(false);
      return;
    }
    execFile('scp', [
      ...SSH_OPTS,
      localPath,
      `${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/${remoteName}`,
    ], { timeout: 10000 }, (err) => {
      resolve(!err);
    });
  });
}

async function main() {
  // Skip sync if VPS not configured
  if (!VPS_HOST || VPS_HOST === 'YOUR_VPS_IP') {
    process.exit(0);
    return;
  }
  try {
    const sombraProfile = path.join(PLUGIN_ROOT, 'sombra', 'profile.json');
    const instincts = path.join(PLUGIN_ROOT, 'state', 'instincts.json');

    // Sync in parallel — fire-and-forget, never block session end
    await Promise.all([
      scp(sombraProfile, 'sombra-profile.json'),
      scp(instincts, 'instincts.json'),
    ]);
  } catch (_) {
    // Graceful degradation — never fail on Stop
  }

  process.exit(0);
}

main();
