import { agents, tickets, tokenUsage, tokenSummary } from "@/lib/mock-data";
import { getDashboardSummary, getGrowthData } from "@/lib/real-data";
import { InfoTip } from "@/components/Tooltip";

export const dynamic = 'force-dynamic';

function StatCard({
  title,
  value,
  subtitle,
  accent,
  children,
}: {
  title: React.ReactNode;
  value: string | number;
  subtitle?: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card group">
      <div className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</div>
      <div className={`text-3xl font-bold tracking-tight ${accent || "text-zinc-100"}`}>{value}</div>
      {subtitle && <div className="mt-1 text-sm text-zinc-400">{subtitle}</div>}
      {children}
    </div>
  );
}

export default function Home() {
  // Real data from VPS workers
  const summary = getDashboardSummary();

  const activeAgents = agents.filter((a) => a.status === "active").length;
  const openTickets = summary.openTickets;
  const criticalTickets = summary.criticalTickets;
  const growthData = getGrowthData();
  const latestDaily = growthData.daily.length > 0 ? growthData.daily[growthData.daily.length - 1] : null;
  const servicesUp = summary.servicesUp;
  const servicesTotal = summary.totalServices;
  const weeklyTokenCost = tokenUsage.reduce((sum, t) => sum + t.cost, 0);
  const lastCheck = summary.lastHealthCheck ? new Date(summary.lastHealthCheck).toLocaleString('es-DO') : 'Nunca';

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Panel de Control — El Coro</h1>
        <p className="mt-1 text-sm text-zinc-500">Último health check: {lastCheck}</p>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Agents */}
        <StatCard title={<>Agentes<InfoTip text="Los agentes son los miembros de tu equipo de IA. Cada uno tiene un trabajo específico, desde diseño hasta seguridad." /></>} value={agents.length} subtitle={`${activeAgents} activos`} accent="text-blue-400">
          <div className="mt-4 flex gap-3">
            {(["active", "standby", "disabled"] as const).map((status) => {
              const count = agents.filter((a) => a.status === status).length;
              const color = status === "active" ? "bg-green-500" : status === "standby" ? "bg-yellow-500" : "bg-zinc-600";
              return (
                <div key={status} className="flex items-center gap-1.5">
                  <span className={`status-dot ${status === "active" ? "up" : status === "standby" ? "warning" : ""}`} style={status === "disabled" ? { backgroundColor: "#52525b" } : {}} />
                  <span className="text-xs text-zinc-500">{count}</span>
                </div>
              );
            })}
          </div>
        </StatCard>

        {/* Skills */}
        <StatCard title={<>Skills<InfoTip text="Son las habilidades que los agentes saben hacer. Más skills = más cosas puede hacer El Coro por ti." /></>} value={123} subtitle="En todos los agentes" accent="text-purple-400">
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-500">
            <div>Sistema: 18</div>
            <div>Workflow: 25</div>
            <div>UI/Frontend: 49</div>
            <div>Operaciones: 31</div>
          </div>
        </StatCard>

        {/* Tickets */}
        <StatCard
          title={<>Tickets Abiertos<InfoTip text="Quejas o preguntas de tus usuarios que aún no se han resuelto. Los críticos necesitan atención inmediata." /></>}
          value={openTickets}
          accent={criticalTickets > 0 ? "text-red-400" : "text-green-400"}
        >
          {openTickets === 0 && tickets.length === 0 ? (
            <div className="mt-3 text-xs text-zinc-600">Sin tickets de soporte aún</div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {criticalTickets > 0 && (
                <span className="badge bg-red-500/15 text-red-400">{criticalTickets} críticos</span>
              )}
              {(() => {
                const high = tickets.filter((t) => t.severity === "high" && t.status !== "resolved").length;
                return high > 0 ? <span className="badge bg-orange-500/15 text-orange-400">{high} altos</span> : null;
              })()}
              {(() => {
                const med = tickets.filter((t) => t.severity === "medium" && t.status !== "resolved").length;
                return med > 0 ? <span className="badge bg-yellow-500/15 text-yellow-400">{med} medios</span> : null;
              })()}
            </div>
          )}
        </StatCard>

        {/* Growth */}
        <StatCard title={<>Crecimiento<InfoTip text="Disponibilidad de tus servicios. Datos reales del VPS." /></>} value={latestDaily ? "Ver detalle" : "Sin datos"} subtitle="Datos en desarrollo" accent="text-emerald-400">
          <div className="mt-3 space-y-2">
            {latestDaily ? Object.entries(latestDaily.services).map(([name, svc]) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">{name}</span>
                <span className={`text-xs font-medium ${svc.available ? "text-green-400" : "text-red-400"}`}>
                  {svc.available ? "Disponible" : "No disponible"}
                </span>
              </div>
            )) : (
              <div className="text-xs text-zinc-600">Datos de usuarios en desarrollo. Conecta growth-metrics.json en el VPS.</div>
            )}
          </div>
        </StatCard>

        {/* Health */}
        <StatCard
          title={<>Salud<InfoTip text="Si tus servicios están corriendo en el servidor. Verde = funcionando, rojo = caído." /></>}
          value={`${servicesUp}/${servicesTotal}`}
          subtitle="Servicios operativos"
          accent={servicesUp === servicesTotal ? "text-green-400" : "text-yellow-400"}
        >
          <div className="mt-3 space-y-1.5">
            {summary.services.length > 0 ? summary.services.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span
                  className="status-dot"
                  style={{
                    backgroundColor: s.status === "up" ? "var(--success)" : "var(--danger)",
                    boxShadow: `0 0 6px ${s.status === "up" ? "var(--success)" : "var(--danger)"}`,
                  }}
                />
                <span className="text-zinc-400">{s.name}</span>
                <span className="ml-auto text-zinc-600">{s.status === "up" ? "Activo" : "Caído"}</span>
              </div>
            )) : (
              <div className="text-xs text-zinc-600">Sin datos de health check aún</div>
            )}
          </div>
        </StatCard>

        {/* Tokens */}
        <StatCard
          title={<>Tokens<InfoTip text="Lo que cuesta usar la IA. Menos tokens = menos costo. Codex hace las tareas simples más barato." /></>}
          value={tokenUsage.length > 0 ? `$${weeklyTokenCost.toFixed(2)}` : "$0.00"}
          subtitle="Costo de uso 7 días"
          accent="text-amber-400"
        >
          {tokenUsage.length === 0 ? (
            <div className="mt-3 text-xs text-zinc-600">Sin datos de tokens aún</div>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Claude (Opus/Sonnet/Haiku)</span>
                <span className="text-zinc-300">${tokenSummary.claudeTotal}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Delegación a Codex</span>
                <span className="text-zinc-300">${tokenSummary.codexTotal}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-green-400">
                <span>Ahorro por Codex</span>
                <span>${tokenSummary.codexSavings}</span>
              </div>
            </div>
          )}
        </StatCard>
      </div>

      {/* Recent Critical Activity */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">Últimos Tickets de Usuarios</h2>
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Severidad</th>
                <th className="px-4 py-3 font-medium max-sm:hidden">Mensaje</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.filter((t) => t.status !== "resolved").length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-600">No hay actividad reciente</td>
                </tr>
              ) : (
                tickets
                  .filter((t) => t.status !== "resolved")
                  .slice(0, 5)
                  .map((t) => {
                    const sevColor =
                      t.severity === "critical"
                        ? "bg-red-500/15 text-red-400"
                        : t.severity === "high"
                          ? "bg-orange-500/15 text-orange-400"
                          : t.severity === "medium"
                            ? "bg-yellow-500/15 text-yellow-400"
                            : "bg-green-500/15 text-green-400";
                    const statusColor =
                      t.status === "escalated"
                        ? "text-red-400"
                        : t.status === "in_progress"
                          ? "text-blue-400"
                          : "text-zinc-400";
                    return (
                      <tr key={t.id} className="border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20">
                        <td className="px-4 py-3 font-mono text-xs text-zinc-500">{t.id}</td>
                        <td className="px-4 py-3 text-zinc-300">{t.product}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${sevColor}`}>{{ critical: "crítico", high: "alto", medium: "medio", low: "bajo" }[t.severity] || t.severity}</span>
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 text-zinc-400 max-sm:hidden">{t.message}</td>
                        <td className={`px-4 py-3 text-xs font-medium ${statusColor}`}>
                          {{ escalated: "escalado", in_progress: "en progreso", open: "abierto", resolved: "resuelto" }[t.status] || t.status}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
