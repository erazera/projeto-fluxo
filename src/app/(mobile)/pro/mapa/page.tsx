// WCAG 2.2 — Tela Mapa de Demanda (Modo Pro)
// Critérios cobertos:
//   1.1.1 Non-text Content   — ícones decorativos com aria-hidden
//   1.3.1 Info and Relationships — <section>, <article>, <dialog> semânticos
//   1.4.4 Resize Text        — tipografia em rem
//   2.1.2 No Keyboard Trap   — Modal com foco preso (inert) e fechamento por ESC
//   2.4.3 Focus Order        — Foco vai ao primeiro elemento do modal ao abrir
//   2.4.6 Headings and Labels — <h1> único; <label> associado ao <input>
//   4.1.2 Name, Role, Value  — <button> para cards (não <div> com onClick)
//   4.1.3 Status Messages    — aria-live="polite" + role="status" na confirmação
"use client";
import { ProBottomNav } from "@/components/ProBottomNav";

import { useState, useEffect, useRef, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Home,
  MapPin,
  List,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type DemandLevel = "high" | "medium" | "low";
type TrendDir = "up" | "down" | "flat";

interface Zone {
  id: string;
  name: string;
  type: string;
  price: number;
  demand: DemandLevel;
  trend: TrendDir;
  trendPct: number;
  trendWindow: string;
  consumers: number;
}

// ── Dados Mockados ─────────────────────────────────────────────────────────────
const CITY_AVG = 0.55;

const ZONES: Zone[] = [
  {
    id: "zone-centro",
    name: "Centro Industrial",
    type: "Industrial",
    price: 0.78,
    demand: "high",
    trend: "up",
    trendPct: 8,
    trendWindow: "2h",
    consumers: 1420,
  },
  {
    id: "zone-polo",
    name: "Polo Tecnológico",
    type: "Comercial",
    price: 0.74,
    demand: "high",
    trend: "up",
    trendPct: 5,
    trendWindow: "2h",
    consumers: 892,
  },
  {
    id: "zone-norte",
    name: "Zona Norte",
    type: "Residencial",
    price: 0.61,
    demand: "medium",
    trend: "up",
    trendPct: 2,
    trendWindow: "1h",
    consumers: 3250,
  },
  {
    id: "zone-comercial",
    name: "Corredor Comercial",
    type: "Comercial",
    price: 0.59,
    demand: "medium",
    trend: "flat",
    trendPct: 0,
    trendWindow: "3h",
    consumers: 540,
  },
  {
    id: "zone-sul",
    name: "Zona Sul Residencial",
    type: "Residencial",
    price: 0.46,
    demand: "low",
    trend: "down",
    trendPct: 3,
    trendWindow: "1h",
    consumers: 4800,
  },
  {
    id: "zone-rural",
    name: "Cinturão Rural",
    type: "Rural",
    price: 0.42,
    demand: "low",
    trend: "flat",
    trendPct: 0,
    trendWindow: "6h",
    consumers: 610,
  },
];

// ── Paleta de Calor ───────────────────────────────────────────────────────────
const DEMAND_STYLE: Record<DemandLevel, { bg: string; border: string; badge: string; label: string }> = {
  high: {
    bg: "bg-red-950",
    border: "border-red-500",
    badge: "bg-red-500/20 text-red-300",
    label: "Alta Demanda",
  },
  medium: {
    bg: "bg-orange-950",
    border: "border-orange-500",
    badge: "bg-orange-500/20 text-orange-300",
    label: "Média Demanda",
  },
  low: {
    bg: "bg-green-950",
    border: "border-green-500",
    badge: "bg-green-500/20 text-green-300",
    label: "Normal",
  },
};

const TREND_STYLE: Record<TrendDir, { icon: any; color: string }> = {
  up:   { icon: TrendingUp,   color: "text-red-400" },
  down: { icon: TrendingDown, color: "text-green-400" },
  flat: { icon: Minus,        color: "text-gray-400" },
};

// ── Bottom Nav ────────────────────────────────────────────────────────────────
const navItems = [
  { id: "home",    label: "Home",              icon: Home    },
  { id: "mapa",    label: "Mapa de Demanda",   icon: MapPin  },
  { id: "extrato", label: "Extrato Detalhado", icon: List    },
  { id: "config",  label: "Configurações",     icon: Settings },
];

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(v);
}

// ── Componente Principal ───────────────────────────────────────────────────────
export default function MapaDemanda() {
  const router = useRouter();
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [volume, setVolume] = useState("50");
  const [confirmMsg, setConfirmMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState("mapa");

  // Refs para foco no modal
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // IDs acessíveis
  const modalTitleId = useId();
  const volumeInputId = useId();
  const confirmRegionId = useId();

  // ── Efeito: Focus trap via atributo `inert` + fechar com ESC ─────────────
  useEffect(() => {
    if (!selectedZone) return;

    // Prende o foco no modal ao abrir (WCAG 2.4.3)
    firstFocusableRef.current?.focus();

    // `inert` no conteúdo de fundo (WCAG 2.1.2) — nativo em todos browsers modernos
    if (bodyRef.current) bodyRef.current.inert = true;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (bodyRef.current) bodyRef.current.inert = false;
    };
  }, [selectedZone]);

  function openModal(zone: Zone) {
    setSelectedZone(zone);
    setVolume("50");
    setConfirmMsg("");
  }

  function closeModal() {
    setSelectedZone(null);
    setConfirmMsg("");
    setIsSubmitting(false);
  }

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedZone || !volume || parseFloat(volume) <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setConfirmMsg(
        `Venda de ${volume} kWh para "${selectedZone.name}" confirmada por ${formatBRL(parseFloat(volume) * selectedZone.price)}!`
      );
      setIsSubmitting(false);
      setTimeout(closeModal, 2500);
    }, 1200);
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-white relative">

      {/* ── Conteúdo principal (sofre inert quando modal está aberto) ───────── */}
      <div ref={bodyRef} className="flex flex-col h-full">

        {/* ── Status Bar ──────────────────────────────────────────────────── */}
        <div className="px-5 pt-3 shrink-0" aria-hidden="true">
          <div className="flex justify-between items-center text-white text-xs font-semibold">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <svg width="15" height="11" viewBox="0 0 15 11" fill="white">
                <rect x="0" y="7" width="3" height="4" rx="0.5" />
                <rect x="4" y="4.5" width="3" height="6.5" rx="0.5" />
                <rect x="8" y="2" width="3" height="9" rx="0.5" />
                <rect x="12" y="0" width="3" height="11" rx="0.5" />
              </svg>
              <svg width="15" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <circle cx="12" cy="20" r="1" fill="white" />
              </svg>
              <svg width="22" height="12" viewBox="0 0 22 12" fill="white">
                <rect x="0" y="1" width="18" height="10" rx="2" fill="white" />
                <rect x="1" y="2" width="16" height="8" rx="1.5" fill="#0d1117" />
                <rect x="1" y="2" width="14" height="8" rx="1.5" fill="white" />
                <rect x="18.5" y="4" width="2" height="4" rx="1" fill="white" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="flex items-center gap-3 px-4 pt-3 pb-3 shrink-0">
          <button
            aria-label="Voltar"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-lg p-1 shrink-0"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-[1rem] font-bold leading-tight truncate">
              Mapa de Demanda
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" aria-hidden="true" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" aria-hidden="true" />
              </span>
              <p className="text-gray-400 text-[0.6875rem]">Tempo Real</p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-center shrink-0" aria-hidden="true">
            <Activity size={16} className="text-green-400" />
          </div>
        </header>

        {/* ── Banner de Média da Cidade ────────────────────────────────────── */}
        <div className="mx-4 mb-4 px-4 py-2.5 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-yellow-400 shrink-0" aria-hidden="true" />
            <span className="text-gray-400 text-[0.75rem] font-semibold">Média da Cidade</span>
          </div>
          <span className="text-white text-[0.875rem] font-extrabold tabular-nums">
            R$ {CITY_AVG.toFixed(2).replace(".", ",")} / kWh
          </span>
        </div>

        {/* ── Legenda de Calor ─────────────────────────────────────────────── */}
        <div className="mx-4 mb-4 flex items-center gap-3 shrink-0" aria-hidden="true">
          <span className="text-gray-600 text-[0.625rem] font-bold uppercase tracking-wider">Calor:</span>
          {[
            { bg: "bg-green-500", label: "Normal" },
            { bg: "bg-orange-500", label: "Médio" },
            { bg: "bg-red-500", label: "Alto" },
          ].map(({ bg, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-sm ${bg}`} />
              <span className="text-gray-500 text-[0.625rem]">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Grade do Mapa ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 pb-28">
          <section aria-label="Zonas de demanda energética da cidade">
            <div className="grid grid-cols-2 gap-3">
              {ZONES.map((zone) => {
                const style = DEMAND_STYLE[zone.demand];
                const trend = TREND_STYLE[zone.trend];
                const TrendIcon = trend.icon;
                const diffFromAvg = ((zone.price - CITY_AVG) / CITY_AVG * 100).toFixed(0);
                const aboveAvg = zone.price >= CITY_AVG;

                return (
                  // WCAG 4.1.2 — <button> para elemento interativo (nunca <div> com onClick)
                  <button
                    key={zone.id}
                    id={zone.id}
                    onClick={() => openModal(zone)}
                    aria-label={`${zone.name}: ${formatBRL(zone.price)} por kWh. ${style.label}. Toque para ofertar energia.`}
                    className={`
                      ${style.bg} border-2 ${style.border}
                      rounded-2xl p-3.5 text-left flex flex-col gap-2
                      transition-all active:scale-[0.97]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]
                    `}
                  >
                    {/* Badge de demanda */}
                    <span className={`self-start text-[0.5625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}>
                      {style.label}
                    </span>

                    {/* Nome da zona */}
                    <div>
                      <p className="text-white text-[0.8125rem] font-bold leading-snug">{zone.name}</p>
                      <p className="text-gray-400 text-[0.625rem] mt-0.5">{zone.type} · {zone.consumers.toLocaleString("pt-BR")} consumidores</p>
                    </div>

                    {/* Preço em destaque */}
                    <p className="text-white text-[1.25rem] font-extrabold leading-none tabular-nums">
                      R$ {zone.price.toFixed(2).replace(".", ",")}
                      <span className="text-gray-400 text-[0.625rem] font-normal ml-1">/kWh</span>
                    </p>

                    {/* Tendência e comparativo */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
                      <div className={`flex items-center gap-1 ${trend.color}`}>
                        <TrendIcon size={12} aria-hidden="true" />
                        <span className="text-[0.625rem] font-bold">
                          {zone.trend === "flat" ? "Estável" : `${zone.trend === "up" ? "+" : "-"}${zone.trendPct}%`}
                          {zone.trend !== "flat" && ` (${zone.trendWindow})`}
                        </span>
                      </div>
                      <span className={`text-[0.5625rem] font-bold px-1.5 py-0.5 rounded-md ${aboveAvg ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
                        {aboveAvg ? "+" : ""}{diffFromAvg}% média
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── Bottom Navigation ────────────────────────────────────────────── */}
      <ProBottomNav />
      </div>

      {/* ================================================================== */}
      {/* MODAL DE OFERTA DIRETA                                              */}
      {/* WCAG 2.1.2 — foco preso; background com `inert`                   */}
      {/* WCAG 2.4.3 — foco vai ao botão de fechar ao abrir                 */}
      {/* WCAG 1.3.1 — <dialog> semântico (role="dialog" + aria-modal)      */}
      {/* ================================================================== */}
      {selectedZone && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          aria-hidden="false"
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-t-3xl px-5 pt-5 pb-10 flex flex-col gap-5 animate-in slide-in-from-bottom duration-300"
          >
            {/* Cabeçalho do Modal */}
            <div className="flex items-start justify-between">
              <div>
                <h2 id={modalTitleId} className="text-white text-[1rem] font-bold leading-snug">
                  Ofertar para
                </h2>
                <p className="text-green-400 text-[1rem] font-extrabold">{selectedZone.name}</p>
              </div>
              <button
                ref={firstFocusableRef}
                onClick={closeModal}
                aria-label="Fechar modal de oferta"
                className="text-gray-400 hover:text-white p-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors -mt-1 -mr-1"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            {/* Info de Preço no Modal */}
            <div className={`flex items-center justify-between p-3 rounded-xl border ${DEMAND_STYLE[selectedZone.demand].bg} ${DEMAND_STYLE[selectedZone.demand].border}`}>
              <div>
                <p className="text-gray-400 text-[0.6875rem] font-semibold">Preço atual da zona</p>
                <p className="text-white text-[1.25rem] font-extrabold tabular-nums mt-0.5">
                  R$ {selectedZone.price.toFixed(2).replace(".", ",")} <span className="text-gray-400 text-[0.75rem] font-normal">/kWh</span>
                </p>
              </div>
              <span className={`text-[0.6875rem] font-bold px-2 py-1 rounded-full ${DEMAND_STYLE[selectedZone.demand].badge}`}>
                {DEMAND_STYLE[selectedZone.demand].label}
              </span>
            </div>

            {/* Formulário */}
            <form onSubmit={handleConfirm} noValidate className="flex flex-col gap-4">
              <div>
                <label htmlFor={volumeInputId} className="block text-gray-300 text-[0.75rem] font-semibold mb-1.5">
                  Volume a ofertar
                </label>
                <div className="relative">
                  <input
                    id={volumeInputId}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    max="10000"
                    step="1"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white text-[0.9375rem] font-bold pr-14 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    aria-label="Volume em kWh para ofertar"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-[0.75rem] font-semibold" aria-hidden="true">kWh</span>
                </div>

                {/* Receita Estimada em Tempo Real */}
                {parseFloat(volume) > 0 && (
                  <p className="mt-2 text-gray-400 text-[0.75rem]">
                    Receita estimada:{" "}
                    <span className="text-green-400 font-bold tabular-nums">
                      {formatBRL(parseFloat(volume) * selectedZone.price)}
                    </span>
                  </p>
                )}
              </div>

              {/* Botão de Confirmação */}
              <button
                type="submit"
                disabled={isSubmitting || !volume || parseFloat(volume) <= 0}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-[0.9375rem] transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500
                  ${isSubmitting
                    ? "bg-green-900/40 text-green-600 cursor-wait"
                    : "bg-green-600 hover:bg-green-500 active:scale-[0.98] text-white shadow-lg shadow-green-900/40"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Confirmando venda…</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} aria-hidden="true" />
                    <span>Confirmar Venda Direta</span>
                  </>
                )}
              </button>
            </form>

            {/* Feedback de Confirmação — WCAG 4.1.3 */}
            <div id={confirmRegionId} role="status" aria-live="polite" aria-atomic="true">
              {confirmMsg && (
                <div className="flex items-start gap-3 bg-green-950 border border-green-700 rounded-xl px-4 py-3">
                  <CheckCircle2 size={18} className="text-green-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-green-300 text-[0.8125rem] font-semibold leading-snug">{confirmMsg}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
