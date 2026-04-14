const fs = require("fs");
const path = require("path");

const MONITOR_LOG = path.join(__dirname, "monitor-logs.json");
const TICKETS_FILE = path.join(__dirname, "support-tickets.json");
const METRICS_FILE = path.join(__dirname, "growth-metrics.json");

function readJSON(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, "utf8"));
    }
  } catch (err) {
    return null;
  }
  return null;
}

function getMonitorSummary() {
  const data = readJSON(MONITOR_LOG);
  if (!data || !data.checks || data.checks.length === 0) {
    return "Sin datos de monitoreo";
  }

  const latest = data.checks[data.checks.length - 1];
  const results = latest.results || [];
  const up = results.filter((r) => r.status === "up");
  const down = results.filter((r) => r.status === "down");

  let summary = `${up.length}/${results.length} servicios arriba`;
  if (down.length > 0) {
    const names = down.map((d) => d.name).join(", ");
    summary += ` (CAIDOS: ${names})`;
  }

  // Recent alerts
  const recentAlerts = (data.alerts || []).filter((a) => {
    const alertTime = new Date(a.timestamp);
    const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);
    return alertTime > eightHoursAgo;
  });

  if (recentAlerts.length > 0) {
    summary += ` | ${recentAlerts.length} alertas en las ultimas 8h`;
  }

  return summary;
}

function getSupportSummary() {
  const data = readJSON(TICKETS_FILE);
  if (!data || !data.tickets || data.tickets.length === 0) {
    return "Sin tickets";
  }

  // Tickets from last 8 hours
  const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);
  const recent = data.tickets.filter((t) => new Date(t.timestamp) > eightHoursAgo);

  if (recent.length === 0) {
    return "Sin tickets nuevos (ultimas 8h)";
  }

  const escalated = recent.filter((t) => t.status === "escalated");
  const autoResolved = recent.filter((t) => t.status === "auto_resolved");
  const bugs = recent.filter((t) => t.classification === "bug_report");

  let summary = `${recent.length} tickets nuevos`;
  if (escalated.length > 0) {
    summary += ` (${escalated.length} escalados)`;
  }
  if (bugs.length > 0) {
    summary += ` (${bugs.length} bugs)`;
  }
  if (autoResolved.length > 0) {
    summary += ` | ${autoResolved.length} auto-resueltos`;
  }

  return summary;
}

function getGrowthSummary() {
  const data = readJSON(METRICS_FILE);
  if (!data || !data.daily || data.daily.length === 0) {
    return "Sin metricas";
  }

  const latest = data.daily[data.daily.length - 1];
  const services = latest.services || {};
  const names = Object.keys(services);

  const available = names.filter((n) => services[n].available);
  let summary = `${available.length}/${names.length} servicios reportando`;

  // Add latest weekly if exists
  if (data.weekly && data.weekly.length > 0) {
    const latestWeek = data.weekly[data.weekly.length - 1];
    summary += ` | Ultimo reporte semanal: ${latestWeek.week_of}`;
  }

  return summary;
}

function getAlertsSummary() {
  const data = readJSON(MONITOR_LOG);
  if (!data || !data.alerts || data.alerts.length === 0) {
    return "Ninguna";
  }

  const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);
  const recent = data.alerts.filter((a) => new Date(a.timestamp) > eightHoursAgo);

  if (recent.length === 0) {
    return "Ninguna en las ultimas 8h";
  }

  return recent.map((a) => a.message).join(" | ");
}

function generateReport() {
  const monitor = getMonitorSummary();
  const support = getSupportSummary();
  const growth = getGrowthSummary();
  const alerts = getAlertsSummary();

  const report = [
    "Buenos dias. Mientras dormias:",
    `  -> Monitor: ${monitor}`,
    `  -> Support: ${support}`,
    `  -> Growth: ${growth}`,
    `  -> Alertas: ${alerts}`,
  ].join("\n");

  console.log(report);
  return report;
}

// Run and output
generateReport();
