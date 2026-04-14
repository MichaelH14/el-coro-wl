const http = require("http");
const fs = require("fs");
const path = require("path");

const TICKETS_FILE = path.join(__dirname, "support-tickets.json");
const POLL_INTERVAL = 30000; // 30 seconds

// Load config from el-coro.json
let _config = null;
function getConfig() {
  if (_config) return _config;
  try {
    const configPath = path.join(__dirname, "..", "config", "el-coro.json");
    _config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    _config = { notifications: { whatsapp: { enabled: false } } };
  }
  return _config;
}

function getWhatsAppPort() {
  const url = getConfig().notifications?.whatsapp?.apiUrl || "";
  const match = url.match(/:(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function isWhatsAppEnabled() {
  return getConfig().notifications?.whatsapp?.enabled === true;
}

// Simple FAQ database for v1 -- keyword matching
const FAQ = [
  {
    keywords: ["precio", "costo", "cuanto", "plan", "pagar"],
    answer: "Los detalles de precios estan disponibles en nuestra pagina principal. Si necesitas ayuda especifica, un agente te contactara pronto.",
    category: "pricing",
  },
  {
    keywords: ["error", "falla", "no funciona", "roto", "bug"],
    answer: "Gracias por reportar el problema. Nuestro equipo tecnico lo esta revisando. Te contactaremos con una actualizacion pronto.",
    category: "bug",
  },
  {
    keywords: ["hola", "buenos dias", "buenas", "hey"],
    answer: "Hola! Gracias por contactarnos. En que podemos ayudarte?",
    category: "greeting",
  },
  {
    keywords: ["ayuda", "help", "soporte", "asistencia"],
    answer: "Estamos aqui para ayudarte. Describe tu problema y te asistiremos lo antes posible.",
    category: "support",
  },
];

function readTickets() {
  try {
    if (fs.existsSync(TICKETS_FILE)) {
      return JSON.parse(fs.readFileSync(TICKETS_FILE, "utf8"));
    }
  } catch (err) {
    console.error("[support] Failed to read tickets:", err.message);
  }
  return { tickets: [], stats: { total: 0, auto_resolved: 0, escalated: 0 } };
}

function writeTickets(data) {
  try {
    fs.writeFileSync(TICKETS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[support] Failed to write tickets:", err.message);
  }
}

function classifyMessage(text) {
  const lower = text.toLowerCase();
  if (lower.match(/error|falla|bug|crash|roto|no funciona/)) return "bug_report";
  if (lower.match(/queja|molest|malo|peor|terrible/)) return "complaint";
  if (lower.match(/feature|funcion|agregar|nuevo|quiero que/)) return "feature_request";
  return "question";
}

function findFaqMatch(text) {
  const lower = text.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const faq of FAQ) {
    const matches = faq.keywords.filter((kw) => lower.includes(kw));
    const score = matches.length / faq.keywords.length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  // Require at least 40% keyword match for confidence
  if (bestScore >= 0.4) {
    return { match: bestMatch, confidence: bestScore };
  }
  return { match: null, confidence: 0 };
}

function sendResponse(to, message) {
  if (!isWhatsAppEnabled()) return Promise.resolve({ sent: false });
  const waPort = getWhatsAppPort();
  if (!waPort) return Promise.resolve({ sent: false });

  return new Promise((resolve) => {
    const payload = JSON.stringify({ to, message });
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

function pollMessages() {
  if (!isWhatsAppEnabled()) return Promise.resolve([]);
  const waPort = getWhatsAppPort();
  if (!waPort) return Promise.resolve([]);

  return new Promise((resolve) => {
    const req = http.get(
      { hostname: "127.0.0.1", port: waPort, path: "/api/messages/new", timeout: 10000 },
      (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve([]);
          }
        });
      }
    );
    req.on("error", () => {
      resolve([]);
    });
    req.on("timeout", () => {
      req.destroy();
      resolve([]);
    });
  });
}

async function processMessages() {
  const messages = await pollMessages();
  if (!messages || !messages.length) return;

  const ticketData = readTickets();

  for (const msg of messages) {
    const text = msg.text || msg.body || "";
    if (!text.trim()) continue;

    const classification = classifyMessage(text);
    const faqResult = findFaqMatch(text);

    const ticket = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      from: msg.from || "unknown",
      text: text.slice(0, 500),
      classification,
      status: "open",
    };

    if (faqResult.match && faqResult.confidence >= 0.4) {
      // Auto-respond with FAQ answer
      ticket.status = "auto_resolved";
      ticket.response = faqResult.match.answer;
      ticket.confidence = faqResult.confidence;

      if (msg.from) {
        await sendResponse(msg.from, faqResult.match.answer);
      }
      ticketData.stats.auto_resolved++;
      console.log(`[support] Auto-resolved ticket ${ticket.id} (${classification}, confidence: ${faqResult.confidence.toFixed(2)})`);
    } else {
      // Mark for escalation
      ticket.status = "escalated";
      ticket.reason = faqResult.confidence > 0 ? "low_confidence" : "no_faq_match";
      ticketData.stats.escalated++;
      console.log(`[support] Escalated ticket ${ticket.id} (${classification})`);
    }

    ticketData.tickets.push(ticket);
    ticketData.stats.total++;
  }

  // Keep last 200 tickets
  if (ticketData.tickets.length > 200) {
    ticketData.tickets = ticketData.tickets.slice(-200);
  }

  writeTickets(ticketData);
}

// Poll loop
function startPolling() {
  console.log("[support] Worker started. Polling every 30s.");
  setInterval(() => {
    processMessages().catch((err) => {
      console.error("[support] Poll error:", err.message);
    });
  }, POLL_INTERVAL);
}

startPolling();
