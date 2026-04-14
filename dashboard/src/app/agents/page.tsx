"use client";

import { useState } from "react";
import { agents, type Agent, type AgentLayer, type AgentModel } from "@/lib/mock-data";
import { InfoTip } from "@/components/Tooltip";

function ModelBadge({ model }: { model: AgentModel }) {
  const styles: Record<AgentModel, string> = {
    opus: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    sonnet: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    haiku: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  };
  return (
    <span className={`badge border ${styles[model]}`}>
      {model}
    </span>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const dotClass =
    status === "active" ? "up" : status === "standby" ? "warning" : "";
  const dotStyle =
    status === "disabled" ? { backgroundColor: "#52525b" } : {};
  const label =
    status === "active" ? "Activo" : status === "standby" ? "En espera" : "Desactivado";
  const textColor =
    status === "active"
      ? "text-green-400"
      : status === "standby"
        ? "text-yellow-400"
        : "text-zinc-600";
  return (
    <div className="flex items-center gap-1.5">
      <span className={`status-dot ${dotClass}`} style={dotStyle} />
      <span className={`text-xs ${textColor}`}>{label}</span>
    </div>
  );
}

function AgentCard({ agent, layer }: { agent: Agent; layer: AgentLayer }) {
  const [expanded, setExpanded] = useState(false);

  const layerColors: Record<AgentLayer, string> = {
    Identity: "border-l-purple-500/50",
    Knowledge: "border-l-blue-500/50",
    Operations: "border-l-emerald-500/50",
    Growth: "border-l-green-500/50",
    Support: "border-l-cyan-500/50",
    Specialists: "border-l-amber-500/50",
  };

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`card border-l-2 ${layerColors[layer]} transition-all hover:translate-x-0.5 cursor-pointer select-none`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-zinc-600">{agent.id}</span>
          <span className="text-sm font-semibold text-zinc-100">{agent.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <ModelBadge model={agent.model} />
          <span className="text-xs text-zinc-600">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-zinc-400">{agent.description}</p>

      {expanded && (
        <div className="mt-3 border-t border-zinc-800/40 pt-3 space-y-3">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-1">Qué hace</div>
            <p className="text-xs leading-relaxed text-zinc-300">{agent.role}</p>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-1">Cuándo se activa</div>
            <p className="text-xs leading-relaxed text-zinc-300">{agent.triggers}</p>
          </div>
        </div>
      )}

      <div className="mt-3 border-t border-zinc-800/40 pt-2 flex items-center justify-between">
        <StatusIndicator status={agent.status} />
        {!expanded && <span className="text-[10px] text-zinc-600">Click para ver detalle</span>}
      </div>
    </div>
  );
}

const layerDescriptions: Record<AgentLayer, string> = {
  Identity: "Personalidad central, memoria y perfilado de comportamiento",
  Knowledge: "Recuperación de información, investigación y gestión de contexto",
  Operations: "Infraestructura, deploy, monitoreo y orquestación",
  Growth: "Marketing, SEO, campañas de email, analíticas",
  Support: "Soporte al cliente, triaje de tickets, auto-respuesta",
  Specialists: "Agentes especializados por producto y función",
};

const layerTooltips: Record<AgentLayer, string> = {
  Identity: "El que te estudia a ti \u2014 aprende cómo trabajas.",
  Knowledge: "La memoria del equipo \u2014 recuerda todo lo aprendido.",
  Operations: "Los que coordinan \u2014 el jefe, el control de calidad, el diseñador.",
  Growth: "El de marketing \u2014 métricas, SEO, emails, publicidad.",
  Support: "El de soporte \u2014 responde a tus clientes automáticamente.",
  Specialists: "Los técnicos \u2014 código, testing, seguridad, deploy, base de datos.",
};

const layerNames: Record<AgentLayer, string> = {
  Identity: "Identidad",
  Knowledge: "Conocimiento",
  Operations: "Operaciones",
  Growth: "Crecimiento",
  Support: "Soporte",
  Specialists: "Especialistas",
};

const layers: AgentLayer[] = ["Identity", "Knowledge", "Operations", "Growth", "Support", "Specialists"];

export default function AgentsPage() {
  const activeCount = agents.filter((a) => a.status === "active").length;
  const standbyCount = agents.filter((a) => a.status === "standby").length;
  const disabledCount = agents.filter((a) => a.status === "disabled").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Agentes</h1>
        <p className="mt-1 text-sm text-zinc-500">{agents.length} agentes en {layers.length} capas — click en cada uno para ver qué hace</p>
      </div>

      {/* Summary */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="card flex items-center gap-3 px-4 py-3">
          <span className="status-dot up" />
          <span className="text-sm text-zinc-300">{activeCount} Activos<InfoTip text="Agentes que están listos para trabajar cuando los necesites." /></span>
        </div>
        <div className="card flex items-center gap-3 px-4 py-3">
          <span className="status-dot warning" />
          <span className="text-sm text-zinc-300">{standbyCount} En espera<InfoTip text="Agentes que existen pero no se están usando ahora." /></span>
        </div>
        <div className="card flex items-center gap-3 px-4 py-3">
          <span className="status-dot" style={{ backgroundColor: "#52525b" }} />
          <span className="text-sm text-zinc-300">{disabledCount} Desactivados<InfoTip text="Agentes apagados temporalmente." /></span>
        </div>
        <div className="card flex items-center gap-3 px-4 py-3">
          <span className="text-xs text-zinc-500">Modelos:<InfoTip text="Opus = más inteligente y caro. Sonnet = equilibrado. Haiku = rápido y barato." /></span>
          <ModelBadge model="opus" />
          <ModelBadge model="sonnet" />
          <ModelBadge model="haiku" />
        </div>
      </div>

      {/* Layers */}
      {layers.map((layer) => {
        const layerAgents = agents.filter((a) => a.layer === layer);
        return (
          <div key={layer} className="mb-8">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-zinc-200">Capa {layerNames[layer]}<InfoTip text={layerTooltips[layer]} /></h2>
              <p className="text-xs text-zinc-500">{layerDescriptions[layer]}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {layerAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} layer={layer} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
