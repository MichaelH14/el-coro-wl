import fs from 'fs';
import path from 'path';

const VPS_DATA_DIR = process.env.EL_CORO_VPS_DATA_DIR ?? '/home/YOUR_VPS_USER/el-coro-vps';

// ─── Monitor Data ───────────────────────────────────────────

interface HealthCheck {
  name: string;
  status: 'up' | 'down';
  code: number | null;
}

interface MonitorEntry {
  timestamp: string;
  results: HealthCheck[];
}

interface MonitorData {
  checks: MonitorEntry[];
  alerts: Array<{ timestamp: string; service: string; message: string }>;
}

export function getMonitorData(): MonitorData {
  try {
    const raw = fs.readFileSync(path.join(VPS_DATA_DIR, 'monitor-logs.json'), 'utf8');
    if (raw.length > 5_000_000) return { checks: [], alerts: [] }; // 5MB guard
    const data = JSON.parse(raw);
    return {
      checks: (Array.isArray(data.checks) ? data.checks : []).slice(-100).map((entry: Record<string, unknown>) => ({
        timestamp: String(entry.timestamp || '').slice(0, 30),
        results: (Array.isArray(entry.results) ? entry.results : []).map((r: Record<string, unknown>) => ({
          name: String(r.name || '').slice(0, 100),
          status: r.status === 'up' ? 'up' as const : 'down' as const,
          code: typeof r.code === 'number' ? r.code : null,
        })),
      })),
      alerts: (Array.isArray(data.alerts) ? data.alerts : []).slice(-50).map((a: Record<string, unknown>) => ({
        timestamp: String(a.timestamp || '').slice(0, 30),
        service: String(a.service || '').slice(0, 100),
        message: String(a.message || '').slice(0, 500),
      })),
    };
  } catch {
    return { checks: [], alerts: [] };
  }
}

export function getLatestHealthCheck(): HealthCheck[] {
  const data = getMonitorData();
  if (data.checks.length === 0) return [];
  return data.checks[data.checks.length - 1].results;
}

export function getLastCheckTimestamp(): string | null {
  const data = getMonitorData();
  if (data.checks.length === 0) return null;
  return data.checks[data.checks.length - 1].timestamp;
}

// ─── Support Data ───────────────────────────────────────────

interface SupportTicket {
  id: string;
  timestamp: string;
  product: string;
  severity: string;
  category: string;
  message: string;
  autoResponse: string | null;
  escalated: boolean;
  resolved: boolean;
}

interface SupportData {
  tickets: SupportTicket[];
}

export function getSupportData(): SupportData {
  try {
    const raw = fs.readFileSync(path.join(VPS_DATA_DIR, 'support-tickets.json'), 'utf8');
    if (raw.length > 5_000_000) return { tickets: [] };
    const data = JSON.parse(raw);
    return {
      tickets: (Array.isArray(data.tickets) ? data.tickets : []).slice(-500).map((t: Record<string, unknown>) => ({
        id: String(t.id || ''),
        timestamp: String(t.timestamp || ''),
        product: String(t.product || '').slice(0, 100),
        severity: String(t.severity || 'low').slice(0, 20),
        category: String(t.category || '').slice(0, 100),
        message: String(t.message || '').slice(0, 500),
        autoResponse: t.autoResponse ? String(t.autoResponse).slice(0, 500) : null,
        escalated: Boolean(t.escalated),
        resolved: Boolean(t.resolved),
      })),
    };
  } catch {
    return { tickets: [] };
  }
}

export function getOpenTickets(): SupportTicket[] {
  return getSupportData().tickets.filter(t => !t.resolved);
}

export function getCriticalTickets(): SupportTicket[] {
  return getOpenTickets().filter(t => t.severity === 'critical');
}

// ─── Growth Data ───────────────────────────────────────────

interface DailyGrowth {
  date: string;
  timestamp: string;
  services: Record<string, {
    available: boolean;
    users: number | null;
    requests: number | null;
    errors: number | null;
  }>;
}

interface GrowthData {
  daily: DailyGrowth[];
  weekly: Array<{ week: string; summary: Record<string, unknown> }>;
}

export function getGrowthData(): GrowthData {
  try {
    const raw = fs.readFileSync(path.join(VPS_DATA_DIR, 'growth-metrics.json'), 'utf8');
    if (raw.length > 5_000_000) return { daily: [], weekly: [] };
    const data = JSON.parse(raw);
    return {
      daily: Array.isArray(data.daily) ? data.daily.slice(-90) : [],
      weekly: Array.isArray(data.weekly) ? data.weekly.slice(-52) : [],
    };
  } catch {
    return { daily: [], weekly: [] };
  }
}

// ─── Sombra Profile ───────────────────────────────────────

export interface SombraDomain {
  domain: string;
  confidence: number;
  observations: number;
}

export interface SombraProfileData {
  domains: SombraDomain[];
  traits: string[];
  priorities: string[];
  language: string | null;
  lastUpdated: string | null;
}

export function getSombraProfile(): SombraProfileData {
  try {
    const raw = fs.readFileSync(path.join(VPS_DATA_DIR, 'sombra-profile.json'), 'utf8');
    const data = JSON.parse(raw);
    const domains: SombraDomain[] = [];
    if (data.domain_confidence && typeof data.domain_confidence === 'object') {
      for (const [key, val] of Object.entries(data.domain_confidence)) {
        const conf = typeof val === 'number' ? val : 0;
        if (conf > 0) {
          domains.push({
            domain: key.replace(/_/g, ' '),
            confidence: Math.round(conf * 100),
            observations: 0,
          });
        }
      }
    }
    return {
      domains: domains.sort((a, b) => b.confidence - a.confidence),
      traits: Array.isArray(data.personality?.traits) ? data.personality.traits : [],
      priorities: Array.isArray(data.work_style?.priorities) ? data.work_style.priorities : [],
      language: data.communication?.language || null,
      lastUpdated: data.last_updated || null,
    };
  } catch {
    return { domains: [], traits: [], priorities: [], language: null, lastUpdated: null };
  }
}

// ─── Combined Summary ───────────────────────────────────────

export interface DashboardSummary {
  servicesUp: number;
  servicesDown: number;
  totalServices: number;
  openTickets: number;
  criticalTickets: number;
  escalatedTickets: number;
  lastHealthCheck: string | null;
  services: HealthCheck[];
  recentAlerts: Array<{ timestamp: string; service: string; message: string }>;
}

export function getDashboardSummary(): DashboardSummary {
  // Single read of monitor data (was reading 3x before)
  const monitor = getMonitorData();
  const health = monitor.checks.length > 0
    ? monitor.checks[monitor.checks.length - 1].results
    : [];
  const lastCheck = monitor.checks.length > 0
    ? monitor.checks[monitor.checks.length - 1].timestamp
    : null;
  const support = getSupportData();
  const openTickets = support.tickets.filter(t => !t.resolved);

  return {
    servicesUp: health.filter(s => s.status === 'up').length,
    servicesDown: health.filter(s => s.status === 'down').length,
    totalServices: health.length,
    openTickets: openTickets.length,
    criticalTickets: openTickets.filter(t => t.severity === 'critical').length,
    escalatedTickets: openTickets.filter(t => t.escalated).length,
    lastHealthCheck: lastCheck,
    services: health,
    recentAlerts: (monitor.alerts || []).slice(-10),
  };
}
