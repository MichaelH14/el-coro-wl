#!/usr/bin/env node
'use strict';

// Sombra UserPromptSubmit hook (intense mode).
// Observes the user's prompts: language, length, abbreviations, frustration markers,
// code-switches. Captures the lexical layer that PostToolUse hooks can't see.

const fs = require('fs');
const path = require('path');

const { STATE_ROOT } = require('./lib/state-dir');
const { updateProfile } = require('./lib/profile-lock');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      try { resolve(JSON.parse(data)); } catch (_) { resolve(null); }
    });
  });
}

// Generic Spanish slang/colloquial examples — customize for your own vocabulary.
const SLANG_TOKENS = ['dale', 'jala', 'chequea', 'mucho', 'ponme', 'ponte', 'hazme', 'arreglame'];
const FRUSTRATION_TOKENS = ['no funciona', 'no sirve', 'roto', 'que paso', 'qué pasó', 'no jala', 'caido', 'cayó', 'sigue mal', 'otra vez'];
const SATISFACTION_TOKENS = ['perfecto', 'genial', 'excelente', 'ok ya', 'buenisimo', 'buenísimo', 'asi mismo', 'así mismo'];
const URGENCY_TOKENS = ['ya', 'ahora', 'rapido', 'rápido', 'urgente', 'corre'];

function detectCodeSwitch(text) {
  // Naive: count Spanish vs English markers.
  const spanishMarkers = (text.match(/\b(el|la|los|las|que|para|con|por|pero|mas|menos|hace|hacer|haz|y|o|tambien)\b/gi) || []).length;
  const englishMarkers = (text.match(/\b(the|and|or|with|for|but|that|this|fix|deploy|build|test|review|run)\b/gi) || []).length;
  if (spanishMarkers >= 3 && englishMarkers >= 2) return 'mixed';
  if (spanishMarkers > englishMarkers) return 'es';
  if (englishMarkers > spanishMarkers) return 'en';
  return 'neutral';
}

function detectTone(text) {
  const lower = text.toLowerCase();
  const frustration = FRUSTRATION_TOKENS.filter((t) => lower.includes(t)).length;
  const satisfaction = SATISFACTION_TOKENS.filter((t) => lower.includes(t)).length;
  const urgency = URGENCY_TOKENS.filter((t) => lower.includes(t)).length;
  if (frustration >= 1) return 'frustrated';
  if (satisfaction >= 1) return 'satisfied';
  if (urgency >= 1) return 'urgent';
  return 'neutral';
}

function detectSlangUsage(text) {
  const lower = text.toLowerCase();
  return SLANG_TOKENS.filter((t) => new RegExp(`\\b${t}\\b`).test(lower));
}

function detectTypos(text) {
  // Recurring typos the user makes. Starts empty — sombra populates this map
  // over time as patterns emerge. Example entry: 'mispeled': 'misspelled'
  const knownTypos = {};
  const found = [];
  const lower = text.toLowerCase();
  for (const [typo, correct] of Object.entries(knownTypos)) {
    if (lower.includes(typo)) found.push({ typo, correct });
  }
  return found;
}

function appendSessionLog(entry) {
  const logDir = path.join(STATE_ROOT, 'sombra', 'session_log');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  fs.appendFileSync(path.join(logDir, `${date}.jsonl`), JSON.stringify(entry) + '\n');
}

async function main() {
  try {
    const input = await readStdin();
    if (!input || !input.prompt) { process.exit(0); return; }

    const text = String(input.prompt).slice(0, 4000);
    const length = text.length;
    const word_count = text.trim().split(/\s+/).length;
    const lang = detectCodeSwitch(text);
    const tone = detectTone(text);
    const slang = detectSlangUsage(text);
    const typos = detectTypos(text);
    const hour = new Date().getUTCHours();
    const time_of_day = hour < 6 ? 'late_night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

    updateProfile((profile) => {
      // Lexical drift: vocabulary tracking.
      if (!profile.communication) profile.communication = { patterns: [], vocabulary: {}, anti_patterns: [], language: 'en' };
      if (!profile.communication.vocabulary || typeof profile.communication.vocabulary !== 'object') {
        profile.communication.vocabulary = {};
      }
      for (const s of slang) {
        profile.communication.vocabulary[s] = (profile.communication.vocabulary[s] || 0) + 1;
      }

      // Typo patterns (S-13).
      if (typos.length > 0) {
        if (!profile.communication.typo_patterns) profile.communication.typo_patterns = {};
        for (const { typo } of typos) {
          profile.communication.typo_patterns[typo] = (profile.communication.typo_patterns[typo] || 0) + 1;
        }
      }

      // Tone tracking with time-of-day context.
      if (!profile.triggers) profile.triggers = { frustration: [], satisfaction: [] };
      if (tone === 'frustrated') {
        if (!Array.isArray(profile.triggers.frustration)) profile.triggers.frustration = [];
        profile.triggers.frustration.push({ ts: new Date().toISOString(), source: 'user_prompt', time_of_day, length, lang });
        if (profile.triggers.frustration.length > 50) profile.triggers.frustration = profile.triggers.frustration.slice(-50);
      }
      if (tone === 'satisfied') {
        if (!Array.isArray(profile.triggers.satisfaction)) profile.triggers.satisfaction = [];
        profile.triggers.satisfaction.push({ ts: new Date().toISOString(), source: 'user_prompt', time_of_day, length, lang });
        if (profile.triggers.satisfaction.length > 50) profile.triggers.satisfaction = profile.triggers.satisfaction.slice(-50);
      }

      // Domain confidence: communication observed += small increment.
      if (profile.domain_confidence && 'communication' in profile.domain_confidence) {
        profile.domain_confidence.communication = Math.min(1.0,
          (profile.domain_confidence.communication || 0) + 0.005);
      }
    });

    appendSessionLog({
      ts: new Date().toISOString(),
      event: 'user_prompt',
      length,
      word_count,
      lang,
      tone,
      slang,
      typos: typos.map((t) => t.typo),
      time_of_day,
    });
  } catch (_) {
    // Graceful degradation — async hook, never block.
  }
  process.exit(0);
}

main();
