const http = require("http");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

const LOG_FILE = path.join(__dirname, "monitor-logs.json");

// Load config from el-coro.json (set up during installation)
let _config = null;
function getConfig() {
  if (_config) return _config;
  try {
    const configPath = path.join(__dirname, "..", "config", "el-coro.json");
    _config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    _config = { services: [], notifications: { whatsapp: { enabled: false } } };
  }
  return _config;
}

function getServices() {
  const cfg = getConfig();
  return (cfg.services || []).map((s) => ({ name: s.name, port: s.port, path: s.healthPath || "/" }));
}

function getWhatsAppPort() {
  const cfg = getConfig();
  const url = cfg.notifications?.whatsapp?.apiUrl || "";
  const match = url.match(/:(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function isWhatsAppEnabled() {
  return getConfig().notifications?.whatsapp?.enabled === true;
}

function readLog() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(LOG_FILE, "utf8"));
      if (!parsed.serviceState) {
        parsed.serviceState = {};
      }
      return parsed;
    }
  } catch (err) {
    console.error("[monitor] Failed to read log:", err.message);
  }
  return { checks: [], alerts: [], serviceState: {} };
}

function writeLog(data) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[monitor] Failed to write log:", err.message);
  }
}

function checkService(service) {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: "127.0.0.1", port: service.port, path: service.path, timeout: 5000 },
      (res) => {
        resolve({ name: service.name, status: "up", code: res.statusCode });
      }
    );
    req.on("error", () => {
      resolve({ name: service.name, status: "down", code: null });
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ name: service.name, status: "down", code: null });
    });
  });
}

// Services behind tunnels/proxies can take several seconds on the FIRST
// connection after hours idle (cold start) and then respond in <1s. A single
// retry eliminates that false positive without hiding real outages.
async function checkServiceWithRetry(service) {
  const first = await checkService(service);
  if (first.status === "up") return first;
  const second = await checkService(service);
  if (second.status === "up") {
    console.log(`[monitor]   retry-ok ${service.name} (first attempt failed)`);
    return second;
  }
  return second;
}

function sendAlert(message) {
  if (!isWhatsAppEnabled()) {
    console.log("[monitor] WhatsApp alerts disabled. Alert logged to file only.");
    return Promise.resolve({ sent: false });
  }
  const waPort = getWhatsAppPort();
  if (!waPort) return Promise.resolve({ sent: false });

  return new Promise((resolve) => {
    const payload = JSON.stringify({ message });
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: waPort,
        path: "/api/send",
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) },
        timeout: 5000,
      },
      (res) => {
        resolve({ sent: true, status: res.statusCode });
      }
    );
    req.on("error", () => {
      console.error("[monitor] WhatsApp API unavailable, alert logged to file only");
      resolve({ sent: false });
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ sent: false });
    });
    req.write(payload);
    req.end();
  });
}

async function runHealthChecks() {
  const timestamp = new Date().toISOString();
  console.log(`[monitor] Running health checks at ${timestamp}`);

  const SERVICES = getServices();
  if (SERVICES.length === 0) {
    console.log("[monitor] No services configured. Edit config/el-coro.json to add services.");
    return;
  }

  const results = await Promise.all(SERVICES.map(checkServiceWithRetry));
  const log = readLog();

  const entry = { timestamp, results };
  log.checks.push(entry);

  // Keep last 100 checks only
  if (log.checks.length > 100) {
    log.checks = log.checks.slice(-100);
  }

  for (const result of results) {
    const prev = log.serviceState[result.name]?.status;
    const curr = result.status;

    if (curr === "down" && (prev === "up" || prev === undefined)) {
      const alertMsg = `\u26a0\ufe0f ${result.name} caido desde ${timestamp}`;
      console.error(`[monitor] ALERT: ${alertMsg}`);
      await sendAlert(alertMsg);
      log.alerts.push({ timestamp, service: result.name, kind: "outage", message: alertMsg });
      log.serviceState[result.name] = { status: "down", since: timestamp, lastAlertedAt: timestamp };
    } else if (curr === "down" && prev === "down") {
      continue;
    } else if (curr === "up" && prev === "down") {
      const sinceISO = log.serviceState[result.name]?.since || timestamp;
      const downMinutes = Math.max(1, Math.round((new Date(timestamp) - new Date(sinceISO)) / 60000));
      const recoveryMsg = `\u2705 ${result.name} recuperado tras ${downMinutes}m`;
      console.log(`[monitor] RECOVERY: ${recoveryMsg}`);
      await sendAlert(recoveryMsg);
      log.alerts.push({ timestamp, service: result.name, kind: "recovery", message: recoveryMsg });
      log.serviceState[result.name] = { status: "up", since: timestamp, lastAlertedAt: timestamp };
    } else if (!log.serviceState[result.name]) {
      log.serviceState[result.name] = { status: "up", since: timestamp, lastAlertedAt: null };
    } else {
      log.serviceState[result.name].status = "up";
    }
  }

  // Keep last 50 alerts
  if (log.alerts.length > 50) {
    log.alerts = log.alerts.slice(-50);
  }

  writeLog(log);

  const upCount = results.filter((r) => r.status === "up").length;
  console.log(`[monitor] Results: ${upCount}/${results.length} services up`);
}

// Run immediately on start
runHealthChecks();

// Schedule every 6 hours
cron.schedule("0 */6 * * *", () => {
  runHealthChecks();
});

console.log("[monitor] Worker started. Checking every 6 hours.");
