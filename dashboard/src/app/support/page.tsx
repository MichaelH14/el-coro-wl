import { getSupportData } from "@/lib/real-data";
import { InfoTip } from "@/components/Tooltip";

export const dynamic = 'force-dynamic';

function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "var(--severity-critical)",
    high: "var(--severity-high)",
    medium: "var(--severity-medium)",
    low: "var(--severity-low)",
  };
  const bg = colors[severity] || colors.low;
  return (
    <span
      className="status-dot"
      style={{ backgroundColor: bg, boxShadow: `0 0 6px ${bg}` }}
    />
  );
}

function deriveStatus(t: { escalated: boolean; resolved: boolean }): string {
  if (t.resolved) return 'resolved';
  if (t.escalated) return 'escalated';
  return 'open';
}

const statusLabels: Record<string, string> = {
  escalated: "escalado",
  open: "abierto",
  resolved: "resuelto",
};

const sevLabels: Record<string, string> = {
  critical: "critico",
  high: "alto",
  medium: "medio",
  low: "bajo",
};

export default function SupportPage() {
  const { tickets } = getSupportData();
  const open = tickets.filter((t) => !t.resolved);
  const critical = open.filter((t) => t.severity === "critical");
  const escalated = open.filter((t) => t.escalated);

  if (tickets.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Soporte</h1>
          <p className="mt-1 text-sm text-zinc-500">Monitoreo de tickets y seguimiento de escalaciones</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="card text-center">
            <div className="text-3xl font-bold text-zinc-600">0</div>
            <div className="mt-1 text-xs text-zinc-500">Tickets Abiertos</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-zinc-600">0</div>
            <div className="mt-1 text-xs text-zinc-500">Criticos</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-zinc-600">0</div>
            <div className="mt-1 text-xs text-zinc-500">Escalados</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-zinc-600">--</div>
            <div className="mt-1 text-xs text-zinc-500">Respuesta Prom.</div>
          </div>
        </div>

        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <div className="text-zinc-600 text-sm mb-2">Sin tickets de soporte</div>
          <div className="text-zinc-700 text-xs max-w-md">Cuando tus usuarios reporten problemas por WhatsApp (Tae), apareceran aqui.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Soporte</h1>
        <p className="mt-1 text-sm text-zinc-500">Monitoreo de tickets y seguimiento de escalaciones</p>
      </div>

      {/* Summary Row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-400">{open.length}</div>
          <div className="mt-1 text-xs text-zinc-500">Tickets Abiertos<InfoTip text="Problemas reportados por usuarios que aun no se resuelven." /></div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-orange-400">{critical.length}</div>
          <div className="mt-1 text-xs text-zinc-500">Criticos<InfoTip text="Problemas graves — el servicio esta caido o el usuario no puede usar el producto." /></div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-400">{escalated.length}</div>
          <div className="mt-1 text-xs text-zinc-500">Escalados<InfoTip text="Problemas que el sistema no pudo resolver solo y necesitan tu atencion directa." /></div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-400">--</div>
          <div className="mt-1 text-xs text-zinc-500">Respuesta Prom.<InfoTip text="Tiempo promedio que tarda en responderse un ticket. Menos = mejor." /></div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-200">Desglose por Severidad</h2>
        <div className="card">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(["critical", "high", "medium", "low"] as const).map((sev) => {
              const count = open.filter((t) => t.severity === sev).length;
              const colors = {
                critical: { bar: "#ef4444", text: "text-red-400", label: "Critico" },
                high: { bar: "#f97316", text: "text-orange-400", label: "Alto" },
                medium: { bar: "#eab308", text: "text-yellow-400", label: "Medio" },
                low: { bar: "#22c55e", text: "text-green-400", label: "Bajo" },
              };
              const c = colors[sev];
              return (
                <div key={sev}>
                  <div className="mb-1 flex items-center gap-2">
                    <SeverityDot severity={sev} />
                    <span className="text-xs text-zinc-400">{c.label}</span>
                    <span className={`ml-auto text-lg font-bold ${c.text}`}>{count}</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${open.length > 0 ? (count / open.length) * 100 : 0}%`,
                        backgroundColor: c.bar,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-zinc-200">Todos los Tickets</h2>
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Sev</th>
                  <th className="px-4 py-3 font-medium max-md:hidden">Mensaje</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => {
                  const status = deriveStatus(t);
                  const sevColor =
                    t.severity === "critical" ? "bg-red-500/15 text-red-400"
                      : t.severity === "high" ? "bg-orange-500/15 text-orange-400"
                        : t.severity === "medium" ? "bg-yellow-500/15 text-yellow-400"
                          : "bg-green-500/15 text-green-400";
                  const statusStyle =
                    status === "escalated" ? "text-red-400 font-semibold"
                      : status === "resolved" ? "text-zinc-600"
                        : "text-zinc-400";
                  const rowBg =
                    status === "escalated" ? "bg-red-500/[0.03]"
                      : status === "resolved" ? "opacity-60" : "";
                  return (
                    <tr key={t.id} className={`border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20 ${rowBg}`}>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">{t.id}</td>
                      <td className="px-4 py-3 text-zinc-300">{t.product}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${sevColor}`}>{sevLabels[t.severity] || t.severity}</span>
                      </td>
                      <td className="max-w-sm truncate px-4 py-3 text-zinc-400 max-md:hidden">{t.message}</td>
                      <td className={`px-4 py-3 text-xs ${statusStyle}`}>
                        {status === "escalated" && (
                          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        )}
                        {statusLabels[status] || status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
