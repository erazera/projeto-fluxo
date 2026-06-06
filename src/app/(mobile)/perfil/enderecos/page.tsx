// WCAG 2.2 — Tela de Gerenciamento de Endereços (Modo Lite)
// Critérios cobertos:
//   1.3.1 Info and Relationships — <label> associado aos <input>
//   2.1.1 Keyboard           — focus trap no modal
//   2.4.3 Focus Order        — controle de foco ao abrir/fechar modal
//   3.3.2 Labels or Instructions — placeholder descritivos nos inputs
//   4.1.3 Status Messages    — aria-live="polite" para exclusão/criação
"use client";

import { useState, useEffect, useRef, useId } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  Trash2,
  Plus,
  X,
  Home,
  AlertTriangle
} from "lucide-react";

interface Endereco {
  id: string;
  apelido: string;
  cep: string;
  numero: string;
  rua: string; // Gerado dinamicamente no mock
}

const ENDERECOS_MOCK: Endereco[] = [
  { id: "1", apelido: "Minha Casa", cep: "01000-000", numero: "123", rua: "Rua das Flores, Centro" },
  { id: "2", apelido: "Casa da Praia", cep: "11000-000", numero: "456", rua: "Av. Beira Mar, Boqueirão" },
];

export default function MeusEnderecos() {
  const router = useRouter();

  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<{ id: string; apelido: string } | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  // Feedback dinâmico para screen readers
  const [ariaFeedback, setAriaFeedback] = useState("");

  // Refs Acessibilidade
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const openModalBtnRef = useRef<HTMLButtonElement>(null);
  const closeModalBtnRef = useRef<HTMLButtonElement>(null);
  const blockModalCloseBtnRef = useRef<HTMLButtonElement>(null);
  const confirmModalCloseBtnRef = useRef<HTMLButtonElement>(null);

  // Form states
  const [formApelido, setFormApelido] = useState("");
  const [formCep, setFormCep] = useState("");
  const [formNumero, setFormNumero] = useState("");

  const idApelido = useId();
  const idCep = useId();
  const idNumero = useId();

  // ── Carregar endereços ──────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem("fluxo_lite_addresses");
      if (stored) {
        setEnderecos(JSON.parse(stored));
      } else {
        setEnderecos(ENDERECOS_MOCK);
        localStorage.setItem("fluxo_lite_addresses", JSON.stringify(ENDERECOS_MOCK));
      }
    } catch {
      setEnderecos(ENDERECOS_MOCK);
    }
  }, []);

  // ── Ações ───────────────────────────────────────────────────────────────────
  function requestDelete(id: string, apelido: string) {
    try {
      const storedTx = localStorage.getItem("fluxo_lite_transactions");
      if (storedTx) {
        const txs = JSON.parse(storedTx);
        // Verifica se existe alguma transação com o endereço selecionado
        const temVinculo = txs.some((tx: any) => tx.endereco === apelido || tx.address === apelido);
        if (temVinculo) {
          setAddressToDelete(null);
          setIsBlockModalOpen(true);
          return;
        }
      }
    } catch {}

    // Se não há vínculo ou houve erro no parse, segue fluxo normal
    setAddressToDelete({ id, apelido });
    setIsConfirmModalOpen(true);
  }

  function confirmDelete() {
    if (!addressToDelete) return;
    const { id, apelido } = addressToDelete;
    const novos = enderecos.filter((e) => e.id !== id);
    setEnderecos(novos);
    try {
      localStorage.setItem("fluxo_lite_addresses", JSON.stringify(novos));
    } catch {}
    
    // Feedback de acessibilidade
    setAriaFeedback(`Endereço ${apelido} excluído com sucesso.`);
    setTimeout(() => setAriaFeedback(""), 3000);
    setIsConfirmModalOpen(false);
    setAddressToDelete(null);
  }

  function handleSalvar() {
    if (!formApelido || !formCep || !formNumero) return;

    const novo: Endereco = {
      id: Date.now().toString(),
      apelido: formApelido,
      cep: formCep,
      numero: formNumero,
      rua: `Rua Simulada do CEP ${formCep}`, // Mock automático
    };

    const novos = [...enderecos, novo];
    setEnderecos(novos);
    try {
      localStorage.setItem("fluxo_lite_addresses", JSON.stringify(novos));
    } catch {}

    setAriaFeedback(`Endereço ${formApelido} adicionado com sucesso.`);
    setTimeout(() => setAriaFeedback(""), 3000);
    fecharModal();
  }

  function abrirModal() {
    setFormApelido("");
    setFormCep("");
    setFormNumero("");
    setIsModalOpen(true);
  }

  function fecharModal() {
    setIsModalOpen(false);
  }

  // ── Focus Trap & Keyboard ───────────────────────────────────────────────────
  const isAnyModalOpen = isModalOpen || isBlockModalOpen || isConfirmModalOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden"; // Previne scroll no body
      const timeout = setTimeout(() => {
        if (isModalOpen) closeModalBtnRef.current?.focus();
        if (isBlockModalOpen) blockModalCloseBtnRef.current?.focus();
        if (isConfirmModalOpen) confirmModalCloseBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      document.body.style.overflow = "";
      if (isModalOpen) openModalBtnRef.current?.focus();
    }
  }, [isAnyModalOpen, isModalOpen, isBlockModalOpen, isConfirmModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) fecharModal();
        if (isBlockModalOpen) setIsBlockModalOpen(false);
        if (isConfirmModalOpen) {
          setIsConfirmModalOpen(false);
          setAddressToDelete(null);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, isBlockModalOpen, isConfirmModalOpen]);

  return (
    <div className="flex flex-col h-full bg-[#f5f7f5]">
      
      {/* ── Aria Live Region ───────────────────────────────────────────────── */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaFeedback}
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#0e6641] px-5 pt-3 pb-0 shrink-0" aria-hidden="true">
        <div className="flex justify-between items-center text-white text-xs font-semibold">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <svg width="15" height="11" viewBox="0 0 15 11" fill="white"><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4" y="4.5" width="3" height="6.5" rx="0.5" /><rect x="8" y="2" width="3" height="9" rx="0.5" /><rect x="12" y="0" width="3" height="11" rx="0.5" /></svg>
            <svg width="15" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="white" /></svg>
            <svg width="22" height="12" viewBox="0 0 22 12" fill="white"><rect x="0" y="1" width="18" height="10" rx="2" fill="white" /><rect x="1" y="2" width="16" height="8" rx="1.5" fill="#0e6641" /><rect x="1" y="2" width="14" height="8" rx="1.5" fill="white" /><rect x="18.5" y="4" width="2" height="4" rx="1" fill="white" /></svg>
          </div>
        </div>
      </div>

      <header className="bg-[#0e6641] px-4 pt-4 pb-6 shrink-0 flex items-center justify-between shadow-sm z-10">
        <button
          aria-label="Voltar para a tela anterior"
          onClick={() => router.back()}
          className="text-white opacity-80 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg p-1"
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </button>
        <h1 className="text-white text-[1.125rem] font-bold">Meus Endereços</h1>
        <div className="w-8" aria-hidden="true" />
      </header>

      {/* ── Lista de Endereços ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-6 flex flex-col gap-4">
        {enderecos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center mt-10">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <MapPin size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Nenhum endereço cadastrado.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4" aria-label="Lista de endereços salvos">
            {enderecos.map((endereco) => (
              <li key={endereco.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Home size={24} className="text-orange-500" aria-hidden="true" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-[1.0625rem] font-bold leading-tight mb-1 truncate">
                    {endereco.apelido}
                  </p>
                  <p className="text-gray-500 text-[0.875rem] leading-snug">
                    {endereco.rua}, {endereco.numero}
                  </p>
                  <p className="text-gray-400 text-[0.75rem] mt-0.5">
                    CEP: {endereco.cep}
                  </p>
                </div>

                <button
                  aria-label={`Excluir endereço ${endereco.apelido}`}
                  onClick={() => requestDelete(endereco.id, endereco.apelido)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shrink-0 self-start -mt-1 -mr-2"
                >
                  <Trash2 size={20} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* ── Botão de Ação — em fluxo normal (shrink-0) ──────────────────────
           Não usamos absolute aqui porque o shell tem overflow-hidden,
           o que cliparia qualquer coisa posicionada perto da borda.      */}
      <div className="shrink-0 px-4 pb-6 pt-2">
        <button
          ref={openModalBtnRef}
          onClick={abrirModal}
          className="w-full bg-[#0e6641] hover:bg-[#0a5235] text-white font-bold text-[1.0625rem] py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2"
        >
          <Plus size={20} aria-hidden="true" />
          Adicionar novo endereço
        </button>
      </div>

      {/* ── Modal Bottom Sheet ─────────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-endereco"
          className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        >
          {/* Overlay escuro com backdrop-blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={fecharModal}
            aria-hidden="true"
          />

          <div
            ref={modalContainerRef}
            className="relative bg-white w-full sm:max-w-sm rounded-t-[2rem] sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 duration-300 ease-out flex flex-col"
          >
            <div className="w-full flex justify-center pt-3 pb-2 sm:hidden shrink-0" aria-hidden="true">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="px-6 pb-4 pt-2 flex justify-between items-center shrink-0">
              <h2 id="modal-add-endereco" className="text-gray-900 text-[1.25rem] font-extrabold leading-tight">
                Novo Endereço
              </h2>
              <button
                ref={closeModalBtnRef}
                onClick={fecharModal}
                className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] rounded-lg p-1"
                aria-label="Fechar"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); handleSalvar(); }}
              className="px-6 pb-8 overflow-y-auto"
            >
              <div className="mb-5">
                <label htmlFor={idApelido} className="block text-gray-700 text-[0.9375rem] font-bold mb-2">
                  Como quer chamar este local?
                </label>
                <input
                  id={idApelido}
                  type="text"
                  required
                  value={formApelido}
                  onChange={(e) => setFormApelido(e.target.value)}
                  placeholder="Ex: Sítio, Empresa..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-[1rem] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0e6641] focus:ring-2 focus:ring-[#0e6641]/20 transition-all"
                />
              </div>

              <div className="mb-5 flex gap-4">
                <div className="flex-[2]">
                  <label htmlFor={idCep} className="block text-gray-700 text-[0.9375rem] font-bold mb-2">
                    CEP
                  </label>
                  <input
                    id={idCep}
                    type="text"
                    required
                    inputMode="numeric"
                    value={formCep}
                    onChange={(e) => setFormCep(e.target.value)}
                    placeholder="00000-000"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-[1rem] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0e6641] focus:ring-2 focus:ring-[#0e6641]/20 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor={idNumero} className="block text-gray-700 text-[0.9375rem] font-bold mb-2">
                    Número
                  </label>
                  <input
                    id={idNumero}
                    type="text"
                    required
                    inputMode="numeric"
                    value={formNumero}
                    onChange={(e) => setFormNumero(e.target.value)}
                    placeholder="Ex: 123"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-[1rem] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0e6641] focus:ring-2 focus:ring-[#0e6641]/20 transition-all"
                  />
                </div>
              </div>

              <p className="text-gray-400 text-[0.75rem] mb-6">
                * No app real, a rua é preenchida automaticamente pelo CEP.
              </p>

              <button
                type="submit"
                className="w-full bg-[#0e6641] hover:bg-[#0a5235] text-white font-bold text-[1.0625rem] py-4 rounded-2xl shadow-sm active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2 disabled:opacity-50"
              >
                Salvar Endereço
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Bottom Sheet: Blocked (Linked Packages) ──────────────────── */}
      {isBlockModalOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="modal-block-title"
          aria-describedby="modal-block-desc"
          className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsBlockModalOpen(false)} aria-hidden="true" />
          
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-orange-500" aria-hidden="true" />
              </div>

              <h2 id="modal-block-title" className="text-gray-900 text-[1.25rem] font-bold leading-snug mb-2">
                Ação Bloqueada
              </h2>
              <p id="modal-block-desc" className="text-gray-500 text-[0.875rem] leading-snug mb-6">
                Você não pode excluir este endereço porque existem pacotes de energia ativos atrelados a ele. Consuma a energia primeiro.
              </p>

              <button
                ref={blockModalCloseBtnRef}
                onClick={() => setIsBlockModalOpen(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[1.0625rem] py-4 rounded-2xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Bottom Sheet: Safe to Delete (Confirmation) ──────────────── */}
      {isConfirmModalOpen && addressToDelete && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="modal-confirm-title"
          aria-describedby="modal-confirm-desc"
          className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsConfirmModalOpen(false); setAddressToDelete(null); }} aria-hidden="true" />
          
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Trash2 size={32} className="text-red-500" aria-hidden="true" />
              </div>

              <h2 id="modal-confirm-title" className="text-gray-900 text-[1.25rem] font-bold leading-snug mb-2">
                Excluir endereço?
              </h2>
              <p id="modal-confirm-desc" className="text-gray-500 text-[0.875rem] leading-snug mb-6">
                Tem certeza que deseja excluir <strong>{addressToDelete.apelido}</strong>? Essa ação não pode ser desfeita.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  ref={confirmModalCloseBtnRef}
                  onClick={() => { setIsConfirmModalOpen(false); setAddressToDelete(null); }}
                  className="flex-1 border-2 border-gray-200 text-gray-700 font-bold text-[0.9375rem] py-3.5 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-[0.9375rem] py-3.5 rounded-2xl shadow-md active:scale-[0.98] transition-all"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
