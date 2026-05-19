"use client";

import { useState } from "react";
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
  ClipboardList,
  Bell as BellNav,
  User,
  Info,
  AlertTriangle,
} from "lucide-react";

export default function HomeSimplificada() {
  const router = useRouter();
  const [pilotoLigado, setPilotoLigado] = useState(false);
  const [cardVisible, setCardVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("inicio");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Status Bar ─────────────────────────────────────── */}
      <div className="bg-[#0e6641] px-5 pt-3 pb-0 shrink-0">
        <div className="flex justify-between items-center text-white text-xs font-semibold">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            {/* Signal bars */}
            <svg width="15" height="11" viewBox="0 0 15 11" fill="white">
              <rect x="0" y="7" width="3" height="4" rx="0.5" />
              <rect x="4" y="4.5" width="3" height="6.5" rx="0.5" />
              <rect x="8" y="2" width="3" height="9" rx="0.5" />
              <rect x="12" y="0" width="3" height="11" rx="0.5" />
            </svg>
            {/* Wifi */}
            <svg width="15" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <circle cx="12" cy="20" r="1" fill="white" />
            </svg>
            {/* Battery */}
            <svg width="22" height="12" viewBox="0 0 22 12" fill="white">
              <rect x="0" y="1" width="18" height="10" rx="2" fill="white" />
              <rect x="1" y="2" width="16" height="8" rx="1.5" fill="#0e6641" />
              <rect x="1" y="2" width="14" height="8" rx="1.5" fill="white" />
              <rect x="18.5" y="4" width="2" height="4" rx="1" fill="white" />
            </svg>
          </div>
        </div>

        {/* ── Header Row ──────────────────────────────────── */}
        <div className="flex justify-between items-center mt-3 pb-4">
          <div>
            <p className="text-emerald-200 text-[13px] leading-tight">
              Que bom te ver por aqui.
            </p>
            <h1 className="text-white text-[22px] font-bold leading-tight">
              Olá, Sônia! 👋
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Notificações"
              className="text-white opacity-90 hover:opacity-100 transition-opacity"
            >
              <Bell size={22} />
            </button>
            <button
              aria-label="Ajuda"
              className="text-white opacity-90 hover:opacity-100 transition-opacity"
            >
              <HelpCircle size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable Content ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-[#f5f7f5] px-4 pt-4 pb-24 flex flex-col gap-4">

        {/* ── Saldo de Economia Card ─────────────────────── */}
        {cardVisible && (
          <div className="bg-[#0e6641] rounded-2xl p-4 relative shadow-md">
            <button
              aria-label="Fechar card"
              onClick={() => setCardVisible(false)}
              className="absolute top-3 right-3 text-emerald-300 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <p className="text-emerald-300 text-[12px] font-medium uppercase tracking-wide">
              Saldo de economia
            </p>
            <p className="text-emerald-300 text-[12px] font-medium">
              este mês
            </p>

            <p className="text-white text-[38px] font-extrabold leading-tight mt-1">
              R$ 45,60
            </p>

            <p className="text-emerald-200 text-[13px] mt-1 leading-snug">
              Você economizou 12% em relação ao mês passado. Parabéns! 🎉
            </p>

            {/* Divider row */}
            <div className="mt-4 pt-3 border-t border-emerald-700 flex justify-between">
              <div>
                <p className="text-emerald-300 text-[11px]">Energia comprada</p>
                <p className="text-white text-[15px] font-bold">
                  128 kWh{" "}
                  <span className="text-emerald-300 text-[11px] font-normal">
                    este mês
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-emerald-300 text-[11px]">Preço médio pago</p>
                <p className="text-white text-[15px] font-bold">
                  R$ 0,68{" "}
                  <span className="text-emerald-300 text-[11px] font-normal">
                    /kWh
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Ações Principais ───────────────────────────── */}
        <div>
          <p className="text-gray-500 text-[12px] font-semibold uppercase tracking-wide mb-2">
            Ações principais
          </p>

          {/* CTA Principal */}
          <button
            id="btn-comprar-pacote"
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-[#0e6641] hover:bg-[#0a5235] active:scale-[0.98] transition-all rounded-2xl px-5 py-4 flex items-center gap-4 shadow-md"
          >
            <div className="shrink-0 bg-yellow-400 rounded-xl w-12 h-12 flex items-center justify-center">
              <Zap size={26} className="text-[#0e6641]" fill="currentColor" />
            </div>
            <div className="text-left">
              <p className="text-white text-[17px] font-bold leading-tight">
                Comprar pacote
                <br />
                de energia via PIX
              </p>
              <p className="text-emerald-300 text-[12px] mt-0.5">
                Rápido, seguro e sem cartão
              </p>
            </div>
          </button>

          {/* Secondary actions row */}
          <div className="flex gap-3 mt-3">
            <button
              id="btn-ver-pacotes"
              className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 rounded-lg bg-[#f0f7f3] flex items-center justify-center shrink-0">
                <Package size={16} className="text-[#0e6641]" />
              </div>
              <span className="text-gray-800 text-[13px] font-semibold leading-tight">
                Ver meus
                <br />
                pacotes
              </span>
            </button>

            <button
              id="btn-vender-energia"
              className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 rounded-lg bg-[#fff8ed] flex items-center justify-center shrink-0">
                <ArrowLeftRight size={16} className="text-yellow-500" />
              </div>
              <span className="text-gray-800 text-[13px] font-semibold leading-tight">
                Vender minha
                <br />
                energia
              </span>
            </button>
          </div>
        </div>

        {/* ── Piloto Automático Card ──────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-500 text-[12px] font-semibold uppercase tracking-wide">
              Deixe o app trabalhar por você
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <p className="text-gray-900 text-[15px] font-bold">
                Piloto Automático
              </p>
              <button aria-label="Info Piloto Automático" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Info size={14} />
              </button>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-[12px]">Desligado</span>
              <button
                id="toggle-piloto-automatico"
                role="switch"
                aria-checked={pilotoLigado}
                aria-label="Ativar Piloto Automático"
                onClick={() => setPilotoLigado((prev) => !prev)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] ${
                  pilotoLigado ? "bg-[#0e6641]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                    pilotoLigado ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
              <span
                className={`text-[12px] font-semibold ${
                  pilotoLigado ? "text-[#0e6641]" : "text-gray-400"
                }`}
              >
                Ligado
              </span>
            </div>
          </div>

          <p className="text-gray-400 text-[12px] mt-2 leading-snug">
            Com o Piloto Automático, o app compra energia quando está mais
            barata e te avisa!{" "}
            <button className="text-[#0e6641] font-semibold underline">
              Saiba mais
            </button>
          </p>
        </div>
      </div>

      {/* ── Bottom Navigation ──────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 px-2 z-10">
        {[
          { id: "inicio", label: "Início", icon: Home },
          { id: "atividades", label: "Atividades", icon: ClipboardList },
          { id: "notificacoes", label: "Notificações", icon: BellNav },
          { id: "perfil", label: "Perfil", icon: User },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`nav-${id}`}
            aria-label={label}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-colors ${
              activeTab === id ? "text-[#0e6641]" : "text-gray-400"
            }`}
          >
            <Icon
              size={22}
              className={activeTab === id ? "text-[#0e6641]" : "text-gray-400"}
              strokeWidth={activeTab === id ? 2.5 : 1.8}
            />
            <span
              className={`text-[10px] font-semibold ${
                activeTab === id ? "text-[#0e6641]" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Modal Tela 4: Confirmação de Compra ────────────────── */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="absolute inset-0 z-50 flex items-center justify-center px-5"
          style={{ backgroundColor: "rgba(0,0,0,0.60)", backdropFilter: "blur(3px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          {/* Card branco */}
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Botão fechar */}
            <div className="flex justify-end px-5 pt-5">
              <button
                aria-label="Fechar modal"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="px-6 pb-6 flex flex-col items-center text-center">
              {/* Ícone de alerta */}
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-5">
                <AlertTriangle size={32} className="text-orange-500" fill="currentColor" />
              </div>

              {/* Título */}
              <h2
                id="modal-title"
                className="text-gray-900 text-[18px] font-bold leading-snug mb-3"
              >
                Você está prestes a comprar um pacote de{" "}
                <span className="text-[#0e6641]">R$ 15,00</span> para uso imediato.
              </h2>

              {/* Aviso crítico */}
              <p className="text-gray-500 text-[14px] leading-snug mb-6">
                Esta ação não pode ser desfeita.
              </p>

              {/* Botões */}
              <div className="flex gap-3 w-full">
                {/* Cancelar */}
                <button
                  id="modal-btn-cancelar"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-700 font-bold text-[15px] py-3.5 rounded-2xl hover:bg-gray-50 active:scale-[0.97] transition-all"
                >
                  Cancelar
                </button>

                {/* Confirmar */}
                <button
                  id="modal-btn-confirmar"
                  onClick={() => {
                    setIsModalOpen(false);
                    router.push("/sucesso");
                  }}
                  className="flex-1 bg-[#0e6641] hover:bg-[#0a5235] text-white font-bold text-[15px] py-3.5 rounded-2xl shadow-md shadow-green-900/30 active:scale-[0.97] transition-all leading-tight"
                >
                  Confirmar e{"\n"}Gerar PIX
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
