// WCAG 2.2 — Tela Perfil (Modo Lite)
// Critérios cobertos:
//   1.1.1 Non-text Content   — ícones decorativos com aria-hidden; avatar com aria-label
//   1.3.1 Info and Relationships — lista semântica <ul>/<li>; role="dialog" no modal
//   1.4.4 Resize Text        — tipografia em rem (classes Tailwind relativas)
//   2.1.1 Keyboard           — focus trap no modal via atributo `inert`; ESC fecha modal
//   2.4.3 Focus Order        — foco retorna ao botão "Alterar Chave" ao fechar modal
//   2.4.6 Headings and Labels — <h1> único + aria-label descritivos
//   2.4.8 Location           — aria-current="page" na tab "Perfil" da nav
//   4.1.2 Name, Role, Value  — role="dialog" + aria-modal + aria-labelledby + aria-describedby
//   4.1.3 Status Messages    — aria-live="polite" no feedback de sucesso do modal
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  ClipboardList,
  Bell,
  User,
  Key,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { LiteBottomNav } from "@/components/LiteBottomNav";

// ── Dados mockados do usuário ──────────────────────────────────────────────────
const MOCK_USER = {
  name: "Sônia Silva",
  initials: "SS",
  phone: "(11) 9 8765-4321",
  email: "sonia.silva@email.com",
  pixKey: "***.456.789-**",      // CPF mascarado
  pixKeyType: "CPF",
  memberSince: "Março de 2024",
};

// ── Links secundários ──────────────────────────────────────────────────────────
const QUICK_LINKS = [
  {
    id: "ajuda",
    label: "Ajuda e Suporte",
    description: "Tire suas dúvidas conosco",
    icon: HelpCircle,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: "termos",
    label: "Termos de Uso",
    description: "Leia as condições do serviço",
    icon: FileText,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
  },
  {
    id: "privacidade",
    label: "Política de Privacidade",
    description: "Como usamos seus dados",
    icon: Shield,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
  },
];

// ── Componente: Status Bar (decorativa) ───────────────────────────────────────
function StatusBar({ bgColor }: { bgColor: string }) {
  return (
    // WCAG 1.1.1: status bar é decorativa — aria-hidden="true"
    <div className={`${bgColor} px-5 pt-3 pb-0 shrink-0`} aria-hidden="true">
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
            <rect x="1" y="2" width="16" height="8" rx="1.5" fill="#0e6641" />
            <rect x="1" y="2" width="14" height="8" rx="1.5" fill="white" />
            <rect x="18.5" y="4" width="2" height="4" rx="1" fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Página Principal ──────────────────────────────────────────────────────────
export default function PerfilLite() {
  const router = useRouter();

  // ── Estado da chave PIX ────────────────────────────────────────────────────
  const [pixKey, setPixKey] = useState(MOCK_USER.pixKey);
  const [pixInput, setPixInput] = useState("");
  const [pixSuccessMsg, setPixSuccessMsg] = useState("");

  // ── Estado do modal PIX ────────────────────────────────────────────────────
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);

  // ── Refs para focus management (WCAG 2.4.3) ────────────────────────────────
  // Botão que abre o modal — receberá o foco de volta ao fechar
  const openPixModalBtnRef = useRef<HTMLButtonElement>(null);
  // Botão "Fechar" do modal — recebe o foco inicial ao abrir
  const modalCloseBtnRef = useRef<HTMLButtonElement>(null);
  // Conteúdo de fundo — receberá `inert` enquanto modal estiver aberto
  const mainContentRef = useRef<HTMLDivElement>(null);

  // ── Focus Trap via `inert` (WCAG 2.1.1 / 2.4.3) ───────────────────────────
  useEffect(() => {
    if (isPixModalOpen) {
      mainContentRef.current?.setAttribute("inert", "");
      const timeout = setTimeout(() => {
        modalCloseBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      mainContentRef.current?.removeAttribute("inert");
      // Devolve o foco ao botão que abriu o modal
      openPixModalBtnRef.current?.focus();
    }
  }, [isPixModalOpen]);

  // ── Fechar com ESC (WCAG 2.1.1) ───────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPixModalOpen) {
        closePixModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPixModalOpen]);

  function openPixModal() {
    setPixInput("");
    setPixSuccessMsg("");
    setIsPixModalOpen(true);
  }

  function closePixModal() {
    setPixInput("");
    setPixSuccessMsg("");
    setIsPixModalOpen(false);
  }

  function handleSavePixKey() {
    const trimmed = pixInput.trim();
    if (!trimmed) return;
    setPixKey(trimmed);
    setPixSuccessMsg("Chave PIX atualizada com sucesso!");
    // Fecha o modal após 1.5s para o usuário ler a confirmação
    setTimeout(() => {
      setIsPixModalOpen(false);
    }, 1500);
  }

  return (
    // WCAG 1.4.4: toda tipografia em rem via Tailwind
    <div className="flex flex-col h-full bg-white">

      {/* ── Conteúdo principal (recebe `inert` enquanto modal aberto) ─── */}
      <div ref={mainContentRef} className="flex flex-col h-full">

        {/* ── Status Bar ──────────────────────────────────────────────── */}
        <StatusBar bgColor="bg-[#0e6641]" />

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="bg-[#0e6641] px-5 pt-4 pb-6 shrink-0">
          <div className="flex items-center justify-between">
            {/* Botão Voltar — AGENTS.md: useRouter().back() */}
            <button
              id="btn-voltar-perfil"
              aria-label="Voltar para a tela anterior"
              onClick={() => router.back()}
              className="text-white opacity-80 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e6641] rounded-lg p-1"
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </button>

            {/* WCAG 1.3.1 / 2.4.6: único <h1> da página */}
            <h1 className="text-white text-[1.125rem] font-bold">
              Meu Perfil
            </h1>

            {/* Espaço para alinhar o título ao centro */}
            <div className="w-8" aria-hidden="true" />
          </div>

          {/* ── Avatar + Nome + Contato ────────────────────────────────── */}
          <div className="flex flex-col items-center mt-5 pb-2">
            {/* Avatar com iniciais — WCAG 1.1.1: aria-label descreve o conteúdo */}
            <div
              className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg mb-3"
              role="img"
              aria-label={`Foto de perfil de ${MOCK_USER.name}`}
            >
              <span
                className="text-[#0e6641] text-[1.875rem] font-extrabold leading-none"
                aria-hidden="true"
              >
                {MOCK_USER.initials}
              </span>
            </div>

            <p className="text-white text-[1.125rem] font-bold leading-tight">
              {MOCK_USER.name}
            </p>
            <p className="text-emerald-200 text-[0.8125rem] mt-1">
              {MOCK_USER.phone}
            </p>
            <p className="text-emerald-300 text-[0.6875rem] mt-0.5">
              Membro desde {MOCK_USER.memberSince}
            </p>
          </div>
        </header>

        {/* ── Conteúdo Scrollável ──────────────────────────────────────── */}
        <main
          id="perfil-conteudo"
          className="flex-1 overflow-y-auto bg-[#f5f7f5] px-4 pt-5 pb-28 flex flex-col gap-4"
        >

          {/* ── Card: Chave PIX ──────────────────────────────────────── */}
          {/* Seção mais importante — destaque visual máximo */}
          <section aria-labelledby="pix-titulo">
            <h2
              id="pix-titulo"
              className="text-gray-400 text-[0.75rem] font-semibold uppercase tracking-widest mb-2 px-1"
            >
              Pagamentos e Recebimentos
            </h2>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4">
                {/* Ícone + info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    {/* WCAG 1.1.1: ícone decorativo */}
                    <Key size={20} className="text-[#0e6641]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-[0.9375rem] font-bold leading-tight">
                      Chave PIX
                    </p>
                    <p className="text-gray-400 text-[0.75rem] mt-0.5">
                      Usada para receber e pagar energia
                    </p>
                  </div>
                </div>

                {/* Chave atual */}
                <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 border border-gray-100">
                  <p className="text-gray-500 text-[0.6875rem] font-semibold uppercase tracking-wide mb-1">
                    Chave atual ({MOCK_USER.pixKeyType})
                  </p>
                  {/* aria-label com valor legível para leitores de tela */}
                  <p
                    className="text-gray-900 text-[1rem] font-bold tabular-nums tracking-wide"
                    aria-label={`Chave PIX atual: ${pixKey}`}
                  >
                    {pixKey}
                  </p>
                </div>

                {/* Botão Alterar Chave
                    WCAG 2.4.3: ref para restaurar foco após fechar modal */}
                <button
                  id="btn-alterar-pix"
                  ref={openPixModalBtnRef}
                  onClick={openPixModal}
                  aria-haspopup="dialog"
                  className="w-full bg-[#0e6641] hover:bg-[#0a5235] active:scale-[0.98] transition-all text-white font-bold text-[0.9375rem] py-3.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2"
                >
                  Alterar Chave PIX
                </button>
              </div>
            </div>
          </section>

          {/* ── Card: Endereços e Locais ────────────────────────────── */}
          <section aria-labelledby="enderecos-titulo">
            <h2
              id="enderecos-titulo"
              className="text-gray-400 text-[0.75rem] font-semibold uppercase tracking-widest mb-2 px-1"
            >
              Endereços e Locais
            </h2>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <Link
                href="/perfil/enderecos"
                aria-label="Gerenciar meus endereços"
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0e6641]"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Home size={20} className="text-orange-500" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0" aria-hidden="true">
                  <p className="text-gray-900 text-[0.9375rem] font-bold leading-tight">
                    Meus Endereços
                  </p>
                  <p className="text-gray-400 text-[0.75rem] mt-0.5 truncate">
                    Gerenciar casas, sítios ou empresas
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-300 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </section>

          {/* ── Card: Links Rápidos ─────────────────────────────────── */}
          <section aria-labelledby="config-titulo">
            <h2
              id="config-titulo"
              className="text-gray-400 text-[0.75rem] font-semibold uppercase tracking-widest mb-2 px-1"
            >
              Informações e Suporte
            </h2>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* WCAG 1.3.1: lista semântica de ações */}
              <ul aria-label="Links de informações e suporte">
                {QUICK_LINKS.map(({ id, label, description, icon: Icon, iconBg, iconColor }, index) => (
                  <li
                    key={id}
                    className={index < QUICK_LINKS.length - 1 ? "border-b border-gray-100" : ""}
                  >
                    {/* Botão semântico — nunca <div> com onClick (AGENTS.md) */}
                    <button
                      id={`btn-${id}`}
                      aria-label={`${label}: ${description}`}
                      className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0e6641]"
                    >
                      {/* Ícone — WCAG 1.1.1: decorativo, aria-label está no botão */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                        <Icon size={18} className={iconColor} aria-hidden="true" />
                      </div>

                      {/* Texto */}
                      <div className="flex-1 min-w-0" aria-hidden="true">
                        <p className="text-gray-900 text-[0.9375rem] font-semibold leading-tight">
                          {label}
                        </p>
                        <p className="text-gray-400 text-[0.75rem] mt-0.5 truncate">
                          {description}
                        </p>
                      </div>

                      {/* Chevron decorativo */}
                      <ChevronRight size={16} className="text-gray-300 shrink-0" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Botão Sair ────────────────────────────────────────────── */}
          {/* Visualmente separado — ação destrutiva requer atenção visual */}
          <section aria-label="Sair do aplicativo">
            <button
              id="btn-sair"
              aria-label="Sair do aplicativo Fluxo"
              className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-500 hover:bg-red-50 active:scale-[0.98] transition-all font-bold text-[0.9375rem] py-4 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
            >
              <LogOut size={18} aria-hidden="true" />
              Sair do aplicativo
            </button>
          </section>

          {/* Versão do app — informação contextual discreta */}
          <p
            className="text-center text-gray-300 text-[0.6875rem] pt-2"
            aria-label="Versão do aplicativo: 1.0.0 beta"
          >
            Fluxo v1.0.0 beta
          </p>
        </main>
      </div>
      {/* ── Fim do conteúdo principal (inert) ─────────────────────────── */}

      {/* ── Bottom Navigation ─────────────────────────────────────────── */}
      {/* IMPORTANTE: fora do div ref={mainContentRef} para nunca receber `inert`.
          WCAG 2.4.8: <nav> semântico + aria-current="page" no item ativo.
          AGENTS.md: <Link> para rotas reais; aria-current fixo em "perfil" nesta página. */}
      <LiteBottomNav />

      {/* ── Modal: Alterar Chave PIX ────────────────────────────────────────
          WCAG 2.1.1 / 2.4.3: foco gerenciado via useEffect + inert.
          O mainContentRef recebe `inert` ao abrir — Tab não sai do modal.
          WCAG 1.3.1 / 4.1.2: role="dialog" + aria-modal + aria-labelledby
          + aria-describedby tornam o modal legível para screen readers. */}
      {isPixModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pix-modal-titulo"
          aria-describedby="pix-modal-desc"
          className="absolute inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
          onClick={(e) => {
            // Fecha ao clicar no backdrop (WCAG 2.1.1)
            if (e.target === e.currentTarget) closePixModal();
          }}
        >
          {/* Bottom Sheet — mais amigável para usuários mobile como Sônia */}
          <div className="bg-white rounded-t-3xl w-full max-w-[400px] shadow-2xl overflow-hidden">

            {/* Handle visual + botão fechar */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              {/* Handle decorativo */}
              <div className="w-8 h-1 rounded-full bg-gray-200 mx-auto" aria-hidden="true" />
              {/* Botão fechar — recebe o foco inicial (ref) */}
              <button
                ref={modalCloseBtnRef}
                aria-label="Fechar modal de alteração de chave PIX"
                onClick={closePixModal}
                className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] rounded-lg p-1"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            {/* Conteúdo do modal */}
            <div className="px-5 pb-8">
              {/* Ícone de contexto */}
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                <Key size={28} className="text-[#0e6641]" aria-hidden="true" />
              </div>

              {/* Título — referenciado por aria-labelledby */}
              <h2
                id="pix-modal-titulo"
                className="text-gray-900 text-[1.125rem] font-bold leading-snug mb-1"
              >
                Alterar Chave PIX
              </h2>

              {/* Descrição — referenciada por aria-describedby */}
              <p
                id="pix-modal-desc"
                className="text-gray-500 text-[0.875rem] leading-snug mb-5"
              >
                Digite sua nova chave. Pode ser CPF, e-mail, telefone ou chave aleatória.
              </p>

              {/* Campo de entrada */}
              <label
                htmlFor="input-nova-pix"
                className="block text-gray-700 text-[0.875rem] font-semibold mb-2"
              >
                Nova chave PIX
              </label>
              <input
                id="input-nova-pix"
                type="text"
                value={pixInput}
                onChange={(e) => setPixInput(e.target.value)}
                placeholder="Ex: 000.456.789-00 ou seu e-mail"
                aria-describedby="pix-modal-desc"
                autoComplete="off"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-[0.9375rem] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0e6641] focus:ring-2 focus:ring-[#0e6641]/20 transition-all mb-4"
              />

              {/* Mensagem de sucesso — WCAG 4.1.3: aria-live="polite" */}
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="mb-4"
              >
                {pixSuccessMsg && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <Check size={18} className="text-green-600 shrink-0" aria-hidden="true" />
                    <p className="text-green-700 text-[0.875rem] font-semibold">
                      {pixSuccessMsg}
                    </p>
                  </div>
                )}
              </div>

              {/* Aviso de segurança */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-amber-700 text-[0.75rem] leading-snug">
                  Esta é uma simulação. Em produção, sua identidade seria verificada antes de salvar.
                </p>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3">
                {/* Cancelar */}
                <button
                  id="pix-modal-btn-cancelar"
                  onClick={closePixModal}
                  className="flex-1 border-2 border-gray-200 text-gray-700 font-bold text-[0.9375rem] py-3.5 rounded-xl hover:bg-gray-50 active:scale-[0.97] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                >
                  Cancelar
                </button>

                {/* Salvar */}
                <button
                  id="pix-modal-btn-salvar"
                  onClick={handleSavePixKey}
                  disabled={!pixInput.trim()}
                  aria-disabled={!pixInput.trim()}
                  className="flex-1 bg-[#0e6641] hover:bg-[#0a5235] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[0.9375rem] py-3.5 rounded-xl shadow-md shadow-green-900/20 active:scale-[0.97] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-1"
                >
                  Salvar Chave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
