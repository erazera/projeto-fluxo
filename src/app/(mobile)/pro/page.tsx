// WCAG 2.2 — Tela Home Modo Pro
// Critérios cobertos:
//   1.1.1 Non-text Content   — gráfico SVG com role="img" + aria-label; ícones decorativos com aria-hidden
//   1.4.4 Resize Text        — tipografia em rem
//   2.4.6 Headings and Labels — aria-label descritivo no botão "Olá, Marina"
//   2.4.8 Location           — aria-current="page" na navegação inferior
//   4.1.2 Name, Role, Value  — aria-pressed nos filtros de tempo; aria-label na nav
"use client";
import { ProBottomNav } from "@/components/ProBottomNav";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  HelpCircle,
  ChevronDown,
  TrendingDown,
  FileText,
  Tag,
  Battery,
  Gift,
  BookOpen,
  BarChart2,
  Home,
  MapPin,
  List,
  Settings,
  RefreshCw,
} from "lucide-react";

// ── Gráfico SVG estático ──────────────────────────────────────────────────
// WCAG 1.1.1: o gráfico em si é decorativo/visual — sua informação é
// comunicada pelo texto ao lado (preço R$ 0,62/kWh e variação -3,2%).
// role="img" + aria-label fornecem um resumo textual completo.
function EnergyChart() {
  const points = [
    [30, 110], [60, 100], [80, 88],  [100, 76], [115, 62],
    [130, 48], [145, 38], [158, 26], [170, 22], [182, 34],
    [196, 44], [210, 54], [224, 62], [238, 70], [250, 80],
    [265, 86], [278, 78], [292, 66], [306, 56],
  ];

  const polylineStr = points.map(([x, y]) => `${x},${y}`).join(" ");
  const areaPath =
    `M${points[0][0]},${points[0][1]} ` +
    points.slice(1).map(([x, y]) => `L${x},${y}`).join(" ") +
    ` L${points[points.length - 1][0]},130 L${points[0][0]},130 Z`;

  const lastPt = points[points.length - 1];

  return (
    <svg
      viewBox="0 30 320 120"
      className="w-full"
      style={{ height: 130 }}
      preserveAspectRatio="none"
      /* WCAG 1.1.1 — alternativa textual para o gráfico */
      role="img"
      aria-label="Gráfico de linha do preço da energia nas últimas 24 horas. O preço foi de R$ 0,20 ao meio-dia, subiu até o pico de R$ 0,64 às 18h e retornou a R$ 0,46 às 12h do dia seguinte."
    >
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaPath} fill="url(#chartGrad)" />
      {/* Line */}
      <polyline
        points={polylineStr}
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Last point dot */}
      <circle cx={lastPt[0]} cy={lastPt[1]} r="4" fill="#22c55e" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="7" fill="#22c55e" fillOpacity="0.25" />
    </svg>
  );
}

// ── Y-axis labels ─────────────────────────────────────────────────────────
const yLabels = ["0,80", "0,60", "0,40", "0,20", "0,00"];
const xLabels = ["12:00", "18:00", "00:00", "06:00", "12:00"];
const timeFilters = ["24H", "7D", "30D", "90D"];

// ── Quick Actions ─────────────────────────────────────────────────────────────────────────
// href opcional: ações com rota real usam <Link>; as demais são <button> por ora.
const quickActions = [
  { id: "criar-contrato",  label: "Criar\nContrato B2B",      icon: FileText,  color: "#60a5fa", href: "/pro/contrato" },
  { id: "ajustar-preco",   label: "Ajustar preço\nde venda",  icon: Tag,       color: "#a78bfa", href: "/pro/preco" },
  { id: "mapa-demanda",    label: "Mapa de\nDemanda",         icon: MapPin,    color: "#34d399", href: "/pro/mapa" },
  { id: "ofertas",         label: "Ofertas\nrecebidas",        icon: Gift,      color: "#f472b6", href: "/pro/ofertas" },
  { id: "contratos",       label: "Meus\ncontratos",           icon: BookOpen,  color: "#60a5fa", href: "/pro/contratos" },
  { id: "relatorios",      label: "Relatórios\navançados",     icon: BarChart2, color: "#fb923c", href: "/pro/extrato" },
];

// ── Bottom Nav ────────────────────────────────────────────────────────────
const navItems = [
  { id: "home",    label: "Home",              icon: Home    },
  { id: "mapa",    label: "Mapa de Demanda",   icon: MapPin  },
  { id: "extrato", label: "Extrato Detalhado", icon: List    },
  { id: "config",  label: "Configurações",     icon: Settings },
];

export default function HomeModoPro() {
  const [activeFilter, setActiveFilter] = useState("24H");
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-white">

      {/* ── Status Bar ─────────────────────────────────────────────────── */}
      {/* WCAG 1.1.1: status bar é decorativa — nenhuma informação relevante */}
      <div className="px-5 pt-3 shrink-0" aria-hidden="true">
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
              <rect x="1" y="2" width="16" height="8" rx="1.5" fill="#0d1117" />
              <rect x="1" y="2" width="14" height="8" rx="1.5" fill="white" />
              <rect x="18.5" y="4" width="2" height="4" rx="1" fill="white" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center px-5 pt-3 pb-3 shrink-0">
        {/* WCAG 2.4.6 / 4.1.2: aria-label descritivo — "Olá, Marina" sozinho
            não comunica a finalidade do botão (trocar conta) */}
        <button
          className="flex items-center gap-1.5 text-white"
          aria-label="Trocar conta — atualmente logado como Marina"
        >
          <span className="text-[1.25rem] font-bold">Olá, Marina</span>
          <ChevronDown size={18} className="text-gray-400" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-4">
          <button aria-label="Notificações" className="text-gray-300 hover:text-white transition-colors">
            <Bell size={22} aria-hidden="true" />
          </button>
          <button aria-label="Ajuda e suporte" className="text-gray-300 hover:text-white transition-colors">
            <HelpCircle size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Scrollable Body ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-4">

        {/* ── Resumo do Portfólio ──────────────────────────────────────── */}
        <div className="bg-[#161b22] rounded-2xl p-4 border border-[#30363d]">
          <p className="text-gray-400 text-[0.75rem] font-semibold uppercase tracking-wide mb-3">
            Resumo do portfólio
          </p>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-gray-400 text-[0.6875rem] mb-1">Saldo disponível</p>
              <p className="text-green-400 text-[1.375rem] font-extrabold leading-tight">
                R$ 12.850,75
              </p>
            </div>
            <div className="w-px bg-[#30363d] shrink-0" />
            <div className="flex-1">
              <p className="text-gray-400 text-[0.6875rem] mb-1">Volume total</p>
              <p className="text-blue-400 text-[1.375rem] font-extrabold leading-tight">
                8.620 kWh
              </p>
            </div>
          </div>
        </div>

        {/* ── Gráfico ──────────────────────────────────────────────────── */}
        <div className="bg-[#161b22] rounded-2xl p-4 border border-[#30363d]">
          {/* Chart header */}
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="text-white text-[0.875rem] font-bold">
                Preço da energia no seu bairro
              </p>
              <p className="text-gray-500 text-[0.6875rem]">Últimas 24 horas</p>
            </div>
            <div className="text-right">
              <p className="text-white text-[0.875rem] font-bold">R$ 0,62 /kWh</p>
              <div className="flex items-center justify-end gap-0.5 text-green-400 text-[0.6875rem]">
                {/* WCAG 1.1.1: ícone de tendência — texto "-3,2%" ao lado já descreve */}
                <TrendingDown size={12} aria-hidden="true" />
                <span>-3,2%</span>
              </div>
            </div>
          </div>

          {/* Chart area with Y-axis */}
          <div className="flex gap-1 mt-2">
            {/* Y labels — aria-hidden pois são labels visuais do gráfico,
                cujo significado já está no aria-label do SVG */}
            <div
              className="flex flex-col justify-between text-right pr-1 shrink-0"
              style={{ height: 130 }}
              aria-hidden="true"
            >
              {yLabels.map((label) => (
                <span key={label} className="text-gray-500 text-[0.5625rem] leading-none">
                  {label}
                </span>
              ))}
            </div>
            {/* SVG Chart — acessível via role="img" + aria-label dentro do componente */}
            <div className="flex-1 relative">
              <EnergyChart />
            </div>
          </div>

          {/* X labels — aria-hidden pela mesma razão dos Y labels */}
          <div className="flex justify-between pl-8 mt-1" aria-hidden="true">
            {xLabels.map((label, i) => (
              <span key={`x-${i}`} className="text-gray-500 text-[0.5625rem]">
                {label}
              </span>
            ))}
          </div>

          {/* Time filter buttons
              WCAG 4.1.2: aria-pressed indica qual filtro está ativo.
              Alternativa semântica correta para um grupo de botões de seleção única. */}
          <div className="flex gap-2 mt-3" role="group" aria-label="Período do gráfico">
            {timeFilters.map((f) => (
              <button
                key={f}
                id={`filter-${f.toLowerCase()}`}
                onClick={() => setActiveFilter(f)}
                aria-pressed={activeFilter === f}
                className={`px-4 py-1.5 rounded-lg text-[0.75rem] font-bold transition-all ${
                  activeFilter === f
                    ? "bg-green-600 text-white shadow-lg shadow-green-900/40"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Ações Rápidas ──────────────────────────────────────────── */}
        <div>
          <p className="text-white text-[0.9375rem] font-bold mb-3">Ações rápidas</p>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map(({ id, label, icon: Icon, color, href }) => {
              const sharedClass =
                "bg-[#161b22] border border-[#30363d] rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-[#58a6ff] active:scale-[0.96] transition-all";
              const ariaLabel = label.replace("\n", " ");
              const inner = (
                <>
                  {/* WCAG 1.1.1: ícone decorativo — aria-label no elemento pai já descreve */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}18` }}
                    aria-hidden="true"
                  >
                    <Icon size={20} style={{ color }} aria-hidden="true" />
                  </div>
                  {/* Texto visual — aria-hidden evita repetição com aria-label */}
                  <span
                    className="text-gray-300 text-[0.625rem] text-center leading-tight whitespace-pre-line"
                    aria-hidden="true"
                  >
                    {label}
                  </span>
                </>
              );

              // AGENTS.md: <Link> para rotas reais; <button> para ações sem rota.
              return href ? (
                <Link
                  key={id}
                  href={href}
                  id={`action-${id}`}
                  aria-label={ariaLabel}
                  className={sharedClass}
                >
                  {inner}
                </Link>
              ) : (
                <button
                  key={id}
                  id={`action-${id}`}
                  aria-label={ariaLabel}
                  className={sharedClass}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Navigation ──────────────────────────────────────────── */}
      {/* WCAG 2.4.8: nav semântico + aria-current="page" no item ativo */}
      <ProBottomNav />
    </div>
  );
}
