// WCAG 2.2 — Tela Novo Contrato B2B / Bateria Virtual (Modo Pro)
// Critérios cobertos:
//   1.1.1 Non-text Content   — ícones decorativos com aria-hidden
//   1.3.1 Info and Relationships — <form>, <fieldset>, <legend>, <label> associados
//   1.4.4 Resize Text        — tipografia em rem (classes Tailwind relativas)
//   2.4.6 Headings and Labels — <h1> único; <label> explícito para cada <input>
//   2.4.8 Location           — aria-current="page" não aplicável (tela de detalhe)
//   3.3.1 Error Identification — mensagens de erro inline por campo
//   3.3.2 Labels or Instructions — helper text e unidades junto a cada campo
//   4.1.2 Name, Role, Value  — aria-pressed nos radio-buttons customizados
//   4.1.3 Status Messages    — aria-live="polite" + role="status" no feedback de sucesso
"use client";
import { ProBottomNav } from "@/components/ProBottomNav";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Zap,
  TrendingUp,
  Clock,
  Moon,
  Sun,
  AlertCircle,
  CheckCircle2,
  FileSignature,
  Info,
  Home,
  MapPin,
  List,
  Settings,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Schedule = "24h" | "madrugada" | "pico";

interface FormErrors {
  volume?: string;
  price?: string;
}

// ── Opções de Agenda (Bateria Virtual) ───────────────────────────────────────
const SCHEDULE_OPTIONS: {
  id: Schedule;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  iconColor: string;
  tip: string;
}[] = [
  {
    id: "24h",
    label: "24 Horas",
    sublabel: "Contínuo",
    icon: Zap,
    iconColor: "#34d399",
    tip: "Injeção contínua — maximiza volume",
  },
  {
    id: "madrugada",
    label: "Madrugada",
    sublabel: "00h – 06h",
    icon: Moon,
    iconColor: "#a78bfa",
    tip: "Menor demanda — preço mais baixo",
  },
  {
    id: "pico",
    label: "Horário de Pico",
    sublabel: "18h – 21h",
    icon: Sun,
    iconColor: "#fb923c",
    tip: "Alta demanda — melhor preço por kWh",
  },
];

// ── Preço médio de mercado (mockado) ─────────────────────────────────────────
const MARKET_AVG = 0.55;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

// ── Bottom Nav Pro (consistente com pro/page.tsx) ─────────────────────────────
const navItems = [
  { id: "home",    label: "Home",              icon: Home    },
  { id: "mapa",    label: "Mapa de Demanda",   icon: MapPin  },
  { id: "extrato", label: "Extrato Detalhado", icon: List    },
  { id: "config",  label: "Configurações",     icon: Settings },
];

// ── Página Principal ──────────────────────────────────────────────────────────
export default function NovoContratoPro() {
  const router = useRouter();

  // IDs únicos para acessibilidade (evita colisão em SSR)
  const volumeId      = useId();
  const priceId       = useId();
  const scheduleId    = useId();
  const summaryDescId = useId();
  const feedbackId    = useId();

  // ── Hook de Persistência ──────────────────────────────────────────────────
  // Utilizado para adicionar os novos contratos no portfólio persistido localmente
  const [contracts, setContracts] = useLocalStorage<any[]>("fluxo_b2b_contracts", []);

  // ── Estado do formulário ──────────────────────────────────────────────────
  const [volume, setVolume]     = useState<string>("50");
  const [price, setPrice]       = useState<string>("0.60");
  const [schedule, setSchedule] = useState<Schedule>("24h");
  const [errors, setErrors]     = useState<FormErrors>({});

  // ── Estado de submissão ───────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");

  // ── Tab ativo na nav (estático nesta página — não há rota vinculada) ──────
  const [activeTab, setActiveTab] = useState("home");

  // ── Cálculo em tempo real ─────────────────────────────────────────────────
  const parsedVolume = parseFloat(volume) || 0;
  const parsedPrice  = parseFloat(price)  || 0;
  const grossRevenue = parsedVolume * parsedPrice;

  const priceVsMarket = parsedPrice - MARKET_AVG;
  const priceVsMarketPct = MARKET_AVG > 0
    ? ((priceVsMarket / MARKET_AVG) * 100).toFixed(1)
    : "0.0";
  const priceAboveMarket = priceVsMarket >= 0;

  // ── Validação ─────────────────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!volume || parsedVolume <= 0) {
      newErrors.volume = "Informe um volume maior que zero.";
    } else if (parsedVolume > 10000) {
      newErrors.volume = "Volume máximo permitido: 10.000 kWh.";
    }
    if (!price || parsedPrice <= 0) {
      newErrors.price = "Informe um preço maior que zero.";
    } else if (parsedPrice > 5) {
      newErrors.price = "Preço máximo permitido: R$ 5,00 / kWh.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Submissão ─────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSuccessMsg("");

    // Simula chamada de backend (~1.2s)
    setTimeout(() => {
      const scheduleLabel = SCHEDULE_OPTIONS.find((s) => s.id === schedule)?.label ?? "";
      
      // Salva o novo contrato usando o hook de localStorage
      const newContract = {
        id: `cnt-${Date.now()}`,
        volume: parsedVolume,
        price: parsedPrice,
        schedule: schedule,
        status: "aguardando",
        createdAt: new Date().toISOString(),
      };
      setContracts([...contracts, newContract]);

      setSuccessMsg(
        `Contrato ativado com sucesso nas regras da Bateria Virtual (${scheduleLabel})!`
      );
      setIsSubmitting(false);

      // Reset do formulário após 3s
      setTimeout(() => {
        setVolume("50");
        setPrice("0.60");
        setSchedule("24h");
        setErrors({});
        setSuccessMsg("");
      }, 3000);
    }, 1200);
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-white">

      {/* ── Status Bar ────────────────────────────────────────────────────── */}
      {/* WCAG 1.1.1: decorativa — aria-hidden="true" */}
      <div className="px-5 pt-3 shrink-0" aria-hidden="true">
        <div className="flex justify-between items-center text-white text-xs font-semibold">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <svg width="15" height="11" viewBox="0 0 15 11" fill="white" aria-hidden="true">
              <rect x="0" y="7" width="3" height="4" rx="0.5" />
              <rect x="4" y="4.5" width="3" height="6.5" rx="0.5" />
              <rect x="8" y="2" width="3" height="9" rx="0.5" />
              <rect x="12" y="0" width="3" height="11" rx="0.5" />
            </svg>
            <svg width="15" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <circle cx="12" cy="20" r="1" fill="white" />
            </svg>
            <svg width="22" height="12" viewBox="0 0 22 12" fill="white" aria-hidden="true">
              <rect x="0" y="1" width="18" height="10" rx="2" fill="white" />
              <rect x="1" y="2" width="16" height="8" rx="1.5" fill="#0d1117" />
              <rect x="1" y="2" width="14" height="8" rx="1.5" fill="white" />
              <rect x="18.5" y="4" width="2" height="4" rx="1" fill="white" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 pt-3 pb-4 shrink-0 border-b border-[#21262d]">
        {/* Voltar — AGENTS.md: useRouter().back() */}
        <button
          id="btn-voltar-contrato"
          aria-label="Voltar para Home Pro"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-lg p-1 shrink-0"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <div className="flex-1 min-w-0">
          {/* WCAG 1.3.1: único <h1> da página */}
          <h1 className="text-white text-[1rem] font-bold leading-tight truncate">
            Novo Contrato de Venda
          </h1>
          <p className="text-gray-500 text-[0.6875rem] mt-0.5">
            Bateria Virtual · Marina Costa
          </p>
        </div>

        {/* Ícone contextual — decorativo */}
        <div
          className="w-9 h-9 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <FileSignature size={16} className="text-blue-400" />
        </div>
      </header>

      {/* ── Corpo Scrollável ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 flex flex-col gap-4">

        {/* ── Feedback de Sucesso ──────────────────────────────────────────
            WCAG 4.1.3: role="status" + aria-live="polite" anunciam a mensagem
            ao leitor de tela sem interromper o fluxo de leitura atual. */}
        <div
          id={feedbackId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {successMsg && (
            <div className="flex items-start gap-3 bg-green-950 border border-green-700 rounded-xl px-4 py-3">
              <CheckCircle2 size={18} className="text-green-400 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-green-300 text-[0.8125rem] font-semibold leading-snug">
                {successMsg}
              </p>
            </div>
          )}
        </div>

        {/* ── Formulário ────────────────────────────────────────────────────
            WCAG 1.3.1: <form> semântico com onSubmit — nunca handler em <div>.
            Cada campo tem <label> explicitamente associado via htmlFor/id. */}
        <form
          id="form-contrato"
          onSubmit={handleSubmit}
          noValidate
          aria-describedby={summaryDescId}
          className="flex flex-col gap-4"
        >

          {/* ── Fieldset: Parâmetros Financeiros ────────────────────────── */}
          {/* WCAG 1.3.1: <fieldset> + <legend> agrupam campos relacionados */}
          <fieldset className="bg-[#161b22] rounded-2xl border border-[#30363d] p-4">
            <legend className="text-gray-400 text-[0.6875rem] font-semibold uppercase tracking-widest px-1 mb-3">
              Parâmetros Financeiros
            </legend>

            <div className="flex flex-col gap-4">
              {/* ── Campo: Volume ──────────────────────────────────────── */}
              <div>
                {/* WCAG 2.4.6: <label> explícito e descritivo */}
                <label
                  htmlFor={volumeId}
                  className="block text-gray-300 text-[0.75rem] font-semibold mb-1.5"
                >
                  Volume para venda
                </label>

                <div className="relative">
                  <input
                    id={volumeId}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    max="10000"
                    step="1"
                    value={volume}
                    onChange={(e) => {
                      setVolume(e.target.value);
                      if (errors.volume) setErrors((prev) => ({ ...prev, volume: undefined }));
                    }}
                    aria-describedby={errors.volume ? `${volumeId}-error` : `${volumeId}-hint`}
                    aria-invalid={!!errors.volume}
                    className={`w-full bg-[#0d1117] border rounded-xl px-4 py-3 text-white text-[0.9375rem] font-bold pr-14 placeholder-gray-600
                      focus:outline-none focus:ring-2 transition-all
                      ${errors.volume
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-[#30363d] focus:border-green-500 focus:ring-green-500/20"
                      }`}
                    placeholder="50"
                  />
                  {/* Unidade — WCAG 3.3.2: visível junto ao campo */}
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-[0.75rem] font-semibold"
                    aria-hidden="true"
                  >
                    kWh
                  </span>
                </div>

                {/* Hint ou erro — WCAG 3.3.1 */}
                {errors.volume ? (
                  <p
                    id={`${volumeId}-error`}
                    role="alert"
                    className="flex items-center gap-1.5 mt-1.5 text-red-400 text-[0.6875rem]"
                  >
                    <AlertCircle size={12} aria-hidden="true" />
                    {errors.volume}
                  </p>
                ) : (
                  <p
                    id={`${volumeId}-hint`}
                    className="mt-1.5 text-gray-600 text-[0.6875rem]"
                  >
                    Capacidade disponível: 8.620 kWh
                  </p>
                )}
              </div>

              {/* ── Campo: Preço ────────────────────────────────────────── */}
              <div>
                <label
                  htmlFor={priceId}
                  className="block text-gray-300 text-[0.75rem] font-semibold mb-1.5"
                >
                  Preço de venda
                </label>

                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[0.75rem] font-semibold"
                    aria-hidden="true"
                  >
                    R$
                  </span>
                  <input
                    id={priceId}
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    max="5"
                    step="0.01"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                    }}
                    aria-describedby={errors.price ? `${priceId}-error` : `${priceId}-hint`}
                    aria-invalid={!!errors.price}
                    className={`w-full bg-[#0d1117] border rounded-xl px-4 py-3 pl-10 text-white text-[0.9375rem] font-bold pr-16 placeholder-gray-600
                      focus:outline-none focus:ring-2 transition-all
                      ${errors.price
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-[#30363d] focus:border-green-500 focus:ring-green-500/20"
                      }`}
                    placeholder="0,60"
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-[0.6875rem] font-semibold"
                    aria-hidden="true"
                  >
                    /kWh
                  </span>
                </div>

                {/* Hint: média de mercado + variação em relação ao input */}
                {errors.price ? (
                  <p
                    id={`${priceId}-error`}
                    role="alert"
                    className="flex items-center gap-1.5 mt-1.5 text-red-400 text-[0.6875rem]"
                  >
                    <AlertCircle size={12} aria-hidden="true" />
                    {errors.price}
                  </p>
                ) : (
                  <div id={`${priceId}-hint`} className="flex items-center gap-1.5 mt-1.5">
                    <Info size={11} className="text-gray-600 shrink-0" aria-hidden="true" />
                    <p className="text-gray-600 text-[0.6875rem]">
                      Média de mercado:{" "}
                      <span className="text-gray-400 font-semibold">
                        R$ {MARKET_AVG.toFixed(2).replace(".", ",")} / kWh
                      </span>
                      {parsedPrice > 0 && (
                        <span
                          className={`ml-1.5 font-bold ${
                            priceAboveMarket ? "text-green-400" : "text-red-400"
                          }`}
                          aria-label={`Seu preço está ${priceAboveMarket ? "acima" : "abaixo"} da média em ${Math.abs(Number(priceVsMarketPct))}%`}
                        >
                          ({priceAboveMarket ? "+" : ""}{priceVsMarketPct}%)
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          {/* ── Fieldset: Agenda / Bateria Virtual ──────────────────────────
              WCAG 1.3.1: radio group com <fieldset>/<legend> é o padrão
              semântico correto para escolha única entre opções.
              WCAG 4.1.2: aria-pressed nos botões estilizados como radio. */}
          <fieldset
            id={scheduleId}
            className="bg-[#161b22] rounded-2xl border border-[#30363d] p-4"
          >
            <legend className="text-gray-400 text-[0.6875rem] font-semibold uppercase tracking-widest px-1 mb-3">
              Agenda de Injeção (Bateria Virtual)
            </legend>

            <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby={scheduleId}>
              {SCHEDULE_OPTIONS.map(({ id, label, sublabel, icon: Icon, iconColor, tip }) => {
                const isSelected = schedule === id;
                return (
                  // Botão customizado simula radio — WCAG 4.1.2: aria-pressed
                  <button
                    key={id}
                    type="button"
                    id={`schedule-${id}`}
                    role="radio"
                    aria-checked={isSelected}
                    aria-describedby={`schedule-${id}-tip`}
                    onClick={() => setSchedule(id)}
                    className={`flex items-center gap-3 w-full rounded-xl px-3 py-3 text-left transition-all
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 focus-visible:ring-offset-[#161b22]
                      ${isSelected
                        ? "bg-[#0d1117] border-2 border-green-600"
                        : "bg-[#0d1117] border border-[#30363d] hover:border-[#58a6ff]/40"
                      }`}
                  >
                    {/* Ícone de categoria */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${iconColor}18` }}
                      aria-hidden="true"
                    >
                      <Icon size={17} style={{ color: iconColor }} aria-hidden="true" />
                    </div>

                    {/* Textos */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[0.8125rem] font-bold leading-tight ${isSelected ? "text-white" : "text-gray-300"}`}>
                        {label}
                      </p>
                      <p
                        id={`schedule-${id}-tip`}
                        className="text-gray-500 text-[0.6875rem] mt-0.5 leading-tight"
                      >
                        {sublabel} · {tip}
                      </p>
                    </div>

                    {/* Indicador de seleção */}
                    <div
                      className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${
                        isSelected
                          ? "border-green-500 bg-green-500"
                          : "border-[#30363d] bg-transparent"
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* ── Card de Resumo em Tempo Real ─────────────────────────────────
              WCAG 1.1.1: valores calculados têm texto legível; não são só visuais.
              id={summaryDescId} associado ao aria-describedby do <form>. */}
          <section
            id={summaryDescId}
            aria-labelledby="resumo-titulo"
            className="bg-[#161b22] rounded-2xl border border-green-900/60 p-4 relative overflow-hidden"
          >
            {/* Glow sutil de fundo — decorativo */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-transparent pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-green-400" aria-hidden="true" />
                <p
                  id="resumo-titulo"
                  className="text-gray-400 text-[0.6875rem] font-semibold uppercase tracking-widest"
                >
                  Resumo do Contrato
                </p>
              </div>

              {/* Receita bruta — destaque visual principal */}
              <div className="mb-3">
                <p className="text-gray-500 text-[0.6875rem] mb-0.5">
                  Receita Bruta Estimada
                </p>
                <p
                  className="text-green-400 text-[1.625rem] font-extrabold leading-tight tabular-nums"
                  aria-label={`Receita bruta estimada: ${formatBRL(grossRevenue)}`}
                >
                  {formatBRL(grossRevenue)}
                </p>
              </div>

              {/* Grid de detalhes */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#30363d]">
                <div>
                  <p className="text-gray-600 text-[0.5625rem] uppercase tracking-wide">Volume</p>
                  <p className="text-white text-[0.8125rem] font-bold mt-0.5 tabular-nums">
                    {parsedVolume > 0 ? `${parsedVolume} kWh` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-[0.5625rem] uppercase tracking-wide">Preço</p>
                  <p className="text-white text-[0.8125rem] font-bold mt-0.5 tabular-nums">
                    {parsedPrice > 0 ? `R$ ${parsedPrice.toFixed(2).replace(".", ",")}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-[0.5625rem] uppercase tracking-wide">Agenda</p>
                  <p className="text-white text-[0.8125rem] font-bold mt-0.5 leading-tight">
                    {SCHEDULE_OPTIONS.find((s) => s.id === schedule)?.sublabel ?? "—"}
                  </p>
                </div>
              </div>

              {/* Aviso: estimativa não inclui taxas */}
              <div className="flex items-start gap-1.5 mt-3 pt-3 border-t border-[#21262d]">
                <Clock size={11} className="text-gray-600 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-gray-600 text-[0.5625rem] leading-snug">
                  Estimativa bruta. Taxas de rede e impostos serão deduzidos na liquidação.
                </p>
              </div>
            </div>
          </section>

          {/* ── Botão Assinar Contrato ──────────────────────────────────────── */}
          <button
            id="btn-assinar-contrato"
            type="submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
            aria-describedby={feedbackId}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-[0.9375rem] transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]
              ${isSubmitting
                ? "bg-green-900/40 text-green-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500 active:scale-[0.98] text-white shadow-lg shadow-green-900/40"
              }`}
          >
            {isSubmitting ? (
              <>
                {/* Spinner acessível */}
                <svg
                  className="animate-spin w-4 h-4 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Assinando contrato…</span>
              </>
            ) : (
              <>
                <FileSignature size={18} aria-hidden="true" />
                <span>Assinar Contrato</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Bottom Navigation ─────────────────────────────────────────────── */}
      <ProBottomNav />
    </div>
  );
}
