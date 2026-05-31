// WCAG 2.2 — Tela Extrato de Atividades (Modo Lite)
// Critérios cobertos:
//   1.1.1 Non-text Content   — ícones decorativos com aria-hidden; badges com texto visível
//   1.3.1 Info and Relationships — lista semântica <ul>/<li>; separadores de seção com <h2>
//   1.4.4 Resize Text        — tipografia em rem (classes Tailwind relativas)
//   2.4.6 Headings and Labels — <h1> único + <h2> para seções; aria-label descritivos
//   2.4.8 Location           — aria-current="page" na tab "Atividades" da nav
//   4.1.2 Name, Role, Value  — aria-label em itens da lista; role="status" no badge do piloto
//   4.1.3 Status Messages    — aria-live="polite" no badge do piloto automático
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Home,
  ClipboardList,
  Bell,
  User,
  ChevronLeft,
  Filter,
} from "lucide-react";
import { LiteBottomNav } from "@/components/LiteBottomNav";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type TransactionType = "compra" | "recebimento" | "venda" | "bonus" | "ajuste";

interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  subtitle: string;
  amount: number; // negativo = saída, positivo = entrada
  date: string; // ISO string para aria-label acessível
  dateLabel: string; // Label legível para humanos
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
// Agrupados por seção de data para a interface estilo Nubank
const MOCK_TRANSACTIONS: Transaction[] = [
  // Hoje
  {
    id: "txn-001",
    type: "compra",
    title: "Pacote de 15 kWh",
    subtitle: "Hoje, 14:30",
    amount: -15.0,
    date: "2026-05-30T14:30:00",
    dateLabel: "Hoje às 14 horas e 30 minutos",
  },
  {
    id: "txn-002",
    type: "recebimento",
    title: "Energia vendida",
    subtitle: "Hoje, 09:15",
    amount: +8.5,
    date: "2026-05-30T09:15:00",
    dateLabel: "Hoje às 9 horas e 15 minutos",
  },
  // Ontem
  {
    id: "txn-003",
    type: "compra",
    title: "Pacote de 30 kWh",
    subtitle: "Ontem, 20:00",
    amount: -29.7,
    date: "2026-05-29T20:00:00",
    dateLabel: "Ontem às 20 horas",
  },
  {
    id: "txn-004",
    type: "bonus",
    title: "Bônus Fluxo Fidelidade",
    subtitle: "Ontem, 08:00",
    amount: +5.0,
    date: "2026-05-29T08:00:00",
    dateLabel: "Ontem às 8 horas",
  },
  // Esta semana
  {
    id: "txn-005",
    type: "compra",
    title: "Pacote de 10 kWh",
    subtitle: "28 mai, 16:45",
    amount: -10.5,
    date: "2026-05-28T16:45:00",
    dateLabel: "28 de maio às 16 horas e 45 minutos",
  },
  {
    id: "txn-006",
    type: "venda",
    title: "Venda de excedente",
    subtitle: "27 mai, 11:20",
    amount: +12.3,
    date: "2026-05-27T11:20:00",
    dateLabel: "27 de maio às 11 horas e 20 minutos",
  },
  {
    id: "txn-007",
    type: "ajuste",
    title: "Ajuste de fatura",
    subtitle: "26 mai, 10:00",
    amount: -2.4,
    date: "2026-05-26T10:00:00",
    dateLabel: "26 de maio às 10 horas",
  },
  // Este mês
  {
    id: "txn-008",
    type: "compra",
    title: "Pacote de 50 kWh",
    subtitle: "20 mai, 14:00",
    amount: -48.5,
    date: "2026-05-20T14:00:00",
    dateLabel: "20 de maio às 14 horas",
  },
  {
    id: "txn-009",
    type: "recebimento",
    title: "Energia vendida",
    subtitle: "15 mai, 17:30",
    amount: +22.6,
    date: "2026-05-15T17:30:00",
    dateLabel: "15 de maio às 17 horas e 30 minutos",
  },
  {
    id: "txn-010",
    type: "bonus",
    title: "Indicação aprovada",
    subtitle: "10 mai, 09:00",
    amount: +10.0,
    date: "2026-05-10T09:00:00",
    dateLabel: "10 de maio às 9 horas",
  },
];

// Seções de data para agrupamento visual (igual ao Nubank)
const DATE_SECTIONS = [
  { label: "Hoje", ids: ["txn-001", "txn-002"] },
  { label: "Ontem", ids: ["txn-003", "txn-004"] },
  { label: "Esta semana", ids: ["txn-005", "txn-006", "txn-007"] },
  { label: "Este mês", ids: ["txn-008", "txn-009", "txn-010"] },
];

// Gasto líquido este mês (soma de todos os débitos)
const GASTO_MES = MOCK_TRANSACTIONS.filter((t) => t.amount < 0).reduce(
  (acc, t) => acc + Math.abs(t.amount),
  0
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.abs(value));
}

// Configuração visual por tipo de transação
const TYPE_CONFIG: Record<
  TransactionType,
  { icon: React.ElementType; bg: string; iconColor: string; label: string }
> = {
  compra: {
    icon: Zap,
    bg: "bg-yellow-50",
    iconColor: "text-yellow-500",
    label: "Compra de energia",
  },
  recebimento: {
    icon: ArrowDownLeft,
    bg: "bg-green-50",
    iconColor: "text-green-600",
    label: "Recebimento",
  },
  venda: {
    icon: ArrowUpRight,
    bg: "bg-blue-50",
    iconColor: "text-blue-500",
    label: "Venda de energia",
  },
  bonus: {
    icon: Gift,
    bg: "bg-purple-50",
    iconColor: "text-purple-500",
    label: "Bônus",
  },
  ajuste: {
    icon: TrendingUp,
    bg: "bg-gray-100",
    iconColor: "text-gray-500",
    label: "Ajuste",
  },
};

// ── Componente: Item de Transação ─────────────────────────────────────────────
function TransactionItem({ txn }: { txn: Transaction }) {
  const config = TYPE_CONFIG[txn.type];
  const Icon = config.icon;
  const isPositive = txn.amount > 0;
  const amountStr = `${isPositive ? "+" : "-"} ${formatBRL(txn.amount)}`;

  return (
    // WCAG 1.3.1 / 4.1.2: <li> semântico com aria-label descritivo para
    // leitores de tela, comunicando tipo, título, valor e horário.
    <li
      className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0"
      aria-label={`${config.label}: ${txn.title}, ${isPositive ? "entrada de" : "saída de"} ${formatBRL(txn.amount)}, ${txn.dateLabel}`}
    >
      {/* Ícone de categoria — WCAG 1.1.1: decorativo, aria-hidden */}
      <div
        className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${config.bg}`}
        aria-hidden="true"
      >
        <Icon size={22} className={config.iconColor} aria-hidden="true" />
      </div>

      {/* Textos: título + subtítulo */}
      <div className="flex-1 min-w-0">
        {/* aria-hidden pois o <li> pai já tem aria-label completo */}
        <p
          className="text-gray-900 text-[0.9375rem] font-semibold leading-tight truncate"
          aria-hidden="true"
        >
          {txn.title}
        </p>
        <p
          className="text-gray-400 text-[0.8125rem] mt-0.5"
          aria-hidden="true"
        >
          {txn.subtitle}
        </p>
      </div>

      {/* Valor — positivo em verde, negativo em cinza escuro */}
      <p
        className={`shrink-0 text-[0.9375rem] font-bold tabular-nums ${
          isPositive ? "text-green-600" : "text-gray-800"
        }`}
        aria-hidden="true"
      >
        {amountStr}
      </p>
    </li>
  );
}

// ── Página Principal ──────────────────────────────────────────────────────────
export default function ExtratoAtividadesLite() {
  const router = useRouter();
  const [pilotoLigado] = useState(true);

  // ── Mescla mocks com compras reais do wizard (localStorage) ──────────────
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("fluxo_lite_transactions");
      if (!raw) return;
      const bought: Transaction[] = JSON.parse(raw);
      // Garante que não há IDs duplicados antes de mesclar
      const existingIds = new Set(MOCK_TRANSACTIONS.map((t) => t.id));
      const newOnes = bought.filter((t) => !existingIds.has(t.id));
      if (newOnes.length > 0) {
        // Novas compras aparecem no topo (mais recentes primeiro)
        setTransactions([...newOnes, ...MOCK_TRANSACTIONS]);
      }
    } catch {
      // localStorage corrompido — mantém mocks
    }
  }, []);

  return (
    // WCAG 1.4.4: toda tipografia em rem via Tailwind
    <div className="flex flex-col h-full bg-white">

      {/* ── Status Bar ────────────────────────────────────────────────────── */}
      {/* WCAG 1.1.1: decorativa — aria-hidden="true" */}
      <div className="bg-[#0e6641] px-5 pt-3 pb-0 shrink-0" aria-hidden="true">
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

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="bg-[#0e6641] px-5 pt-4 pb-6 shrink-0">
        {/* Linha de navegação topo */}
        <div className="flex items-center justify-between mb-4">
          {/* WCAG 2.4.6: aria-label descritivo — "Voltar" sozinho é ambíguo.
              AGENTS.md: ações programáticas de voltar usam useRouter().back() */}
          <button
            id="btn-voltar-extrato"
            aria-label="Voltar para a tela inicial"
            onClick={() => router.back()}
            className="text-white opacity-80 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e6641] rounded-lg p-1"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>

          {/* WCAG 1.3.1 / 2.4.6: único <h1> da página */}
          <h1 className="text-white text-[1.125rem] font-bold">
            Suas Atividades
          </h1>

          {/* Botão de filtro */}
          <button
            id="btn-filtro-extrato"
            aria-label="Filtrar atividades"
            className="text-white opacity-80 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e6641] rounded-lg p-1"
          >
            <Filter size={22} aria-hidden="true" />
          </button>
        </div>

        {/* ── Card de Resumo do Mês ────────────────────────────────────────
            Design card branco sobre fundo verde — destaque visual máximo */}
        <section
          aria-labelledby="resumo-mes-titulo"
          className="bg-white rounded-2xl px-5 py-4 shadow-lg"
        >
          {/* Label da seção */}
          <p
            id="resumo-mes-titulo"
            className="text-gray-500 text-[0.75rem] font-semibold uppercase tracking-wide"
          >
            Gasto neste mês
          </p>

          {/* Valor principal — tipografia grande para Sônia */}
          <p
            className="text-gray-900 text-[2.5rem] font-extrabold leading-tight mt-1 tabular-nums"
            aria-label={`Gasto total neste mês: ${formatBRL(GASTO_MES)}`}
          >
            {formatBRL(GASTO_MES)}
          </p>

          {/* Linha separadora */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            {/* Info de kWh comprados */}
            <p className="text-gray-400 text-[0.8125rem]">
              <span className="font-semibold text-gray-700">128 kWh</span>{" "}
              comprados
            </p>

            {/* ── Badge do Piloto Automático ──────────────────────────────
                WCAG 4.1.2: role="status" + aria-live="polite" comunicam
                mudanças de estado ao leitor de tela de forma não intrusiva.
                WCAG 4.1.3: Status message anunciada ao ligar/desligar. */}
            <div
              role="status"
              aria-live="polite"
              aria-label={`Piloto Automático: ${pilotoLigado ? "Ligado" : "Desligado"}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.75rem] font-semibold ${
                pilotoLigado
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}
            >
              {/* Indicador de status visual — aria-hidden: texto ao lado já descreve */}
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  pilotoLigado ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
                aria-hidden="true"
              />
              <span aria-hidden="true">
                Piloto Automático: {pilotoLigado ? "Ligado" : "Desligado"}
              </span>
            </div>
          </div>
        </section>
      </header>

      {/* ── Lista de Transações ────────────────────────────────────────────── */}
      {/* WCAG 1.4.4: overflow-y-auto para scroll interno, sem corte em zoom */}
      <main
        id="lista-atividades"
        className="flex-1 overflow-y-auto bg-[#f5f7f5] pb-24"
      >
        {(() => {
          // Agrupa as transações dinamicamente por proximidade de data
          const today    = new Date(); today.setHours(0,0,0,0);
          const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
          const weekAgo   = new Date(today); weekAgo.setDate(today.getDate() - 7);
          const monthAgo  = new Date(today); monthAgo.setDate(today.getDate() - 30);

          function sectionOf(t: Transaction): string {
            const d = new Date(t.date); d.setHours(0,0,0,0);
            if (d.getTime() === today.getTime()) return "Hoje";
            if (d.getTime() === yesterday.getTime()) return "Ontem";
            if (d >= weekAgo) return "Esta semana";
            if (d >= monthAgo) return "Este mês";
            return "Mais antigos";
          }

          const ORDER = ["Hoje","Ontem","Esta semana","Este mês","Mais antigos"];
          const grouped: Record<string, Transaction[]> = {};
          for (const t of transactions) {
            const s = sectionOf(t);
            if (!grouped[s]) grouped[s] = [];
            grouped[s].push(t);
          }

          return ORDER.filter((label) => grouped[label]?.length > 0).map((label) => (
            <section
              key={label}
              aria-labelledby={`secao-${label.toLowerCase().replace(/ /g, "-")}`}
              className="mb-2"
            >
              <h2
                id={`secao-${label.toLowerCase().replace(/ /g, "-")}`}
                className="px-5 pt-5 pb-2 text-gray-400 text-[0.75rem] font-semibold uppercase tracking-widest"
              >
                {label}
              </h2>
              <div className="mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
                <ul
                  aria-label={`Transações de ${label}`}
                  className="divide-y divide-gray-100 px-4"
                >
                  {grouped[label].map((txn) => (
                    <TransactionItem key={txn.id} txn={txn} />
                  ))}
                </ul>
              </div>
            </section>
          ));
        })()}

        {/* Mensagem de fim de lista */}
        <p
          className="text-center text-gray-400 text-[0.8125rem] py-8"
          aria-label="Você chegou ao fim das suas atividades"
        >
          Isso é tudo por enquanto 👍
        </p>
      </main>

      {/* ── Bottom Navigation ──────────────────────────────────────────────── */}
      {/* WCAG 2.4.8: <nav> semântico + aria-current="page" no item ativo.
          AGENTS.md: <Link> para rotas reais; aria-current fixo pois esta é a página de Atividades. */}
      <LiteBottomNav />
    </div>
  );
}
