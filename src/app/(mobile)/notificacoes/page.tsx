// WCAG 2.2 — Tela Meus Avisos (Modo Lite)
// Critérios cobertos:
//   1.1.1 Non-text Content   — aria-hidden em ícones decorativos
//   1.3.1 Info and Relationships — listas <ul> e <li> semânticas
//   1.4.4 Resize Text        — tipografia baseada em rem
//   2.4.4 Link Purpose       — botão com ação clara
//   4.1.2 Name, Role, Value  — aria-label dinâmico ("Aviso não lido: ...")
//   2.5.5 Target Size        — padding das notificações com mais de 44px de altura
"use client";

import { useState } from "react";
import { LiteBottomNav } from "@/components/LiteBottomNav";
import {
  Bell,
  Check,
  Bot,
  AlertTriangle,
  Zap,
  Info
} from "lucide-react";

// ── Tipos ──────────────────────────────────────────────────────────────────────
type NotificacaoTipo = "piloto" | "alerta" | "compra" | "info";

interface Aviso {
  id: string;
  tipo: NotificacaoTipo;
  titulo: string;
  mensagem: string;
  tempo: string;
  lido: boolean;
}

// ── Mocks Iniciais ────────────────────────────────────────────────────────────
const AVISOS_INICIAIS: Aviso[] = [
  {
    id: "1",
    tipo: "piloto",
    titulo: "Piloto Automático em Ação",
    mensagem: "O app acabou de comprar 50 kWh por R$ 25,00 para você. Aproveitamos uma queda no preço!",
    tempo: "Hoje, 14:30",
    lido: false,
  },
  {
    id: "2",
    tipo: "alerta",
    titulo: "Atenção: Pacote acabando",
    mensagem: "Seu 'Pacote Básico' está com menos de 20%. Sugerimos ativar o piloto automático ou comprar mais.",
    tempo: "Hoje, 09:15",
    lido: false,
  },
  {
    id: "3",
    tipo: "compra",
    titulo: "Pagamento Aprovado",
    mensagem: "Sua compra de 100 kWh foi confirmada com sucesso. A energia já está liberada na sua casa.",
    tempo: "Ontem",
    lido: true,
  },
  {
    id: "4",
    tipo: "info",
    titulo: "Novo recurso disponível",
    mensagem: "Agora você pode ver relatórios mais fáceis de entender na tela inicial.",
    tempo: "25 de mai.",
    lido: true,
  },
];

// ── Estilos Dinâmicos por Tipo ────────────────────────────────────────────────
const ESTILOS_TIPO: Record<NotificacaoTipo, { icon: React.ElementType; bg: string; color: string }> = {
  piloto: { icon: Bot, bg: "bg-green-100", color: "text-[#0e6641]" },
  alerta: { icon: AlertTriangle, bg: "bg-orange-100", color: "text-orange-500" },
  compra: { icon: Zap, bg: "bg-yellow-100", color: "text-yellow-600" },
  info:   { icon: Info, bg: "bg-blue-100", color: "text-blue-500" },
};

// ── Componente Principal ──────────────────────────────────────────────────────
export default function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>(AVISOS_INICIAIS);

  const marcarComoLido = (id: string) => {
    setAvisos((prev) =>
      prev.map((aviso) => (aviso.id === id ? { ...aviso, lido: true } : aviso))
    );
  };

  const marcarTodosComoLidos = () => {
    setAvisos((prev) => prev.map((aviso) => ({ ...aviso, lido: true })));
  };

  const temNaoLidos = avisos.some((a) => !a.lido);

  return (
    <div className="flex flex-col h-full bg-[#f5f7f5]">
      
      {/* ── Status Bar Fixa ───────────────────────────────────────────────── */}
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

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="bg-[#0e6641] px-4 pt-4 pb-6 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Badge Decorativo */}
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0" aria-hidden="true">
            <Bell size={18} className="text-white" />
          </div>
          <h1 className="text-white text-[1.375rem] font-extrabold leading-tight">
            Meus Avisos
          </h1>
        </div>

        {/* Ação: Marcar todos como lidos */}
        {temNaoLidos && (
          <button
            onClick={marcarTodosComoLidos}
            className="text-emerald-200 hover:text-white text-[0.8125rem] font-bold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg p-1"
          >
            <Check size={16} aria-hidden="true" />
            Ler todos
          </button>
        )}
      </header>

      {/* ── Lista de Notificações ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        {avisos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Bell size={24} className="text-gray-400" aria-hidden="true" />
            </div>
            <p className="text-gray-500 text-[1rem] font-medium">Nenhum aviso no momento.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3" aria-label="Lista de notificações">
            {avisos.map((aviso) => {
              const cfg = ESTILOS_TIPO[aviso.tipo];
              const Icone = cfg.icon;

              return (
                <li key={aviso.id}>
                  {/* WCAG 4.1.2: se for botão interativo, comunicar estado para leitor de tela */}
                  <button
                    onClick={() => !aviso.lido && marcarComoLido(aviso.id)}
                    aria-label={`${aviso.lido ? "" : "Aviso não lido: "}${aviso.titulo}. ${aviso.mensagem}`}
                    className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl transition-all border
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641]
                      ${aviso.lido ? "bg-white border-gray-100 shadow-sm" : "bg-green-50/50 border-green-100 shadow-md"}
                    `}
                  >
                    {/* Ícone */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`} aria-hidden="true">
                      <Icone size={20} className={cfg.color} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <p className={`text-[0.9375rem] font-bold leading-tight ${aviso.lido ? "text-gray-800" : "text-gray-900"}`}>
                          {aviso.titulo}
                        </p>
                        
                        {/* Indicador Visual Lida/Não Lida */}
                        {!aviso.lido && (
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0 mt-1" aria-hidden="true" />
                        )}
                      </div>

                      <p className={`text-[0.875rem] leading-snug mb-2 pr-2 ${aviso.lido ? "text-gray-500" : "text-gray-700 font-medium"}`}>
                        {aviso.mensagem}
                      </p>

                      <p className="text-gray-400 text-[0.75rem] font-semibold">
                        {aviso.tempo}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Bottom Navigation ─────────────────────────────────────────────── */}
      <LiteBottomNav />
    </div>
  );
}
