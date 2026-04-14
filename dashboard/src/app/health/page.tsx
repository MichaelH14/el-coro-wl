import { alertHistory } from "@/lib/mock-data";
import { getLatestHealthCheck, getLastCheckTimestamp, getMonitorData } from "@/lib/real-data";
import { InfoTip } from "@/components/Tooltip";

export const dynamic = 'force-dynamic';

function ResponseTimeIndicator({ ms }: { ms: number }) {
  const color = ms < 200 ? "text-green-400" : ms < 500 ? "text-yellow-400" : "text-red-400";
  const label = ms < 200 ? "Rápido" : ms < 500 ? "Normal" : "Lento";
  return (
    <div className="flex items-baseline gap-2">
      <span className={`text-xl font-bold ${color}`}>{ms}</span>
      <span className="text-xs text-zinc-500">ms<InfoTip text="Cuánto tarda el servidor en responder. Menos de 200ms es rápido." /></span>
      <span className={`badge ml-auto ${
        ms < 200 ? "bg-green-500/15 text-green-400" : ms < 500 ? "bg-yellow-500/15 text-yellow-400" : "bg-red-500/15 text-red-400"
      }`}>
        {label}
      </span>
    </div>
  );
}

export default function HealthPage() {
  const realHealth = getLatestHealthCheck();
  const lastCheckTs = getLastCheckTimestamp();
  const monitorData = getMonitorData();
  const realAlerts = monitorData.alerts || [];

  const allUp = realHealth.length > 0 && realHealth.every((s) => s.status === "up");
  const downCount = realHealth.filter((s) => s.status === "down").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Salud</h1>
        <p className="mt-1 text-sm text-zinc-500">Monitoreo de servicios VPS y alertas</p>
      </div>

      {/* Global Status */}
      <div className="mb-6 card">
        <div className="flex items-center gap-3">
          <span
            className="status-dot"
            style={{
              width: 12,
              height: 12,
              backgroundColor: realHealth.length === 0 ? "var(--warning)" : allUp ? "var(--success)" : downCount > 0 ? "var(--danger)" : "var(--warning)",
              boxShadow: `0 0 10px ${realHealth.length === 0 ? "var(--warning)" : allUp ? "var(--success)" : downCount > 0 ? "var(--danger)" : "var(--warning)"}`,
            }}
          />
          <span className="text-lg font-semibold text-zinc-100">
            {realHealth.length === 0
              ? "Sin datos de health check"
              : allUp
                ? "Todos los Sistemas Funcionando"
                : downCount > 0
                  ? `${downCount} Servicio${downCount > 1 ? "s" : ""} Caído${downCount > 1 ? "s" : ""}`
                  : "Algunos servicios degradados"}
          </span>
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          {realHealth.length > 0
            ? `Monitoreando ${realHealth.length} servicios | Última revisión: ${lastCheckTs || "Verificando..."}`
            : "Esperando primer health check del VPS..."}
        </div>
      </div>

      {/* Real VPS Health Data */}
      {realHealth.length > 0 ? (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-zinc-200">Estado del VPS</h2>
          <div className="card">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {realHealth.map((svc) => (
                <div key={svc.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="status-dot"
                    style={{
                      backgroundColor: svc.status === "up" ? "var(--success)" : "var(--danger)",
                      boxShadow: `0 0 6px ${svc.status === "up" ? "var(--success)" : "var(--danger)"}`,
                    }}
                  />
                  <span className="text-zinc-300">{svc.name}</span>
                  <span className={`ml-auto text-xs font-medium ${svc.status === "up" ? "text-green-400" : "text-red-400"}`}>
                    {svc.status === "up" ? "Activo" : "Caído"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-zinc-800/40 pt-2 text-xs text-zinc-500">
              Datos en tiempo real del VPS | Última revisión: {lastCheckTs || "Verificando..."}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <div className="text-zinc-600 text-sm mb-2">Sin datos de servicios</div>
            <div className="text-zinc-700 text-xs max-w-md">Los datos aparecerán cuando el monitor del VPS ejecute su primer health check.</div>
          </div>
        </div>
      )}

      {/* Alert History — real alerts from monitor, fallback to mock (which is now empty) */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-zinc-200">Historial de Alertas<InfoTip text="Registro de cuándo algo se cayó o tuvo problemas." /></h2>
        {realAlerts.length === 0 && alertHistory.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <div className="text-zinc-600 text-sm mb-2">Sin alertas recientes</div>
            <div className="text-zinc-700 text-xs max-w-md">Todo ha estado funcionando. Las alertas aparecerán si algún servicio se cae o degrada.</div>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">Hora</th>
                  <th className="px-4 py-3 font-medium">Servicio</th>
                  <th className="px-4 py-3 font-medium max-sm:hidden">Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {realAlerts.map((alert, i) => (
                  <tr key={i} className="border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">{alert.timestamp}</td>
                    <td className="px-4 py-3 text-zinc-300">{alert.service}</td>
                    <td className="max-w-sm truncate px-4 py-3 text-zinc-400 max-sm:hidden">{alert.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
