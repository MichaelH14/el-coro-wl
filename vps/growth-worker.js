const http = require("http");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

const METRICS_FILE = path.join(__dirname, "growth-metrics.json");

// Load config from el-coro.json
let _config = null;
function getConfig() {
  if (_config) return _config;
  try {
    const configPath = path.join(__dirname, "..", "config", "el-coro.json");
    _config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    _config = { services: [], products: [] };
  }
  return _config;
}

function getServiceEndpoints() {
  return (getConfig().services || []).map((s) => ({
    name: s.name,
    port: s.port,
    path: s.statsPath || "/api/stats",
  }));
}

function readMetrics() {
  try {
    if (fs.existsSync(METRICS_FILE)) {
      return JSON.parse(fs.readFileSync(METRICS_FILE, "utf8"));
    }
  } catch (err) {
    console.error("[growth] Failed to read metrics:", err.message);
  }
  return { daily: [], weekly: [] };
}

function writeMetrics(data) {
  try {
    fs.writeFileSync(METRICS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[growth] Failed to write metrics:", err.message);
  }
}

function fetchServiceStats(service) {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: "127.0.0.1", port: service.port, path: service.path, timeout: 5000 },
      (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            resolve({ name: service.name, available: true, data });
          } catch {
            resolve({ name: service.name, available: true, data: {} });
          }
        });
      }
    );
    req.on("error", () => {
      resolve({ name: service.name, available: false, data: {} });
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ name: service.name, available: false, data: {} });
    });
  });
}

async function collectDailyMetrics() {
  const timestamp = new Date().toISOString();
  const date = timestamp.split("T")[0];
  console.log(`[growth] Collecting daily metrics for ${date}`);

  const SERVICE_ENDPOINTS = getServiceEndpoints();
  if (SERVICE_ENDPOINTS.length === 0) {
    console.log("[growth] No services configured. Edit config/el-coro.json to add services.");
    return;
  }

  const results = await Promise.all(SERVICE_ENDPOINTS.map(fetchServiceStats));
  const metrics = readMetrics();

  const entry = {
    date,
    timestamp,
    services: {},
  };

  for (const result of results) {
    entry.services[result.name] = {
      available: result.available,
      users: result.data.users || null,
      requests: result.data.requests || null,
      errors: result.data.errors || null,
    };
  }

  metrics.daily.push(entry);

  // Keep last 90 days
  if (metrics.daily.length > 90) {
    metrics.daily = metrics.daily.slice(-90);
  }

  // Generate weekly summary on Mondays
  const today = new Date();
  if (today.getDay() === 1) {
    generateWeeklySummary(metrics);
  }

  writeMetrics(metrics);
  console.log(`[growth] Daily metrics collected. ${results.filter((r) => r.available).length}/${results.length} services responded.`);
}

function generateWeeklySummary(metrics) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekStr = weekAgo.toISOString().split("T")[0];

  const weekData = metrics.daily.filter((d) => d.date >= weekStr);
  if (weekData.length === 0) return;

  const summary = {
    week_of: weekStr,
    generated: now.toISOString(),
    days_collected: weekData.length,
    services: {},
  };

  // Aggregate per service
  const serviceNames = new Set();
  for (const day of weekData) {
    for (const name of Object.keys(day.services)) {
      serviceNames.add(name);
    }
  }

  for (const name of serviceNames) {
    const days = weekData.filter((d) => d.services[name]);
    const available = days.filter((d) => d.services[name].available).length;
    summary.services[name] = {
      uptime_pct: Math.round((available / Math.max(days.length, 1)) * 100),
      days_tracked: days.length,
    };
  }

  metrics.weekly.push(summary);

  // Keep last 12 weekly summaries
  if (metrics.weekly.length > 12) {
    metrics.weekly = metrics.weekly.slice(-12);
  }

  console.log(`[growth] Weekly summary generated for week of ${weekStr}`);
}

// Schedule at 2am daily
cron.schedule("0 2 * * *", () => {
  collectDailyMetrics();
});

// Run once on start to verify setup
collectDailyMetrics();

console.log("[growth] Worker started. Collecting metrics daily at 2am.");
