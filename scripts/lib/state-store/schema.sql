-- El Coro State Store Schema v1

-- Instincts aprendidos por cortex
CREATE TABLE IF NOT EXISTS instincts (
  id TEXT PRIMARY KEY,
  trigger_pattern TEXT NOT NULL,
  action TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.3,
  domain TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'project',
  project_id TEXT,
  evidence_count INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  promoted_to TEXT,
  archived_at TEXT,
  archive_reason TEXT
);

-- Sesiones
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT,
  summary TEXT,
  agents_used TEXT,
  tasks_completed INTEGER DEFAULT 0,
  tokens_claude INTEGER DEFAULT 0,
  tokens_codex INTEGER DEFAULT 0
);

-- Metricas de agentes
CREATE TABLE IF NOT EXISTS agent_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  task_description TEXT,
  outcome TEXT NOT NULL,
  duration_ms INTEGER,
  qa_approved INTEGER,
  qa_loops INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Predicciones de sombra
CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  prediction TEXT NOT NULL,
  confidence REAL NOT NULL,
  actual_result TEXT,
  was_correct INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Metricas de growth
CREATE TABLE IF NOT EXISTS growth_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  period TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tickets de soporte
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  product TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  category TEXT NOT NULL DEFAULT 'question',
  message TEXT NOT NULL,
  auto_response TEXT,
  escalated INTEGER NOT NULL DEFAULT 0,
  resolved INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'whatsapp',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

-- Componentes creados por genesis
CREATE TABLE IF NOT EXISTS genesis_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  component_type TEXT NOT NULL,
  component_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  file_path TEXT NOT NULL,
  qa_approved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Governance/deploy events
CREATE TABLE IF NOT EXISTS deploy_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT,
  rolled_back INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_instincts_domain ON instincts(domain);
CREATE INDEX IF NOT EXISTS idx_instincts_confidence ON instincts(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent ON agent_metrics(agent_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_domain ON predictions(domain, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_growth_product ON growth_metrics(product, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_product ON support_tickets(product, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_open ON support_tickets(resolved, severity);
