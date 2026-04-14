'use strict';

const fs = require('fs');
const path = require('path');

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..', '..');
const PROFILE_PATH = path.join(PLUGIN_ROOT, 'sombra', 'profile.json');
const LOCK_PATH = PROFILE_PATH + '.lock';
const LOCK_STALE_MS = 3000;

function acquireLock() {
  try {
    fs.writeFileSync(LOCK_PATH, String(process.pid), { flag: 'wx' });
    return true;
  } catch (_) {
    // Lock exists — check if stale
    try {
      const stat = fs.statSync(LOCK_PATH);
      if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
        fs.unlinkSync(LOCK_PATH);
        fs.writeFileSync(LOCK_PATH, String(process.pid), { flag: 'wx' });
        return true;
      }
    } catch (_) {}
    // Lock is held by another process — skip this update instead of blocking
    return false;
  }
}

function releaseLock() {
  try { fs.unlinkSync(LOCK_PATH); } catch (_) {}
}

function readProfile() {
  try { return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8')); } catch (_) { return null; }
}

function writeProfile(profile) {
  const tmp = PROFILE_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(profile, null, 2));
  fs.renameSync(tmp, PROFILE_PATH);
}

/**
 * Safely read-modify-write profile.json with file locking.
 * @param {(profile: object) => void} modifier - Mutates the profile object in place.
 * @returns {boolean} true if update succeeded
 */
function updateProfile(modifier) {
  if (!acquireLock()) return false;
  try {
    const profile = readProfile();
    if (!profile) return false;
    modifier(profile);
    profile.last_updated = new Date().toISOString();
    writeProfile(profile);
    return true;
  } finally {
    releaseLock();
  }
}

module.exports = { updateProfile, readProfile, PROFILE_PATH };
