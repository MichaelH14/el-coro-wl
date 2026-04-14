#!/usr/bin/env node
'use strict';

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => {
      try { resolve(JSON.parse(data)); } catch (_) { resolve(null); }
    });
    process.stdin.on('error', reject);
  });
}

async function main() {
  try {
    const input = await readStdin();
    if (!input) { process.exit(0); return; }

    const tasks = input.assigned_tasks || input.tasks || [];
    if (tasks.length === 0) { process.exit(0); return; }

    const incomplete = tasks.filter(t =>
      t.status !== 'completed' && t.status !== 'done' && t.status !== 'cancelled'
    );

    if (incomplete.length > 0) {
      const names = incomplete.map(t => t.name || t.id || 'unknown').join(', ');
      process.stderr.write(
        `Teammate has ${incomplete.length} unfinished task(s): ${names}`
      );
      process.exit(2);
      return;
    }
  } catch (_) {
    // Graceful degradation
  }
  process.exit(0);
}

main();
