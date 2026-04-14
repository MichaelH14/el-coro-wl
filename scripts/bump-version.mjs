#!/usr/bin/env node
// Bump the version in .claude-plugin/plugin.json and .claude-plugin/marketplace.json
// Usage: node scripts/bump-version.mjs [patch|minor|major]  (default: patch)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PLUGIN_JSON = path.join(ROOT, '.claude-plugin', 'plugin.json');
const MARKETPLACE_JSON = path.join(ROOT, '.claude-plugin', 'marketplace.json');

const level = (process.argv[2] || 'patch').toLowerCase();
if (!['patch', 'minor', 'major'].includes(level)) {
  console.error(`[bump-version] Invalid level: ${level}. Use patch | minor | major.`);
  process.exit(1);
}

function bump(version, level) {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`Invalid semver: ${version}`);
  }
  if (level === 'major') return `${parts[0] + 1}.0.0`;
  if (level === 'minor') return `${parts[0]}.${parts[1] + 1}.0`;
  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

const plugin = readJson(PLUGIN_JSON);
const oldVersion = plugin.version;
const newVersion = bump(oldVersion, level);
plugin.version = newVersion;
writeJson(PLUGIN_JSON, plugin);

// Keep marketplace.json in sync
if (fs.existsSync(MARKETPLACE_JSON)) {
  const marketplace = readJson(MARKETPLACE_JSON);
  if (Array.isArray(marketplace.plugins)) {
    for (const p of marketplace.plugins) {
      if (p.name === plugin.name) p.version = newVersion;
    }
    writeJson(MARKETPLACE_JSON, marketplace);
  }
}

console.log(`[bump-version] ${oldVersion} -> ${newVersion} (${level})`);
