export const meta = {
  name: 'el-coro-review',
  description: 'Review multi-agente de El Coro: dimensiones en paralelo + verificación adversarial de cada hallazgo',
  whenToUse: 'Review profundo del diff/branch actual con hallazgos verificados (no especulación). Pasa un target opcional como args (path, branch o descripción).',
  phases: [
    { title: 'Review', detail: 'una dimensión por agente (bugs, seguridad, regresiones)' },
    { title: 'Verify', detail: 'un verificador adversarial por hallazgo' },
  ],
};

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          file: { type: 'string' },
          line: { type: 'number' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          evidence: { type: 'string', description: 'qué se leyó/corrió que sustenta el hallazgo' },
          fix: { type: 'string', description: 'el cambio exacto requerido' },
        },
        required: ['title', 'file', 'severity', 'evidence', 'fix'],
      },
    },
  },
  required: ['findings'],
};

const VERDICT = {
  type: 'object',
  properties: {
    isReal: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['isReal', 'reason'],
};

const target = (typeof args === 'string' && args.trim())
  ? args.trim()
  : 'el diff actual del repo (git status + git diff HEAD; si está limpio, los últimos 2 commits)';

const DIMENSIONS = [
  {
    key: 'bugs',
    prompt: 'Eres reviewer de correctness. Busca SOLO bugs reales: lógica rota, edge cases sin manejar, null/undefined, condiciones invertidas, estados imposibles. Lee el código completo alrededor de cada sospecha antes de reportarla.',
  },
  {
    key: 'seguridad',
    prompt: 'Eres reviewer de seguridad. Busca SOLO problemas verificables: secrets hardcodeados, inyección (SQL/shell/XSS), auth faltante en endpoints con callers reales, input sin validar que llega a sinks peligrosos.',
  },
  {
    key: 'regresiones',
    prompt: 'Eres reviewer de regresiones. Busca SOLO roturas de comportamiento existente: callers que dependen de la firma/shape vieja, mecanismos de arranque no actualizados (regla: cambios completos o nada), referencias a paths/exports renombrados.',
  },
];

phase('Review');
const results = await pipeline(
  DIMENSIONS,
  (d) => agent(
    `${d.prompt}\n\nTarget del review: ${target}.\n\nReglas iron de El Coro: cada hallazgo con file:line y evidencia concreta de lo que LEÍSTE (UA-1: no fabricar). Cero especulación — si no lo verificaste, no lo reportes. Devuelve la lista por StructuredOutput.`,
    { label: `review:${d.key}`, phase: 'Review', schema: FINDINGS },
  ),
  (review, d) => parallel(((review && review.findings) || []).map((f) => () =>
    agent(
      `Verificador adversarial (qa-gate). Intenta REFUTAR este hallazgo leyendo el código real:\n${JSON.stringify(f, null, 2)}\n\nSi logras refutarlo con evidencia, isReal=false con la razón. Si la evidencia lo confirma, isReal=true. Ante la duda: isReal=false (cero falsos positivos).`,
      { label: `verify:${f.file || d.key}`, phase: 'Verify', schema: VERDICT },
    ).then((v) => ({ ...f, dimension: d.key, confirmado: !!(v && v.isReal), veredicto: v ? v.reason : 'verificador no respondió' }))
  )),
);

const all = results.filter(Boolean).flat().filter(Boolean);
const confirmados = all.filter((f) => f.confirmado);
log(`${confirmados.length}/${all.length} hallazgos sobrevivieron la verificación adversarial`);

return {
  confirmados,
  descartados: all.filter((f) => !f.confirmado).map((f) => ({ title: f.title, veredicto: f.veredicto })),
};
