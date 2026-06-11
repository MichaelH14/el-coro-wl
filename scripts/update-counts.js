#!/usr/bin/env node
'use strict';

// Regenerates the component counts (agents/skills/commands) in the
// plugin.json and marketplace.json descriptions from the real files.
// Run standalone (node scripts/update-counts.js) or from the pre-commit hook.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function countMd(dir) {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length;
  } catch (_) {
    return 0;
  }
}

function countSkills(dir) {
  let n = 0;
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) n += countSkills(p);
      else if (e.name === 'SKILL.md') n++;
    }
  } catch (_) {}
  return n;
}

const agents = countMd(path.join(ROOT, 'agents'));
const commands = countMd(path.join(ROOT, 'commands'));
const skills = countSkills(path.join(ROOT, 'skills'));

const desc = `El Coro: ${agents} agents, ${skills} skills, ${commands} commands — AI orchestration plugin for Claude Code with Agent Teams, sombra profiling, growth engine, support agent, and genesis self-evolution.`;

const pluginPath = path.join(ROOT, '.claude-plugin', 'plugin.json');
const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
plugin.description = desc;
fs.writeFileSync(pluginPath, JSON.stringify(plugin, null, 2) + '\n');

const mktPath = path.join(ROOT, '.claude-plugin', 'marketplace.json');
if (fs.existsSync(mktPath)) {
  const mkt = JSON.parse(fs.readFileSync(mktPath, 'utf8'));
  for (const p of mkt.plugins || []) {
    if (p.name === plugin.name) {
      p.description = `El Coro: ${agents} agents, ${skills} skills, ${commands} commands, Agent Teams, sombra profiling, growth engine, support agent`;
    }
  }
  fs.writeFileSync(mktPath, JSON.stringify(mkt, null, 2) + '\n');
}

console.log(`[update-counts] ${agents} agents, ${skills} skills, ${commands} commands`);
