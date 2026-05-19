"use client";

import { useState } from "react";
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

// ── Gráfico SVG estático (simulado com pontos reais do mockup) ─────────────
function EnergyChart() {
  // Pontos (x, y) mapeados para viewBox 320x140
  // Eixo Y: 0.00 → y=130, 0.80 → y=10  →  escala: 150px por 0.80 = 187.5 por unidade
  // Eixo X: 0 → x=30, 320 → x=310
  const points = [
    [30, 110],   // 12:00 → ~0.20
    [60, 100],   // →0.24
    [80, 88],    // →0.30
    [100, 76],   // →0.35
    [115, 62],   // →0.42
    [130, 48],   // →0.49 peak area start
    [145, 38],   // →0.55
    [158, 26],   // 18:00 peak ~0.62
    [170, 22],   // →0.64 peak
    [182, 34],   // →0.57
    [196, 44],   // →0.52
    [210, 54],   // 00:00 →0.46
    [224, 62],   // →0.42
    [238, 70],   // →0.38
    [250, 80],   // 06:00 →0.32
    [265, 86],   // →0.29
    [278, 78],   // →0.33
    [292, 66],   // →0.40
    [306, 56],   // 12:00 →0.46
  ];

  const polylineStr = points.map(([x, y]) => `${x},${y}`).join(" ");
  // Build the area fill path (close to bottom)
  const areaPath =
    `M${points[0][0]},${points[0][1]} ` +
    points
      .slice(1)
      .map(([x, y]) => `L${x},${y}`)
      .join(" ") +
    ` L${points[points.length - 1][0]},130 L${points[0][0]},130 Z`;

  // Last point dot
  const lastPt = points[points.length - 1];

  return (
    <svg
      viewBox="0 30 320 120"
      className="w-full"
      style={{ height: 130 }}
      preserveAspectRatio="none"
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

// ── Quick Actions ─────────────────────────────────────────────────────────
const quickActions = [
  { id: "criar-contrato", label: "Criar\nContrato B2B", icon: FileText, color: "#60a5fa" },
  { id: "ajustar-preco", label: "Ajustar preço\nde venda", icon: Tag, color: "#a78bfa" },
  { id: "bateria-virtual", label: "Bateria Virtual\n(Noturno)", icon: RefreshCw, color: "#34d399" },
  { id: "ofertas", label: "Ofertas\nrecebidas", icon: Gift, color: "#f472b6" },
  { id: "contratos", label: "Meus\ncontratos", icon: BookOpen, color: "#60a5fa" },
  { id: "relatorios", label: "Relatórios\navançados", icon: BarChart2, color: "#fb923c" },
];

// ── Bottom Nav ────────────────────────────────────────────────────────────
const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "mapa", label: "Mapa de\nDemanda", icon: MapPin },
  { id: "extrato", label: "Extrato\nDetalhado", icon: List },
  { id: "config", label: "Configurações", icon: Settings },
];

export default function HomeModoPro() {
  const [activeFilter, setActiveFilter] = useState("24H");
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-white">
      {/* ── Status Bar ─────────────────────────────────────────────────── */}
      <div className="px-5 pt-3 shrink-0">
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

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center px-5 pt-3 pb-3 shrink-0">
        <button className="flex items-center gap-1.5 text-white">
          <span className="text-[20px] font-bold">Olá, Marina</span>
          <ChevronDown size={18} className="text-gray-400" />
        </button>
        <div className="flex items-center gap-4">
          <button aria-label="Notificações" className="text-gray-300 hover:text-white transition-colors">
            <Bell size={22} />
          </button>
          <button aria-label="Ajuda" className="text-gray-300 hover:text-white transition-colors">
            <HelpCircle size={22} />
          </button>
        </div>
      </div>

      {/* ── Scrollable Body ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-4">

        {/* ── Resumo do Portfólio ─────────────────────────────────────── */}
        <div className="bg-[#161b22] rounded-2xl p-4 border border-[#30363d]">
          <p className="text-gray-400 text-[12px] font-semibold uppercase tracking-wide mb-3">
            Resumo do portfólio
          </p>
          <div className="flex gap-4">
            {/* Saldo */}
            <div className="flex-1">
              <p className="text-gray-400 text-[11px] mb-1">Saldo disponível</p>
              <p className="text-green-400 text-[22px] font-extrabold leading-tight">
                R$ 12.850,75
              </p>
            </div>
            {/* Separator */}
            <div className="w-px bg-[#30363d] shrink-0" />
            {/* Volume */}
            <div className="flex-1">
              <p className="text-gray-400 text-[11px] mb-1">Volume total</p>
              <p className="text-blue-400 text-[22px] font-extrabold leading-tight">
                8.620 kWh
              </p>
            </div>
          </div>
        </div>

        {/* ── Gráfico ────────────────────────────────────────────────── */}
        <div className="bg-[#161b22] rounded-2xl p-4 border border-[#30363d]">
          {/* Chart header */}
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="text-white text-[14px] font-bold">
                Preço da energia no seu bairro
              </p>
              <p className="text-gray-500 text-[11px]">Últimas 24 horas</p>
            </div>
            <div className="text-right">
              <p className="text-white text-[14px] font-bold">R$ 0,62 /kWh</p>
              <div className="flex items-center justify-end gap-0.5 text-green-400 text-[11px]">
                <TrendingDown size={12} />
                <span>-3,2%</span>
              </div>
            </div>
          </div>

          {/* Chart area with Y-axis */}
          <div className="flex gap-1 mt-2">
            {/* Y labels */}
            <div className="flex flex-col justify-between text-right pr-1 shrink-0" style={{ height: 130 }}>
              {yLabels.map((label) => (
                <span key={label} className="text-gray-500 text-[9px] leading-none">
                  {label}
                </span>
              ))}
            </div>
            {/* SVG Chart */}
            <div className="flex-1 relative">
              <EnergyChart />
            </div>
          </div>

          {/* X labels */}
          <div className="flex justify-between pl-8 mt-1">
            {xLabels.map((label, i) => (
              <span key={`x-${i}`} className="text-gray-500 text-[9px]">
                {label}
              </span>
            ))}
          </div>

          {/* Time filter buttons */}
          <div className="flex gap-2 mt-3">
            {timeFilters.map((f) => (
              <button
                key={f}
                id={`filter-${f.toLowerCase()}`}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
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

        {/* ── Ações Rápidas ───────────────────────────────────────────── */}
        <div>
          <p className="text-white text-[15px] font-bold mb-3">Ações rápidas</p>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                id={`action-${id}`}
                className="bg-[#161b22] border border-[#30363d] rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-[#58a6ff] active:scale-[0.96] transition-all"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <span className="text-gray-300 text-[10px] text-center leading-tight whitespace-pre-line">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Navigation ──────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#161b22] border-t border-[#30363d] flex justify-around items-center py-2 px-2 z-10">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`nav-pro-${id}`}
            aria-label={label.replace("\n", " ")}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-colors ${
              activeTab === id ? "text-green-400" : "text-gray-500"
            }`}
          >
            <Icon
              size={22}
              strokeWidth={activeTab === id ? 2.5 : 1.8}
              className={activeTab === id ? "text-green-400" : "text-gray-500"}
            />
            <span
              className={`text-[9px] font-semibold text-center leading-tight whitespace-pre-line ${
                activeTab === id ? "text-green-400" : "text-gray-500"
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
