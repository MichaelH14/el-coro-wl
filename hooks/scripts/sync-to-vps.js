#!/usr/bin/env node
'use strict';

// Stop-hook: syncs plugin state to the VPS so background workers can read it.
// Fire-and-forget: never blocks session end, but EVERYTHING gets logged to
// <state>/logs/sync.log — zero silent failures.
//
// Configuration (no hardcoded defaults — graceful skip when unset):
//   env EL_CORO_VPS_HOST / EL_CORO_VPS_USER / EL_CORO_VPS_DIR
//   (EL_CORO_REMOTE_DIR is honored as a legacy alias for EL_CORO_VPS_DIR)
//   or config/el-coro.json → vps.host / vps.user / vps.remoteDir

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const { STATE_ROOT, ensureDir } = require('./lib/state-dir');

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..');

function loadVpsConfig() {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(PLUGIN_ROOT, 'config', 'el-coro.json'), 'utf8'));
    return (cfg && cfg.vps) || {};
  } catch (_) {
    return {};
  }
}

const cfgVps = loadVpsConfig();
const VPS_USER = process.env.EL_CORO_VPS_USER || cfgVps.user || '';
const VPS_HOST = process.env.EL_CORO_VPS_HOST || cfgVps.host || '';
const REMOTE_DIR = process.env.EL_CORO_VPS_DIR || process.env.EL_CORO_REMOTE_DIR || cfgVps.remoteDir
  || (VPS_USER ? `/home/${VPS_USER}/el-coro-vps` : '');

const SSH_OPTS = ['-o', 'ConnectTimeout=5', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=no'];
const LOG_PATH = path.join(ensureDir(path.join(STATE_ROOT, 'logs')), 'sync.log');

function log(line) {
  try {
    fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} ${line}\n`);
  } catch (_) {}
}

function run(cmd, args, timeout) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout }, (err, _stdout, stderr) => {
      resolve(err ? (stderr || err.message || 'error').toString().trim().slice(0, 300) : null);
    });
  });
}

function scpFile(localPath, remoteRelPath) {
  if (!fs.existsSync(localPath)) return Promise.resolve(`skip (missing ${localPath})`);
  return run('scp', [...SSH_OPTS, localPath, `${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/${remoteRelPath}`], 10000);
}

function rsyncDir(localDir, remoteRelPath, { del = true } = {}) {
  if (!fs.existsSync(localDir)) return Promise.resolve(`skip (missing ${localDir})`);
  const args = ['-az'];
  if (del) args.push('--delete');
  args.push(
    '--exclude', '*.lock',
    '--exclude', '*.tmp',
    '-e', `ssh ${SSH_OPTS.join(' ')}`,
    localDir.endsWith('/') ? localDir : `${localDir}/`,
    `${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/${remoteRelPath}/`
  );
  return run('rsync', args, 25000);
}

async function main() {
  // Graceful skip when the VPS is not configured — the plugin works fully local.
  if (!VPS_HOST || !VPS_USER || VPS_HOST === 'YOUR_VPS_IP' || VPS_USER === 'YOUR_VPS_USER' || !REMOTE_DIR) {
    log('SKIP — VPS not configured (set EL_CORO_VPS_HOST/EL_CORO_VPS_USER/EL_CORO_VPS_DIR or config/el-coro.json vps.*)');
    process.exit(0);
    return;
  }

  const started = Date.now();
  try {
    const mkdirErr = await run('ssh', [
      ...SSH_OPTS,
      `${VPS_USER}@${VPS_HOST}`,
      `mkdir -p ${REMOTE_DIR}/plugin-mirror`,
    ], 8000);
    if (mkdirErr) {
      log(`FAIL mkdir plugin-mirror: ${mkdirErr}`);
      process.exit(0);
      return;
    }

    const tasks = [
      ['profile', () => scpFile(path.join(STATE_ROOT, 'sombra', 'profile.json'), 'sombra-profile.json')],
      ['instincts', () => scpFile(path.join(STATE_ROOT, 'state', 'instincts.json'), 'instincts.json')],
      ['mirror/agents', () => rsyncDir(path.join(PLUGIN_ROOT, 'agents'), 'plugin-mirror/agents')],
      ['mirror/skills', () => rsyncDir(path.join(PLUGIN_ROOT, 'skills'), 'plugin-mirror/skills')],
      ['mirror/commands', () => rsyncDir(path.join(PLUGIN_ROOT, 'commands'), 'plugin-mirror/commands')],
      // Flat mirror of agents/ directly into plugin-mirror/ (compat with workers
      // that read agent .md files from the plugin-mirror root). WITHOUT --delete:
      // with --delete this step wiped the agents/skills/commands subdirs that the
      // previous tasks had just uploaded — the bug that froze the mirror.
      ['mirror/flat', () => rsyncDir(path.join(PLUGIN_ROOT, 'agents'), 'plugin-mirror', { del: false })],
    ];

    const results = [];
    await Promise.all(tasks.map(async ([name, fn]) => {
      const err = await fn();
      results.push(err ? `${name}: FAIL ${err}` : `${name}: ok`);
    }));

    const fails = results.filter((r) => r.includes('FAIL')).length;
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    log(`${fails === 0 ? 'OK' : `PARTIAL (${fails} fails)`} in ${secs}s — ${results.sort().join(' | ')}`);
  } catch (e) {
    log(`FAIL unexpected: ${(e && e.message) || e}`);
  }
  process.exit(0);
}

main();
