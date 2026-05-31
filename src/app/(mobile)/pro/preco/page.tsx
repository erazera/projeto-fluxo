// WCAG 2.2 — Tela Estratégia de Preço (Modo Pro)
// Critérios cobertos:
//   1.3.1 Info and Relationships — <fieldset>/<legend> para agrupar automações;
//                                  <label> associado ao slider e a cada input
//   1.4.4 Resize Text        — tipografia em rem
//   2.4.6 Headings and Labels — <h1> único; labels descritivos por campo
//   4.1.2 Name, Role, Value  — role="switch" + aria-checked nos toggles;
//                              aria-valuenow, aria-valuemin, aria-valuemax no slider;
//                              aria-disabled quando slider estiver bloqueado
//   4.1.3 Status Messages    — aria-live="polite" + role="status" no toast de sucesso
"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Zap,
  Clock,
  TrendingDown,
  Activity,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import { ProBottomNav } from "@/components/ProBottomNav";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface PricingStrategy {
  basePrice: number;        // R$/kWh × 100 (evitar float no slider)
  peakEnabled: boolean;
  peakPrice: number;
  followDemandEnabled: boolean;
  active: boolean;
}

const DEFAULT_STRATEGY: PricingStrategy = {
  basePrice: 55,            // representa R$ 0,55
  peakEnabled: false,
  peakPrice: 75,            // R$ 0,75 no horário de pico
  followDemandEnabled: false,
  active: false,
};

const CITY_AVG_CENTS = 55; // R$ 0,55 — mock da média da cidade

// ── Classificação de Preço ────────────────────────────────────────────────────
function classify(cents: number): { label: string; color: string; bg: string } {
  if (cents <= 45) return { label: "🔥 Saída Imediata", color: "text-green-400", bg: "bg-green-500/10 border-green-600/40" };
  if (cents <= 55) return { label: "✅ Altamente Competitivo", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-600/40" };
  if (cents <= 65) return { label: "⚡ Competitivo", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-600/40" };
  if (cents <= 75) return { label: "⚠️ Baixa Saída", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-600/40" };
  return { label: "🚫 Sem Saída", color: "text-red-400", bg: "bg-red-500/10 border-red-600/40" };
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function centsToLabel(c: number) {
  return `R$ ${(c / 100).toFixed(2).replace(".", ",")}`;
}

// ── Toggle Acessível ──────────────────────────────────────────────────────────
function Toggle({
  id, checked, onChange, ariaLabel, disabled = false,
}: {
  id: string; checked: boolean; onChange: (v: boolean) => void; ariaLabel: string; disabled?: boolean;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full shrink-0 transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${checked ? "bg-green-600" : "bg-[#30363d]"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-0"}`}
        aria-hidden="true"
      />
    </button>
  );
}

// ── Componente Principal ───────────────────────────────────────────────────────
export default function EstrategiaDePreco() {
  const router = useRouter();
  const toastId = useId();
  const sliderId = useId();
  const peakPriceId = useId();

  const [strategy, setStrategy, isHydrated] = useLocalStorage<PricingStrategy>(
    "fluxo_pricing_strategy",
    DEFAULT_STRATEGY
  );

  // Estado local para edição (só salva ao clicar em "Ativar")
  const [draft, setDraft] = useState<PricingStrategy>(DEFAULT_STRATEGY);

  // Sincroniza rascunho com o localStorage ao hidratar
  const [synced, setSynced] = useState(false);
  if (isHydrated && !synced) {
    setDraft(strategy);
    setSynced(true);
  }

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [toastMsg, setToastMsg] = useState("");

  // Preço "efetivo" exibido (override se followDemand está ligado)
  const effectivePrice = draft.followDemandEnabled
    ? Math.round(CITY_AVG_CENTS * 0.95)
    : draft.basePrice;

  const classification = classify(effectivePrice);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleSlider(v: number) {
    setDraft((d) => ({ ...d, basePrice: v }));
  }

  function handlePeakToggle(v: boolean) {
    setDraft((d) => ({ ...d, peakEnabled: v }));
  }

  function handleFollowDemand(v: boolean) {
    setDraft((d) => ({
      ...d,
      followDemandEnabled: v,
      // Desativa pico quando "Seguir Demanda" liga (conflito)
      peakEnabled: v ? false : d.peakEnabled,
    }));
  }

  function handleActivate() {
    setSaveStatus("saving");
    setTimeout(() => {
      setStrategy({ ...draft, active: true });
      setSaveStatus("saved");
      setToastMsg("Rotina de preços ativada com sucesso!");
      setTimeout(() => {
        setSaveStatus("idle");
        setToastMsg("");
      }, 4000);
    }, 1200);
  }

  // ── Skeleton de hidratação ─────────────────────────────────────────────────
  if (!isHydrated || !synced) {
    return (
      <div className="flex flex-col h-full bg-[#0d1117] items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const sliderPct = ((draft.basePrice - 30) / (100 - 30)) * 100;

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-white">

      {/* ── Status Bar ────────────────────────────────────────────────────── */}
      <div className="px-5 pt-3 shrink-0" aria-hidden="true">
        <div className="flex justify-between items-center text-white text-xs font-semibold">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <svg width="15" height="11" viewBox="0 0 15 11" fill="white"><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4" y="4.5" width="3" height="6.5" rx="0.5" /><rect x="8" y="2" width="3" height="9" rx="0.5" /><rect x="12" y="0" width="3" height="11" rx="0.5" /></svg>
            <svg width="15" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="white" /></svg>
            <svg width="22" height="12" viewBox="0 0 22 12" fill="white"><rect x="0" y="1" width="18" height="10" rx="2" fill="white" /><rect x="1" y="2" width="16" height="8" rx="1.5" fill="#0d1117" /><rect x="1" y="2" width="14" height="8" rx="1.5" fill="white" /><rect x="18.5" y="4" width="2" height="4" rx="1" fill="white" /></svg>
          </div>
        </div>
      </div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 pt-3 pb-4 shrink-0 border-b border-[#21262d]">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-lg p-1 shrink-0"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white text-[1rem] font-bold leading-tight">Estratégia de Preço</h1>
          <p className="text-gray-500 text-[0.6875rem] mt-0.5">Precificação Inteligente · Modo Pro</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-center shrink-0" aria-hidden="true">
          <Activity size={16} className="text-purple-400" />
        </div>
      </header>

      {/* ── Corpo Scrollável ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28 flex flex-col gap-5">

        {/* Toast WCAG 4.1.3 */}
        <div id={toastId} role="status" aria-live="polite" aria-atomic="true">
          {toastMsg && (
            <div className="flex items-center gap-3 bg-green-950 border border-green-700 rounded-xl px-4 py-3">
              <CheckCircle2 size={18} className="text-green-400 shrink-0" aria-hidden="true" />
              <p className="text-green-300 text-[0.8125rem] font-semibold">{toastMsg}</p>
            </div>
          )}
        </div>

        {/* ── Seção: Preço Base ─────────────────────────────────────────── */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Zap size={14} className="text-purple-400 shrink-0" aria-hidden="true" />
            <h2 className="text-gray-300 text-[0.75rem] font-bold uppercase tracking-widest">
              Preço Base
            </h2>
          </div>

          {/* Exibição do Preço Efetivo */}
          <div className="flex flex-col items-center mb-5">
            <p
              className={`text-[2.625rem] font-extrabold leading-none tabular-nums transition-colors ${classification.color}`}
              aria-label={`Preço efetivo atual: ${centsToLabel(effectivePrice)} por kWh`}
            >
              {centsToLabel(effectivePrice)}
            </p>
            <span className="text-gray-500 text-[0.75rem] mt-1">/kWh</span>

            {/* Badge de classificação */}
            <span className={`mt-3 px-3 py-1 rounded-full text-[0.6875rem] font-bold border ${classification.bg} ${classification.color}`}>
              {classification.label}
            </span>

            {/* Aviso quando "Seguir Demanda" sobrescreve o slider */}
            {draft.followDemandEnabled && (
              <div className="flex items-center gap-1.5 mt-3">
                <Info size={12} className="text-blue-400 shrink-0" aria-hidden="true" />
                <p className="text-blue-400 text-[0.6875rem]">
                  Calculado automaticamente: média da cidade − 5%
                </p>
              </div>
            )}
          </div>

          {/* Slider — WCAG 4.1.2: aria-valuenow + aria-valuemin/max + aria-label */}
          <div>
            <label htmlFor={sliderId} className="sr-only">
              Preço base de venda em centavos por kWh. Mínimo 30, máximo 100.
            </label>
            <div className="relative mb-2">
              {/* Track visual customizado */}
              <div className="relative h-2 rounded-full bg-[#30363d] overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-600 to-purple-500 rounded-full transition-all"
                  style={{ width: `${sliderPct}%` }}
                  aria-hidden="true"
                />
              </div>
              <input
                id={sliderId}
                type="range"
                min={30}
                max={100}
                step={1}
                value={draft.basePrice}
                onChange={(e) => handleSlider(Number(e.target.value))}
                disabled={draft.followDemandEnabled}
                aria-valuenow={draft.basePrice}
                aria-valuemin={30}
                aria-valuemax={100}
                aria-valuetext={`${centsToLabel(draft.basePrice)} por kWh`}
                aria-disabled={draft.followDemandEnabled}
                className="absolute inset-0 w-full opacity-0 h-full cursor-pointer disabled:cursor-not-allowed"
              />
              {/* Thumb visual */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 shadow-lg transition-all pointer-events-none
                  ${draft.followDemandEnabled ? "bg-gray-600 border-gray-500" : "bg-white border-purple-500"}`}
                style={{ left: `calc(${sliderPct}% - 10px)` }}
                aria-hidden="true"
              />
            </div>

            {/* Escala de referência */}
            <div className="flex justify-between mt-3" aria-hidden="true">
              {[30, 50, 70, 100].map((v) => (
                <div key={v} className="flex flex-col items-center gap-1">
                  <div className="w-px h-2 bg-[#30363d]" />
                  <span className="text-gray-600 text-[0.5625rem]">R$ {(v / 100).toFixed(2).replace(".", ",")}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Seção: Automações ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-gray-400 text-[0.75rem] font-bold uppercase tracking-widest mb-3 px-1">
            Automações de Venda
          </h2>

          <fieldset className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
            <legend className="sr-only">Regras de automação de preço</legend>

            {/* ── Regra 1: Horário de Pico ────────────────────────────── */}
            <div className="px-4 py-4 border-b border-[#21262d]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                    <Clock size={16} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white text-[0.875rem] font-semibold leading-snug">Horário de Pico</p>
                    <p className="text-gray-500 text-[0.6875rem] mt-0.5">
                      18h – 21h · Preço especial para demanda alta
                    </p>
                  </div>
                </div>
                <Toggle
                  id="toggle-pico"
                  checked={draft.peakEnabled}
                  onChange={handlePeakToggle}
                  disabled={draft.followDemandEnabled}
                  ariaLabel={`Automação de horário de pico: ${draft.peakEnabled ? "ativada" : "desativada"}`}
                />
              </div>

              {/* Expansão inline — preço de pico */}
              <div
                className={`overflow-hidden transition-all duration-300 ${draft.peakEnabled ? "max-h-24 mt-4 opacity-100" : "max-h-0 opacity-0"}`}
                aria-hidden={!draft.peakEnabled}
              >
                <label htmlFor={peakPriceId} className="block text-gray-400 text-[0.6875rem] font-semibold uppercase tracking-wide mb-1.5">
                  Preço no Horário de Pico
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[0.75rem]" aria-hidden="true">R$</span>
                  <input
                    id={peakPriceId}
                    type="number"
                    inputMode="decimal"
                    min="30"
                    max="200"
                    step="1"
                    value={(draft.peakPrice / 100).toFixed(2)}
                    onChange={(e) => {
                      const cents = Math.round(parseFloat(e.target.value) * 100);
                      if (!isNaN(cents)) setDraft((d) => ({ ...d, peakPrice: cents }));
                    }}
                    tabIndex={draft.peakEnabled ? 0 : -1}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-9 pr-14 py-2.5 text-white text-[0.875rem] font-bold
                      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[0.6875rem]" aria-hidden="true">/kWh</span>
                </div>
              </div>
            </div>

            {/* ── Regra 2: Seguir Mapa de Demanda ────────────────────── */}
            <div className="px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                    <TrendingDown size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-[0.875rem] font-semibold leading-snug">Seguir Mapa de Demanda</p>
                    <p className="text-gray-500 text-[0.6875rem] mt-0.5 leading-snug">
                      Vende sempre 5% abaixo da média da cidade para garantir saída rápida
                    </p>
                  </div>
                </div>
                <Toggle
                  id="toggle-demanda"
                  checked={draft.followDemandEnabled}
                  onChange={handleFollowDemand}
                  ariaLabel={`Seguir mapa de demanda: ${draft.followDemandEnabled ? "ativado" : "desativado"}`}
                />
              </div>

              {/* Aviso de conflito com "Horário de Pico" */}
              {draft.followDemandEnabled && (
                <div className="mt-3 flex items-start gap-2 bg-blue-950/50 border border-blue-800/40 rounded-xl px-3 py-2.5">
                  <Info size={14} className="text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-blue-300 text-[0.6875rem] leading-snug">
                    O preço base e o horário de pico estão desativados enquanto esta regra estiver ligada.
                  </p>
                </div>
              )}
            </div>
          </fieldset>
        </section>

        {/* ── Resumo da Estratégia ──────────────────────────────────────── */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4">
          <h2 className="text-gray-400 text-[0.6875rem] font-bold uppercase tracking-widest mb-3">
            Resumo da Estratégia
          </h2>
          <div className="flex flex-col gap-2">
            {[
              { label: "Preço base", value: centsToLabel(draft.basePrice) },
              {
                label: "Pico (18h–21h)",
                value: draft.peakEnabled ? centsToLabel(draft.peakPrice) : "Desativado",
                color: draft.peakEnabled ? "text-orange-400" : "text-gray-600",
              },
              {
                label: "Seguir demanda",
                value: draft.followDemandEnabled ? `−5% (efetivo: ${centsToLabel(effectivePrice)})` : "Desativado",
                color: draft.followDemandEnabled ? "text-blue-400" : "text-gray-600",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-[#21262d] last:border-0">
                <span className="text-gray-400 text-[0.75rem]">{label}</span>
                <span className={`text-[0.75rem] font-bold tabular-nums ${color ?? "text-white"}`}>{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Botão Ativar ──────────────────────────────────────────────── */}
        <button
          onClick={handleActivate}
          disabled={saveStatus === "saving"}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-[0.9375rem] transition-all
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]
            ${saveStatus === "saving"
              ? "bg-purple-900/40 text-purple-400 cursor-wait"
              : saveStatus === "saved"
              ? "bg-green-950 border border-green-600 text-green-400"
              : "bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white shadow-lg shadow-purple-900/40"
            }`}
        >
          {saveStatus === "saving" ? (
            <><Loader2 size={18} className="animate-spin" aria-hidden="true" /><span>Ativando...</span></>
          ) : saveStatus === "saved" ? (
            <><CheckCircle2 size={18} aria-hidden="true" /><span>Estratégia Ativada!</span></>
          ) : (
            <><Activity size={18} aria-hidden="true" /><span>Ativar Estratégia</span></>
          )}
        </button>

      </div>

      <ProBottomNav />
    </div>
  );
}
