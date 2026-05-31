// WCAG 2.2 — Tela Home Lite com Takeover de Piloto Automático
// Critérios cobertos:
//   1.1.1 Non-text Content   — aria-hidden em ícones decorativos
//   1.3.1 Info and Relationships — fieldsets para o modal de setup
//   2.1.1 Keyboard           — focus trap via atributo `inert` nos modais
//   2.4.3 Focus Order        — foco retorna ao botão de origem ao fechar
//   4.1.2 Name, Role, Value  — role="dialog" e role="switch"
//   4.1.3 Status Messages    — aria-live="assertive" no takeover de tela
"use client";

import { useState, useRef, useEffect, useId } from "react";
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
  Waves,
  Bot,
  CheckCircle2,
  PowerOff
} from "lucide-react";
import { LiteBottomNav } from "@/components/LiteBottomNav";

export default function HomeSimplificada() {
  const router = useRouter();

  // ── Estados Principais ───────────────────────────────────────────────────────
  const [isAutopilotActive, setIsAutopilotActive] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [cardVisible, setCardVisible] = useState(true);

  // Estados do Setup do Piloto
  const [setupAddress, setSetupAddress] = useState("casa");
  const [setupLimit, setSetupLimit] = useState(100);

  // Refs de Acessibilidade
  const mainContentRef = useRef<HTMLDivElement>(null);
  const setupCloseBtnRef = useRef<HTMLButtonElement>(null);
  const proModalCloseBtnRef = useRef<HTMLAnchorElement>(null);
  const buyModalCloseBtnRef = useRef<HTMLButtonElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const openProModalBtnRef = useRef<HTMLButtonElement>(null);
  const openBuyModalBtnRef = useRef<HTMLButtonElement>(null);
  const deactivateCloseBtnRef = useRef<HTMLButtonElement>(null);
  const openDeactivateBtnRef = useRef<HTMLButtonElement>(null);

  // ── Persistência de Estado (Piloto Automático) ──────────────────────────────
  useEffect(() => {
    try {
      const active = localStorage.getItem("fluxo_autopilot_state") === "true";
      setIsAutopilotActive(active);
    } catch {}
  }, []);

  function handleActivateAutopilot() {
    setIsAutopilotActive(true);
    setIsSetupModalOpen(false);
    try {
      localStorage.setItem("fluxo_autopilot_state", "true");
    } catch {}
    // Retorna foco ao botão de desligar quando a tela for substituída
  }

  function handleDeactivateAutopilot() {
    setIsAutopilotActive(false);
    try {
      localStorage.setItem("fluxo_autopilot_state", "false");
    } catch {}
  }

  // ── Focus Trap (Inert) ──────────────────────────────────────────────────────
  const isAnyModalOpen = isSetupModalOpen || isProModalOpen || isBuyModalOpen || isDeactivateModalOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
      if (mainContentRef.current) mainContentRef.current.setAttribute("inert", "");
      const timeout = setTimeout(() => {
        if (isSetupModalOpen) setupCloseBtnRef.current?.focus();
        if (isProModalOpen) proModalCloseBtnRef.current?.focus();
        if (isBuyModalOpen) buyModalCloseBtnRef.current?.focus();
        if (isDeactivateModalOpen) deactivateCloseBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      if (mainContentRef.current) mainContentRef.current.removeAttribute("inert");
    }
  }, [isAnyModalOpen, isSetupModalOpen, isProModalOpen, isBuyModalOpen, isDeactivateModalOpen]);

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
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSetupModalOpen, isProModalOpen, isBuyModalOpen, isDeactivateModalOpen]);

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
            className="flex-1 overflow-y-auto flex flex-col items-center bg-[#0a4d31] text-white px-5 pt-8 pb-24 transition-opacity duration-500"
            role="status"
            aria-live="assertive"
            aria-label="Piloto Automático Ativado. Monitorando a rede por energia barata."
          >
            <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 mb-12 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" aria-hidden="true" />
              <p className="text-[0.8125rem] font-bold uppercase tracking-wider text-green-50">Piloto Automático Ativado</p>
            </div>

            {/* Radar Animation Centerpiece */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-10">
              <div className="absolute inset-0 border-[3px] border-green-400/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} aria-hidden="true" />
              <div className="absolute inset-4 border-[2px] border-green-300/40 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} aria-hidden="true" />
              <div className="absolute inset-8 border-[1px] border-green-200/50 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }} aria-hidden="true" />
              
              <div className="relative w-20 h-20 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.5)] z-10 border-4 border-[#0a4d31]">
                <Bot size={36} className="text-[#0a4d31]" aria-hidden="true" />
              </div>
            </div>

            <h2 className="text-[1.25rem] font-bold text-center leading-snug mb-2">
              Monitorando a rede por<br/>energia barata...
            </h2>
            <p className="text-green-200 text-[0.875rem] text-center max-w-[16rem] leading-snug mb-10 opacity-90">
              Pode relaxar. Se encontrarmos um preço bom, compraremos para você.
            </p>

            {/* Data Summary */}
            <div className="grid grid-cols-2 gap-3 w-full mb-auto">
              <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <p className="text-green-200 text-[0.6875rem] uppercase tracking-widest font-semibold mb-1">Limite Config.</p>
                <p className="text-white text-[1.125rem] font-extrabold tabular-nums">R$ {setupLimit},00</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <p className="text-green-200 text-[0.6875rem] uppercase tracking-widest font-semibold mb-1">Comprado Hoje</p>
                <p className="text-white text-[1.125rem] font-extrabold tabular-nums">0 kWh</p>
              </div>
            </div>

            {/* Escape Route */}
            <button
              ref={openDeactivateBtnRef}
              onClick={() => setIsDeactivateModalOpen(true)}
              aria-haspopup="dialog"
              className="w-full border-2 border-red-500 text-red-100 hover:bg-red-500/10 hover:text-white font-bold text-[1.0625rem] py-4 rounded-2xl transition-all mt-8 flex items-center justify-center gap-2
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
                  
                  {/* Toggle aciona o Setup Modal agora em vez de ligar direto */}
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
              {/* Step 1 */}
              <fieldset>
                <legend className="text-gray-900 text-[1rem] font-bold mb-3">Para qual endereço deseja ligar?</legend>
                <div className="flex gap-2" role="group" aria-labelledby={addrGroupId}>
                  {[
                    { id: "casa", label: "Minha Casa", icon: Home },
                    { id: "praia", label: "Casa da Praia", icon: Waves }
                  ].map(({ id, label, icon: Icon }) => (
                    <label key={id} className={`flex-1 flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl cursor-pointer transition-all border-2
                      ${setupAddress === id ? "bg-green-50 text-[#0e6641] border-[#0e6641]" : "text-gray-500 border-gray-200 hover:border-gray-300"}`}
                    >
                      <input type="radio" name="setupAddress" value={id} checked={setupAddress === id} onChange={() => setSetupAddress(id)} className="sr-only" />
                      <Icon size={24} aria-hidden="true" />
                      <span className="text-[0.8125rem] font-bold text-center leading-tight">{label}</span>
                    </label>
                  ))}
                </div>
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
              <button
                onClick={handleActivateAutopilot}
                className="w-full bg-[#0e6641] hover:bg-[#0a5235] text-white font-bold text-[1.0625rem] py-4 rounded-2xl active:scale-[0.98] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2 flex items-center justify-center gap-2"
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

      {/* Modal 3 legadão caso exista (isBuyModalOpen estava solto) */}
      {isBuyModalOpen && (
        <div role="dialog" aria-modal="true" className="absolute inset-0 z-50 flex items-center justify-center px-5 bg-black/60 backdrop-blur-sm" onClick={() => setIsBuyModalOpen(false)}>
           <div className="bg-white rounded-3xl w-full p-6 text-center shadow-2xl">
              <button ref={buyModalCloseBtnRef} onClick={()=>setIsBuyModalOpen(false)} className="absolute top-4 right-4 text-gray-500"><X/></button>
              <h2 className="font-bold">Modal de exemplo</h2>
           </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRMAÇÃO PARA DESLIGAR O PILOTO AUTOMÁTICO                    */}
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

    </div>
  );
}
