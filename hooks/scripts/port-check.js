#!/usr/bin/env node
'use strict';

const net = require('net');
const { execSync } = require('child_process');

// Patterns that indicate port assignment or usage
const PORT_PATTERNS = [
  /\bPORT\s*=\s*(\d+)/,
  /--port\s+(\d+)/,
  /--port=(\d+)/,
  /\.listen\(\s*(\d+)/,
  /:(\d{4,5})\b/,
  /-p\s+(\d+):(\d+)/,         // docker -p host:container
  /-p\s+(\d+)/,                // simple -p port
];

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (_) {
        resolve(null);
      }
    });
    process.stdin.on('error', reject);
  });
}

function extractPort(cmd) {
  for (const pattern of PORT_PATTERNS) {
    const match = cmd.match(pattern);
    if (match) {
      const port = parseInt(match[1], 10);
      if (port >= 1024 && port <= 65535) {
        return port;
      }
    }
  }
  return null;
}

function checkPortInUse(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(500);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, '127.0.0.1');
  });
}

function getProcessOnPort(port) {
  try {
    const result = execSync(`lsof -i :${port} -t 2>/dev/null`, { encoding: 'utf8' }).trim();
    if (result) {
      const pid = result.split('\n')[0];
      try {
        const name = execSync(`ps -p ${pid} -o comm= 2>/dev/null`, { encoding: 'utf8' }).trim();
        return name || `PID ${pid}`;
      } catch (_) {
        return `PID ${pid}`;
      }
    }
  } catch (_) {
    // lsof not available or no process found
  }
  return 'proceso desconocido';
}

async function main() {
  try {
    const input = await readStdin();
    if (!input || !input.tool_input || !input.tool_input.command) {
      process.exit(0);
      return;
    }

    const cmd = input.tool_input.command;
    const port = extractPort(cmd);

    if (!port) {
      process.exit(0);
      return;
    }

    const inUse = await checkPortInUse(port);
    if (inUse) {
      const proc = getProcessOnPort(port);
      process.stderr.write(`BLOQUEADO: Puerto ${port} ya esta en uso por ${proc}`);
      process.exit(2);
      return;
    }
  } catch (_) {
    // Graceful degradation
  }

  process.exit(0);
}

main();
