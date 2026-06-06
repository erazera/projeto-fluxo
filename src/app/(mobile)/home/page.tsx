// WCAG 2.2 — Tela Home Lite com Takeover de Piloto Automático
// Critérios cobertos:
//   1.1.1 Non-text Content   — aria-hidden em ícones decorativos
//   1.3.1 Info and Relationships — fieldsets para o modal de setup
//   2.1.1 Keyboard           — focus trap via atributo `inert` nos modais
//   2.4.3 Focus Order        — foco retorna ao botão de origem ao fechar
//   4.1.2 Name, Role, Value  — role="dialog", role="switch"
//   4.1.3 Status Messages    — aria-live="assertive" no takeover; aria-live="polite" no log
"use client";

import { useState, useRef, useEffect, useId, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  HelpCircle,
  X,
  Zap,
  ArrowLeftRight,
  Package,
  Home,
  Info,
  AlertTriangle,
  Sun,
  MapPin,
  Bot,
  CheckCircle2,
  PowerOff,
  Pencil,
  ChevronDown,
  BellRing,
  FileText,
  Clock,
  Plus,
} from "lucide-react";
import { LiteBottomNav } from "@/components/LiteBottomNav";

// ── Mocked Data ───────────────────────────────────────────────────────────────

const DECISION_LOG_MESSAGES = [
  "Analisando a rede da sua região...",
  "Verificando o preço atual: R$ 0,82/kWh.",
  "Aguardando preço baixar abaixo de R$ 0,70...",
  "Buscando oportunidades nas próximas 2 horas...",
  "Sem atividade no mercado. Monitorando...",
  "Sinal fraco detectado. Reconectando à rede...",
  "Preço estabilizado. Aguardando janela ideal...",
];

const MOCKED_AVISOS = [
  {
    id: "a1",
    tipo: "info",
    titulo: "Preço caiu!",
    descricao: "O preço na sua região caiu para R$ 0,68/kWh às 14h32.",
    tempo: "Há 2 horas",
  },
  {
    id: "a2",
    tipo: "alerta",
    titulo: "Limite próximo",
    descricao: "Você já usou 80% do seu limite mensal de R$ 100,00.",
    tempo: "Ontem",
  },
  {
    id: "a3",
    tipo: "info",
    titulo: "Compra realizada",
    descricao: "O Piloto Automático comprou 15 kWh por R$ 10,20.",
    tempo: "Há 3 dias",
  },
];

const MOCKED_EXTRATO = [
  {
    id: "e1",
    descricao: "Compra automática",
    kwh: 15,
    valor: -10.2,
    data: "03/06",
  },
  {
    id: "e2",
    descricao: "Compra automática",
    kwh: 22,
    valor: -14.96,
    data: "01/06",
  },
  {
    id: "e3",
    descricao: "Compra manual",
    kwh: 50,
    valor: -34.0,
    data: "28/05",
  },
  {
    id: "e4",
    descricao: "Recarga de saldo",
    kwh: 0,
    valor: 100.0,
    data: "25/05",
  },
];

// ── Types ────────────────────────────────────────────────────────────────────
interface Endereco {
  id: string;
  apelido: string;
  cep: string;
  numero: string;
  rua: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HomeSimplificada() {
  const router = useRouter();

  // ── Estados Principais ───────────────────────────────────────────────────────
  const [isAutopilotActive, setIsAutopilotActive] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isEditLimitModalOpen, setIsEditLimitModalOpen] = useState(false);
  const [isAvisosSheetOpen, setIsAvisosSheetOpen] = useState(false);
  const [isExtratoSheetOpen, setIsExtratoSheetOpen] = useState(false);
  const [cardVisible, setCardVisible] = useState(true);

  // Estados do Setup do Piloto
  // setupAddress começa vazio — será preenchido quando os endereços carregarem
  const [setupAddress, setSetupAddress] = useState("");
  const [setupLimit, setSetupLimit] = useState(100);
  // Limite editável no modal de edição (separado para não commitar até salvar)
  const [editLimitDraft, setEditLimitDraft] = useState(setupLimit);

  // ── Endereços salvos (Single Source of Truth: localStorage) ──────────────
  const [savedAddresses, setSavedAddresses] = useState<Endereco[]>([]);

  // ── Estado do Log de Decisão em Tempo Real ────────────────────────────────
  const [logMessage, setLogMessage] = useState(DECISION_LOG_MESSAGES[0]);
  const [logVisible, setLogVisible] = useState(true);
  const logIndexRef = useRef(0);

  useEffect(() => {
    if (!isAutopilotActive) return;

    const cycle = () => {
      // fade-out → troca texto → fade-in
      setLogVisible(false);
      const timer = setTimeout(() => {
        logIndexRef.current =
          (logIndexRef.current + 1) % DECISION_LOG_MESSAGES.length;
        setLogMessage(DECISION_LOG_MESSAGES[logIndexRef.current]);
        setLogVisible(true);
      }, 400);
      return timer;
    };

    const interval = setInterval(cycle, 4000);
    return () => clearInterval(interval);
  }, [isAutopilotActive]);

  // ── Refs de Acessibilidade ───────────────────────────────────────────────────
  const mainContentRef = useRef<HTMLDivElement>(null);
  const setupCloseBtnRef = useRef<HTMLButtonElement>(null);
  const proModalCloseBtnRef = useRef<HTMLAnchorElement>(null);
  const buyModalCloseBtnRef = useRef<HTMLButtonElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const openProModalBtnRef = useRef<HTMLButtonElement>(null);
  const openBuyModalBtnRef = useRef<HTMLButtonElement>(null);
  const deactivateCloseBtnRef = useRef<HTMLButtonElement>(null);
  const openDeactivateBtnRef = useRef<HTMLButtonElement>(null);
  const editLimitCloseBtnRef = useRef<HTMLButtonElement>(null);
  const openEditLimitBtnRef = useRef<HTMLButtonElement>(null);
  const avisosCloseBtnRef = useRef<HTMLButtonElement>(null);
  const openAvisosBtnRef = useRef<HTMLButtonElement>(null);
  const extratoCloseBtnRef = useRef<HTMLButtonElement>(null);
  const openExtratoBtnRef = useRef<HTMLButtonElement>(null);

  // ── Persistência de Estado (Piloto Automático) ──────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const active = localStorage.getItem("fluxo_autopilot_state") === "true";
      const savedLimit = localStorage.getItem("fluxo_autopilot_limit");
      setIsAutopilotActive(active);
      if (savedLimit) setSetupLimit(Number(savedLimit));
    } catch {}
  }, []);

  // ── Carrega endereços do localStorage (mesma chave do perfil/enderecos) ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("fluxo_lite_addresses");
      if (!raw) return;
      const parsed: Endereco[] = JSON.parse(raw);
      setSavedAddresses(parsed);
      // Pré-seleciona o primeiro endereço disponível
      if (parsed.length > 0) setSetupAddress(parsed[0].id);
    } catch {
      // localStorage corrompido — mantém lista vazia (empty state será exibido)
    }
  }, []);

  function handleActivateAutopilot() {
    setIsAutopilotActive(true);
    setIsSetupModalOpen(false);
    try {
      localStorage.setItem("fluxo_autopilot_state", "true");
      localStorage.setItem("fluxo_autopilot_limit", String(setupLimit));
    } catch {}
  }

  function handleDeactivateAutopilot() {
    setIsAutopilotActive(false);
    try {
      localStorage.setItem("fluxo_autopilot_state", "false");
    } catch {}
  }

  function handleSaveEditLimit() {
    setSetupLimit(editLimitDraft);
    setIsEditLimitModalOpen(false);
    openEditLimitBtnRef.current?.focus();
    try {
      localStorage.setItem("fluxo_autopilot_limit", String(editLimitDraft));
    } catch {}
  }

  // ── Focus Trap (Inert) ──────────────────────────────────────────────────────
  const isAnyModalOpen =
    isSetupModalOpen ||
    isProModalOpen ||
    isBuyModalOpen ||
    isDeactivateModalOpen ||
    isEditLimitModalOpen ||
    isAvisosSheetOpen ||
    isExtratoSheetOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
      if (mainContentRef.current) mainContentRef.current.setAttribute("inert", "");
      const timeout = setTimeout(() => {
        if (isSetupModalOpen) setupCloseBtnRef.current?.focus();
        if (isProModalOpen) proModalCloseBtnRef.current?.focus();
        if (isBuyModalOpen) buyModalCloseBtnRef.current?.focus();
        if (isDeactivateModalOpen) deactivateCloseBtnRef.current?.focus();
        if (isEditLimitModalOpen) editLimitCloseBtnRef.current?.focus();
        if (isAvisosSheetOpen) avisosCloseBtnRef.current?.focus();
        if (isExtratoSheetOpen) extratoCloseBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      if (mainContentRef.current) mainContentRef.current.removeAttribute("inert");
    }
  }, [
    isAnyModalOpen,
    isSetupModalOpen,
    isProModalOpen,
    isBuyModalOpen,
    isDeactivateModalOpen,
    isEditLimitModalOpen,
    isAvisosSheetOpen,
    isExtratoSheetOpen,
  ]);

  // ── ESC Key Listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSetupModalOpen) {
          setIsSetupModalOpen(false);
          toggleBtnRef.current?.focus();
        }
        if (isProModalOpen) {
          setIsProModalOpen(false);
          openProModalBtnRef.current?.focus();
        }
        if (isBuyModalOpen) {
          setIsBuyModalOpen(false);
          openBuyModalBtnRef.current?.focus();
        }
        if (isDeactivateModalOpen) {
          setIsDeactivateModalOpen(false);
          openDeactivateBtnRef.current?.focus();
        }
        if (isEditLimitModalOpen) {
          setIsEditLimitModalOpen(false);
          openEditLimitBtnRef.current?.focus();
        }
        if (isAvisosSheetOpen) {
          setIsAvisosSheetOpen(false);
          openAvisosBtnRef.current?.focus();
        }
        if (isExtratoSheetOpen) {
          setIsExtratoSheetOpen(false);
          openExtratoBtnRef.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isSetupModalOpen,
    isProModalOpen,
    isBuyModalOpen,
    isDeactivateModalOpen,
    isEditLimitModalOpen,
    isAvisosSheetOpen,
    isExtratoSheetOpen,
  ]);

  const addrGroupId = useId();

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div ref={mainContentRef} className="flex flex-col h-full">

        {/* ── Status Bar Fixa ───────────────────────────────────────────────── */}
        <div className={`${isAutopilotActive ? "bg-[#0a4d31]" : "bg-[#0e6641]"} px-5 pt-3 pb-0 shrink-0 transition-colors duration-500`} aria-hidden="true">
          <div className="flex justify-between items-center text-white text-xs font-semibold">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <svg width="15" height="11" viewBox="0 0 15 11" fill="white"><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4" y="4.5" width="3" height="6.5" rx="0.5" /><rect x="8" y="2" width="3" height="9" rx="0.5" /><rect x="12" y="0" width="3" height="11" rx="0.5" /></svg>
              <svg width="15" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="white" /></svg>
              <svg width="22" height="12" viewBox="0 0 22 12" fill="white"><rect x="0" y="1" width="18" height="10" rx="2" fill="white" /><rect x="1" y="2" width="16" height="8" rx="1.5" fill={isAutopilotActive ? "#0a4d31" : "#0e6641"} /><rect x="1" y="2" width="14" height="8" rx="1.5" fill="white" /><rect x="18.5" y="4" width="2" height="4" rx="1" fill="white" /></svg>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: TAKEOVER (Piloto Automático Ativo)                                  */}
        {/* ========================================================================= */}
        {isAutopilotActive ? (
          <div
            className="flex-1 overflow-y-auto flex flex-col items-center bg-[#0a4d31] text-white px-5 pt-8 pb-28 transition-opacity duration-500"
            role="status"
            aria-live="assertive"
            aria-label="Piloto Automático Ativado. Monitorando a rede por energia barata."
          >
            {/* Pill Badge */}
            <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 mb-10 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" aria-hidden="true" />
              <p className="text-[0.8125rem] font-bold uppercase tracking-wider text-green-50">Piloto Automático Ativado</p>
            </div>

            {/* Radar Animation Centerpiece */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-8" aria-hidden="true">
              <div className="absolute inset-0 border-[3px] border-green-400/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-4 border-[2px] border-green-300/40 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
              <div className="absolute inset-8 border-[1px] border-green-200/50 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }} />
              <div className="relative w-20 h-20 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.5)] z-10 border-4 border-[#0a4d31]">
                <Bot size={36} className="text-[#0a4d31]" aria-hidden="true" />
              </div>
            </div>

            <h2 className="text-[1.25rem] font-bold text-center leading-snug mb-2">
              Monitorando a rede por<br/>energia barata...
            </h2>
            <p className="text-green-200 text-[0.875rem] text-center max-w-[16rem] leading-snug mb-8 opacity-90">
              Pode relaxar. Se encontrarmos um preço bom, compraremos para você.
            </p>

            {/* ── FEATURE 1: Real-Time Decision Log ─────────────────────────── */}
            <div className="w-full bg-white/8 border border-white/10 rounded-2xl p-4 mb-5">
              <p className="text-green-300 text-[0.6875rem] uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                <Clock size={11} aria-hidden="true" />
                O que o app está fazendo?
              </p>
              {/* aria-live="polite" — screen readers anunciam cada nova mensagem sem interromper */}
              <p
                aria-live="polite"
                role="status"
                className="text-white text-[0.9375rem] font-semibold leading-snug transition-opacity duration-400"
                style={{ opacity: logVisible ? 1 : 0, transition: "opacity 0.4s ease" }}
              >
                {logMessage}
              </p>
            </div>

            {/* ── Data Summary (com botão Editar no limite) ─────────────────── */}
            <div className="grid grid-cols-2 gap-3 w-full mb-6">
              {/* Limite Configurado + botão Editar */}
              <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <p className="text-green-200 text-[0.6875rem] uppercase tracking-widest font-semibold mb-1">Limite Config.</p>
                <p className="text-white text-[1.125rem] font-extrabold tabular-nums">R$ {setupLimit},00</p>
                {/* ── FEATURE 2: Quick Edit for Spend Limit ─────────────────── */}
                <button
                  ref={openEditLimitBtnRef}
                  onClick={() => {
                    setEditLimitDraft(setupLimit);
                    setIsEditLimitModalOpen(true);
                  }}
                  aria-haspopup="dialog"
                  className="mt-1.5 flex items-center gap-1 text-green-300 hover:text-green-100 text-[0.75rem] font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a4d31] rounded"
                >
                  <Pencil size={10} aria-hidden="true" />
                  Editar
                </button>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <p className="text-green-200 text-[0.6875rem] uppercase tracking-widest font-semibold mb-1">Comprado Hoje</p>
                <p className="text-white text-[1.125rem] font-extrabold tabular-nums">0 kWh</p>
              </div>
            </div>

            {/* ── FEATURE 3: Safe Navigation — Bottom Sheet triggers ─────────── */}
            <div className="flex gap-3 w-full mb-5">
              <button
                ref={openAvisosBtnRef}
                onClick={() => setIsAvisosSheetOpen(true)}
                aria-haspopup="dialog"
                className="flex-1 flex items-center justify-center gap-2 border border-white/25 text-green-100 hover:bg-white/10 font-semibold text-[0.875rem] py-3 rounded-2xl transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a4d31]"
              >
                <BellRing size={16} aria-hidden="true" />
                Ver meus Avisos
              </button>
              <button
                ref={openExtratoBtnRef}
                onClick={() => setIsExtratoSheetOpen(true)}
                aria-haspopup="dialog"
                className="flex-1 flex items-center justify-center gap-2 border border-white/25 text-green-100 hover:bg-white/10 font-semibold text-[0.875rem] py-3 rounded-2xl transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a4d31]"
              >
                <FileText size={16} aria-hidden="true" />
                Meu Extrato
              </button>
            </div>

            {/* Escape Route */}
            <button
              ref={openDeactivateBtnRef}
              onClick={() => setIsDeactivateModalOpen(true)}
              aria-haspopup="dialog"
              className="w-full border-2 border-red-500 text-red-100 hover:bg-red-500/10 hover:text-white font-bold text-[1.0625rem] py-4 rounded-2xl transition-all flex items-center justify-center gap-2
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a4d31]"
            >
              <PowerOff size={20} aria-hidden="true" />
              Desligar Piloto Automático
            </button>
          </div>
        ) : (
        /* ========================================================================= */
        /* VIEW 2: NORMAL HOME LITE                                                  */
        /* ========================================================================= */
          <>
            <div className="bg-[#0e6641] px-5 pb-4 shrink-0 transition-colors duration-500">
              <div className="flex justify-between items-center mt-3 pb-4">
                <div>
                  <p className="text-emerald-200 text-[0.8125rem] leading-tight">Que bom te ver por aqui.</p>
                  <h1 className="text-white text-[1.375rem] font-bold leading-tight">Olá, Sônia! 👋</h1>
                </div>
              </div>
            </div>

            <div className="bg-[#0e6641] px-5 pb-4 shrink-0 flex justify-end gap-3 -mt-16 pr-5 pointer-events-none">
              <button aria-label="Notificações" className="text-white opacity-90 hover:opacity-100 pointer-events-auto">
                <Bell size={22} aria-hidden="true" />
              </button>
              <button aria-label="Ajuda e suporte" className="text-white opacity-90 hover:opacity-100 pointer-events-auto">
                <HelpCircle size={22} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#f5f7f5] px-4 pt-4 pb-24 flex flex-col gap-4">
              
              {/* Saldo Card */}
              {cardVisible && (
                <div className="bg-[#0e6641] rounded-2xl p-4 relative shadow-md">
                  <button onClick={() => setCardVisible(false)} aria-label="Fechar card de saldo" className="absolute top-3 right-3 text-emerald-300 hover:text-white"><X size={18} aria-hidden="true" /></button>
                  <p className="text-emerald-300 text-[0.75rem] font-medium uppercase tracking-wide">Saldo de economia</p>
                  <p className="text-emerald-300 text-[0.75rem] font-medium">este mês</p>
                  <p className="text-white text-[2.375rem] font-extrabold leading-tight mt-1">R$ 45,60</p>
                  <p className="text-emerald-200 text-[0.8125rem] mt-1 leading-snug">Você economizou 12% em relação ao mês passado. Parabéns! 🎉</p>
                  <div className="mt-4 pt-3 border-t border-emerald-700 flex justify-between">
                    <div>
                      <p className="text-emerald-300 text-[0.6875rem]">Energia comprada</p>
                      <p className="text-white text-[0.9375rem] font-bold">128 kWh <span className="text-emerald-300 text-[0.6875rem] font-normal">este mês</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-300 text-[0.6875rem]">Preço médio pago</p>
                      <p className="text-white text-[0.9375rem] font-bold">R$ 0,68 <span className="text-emerald-300 text-[0.6875rem] font-normal">/kWh</span></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ações Principais */}
              <div>
                <p className="text-gray-500 text-[0.75rem] font-semibold uppercase tracking-wide mb-2">Ações principais</p>
                <Link
                  href="/comprar"
                  className="w-full bg-[#0e6641] hover:bg-[#0a5235] active:scale-[0.98] transition-all rounded-2xl px-5 py-4 flex items-center gap-4 shadow-md"
                >
                  <div className="shrink-0 bg-yellow-400 rounded-xl w-12 h-12 flex items-center justify-center"><Zap size={26} className="text-[#0e6641]" fill="currentColor" aria-hidden="true" /></div>
                  <div className="text-left">
                    <p className="text-white text-[1.0625rem] font-bold leading-tight">Comprar pacote<br/>de energia</p>
                    <p className="text-emerald-300 text-[0.75rem] mt-0.5">Rápido, seguro e sem cartão</p>
                  </div>
                </Link>
                <div className="flex gap-3 mt-3">
                  <Link href="/pacotes" className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm hover:shadow-md">
                    <div className="w-8 h-8 rounded-lg bg-[#f0f7f3] flex items-center justify-center shrink-0"><Package size={16} className="text-[#0e6641]" aria-hidden="true" /></div>
                    <span className="text-gray-800 text-[0.8125rem] font-semibold leading-tight">Ver meus<br/>pacotes</span>
                  </Link>
                  <button
                    ref={openProModalBtnRef}
                    onClick={() => setIsProModalOpen(true)}
                    aria-haspopup="dialog"
                    className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#fff8ed] flex items-center justify-center shrink-0"><ArrowLeftRight size={16} className="text-yellow-500" aria-hidden="true" /></div>
                    <span className="text-gray-800 text-[0.8125rem] font-semibold leading-tight">Vender minha<br/>energia</span>
                  </button>
                </div>
              </div>

              {/* Piloto Automático Card (Trigger do Setup) */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-500 text-[0.75rem] font-semibold uppercase tracking-wide">Deixe o app trabalhar por você</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <p className="text-gray-900 text-[0.9375rem] font-bold">Piloto Automático</p>
                    <button aria-label="Saiba mais sobre o Piloto Automático" className="text-gray-400 hover:text-gray-600"><Info size={14} aria-hidden="true" /></button>
                  </div>
                  
                  {/* Toggle aciona o Setup Modal */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-[0.75rem]" aria-hidden="true">Desligado</span>
                    <button
                      ref={toggleBtnRef}
                      role="switch"
                      aria-checked={false}
                      aria-label="Configurar Piloto Automático"
                      onClick={() => setIsSetupModalOpen(true)}
                      className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2"
                    >
                      <span className="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out translate-x-0" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 text-[0.75rem] mt-2 leading-snug">
                  Com o Piloto Automático, o app compra energia quando está mais barata e te avisa! <button className="text-[#0e6641] font-semibold underline">Saiba mais</button>
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Lite Bottom Nav ─────────────────────────────────────────────────── */}
      <LiteBottomNav />

      {/* ========================================================================= */}
      {/* MODAL 1: SETUP DO PILOTO AUTOMÁTICO                                       */}
      {/* ========================================================================= */}
      {isSetupModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="setup-modal-title"
          className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsSetupModalOpen(false); toggleBtnRef.current?.focus(); }} aria-hidden="true" />
          
          <div className="relative bg-white w-full sm:max-w-sm rounded-t-[2rem] sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 duration-300 ease-out flex flex-col max-h-[90vh]">
            <div className="w-full flex justify-center pt-3 pb-2 sm:hidden shrink-0" aria-hidden="true"><div className="w-12 h-1.5 bg-gray-200 rounded-full" /></div>
            
            <div className="px-6 pb-4 pt-2 flex justify-between items-center shrink-0 border-b border-gray-100">
              <h2 id="setup-modal-title" className="text-gray-900 text-[1.125rem] font-extrabold leading-tight">
                Configurar Piloto
              </h2>
              <button
                ref={setupCloseBtnRef}
                onClick={() => { setIsSetupModalOpen(false); toggleBtnRef.current?.focus(); }}
                className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] rounded-lg p-1"
                aria-label="Fechar"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto flex flex-col gap-8">
              {/* Step 1 — Endereço dinâmico do localStorage */}
              <fieldset>
                <legend className="text-gray-900 text-[1rem] font-bold mb-3">Para qual endereço deseja ligar?</legend>

                {savedAddresses.length === 0 ? (
                  // ── Empty State: nenhum endereço cadastrado ─────────────────
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <MapPin size={24} className="text-amber-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-amber-800 text-[0.9375rem] font-bold leading-tight mb-1">
                        Nenhum endereço cadastrado
                      </p>
                      <p className="text-amber-700 text-[0.8125rem] leading-snug">
                        Você precisa de um local para ativar o Piloto Automático.
                      </p>
                    </div>
                    <Link
                      href="/perfil/enderecos"
                      onClick={() => { setIsSetupModalOpen(false); toggleBtnRef.current?.focus(); }}
                      className="w-full bg-[#0e6641] hover:bg-[#0a5235] text-white font-bold text-[0.9375rem] py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2"
                    >
                      <Plus size={18} aria-hidden="true" />
                      Cadastrar Endereço
                    </Link>
                  </div>
                ) : (
                  // ── Lista dinâmica de endereços (grid compacto) ─────────────
                  <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby={addrGroupId}>
                    {savedAddresses.map((end) => (
                      <label
                        key={end.id}
                        className={`flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-2xl cursor-pointer transition-all border-2 text-center ${
                          setupAddress === end.id
                            ? "bg-green-50 text-[#0e6641] border-[#0e6641]"
                            : "text-gray-500 border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="setupAddress"
                          value={end.id}
                          checked={setupAddress === end.id}
                          onChange={() => setSetupAddress(end.id)}
                          className="sr-only"
                        />
                        <Home size={24} aria-hidden="true" />
                        <span className="text-[0.8125rem] font-bold leading-tight">{end.apelido}</span>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>

              {/* Step 2 */}
              <fieldset>
                <legend className="text-gray-900 text-[1rem] font-bold mb-3">Qual o seu limite de gastos mensal?</legend>
                <p className="text-gray-500 text-[0.8125rem] mb-4 -mt-2">O app comprará energia nos horários mais baratos até atingir este valor.</p>
                <div className="flex flex-wrap gap-2">
                  {[50, 100, 200].map((val) => (
                    <label key={val} className={`flex-1 py-3 px-1 rounded-xl cursor-pointer transition-all border-2 text-center
                      ${setupLimit === val ? "bg-[#0e6641] text-white border-[#0e6641]" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}
                    >
                      <input type="radio" name="setupLimit" value={val} checked={setupLimit === val} onChange={() => setSetupLimit(val)} className="sr-only" />
                      <span className="text-[0.9375rem] font-extrabold">R$ {val}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="px-6 pb-8 pt-4 shrink-0 border-t border-gray-100">
              {/* Botão desabilitado se não há endereços ou nenhum selecionado */}
              <button
                onClick={handleActivateAutopilot}
                disabled={savedAddresses.length === 0 || !setupAddress}
                aria-disabled={savedAddresses.length === 0 || !setupAddress}
                className="w-full bg-[#0e6641] hover:bg-[#0a5235] text-white font-bold text-[1.0625rem] py-4 rounded-2xl active:scale-[0.98] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <CheckCircle2 size={20} aria-hidden="true" />
                Ativar Piloto Automático
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MODO PRO (Transição Educativa)                                   */}
      {/* ========================================================================= */}
      {isProModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pro-modal-title"
          aria-describedby="pro-modal-desc"
          className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsProModalOpen(false); openProModalBtnRef.current?.focus(); }} aria-hidden="true" />
          <div className="relative bg-white w-full sm:max-w-sm rounded-t-[2rem] sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 duration-300 ease-out">
            <div className="w-full flex justify-center pt-3 pb-2 sm:hidden" aria-hidden="true"><div className="w-12 h-1.5 bg-gray-200 rounded-full" /></div>
            <div className="px-6 pb-8 pt-4 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-50 border-4 border-yellow-100 flex items-center justify-center mb-5 mt-2 shadow-inner">
                <Sun size={40} className="text-yellow-500" aria-hidden="true" fill="currentColor" />
              </div>
              <h2 id="pro-modal-title" className="text-gray-900 text-[1.375rem] font-extrabold leading-tight mb-3">Você gera sua própria energia?</h2>
              <p id="pro-modal-desc" className="text-gray-500 text-[0.9375rem] leading-snug mb-8">Para vender sua energia, preparamos o <strong className="text-gray-800">Modo Pro</strong>: um painel avançado exclusivo para quem possui painéis solares ou fazendas de energia.</p>
              <div className="flex flex-col gap-3 w-full">
                <Link href="/pro" ref={proModalCloseBtnRef} onClick={() => setIsProModalOpen(false)} className="w-full flex items-center justify-center bg-[#0e6641] text-white font-bold text-[1.0625rem] py-4 rounded-2xl active:scale-[0.98] transition-all shadow-sm">Sim, ir para o Modo Pro</Link>
                <button onClick={() => { setIsProModalOpen(false); openProModalBtnRef.current?.focus(); }} className="w-full text-gray-500 font-bold text-[0.9375rem] py-3 rounded-2xl hover:bg-gray-50 transition-all">Ainda não, apenas comprar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buy (legado) */}
      {isBuyModalOpen && (
        <div role="dialog" aria-modal="true" className="absolute inset-0 z-50 flex items-center justify-center px-5 bg-black/60 backdrop-blur-sm" onClick={() => setIsBuyModalOpen(false)}>
           <div className="bg-white rounded-3xl w-full p-6 text-center shadow-2xl">
              <button ref={buyModalCloseBtnRef} onClick={()=>setIsBuyModalOpen(false)} className="absolute top-4 right-4 text-gray-500"><X/></button>
              <h2 className="font-bold">Modal de exemplo</h2>
           </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRMAÇÃO PARA DESLIGAR O PILOTO AUTOMÁTICO                    */}
      {/* ========================================================================= */}
      {isDeactivateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-modal-title"
          aria-describedby="deactivate-modal-desc"
          className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsDeactivateModalOpen(false); openDeactivateBtnRef.current?.focus(); }} aria-hidden="true" />
          
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-end px-5 pt-5">
              <button
                ref={deactivateCloseBtnRef}
                onClick={() => { setIsDeactivateModalOpen(false); openDeactivateBtnRef.current?.focus(); }}
                className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg p-1"
                aria-label="Cancelar"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <div className="px-6 pb-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
                <AlertTriangle size={32} className="text-red-500" fill="currentColor" aria-hidden="true" />
              </div>

              <h2 id="deactivate-modal-title" className="text-gray-900 text-[1.25rem] font-bold leading-snug mb-2">
                Desligar Piloto Automático?
              </h2>

              <p id="deactivate-modal-desc" className="text-gray-500 text-[0.875rem] leading-snug mb-6">
                O app deixará de monitorar os preços e você poderá perder as melhores oportunidades de compra de energia.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => { setIsDeactivateModalOpen(false); openDeactivateBtnRef.current?.focus(); }}
                  className="flex-1 border-2 border-gray-200 text-gray-700 font-bold text-[0.9375rem] py-3.5 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setIsDeactivateModalOpen(false);
                    handleDeactivateAutopilot();
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-[0.9375rem] py-3.5 rounded-2xl shadow-md active:scale-[0.98] transition-all"
                >
                  Sim, Desligar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL FEATURE 2: EDITAR LIMITE DE GASTOS (sem desligar o piloto)          */}
      {/* ========================================================================= */}
      {isEditLimitModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-limit-modal-title"
          aria-describedby="edit-limit-modal-desc"
          className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsEditLimitModalOpen(false); openEditLimitBtnRef.current?.focus(); }} aria-hidden="true" />

          <div className="relative bg-white w-full sm:max-w-sm rounded-t-[2rem] sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 duration-300 ease-out flex flex-col">
            <div className="w-full flex justify-center pt-3 pb-2 sm:hidden shrink-0" aria-hidden="true"><div className="w-12 h-1.5 bg-gray-200 rounded-full" /></div>

            <div className="px-6 pb-4 pt-2 flex justify-between items-center shrink-0 border-b border-gray-100">
              <h2 id="edit-limit-modal-title" className="text-gray-900 text-[1.125rem] font-extrabold leading-tight">
                Editar Limite Mensal
              </h2>
              <button
                ref={editLimitCloseBtnRef}
                onClick={() => { setIsEditLimitModalOpen(false); openEditLimitBtnRef.current?.focus(); }}
                className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] rounded-lg p-1"
                aria-label="Fechar"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <div className="px-6 py-6 flex flex-col gap-5">
              <p id="edit-limit-modal-desc" className="text-gray-500 text-[0.875rem] leading-snug">
                Escolha o novo limite mensal. O Piloto Automático continuará rodando com o novo valor imediatamente.
              </p>

              <fieldset>
                <legend className="text-gray-900 text-[0.9375rem] font-bold mb-3">Novo limite de gastos:</legend>
                <div className="flex flex-wrap gap-2">
                  {[50, 100, 200].map((val) => (
                    <label key={val} className={`flex-1 py-4 px-1 rounded-xl cursor-pointer transition-all border-2 text-center
                      ${editLimitDraft === val ? "bg-[#0e6641] text-white border-[#0e6641]" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}
                    >
                      <input type="radio" name="editLimit" value={val} checked={editLimitDraft === val} onChange={() => setEditLimitDraft(val)} className="sr-only" />
                      <span className="text-[1rem] font-extrabold">R$ {val}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Confirmed value preview */}
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-green-800 text-[0.875rem] font-semibold">Novo limite selecionado:</span>
                <span className="text-[#0e6641] text-[1.0625rem] font-extrabold">R$ {editLimitDraft},00</span>
              </div>
            </div>

            <div className="px-6 pb-8 pt-2 shrink-0 border-t border-gray-100">
              <button
                onClick={handleSaveEditLimit}
                className="w-full bg-[#0e6641] hover:bg-[#0a5235] text-white font-bold text-[1.0625rem] py-4 rounded-2xl active:scale-[0.98] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} aria-hidden="true" />
                Salvar e continuar monitorando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM SHEET FEATURE 3A: AVISOS                                           */}
      {/* ========================================================================= */}
      {isAvisosSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="avisos-sheet-title"
          className="absolute inset-0 z-50 flex items-end justify-center animate-in fade-in duration-200"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsAvisosSheetOpen(false); openAvisosBtnRef.current?.focus(); }} aria-hidden="true" />

          <div className="relative bg-white w-full sm:max-w-md rounded-t-[2rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-300 ease-out flex flex-col max-h-[80vh]">
            <div className="w-full flex justify-center pt-3 pb-2 shrink-0" aria-hidden="true"><div className="w-12 h-1.5 bg-gray-200 rounded-full" /></div>

            <div className="px-6 pb-4 pt-2 flex justify-between items-center shrink-0 border-b border-gray-100">
              <h2 id="avisos-sheet-title" className="text-gray-900 text-[1.125rem] font-extrabold flex items-center gap-2">
                <BellRing size={20} className="text-[#0e6641]" aria-hidden="true" />
                Meus Avisos
              </h2>
              <button
                ref={avisosCloseBtnRef}
                onClick={() => { setIsAvisosSheetOpen(false); openAvisosBtnRef.current?.focus(); }}
                className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] rounded-lg p-1"
                aria-label="Fechar avisos"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <ul className="px-6 py-4 overflow-y-auto flex flex-col gap-3 pb-8" role="list" aria-label="Lista de avisos">
              {MOCKED_AVISOS.map((aviso) => (
                <li key={aviso.id} className="flex gap-3 items-start bg-gray-50 rounded-2xl p-4">
                  <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5 ${aviso.tipo === "alerta" ? "bg-yellow-100" : "bg-green-100"}`}>
                    {aviso.tipo === "alerta"
                      ? <AlertTriangle size={18} className="text-yellow-600" aria-hidden="true" />
                      : <CheckCircle2 size={18} className="text-green-600" aria-hidden="true" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-[0.9375rem] font-bold leading-tight">{aviso.titulo}</p>
                    <p className="text-gray-500 text-[0.8125rem] leading-snug mt-0.5">{aviso.descricao}</p>
                    <p className="text-gray-400 text-[0.6875rem] mt-1.5 flex items-center gap-1">
                      <Clock size={10} aria-hidden="true" />
                      {aviso.tempo}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM SHEET FEATURE 3B: EXTRATO                                          */}
      {/* ========================================================================= */}
      {isExtratoSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="extrato-sheet-title"
          className="absolute inset-0 z-50 flex items-end justify-center animate-in fade-in duration-200"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsExtratoSheetOpen(false); openExtratoBtnRef.current?.focus(); }} aria-hidden="true" />

          <div className="relative bg-white w-full sm:max-w-md rounded-t-[2rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-300 ease-out flex flex-col max-h-[80vh]">
            <div className="w-full flex justify-center pt-3 pb-2 shrink-0" aria-hidden="true"><div className="w-12 h-1.5 bg-gray-200 rounded-full" /></div>

            <div className="px-6 pb-4 pt-2 flex justify-between items-center shrink-0 border-b border-gray-100">
              <h2 id="extrato-sheet-title" className="text-gray-900 text-[1.125rem] font-extrabold flex items-center gap-2">
                <FileText size={20} className="text-[#0e6641]" aria-hidden="true" />
                Meu Extrato
              </h2>
              <button
                ref={extratoCloseBtnRef}
                onClick={() => { setIsExtratoSheetOpen(false); openExtratoBtnRef.current?.focus(); }}
                className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] rounded-lg p-1"
                aria-label="Fechar extrato"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            {/* Saldo resumido */}
            <div className="px-6 pt-4 pb-3 shrink-0 bg-gray-50 border-b border-gray-100">
              <p className="text-gray-500 text-[0.75rem] uppercase tracking-wide font-semibold mb-0.5">Saldo disponível</p>
              <p className="text-[#0e6641] text-[1.75rem] font-extrabold leading-tight">R$ 40,84</p>
              <p className="text-gray-400 text-[0.75rem] mt-0.5">Referente a junho/2025</p>
            </div>

            <ul className="px-6 py-4 overflow-y-auto flex flex-col divide-y divide-gray-100 pb-8" role="list" aria-label="Histórico de transações">
              {MOCKED_EXTRATO.map((item) => (
                <li key={item.id} className="flex justify-between items-center py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${item.valor < 0 ? "bg-red-50" : "bg-green-50"}`}>
                      {item.valor < 0
                        ? <Zap size={17} className="text-red-400" aria-hidden="true" />
                        : <CheckCircle2 size={17} className="text-green-500" aria-hidden="true" />
                      }
                    </div>
                    <div>
                      <p className="text-gray-900 text-[0.9375rem] font-semibold leading-tight">{item.descricao}</p>
                      <p className="text-gray-400 text-[0.75rem]">
                        {item.data}{item.kwh > 0 ? ` · ${item.kwh} kWh` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[0.9375rem] font-extrabold tabular-nums ${item.valor < 0 ? "text-gray-800" : "text-green-600"}`}>
                    {item.valor < 0
                      ? `- R$ ${Math.abs(item.valor).toFixed(2).replace(".", ",")}`
                      : `+ R$ ${item.valor.toFixed(2).replace(".", ",")}`
                    }
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}
