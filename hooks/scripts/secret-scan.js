#!/usr/bin/env node
'use strict';

const SECRET_PATTERNS = [
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'OpenAI API Key', pattern: /sk-[a-zA-Z0-9]{20,}/ },
  { name: 'Stripe Live Key', pattern: /sk_live_[a-zA-Z0-9]{20,}/ },
  { name: 'Stripe Test Key', pattern: /sk_test_[a-zA-Z0-9]{20,}/ },
  { name: 'GitHub Token', pattern: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'GitHub OAuth', pattern: /gho_[a-zA-Z0-9]{36}/ },
  { name: 'Slack Token', pattern: /xox[bpors]-[a-zA-Z0-9-]+/ },
  { name: 'Bearer Token hardcoded', pattern: /["']Bearer\s+[a-zA-Z0-9._\-]{20,}["']/ },
  { name: 'Private Key header', pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/ },
  { name: 'Password assignment', pattern: /(?:password|passwd|secret)\s*[:=]\s*["'][^"']{4,}["']/i },
  { name: 'Anthropic API Key', pattern: /sk-ant-[a-zA-Z0-9\-]{20,}/ },
  { name: 'Google API Key', pattern: /AIza[a-zA-Z0-9_\-]{35}/ },
  { name: 'Private IP hardcoded', pattern: /["'](?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})["']/ },
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

function scanContent(text) {
  if (!text || typeof text !== 'string') return null;

  for (const { name, pattern } of SECRET_PATTERNS) {
    if (pattern.test(text)) {
      return name;
    }
  }
  return null;
}

async function main() {
  try {
    const input = await readStdin();
    if (!input || !input.tool_input) {
      process.exit(0);
      return;
    }

    // For Write tool: check content
    // For Edit tool: check new_string
    const textToScan = input.tool_input.content || input.tool_input.new_string || '';

    const found = scanContent(textToScan);
    if (found) {
      process.stderr.write(`BLOQUEADO: Posible secret detectado: ${found}. Usa env vars.`);
      process.exit(2);
      return;
    }
  } catch (_) {
    // Graceful degradation
  }

  process.exit(0);
}

main();
