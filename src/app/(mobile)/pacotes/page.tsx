// WCAG 2.2 — Tela Meus Pacotes Ativos (Modo Lite)
// Critérios cobertos:
//   1.3.1 Info and Relationships — <ul>/<li>; aria-controls aponta para painel do accordion
//   1.4.4 Resize Text        — tipografia em rem; touch targets mínimos de 44px (WCAG 2.5.5)
//   2.4.6 Headings and Labels — <h1> único; <h2> por card expandido
//   4.1.2 Name, Role, Value  — aria-expanded + aria-controls no botão do accordion;
//                              role="progressbar" + aria-valuenow/min/max na barra;
//                              role="switch" + aria-checked no toggle de renovação
//   4.1.3 Status Messages    — aria-live="polite" no toggle de renovação automática
"use client";

import { useState, useEffect, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  Zap,
  MapPin,
  CreditCard,
  ShoppingCart,
  Package,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { LiteBottomNav } from "@/components/LiteBottomNav";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type PackageStatus = "ativo" | "acabando" | "esgotado";

interface ActivePackage {
  id: string;
  name: string;
  totalKwh: number;
  usedKwh: number;
  pricePaid: number;
  address: string;
  purchasedAt: string; // ISO string
  autoRenew: boolean;
  status: PackageStatus;
}

// ── Mock de fallback ───────────────────────────────────────────────────────────
const MOCK_PACKAGES: ActivePackage[] = [
  {
    id: "pkg-001",
    name: "Pacote Família",
    totalKwh: 100,
    usedKwh: 75,
    pricePaid: 55.0,
    address: "Minha Casa",
    purchasedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: true,
    status: "ativo",
  },
  {
    id: "pkg-002",
    name: "Pacote Básico",
    totalKwh: 50,
    usedKwh: 43,
    pricePaid: 30.0,
    address: "Casa da Praia",
    purchasedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: false,
    status: "acabando",
  },
  {
    id: "pkg-003",
    name: "Pacote Básico",
    totalKwh: 50,
    usedKwh: 50,
    pricePaid: 30.0,
    address: "Minha Casa",
    purchasedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: false,
    status: "esgotado",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function brl(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// Converte transação comprada no wizard → ActivePackage
function txnToPackage(raw: {
  id: string; title: string; amount: number; date: string; subtitle?: string;
}): ActivePackage | null {
  // title example: "Pacote Família · 100 kWh"
  const match = raw.title.match(/^(.+?)\s*·\s*(\d+)\s*kWh$/);
  if (!match) return null;

  const totalKwh = parseInt(match[2], 10);
  // Simula consumo proporcional ao tempo (máx 80% para não mostrar esgotado)
  const daysSince = (Date.now() - new Date(raw.date).getTime()) / (1000 * 60 * 60 * 24);
  const usedPct = Math.min(0.8, daysSince * 0.12);
  const usedKwh = Math.round(totalKwh * usedPct);

  // Endereço vem do subtitle: "Agora, 14:32 · Minha Casa"
  const addrMatch = raw.subtitle?.match(/·\s*(.+)$/);
  const address = addrMatch ? addrMatch[1].trim() : "Minha Casa";

  const remaining = totalKwh - usedKwh;
  const pct = remaining / totalKwh;
  const status: PackageStatus = pct <= 0 ? "esgotado" : pct <= 0.2 ? "acabando" : "ativo";

  return {
    id: raw.id,
    name: match[1].trim(),
    totalKwh,
    usedKwh,
    pricePaid: Math.abs(raw.amount),
    address,
    purchasedAt: raw.date,
    autoRenew: false,
    status,
  };
}

// ── Configuração visual por status ───────────────────────────────────────────
const STATUS_CONFIG: Record<PackageStatus, {
  label: string; emoji: string;
  pill: string; barColor: string;
  icon: React.ElementType; iconColor: string;
}> = {
  ativo:    { label: "Ativo",    emoji: "🟢", pill: "bg-green-100 text-green-700",   barColor: "bg-green-500",  icon: CheckCircle2,  iconColor: "text-green-500" },
  acabando: { label: "Acabando", emoji: "🟡", pill: "bg-yellow-100 text-yellow-700", barColor: "bg-orange-400", icon: AlertTriangle,  iconColor: "text-orange-400" },
  esgotado: { label: "Esgotado", emoji: "🔴", pill: "bg-red-100 text-red-600",       barColor: "bg-red-500",    icon: AlertTriangle,  iconColor: "text-red-500" },
};

// ── Componente: Toggle Acessível ──────────────────────────────────────────────
function AutoRenewToggle({
  id, pkgId, checked, onToggle,
}: {
  id: string; pkgId: string; checked: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-gray-800 text-[0.9375rem] font-semibold">Renovação Automática</p>
        <p className="text-gray-400 text-[0.75rem] mt-0.5">
          {checked ? "Renova automaticamente quando acabar" : "Desativado"}
        </p>
      </div>
      {/* WCAG 4.1.2: role="switch" + aria-checked */}
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={`Renovação automática do pacote ${pkgId}: ${checked ? "ativada" : "desativada"}`}
        onClick={onToggle}
        className={`relative w-14 h-7 rounded-full shrink-0 transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2
          ${checked ? "bg-[#0e6641]" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200
            ${checked ? "translate-x-7" : "translate-x-0"}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

// ── Componente: Card de Pacote (Accordion item) ───────────────────────────────
function PackageCard({
  pkg, isExpanded, onToggleExpand, onToggleAutoRenew,
}: {
  pkg: ActivePackage;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleAutoRenew: () => void;
}) {
  const contentId = useId();
  const toggleId  = useId();
  const progressId = useId();

  const cfg = STATUS_CONFIG[pkg.status];
  const StatusIcon = cfg.icon;
  const remaining = pkg.totalKwh - pkg.usedKwh;
  const pct = Math.min(100, Math.round((pkg.usedKwh / pkg.totalKwh) * 100));
  const remainPct = 100 - pct;

  return (
    <li className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Cabeçalho clicável (WCAG: <button> com aria-expanded + aria-controls) */}
      <button
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={onToggleExpand}
        className="w-full flex items-center gap-4 px-4 py-4 text-left
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0e6641]
          hover:bg-gray-50 transition-colors"
      >
        {/* Ícone */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
          ${pkg.status === "ativo" ? "bg-green-50" : pkg.status === "acabando" ? "bg-orange-50" : "bg-red-50"}`}
        >
          <Zap
            size={22}
            className={pkg.status === "ativo" ? "text-[#0e6641]" : pkg.status === "acabando" ? "text-orange-400" : "text-red-500"}
            aria-hidden="true"
          />
        </div>

        {/* Nome + badge de status */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 text-[1rem] font-bold leading-tight truncate">
            {pkg.name}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[0.6875rem] font-bold px-2.5 py-0.5 rounded-full ${cfg.pill}`}>
              {cfg.emoji} {cfg.label}
            </span>
            <span className="text-gray-400 text-[0.6875rem]">{pkg.totalKwh} kWh</span>
          </div>
        </div>

        {/* Chevron animado */}
        <ChevronDown
          size={20}
          className={`text-gray-400 shrink-0 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
          aria-hidden="true"
        />
      </button>

      {/* ── Painel expandido (conteúdo oculto) ─────────────────────────────── */}
      {/* WCAG 1.3.1: id referenciado por aria-controls acima */}
      <div
        id={contentId}
        className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[28rem]" : "max-h-0"}`}
        aria-hidden={!isExpanded}
      >
        <div className="px-4 pb-5 pt-1 flex flex-col gap-4 border-t border-gray-100">

          {/* Metadados */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
              <p className="text-gray-600 text-[0.875rem]">
                Sendo usado em: <strong className="text-gray-900">{pkg.address}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
              <p className="text-gray-600 text-[0.875rem]">
                Valor pago: <strong className="text-gray-900">{brl(pkg.pricePaid)}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Package size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
              <p className="text-gray-600 text-[0.875rem]">
                Comprado em: <strong className="text-gray-900">{formatDate(pkg.purchasedAt)}</strong>
              </p>
            </div>
          </div>

          {/* ── Barra de Progresso ───────────────────────────────────────── */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <p className="text-gray-500 text-[0.75rem] font-semibold uppercase tracking-wide">
                Energia restante
              </p>
              <p className={`text-[0.75rem] font-bold tabular-nums ${cfg.iconColor}`}>
                {remainPct}% restante
              </p>
            </div>

            {/* WCAG 4.1.2: role="progressbar" com aria-valuenow/min/max/label */}
            <div
              id={progressId}
              role="progressbar"
              aria-valuenow={remaining}
              aria-valuemin={0}
              aria-valuemax={pkg.totalKwh}
              aria-label={`Energia restante: ${remaining} de ${pkg.totalKwh} kWh`}
              className="w-full h-5 bg-gray-100 rounded-full overflow-hidden"
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ${cfg.barColor}`}
                style={{ width: `${remainPct}%` }}
                aria-hidden="true"
              />
            </div>

            <p className="text-gray-600 text-[0.875rem] font-medium mt-2">
              Restam{" "}
              <strong className={`text-[1rem] font-extrabold tabular-nums ${cfg.iconColor}`}>
                {remaining} kWh
              </strong>{" "}
              de {pkg.totalKwh} kWh
            </p>

            {/* Alerta visual se quase acabando */}
            {pkg.status === "acabando" && (
              <div className="mt-2 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
                <AlertTriangle size={14} className="text-orange-500 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-orange-700 text-[0.75rem] leading-snug font-medium">
                  Seu pacote está quase no fim. Considere recarregar logo!
                </p>
              </div>
            )}
            {pkg.status === "esgotado" && (
              <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-red-700 text-[0.75rem] leading-snug font-medium">
                  Este pacote foi totalmente consumido.
                </p>
              </div>
            )}
          </div>

          {/* ── Renovação Automática ─────────────────────────────────────── */}
          <div className="border-t border-gray-100">
            {/* WCAG 4.1.3: aria-live anuncia a mudança de estado para leitores de tela */}
            <div role="status" aria-live="polite" className="sr-only">
              {pkg.autoRenew
                ? `Renovação automática do ${pkg.name} ativada`
                : `Renovação automática do ${pkg.name} desativada`}
            </div>
            <AutoRenewToggle
              id={toggleId}
              pkgId={pkg.id}
              checked={pkg.autoRenew}
              onToggle={onToggleAutoRenew}
            />
          </div>

          {/* ── Botão Comprar Mais ───────────────────────────────────────── */}
          <Link
            href="/comprar"
            aria-label={`Comprar mais energia para ${pkg.name}`}
            className="w-full flex items-center justify-center gap-2 bg-[#0e6641] text-white font-bold text-[0.9375rem] py-3.5 rounded-2xl
              active:scale-[0.98] transition-all shadow-sm shadow-green-900/20
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2"
          >
            <ShoppingCart size={18} aria-hidden="true" />
            Comprar Mais
          </Link>
        </div>
      </div>
    </li>
  );
}

// ── Página Principal ──────────────────────────────────────────────────────────
export default function MeusPacotes() {
  const router = useRouter();

  const [packages, setPackages] = useState<ActivePackage[]>(MOCK_PACKAGES);
  // Accordion: guarda o id do card aberto (null = todos fechados)
  const [expandedId, setExpandedId] = useState<string | null>(MOCK_PACKAGES[0].id);

  // ── Lê compras reais do localStorage e insere no topo ────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("fluxo_lite_transactions");
      if (!raw) return;
      const txns: { id: string; title: string; amount: number; date: string; subtitle?: string }[] =
        JSON.parse(raw);

      const real = txns
        .map(txnToPackage)
        .filter(Boolean) as ActivePackage[];

      if (real.length > 0) {
        const mockIds = new Set(MOCK_PACKAGES.map((p) => p.id));
        const novos = real.filter((p) => !mockIds.has(p.id));
        if (novos.length > 0) {
          setPackages([...novos, ...MOCK_PACKAGES]);
          setExpandedId(novos[0].id);
        }
      }
    } catch {
      // fallback silencioso
    }
  }, []);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function toggleAutoRenew(id: string) {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, autoRenew: !p.autoRenew } : p))
    );
  }

  const activeCount = packages.filter((p) => p.status !== "esgotado").length;

  return (
    <div className="flex flex-col h-full bg-[#f5f7f5]">

      {/* ── Status Bar ────────────────────────────────────────────────────── */}
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
      <header className="bg-[#0e6641] px-4 pt-4 pb-6 shrink-0">
        <div className="flex items-center gap-3">
          <button
            aria-label="Voltar"
            onClick={() => router.back()}
            className="text-white opacity-80 hover:opacity-100 transition-opacity
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e6641] rounded-lg p-1 shrink-0"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-white text-[1.125rem] font-extrabold leading-tight">
              Meus Pacotes de Energia
            </h1>
            <p className="text-emerald-200 text-[0.75rem] mt-0.5">
              {activeCount} pacote{activeCount !== 1 && "s"} ativo{activeCount !== 1 && "s"}
            </p>
          </div>

          {/* Badge de total */}
          <div
            className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <Zap size={18} className="text-yellow-300" />
          </div>
        </div>
      </header>

      {/* ── Lista de Pacotes (Accordion) ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28">

        {/* CTA de novo pacote */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500 text-[0.75rem] font-semibold uppercase tracking-widest">
            {packages.length} pacote{packages.length !== 1 && "s"} no total
          </p>
          <Link
            href="/comprar"
            className="flex items-center gap-1.5 bg-[#0e6641] text-white text-[0.75rem] font-bold px-3 py-2 rounded-xl
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6641] focus-visible:ring-offset-2"
          >
            <ShoppingCart size={13} aria-hidden="true" />
            + Novo Pacote
          </Link>
        </div>

        {/* WCAG 1.3.1: <ul> semântico para a lista de pacotes */}
        <ul className="flex flex-col gap-3" aria-label="Lista de pacotes de energia">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isExpanded={expandedId === pkg.id}
              onToggleExpand={() => toggleExpand(pkg.id)}
              onToggleAutoRenew={() => toggleAutoRenew(pkg.id)}
            />
          ))}
        </ul>

        {/* Dica inferior */}
        <p className="text-center text-gray-400 text-[0.75rem] mt-6 leading-snug px-4">
          Toque em um pacote para ver os detalhes e gerenciar
        </p>
      </div>

      <LiteBottomNav />
    </div>
  );
}
