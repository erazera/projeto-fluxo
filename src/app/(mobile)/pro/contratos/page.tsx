// WCAG 2.2 — Tela Meus Contratos (Modo Pro)
// Critérios cobertos:
//   1.1.1 Non-text Content   — ícones decorativos com aria-hidden
//   1.3.1 Info and Relationships — lista semântica <ul> e <li> para renderizar a grid
//   1.4.4 Resize Text        — tipografia em rem (classes Tailwind relativas)
//   2.4.6 Headings and Labels — botões com aria-label descritivo contextual ("Cancelar contrato...")
//   4.1.3 Status Messages    — aria-live="polite" + role="status" no feedback de remoção
"use client";
import { ProBottomNav } from "@/components/ProBottomNav";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Clock,
  Zap,
  Moon,
  Sun,
  Home,
  MapPin,
  List,
  Settings,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ── Tipos ─────────────────────────────────────────────────────────────────────
export interface Contract {
  id: string;
  volume: number;
  price: number;
  schedule: string; // "24h" | "madrugada" | "pico"
  status: "ativo" | "aguardando";
  createdAt: string;
}

// ── Mocks Iniciais ────────────────────────────────────────────────────────────
const MOCK_INITIAL_CONTRACTS: Contract[] = [
  {
    id: "cnt-1",
    volume: 150,
    price: 0.62,
    schedule: "pico",
    status: "ativo",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "cnt-2",
    volume: 50,
    price: 0.50,
    schedule: "madrugada",
    status: "aguardando",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

// ── Dicionários Visuais ──────────────────────────────────────────────────────
const SCHEDULE_INFO: Record<string, { label: string; icon: any; color: string }> = {
  "24h": { label: "24 Horas", icon: Zap, color: "text-emerald-400" },
  madrugada: { label: "Madrugada", icon: Moon, color: "text-purple-400" },
  pico: { label: "Pico", icon: Sun, color: "text-orange-400" },
};

// ── Bottom Nav Pro ───────────────────────────────────────────────────────────
const navItems = [
  { id: "home",    label: "Home",              icon: Home    },
  { id: "mapa",    label: "Mapa de Demanda",   icon: MapPin  },
  { id: "extrato", label: "Extrato Detalhado", icon: List    },
  { id: "config",  label: "Configurações",     icon: Settings },
];

export default function MeusContratos() {
  const router = useRouter();
  const feedbackId = useId();

  // ── Hook de Persistência ──────────────────────────────────────────────────
  const [contracts, setContracts, isHydrated] = useLocalStorage<Contract[]>(
    "fluxo_b2b_contracts",
    MOCK_INITIAL_CONTRACTS
  );

  const [activeTab, setActiveTab] = useState("home");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // ── Funções ───────────────────────────────────────────────────────────────
  function handleCancel(id: string, volume: number) {
    const updated = contracts.filter((c) => c.id !== id);
    setContracts(updated);

    // WCAG 4.1.3: Feedback dinâmico
    setFeedbackMsg(`Contrato de ${volume} kWh cancelado com sucesso.`);
    setTimeout(() => setFeedbackMsg(""), 4000);
  }

  function formatBRL(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  // Previne renderização antes da hidratação para evitar erros no Next.js
  if (!isHydrated) {
    return (
      <div className="flex flex-col h-full bg-[#0d1117] text-white items-center justify-center">
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
          aria-label="Voltar para a página inicial"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-lg p-1 shrink-0"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white text-[1rem] font-bold leading-tight truncate">
            Meus Contratos
          </h1>
          <p className="text-gray-500 text-[0.6875rem] mt-0.5">
            Portfólio B2B Ativo
          </p>
        </div>
      </header>

      {/* ── Corpo Scrollável ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 flex flex-col gap-4">
        {/* ── Action Bar ──────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-400 text-[0.75rem] font-bold uppercase tracking-wider">
            {contracts.length} Contrato{contracts.length !== 1 && "s"}
          </p>
          <Link
            href="/pro/contrato"
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white px-3 py-2 rounded-xl text-[0.75rem] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
          >
            <Plus size={16} aria-hidden="true" />
            Novo Contrato
          </Link>
        </div>

        {/* ── Feedback de Remoção (Aria Live) ────────────────────────────── */}
        <div id={feedbackId} role="status" aria-live="polite" aria-atomic="true">
          {feedbackMsg && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 mb-2 flex items-center gap-2">
              <span className="text-white text-[0.8125rem] font-semibold">{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* ── Lista de Contratos ──────────────────────────────────────────── */}
        {contracts.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <List size={32} className="text-gray-600 mb-3" aria-hidden="true" />
            <p className="text-white text-[0.9375rem] font-bold">Nenhum contrato ativo</p>
            <p className="text-gray-500 text-[0.75rem] mt-1">Crie um novo contrato B2B para começar a vender.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {contracts.map((contract) => {
              const SchedIcon = SCHEDULE_INFO[contract.schedule]?.icon || Clock;
              const schedLabel = SCHEDULE_INFO[contract.schedule]?.label || contract.schedule;
              const schedColor = SCHEDULE_INFO[contract.schedule]?.color || "text-gray-400";
              const isAtivo = contract.status === "ativo";
              const receita = contract.volume * contract.price;

              return (
                <li
                  key={contract.id}
                  className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 flex flex-col gap-3 relative"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${isAtivo ? "bg-green-500" : "bg-yellow-500"}`}
                        aria-hidden="true"
                      />
                      <span className="text-[0.6875rem] font-bold uppercase tracking-wide text-gray-300">
                        {isAtivo ? "Ativo" : "Aguardando"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCancel(contract.id, contract.volume)}
                      /* WCAG 2.4.6: Aria-label contextual para ação de remoção */
                      aria-label={`Cancelar contrato de ${contract.volume} kWh`}
                      className="text-gray-500 hover:text-red-400 p-1.5 -mr-1.5 -mt-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-[0.625rem] uppercase tracking-wide mb-1">Volume / Preço</p>
                      <p className="text-white text-[0.9375rem] font-bold leading-tight">
                        {contract.volume} kWh
                      </p>
                      <p className="text-gray-400 text-[0.75rem] leading-tight mt-0.5">
                        R$ {contract.price.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[0.625rem] uppercase tracking-wide mb-1">Receita Est.</p>
                      <p className="text-green-400 text-[0.9375rem] font-bold leading-tight tabular-nums">
                        {formatBRL(receita)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#30363d] flex items-center gap-2">
                    <SchedIcon size={14} className={schedColor} aria-hidden="true" />
                    <span className={`text-[0.75rem] font-bold ${schedColor}`}>
                      {schedLabel}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Bottom Navigation ─────────────────────────────────────────────── */}
      <ProBottomNav />
    </div>
  );
}
