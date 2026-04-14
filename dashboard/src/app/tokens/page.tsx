import { tokenUsage, tokenSummary } from "@/lib/mock-data";
import { InfoTip } from "@/components/Tooltip";

export const dynamic = 'force-dynamic';

function CostBar({ agent, cost, maxCost, model }: { agent: string; cost: number; maxCost: number; model: string }) {
  const pct = (cost / maxCost) * 100;
  const modelColor =
    model === "opus" ? "#a855f7" : model === "sonnet" ? "#3b82f6" : "#14b8a6";
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 flex-shrink-0 truncate text-sm text-zinc-300">{agent}</div>
      <div className="flex-1">
        <div className="bar-track" style={{ height: "12px" }}>
          <div
            className="bar-fill"
            style={{ width: `${pct}%`, backgroundColor: modelColor }}
          />
        </div>
      </div>
      <div className="w-16 text-right text-sm font-medium text-zinc-300">${cost.toFixed(2)}</div>
    </div>
  );
}

function DistributionBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-medium" style={{ color }}>${value.toFixed(2)}</span>
      </div>
      <div className="bar-track" style={{ height: "24px", borderRadius: "6px" }}>
        <div
          className="bar-fill flex items-center justify-end pr-2"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: "6px",
            minWidth: "40px",
          }}
        >
          <span className="text-xs font-semibold text-white/90">{pct.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

export default function TokensPage() {
  if (tokenUsage.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Tokens</h1>
          <p className="mt-1 text-sm text-zinc-500">Seguimiento de uso y análisis de costos (ventana de 7 días)</p>
        </div>
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <div className="text-zinc-600 text-sm mb-2">Sin datos de uso de tokens</div>
          <div className="text-zinc-700 text-xs max-w-md">Los datos se generarán conforme uses El Coro.</div>
        </div>
      </div>
    );
  }

  const maxCost = Math.max(...tokenUsage.map((t) => t.cost));
  const totalCost = tokenUsage.reduce((sum, t) => sum + t.cost, 0);
  const totalInput = tokenUsage.reduce((sum, t) => sum + t.inputTokens, 0);
  const totalOutput = tokenUsage.reduce((sum, t) => sum + t.outputTokens, 0);
  const totalSessions = tokenUsage.reduce((sum, t) => sum + t.sessions, 0);

  const opusCost = tokenUsage.filter((t) => t.model === "opus").reduce((s, t) => s + t.cost, 0);
  const sonnetCost = tokenUsage.filter((t) => t.model === "sonnet").reduce((s, t) => s + t.cost, 0);
  const haikuCost = tokenUsage.filter((t) => t.model === "haiku").reduce((s, t) => s + t.cost, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Tokens</h1>
        <p className="mt-1 text-sm text-zinc-500">Seguimiento de uso y análisis de costos (ventana de 7 días)</p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-amber-400">${totalCost.toFixed(2)}</div>
          <div className="mt-1 text-xs text-zinc-500">Costo Total 7 días</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-400">${tokenSummary.codexSavings.toFixed(2)}</div>
          <div className="mt-1 text-xs text-zinc-500">Ahorro Codex<InfoTip text="Dinero que te ahorras porque las tareas simples las hace GPT en vez de Claude." /></div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-400">{totalSessions}</div>
          <div className="mt-1 text-xs text-zinc-500">Sesiones</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-400">{(totalInput / 1_000_000).toFixed(1)}M</div>
          <div className="mt-1 text-xs text-zinc-500">Tokens de Entrada</div>
        </div>
      </div>

      {/* Claude vs Codex Split */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-200">División Claude vs Codex<InfoTip text="Claude (Anthropic) es más inteligente pero más caro. Codex (GPT) hace tareas simples más barato. El Coro decide cuál usar." /></h2>
        <div className="card space-y-4">
          <DistributionBar
            label="Claude (Opus + Sonnet + Haiku)"
            value={tokenSummary.claudeTotal}
            total={tokenSummary.claudeTotal + tokenSummary.codexTotal}
            color="#3b82f6"
          />
          <DistributionBar
            label="Codex (delegación GPT)"
            value={tokenSummary.codexTotal}
            total={tokenSummary.claudeTotal + tokenSummary.codexTotal}
            color="#22c55e"
          />
          <div className="border-t border-zinc-800/40 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Sin delegación a Codex, el costo sería:</span>
              <span className="font-semibold text-zinc-200">
                ${(tokenSummary.claudeTotal + tokenSummary.codexTotal + tokenSummary.codexSavings).toFixed(2)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-green-400">Ahorro efectivo:</span>
              <span className="font-semibold text-green-400">${tokenSummary.codexSavings.toFixed(2)} ({(() => { const t = tokenSummary.claudeTotal + tokenSummary.codexTotal + tokenSummary.codexSavings; return t > 0 ? ((tokenSummary.codexSavings / t) * 100).toFixed(1) : '0'; })()}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost by Model */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-200">Costo por Modelo<InfoTip text="Cuánto gasta cada modelo de IA. Opus es el más caro, Haiku el más barato." /></h2>
        <div className="card space-y-4">
          <DistributionBar label="Opus" value={opusCost} total={totalCost} color="#a855f7" />
          <DistributionBar label="Sonnet" value={sonnetCost} total={totalCost} color="#3b82f6" />
          <DistributionBar label="Haiku" value={haikuCost} total={totalCost} color="#14b8a6" />
        </div>
      </div>

      {/* Cost by Agent */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-200">Costo por Agente</h2>
        <div className="card space-y-3">
          {tokenUsage
            .sort((a, b) => b.cost - a.cost)
            .map((t) => (
              <CostBar key={t.agent} agent={t.agent} cost={t.cost} maxCost={maxCost} model={t.model} />
            ))}
        </div>
      </div>

      {/* Session Detail Table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-zinc-200">Detalle por Agente</h2>
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">Agente</th>
                  <th className="px-4 py-3 font-medium">Modelo</th>
                  <th className="px-4 py-3 font-medium">Entrada</th>
                  <th className="px-4 py-3 font-medium max-sm:hidden">Salida</th>
                  <th className="px-4 py-3 font-medium">Costo</th>
                  <th className="px-4 py-3 font-medium max-sm:hidden">Sesiones</th>
                </tr>
              </thead>
              <tbody>
                {tokenUsage
                  .sort((a, b) => b.cost - a.cost)
                  .map((t) => {
                    const modelColor =
                      t.model === "opus"
                        ? "bg-purple-500/15 text-purple-400 border-purple-500/20"
                        : t.model === "sonnet"
                          ? "bg-blue-500/15 text-blue-400 border-blue-500/20"
                          : "bg-teal-500/15 text-teal-400 border-teal-500/20";
                    return (
                      <tr key={t.agent} className="border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20">
                        <td className="px-4 py-3 font-medium text-zinc-200">{t.agent}</td>
                        <td className="px-4 py-3">
                          <span className={`badge border ${modelColor}`}>{t.model}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">{(t.inputTokens / 1000).toFixed(0)}k</td>
                        <td className="px-4 py-3 text-zinc-400 max-sm:hidden">{(t.outputTokens / 1000).toFixed(0)}k</td>
                        <td className="px-4 py-3 font-medium text-zinc-200">${t.cost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-zinc-400 max-sm:hidden">{t.sessions}</td>
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
