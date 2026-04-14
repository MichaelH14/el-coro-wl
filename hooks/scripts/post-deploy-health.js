#!/usr/bin/env node
'use strict';

const http = require('http');

/**
 * PostToolUse hook: post-deploy-health.js
 * Triggers after a Bash command containing "deploy.sh" is executed.
 * Checks common service ports to verify the deploy is healthy.
 */

// Map known projects to their ports — only check the deployed service
const PROJECT_PORT_MAP = {
  'tae': [3004],
  'komand': [3100],
  'cs-evaluator': [3006],
  'el-coro': [3200],
};
const ALL_PORTS = [3004, 3100, 3006, 3200];
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

  // Determine which ports to check based on the deploy command
  let portsToCheck = ALL_PORTS;
  for (const [project, ports] of Object.entries(PROJECT_PORT_MAP)) {
    if (command.includes(project)) {
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
