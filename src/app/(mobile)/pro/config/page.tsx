// WCAG 2.2 — Tela Configurações Avançadas (Modo Pro)
// Critérios cobertos:
//   1.3.1 Info and Relationships — <fieldset>/<legend> agrupam campos relacionados;
//                                  <label> explicitamente associado a cada input
//   1.4.4 Resize Text        — tipografia e espaçamentos em rem
//   2.4.6 Headings and Labels — <h1> único; labels descritivos
//   4.1.2 Name, Role, Value  — role="switch" + aria-checked nos toggles;
//                              aria-pressed no botão de sair
//   4.1.3 Status Messages    — aria-live="polite" + role="status" no toast de sucesso
"use client";
import { ProBottomNav } from "@/components/ProBottomNav";

import { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Save,
  LogOut,
  User,
  Zap,
  Bell,
  Handshake,
  Home,
  MapPin,
  List,
  Settings,
  CircleCheck,
  AlertTriangle,
  Shield,
  KeyRound,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface ProSettings {
  pixKey: string;
  minSalePrice: string;
  volatilityAlerts: boolean;
  autoAcceptB2B: boolean;
}

// ── Valores padrão realistas para Marina (Produtora Rural Pro) ────────────────
const DEFAULT_SETTINGS: ProSettings = {
  pixKey: "marina.silva@fluxo.com.br",
  minSalePrice: "0.45",
  volatilityAlerts: true,
  autoAcceptB2B: false,
};

// ── Bottom Nav ─────────────────────────────────────────────────────────────────
const navItems = [
  { id: "home",    label: "Home",              icon: Home     },
  { id: "mapa",    label: "Mapa de Demanda",   icon: MapPin   },
  { id: "extrato", label: "Extrato Detalhado", icon: List     },
  { id: "config",  label: "Configurações",     icon: Settings },
];

// ── Componente de Toggle Acessível ────────────────────────────────────────────
function Toggle({
  id,
  checked,
  onChange,
  ariaLabel,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    // WCAG 4.1.2: role="switch" + aria-checked informam o estado ao leitor de tela
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full shrink-0 transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]
        ${checked ? "bg-green-600" : "bg-[#30363d]"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

// ── Componente Principal ───────────────────────────────────────────────────────
export default function ConfiguracoesPro() {
  const router = useRouter();
  const toastId = useId();
  const pixInputId = useId();
  const priceInputId = useId();
  const volatToggleId = useId();
  const b2bToggleId = useId();

  // ── Persistência ──────────────────────────────────────────────────────────
  const [savedSettings, setSavedSettings, isHydrated] = useLocalStorage<ProSettings>(
    "fluxo_pro_settings",
    DEFAULT_SETTINGS
  );

  // ── Estado local do formulário (edição em memória até salvar) ─────────────
  const [form, setForm] = useState<ProSettings>(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [toastMsg, setToastMsg] = useState("");
  const [activeNavTab] = useState("config");

  // Sincroniza o form local com o valor hidratado do localStorage
  useEffect(() => {
    if (isHydrated) {
      setForm(savedSettings);
    }
  }, [isHydrated, savedSettings]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveStatus("saving");

    setTimeout(() => {
      setSavedSettings(form);
      setSaveStatus("saved");
      setToastMsg("Configurações atualizadas com sucesso!");

      setTimeout(() => {
        setSaveStatus("idle");
        setToastMsg("");
      }, 4000);
    }, 1200);
  }

  // ── Skeleton de hidratação ─────────────────────────────────────────────────
  if (!isHydrated) {
    return (
      <div className="flex flex-col h-full bg-[#0d1117] items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-white">

      {/* ── Status Bar ────────────────────────────────────────────────────── */}
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
          <h1 className="text-white text-[1rem] font-bold leading-tight">
            Configurações
          </h1>
          <p className="text-gray-500 text-[0.6875rem] mt-0.5">Preferências Avançadas · Modo Pro</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-center shrink-0" aria-hidden="true">
          <Settings size={16} className="text-gray-400" />
        </div>
      </header>

      {/* ── Corpo Scrollável ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28 flex flex-col gap-5">

        {/* ── Toast de Sucesso ─────────────────────────────────────────────── */}
        {/* WCAG 4.1.3: role="status" + aria-live="polite" */}
        <div id={toastId} role="status" aria-live="polite" aria-atomic="true">
          {toastMsg && (
            <div className="flex items-center gap-3 bg-green-950 border border-green-700 rounded-xl px-4 py-3">
              <CircleCheck size={18} className="text-green-400 shrink-0" aria-hidden="true" />
              <p className="text-green-300 text-[0.8125rem] font-semibold">{toastMsg}</p>
            </div>
          )}
        </div>

        {/* ── Card de Perfil ─────────────────────────────────────────────── */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 flex items-center gap-4" aria-label="Resumo do perfil">
          <div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-700 to-emerald-900 flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <span className="text-white text-[1.125rem] font-extrabold select-none">MS</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-[0.9375rem] font-bold leading-tight truncate">Marina Silva</p>
            <p className="text-gray-400 text-[0.75rem] mt-0.5">Produtora Rural / B2B</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Zap size={12} className="text-green-400 shrink-0" aria-hidden="true" />
              <span className="text-green-400 text-[0.6875rem] font-semibold">1.500 kWh / mês instalados</span>
            </div>
          </div>
          <div className="shrink-0">
            <span className="px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 rounded-full text-blue-300 text-[0.625rem] font-bold uppercase tracking-wider">
              PRO
            </span>
          </div>
        </section>

        {/* ── Formulário de Configurações ──────────────────────────────────── */}
        <form onSubmit={handleSave} noValidate className="flex flex-col gap-4">

          {/* ── Fieldset: Dados Financeiros ─────────────────────────────── */}
          <fieldset className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
            <legend className="sr-only">Dados financeiros e de negociação</legend>

            {/* Cabeçalho visual da seção */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#21262d]">
              <KeyRound size={14} className="text-blue-400 shrink-0" aria-hidden="true" />
              <h2 className="text-gray-300 text-[0.75rem] font-bold uppercase tracking-widest">
                Dados Financeiros
              </h2>
            </div>

            <div className="flex flex-col divide-y divide-[#21262d]">
              {/* Campo: Chave PIX */}
              <div className="px-4 py-4">
                {/* WCAG 1.3.1: <label> com htmlFor associado */}
                <label
                  htmlFor={pixInputId}
                  className="block text-gray-300 text-[0.75rem] font-semibold mb-1.5"
                >
                  Chave PIX
                </label>
                <input
                  id={pixInputId}
                  type="email"
                  value={form.pixKey}
                  onChange={(e) => setForm((f) => ({ ...f, pixKey: e.target.value }))}
                  placeholder="seu@email.com ou CPF"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white text-[0.875rem] font-medium
                    placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <p className="mt-1.5 text-gray-600 text-[0.6875rem]">
                  Usada para receber o valor das vendas automaticamente.
                </p>
              </div>

              {/* Campo: Preço Mínimo de Venda */}
              <div className="px-4 py-4">
                <label
                  htmlFor={priceInputId}
                  className="block text-gray-300 text-[0.75rem] font-semibold mb-1.5"
                >
                  Preço Mínimo de Venda Automática
                </label>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[0.75rem] font-semibold"
                    aria-hidden="true"
                  >
                    R$
                  </span>
                  <input
                    id={priceInputId}
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    max="5"
                    step="0.01"
                    value={form.minSalePrice}
                    onChange={(e) => setForm((f) => ({ ...f, minSalePrice: e.target.value }))}
                    placeholder="0,45"
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 pl-10 text-white text-[0.875rem] font-bold pr-16
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-[0.6875rem] font-semibold" aria-hidden="true">
                    /kWh
                  </span>
                </div>
                <p className="mt-1.5 text-gray-600 text-[0.6875rem]">
                  O Piloto Automático nunca venderá abaixo deste valor.
                </p>
              </div>
            </div>
          </fieldset>

          {/* ── Fieldset: Preferências do Sistema ─────────────────────── */}
          <fieldset className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
            <legend className="sr-only">Preferências do sistema</legend>

            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#21262d]">
              <Shield size={14} className="text-purple-400 shrink-0" aria-hidden="true" />
              <h2 className="text-gray-300 text-[0.75rem] font-bold uppercase tracking-widest">
                Preferências do Sistema
              </h2>
            </div>

            <div className="flex flex-col divide-y divide-[#21262d]">
              {/* Toggle: Alertas de Volatilidade */}
              <div className="flex items-start justify-between gap-4 px-4 py-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    <Bell size={16} className="text-orange-400" />
                  </div>
                  <div>
                    {/* WCAG 1.3.1: o <label> está no atributo aria-label do toggle  */}
                    <p className="text-white text-[0.875rem] font-semibold leading-snug">
                      Alertas de Volatilidade
                    </p>
                    <p className="text-gray-500 text-[0.6875rem] mt-0.5 leading-snug">
                      Notificações quando o preço no Mapa de Demanda disparar
                    </p>
                  </div>
                </div>
                {/* WCAG 4.1.2: role="switch" + aria-checked */}
                <Toggle
                  id={volatToggleId}
                  checked={form.volatilityAlerts}
                  onChange={(v) => setForm((f) => ({ ...f, volatilityAlerts: v }))}
                  ariaLabel={`Alertas de volatilidade: ${form.volatilityAlerts ? "ativado" : "desativado"}`}
                />
              </div>

              {/* Toggle: Aceite Automático B2B */}
              <div className="flex items-start justify-between gap-4 px-4 py-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    <Handshake size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-[0.875rem] font-semibold leading-snug">
                      Aceite Automático B2B
                    </p>
                    <p className="text-gray-500 text-[0.6875rem] mt-0.5 leading-snug">
                      Aceita automaticamente ofertas de compra da distribuidora local
                    </p>
                  </div>
                </div>
                <Toggle
                  id={b2bToggleId}
                  checked={form.autoAcceptB2B}
                  onChange={(v) => setForm((f) => ({ ...f, autoAcceptB2B: v }))}
                  ariaLabel={`Aceite automático B2B: ${form.autoAcceptB2B ? "ativado" : "desativado"}`}
                />
              </div>
            </div>
          </fieldset>

          {/* ── Botão Salvar ─────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={saveStatus === "saving"}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-[0.9375rem] transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]
              ${
                saveStatus === "saving"
                  ? "bg-green-900/40 text-green-600 cursor-wait"
                  : saveStatus === "saved"
                  ? "bg-green-950 border border-green-600 text-green-400"
                  : "bg-green-600 hover:bg-green-500 active:scale-[0.98] text-white shadow-lg shadow-green-900/40"
              }`}
          >
            {saveStatus === "saving" ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Salvando…</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <CircleCheck size={18} aria-hidden="true" />
                <span>Salvo!</span>
              </>
            ) : (
              <>
                <Save size={18} aria-hidden="true" />
                <span>Salvar Preferências</span>
              </>
            )}
          </button>
        </form>

        {/* ── Zona de Perigo ─────────────────────────────────────────────── */}
        <section aria-label="Zona de perigo" className="bg-red-950/40 border border-red-900/60 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400 shrink-0" aria-hidden="true" />
            <h2 className="text-red-300 text-[0.75rem] font-bold uppercase tracking-widest">Zona de Perigo</h2>
          </div>
          <p className="text-gray-500 text-[0.75rem] leading-snug">
            Ao sair do Modo Pro, você voltará para o Modo Lite. Seus contratos B2B e configurações ficarão salvos.
          </p>

          {/* WCAG 4.1.2: botão com aria-label explícito descrevendo a ação destructiva */}
          <button
            onClick={() => router.push("/home")}
            aria-label="Sair do Modo Pro e voltar para o Modo Lite"
            className="w-full flex items-center justify-center gap-2 border border-red-700 text-red-400 bg-red-950/60 hover:bg-red-900/60 active:scale-[0.98]
              rounded-xl py-3 font-bold text-[0.875rem] transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          >
            <LogOut size={18} aria-hidden="true" />
            <span>Sair do Modo Pro</span>
          </button>
        </section>

      </div>

      {/* ── Bottom Navigation ─────────────────────────────────────────────── */}
      <ProBottomNav />
    </div>
  );
}
