// WCAG 2.2 — Tela Ofertas Recebidas (Modo Pro)
// Critérios cobertos:
//   1.1.1 Non-text Content   — ícones decorativos com aria-hidden
//   1.3.1 Info and Relationships — <ul>/<li> para a lista de ofertas; <article> por card
//   1.4.4 Resize Text        — tipografia em rem
//   2.4.6 Headings and Labels — <h1> único; aria-label contextual em cada botão de ação
//   4.1.2 Name, Role, Value  — botões com aria-label descritivos ("Aceitar oferta de X kWh da Y")
//   4.1.3 Status Messages    — aria-live="polite" + role="status" nos anúncios de remoção
"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Building2,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  Inbox,
} from "lucide-react";
import { ProBottomNav } from "@/components/ProBottomNav";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type OfferSignal = "above" | "below" | "neutral";

interface Offer {
  id: string;
  buyer: string;
  buyerType: string;
  volumeKwh: number;
  pricePerKwh: number;   // centavos
  expiresInMin: number;
  signal: OfferSignal;
  signalPct: number;
  avatarColor: string;
  avatarInitials: string;
}

// ── Dados Mockados ─────────────────────────────────────────────────────────────
const INITIAL_OFFERS: Offer[] = [
  {
    id: "ofr-001",
    buyer: "Indústrias Matarazzo",
    buyerType: "Industrial",
    volumeKwh: 500,
    pricePerKwh: 63,
    expiresInMin: 42,
    signal: "above",
    signalPct: 14,
    avatarColor: "#1e40af",
    avatarInitials: "IM",
  },
  {
    id: "ofr-002",
    buyer: "Concessionária Local CPFL",
    buyerType: "Distribuidora",
    volumeKwh: 1200,
    pricePerKwh: 58,
    expiresInMin: 120,
    signal: "above",
    signalPct: 5,
    avatarColor: "#065f46",
    avatarInitials: "CL",
  },
  {
    id: "ofr-003",
    buyer: "EnerTech Soluções",
    buyerType: "Comercial",
    volumeKwh: 200,
    pricePerKwh: 52,
    expiresInMin: 18,
    signal: "below",
    signalPct: 5,
    avatarColor: "#7c3aed",
    avatarInitials: "ET",
  },
  {
    id: "ofr-004",
    buyer: "Polo Têxtil Norte",
    buyerType: "Industrial",
    volumeKwh: 800,
    pricePerKwh: 55,
    expiresInMin: 240,
    signal: "neutral",
    signalPct: 0,
    avatarColor: "#92400e",
    avatarInitials: "PT",
  },
  {
    id: "ofr-005",
    buyer: "Supermercados Vera Cruz",
    buyerType: "Comercial",
    volumeKwh: 150,
    pricePerKwh: 48,
    expiresInMin: 55,
    signal: "below",
    signalPct: 13,
    avatarColor: "#be185d",
    avatarInitials: "SV",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBRL(cents: number, volume: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format((cents / 100) * volume);
}

function centsLabel(c: number) {
  return `R$ ${(c / 100).toFixed(2).replace(".", ",")}`;
}

function expiryLabel(min: number): { text: string; color: string } {
  if (min <= 30) return { text: `Expira em ${min}min`, color: "text-red-400" };
  if (min <= 60) return { text: `Expira em ${min}min`, color: "text-orange-400" };
  const h = Math.floor(min / 60);
  const m = min % 60;
  const text = m > 0 ? `Expira em ${h}h ${m}min` : `Expira em ${h}h`;
  return { text, color: "text-gray-500" };
}

const SIGNAL_CONFIG: Record<OfferSignal, {
  icon: React.ElementType;
  bg: string;
  border: string;
  text: string;
  label: (pct: number) => string;
}> = {
  above: {
    icon: TrendingUp,
    bg: "bg-green-500/10",
    border: "border-green-600/30",
    text: "text-green-400",
    label: (p) => `${p}% acima do mercado`,
  },
  below: {
    icon: TrendingDown,
    bg: "bg-red-500/10",
    border: "border-red-600/30",
    text: "text-red-400",
    label: (p) => `${p}% abaixo do seu preço`,
  },
  neutral: {
    icon: Minus,
    bg: "bg-gray-500/10",
    border: "border-gray-600/30",
    text: "text-gray-400",
    label: () => "Na média do mercado",
  },
};

// ── Componente: Card de Oferta ────────────────────────────────────────────────
function OfferCard({
  offer,
  onAccept,
  onReject,
}: {
  offer: Offer;
  onAccept: (o: Offer) => void;
  onReject: (o: Offer) => void;
}) {
  const signal = SIGNAL_CONFIG[offer.signal];
  const SignalIcon = signal.icon;
  const expiry = expiryLabel(offer.expiresInMin);
  const total = formatBRL(offer.pricePerKwh, offer.volumeKwh);

  return (
    // WCAG 1.3.1: <article> semântico por oferta independente
    <article
      className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden"
      aria-label={`Oferta de ${offer.buyer}: ${offer.volumeKwh} kWh por ${centsLabel(offer.pricePerKwh)}/kWh`}
    >
      {/* Topo: Avatar + Info do comprador + Sinal */}
      <div className="flex items-start gap-3 p-4 pb-3">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white text-[0.6875rem] font-extrabold"
          style={{ backgroundColor: offer.avatarColor + "33", border: `1px solid ${offer.avatarColor}55` }}
          aria-hidden="true"
        >
          <span style={{ color: offer.avatarColor }}>{offer.avatarInitials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-white text-[0.875rem] font-bold leading-tight truncate">{offer.buyer}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Building2 size={11} className="text-gray-500 shrink-0" aria-hidden="true" />
                <span className="text-gray-500 text-[0.625rem]">{offer.buyerType}</span>
              </div>
            </div>

            {/* Badge de sinal de mercado */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border shrink-0 ${signal.bg} ${signal.border}`}>
              <SignalIcon size={11} className={signal.text} aria-hidden="true" />
              <span className={`text-[0.5625rem] font-bold whitespace-nowrap ${signal.text}`}>
                {signal.label(offer.signalPct)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dados da Oferta */}
      <div className="grid grid-cols-3 gap-px mx-4 mb-3 bg-[#21262d] rounded-xl overflow-hidden">
        {[
          { label: "Volume", value: `${offer.volumeKwh.toLocaleString("pt-BR")} kWh`, icon: Zap },
          { label: "Preço/kWh", value: centsLabel(offer.pricePerKwh), icon: null },
          { label: "Total", value: total, icon: null },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#161b22] px-3 py-2.5 flex flex-col gap-0.5">
            <p className="text-gray-600 text-[0.5625rem] uppercase tracking-wide font-semibold">{label}</p>
            <div className="flex items-center gap-1">
              {Icon && <Icon size={11} className="text-green-400 shrink-0" aria-hidden="true" />}
              <p className="text-white text-[0.8125rem] font-bold tabular-nums truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Urgência + Ações */}
      <div className="flex items-center gap-2 px-4 pb-4">
        {/* Urgência */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <Clock size={12} className={`${expiry.color} shrink-0`} aria-hidden="true" />
          <span className={`text-[0.625rem] font-semibold ${expiry.color} truncate`}>{expiry.text}</span>
        </div>

        {/* Botão Recusar */}
        <button
          onClick={() => onReject(offer)}
          aria-label={`Recusar oferta de ${offer.volumeKwh} kWh da ${offer.buyer}`}
          className="flex items-center gap-1.5 border border-[#30363d] text-gray-400 hover:border-red-700/60 hover:text-red-400
            px-3 py-2 rounded-xl text-[0.75rem] font-bold transition-all active:scale-[0.97]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0d1117]"
        >
          <XCircle size={14} aria-hidden="true" />
          Recusar
        </button>

        {/* Botão Aceitar */}
        <button
          onClick={() => onAccept(offer)}
          aria-label={`Aceitar oferta de ${offer.volumeKwh} kWh da ${offer.buyer} por ${total}`}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white
            px-3 py-2 rounded-xl text-[0.75rem] font-bold transition-all active:scale-[0.97] shadow-sm shadow-green-900/30
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0d1117]"
        >
          <CheckCircle2 size={14} aria-hidden="true" />
          Aceitar
        </button>
      </div>
    </article>
  );
}

// ── Componente Principal ───────────────────────────────────────────────────────
export default function OfertasRecebidas() {
  const router = useRouter();
  const liveRegionId = useId();

  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [announcement, setAnnouncement] = useState("");

  function announce(msg: string) {
    // Limpa e re-anuncia para garantir que o leitor de tela detecte a mudança
    setAnnouncement("");
    setTimeout(() => setAnnouncement(msg), 50);
    setTimeout(() => setAnnouncement(""), 5000);
  }

  function handleAccept(offer: Offer) {
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    announce(
      `Oferta de ${offer.volumeKwh} kWh da ${offer.buyer} aceita com sucesso por ${formatBRL(offer.pricePerKwh, offer.volumeKwh)}!`
    );
  }

  function handleReject(offer: Offer) {
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    announce(`Oferta da ${offer.buyer} recusada.`);
  }

  const pendingCount = offers.length;

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-white">

      {/* ── Status Bar ────────────────────────────────────────────────────── */}
      <div className="px-5 pt-3 shrink-0" aria-hidden="true">
        <div className="flex justify-between items-center text-white text-xs font-semibold">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <svg width="15" height="11" viewBox="0 0 15 11" fill="white"><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4" y="4.5" width="3" height="6.5" rx="0.5" /><rect x="8" y="2" width="3" height="9" rx="0.5" /><rect x="12" y="0" width="3" height="11" rx="0.5" /></svg>
            <svg width="15" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="white" /></svg>
            <svg width="22" height="12" viewBox="0 0 22 12" fill="white"><rect x="0" y="1" width="18" height="10" rx="2" fill="white" /><rect x="1" y="2" width="16" height="8" rx="1.5" fill="#0d1117" /><rect x="1" y="2" width="14" height="8" rx="1.5" fill="white" /><rect x="18.5" y="4" width="2" height="4" rx="1" fill="white" /></svg>
          </div>
        </div>
      </div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 pt-3 pb-4 shrink-0 border-b border-[#21262d]">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-lg p-1 shrink-0"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-white text-[1rem] font-bold leading-tight">Ofertas Recebidas</h1>
          <p className="text-gray-500 text-[0.6875rem] mt-0.5">Propostas de compra de energia · B2B</p>
        </div>

        {/* Badge de pendentes */}
        {pendingCount > 0 && (
          <div
            className="shrink-0 bg-green-600 text-white text-[0.625rem] font-extrabold px-2.5 py-1 rounded-full"
            aria-label={`${pendingCount} ofertas novas`}
          >
            {pendingCount} {pendingCount === 1 ? "Nova" : "Novas"}
          </div>
        )}
      </header>

      {/* ── WCAG 4.1.3: Região de anúncios acessíveis ────────────────────── */}
      <div
        id={liveRegionId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Toast visual complementar (não substitui o aria-live) */}
      {announcement !== "" && (
        <div
          className="mx-4 mt-3 shrink-0 flex items-center gap-3 bg-green-950 border border-green-700 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300"
          aria-hidden="true"
        >
          <CheckCircle2 size={16} className="text-green-400 shrink-0" />
          <p className="text-green-300 text-[0.8125rem] font-semibold leading-snug">{announcement}</p>
        </div>
      )}

      {/* ── Lista de Ofertas ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        {offers.length > 0 ? (
          <>
            {/* Subtítulo de contagem */}
            <p className="text-gray-600 text-[0.6875rem] font-semibold uppercase tracking-wider mb-3 px-1">
              {pendingCount} oferta{pendingCount !== 1 && "s"} aguardando resposta
            </p>

            <ul className="flex flex-col gap-3" aria-label="Lista de ofertas recebidas">
              {offers.map((offer) => (
                <li key={offer.id}>
                  <OfferCard
                    offer={offer}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : (
          /* Estado vazio */
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-16">
            <div className="w-20 h-20 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center justify-center" aria-hidden="true">
              <Inbox size={36} className="text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-white text-[1rem] font-bold">Sem ofertas pendentes</p>
              <p className="text-gray-500 text-[0.8125rem] mt-1 leading-snug max-w-[16rem] mx-auto">
                Quando compradores fizerem propostas, elas aparecerão aqui.
              </p>
            </div>
          </div>
        )}
      </div>

      <ProBottomNav />
    </div>
  );
}
