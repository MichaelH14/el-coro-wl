#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..');

function main() {
  const agentsDir = path.join(PLUGIN_ROOT, 'agents');

  try {
    if (!fs.existsSync(agentsDir)) {
      process.exit(0);
      return;
    }

    const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    if (files.length === 0) {
      process.exit(0);
      return;
    }

    const invalid = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');

        // Check starts with YAML frontmatter
        if (!content.startsWith('---')) {
          invalid.push(`${file}: no tiene frontmatter YAML (debe empezar con ---)`);
          continue;
        }

        // Find closing ---
        const endIdx = content.indexOf('---', 3);
        if (endIdx === -1) {
          invalid.push(`${file}: frontmatter YAML no cerrado (falta --- de cierre)`);
          continue;
        }

        const frontmatter = content.substring(3, endIdx).trim();

        const lines = frontmatter.split('\n');
        const hasField = (field) => lines.some(line => {
          const trimmed = line.trim();
          return trimmed.startsWith(`${field}:`) || trimmed.startsWith(`${field} :`);
        });

        if (!hasField('name')) {
          invalid.push(`${file}: frontmatter no tiene campo 'name'`);
        }
        if (!hasField('model')) {
          invalid.push(`${file}: frontmatter no tiene campo 'model'`);
        }
        if (!hasField('description')) {
          invalid.push(`${file}: frontmatter no tiene campo 'description'`);
        }
      } catch (err) {
        invalid.push(`${file}: no se pudo leer (${err.message})`);
      }
    }

    if (invalid.length > 0) {
      process.stderr.write(
        `[integrity-check] Agentes con problemas:\n` +
        invalid.map(msg => `  - ${msg}`).join('\n') + '\n'
      );
    }
  } catch (_) {
    // Graceful degradation
  }

  process.exit(0);
}

main();
