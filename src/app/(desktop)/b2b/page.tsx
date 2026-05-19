"use client";

import { useState } from "react";
import {
  Zap,
  LayoutDashboard,
  Map,
  Activity,
  FileText,
  Users,
  BarChart2,
  Settings,
  Bell,
  Database,
  ChevronDown,
  Info,
  ZoomIn,
  ZoomOut,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Save,
} from "lucide-react";

// ── Sidebar nav items ──────────────────────────────────────────────────────
const navItems = [
  { id: "visao",       label: "Visão Geral",           icon: LayoutDashboard, active: true  },
  { id: "mapa",        label: "Mapa de Demanda",        icon: Map,             active: false },
  { id: "monit",       label: "Monitoramento da Rede",  icon: Activity,        active: false },
  { id: "contratos",   label: "Contratos B2B",          icon: FileText,        active: false },
  { id: "usuarios",    label: "Usuários e Permissões",  icon: Users,           active: false },
  { id: "relatorios",  label: "Relatórios",             icon: BarChart2,       active: false },
  { id: "config",      label: "Configurações",          icon: Settings,        active: false },
  { id: "alertas",     label: "Alertas",                icon: Bell,            active: false },
  { id: "logs",        label: "Logs do Sistema",        icon: Database,        active: false },
];

// ── Últimos alertas ────────────────────────────────────────────────────────
const alertas = [
  { cor: "#ef4444", label: "Sobrecarga detectada",      sub: "TR-231 – Centro",              tempo: "Há 5 min"  },
  { cor: "#f59e0b", label: "Limite de taxa excedido",   sub: "Bairro Jardim América",        tempo: "Há 18 min" },
  { cor: "#ef4444", label: "Falha de comunicação",      sub: "TR-189 – Vila Nova",           tempo: "Há 32 min" },
];

// ── Tooltip do mapa (simulado) ─────────────────────────────────────────────
function MapTooltip() {
  return (
    <div className="absolute top-[28%] left-[54%] z-10 bg-white rounded-xl shadow-xl border border-gray-200 px-4 py-3 text-[12px] min-w-[170px]">
      <p className="font-bold text-gray-800 mb-1">Transformador: TR-231</p>
      <p className="text-gray-500">Carga Atual: <span className="text-gray-800 font-semibold">92%</span></p>
      <p className="text-red-600 font-semibold mt-0.5">Status: Sobrecarregado</p>
      {/* small triangle pointer */}
      <div className="absolute -bottom-2 left-5 w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45" />
    </div>
  );
}

// ── Heatmap SVG overlay (simula manchas de calor) ─────────────────────────
function HeatmapOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
      <defs>
        <radialGradient id="hot1" cx="50%" cy="50%">
          <stop offset="0%"   stopColor="#ef4444" stopOpacity="0.70" />
          <stop offset="60%"  stopColor="#f97316" stopOpacity="0.40" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.05" />
        </radialGradient>
        <radialGradient id="hot2" cx="50%" cy="50%">
          <stop offset="0%"   stopColor="#f97316" stopOpacity="0.65" />
          <stop offset="60%"  stopColor="#fbbf24" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.05" />
        </radialGradient>
        <radialGradient id="warm1" cx="50%" cy="50%">
          <stop offset="0%"   stopColor="#fbbf24" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.02" />
        </radialGradient>
        <radialGradient id="cool1" cx="50%" cy="50%">
          <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
        </radialGradient>
      </defs>
      {/* hot spots */}
      <ellipse cx="52%" cy="38%" rx="16%" ry="12%" fill="url(#hot1)" />
      <ellipse cx="35%" cy="55%" rx="13%" ry="10%" fill="url(#hot2)" />
      {/* warm */}
      <ellipse cx="65%" cy="60%" rx="14%" ry="11%" fill="url(#warm1)" />
      {/* cool / low demand */}
      <ellipse cx="20%" cy="40%" rx="12%" ry="9%"  fill="url(#cool1)" />
      <ellipse cx="78%" cy="35%" rx="10%" ry="8%"  fill="url(#cool1)" />
    </svg>
  );
}

export default function PortalB2B() {
  const [activeNav, setActiveNav] = useState("visao");
  const [taxaAtual]  = useState("12,50");
  const [novaTaxa, setNovaTaxa] = useState("12,50");
  const [bairroFilter, setBairroFilter] = useState("Todos");
  const [travarBairro, setTravarBairro] = useState("Todos");
  const [savedTaxa, setSavedTaxa] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">

      {/* ══════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════ */}
      <aside className="w-56 bg-[#0f172a] flex flex-col shrink-0 h-full">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 bg-[#16a34a] rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="text-white text-[18px] font-extrabold tracking-wide">FLUXO</span>
          </div>
          <p className="text-slate-400 text-[11px] ml-9">Portal Concessionária</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium transition-all text-left group ${
                activeNav === id
                  ? "bg-[#16a34a] text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={16} className={activeNav === id ? "text-white" : "text-slate-500 group-hover:text-white"} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shrink-0">
          {/* Page title */}
          <div className="flex items-center gap-2 mr-4">
            <h1 className="text-gray-800 font-bold text-[15px]">Mapa de Demanda em Tempo Real</h1>
            <button className="text-gray-400 hover:text-gray-600"><Info size={14} /></button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            {/* Bairro */}
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-[12px] text-gray-600 cursor-pointer hover:border-gray-400 transition-colors">
              <span className="text-gray-400 text-[11px] font-medium">Bairro</span>
              <select
                value={bairroFilter}
                onChange={(e) => setBairroFilter(e.target.value)}
                className="bg-transparent outline-none text-gray-700 font-medium text-[12px] cursor-pointer"
              >
                <option>Todos</option>
                <option>Centro</option>
                <option>Jardim América</option>
                <option>Vila Nova</option>
                <option>Bela Vista</option>
              </select>
            </div>

            {/* Transformador */}
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-[12px] text-gray-600 cursor-pointer hover:border-gray-400 transition-colors">
              <span className="text-gray-400 text-[11px] font-medium">Transformador</span>
              <select className="bg-transparent outline-none text-gray-700 font-medium text-[12px] cursor-pointer">
                <option>Todos</option>
                <option>TR-231</option>
                <option>TR-189</option>
                <option>TR-045</option>
              </select>
            </div>

            {/* Data */}
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-[12px] text-gray-600 hover:border-gray-400 transition-colors">
              <span className="text-gray-400 text-[11px] font-medium">Data</span>
              <input
                type="date"
                defaultValue="2024-05-12"
                className="bg-transparent outline-none text-gray-700 font-medium text-[12px] cursor-pointer"
              />
            </div>

            {/* Horário */}
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-[12px] text-gray-600 hover:border-gray-400 transition-colors">
              <span className="text-gray-400 text-[11px] font-medium">Horário</span>
              <input
                type="time"
                defaultValue="14:00"
                className="bg-transparent outline-none text-gray-700 font-medium text-[12px] cursor-pointer"
              />
            </div>

            <button className="bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] transition-all text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg">
              Aplicar filtros
            </button>
          </div>

          {/* User */}
          <div className="flex items-center gap-2 ml-auto cursor-pointer hover:bg-gray-50 rounded-xl px-3 py-1.5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center text-white text-[13px] font-bold">
              R
            </div>
            <div className="text-right leading-tight">
              <p className="text-gray-800 text-[13px] font-semibold">Roberto</p>
              <p className="text-gray-400 text-[11px]">Administrador</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </header>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden p-4 gap-4">

          {/* ── MAPA ─────────────────────────────────────────── */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            {/* Map area */}
            <div className="flex-1 relative overflow-hidden bg-[#e8ede4]">
              {/* Fake map base (street grid simulation) */}
              <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                {/* Horizontal roads */}
                {[15,25,35,42,52,62,72,80].map(y => (
                  <line key={`h${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#94a3b8" strokeWidth="1" />
                ))}
                {/* Vertical roads */}
                {[10,20,32,45,56,67,78,88].map(x => (
                  <line key={`v${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#94a3b8" strokeWidth="1" />
                ))}
                {/* Diagonal avenue */}
                <line x1="5%" y1="85%" x2="60%" y2="15%" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="30%" y1="90%" x2="90%" y2="25%" stroke="#94a3b8" strokeWidth="1.5" />
              </svg>

              {/* Heatmap blobs */}
              <HeatmapOverlay />

              {/* Bairro labels */}
              {[
                { name: "Eritropo",      top: "8%",  left: "18%" },
                { name: "Jardim América",top: "30%", left: "8%"  },
                { name: "Vila Frias",    top: "30%", left: "42%" },
                { name: "Bela Vista",    top: "62%", left: "55%" },
                { name: "Bela Miguel",   top: "78%", left: "28%" },
                { name: "São Miguel",    top: "68%", left: "74%" },
              ].map(({ name, top, left }) => (
                <span
                  key={name}
                  className="absolute text-[11px] font-semibold text-gray-600 select-none drop-shadow-sm"
                  style={{ top, left }}
                >
                  {name}
                </span>
              ))}

              {/* Tooltip */}
              <MapTooltip />

              {/* Zoom controls */}
              <div className="absolute top-3 right-3 flex flex-col gap-1">
                {[ZoomIn, ZoomOut, Layers].map((Icon, i) => (
                  <button
                    key={i}
                    className="w-8 h-8 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="px-4 py-2 flex items-center gap-3 border-t border-gray-100">
              <span className="text-gray-400 text-[11px]">Baixa demanda</span>
              <div className="flex-1 h-3 rounded-full"
                style={{background: "linear-gradient(to right, #22c55e, #fbbf24, #f97316, #ef4444)"}}
              />
              <span className="text-gray-400 text-[11px]">Alta demanda</span>
            </div>
          </div>

          {/* ── PAINEL DIREITO ────────────────────────────────── */}
          <div className="w-72 flex flex-col gap-3 overflow-y-auto shrink-0">

            {/* Ajustar Taxa */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h2 className="text-gray-800 text-[13px] font-bold mb-3">Ações e Controles da Rede</h2>
              <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide mb-2">
                Ajustar Taxa de Serviço
              </p>
              <div className="flex items-end gap-2 mb-3">
                <div className="flex-1">
                  <p className="text-gray-400 text-[10px] mb-1">Taxa atual média</p>
                  <p className="text-gray-800 text-[20px] font-extrabold leading-tight">{taxaAtual}%</p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-[10px] mb-1">Nova taxa (%)</p>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      value={novaTaxa}
                      onChange={(e) => { setNovaTaxa(e.target.value); setSavedTaxa(false); }}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-gray-800 outline-none focus:border-[#16a34a] transition-colors"
                    />
                    <span className="text-gray-400 text-[12px]">%</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSavedTaxa(true)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-bold transition-all active:scale-[0.97] ${
                  savedTaxa
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-[#16a34a] hover:bg-[#15803d] text-white shadow-sm"
                }`}
              >
                {savedTaxa ? <><CheckCircle2 size={14} /> Salvo!</> : <><Save size={14} /> Salvar alteração</>}
              </button>
            </div>

            {/* Travar Vendas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide mb-2">
                Travar Vendas no Bairro
              </p>
              <div className="mb-2">
                <p className="text-gray-400 text-[10px] mb-1">Selecione o bairro</p>
                <select
                  value={travarBairro}
                  onChange={(e) => setTravarBairro(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] text-gray-800 outline-none focus:border-red-400 transition-colors"
                >
                  <option>Todos</option>
                  <option>Centro</option>
                  <option>Jardim América</option>
                  <option>Vila Nova</option>
                  <option>Bela Vista</option>
                </select>
              </div>
              <div className="mb-3">
                <p className="text-gray-400 text-[10px] mb-1">Motivo (opcional)</p>
                <input
                  type="text"
                  placeholder="Ex: Sobrecarga de rede"
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] text-gray-700 outline-none focus:border-red-400 transition-colors placeholder-gray-300"
                />
              </div>
              <button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-[0.97] transition-all text-white font-bold text-[13px] py-2.5 rounded-xl shadow-sm shadow-red-200">
                <Lock size={14} />
                Travar vendas
              </button>
            </div>

            {/* Resumo da Rede */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide mb-3">
                Resumo da Rede
              </p>
              {[
                { label: "Carga média da rede",       value: "68%",  color: "text-orange-500" },
                { label: "Transformadores críticos",   value: "14",   color: "text-red-500"    },
                { label: "Alertas ativos",             value: "7",    color: "text-red-500"    },
                { label: "Áreas bloqueadas",           value: "3",    color: "text-gray-800"   },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500 text-[12px]">{label}</span>
                  <span className={`text-[13px] font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* Últimos Alertas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide mb-3">
                Últimos Alertas
              </p>
              <div className="flex flex-col gap-2.5">
                {alertas.map(({ cor, label, sub, tempo }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: cor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-[12px] font-semibold leading-tight">{label}</p>
                      <p className="text-gray-400 text-[11px] truncate">{sub}</p>
                    </div>
                    <span className="text-gray-400 text-[10px] shrink-0 pt-0.5">{tempo}</span>
                  </div>
                ))}
              </div>
              <button className="mt-3 text-[#16a34a] text-[12px] font-semibold hover:underline transition-all">
                Ver todos os alertas
              </button>
            </div>

          </div>{/* end right panel */}
        </div>{/* end body */}
      </div>{/* end main */}
    </div>
  );
}
