'use strict';

// Blindaje ANTI-RECURSIÓN del pipeline de aprendizaje.
//
// learn-distill.js llama `claude -p ... --model haiku` para destilar
// lecciones. Esa llamada arranca una sesión nueva de Claude Code, y esa
// sesión nueva dispara los hooks del plugin OTRA VEZ (SessionStart,
// PreToolUse, PostToolUse, Stop...). Si el hook Stop de esa sesión hija
// (session-learn.js) no supiera que está corriendo DENTRO de una sesión de
// aprendizaje, volvería a lanzar el destilador -> nueva sesión -> nuevo
// Stop -> nuevo destilador -> recursión infinita.
//
// El corte: session-learn.js (y cualquier otro script de hook que pueda
// quedar atrapado en esa cadena) hace `require('./lib/guard')` como PRIMERA
// línea. learn-distill.js lanza el proceso `claude -p` con la env var
// EL_CORO_LEARNER=1, que se hereda a la sesión hija y a TODOS sus hooks.
// Este módulo, al ser requerido, si ve EL_CORO_LEARNER=1 hace
// process.exit(0) inmediatamente — el hook no hace absolutamente nada.
//
// learn-distill.js en sí NO debe requerir este módulo (él SÍ corre con
// EL_CORO_LEARNER=1 puesto por session-learn.js al lanzarlo, y es
// precisamente el proceso que tiene que seguir corriendo).

function isLearner() {
  return process.env.EL_CORO_LEARNER === '1';
}

if (isLearner()) {
  process.exit(0);
}

module.exports = { isLearner };
