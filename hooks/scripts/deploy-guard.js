#!/usr/bin/env node
'use strict';

// Block direct rsync to any remote host — always use deploy.sh
const VPS_PATTERNS = [
  /rsync\b.*\b(?:\d{1,3}\.){3}\d{1,3}:/,   // rsync to any IP with colon (scp-style)
  /rsync\b.*@.*:/,                            // rsync user@host:
  /rsync\b.*\b(vps|server|remote)\b/i,       // rsync with known hostnames
  /rsync\b.*prod/i,                           // rsync to anything with "prod"
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

async function main() {
  try {
    const input = await readStdin();
    if (!input || !input.tool_input || !input.tool_input.command) {
      process.exit(0);
      return;
    }

    const cmd = input.tool_input.command;

    // Only check commands that contain rsync
    if (!cmd.includes('rsync')) {
      process.exit(0);
      return;
    }

    for (const pattern of VPS_PATTERNS) {
      if (pattern.test(cmd)) {
        process.stderr.write('BLOQUEADO: No rsync directo al VPS. Usa deploy.sh');
        process.exit(2);
        return;
      }
    }
  } catch (_) {
    // Graceful degradation — don't block on hook failure
  }

  process.exit(0);
}

main();
