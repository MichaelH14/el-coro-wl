#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..');

// Auto-init state store on first use
(function ensureStateStore() {
  const dbPath = path.join(PLUGIN_ROOT, 'state', 'el-coro.db');
  if (!fs.existsSync(dbPath)) {
    try {
      const initScript = path.join(PLUGIN_ROOT, 'scripts', 'lib', 'state-store', 'init.js');
      if (fs.existsSync(initScript)) {
        require('child_process').execFileSync('node', [initScript], {
          stdio: 'ignore',
        });
      }
    } catch (_) {
      // init failed — will be retried on next load
    }
  }
})();

// Ensure sombra predictions directory exists
(function ensurePredictions() {
  try {
    const predDir = path.join(PLUGIN_ROOT, 'sombra', 'predictions');
    if (!fs.existsSync(predDir)) {
      fs.mkdirSync(predDir, { recursive: true });
      fs.writeFileSync(path.join(predDir, 'pending.json'), '[]');
    }
  } catch (_) {}
})();

function readMdFiles(dir) {
  const parts = [];
  try {
    if (!fs.existsSync(dir)) return parts;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(dir, file), 'utf8').trim();
        if (content) parts.push(content);
      } catch (_) {
        // Skip unreadable files
      }
    }
  } catch (_) {
    // Directory not accessible
  }
  return parts;
}

function loadProfile() {
  const profilePath = path.join(PLUGIN_ROOT, 'sombra', 'profile.json');
  const templatePath = path.join(PLUGIN_ROOT, 'sombra', 'profile.template.json');

  try {
    if (!fs.existsSync(profilePath)) {
      if (fs.existsSync(templatePath)) {
        fs.copyFileSync(templatePath, profilePath);
      } else {
        return null;
      }
    }
    return JSON.parse(fs.readFileSync(profilePath, 'utf8'));
  } catch (_) {
    return null;
  }
}

function summarizeProfile(profile) {
  if (!profile) return '';

  const parts = [];

  if (profile.communication && profile.communication.language) {
    parts.push(`Idioma: ${profile.communication.language}`);
  }

  if (profile.personality && profile.personality.traits && profile.personality.traits.length > 0) {
    parts.push(`Rasgos: ${profile.personality.traits.join(', ')}`);
  }

  if (profile.work_style && profile.work_style.priorities && profile.work_style.priorities.length > 0) {
    parts.push(`Prioridades: ${profile.work_style.priorities.join(', ')}`);
  }

  if (profile.domain_confidence) {
    const high = Object.entries(profile.domain_confidence)
      .filter(([, v]) => v >= 0.7)
      .map(([k]) => k);
    if (high.length > 0) {
      parts.push(`Dominios alta confianza: ${high.join(', ')}`);
    }
  }

  return parts.length > 0 ? parts.join('\n') : '';
}

function checkAgentTeams() {
  // Check if Agent Teams is enabled
  const settingsPath = path.join(process.env.HOME || '', '.claude', 'settings.json');
  try {
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      const envFlag = settings.env && settings.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS;
      if (envFlag !== '1' && envFlag !== 1) {
        return 'El Coro: Agent Teams no esta habilitado. Ejecuta: claude config set env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS 1';
      }
    }
  } catch (_) {
    // Can't check — skip
  }
  return null;
}

function main() {
  // Record session start time for session-summary.js
  const sessionStartPath = path.join(PLUGIN_ROOT, 'state', 'session-start.json');
  try {
    const stateDir = path.join(PLUGIN_ROOT, 'state');
    if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });
    fs.writeFileSync(sessionStartPath, JSON.stringify({ started_at: new Date().toISOString() }));
  } catch (_) {}

  // Auto-install status line script
  try {
    const src = path.join(PLUGIN_ROOT, 'hooks', 'scripts', 'statusline.sh');
    const dest = path.join(process.env.HOME || '', '.claude', 'statusline-command.sh');
    if (fs.existsSync(src)) {
      const srcContent = fs.readFileSync(src, 'utf8');
      const destContent = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : '';
      if (srcContent !== destContent) {
        fs.writeFileSync(dest, srcContent);
        fs.chmodSync(dest, '755');
      }
    }
  } catch (_) {}

  const sections = [];

  // Dynamic component counts
  const agentCount = readMdFiles(path.join(PLUGIN_ROOT, 'agents')).length;
  let skillCount = 0;
  try {
    const skillsDir = path.join(PLUGIN_ROOT, 'skills');
    if (fs.existsSync(skillsDir)) {
      // Skills can be at depth 2 (category/skill.md) or depth 3 (category/skill-name/SKILL.md)
      const countMd = (dir) => {
        let n = 0;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          if (entry.isFile() && entry.name.endsWith('.md')) n++;
          else if (entry.isDirectory() && entry.name !== 'scripts') n += countMd(path.join(dir, entry.name));
        }
        return n;
      };
      skillCount = countMd(skillsDir);
    }
  } catch (_) {}
  const commandCount = readMdFiles(path.join(PLUGIN_ROOT, 'commands')).length;

  // Activation message (visible in terminal)
  process.stderr.write(`\x1b[1;34m El Coro activated\x1b[0m — ${agentCount} agentes, ${skillCount} skills, ${commandCount} commands\n`);

  // Compact system message — sombra profile is internal context, not shown to user
  const profile = loadProfile();
  const profileSummary = summarizeProfile(profile);
  const sombra = profileSummary ? ` Sombra: ${profileSummary.replace(/\n/g, '. ')}` : '';

  sections.push(`El Coro v1.0 ACTIVO. ${agentCount} agentes, ${skillCount} skills, ${commandCount} commands.

REGLA OBLIGATORIA: Siempre usa los agentes de El Coro (subagent_type: "el-coro:*") para tareas de implementacion. NO hagas el trabajo directo — delega a los agentes especializados:
- Tareas generales/multi-paso: el-coro:conductor (orquesta todo)
- Planificar: el-coro:planner
- Disenar UI: el-coro:designer
- Codigo/features: el-coro:code-reviewer, el-coro:architect
- Bugs: el-coro:debugger
- Deploy: el-coro:deploy-validator
- Seguridad: el-coro:security-reviewer
- Cuando no sepas cual usar: el-coro:conductor decide

Responder en espanol. No preguntar, hacer.${sombra}`);

  if (sections.length === 0) {
    process.exit(0);
    return;
  }

  const systemMessage = sections.join('\n\n---\n\n');
  process.stdout.write(JSON.stringify({ systemMessage }));
}

main();
