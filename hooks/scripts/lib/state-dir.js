'use strict';

// Runtime state vive FUERA del directorio de instalación del plugin para que
// reinstalls/updates nunca borren el perfil de sombra, los instincts ni la DB.
// Layout bajo STATE_ROOT (mismo esquema que los dirs viejos del plugin):
//   sombra/profile.json, sombra/session_log/, sombra/predictions/
//   state/el-coro.db, state/instincts.json, state/session-start.json
//   logs/sync.log

const path = require('path');
const fs = require('fs');
const os = require('os');

const STATE_ROOT = process.env.EL_CORO_STATE_DIR || path.join(os.homedir(), '.el-coro');

function ensureDir(dir) {
  try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
  return dir;
}

module.exports = { STATE_ROOT, ensureDir };
