#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * PostToolUse hook: post-deploy-health.js
 * Triggers after a Bash command containing "deploy.sh" is executed.
 * Checks the service ports declared in config/el-coro.json to verify the
 * deploy is healthy. No services configured -> exits silently.
 */

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..');

// Map configured services to their ports — only check the deployed service.
// Built from config/el-coro.json: services[].name -> [services[].port]
function loadServiceMap() {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(PLUGIN_ROOT, 'config', 'el-coro.json'), 'utf8'));
    const map = {};
    for (const s of cfg.services || []) {
      if (s && s.name && s.port) map[String(s.name).toLowerCase()] = [s.port];
    }
    return map;
  } catch (_) {
    return {};
  }
}

const PROJECT_PORT_MAP = loadServiceMap();
const ALL_PORTS = [...new Set(Object.values(PROJECT_PORT_MAP).flat())];
const WAIT_MS = 5000;
const REQUEST_TIMEOUT_MS = 5000;

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    setTimeout(() => resolve(data), 1000);
  });
}

async function getToolInput() {
  try {
    const raw = await readStdin();
    const input = JSON.parse(raw || '{}');
    return (input.tool_input && input.tool_input.command) || '';
  } catch (_) {
    return '';
  }
}

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, { timeout: REQUEST_TIMEOUT_MS }, (res) => {
      resolve({ port, status: res.statusCode, ok: res.statusCode < 500 });
    });
    req.on('error', () => {
      resolve({ port, status: null, ok: false });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ port, status: null, ok: false });
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const command = await getToolInput();

  // Only trigger after deploy.sh commands
  if (!command.includes('deploy.sh')) {
    process.exit(0);
    return;
  }

  // No services configured -> nothing to check, exit silently
  if (ALL_PORTS.length === 0) {
    process.exit(0);
    return;
  }

  // Determine which ports to check based on the deploy command
  let portsToCheck = ALL_PORTS;
  for (const [project, ports] of Object.entries(PROJECT_PORT_MAP)) {
    if (command.toLowerCase().includes(project)) {
      portsToCheck = ports;
      break;
    }
  }

  // Wait for service to come up
  await sleep(WAIT_MS);

  const results = await Promise.all(portsToCheck.map(checkPort));
  const warnings = [];

  for (const result of results) {
    if (!result.ok) {
      warnings.push(`Deploy health check FAILED for port ${result.port}. Consider rollback.`);
    }
  }

  if (warnings.length > 0) {
    process.stdout.write(JSON.stringify({
      systemMessage: warnings.join('\n')
    }));
  }

  // Always exit 0 (informational only)
  process.exit(0);
}

main();
