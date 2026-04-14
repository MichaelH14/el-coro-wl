import { getSombraProfile } from "@/lib/real-data";
import { InfoTip } from "@/components/Tooltip";

export const dynamic = 'force-dynamic';

function ConfidenceBar({ domain, confidence }: { domain: string; confidence: number }) {
  const color =
    confidence >= 90 ? "#22c55e"
      : confidence >= 70 ? "#3b82f6"
        : confidence >= 40 ? "#eab308"
          : "#ef4444";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium text-zinc-200">{domain}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {confidence}%
        </span>
      </div>
      <div className="bar-track" style={{ height: "10px" }}>
        <div
          className="bar-fill"
          style={{
            width: `${confidence}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

export default function SombraPage() {
  const profile = getSombraProfile();
  const hasDomains = profile.domains.length > 0;
  const hasTraits = profile.traits.length > 0;
  const isEmpty = !hasDomains && !hasTraits && !profile.lastUpdated;

  const avgConfidence = hasDomains
    ? Math.round(profile.domains.reduce((s, d) => s + d.confidence, 0) / profile.domains.length)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Sombra</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Perfilado de comportamiento y modelado predictivo
          {profile.lastUpdated && (
            <span className="ml-2 text-zinc-600">
              — Actualizado: {new Date(profile.lastUpdated).toLocaleString('es-DO')}
            </span>
          )}
        </p>
      </div>

      {/* Top Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card text-center">
          <div className={`text-3xl font-bold ${hasDomains ? 'text-purple-400' : 'text-zinc-600'}`}>
            {profile.domains.length}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Dominios Activos</div>
        </div>
        <div className="card text-center">
          <div className={`text-3xl font-bold ${hasDomains ? 'text-emerald-400' : 'text-zinc-600'}`}>
            {avgConfidence}%
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Confianza Prom.<InfoTip text="Promedio de que tan seguro esta Sombra de entender cada aspecto tuyo." />
          </div>
        </div>
        <div className="card text-center">
          <div className={`text-3xl font-bold ${profile.language ? 'text-blue-400' : 'text-zinc-600'}`}>
            {profile.language || '--'}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Idioma Detectado</div>
        </div>
      </div>

      {/* Domain Confidence */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
          Confianza por Dominio
          <InfoTip text="Que tan seguro esta Sombra de entender cada aspecto tuyo. 100% = te conoce perfectamente en esa area." />
        </h2>
        {hasDomains ? (
          <div className="card space-y-4">
            {profile.domains.map((d) => (
              <ConfidenceBar key={d.domain} domain={d.domain} confidence={d.confidence} />
            ))}
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <div className="text-zinc-600 text-sm mb-2">Sin dominios aun</div>
            <div className="text-zinc-700 text-xs max-w-md">
              Los dominios de confianza apareceran conforme Sombra te observe.
            </div>
          </div>
        )}
      </div>

      {/* Personality Traits */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
          Rasgos de Personalidad
          <InfoTip text="Caracteristicas que Sombra ha observado sobre como trabajas y te comunicas." />
        </h2>
        {hasTraits ? (
          <div className="card">
            <div className="flex flex-wrap gap-2">
              {profile.traits.map((trait) => (
                <span key={trait} className="badge bg-purple-500/15 text-purple-400 border border-purple-500/20">
                  {trait}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <div className="text-zinc-600 text-sm mb-2">Sin rasgos detectados aun</div>
            <div className="text-zinc-700 text-xs max-w-md">
              Sombra necesita mas sesiones para identificar patrones de personalidad.
            </div>
          </div>
        )}
      </div>

      {/* Work Priorities */}
      {profile.priorities.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-200">Prioridades de Trabajo</h2>
          <div className="card">
            <div className="space-y-2">
              {profile.priorities.map((p, i) => (
                <div key={p} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-400">
                    {i + 1}
                  </span>
                  <span className="text-sm text-zinc-300">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isEmpty && (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <div className="text-zinc-600 text-sm mb-2">Sombra esta observando</div>
          <div className="text-zinc-700 text-xs max-w-md">
            Con cada sesion aprende mas sobre como trabajas. Los datos apareceran gradualmente.
          </div>
        </div>
      )}
    </div>
  );
}
