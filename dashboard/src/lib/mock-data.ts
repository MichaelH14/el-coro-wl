// ─── Agents ───────────────────────────────────────────────────────
export type AgentLayer = "Identity" | "Knowledge" | "Operations" | "Growth" | "Support" | "Specialists";
export type AgentModel = "opus" | "sonnet" | "haiku";
export type AgentStatus = "active" | "standby" | "disabled";
export type AgentColor = "blue" | "yellow" | "magenta" | "cyan" | "green" | "gold" | "red" | "orange" | "indigo" | "gray" | "slate" | "purple" | "teal" | "rose";

export interface Agent {
  id: string;
  name: string;
  layer: AgentLayer;
  model: AgentModel;
  color: AgentColor;
  status: AgentStatus;
  description: string;
  role: string;
  triggers: string;
}

export const agents: Agent[] = [
  // Identity (1)
  { id: "a01", name: "sombra", layer: "Identity", model: "opus", color: "magenta", status: "active", description: "Observador silencioso — perfilado de comportamiento y predicción", role: "Te estudia silenciosamente. Aprende cómo hablas, qué te gusta, qué te frustra. Con el tiempo hace que todo el sistema se adapte a ti.", triggers: "Siempre activo — observa cada interacción sin que lo notes." },

  // Knowledge (1)
  { id: "a02", name: "cortex", layer: "Knowledge", model: "sonnet", color: "cyan", status: "active", description: "Guardián del conocimiento y aprendizaje continuo", role: "La memoria del equipo. Recuerda qué se aprendió, qué errores no repetir, qué patrones funcionan.", triggers: "Se activa al inicio y final de cada sesión para guardar lo aprendido." },

  // Operations (4)
  { id: "a03", name: "conductor", layer: "Operations", model: "opus", color: "blue", status: "active", description: "Líder de equipo — orquestación y enrutamiento de tareas", role: "El jefe. Recibe lo que le pides y decide qué agentes necesita para hacerlo. Tú solo hablas con él.", triggers: "Siempre activo — es el que recibe todo lo que dices." },
  { id: "a04", name: "qa-gate", layer: "Operations", model: "sonnet", color: "yellow", status: "active", description: "Puerta de calidad — revisión y validación", role: "Control de calidad. Revisa TODO antes de entregártelo. Si algo tiene errores, lo devuelve a arreglar.", triggers: "Se activa automáticamente antes de entregarte cualquier resultado." },
  { id: "a05", name: "designer", layer: "Operations", model: "sonnet", color: "magenta", status: "active", description: "Diseño UI/UX y cumplimiento de marca", role: "Diseña y construye interfaces. Usa design system, responsive, todos los estados (loading, error, vacío).", triggers: "Cuando pides crear o modificar algo visual — páginas, componentes, UI." },
  { id: "a06", name: "genesis", layer: "Operations", model: "opus", color: "gold", status: "active", description: "Auto-evolución — crea nuevos agentes, skills, comandos", role: "Crea nuevos agentes y habilidades cuando El Coro necesita algo que no tiene.", triggers: "Cuando cortex detecta que falta una capacidad, o cuando tú pides crear algo nuevo." },

  { id: "a07", name: "design-critic", layer: "Operations", model: "sonnet", color: "orange", status: "active", description: "Critica el diseño — encuentra todo lo genérico o feo y exige que se arregle.", role: "Critica el diseño. Su trabajo es encontrar todo lo que se ve genérico o feo y exigir que se arregle.", triggers: "Después de que designer termina, antes de entregarte." },

  // Growth (1)
  { id: "a08", name: "growth-engine", layer: "Growth", model: "sonnet", color: "green", status: "active", description: "Métricas de crecimiento, campañas y experimentos", role: "Tu equipo de marketing. Analiza métricas, genera contenido SEO, crea campañas de email, sugiere A/B tests.", triggers: "Cuando pides algo de marketing, SEO, emails, o análisis de crecimiento." },

  // Support (1)
  { id: "a09", name: "support-agent", layer: "Support", model: "sonnet", color: "cyan", status: "active", description: "Automatización de soporte al cliente", role: "Atiende a tus clientes automáticamente por WhatsApp (Tae). Clasifica problemas y escala lo que no puede resolver.", triggers: "Cuando llega un mensaje de soporte, o cuando pides ver tickets de clientes." },

  // Specialists (17)
  { id: "a10", name: "planner", layer: "Specialists", model: "sonnet", color: "slate", status: "active", description: "Planificación y desglose de tareas", role: "Descompone lo que pides en pasos claros con criterios de éxito para cada uno.", triggers: "Cuando pides hacer algo que requiere más de un paso." },
  { id: "a11", name: "architect", layer: "Specialists", model: "opus", color: "indigo", status: "active", description: "Arquitectura de sistemas y decisiones de diseño", role: "Analiza tu código existente y diseña cómo debería construirse algo nuevo.", triggers: "Cuando pides crear algo nuevo que afecta la estructura del proyecto." },
  { id: "a12", name: "api-designer", layer: "Specialists", model: "sonnet", color: "teal", status: "active", description: "Diseño de API y definición de contratos", role: "Diseña APIs (endpoints, rutas, respuestas) consistentes y bien organizadas.", triggers: "Cuando necesitas crear o modificar endpoints de API." },
  { id: "a13", name: "tdd-guide", layer: "Specialists", model: "sonnet", color: "green", status: "active", description: "Guía de desarrollo dirigido por tests", role: "Te guía a escribir tests primero, luego código. Nunca al revés.", triggers: "Cuando usas /tdd o pides implementar una feature." },
  { id: "a14", name: "debugger", layer: "Specialists", model: "sonnet", color: "red", status: "active", description: "Diagnóstico y resolución de bugs", role: "Investiga bugs sistemáticamente: reproduce, aísla la causa, arregla, verifica.", triggers: "Cuando reportas un bug o algo no funciona como debería." },
  { id: "a15", name: "build-resolver", layer: "Specialists", model: "sonnet", color: "yellow", status: "active", description: "Errores de build y resolución de dependencias", role: "Resuelve errores de compilación y build automáticamente.", triggers: "Cuando el build falla o hay errores de compilación." },
  { id: "a16", name: "code-reviewer", layer: "Specialists", model: "sonnet", color: "purple", status: "active", description: "Revisión de código y buenas prácticas", role: "Revisa código buscando bugs, problemas de lógica y calidad.", triggers: "Cuando usas /review o antes de un deploy." },
  { id: "a17", name: "ts-reviewer", layer: "Specialists", model: "sonnet", color: "rose", status: "active", description: "Revisión específica de TypeScript", role: "Revisa código TypeScript específicamente — tipos, patrones, buenas prácticas de Node.js.", triggers: "Junto con code-reviewer cuando el código es TypeScript." },
  { id: "a18", name: "security-reviewer", layer: "Specialists", model: "sonnet", color: "red", status: "active", description: "Auditoría de seguridad y detección de vulnerabilidades", role: "Busca vulnerabilidades: passwords en código, inyección SQL, dependencias inseguras.", triggers: "Cuando usas /security o antes de un deploy." },
  { id: "a19", name: "performance-profiler", layer: "Specialists", model: "sonnet", color: "yellow", status: "active", description: "Perfilado de rendimiento y optimización", role: "Detecta problemas de rendimiento: memoria, consultas lentas, código que bloquea.", triggers: "Cuando usas /perf o cuando algo está lento." },
  { id: "a20", name: "database-reviewer", layer: "Specialists", model: "sonnet", color: "cyan", status: "active", description: "Revisión de esquemas, queries y migraciones de base de datos", role: "Revisa base de datos: esquemas, consultas, índices, migraciones.", triggers: "Cuando tocas base de datos o haces migraciones." },
  { id: "a21", name: "deploy-validator", layer: "Specialists", model: "sonnet", color: "red", status: "active", description: "Validación de deploy — puertos, CF Tunnel, PM2", role: "Verifica que todo esté listo antes de subir a producción: puertos libres, Cloudflare Tunnel, PM2.", triggers: "Cuando usas /deploy o /ship." },
  { id: "a22", name: "e2e-runner", layer: "Specialists", model: "sonnet", color: "green", status: "active", description: "Ejecución de tests end-to-end", role: "Corre pruebas de principio a fin para verificar que todo funciona junto.", triggers: "Antes de deploy o cuando usas /coverage." },
  { id: "a23", name: "refactor-cleaner", layer: "Specialists", model: "sonnet", color: "green", status: "active", description: "Refactorización y limpieza de código", role: "Limpia código después de terminar una feature: código muerto, duplicación, archivos muy largos.", triggers: "Después de terminar una feature, o cuando usas /refactor." },
  { id: "a24", name: "migration-assistant", layer: "Specialists", model: "sonnet", color: "yellow", status: "active", description: "Guía de migración de stack y servidor", role: "Guía migraciones entre versiones o servidores. Siempre con plan de rollback.", triggers: "Cuando necesitas migrar algo — como cuando moviste Kaon de OpenClaw a Tae." },
  { id: "a25", name: "doc-updater", layer: "Specialists", model: "haiku", color: "gray", status: "active", description: "Actualización de documentación cuando cambia el código", role: "Actualiza documentación cuando el código cambia. Nunca crea docs nuevos sin que lo pidas.", triggers: "Automáticamente después de cambios de código que invalidan docs existentes." },
  { id: "a26", name: "monitor", layer: "Specialists", model: "sonnet", color: "red", status: "active", description: "Monitoreo de salud de servicios y alertas", role: "Vigila tus servicios en el VPS. Si algo se cae, te alerta por WhatsApp.", triggers: "Corre automáticamente cada 6 horas y cuando usas /health." },
];

// ─── Tickets ──────────────────────────────────────────────────────
export type Severity = "critical" | "high" | "medium" | "low";
export type TicketStatus = "open" | "in_progress" | "escalated" | "resolved";

export interface Ticket {
  id: string;
  timestamp: string;
  product: string;
  severity: Severity;
  message: string;
  status: TicketStatus;
  assignedTo: string;
}

export const tickets: Ticket[] = [];

export interface RecurringIssue {
  issue: string;
  count: number;
  lastSeen: string;
}

export const recurringIssues: RecurringIssue[] = [];

// ─── Growth ───────────────────────────────────────────────────────
export interface ProductMetrics {
  product: string;
  dau: number;
  mau: number;
  retention: number;
  churn: number;
  newUsers: number;
  trend: "up" | "down" | "flat";
}

export const growthMetrics: ProductMetrics[] = [];

export interface Campaign {
  name: string;
  product: string;
  status: "active" | "completed" | "scheduled";
  conversion: number;
}

export const campaigns: Campaign[] = [];

export interface ABTest {
  name: string;
  product: string;
  variant: string;
  lift: string;
  status: string;
}

export const abTests: ABTest[] = [];

export interface SEOScore {
  product: string;
  score: number;
}

export const seoScores: Record<string, number> = {};

// ─── Health ───────────────────────────────────────────────────────
export type ServiceStatus = "up" | "down" | "degraded";

export interface ServiceHealth {
  name: string;
  port: number;
  status: ServiceStatus;
  lastCheck: string;
  uptime: number;
  responseTime: number;
  url?: string;
}

export const services: ServiceHealth[] = [];

export interface AlertEntry {
  timestamp: string;
  service: string;
  type: string;
  message: string;
}

export const alertHistory: AlertEntry[] = [];

// ─── Tokens ───────────────────────────────────────────────────────
export interface TokenUsage {
  agent: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  sessions: number;
}

export const tokenUsage: TokenUsage[] = [];

export const tokenSummary = {
  claudeTotal: 0,
  codexTotal: 0,
  codexSavings: 0,
  totalSessions: 0,
};

// ─── Sombra ───────────────────────────────────────────────────────
export interface DomainConfidence {
  domain: string;
  confidence: number;
  observations: number;
}

export const sombraProfile = {
  domains: [] as DomainConfidence[],
  recentObservations: [] as Array<{ timestamp: string; observation: string; confidence: number }>,
  predictionAccuracy: 0,
  timeline: [] as Array<{ date: string; accuracy: number; domains: number }>,
};
