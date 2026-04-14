import { campaigns, abTests, seoScores } from "@/lib/mock-data";
import { getGrowthData } from "@/lib/real-data";
import { InfoTip } from "@/components/Tooltip";

export const dynamic = 'force-dynamic';

function MetricBar({ label, value, max, color }: { label: React.ReactNode; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className="text-sm font-semibold text-zinc-200">{value.toLocaleString()}</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function NoDataYet({ label }: { label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-zinc-600">--</div>
      <div className="mt-0.5 text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-[10px] text-zinc-600">Sin datos aún</div>
    </div>
  );
}

export default function GrowthPage() {
  const growthData = getGrowthData();
  const latestDaily = growthData.daily.length > 0 ? growthData.daily[growthData.daily.length - 1] : null;
  const serviceNames = latestDaily ? Object.keys(latestDaily.services) : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Crecimiento</h1>
        <p className="mt-1 text-sm text-zinc-500">Disponibilidad de servicios y seguimiento de experimentos</p>
      </div>

      {/* Service Availability from Real Data */}
      {latestDaily ? (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-zinc-200">Disponibilidad de Servicios</h2>
            <span className="text-xs text-zinc-500">Último reporte: {latestDaily.date}</span>
          </div>

          {serviceNames.map((name) => {
            const svc = latestDaily.services[name];
            return (
              <div key={name} className="mb-4">
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-zinc-200">{name}</h3>
                    <span className={`badge ${svc.available ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                      {svc.available ? "Disponible" : "No disponible"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                    {svc.users !== null ? (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{svc.users}</div>
                        <div className="mt-0.5 text-xs text-zinc-500">Usuarios</div>
                      </div>
                    ) : (
                      <NoDataYet label="Usuarios/dia" />
                    )}
                    {svc.requests !== null ? (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{svc.requests.toLocaleString()}</div>
                        <div className="mt-0.5 text-xs text-zinc-500">Peticiones</div>
                      </div>
                    ) : (
                      <NoDataYet label="Peticiones" />
                    )}
                    {svc.errors !== null ? (
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${svc.errors > 0 ? "text-red-400" : "text-green-400"}`}>{svc.errors}</div>
                        <div className="mt-0.5 text-xs text-zinc-500">Errores</div>
                      </div>
                    ) : (
                      <NoDataYet label="Errores" />
                    )}
                    <NoDataYet label="Usuarios que vuelven" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mb-6">
          <div className="card">
            <div className="text-center py-8">
              <div className="text-lg font-semibold text-zinc-400">Sin datos de crecimiento</div>
              <p className="mt-2 text-sm text-zinc-600">
                Conecta growth-metrics.json en el VPS para ver datos reales de usuarios, peticiones y errores por servicio.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics not yet available */}
      <div className="mb-6">
        <div className="card border border-zinc-800/60">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Métricas pendientes de conectar</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <NoDataYet label="Usuarios/mes por producto" />
            <NoDataYet label="Usuarios/dia por producto" />
            <NoDataYet label="Usuarios que vuelven (%)" />
            <NoDataYet label="Usuarios perdidos (%)" />
          </div>
          <p className="mt-3 text-xs text-zinc-600">Estas métricas se activarán cuando los workers del VPS reporten datos de usuarios reales.</p>
        </div>
      </div>

      {/* Campaigns */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-200">Campañas<InfoTip text="Emails o acciones de marketing activas para atraer o retener usuarios." /></h2>
        {campaigns.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <div className="text-zinc-600 text-sm mb-2">Sin campañas activas</div>
            <div className="text-zinc-700 text-xs max-w-md">Las campañas aparecerán cuando growth-engine las cree.</div>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">Campaña</th>
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Conversión</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const statusColor =
                    c.status === "active"
                      ? "bg-green-500/15 text-green-400"
                      : c.status === "completed"
                        ? "bg-zinc-700/50 text-zinc-400"
                        : "bg-blue-500/15 text-blue-400";
                  return (
                    <tr key={c.name} className="border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20">
                      <td className="px-4 py-3 font-medium text-zinc-200">{c.name}</td>
                      <td className="px-4 py-3 text-zinc-400">{c.product}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${statusColor}`}>{{ active: "activa", completed: "completada", scheduled: "programada" }[c.status] || c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {c.conversion > 0 ? `${c.conversion}%` : "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* A/B Tests & SEO */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* A/B Tests */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-200">Pruebas A/B<InfoTip text="Experimentos donde probamos dos versiones de algo para ver cuál funciona mejor." /></h2>
          {abTests.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-12 text-center">
              <div className="text-zinc-600 text-sm mb-2">Sin pruebas activas</div>
              <div className="text-zinc-700 text-xs max-w-md">Las pruebas A/B aparecerán cuando configures experimentos.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {abTests.map((test) => (
                <div key={test.name} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-zinc-200">{test.name}</div>
                      <div className="mt-0.5 text-xs text-zinc-500">{test.product}</div>
                    </div>
                    <span
                      className={`badge ${
                        test.status === "running" ? "bg-blue-500/15 text-blue-400" : "bg-zinc-700/50 text-zinc-400"
                      }`}
                    >
                      {test.status === "running" ? "en curso" : "finalizada"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="text-zinc-500">
                      Ganador: <span className="font-medium text-zinc-300">Variante {test.variant}</span>
                    </span>
                    <span className="text-zinc-500">
                      Mejora: <span className="font-medium text-emerald-400">{test.lift}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO Scores */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-200">Salud SEO<InfoTip text="Qué tan bien aparecen tus productos en Google. Más alto = más personas te encuentran." /></h2>
          {Object.keys(seoScores).length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-12 text-center">
              <div className="text-zinc-600 text-sm mb-2">Sin datos de SEO</div>
              <div className="text-zinc-700 text-xs max-w-md">Los scores SEO aparecerán cuando se configuren auditorías Lighthouse.</div>
            </div>
          ) : (
            <div className="card">
              <div className="space-y-4">
                {Object.entries(seoScores).map(([product, score]) => {
                  const color = score >= 70 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
                  return (
                    <div key={product}>
                      <div className="mb-1.5 flex items-baseline justify-between">
                        <span className="text-sm text-zinc-300">{product}</span>
                        <span className="text-sm font-semibold" style={{ color }}>
                          {score}/100
                        </span>
                      </div>
                      <div className="bar-track" style={{ height: "10px" }}>
                        <div
                          className="bar-fill"
                          style={{ width: `${score}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 border-t border-zinc-800/60 pt-3 text-xs text-zinc-500">
                Puntuaciones basadas en rendimiento, accesibilidad y experiencia de usuario (Lighthouse + Core Web Vitals)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
