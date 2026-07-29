#!/usr/bin/env node
'use strict';

// Blindaje anti-recursion: si corremos dentro de una sesion de aprendizaje, salir ya.
require('./lib/guard');

const net = require('net');
const { execSync } = require('child_process');

// Comandos cliente: se conectan a un puerto, no lo ocupan. Nunca deben
// disparar el chequeo de "puerto en uso".
const CLIENT_COMMANDS = new Set([
  'curl', 'wget', 'http', 'https', 'psql', 'mysql', 'redis-cli', 'mongosh',
  'nc', 'ncat', 'telnet', 'ssh', 'lsof', 'ss', 'netstat',
]);

// Patrones que indican que el comando intenta LEVANTAR algo en un puerto
// (bind), no conectarse a uno ya existente.
const BIND_PATTERNS = [
  /\bPORT\s*=\s*(\d+)/,              // PORT=3000 node server.js
  /--port[=\s]+(\d+)/,               // vite --port 3000 / --port=3000
  /-P\s+(\d+)/,                      // servidores que usan -P (mayuscula)
  /\.listen\(\s*(\d+)/,              // server.listen(3000)
  /-p\s+(\d+):(\d+)/,                // docker run -p host:container
  /(?:^|\s)-p\s+(\d+)\b/,            // next dev -p 3000, http-server -p 3000
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

function splitSegments(cmd) {
  return cmd.split(/&&|\|\||[;|]/);
}

function firstCommandToken(segment) {
  const tokens = segment.trim().split(/\s+/).filter(Boolean);
  let i = 0;
  // saltar asignaciones de env var al inicio (FOO=bar comando ...)
  while (i < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[i])) i++;
  const tok = tokens[i];
  if (!tok) return null;
  return tok.split('/').pop();
}

function extractPort(cmd) {
  for (const segment of splitSegments(cmd)) {
    if (/https?:\/\//.test(segment)) continue; // URL => llamada de cliente

    const bin = firstCommandToken(segment);
    if (bin && CLIENT_COMMANDS.has(bin)) continue; // comando cliente conocido

    for (const pattern of BIND_PATTERNS) {
      const match = segment.match(pattern);
      if (match) {
        const port = parseInt(match[1], 10);
        if (port >= 1024 && port <= 65535) {
          return port;
        }
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
    const result = execSync(`lsof -i :${port} -t`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (result) {
      const pid = result.split('\n')[0];
      try {
        const name = execSync(`ps -p ${pid} -o comm=`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        return name || `PID ${pid}`;
      } catch (_) {
        return `PID ${pid}`;
      }
    }
  } catch (_) {
    // lsof no disponible o ningun proceso encontrado
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
    // Degradacion graceful
  }

  process.exit(0);
}

main();
