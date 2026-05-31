// WCAG 2.2 — Tela Extrato Detalhado / Relatórios (Modo Pro)
// Critérios cobertos:
//   1.3.1 Info and Relationships — Tabs com role="tablist", "tab", "tabpanel", e aria-controls
//   2.4.6 Headings and Labels — Cabeçalhos e botões descritivos
//   4.1.2 Name, Role, Value  — aria-selected informando a aba ativa
//   4.1.3 Status Messages    — aria-live="polite" na mensagem de geração do PDF
"use client";
import { ProBottomNav } from "@/components/ProBottomNav";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  BarChart2,
  TrendingUp,
  FileText,
  Calendar,
  Home,
  MapPin,
  List,
  Settings,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Contract {
  id: string;
  volume: number;
  price: number;
  schedule: string;
  status: "ativo" | "aguardando";
  createdAt: string;
}

// ── Dados Mockados ───────────────────────────────────────────────────────────
const HISTORICAL_DATA = [
  { month: "Jan", direct: 450, auto: 150 },
  { month: "Fev", direct: 500, auto: 200 },
  { month: "Mar", direct: 480, auto: 300 },
  { month: "Abr", direct: 600, auto: 450 },
  { month: "Mai", direct: 550, auto: 600 },
  { month: "Jun", direct: 300, auto: 700 },
];

const LEDGER_MOCK = [
  { id: "tx-1", type: "Venda - Piloto Automático", date: "Hoje, 14:30", volume: 150, value: 93.00, isPositive: true },
  { id: "tx-2", type: "Taxa de Uso da Rede (TUSD)", date: "Hoje, 14:30", volume: 0, value: -4.50, isPositive: false },
  { id: "tx-3", type: "Venda Direta - Contrato #32", date: "Ontem, 08:15", volume: 50, value: 25.00, isPositive: true },
  { id: "tx-4", type: "Compra - Bateria Virtual", date: "15 Mai, 02:00", volume: 200, value: -60.00, isPositive: false },
  { id: "tx-5", type: "Saque para Conta Bancária", date: "10 Mai, 10:00", volume: 0, value: -500.00, isPositive: false },
  { id: "tx-6", type: "Venda - Piloto Automático", date: "09 Mai, 14:30", volume: 150, value: 93.00, isPositive: true },
];

const navItems = [
  { id: "home",    label: "Home",              icon: Home    },
  { id: "mapa",    label: "Mapa de Demanda",   icon: MapPin  },
  { id: "extrato", label: "Extrato Detalhado", icon: List    },
  { id: "config",  label: "Configurações",     icon: Settings },
];

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function ExtratoPro() {
  const router = useRouter();
  const exportFeedbackId = useId();

  // ── Estados ───────────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<"graficos" | "historico">("graficos");
  const [activeNavTab, setActiveNavTab] = useState("extrato"); // O tab da Bottom Nav começa como "extrato"
  const [exportStatus, setExportStatus] = useState<"idle" | "loading" | "done">("idle");
  const [exportAriaMsg, setExportAriaMsg] = useState("");

  // ── Integração de Dados ───────────────────────────────────────────────────
  const [contracts, , isHydrated] = useLocalStorage<Contract[]>("fluxo_b2b_contracts", []);

  // Cálculos baseados no localStorage + Mocks
  const currentContractsRevenue = contracts.reduce((acc, c) => acc + (c.volume * c.price), 0);
  const historicalTotal = HISTORICAL_DATA.reduce((acc, data) => acc + data.direct + data.auto, 0);
  
  const totalRevenue = historicalTotal + (isHydrated ? currentContractsRevenue : 0);
  const activeContractsCount = isHydrated && contracts.length > 0 ? contracts.length : 12; // 12 é mock fallback

  let bestMonth = HISTORICAL_DATA[0].month;
  let maxMonthRevenue = 0;
  HISTORICAL_DATA.forEach(data => {
    const total = data.direct + data.auto;
    if (total > maxMonthRevenue) {
      maxMonthRevenue = total;
      bestMonth = data.month;
    }
  });

  // ── Funções ───────────────────────────────────────────────────────────────
  function handleExport() {
    if (exportStatus !== "idle") return;
    
    setExportStatus("loading");
    setExportAriaMsg("Gerando PDF do relatório, por favor aguarde...");

    setTimeout(() => {
      setExportStatus("done");
      setExportAriaMsg("Download Concluído. O relatório foi gerado com sucesso.");
      
      setTimeout(() => {
        setExportStatus("idle");
        setExportAriaMsg("");
      }, 4000);
    }, 2000);
  }

  const chartMaxHeight = 1500;

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
      <header className="flex items-center gap-3 px-4 pt-3 pb-3 shrink-0">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-lg p-1 shrink-0"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white text-[1rem] font-bold leading-tight truncate">
            Extrato Detalhado
          </h1>
          <p className="text-gray-500 text-[0.6875rem] mt-0.5">
            Performance e Transações
          </p>
        </div>
      </header>

      {/* ── Segmented Control (Tabs) ──────────────────────────────────────── */}
      <div className="px-4 pb-3 shrink-0 border-b border-[#21262d]">
        <div role="tablist" aria-label="Visualização do extrato" className="flex p-1 bg-[#161b22] rounded-xl border border-[#30363d]">
           <button 
             role="tab" 
             aria-selected={activeView === "graficos"} 
             aria-controls="panel-graficos" 
             id="tab-graficos"
             onClick={() => setActiveView("graficos")}
             className={`flex-1 py-1.5 text-[0.8125rem] font-bold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500
               ${activeView === "graficos" ? "bg-[#30363d] text-white shadow" : "text-gray-400 hover:text-gray-300"}`}
           >
             Gráficos & ROI
           </button>
           <button 
             role="tab" 
             aria-selected={activeView === "historico"} 
             aria-controls="panel-historico" 
             id="tab-historico"
             onClick={() => setActiveView("historico")}
             className={`flex-1 py-1.5 text-[0.8125rem] font-bold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500
               ${activeView === "historico" ? "bg-[#30363d] text-white shadow" : "text-gray-400 hover:text-gray-300"}`}
           >
             Histórico
           </button>
        </div>
      </div>

      {/* ── Corpo Scrollável ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 flex flex-col gap-6">

        {/* ================================================================= */}
        {/* ABA 1: GRÁFICOS & ROI                                             */}
        {/* ================================================================= */}
        <div 
          id="panel-graficos" 
          role="tabpanel" 
          aria-labelledby="tab-graficos" 
          hidden={activeView !== "graficos"}
          className={activeView === "graficos" ? "flex flex-col gap-6" : "hidden"}
        >
          {/* KPI Cards */}
          <section aria-label="Indicadores chave de performance">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="col-span-2 bg-[#161b22] rounded-2xl border border-green-900/40 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-transparent pointer-events-none" aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-green-400" aria-hidden="true" />
                    <h2 className="text-gray-400 text-[0.75rem] font-semibold uppercase tracking-widest">
                      Receita Total
                    </h2>
                  </div>
                  <p className="text-green-400 text-[1.875rem] font-extrabold leading-none tabular-nums tracking-tight">
                    {formatBRL(totalRevenue)}
                  </p>
                  <p className="text-gray-500 text-[0.6875rem] mt-1.5">
                    Últimos 6 meses + Acumulado atual
                  </p>
                </div>
              </div>
              <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar size={14} className="text-blue-400" aria-hidden="true" />
                  <h2 className="text-gray-400 text-[0.6875rem] font-semibold uppercase tracking-wide">
                    Melhor Mês
                  </h2>
                </div>
                <p className="text-white text-[1.125rem] font-bold leading-tight">{bestMonth}</p>
                <p className="text-gray-500 text-[0.625rem] mt-0.5">{formatBRL(maxMonthRevenue)}</p>
              </div>
              <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText size={14} className="text-purple-400" aria-hidden="true" />
                  <h2 className="text-gray-400 text-[0.6875rem] font-semibold uppercase tracking-wide">
                    Contratos
                  </h2>
                </div>
                <p className="text-white text-[1.125rem] font-bold leading-tight">{activeContractsCount}</p>
                <p className="text-gray-500 text-[0.625rem] mt-0.5">Vigentes na Bateria</p>
              </div>
            </div>
          </section>

          {/* ROI Bar Chart */}
          <section className="bg-[#161b22] rounded-2xl border border-[#30363d] p-4">
            <header className="mb-4">
              <h2 className="text-white text-[0.9375rem] font-bold">Lucro Operacional (ROI)</h2>
              <p className="text-gray-500 text-[0.75rem] mt-0.5">Comparativo: Venda Direta vs. Piloto Automático</p>
            </header>
            <div className="flex items-center gap-4 mb-6" aria-hidden="true">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <span className="text-gray-400 text-[0.6875rem] font-semibold uppercase">Venda Direta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className="text-gray-400 text-[0.6875rem] font-semibold uppercase">Piloto Auto</span>
              </div>
            </div>

            <div className="h-40 flex items-end justify-between gap-2 border-b border-[#30363d] pb-2" aria-hidden="true">
              {HISTORICAL_DATA.map((data, idx) => {
                const directPct = (data.direct / chartMaxHeight) * 100;
                const autoPct = (data.auto / chartMaxHeight) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end gap-1 group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-10 bg-[#0d1117] border border-[#30363d] text-[0.625rem] p-1.5 rounded-lg z-10 whitespace-nowrap pointer-events-none">
                      R$ {data.direct + data.auto}
                    </div>
                    <div className="w-full max-w-[2rem] flex flex-col justify-end rounded-t-sm overflow-hidden bg-[#0d1117]/50 h-full">
                      <div style={{ height: `${autoPct}%` }} className="bg-green-500 w-full transition-all duration-500 border-b border-[#161b22]/50" />
                      <div style={{ height: `${directPct}%` }} className="bg-blue-500 w-full transition-all duration-500" />
                    </div>
                    <span className="text-gray-500 text-[0.625rem] font-bold mt-1">{data.month}</span>
                  </div>
                );
              })}
            </div>

            <div className="sr-only">
              <table>
                <caption>Lucro Operacional nos últimos 6 meses detalhado por categoria</caption>
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Venda Direta</th>
                    <th>Piloto Automático</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {HISTORICAL_DATA.map((data) => (
                    <tr key={data.month}>
                      <td>{data.month}</td>
                      <td>{formatBRL(data.direct)}</td>
                      <td>{formatBRL(data.auto)}</td>
                      <td>{formatBRL(data.direct + data.auto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Export Action */}
          <section>
            <div id={exportFeedbackId} role="status" aria-live="polite" aria-atomic="true" className="sr-only">
              {exportAriaMsg}
            </div>
            <button
              onClick={handleExport}
              disabled={exportStatus === "loading"}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-[0.9375rem] transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]
                ${
                  exportStatus === "loading"
                    ? "bg-[#30363d] text-gray-400 cursor-wait"
                    : exportStatus === "done"
                    ? "bg-green-950 border border-green-600 text-green-400"
                    : "bg-white text-black hover:bg-gray-200 active:scale-[0.98]"
                }`}
            >
              {exportStatus === "loading" ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  <span>Gerando PDF...</span>
                </>
              ) : exportStatus === "done" ? (
                <>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>Download Concluído</span>
                </>
              ) : (
                <>
                  <Download size={18} aria-hidden="true" />
                  <span>Exportar Relatório (PDF)</span>
                </>
              )}
            </button>
          </section>
        </div>

        {/* ================================================================= */}
        {/* ABA 2: HISTÓRICO                                                  */}
        {/* ================================================================= */}
        <div 
          id="panel-historico" 
          role="tabpanel" 
          aria-labelledby="tab-historico" 
          hidden={activeView !== "historico"}
          className={activeView === "historico" ? "flex flex-col gap-3" : "hidden"}
        >
          <ul className="flex flex-col gap-3">
            {LEDGER_MOCK.map((tx) => (
              <li key={tx.id} className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 flex justify-between items-center transition-colors hover:bg-[#1c222b]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.isPositive ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                    aria-hidden="true"
                  >
                    {tx.isPositive ? (
                      <ArrowUpRight size={20} className="text-green-400" />
                    ) : (
                      <ArrowDownRight size={20} className="text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white text-[0.8125rem] font-bold leading-tight">{tx.type}</p>
                    <p className="text-gray-500 text-[0.6875rem] mt-0.5">
                      {tx.date} {tx.volume > 0 ? `· ${tx.volume} kWh` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[0.9375rem] font-bold tabular-nums ${tx.isPositive ? 'text-green-400' : 'text-white'}`}>
                    {tx.isPositive ? "+" : "-"} {formatBRL(Math.abs(tx.value))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Bottom Navigation ─────────────────────────────────────────────── */}
      <ProBottomNav />
    </div>
  );
}
