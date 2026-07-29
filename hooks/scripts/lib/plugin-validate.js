'use strict';

// validatePlugin(pluginRoot) — chequeo de integridad ESTRUCTURAL del plugin,
// no de contenido. Nace del incidente de 85 skills invisibles durante meses
// (mal anidadas un nivel de más) sin que integrity-check.js las detectara:
// ese chequeo solo miraba name/model/description de los agentes. Esto amplía
// la cobertura a skills, comandos, colisiones, hooks.json y referencias
// cruzadas — todo lo que puede romperse en silencio.
//
// Puro, sincrónico, sin dependencias externas (solo fs/path). Nunca lanza:
// cualquier fallo de lectura se reporta como problema, no como excepción.

const fs = require('fs');
const path = require('path');

const SEVERIDAD = { CRITICO: 'critico', ALTO: 'alto', MEDIO: 'medio' };

function problema(severidad, que, donde) {
  return { severidad, que, donde };
}

// --- utilidades fs -----------------------------------------------------

function safeReadDir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return [];
  }
}

function safeReadFile(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (_) {
    return null;
  }
}

// Encuentra todos los archivos "SKILL.md" bajo `dir`, a cualquier profundidad
// (para poder detectar precisamente los mal anidados). Devuelve rutas
// absolutas.
function findAllSkillMdFiles(dir) {
  const found = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of safeReadDir(current)) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile() && entry.name === 'SKILL.md') {
        found.push(full);
      }
    }
  }
  return found;
}

// Recorre un árbol de archivos .md a un nivel (sin recursión) — usado para
// agents/ y commands/.
function listMdFilesFlat(dir) {
  return safeReadDir(dir)
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => path.join(dir, e.name));
}

// --- frontmatter YAML mínimo --------------------------------------------
//
// No hay parser YAML disponible como dependencia (solo sql.js en
// node_modules). Esto NO intenta ser un parser YAML completo: solo detecta
// las claves de primer nivel (sin indentación) y su valor en la misma línea,
// suficiente para name/description/memory/model/arguments. Los block
// scalars ("description: |") se toleran: sus líneas indentadas no matchean
// el patrón de clave y se ignoran correctamente.

function extractFrontmatter(content) {
  if (typeof content !== 'string' || !content.startsWith('---')) {
    return { present: false, fields: null, error: 'no empieza con ---' };
  }
  const lines = content.split('\n');
  if (lines[0].trim() !== '---') {
    return { present: false, fields: null, error: 'no empieza con ---' };
  }
  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1) {
    return { present: true, fields: null, error: 'frontmatter no cerrado (falta --- de cierre)' };
  }

  const fields = new Map();
  const keyLineRe = /^([A-Za-z_][A-Za-z0-9_-]*):\s?(.*)$/;
  for (let i = 1; i < endIdx; i++) {
    const line = lines[i];
    const m = keyLineRe.exec(line);
    if (m) {
      const key = m[1];
      let value = m[2].trim();
      // strip comillas simples/dobles envolventes
      if (
        (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
        (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
      ) {
        value = value.slice(1, -1);
      }
      fields.set(key, value);
    }
  }
  return { present: true, fields, error: null, bodyStart: endIdx + 1 };
}

// --- checks individuales --------------------------------------------------

function checkSkills(pluginRoot, problemas) {
  const skillsDir = path.join(pluginRoot, 'skills');
  const skillFiles = findAllSkillMdFiles(skillsDir);
  const validSkillFolders = new Set();

  for (const file of skillFiles) {
    const rel = path.relative(skillsDir, file);
    const segments = rel.split(path.sep);

    if (segments.length !== 2) {
      problemas.push(
        problema(
          SEVERIDAD.CRITICO,
          `SKILL.md anidado a ${segments.length} niveles bajo skills/ en vez de 1 — invisible para Claude Code (solo lee skills/<nombre>/SKILL.md)`,
          `skills/${rel}`
        )
      );
      continue; // mal anidado: no tiene sentido validar su frontmatter como skill "real"
    }

    const folderName = segments[0];
    const content = safeReadFile(file);
    if (content === null) {
      problemas.push(problema(SEVERIDAD.ALTO, 'SKILL.md no se pudo leer', `skills/${rel}`));
      continue;
    }

    const fm = extractFrontmatter(content);
    if (!fm.present || fm.fields === null) {
      problemas.push(
        problema(SEVERIDAD.ALTO, `SKILL.md sin frontmatter YAML válido (${fm.error})`, `skills/${rel}`)
      );
      continue;
    }

    validSkillFolders.add(folderName);

    if (!fm.fields.has('name')) {
      problemas.push(problema(SEVERIDAD.ALTO, "frontmatter de skill sin campo 'name'", `skills/${rel}`));
    } else if (fm.fields.get('name') !== folderName) {
      problemas.push(
        problema(
          SEVERIDAD.MEDIO,
          `name del frontmatter ('${fm.fields.get('name')}') no coincide con la carpeta ('${folderName}')`,
          `skills/${rel}`
        )
      );
    }

    if (!fm.fields.has('description')) {
      problemas.push(problema(SEVERIDAD.ALTO, "frontmatter de skill sin campo 'description'", `skills/${rel}`));
    }
  }

  return validSkillFolders;
}

function checkAgents(pluginRoot, problemas) {
  const agentsDir = path.join(pluginRoot, 'agents');
  const files = listMdFilesFlat(agentsDir);
  const agentNames = new Set();

  for (const file of files) {
    const base = path.basename(file, '.md');
    const rel = path.relative(pluginRoot, file);
    agentNames.add(base);

    const content = safeReadFile(file);
    if (content === null) {
      problemas.push(problema(SEVERIDAD.ALTO, 'agente no se pudo leer', rel));
      continue;
    }

    const fm = extractFrontmatter(content);
    if (!fm.present || fm.fields === null) {
      problemas.push(problema(SEVERIDAD.CRITICO, `agente sin frontmatter YAML válido (${fm.error})`, rel));
      continue;
    }

    if (!fm.fields.has('name')) {
      problemas.push(problema(SEVERIDAD.ALTO, "frontmatter de agente sin campo 'name'", rel));
    } else if (fm.fields.get('name') !== base) {
      problemas.push(
        problema(
          SEVERIDAD.ALTO,
          `name del frontmatter ('${fm.fields.get('name')}') no coincide con el archivo ('${base}.md')`,
          rel
        )
      );
    }

    if (!fm.fields.has('description')) {
      problemas.push(problema(SEVERIDAD.ALTO, "frontmatter de agente sin campo 'description'", rel));
    }

    if (fm.fields.has('memory')) {
      const memVal = fm.fields.get('memory');
      if (!['user', 'project', 'local'].includes(memVal)) {
        problemas.push(
          problema(
            SEVERIDAD.CRITICO,
            `campo 'memory: ${memVal}' inválido — solo se acepta user|project|local (memory: true NO es válido)`,
            rel
          )
        );
      }
    }
  }

  return agentNames;
}

function checkCommands(pluginRoot, problemas) {
  const commandsDir = path.join(pluginRoot, 'commands');
  const files = listMdFilesFlat(commandsDir);
  const commandNames = new Set();
  const contentByRel = new Map();

  for (const file of files) {
    const base = path.basename(file, '.md');
    const rel = path.relative(pluginRoot, file);
    commandNames.add(base);

    const content = safeReadFile(file);
    if (content === null) {
      problemas.push(problema(SEVERIDAD.ALTO, 'comando no se pudo leer', rel));
      continue;
    }
    contentByRel.set(rel, content);

    const fm = extractFrontmatter(content);
    if (!fm.present || fm.fields === null) {
      problemas.push(problema(SEVERIDAD.CRITICO, `comando sin frontmatter YAML válido (${fm.error})`, rel));
      continue;
    }

    if (fm.fields.has('arguments')) {
      problemas.push(
        problema(
          SEVERIDAD.ALTO,
          "campo 'arguments' en frontmatter — el campo válido es 'argument-hint' ('arguments' se ignora en silencio)",
          rel
        )
      );
    }
  }

  return { commandNames, contentByRel };
}

function checkCollisions(skillNames, commandNames, problemas) {
  for (const name of skillNames) {
    if (commandNames.has(name)) {
      problemas.push(
        problema(
          SEVERIDAD.ALTO,
          `colisión de nombre: existe skill y comando '${name}' — uno tapa al otro`,
          `skills/${name}/ vs commands/${name}.md`
        )
      );
    }
  }
}

function checkHooksJson(pluginRoot, problemas) {
  const hooksJsonPath = path.join(pluginRoot, 'hooks', 'hooks.json');
  const rel = path.relative(pluginRoot, hooksJsonPath);
  const content = safeReadFile(hooksJsonPath);
  if (content === null) {
    problemas.push(problema(SEVERIDAD.CRITICO, 'hooks.json no existe o no se pudo leer', rel));
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    problemas.push(problema(SEVERIDAD.CRITICO, `hooks.json no es JSON válido (${err.message})`, rel));
    return;
  }

  // Solo valida los hooks ACTIVOS (bajo "hooks"), no lo que esté bajo
  // "_disabled" u otras claves que empiecen con "_" (convención del repo
  // para secciones apagadas a propósito).
  const activeHooks = parsed && typeof parsed === 'object' ? parsed.hooks : null;
  if (!activeHooks) return;

  const commandRe = /(?:node|bash)\s+"?\$\{CLAUDE_PLUGIN_ROOT\}\/([^"\s]+)"?/;

  function walk(node) {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === 'object') {
      if (typeof node.command === 'string') {
        const m = commandRe.exec(node.command);
        if (m) {
          const scriptRel = m[1];
          const scriptAbs = path.join(pluginRoot, scriptRel);
          if (!fs.existsSync(scriptAbs)) {
            problemas.push(
              problema(
                SEVERIDAD.CRITICO,
                `hooks.json referencia un script que no existe en disco: ${scriptRel}`,
                rel
              )
            );
          }
        }
      }
      for (const key of Object.keys(node)) {
        walk(node[key]);
      }
    }
  }

  walk(activeHooks);
}

// Referencias a agentes/skills nombrados dentro de commands/*.md: patrones
// tipo "`nombre` agent", "agent `nombre`", "`nombre` skill", "skill `nombre`".
// Deliberadamente conservador (exige la palabra agent/skill pegada al
// nombre entre backticks) para no generar falsos positivos con cualquier
// código entre backticks.
function checkCommandReferences(contentByRel, agentNames, skillNames, problemas) {
  const patterns = [
    { re: /`([a-z][a-z0-9-]*)`\s+agent\b/gi, kind: 'agent', names: agentNames },
    { re: /\bagent\s+`([a-z][a-z0-9-]*)`/gi, kind: 'agent', names: agentNames },
    { re: /`([a-z][a-z0-9-]*)`\s+skill\b/gi, kind: 'skill', names: skillNames },
    { re: /\bskill\s+`([a-z][a-z0-9-]*)`/gi, kind: 'skill', names: skillNames },
  ];

  for (const [rel, content] of contentByRel) {
    const seen = new Set();
    for (const { re, kind, names } of patterns) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(content)) !== null) {
        const name = m[1].toLowerCase();
        const key = `${kind}:${name}`;
        if (seen.has(key)) continue;
        if (!names.has(name)) {
          seen.add(key);
          problemas.push(
            problema(
              SEVERIDAD.ALTO,
              `referencia a ${kind} '${name}' que no existe en el plugin`,
              rel
            )
          );
        }
      }
    }
  }
}

// NOTA: el validador upstream (repo personal) incluye una regla que marca
// npm/npx como prohibido — es una preferencia de infra personal (pnpm
// siempre), no una regla universal para quien use este plugin público.
// Deliberadamente omitida acá: cada quien elige su package manager.

// --- entrypoint ------------------------------------------------------------

function validatePlugin(pluginRoot) {
  const problemas = [];

  try {
    const skillNames = checkSkills(pluginRoot, problemas);
    const agentNames = checkAgents(pluginRoot, problemas);
    const { commandNames, contentByRel } = checkCommands(pluginRoot, problemas);
    checkCollisions(skillNames, commandNames, problemas);
    checkHooksJson(pluginRoot, problemas);
    checkCommandReferences(contentByRel, agentNames, skillNames, problemas);
  } catch (err) {
    // El validador nunca debe tirar: si algo interno falla, se reporta como
    // un problema más en vez de propagar la excepción al caller (que puede
    // ser un hook de SessionStart que no puede permitirse crashear).
    problemas.push(
      problema(SEVERIDAD.ALTO, `validatePlugin: fallo interno del validador (${err.message})`, pluginRoot)
    );
  }

  const ok = !problemas.some((p) => p.severidad === SEVERIDAD.CRITICO);
  return { ok, problemas };
}

module.exports = { validatePlugin, SEVERIDAD };
