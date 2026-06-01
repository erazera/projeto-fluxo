"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  LayoutDashboard,
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
  X,
  Thermometer,
  Wrench,
  AlertCircle,
  Server,
  TrendingUp,
  Download,
  XCircle,
  Briefcase,
  PiggyBank,
  Trash2,
  Plus,
  Building,
  Shield,
  Key,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  Loader2,
  FileDown,
} from "lucide-react";

// ── Sidebar nav items ──────────────────────────────────────────────────────
const navItems = [
  { id: "visao",      label: "Visão Geral",           icon: LayoutDashboard },
  { id: "monit",      label: "Monitoramento da Rede",  icon: Activity        },
  { id: "contratos",  label: "Contratos B2B",          icon: FileText        },
  { id: "usuarios",   label: "Usuários e Permissões",  icon: Users           },
  { id: "relatorios", label: "Relatórios",             icon: BarChart2       },
  { id: "config",     label: "Configurações",          icon: Settings        },
  { id: "alertas",    label: "Alertas",                icon: Bell            },
  { id: "logs",       label: "Logs do Sistema",        icon: Database        },
];

// ── Dados Mock: Transformadores ──────────────────────────────────────────────────
interface Transformador {
  id: string;
  bairro: string;
  carga: number;   // %
  temp: number;    // °C
}

const TRANSFORMADORES: Transformador[] = [
  { id: "TR-231", bairro: "Centro",         carga: 92, temp: 78 },
  { id: "TR-045", bairro: "Jardim América", carga: 88, temp: 74 },
  { id: "TR-189", bairro: "Vila Nova",      carga: 71, temp: 61 },
  { id: "TR-302", bairro: "Bela Vista",     carga: 45, temp: 42 },
  { id: "TR-117", bairro: "Vila Frias",     carga: 60, temp: 55 },
  { id: "TR-408", bairro: "São Miguel",    carga: 95, temp: 82 },
  { id: "TR-055", bairro: "Eritropo",       carga: 38, temp: 36 },
  { id: "TR-210", bairro: "Bela Miguel",    carga: 83, temp: 69 },
];

// ── Dados Mock: Contratos ────────────────────────────────────────────────────────
export interface Contrato {
  id: string;
  produtor: string;
  volume: number;
  duracao: number;
  preco: number;
  tag: string;
  tagCor: "verde" | "vermelha";
  status: "Pendente" | "Ativo";
  validade?: string;
}

const CONTRATOS_MOCK: Contrato[] = [
  { id: "CTR-901", produtor: "Fazenda Sol Nascente", volume: 5000, duracao: 6, preco: 0.55, tag: "10% abaixo do mercado", tagCor: "verde", status: "Pendente" },
  { id: "CTR-902", produtor: "Sítio das Águas", volume: 2500, duracao: 12, preco: 0.75, tag: "Preço alto", tagCor: "vermelha", status: "Pendente" },
  { id: "CTR-105", produtor: "Agro Vale", volume: 10000, duracao: 24, preco: 0.42, tag: "Excelente negócio", tagCor: "verde", status: "Ativo", validade: "2026-12-01" },
  { id: "CTR-108", produtor: "Usina Solar Horizonte", volume: 20000, duracao: 12, preco: 0.48, tag: "Preço de mercado", tagCor: "verde", status: "Ativo", validade: "2025-08-15" },
  { id: "CTR-112", produtor: "Fazenda Esperança", volume: 15000, duracao: 6, preco: 0.51, tag: "Margem aceitável", tagCor: "verde", status: "Ativo", validade: "2025-02-28" },
];

// ── Dados Mock: Usuários ────────────────────────────────────────────────────────
export interface UsuarioB2B {
  id: string;
  name: string;
  email: string;
  role: "Administrador" | "Operador de Rede" | "Analista Financeiro";
  status: "Ativo";
  isCurrentUser: boolean;
}

const USUARIOS_MOCK: UsuarioB2B[] = [
  { id: "1", name: "Roberto", email: "roberto@fluxo.com", role: "Administrador", status: "Ativo", isCurrentUser: true },
  { id: "2", name: "Marina Silva", email: "marina.op@fluxo.com", role: "Operador de Rede", status: "Ativo", isCurrentUser: false },
  { id: "3", name: "Carlos Andrade", email: "carlos.fin@fluxo.com", role: "Analista Financeiro", status: "Ativo", isCurrentUser: false },
];

// ── Dados Mock: Relatórios ───────────────────────────────────────────────────────
const RECENT_REPORTS = [
  { id: 1, name: "Fechamento Mensal - Maio 2026.pdf", date: "31/05/2026", size: "2.4 MB" },
  { id: 2, name: "Relatório de Sobrecargas - TRs.pdf", date: "28/05/2026", size: "1.1 MB" },
  { id: 3, name: "Auditoria Financeira Q1.pdf", date: "15/04/2026", size: "4.8 MB" },
];

type ReportPeriod = "7d" | "30d" | "ano";

const REPORT_DATA: Record<ReportPeriod, any> = {
  "7d": {
    energia: "24.500",
    economia: "8.100",
    picos: 2,
    chart: [
      { label: "Seg", value: 30, text: "3.000 kWh" },
      { label: "Ter", value: 45, text: "4.500 kWh" },
      { label: "Qua", value: 20, text: "2.000 kWh" },
      { label: "Qui", value: 60, text: "6.000 kWh" },
      { label: "Sex", value: 80, text: "8.000 kWh" },
      { label: "Sáb", value: 25, text: "2.500 kWh" },
      { label: "Dom", value: 15, text: "1.500 kWh" },
    ]
  },
  "30d": {
    energia: "125.000",
    economia: "45.200",
    picos: 14,
    chart: [
      { label: "Sem 1", value: 50, text: "25.000 kWh" },
      { label: "Sem 2", value: 70, text: "35.000 kWh" },
      { label: "Sem 3", value: 40, text: "20.000 kWh" },
      { label: "Sem 4", value: 90, text: "45.000 kWh" },
    ]
  },
  "ano": {
    energia: "1.450.000",
    economia: "512.000",
    picos: 87,
    chart: [
      { label: "Jan", value: 60, text: "120k kWh" },
      { label: "Fev", value: 55, text: "110k kWh" },
      { label: "Mar", value: 70, text: "140k kWh" },
      { label: "Abr", value: 45, text: "90k kWh" },
      { label: "Mai", value: 80, text: "160k kWh" },
      { label: "Jun", value: 95, text: "190k kWh" },
    ]
  }
};

// ── Dados Mock: Configurações ──────────────────────────────────────────────────
export interface B2BSettings {
  empresa: { nome: string; cnpj: string; email: string };
  notificacoes: { sobrecarga: boolean; contratos: boolean; relatorios: boolean };
  seguranca: { apiKey: string };
}

const DEFAULT_SETTINGS: B2BSettings = {
  empresa: { nome: "Concessionária Local", cnpj: "12.345.678/0001-90", email: "suporte@concessionaria.com.br" },
  notificacoes: { sobrecarga: true, contratos: true, relatorios: false },
  seguranca: { apiKey: "sk_live_fluxo_987654321" }
};

// ── Dados Mock: Alertas do Sistema ──────────────────────────────────────────
export interface AlertaSistema {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  status: "active" | "resolved";
}

const ALERTAS_MOCK: AlertaSistema[] = [
  { id: "ALT-1042", timestamp: "Hoje, 14:30", title: "Sobrecarga no Transformador TR-231", description: "Pico de 92% de capacidade detectado durante 15 minutos consecutivos no bairro Centro.", severity: "critical", status: "active" },
  { id: "ALT-1043", timestamp: "Hoje, 10:15", title: "Limite de Taxa B2B Atingido", description: "O limite de transações automáticas na Vila Nova foi atingido por alto consumo.", severity: "warning", status: "active" },
  { id: "ALT-1044", timestamp: "Ontem, 08:00", title: "Manutenção Preventiva Concluída", description: "A equipe técnica finalizou a inspeção nos equipamentos do Jardim América.", severity: "info", status: "active" }
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

  // ── Taxa de Serviço ──────────────────────────────────────────────────
  const [taxaAtual, setTaxaAtual] = useState("12,50");
  const [novaTaxa, setNovaTaxa] = useState("12,50");
  const [taxaToast, setTaxaToast] = useState<string | null>(null);

  // ── Bairros Bloqueados ─────────────────────────────────────────────
  const [bairroFilter, setBairroFilter] = useState("Todos");
  const [travarBairro, setTravarBairro] = useState("Centro");
  const [travarMotivo, setTravarMotivo] = useState("");
  const [bairrosBloqueados, setBairrosBloqueados] = useState<{ id: string; bairro: string; motivo: string }[]>([]);
  const [bairroToast, setBairroToast] = useState<string | null>(null);

  // ── Carregar do localStorage ───────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const taxa = localStorage.getItem("fluxo_b2b_taxa");
    if (taxa) {
      setTaxaAtual(taxa);
      setNovaTaxa(taxa);
    }
    try {
      const bairros = localStorage.getItem("fluxo_b2b_bairros_travados");
      if (bairros) setBairrosBloqueados(JSON.parse(bairros));
    } catch {}
  }, []);

  // ── Ações ────────────────────────────────────────────────────────
  function salvarTaxa() {
    if (!novaTaxa) return;
    setTaxaAtual(novaTaxa);
    localStorage.setItem("fluxo_b2b_taxa", novaTaxa);
    setTaxaToast("Taxa atualizada com sucesso");
    setTimeout(() => setTaxaToast(null), 3000);
  }

  function travarVendas() {
    if (!travarBairro) return;
    // Evitar duplicatas
    const jaBloqueado = bairrosBloqueados.some((b) => b.bairro === travarBairro);
    if (jaBloqueado) {
      setBairroToast(`"${travarBairro}" já está bloqueado.`);
      setTimeout(() => setBairroToast(null), 3000);
      return;
    }
    const novo = { id: Date.now().toString(), bairro: travarBairro, motivo: travarMotivo };
    const novos = [...bairrosBloqueados, novo];
    setBairrosBloqueados(novos);
    localStorage.setItem("fluxo_b2b_bairros_travados", JSON.stringify(novos));
    setTravarMotivo("");
    setBairroToast(`Vendas travadas em "${travarBairro}"`);
    setTimeout(() => setBairroToast(null), 3000);
  }

  function destravarBairro(id: string, nome: string) {
    const novos = bairrosBloqueados.filter((b) => b.id !== id);
    setBairrosBloqueados(novos);
    localStorage.setItem("fluxo_b2b_bairros_travados", JSON.stringify(novos));
    setBairroToast(`"${nome}" desbloqueado com sucesso.`);
    setTimeout(() => setBairroToast(null), 3000);
  }

  // ── Estado: Monitoramento da Rede ─────────────────────────────────────
  const [threshold, setThreshold] = useState(85);
  const [thresholdInput, setThresholdInput] = useState("85");
  const [thresholdToast, setThresholdToast] = useState<string | null>(null);
  const [emManutencao, setEmManutencao] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("fluxo_b2b_threshold");
    if (saved) {
      const n = Number(saved);
      setThreshold(n);
      setThresholdInput(saved);
    }
    try {
      const manut = localStorage.getItem("fluxo_b2b_maintenance");
      if (manut) setEmManutencao(JSON.parse(manut));
    } catch {}
  }, []);

  function salvarThreshold() {
    const n = Number(thresholdInput);
    if (isNaN(n) || n < 1 || n > 100) return;
    setThreshold(n);
    localStorage.setItem("fluxo_b2b_threshold", String(n));
    setThresholdToast("Limite salvo com sucesso");
    setTimeout(() => setThresholdToast(null), 3000);
  }

  function despacharEquipe(trId: string) {
    const novos = [...emManutencao, trId];
    setEmManutencao(novos);
    localStorage.setItem("fluxo_b2b_maintenance", JSON.stringify(novos));
  }

  function concluirManutencao(trId: string) {
    const novos = emManutencao.filter((id) => id !== trId);
    setEmManutencao(novos);
    localStorage.setItem("fluxo_b2b_maintenance", JSON.stringify(novos));
  }

  // KPIs dinâmicos para o Monitoramento
  const criticos = TRANSFORMADORES.filter(
    (t) => t.carga > threshold && !emManutencao.includes(t.id)
  ).length;
  const cargaMedia = Math.round(
    TRANSFORMADORES.reduce((s, t) => s + t.carga, 0) / TRANSFORMADORES.length
  );

  // ── Estado: Contratos B2B ──────────────────────────────────────────────
  const [contratosTab, setContratosTab] = useState<"pendentes" | "ativos">("pendentes");
  const [contratosList, setContratosList] = useState<Contrato[]>(CONTRATOS_MOCK);
  const [contratoToast, setContratoToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("fluxo_b2b_contratos");
      if (saved) setContratosList(JSON.parse(saved));
      else localStorage.setItem("fluxo_b2b_contratos", JSON.stringify(CONTRATOS_MOCK));
    } catch {}
  }, []);

  function aprovarContrato(id: string) {
    const atualizados = contratosList.map(c => {
      if (c.id === id) {
        const d = new Date();
        d.setMonth(d.getMonth() + c.duracao);
        const validade = d.toISOString().split("T")[0];
        return { ...c, status: "Ativo" as const, validade };
      }
      return c;
    });
    setContratosList(atualizados);
    localStorage.setItem("fluxo_b2b_contratos", JSON.stringify(atualizados));
    const nome = contratosList.find(c => c.id === id)?.produtor || "";
    setContratoToast(`Contrato com ${nome} aprovado e ativado!`);
    setTimeout(() => setContratoToast(null), 4000);
  }

  function recusarContrato(id: string) {
    const atualizados = contratosList.filter(c => c.id !== id);
    setContratosList(atualizados);
    localStorage.setItem("fluxo_b2b_contratos", JSON.stringify(atualizados));
    const nome = contratosList.find(c => c.id === id)?.produtor || "";
    setContratoToast(`Proposta de ${nome} foi recusada.`);
    setTimeout(() => setContratoToast(null), 4000);
  }

  const contratosPendentes = contratosList.filter(c => c.status === "Pendente");
  const contratosAtivos = contratosList.filter(c => c.status === "Ativo");
  
  const volumeTotal = contratosAtivos.reduce((acc, c) => acc + c.volume, 0);
  const custoMedio = contratosAtivos.length > 0 
    ? (contratosAtivos.reduce((acc, c) => acc + c.preco, 0) / contratosAtivos.length).toFixed(2)
    : "0.00";

  // ── Estado: Usuários B2B ───────────────────────────────────────────────
  const [usuariosList, setUsuariosList] = useState<UsuarioB2B[]>(USUARIOS_MOCK);
  const [usuariosToast, setUsuariosToast] = useState<string | null>(null);
  const [isNovoUsuarioModalOpen, setIsNovoUsuarioModalOpen] = useState(false);
  const [novoUsuarioForm, setNovoUsuarioForm] = useState({ nome: "", email: "", role: "Operador de Rede" as const });
  const [usuarioToDelete, setUsuarioToDelete] = useState<UsuarioB2B | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedUsers = localStorage.getItem("fluxo_b2b_users");
      if (savedUsers) setUsuariosList(JSON.parse(savedUsers));
      else localStorage.setItem("fluxo_b2b_users", JSON.stringify(USUARIOS_MOCK));
    } catch {}
  }, []);

  function handleRoleChange(id: string, newRole: "Administrador" | "Operador de Rede" | "Analista Financeiro") {
    const novos = usuariosList.map(u => u.id === id ? { ...u, role: newRole } : u);
    setUsuariosList(novos);
    localStorage.setItem("fluxo_b2b_users", JSON.stringify(novos));
    setUsuariosToast("Cargo atualizado");
    setTimeout(() => setUsuariosToast(null), 3000);
  }

  function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!novoUsuarioForm.nome || !novoUsuarioForm.email) return;
    const novo: UsuarioB2B = {
      id: Date.now().toString(),
      name: novoUsuarioForm.nome,
      email: novoUsuarioForm.email,
      role: novoUsuarioForm.role as any,
      status: "Ativo",
      isCurrentUser: false,
    };
    const novos = [...usuariosList, novo];
    setUsuariosList(novos);
    localStorage.setItem("fluxo_b2b_users", JSON.stringify(novos));
    setIsNovoUsuarioModalOpen(false);
    setNovoUsuarioForm({ nome: "", email: "", role: "Operador de Rede" });
    setUsuariosToast("Usuário criado com sucesso.");
    setTimeout(() => setUsuariosToast(null), 3000);
  }

  function handleDeleteUser() {
    if (!usuarioToDelete) return;
    const novos = usuariosList.filter(u => u.id !== usuarioToDelete.id);
    setUsuariosList(novos);
    localStorage.setItem("fluxo_b2b_users", JSON.stringify(novos));
    setUsuarioToDelete(null);
    setUsuariosToast("Usuário excluído com sucesso.");
    setTimeout(() => setUsuariosToast(null), 3000);
  }

  // ── Estado: Relatórios ─────────────────────────────────────────────────
  const [reportPeriodo, setReportPeriodo] = useState<ReportPeriod>("30d");
  const [isExporting, setIsExporting] = useState(false);
  const [reportToast, setReportToast] = useState<string | null>(null);

  const currentReport = REPORT_DATA[reportPeriodo];

  function handleExportReport() {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setReportToast("Relatório exportado com sucesso!");
      setTimeout(() => setReportToast(null), 4000);
    }, 2000);
  }

  // ── Estado: Configurações ──────────────────────────────────────────────
  const [configTab, setConfigTab] = useState<"empresa" | "notificacoes" | "seguranca">("empresa");
  const [configData, setConfigData] = useState<B2BSettings>(DEFAULT_SETTINGS);
  const [configToast, setConfigToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("fluxo_b2b_settings");
      if (saved) setConfigData(JSON.parse(saved));
      else localStorage.setItem("fluxo_b2b_settings", JSON.stringify(DEFAULT_SETTINGS));
    } catch {}
  }, []);

  function handleSaveConfig() {
    localStorage.setItem("fluxo_b2b_settings", JSON.stringify(configData));
    setConfigToast("Configurações salvas com sucesso!");
    setTimeout(() => setConfigToast(null), 3000);
  }

  function handleGenerateApiKey() {
    const newKey = "sk_live_fluxo_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    const newData = { ...configData, seguranca: { apiKey: newKey } };
    setConfigData(newData);
    localStorage.setItem("fluxo_b2b_settings", JSON.stringify(newData));
    setConfigToast("Nova chave gerada e salva com sucesso!");
    setTimeout(() => setConfigToast(null), 3000);
  }

  // ── Estado: Alertas do Sistema ──────────────────────────────────────────────
  const [alertasSistema, setAlertasSistema] = useState<AlertaSistema[]>(ALERTAS_MOCK);
  const [alertasTab, setAlertasTab] = useState<"ativos" | "historico">("ativos");
  const [alertasToast, setAlertasToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("fluxo_b2b_alerts");
      if (saved) setAlertasSistema(JSON.parse(saved));
      else localStorage.setItem("fluxo_b2b_alerts", JSON.stringify(ALERTAS_MOCK));
    } catch {}
  }, []);

  function handleResolveAlert(id: string) {
    const novos = alertasSistema.map(a => a.id === id ? { ...a, status: "resolved" as const } : a);
    setAlertasSistema(novos);
    localStorage.setItem("fluxo_b2b_alerts", JSON.stringify(novos));
    setAlertasToast(`Alerta ${id} resolvido e arquivado.`);
    setTimeout(() => setAlertasToast(null), 3000);
  }

  const ativosAlertas = alertasSistema.filter(a => a.status === "active");
  const resolvidosAlertas = alertasSistema.filter(a => a.status === "resolved");

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

      {/* Global Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Area 1: Global Top Bar */}
        <header className="w-full flex justify-end items-center py-4 px-6 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl px-3 py-1.5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center text-white text-[13px] font-bold">R</div>
            <div className="text-right leading-tight">
              <p className="text-gray-800 text-[13px] font-semibold">Roberto</p>
              <p className="text-gray-400 text-[11px]">Administrador</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </header>

        {/* Views Container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* ═ MAIN CONTENT: Visão Geral (Mapa) ═ */}
          {activeNav === "visao" && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">

              {/* Area 2: Page Header & Filters */}
              <div className="w-full flex flex-col xl:flex-row justify-between items-start xl:items-center mt-6 mb-6 px-6 gap-4 shrink-0">
                
                {/* Left side: Page title */}
                <div className="flex items-center gap-2">
                  <h1 className="text-gray-800 font-bold text-2xl">Mapa de Demanda em Tempo Real</h1>
                  <button className="text-gray-400 hover:text-gray-600"><Info size={16} /></button>
                </div>

                {/* Right side: Filters */}
                <div className="flex flex-wrap items-center gap-3">
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

                  <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-[12px] text-gray-600 cursor-pointer hover:border-gray-400 transition-colors">
                    <span className="text-gray-400 text-[11px] font-medium">Transformador</span>
                    <select className="bg-transparent outline-none text-gray-700 font-medium text-[12px] cursor-pointer">
                      <option>Todos</option>
                      <option>TR-231</option>
                      <option>TR-189</option>
                      <option>TR-045</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-[12px] text-gray-600 hover:border-gray-400 transition-colors">
                    <span className="text-gray-400 text-[11px] font-medium">Data</span>
                    <input
                      type="date"
                      defaultValue="2024-05-12"
                      className="bg-transparent outline-none text-gray-700 font-medium text-[12px] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-[12px] text-gray-600 hover:border-gray-400 transition-colors">
                    <span className="text-gray-400 text-[11px] font-medium">Horário</span>
                    <input
                      type="time"
                      defaultValue="14:00"
                      className="bg-transparent outline-none text-gray-700 font-medium text-[12px] cursor-pointer"
                    />
                  </div>

                  <button className="bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] transition-all text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg h-[34px]">
                    Aplicar filtros
                  </button>
                </div>
              </div>

              {/* BODY: Mapa */}
              <div className="flex-1 flex overflow-hidden px-6 pb-6 pt-0 gap-4">
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="flex-1 relative overflow-hidden bg-[#e8ede4]">
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
                      onChange={(e) => setNovaTaxa(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-gray-800 outline-none focus:border-[#16a34a] transition-colors"
                    />
                    <span className="text-gray-400 text-[12px]">%</span>
                  </div>
                </div>
              </div>
              {/* ── Aria Live toast feedback (WCAG 4.1.3) ── */}
              <div className="sr-only" aria-live="polite" aria-atomic="true">{taxaToast}</div>

              <button
                onClick={salvarTaxa}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-bold transition-all active:scale-[0.97] bg-[#16a34a] hover:bg-[#15803d] text-white shadow-sm"
              >
                <Save size={14} aria-hidden="true" /> Salvar alteração
              </button>

              {/* Toast visual */}
              {taxaToast && (
                <div className="flex items-center gap-1.5 mt-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold" role="status">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  {taxaToast}
                </div>
              )}
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
                  <option>Centro</option>
                  <option>Jardim América</option>
                  <option>Vila Nova</option>
                  <option>Bela Vista</option>
                  <option>Vila Frias</option>
                  <option>Eritropo</option>
                  <option>Bela Miguel</option>
                  <option>São Miguel</option>
                </select>
              </div>
              <div className="mb-3">
                <p className="text-gray-400 text-[10px] mb-1">Motivo (opcional)</p>
                <input
                  type="text"
                  value={travarMotivo}
                  onChange={(e) => setTravarMotivo(e.target.value)}
                  placeholder="Ex: Sobrecarga de rede"
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] text-gray-700 outline-none focus:border-red-400 transition-colors placeholder-gray-300"
                />
              </div>

              {/* ── Aria Live toast feedback (WCAG 4.1.3) ── */}
              <div className="sr-only" aria-live="polite" aria-atomic="true">{bairroToast}</div>

              <button
                onClick={travarVendas}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-[0.97] transition-all text-white font-bold text-[13px] py-2.5 rounded-xl shadow-sm shadow-red-200"
              >
                <Lock size={14} aria-hidden="true" />
                Travar vendas
              </button>

              {/* Toast visual */}
              {bairroToast && (
                <div className="flex items-center gap-1.5 mt-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold" role="status">
                  <AlertTriangle size={13} aria-hidden="true" />
                  {bairroToast}
                </div>
              )}

              {/* ── Lista de Bairros Bloqueados ── */}
              {bairrosBloqueados.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide mb-2">Bairros bloqueados agora</p>
                  <div className="flex flex-wrap gap-1.5">
                    {bairrosBloqueados.map(({ id, bairro, motivo }) => (
                      <span
                        key={id}
                        title={motivo || bairro}
                        className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      >
                        {bairro}
                        <button
                          aria-label={`Destravar bairro ${bairro}`}
                          onClick={() => destravarBairro(id, bairro)}
                          className="ml-0.5 rounded-full hover:bg-red-200 transition-colors p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                        >
                          <X size={10} aria-hidden="true" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
      </div>/* end visao view */
      )}

      {/* ═ MAIN CONTENT: Monitoramento da Rede ═ */}
          {activeNav === "monit" && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">

              {/* Area 2: Page Header & Filters */}
              <div className="w-full flex flex-col xl:flex-row justify-between items-start xl:items-center mt-6 mb-6 px-6 gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Activity size={24} className="text-[#16a34a]" aria-hidden="true" />
                  <h1 className="text-gray-800 font-bold text-2xl">Monitoramento da Infraestrutura</h1>
                </div>

                {/* Right Side: Filters */}
                <div className="flex flex-wrap items-center gap-3 relative">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                    <label htmlFor="threshold-input" className="text-gray-500 text-[12px] font-medium whitespace-nowrap">Limite de Alerta Geral:</label>
                    <input
                      id="threshold-input"
                      type="number" min="1" max="100"
                      value={thresholdInput}
                      onChange={(e) => setThresholdInput(e.target.value)}
                      className="w-14 border border-gray-200 rounded-md px-2 py-1 text-[12px] font-bold text-gray-800 outline-none focus:border-[#16a34a] text-center transition-colors bg-white"
                    />
                    <span className="text-gray-400 text-[12px]">%</span>
                    <button onClick={salvarThreshold} className="bg-[#16a34a] hover:bg-[#15803d] text-white text-[12px] font-semibold px-3 py-1 rounded-md transition-all active:scale-[0.97] flex items-center gap-1">
                      <Save size={12} aria-hidden="true" /> Salvar
                    </button>
                  </div>
                  
                  <div className="sr-only" aria-live="polite" aria-atomic="true">{thresholdToast}</div>
                  {thresholdToast && (
                    <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold absolute -top-12 right-0" role="status">
                      <CheckCircle2 size={13} aria-hidden="true" /> {thresholdToast}
                    </div>
                  )}
                </div>
              </div>

              {/* BODY: Monitoramento */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0">

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: "Transformadores Ativos", value: TRANSFORMADORES.length, icon: Server, color: "text-blue-600", bg: "bg-blue-50", suffix: "" },
                { label: "Carga Média da Rede", value: cargaMedia, icon: TrendingUp, color: cargaMedia > threshold ? "text-orange-600" : "text-[#16a34a]", bg: cargaMedia > threshold ? "bg-orange-50" : "bg-green-50", suffix: "%" },
                { label: "Alertas Críticos", value: criticos, icon: AlertCircle, color: criticos > 0 ? "text-red-600" : "text-[#16a34a]", bg: criticos > 0 ? "bg-red-50" : "bg-green-50", suffix: "" },
              ].map(({ label, value, icon: Icon, color, bg, suffix }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={22} className={color} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-[11px] font-medium mb-0.5">{label}</p>
                    <p className={`text-[26px] font-extrabold leading-none ${color}`}>{value}{suffix}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabela de Transformadores */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <p className="text-gray-800 text-[13px] font-bold">Equipamentos da Rede</p>
                <p className="text-gray-400 text-[12px]">Limiar atual: <span className="font-bold text-gray-600">{threshold}%</span></p>
              </div>
              <table className="w-full text-[13px]" role="table">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["ID do Equipamento", "Bairro", "Carga Atual", "Temperatura", "Status", "Ação"].map((col) => (
                      <th key={col} scope="col" className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TRANSFORMADORES.map((tr) => {
                    const emManut = emManutencao.includes(tr.id);
                    const isCritico = tr.carga > threshold && !emManut;
                    const status = emManut ? "manut" : isCritico ? "critico" : "normal";
                    return (
                      <tr key={tr.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3"><span className="font-bold text-gray-800 font-mono">{tr.id}</span></td>
                        <td className="px-5 py-3 text-gray-600">{tr.bairro}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden" aria-hidden="true">
                              <div className={`h-full rounded-full transition-all ${isCritico ? "bg-red-500" : emManut ? "bg-amber-400" : "bg-[#16a34a]"}`} style={{ width: `${tr.carga}%` }} />
                            </div>
                            <span className={`font-bold tabular-nums ${isCritico ? "text-red-600" : emManut ? "text-amber-600" : "text-gray-700"}`}>{tr.carga}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`flex items-center gap-1 ${tr.temp >= 75 ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                            <Thermometer size={13} aria-hidden="true" />{tr.temp}°C
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {status === "critico" && <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />Crítico</span>}
                          {status === "manut"   && <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-bold px-2.5 py-1 rounded-full"><Wrench size={11} aria-hidden="true" />Em Manutenção</span>}
                          {status === "normal"  && <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200 text-[11px] font-bold px-2.5 py-1 rounded-full"><CheckCircle2 size={11} aria-hidden="true" />Normal</span>}
                        </td>
                        <td className="px-5 py-3">
                          {status === "critico" && (
                            <button onClick={() => despacharEquipe(tr.id)} aria-label={`Despachar equipe para ${tr.id}`} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-[0.97] shadow-sm shadow-red-200">
                              <Wrench size={12} aria-hidden="true" /> Despachar Equipe
                            </button>
                          )}
                          {status === "manut" && (
                            <button onClick={() => concluirManutencao(tr.id)} aria-label={`Concluir manutenção de ${tr.id}`} className="flex items-center gap-1.5 border-2 border-amber-400 text-amber-700 hover:bg-amber-50 text-[12px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-[0.97]">
                              <CheckCircle2 size={12} aria-hidden="true" /> Concluir Manutenção
                            </button>
                          )}
                          {status === "normal" && <span className="text-gray-300 text-[12px]">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═ MAIN CONTENT: Contratos B2B ═ */}
      {activeNav === "contratos" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">

          {/* Area 2: Page Header & Filters */}
          <div className="w-full flex flex-col xl:flex-row justify-between items-start xl:items-center mt-6 mb-6 px-6 gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <FileText size={24} className="text-blue-600" aria-hidden="true" />
              <h1 className="text-gray-800 font-bold text-2xl">Gestão de Contratos de Energia</h1>
            </div>
            {contratoToast && (
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold" role="status" aria-live="polite">
                <CheckCircle2 size={13} aria-hidden="true" /> {contratoToast}
              </div>
            )}
          </div>

          {/* BODY: Contratos */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0">

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Briefcase size={22} className="text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-gray-400 text-[11px] font-medium mb-0.5">Volume Total Contratado</p>
                  <p className="text-[26px] font-extrabold leading-none text-blue-600">{volumeTotal.toLocaleString("pt-BR")} <span className="text-sm">kWh/mês</span></p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <PiggyBank size={22} className="text-[#16a34a]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-gray-400 text-[11px] font-medium mb-0.5">Custo Médio de Aquisição</p>
                  <p className="text-[26px] font-extrabold leading-none text-[#16a34a]">R$ {custoMedio} <span className="text-sm">/ kWh</span></p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <AlertCircle size={22} className="text-orange-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-gray-400 text-[11px] font-medium mb-0.5">Propostas Pendentes</p>
                  <p className="text-[26px] font-extrabold leading-none text-orange-600">{contratosPendentes.length}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-gray-200 mb-6" role="tablist">
              <button
                role="tab"
                aria-selected={contratosTab === "pendentes"}
                onClick={() => setContratosTab("pendentes")}
                className={`pb-3 text-[13px] font-bold transition-all ${
                  contratosTab === "pendentes" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Propostas Pendentes ({contratosPendentes.length})
              </button>
              <button
                role="tab"
                aria-selected={contratosTab === "ativos"}
                onClick={() => setContratosTab("ativos")}
                className={`pb-3 text-[13px] font-bold transition-all ${
                  contratosTab === "ativos" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Contratos Ativos ({contratosAtivos.length})
              </button>
            </div>

            {/* Tab Panel: Pendentes */}
            {contratosTab === "pendentes" && (
              <div role="tabpanel" className="grid grid-cols-2 gap-4">
                {contratosPendentes.length === 0 && (
                  <p className="text-gray-400 text-[13px] col-span-2 py-8 text-center bg-gray-50 rounded-2xl border border-gray-100">Nenhuma proposta pendente no momento.</p>
                )}
                {contratosPendentes.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-gray-800 font-bold text-[15px]">{c.produtor}</h3>
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${c.tagCor === "verde" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {c.tag}
                        </span>
                      </div>
                      <div className="flex gap-4 mb-4 text-[12px]">
                        <div>
                          <p className="text-gray-400 font-medium">Volume MENSAL</p>
                          <p className="text-gray-800 font-semibold">{c.volume.toLocaleString("pt-BR")} kWh</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">Preço (R$/kWh)</p>
                          <p className="text-gray-800 font-semibold">R$ {c.preco.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">Duração</p>
                          <p className="text-gray-800 font-semibold">{c.duracao} meses</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 border-t border-gray-50 pt-4">
                      <button onClick={() => aprovarContrato(c.id)} className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white text-[12px] font-bold py-2 rounded-xl transition-all shadow-sm shadow-green-200 flex justify-center items-center gap-1.5">
                        <CheckCircle2 size={14} aria-hidden="true" /> Aprovar Contrato
                      </button>
                      <button onClick={() => recusarContrato(c.id)} className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[12px] font-bold py-2 rounded-xl transition-all flex justify-center items-center gap-1.5">
                        <XCircle size={14} aria-hidden="true" /> Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab Panel: Ativos */}
            {contratosTab === "ativos" && (
              <div role="tabpanel" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-[13px]" role="table">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {["ID", "Produtor", "Volume (Mês)", "Preço", "Validade", "Status", "Docs"].map((col) => (
                        <th key={col} scope="col" className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contratosAtivos.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-[13px]">Nenhum contrato ativo.</td>
                      </tr>
                    )}
                    {contratosAtivos.map(c => (
                      <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3 font-mono font-bold text-gray-800">{c.id}</td>
                        <td className="px-5 py-3 text-gray-600 font-semibold">{c.produtor}</td>
                        <td className="px-5 py-3 text-gray-600">{c.volume.toLocaleString("pt-BR")} kWh</td>
                        <td className="px-5 py-3 text-gray-600">R$ {c.preco.toFixed(2)}</td>
                        <td className="px-5 py-3 text-gray-500">{c.validade}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={11} aria-hidden="true" /> Em vigor
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button aria-label={`Baixar PDF de ${c.id}`} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all">
                            <Download size={12} aria-hidden="true" /> Baixar PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═ MAIN CONTENT: Usuários e Permissões ═ */}
      {activeNav === "usuarios" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">

          {/* Area 2: Page Header & Filters */}
          <div className="w-full flex justify-between items-center mt-6 mb-6 px-6 shrink-0">
            <div className="flex items-center gap-2">
              <Users size={24} className="text-[#16a34a]" aria-hidden="true" />
              <h1 className="text-gray-800 font-bold text-2xl">Gestão de Usuários</h1>
            </div>
            <div className="flex items-center gap-4">
              {usuariosToast && (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold" role="status" aria-live="polite">
                  <CheckCircle2 size={13} aria-hidden="true" /> {usuariosToast}
                </div>
              )}
              <button 
                onClick={() => setIsNovoUsuarioModalOpen(true)}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white text-[13px] font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus size={16} aria-hidden="true" /> Novo Usuário
              </button>
            </div>
          </div>

          {/* BODY: Tabela de Usuários */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-[13px]" role="table">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Usuário", "Cargo/Permissão", "Status", "Ações"].map((col) => (
                      <th key={col} scope="col" className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuariosList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-[13px]">Nenhum usuário cadastrado.</td>
                    </tr>
                  )}
                  {usuariosList.map(u => (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[14px]">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-gray-800 font-bold flex items-center gap-2">
                              {u.name}
                              {u.isCurrentUser && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-bold">Você</span>}
                            </p>
                            <p className="text-gray-400 text-[11px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                          className="bg-gray-50 border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-1.5 outline-none cursor-pointer"
                        >
                          <option value="Administrador">Administrador</option>
                          <option value="Operador de Rede">Operador de Rede</option>
                          <option value="Analista Financeiro">Analista Financeiro</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={11} aria-hidden="true" /> {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {!u.isCurrentUser && (
                          <button 
                            onClick={() => setUsuarioToDelete(u)}
                            aria-label={`Excluir ${u.name}`}
                            className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Novo Usuário */}
          {isNovoUsuarioModalOpen && (
            <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 id="modal-title" className="text-[16px] font-bold text-gray-800">Novo Usuário</h2>
                  <button onClick={() => setIsNovoUsuarioModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleCreateUser} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 mb-1">Nome Completo</label>
                      <input 
                        type="text" required
                        value={novoUsuarioForm.nome}
                        onChange={(e) => setNovoUsuarioForm({...novoUsuarioForm, nome: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-[#16a34a] focus:bg-white transition-colors"
                        placeholder="Ex: João da Silva"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 mb-1">E-mail</label>
                      <input 
                        type="email" required
                        value={novoUsuarioForm.email}
                        onChange={(e) => setNovoUsuarioForm({...novoUsuarioForm, email: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-[#16a34a] focus:bg-white transition-colors"
                        placeholder="Ex: joao@fluxo.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 mb-1">Cargo / Permissão</label>
                      <select 
                        value={novoUsuarioForm.role}
                        onChange={(e) => setNovoUsuarioForm({...novoUsuarioForm, role: e.target.value as any})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-[#16a34a] focus:bg-white transition-colors"
                      >
                        <option value="Administrador">Administrador</option>
                        <option value="Operador de Rede">Operador de Rede</option>
                        <option value="Analista Financeiro">Analista Financeiro</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button type="button" onClick={() => setIsNovoUsuarioModalOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold text-[13px] py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" className="flex-1 bg-[#16a34a] text-white font-bold text-[13px] py-2.5 rounded-xl hover:bg-[#15803d] transition-colors shadow-sm shadow-green-200">
                      Criar Usuário
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Confirmar Exclusão */}
          {usuarioToDelete && (
            <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" role="dialog" aria-modal="true">
                <div className="p-6 text-center">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={28} className="text-red-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-[18px] font-bold text-gray-800 mb-2">Excluir Usuário?</h2>
                  <p className="text-gray-500 text-[13px] leading-relaxed mb-6">
                    Tem certeza que deseja remover o acesso de <strong className="text-gray-800">{usuarioToDelete.name}</strong>? Esta ação é irreversível.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setUsuarioToDelete(null)} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold text-[13px] py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      Cancelar
                    </button>
                    <button onClick={handleDeleteUser} className="flex-1 bg-red-600 text-white font-bold text-[13px] py-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-200">
                      Sim, Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═ MAIN CONTENT: Relatórios e Análises ═ */}
      {activeNav === "relatorios" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">

          {/* Area 2: Page Header & Filters */}
          <div className="w-full flex justify-between items-center mt-6 mb-6 px-6 shrink-0">
            <div className="flex items-center gap-2">
              <BarChart2 size={24} className="text-[#16a34a]" aria-hidden="true" />
              <h1 className="text-gray-800 font-bold text-2xl">Relatórios de Operação</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-[12px] text-gray-600 cursor-pointer hover:border-gray-400 transition-colors">
                <span className="text-gray-400 text-[11px] font-medium">Período</span>
                <select
                  value={reportPeriodo}
                  onChange={(e) => setReportPeriodo(e.target.value as ReportPeriod)}
                  className="bg-transparent outline-none text-gray-700 font-medium text-[12px] cursor-pointer"
                >
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="ano">Este Ano</option>
                </select>
              </div>

              {reportToast && (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold absolute top-6 right-1/2 translate-x-1/2 shadow-lg" role="status" aria-live="polite">
                  <CheckCircle2 size={13} aria-hidden="true" /> {reportToast}
                </div>
              )}

              <button 
                onClick={handleExportReport}
                disabled={isExporting}
                className="bg-[#0f172a] hover:bg-[#1e293b] disabled:bg-slate-400 text-white text-[13px] font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2 min-w-[150px] justify-center"
              >
                {isExporting ? (
                  <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Gerando...</>
                ) : (
                  <><FileDown size={16} aria-hidden="true" /> Exportar PDF</>
                )}
              </button>
            </div>
          </div>

          {/* BODY: Dashboard de Relatórios */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0 flex flex-col gap-6">

            {/* High-Level Metrics (3 Cards) */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Zap size={16} className="text-blue-600" aria-hidden="true" />
                  </div>
                  <p className="text-gray-400 text-[12px] font-medium">Energia Total Comprada</p>
                </div>
                <p className="text-[28px] font-extrabold leading-none text-gray-800">{currentReport.energia} <span className="text-sm font-semibold text-gray-400">kWh</span></p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <PiggyBank size={16} className="text-[#16a34a]" aria-hidden="true" />
                  </div>
                  <p className="text-gray-400 text-[12px] font-medium">Economia Gerada</p>
                </div>
                <p className="text-[28px] font-extrabold leading-none text-gray-800"><span className="text-sm font-semibold text-[#16a34a] mr-1">R$</span>{currentReport.economia}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} className="text-orange-600" aria-hidden="true" />
                  </div>
                  <p className="text-gray-400 text-[12px] font-medium">Picos de Sobrecarga</p>
                </div>
                <p className="text-[28px] font-extrabold leading-none text-gray-800">{currentReport.picos} <span className="text-sm font-semibold text-gray-400">ocorrências</span></p>
              </div>
            </div>

            {/* CSS-Only Bar Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
              <h2 className="text-gray-800 font-bold text-[16px] mb-6">Volume de Energia Transacionada (kWh)</h2>
              
              <div 
                className="flex items-end justify-between h-64 gap-2 pt-8"
                aria-label={`Gráfico de barras mostrando dados para o período de ${reportPeriodo}`}
                role="img"
              >
                {currentReport.chart.map((bar: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div className="w-full flex justify-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap">
                        {bar.text}
                      </span>
                    </div>
                    <div 
                      className="w-full max-w-[48px] bg-blue-100 group-hover:bg-blue-200 transition-colors rounded-t-lg relative"
                      style={{ height: `${bar.value}%` }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg transition-all group-hover:bg-blue-600" style={{ height: '100%' }} />
                    </div>
                    <span className="text-gray-400 text-[11px] font-semibold mt-3">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reports Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-gray-800 font-bold text-[14px]">Relatórios Gerados Recentemente</h3>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Nome do Arquivo</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Data</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Tamanho</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_REPORTS.map((rep) => (
                    <tr key={rep.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-800 flex items-center gap-2">
                        <FileText size={14} className="text-gray-400" />
                        {rep.name}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{rep.date}</td>
                      <td className="px-5 py-4 text-gray-500">{rep.size}</td>
                      <td className="px-5 py-4 text-right">
                        <button className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all">
                          <Download size={13} /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      )}

      {/* ═ MAIN CONTENT: Configurações do Sistema ═ */}
      {activeNav === "config" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">

          {/* Header */}
          <div className="w-full flex justify-between items-center mt-6 mb-6 px-6 shrink-0">
            <div className="flex items-center gap-2">
              <Settings size={24} className="text-[#16a34a]" aria-hidden="true" />
              <h1 className="text-gray-800 font-bold text-2xl">Configurações Globais</h1>
            </div>
            {configToast && (
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold shadow-sm" role="status" aria-live="polite">
                <CheckCircle2 size={13} aria-hidden="true" /> {configToast}
              </div>
            )}
          </div>

          {/* Layout Structure: Flex Container with 2 Columns */}
          <div className="flex-1 overflow-hidden px-6 pb-6 flex gap-6">
            
            {/* Left Column (Vertical Tabs) */}
            <div className="w-64 shrink-0 flex flex-col gap-1">
              <button
                onClick={() => setConfigTab("empresa")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-bold transition-colors ${
                  configTab === "empresa" ? "bg-green-50 text-[#16a34a]" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Building size={18} /> Empresa
              </button>
              <button
                onClick={() => setConfigTab("notificacoes")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-bold transition-colors ${
                  configTab === "notificacoes" ? "bg-green-50 text-[#16a34a]" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Bell size={18} /> Notificações
              </button>
              <button
                onClick={() => setConfigTab("seguranca")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-bold transition-colors ${
                  configTab === "seguranca" ? "bg-green-50 text-[#16a34a]" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Shield size={18} /> Segurança & API
              </button>
            </div>

            {/* Right Column (Form Content) */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-y-auto p-8">
              
              {configTab === "empresa" && (
                <div className="max-w-xl">
                  <h2 className="text-[18px] font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Perfil da Empresa</h2>
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="input-empresa-nome" className="block text-[13px] font-bold text-gray-700 mb-1.5">Nome da Concessionária</label>
                      <input 
                        id="input-empresa-nome" type="text" 
                        value={configData.empresa.nome}
                        onChange={(e) => setConfigData({...configData, empresa: {...configData.empresa, nome: e.target.value}})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-[#16a34a] focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="input-empresa-cnpj" className="block text-[13px] font-bold text-gray-700 mb-1.5">CNPJ</label>
                      <input 
                        id="input-empresa-cnpj" type="text" 
                        value={configData.empresa.cnpj}
                        onChange={(e) => setConfigData({...configData, empresa: {...configData.empresa, cnpj: e.target.value}})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-[#16a34a] focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="input-empresa-email" className="block text-[13px] font-bold text-gray-700 mb-1.5">E-mail de Suporte</label>
                      <input 
                        id="input-empresa-email" type="email" 
                        value={configData.empresa.email}
                        onChange={(e) => setConfigData({...configData, empresa: {...configData.empresa, email: e.target.value}})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-[#16a34a] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <button onClick={handleSaveConfig} className="bg-[#16a34a] hover:bg-[#15803d] text-white text-[14px] font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2">
                      <Save size={16} aria-hidden="true" /> Salvar Alterações
                    </button>
                  </div>
                </div>
              )}

              {configTab === "notificacoes" && (
                <div className="max-w-xl">
                  <h2 className="text-[18px] font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Alertas do Sistema</h2>
                  <div className="space-y-6">
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-bold text-gray-800 mb-0.5">Alertas Críticos de Sobrecarga</p>
                        <p className="text-[12px] text-gray-500">Notificações via SMS para a equipe de campo.</p>
                      </div>
                      <button 
                        role="switch" 
                        aria-checked={configData.notificacoes.sobrecarga}
                        onClick={() => setConfigData({...configData, notificacoes: {...configData.notificacoes, sobrecarga: !configData.notificacoes.sobrecarga}})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${configData.notificacoes.sobrecarga ? 'bg-[#16a34a]' : 'bg-gray-200'}`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${configData.notificacoes.sobrecarga ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-bold text-gray-800 mb-0.5">Novos Contratos B2B</p>
                        <p className="text-[12px] text-gray-500">Aviso por E-mail quando propostas são enviadas.</p>
                      </div>
                      <button 
                        role="switch" 
                        aria-checked={configData.notificacoes.contratos}
                        onClick={() => setConfigData({...configData, notificacoes: {...configData.notificacoes, contratos: !configData.notificacoes.contratos}})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${configData.notificacoes.contratos ? 'bg-[#16a34a]' : 'bg-gray-200'}`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${configData.notificacoes.contratos ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-bold text-gray-800 mb-0.5">Relatórios Semanais Automáticos</p>
                        <p className="text-[12px] text-gray-500">Receber resumo financeiro toda segunda-feira.</p>
                      </div>
                      <button 
                        role="switch" 
                        aria-checked={configData.notificacoes.relatorios}
                        onClick={() => setConfigData({...configData, notificacoes: {...configData.notificacoes, relatorios: !configData.notificacoes.relatorios}})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${configData.notificacoes.relatorios ? 'bg-[#16a34a]' : 'bg-gray-200'}`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${configData.notificacoes.relatorios ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                  </div>
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <button onClick={handleSaveConfig} className="bg-[#16a34a] hover:bg-[#15803d] text-white text-[14px] font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2">
                      <Save size={16} aria-hidden="true" /> Salvar Preferências
                    </button>
                  </div>
                </div>
              )}

              {configTab === "seguranca" && (
                <div className="max-w-xl">
                  <h2 className="text-[18px] font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Segurança & API</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Key size={18} className="text-gray-600" />
                        <h3 className="text-[14px] font-bold text-gray-800">Chave de Integração (API Key)</h3>
                      </div>
                      <p className="text-[12px] text-gray-500 mb-4">Utilize esta chave para sincronizar os dados da Fluxo com o seu ERP interno.</p>
                      
                      <input 
                        type="text" 
                        readOnly
                        value={configData.seguranca.apiKey}
                        className="w-full bg-white border border-gray-200 text-gray-800 text-[14px] font-mono rounded-xl px-4 py-2.5 outline-none mb-4"
                        aria-label="Chave de API atual"
                      />

                      <button 
                        onClick={handleGenerateApiKey}
                        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-[13px] font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                      >
                        <RefreshCw size={14} aria-hidden="true" /> Gerar Nova Chave
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ═ MAIN CONTENT: Alertas do Sistema ═ */}
      {activeNav === "alertas" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">

          {/* Header */}
          <div className="w-full flex justify-between items-center mt-6 mb-6 px-6 shrink-0">
            <div className="flex items-center gap-2">
              <Bell size={24} className="text-[#16a34a]" aria-hidden="true" />
              <h1 className="text-gray-800 font-bold text-2xl">Central de Alertas e Incidentes</h1>
            </div>
            {alertasToast && (
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold shadow-sm" role="status" aria-live="polite">
                <CheckCircle2 size={13} aria-hidden="true" /> {alertasToast}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0 flex flex-col">
            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 mb-6 shrink-0" role="tablist">
              <button 
                role="tab"
                aria-selected={alertasTab === "ativos"}
                onClick={() => setAlertasTab("ativos")}
                className={`pb-3 text-[14px] font-bold transition-all relative ${
                  alertasTab === "ativos" ? "text-[#16a34a]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Alertas Ativos ({ativosAlertas.length})
                {alertasTab === "ativos" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#16a34a] rounded-t-md" />}
              </button>
              <button 
                role="tab"
                aria-selected={alertasTab === "historico"}
                onClick={() => setAlertasTab("historico")}
                className={`pb-3 text-[14px] font-bold transition-all relative ${
                  alertasTab === "historico" ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Histórico Resolvido ({resolvidosAlertas.length})
                {alertasTab === "historico" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800 rounded-t-md" />}
              </button>
            </div>

            {/* Tab Content: Ativos */}
            {alertasTab === "ativos" && (
              <div role="tabpanel" className="flex flex-col gap-4">
                {ativosAlertas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <ShieldCheck size={40} className="text-[#16a34a]" aria-hidden="true" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Tudo tranquilo por aqui.</h2>
                    <p className="text-gray-500 max-w-md">Nenhum alerta ativo no momento. A operação está fluindo perfeitamente.</p>
                  </div>
                ) : (
                  ativosAlertas.map(alerta => (
                    <div key={alerta.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                      <div className="flex gap-4 items-start">
                        <div className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          alerta.severity === 'critical' ? 'bg-red-50 text-red-600' :
                          alerta.severity === 'warning' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {alerta.severity === 'critical' ? <AlertTriangle size={20} /> : 
                           alerta.severity === 'warning' ? <AlertCircle size={20} /> : <Info size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[12px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">{alerta.id}</span>
                            <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                              • {alerta.timestamp}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              alerta.severity === 'critical' ? 'bg-red-600 text-white' :
                              alerta.severity === 'warning' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                            }`}>
                              <span className="sr-only">Severidade: </span>
                              {alerta.severity === 'critical' ? 'Crítico' : alerta.severity === 'warning' ? 'Atenção' : 'Info'}
                            </span>
                          </div>
                          <h3 className="text-[15px] font-bold text-gray-800 mb-1">{alerta.title}</h3>
                          <p className="text-[13px] text-gray-500 max-w-2xl leading-relaxed">{alerta.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors">
                          Detalhes
                        </button>
                        <button 
                          onClick={() => handleResolveAlert(alerta.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-white bg-[#16a34a] hover:bg-[#15803d] shadow-sm transition-colors"
                        >
                          <CheckCircle2 size={16} /> Marcar como Resolvido
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab Content: Histórico */}
            {alertasTab === "historico" && (
              <div role="tabpanel" className="flex flex-col gap-4 opacity-80">
                {resolvidosAlertas.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-[14px]">Nenhum histórico de alerta resolvido.</div>
                ) : (
                  resolvidosAlertas.map(alerta => (
                    <div key={alerta.id} className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 grayscale-[0.5]">
                      <div className="flex gap-4 items-start">
                        <div className="mt-1 shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[12px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{alerta.id}</span>
                            <span className="text-[11px] text-gray-400 font-medium">Resolvido</span>
                          </div>
                          <h3 className="text-[15px] font-bold text-gray-600 mb-1 line-through">{alerta.title}</h3>
                          <p className="text-[13px] text-gray-400 max-w-2xl">{alerta.description}</p>
                        </div>
                      </div>
                      
                      <div className="shrink-0">
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                          Ver Relatório <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Placeholder para demais views */}
      {!["visao", "monit", "contratos", "usuarios", "relatorios", "config", "alertas"].includes(activeNav) && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Database size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-400 text-[14px] font-medium">Esta seção está em desenvolvimento.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
