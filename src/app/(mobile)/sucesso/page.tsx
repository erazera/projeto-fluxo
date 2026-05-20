// WCAG 2.2 — Tela de Sucesso (confirmação de compra)
// Critérios cobertos:
//   1.1.1 Non-text Content   — aria-hidden em ícones/partículas decorativas
//   1.4.4 Resize Text        — tipografia em rem
//   4.1.3 Status Messages    — role="status" + aria-live="polite" no h1
//                              para que leitores de tela anunciem a confirmação
//                              mesmo sem mudança de foco para o elemento
"use client";

import Link from "next/link";
import { Check } from "lucide-react";

// Partículas decorativas fixas ao redor do círculo
const particles = [
  { top: "6%",  left: "12%", size: 10, rotate: 20,  color: "#16a34a" },
  { top: "4%",  left: "38%", size: 7,  rotate: 0,   color: "#4ade80" },
  { top: "5%",  left: "65%", size: 9,  rotate: -15, color: "#16a34a" },
  { top: "8%",  left: "82%", size: 6,  rotate: 45,  color: "#86efac" },
  { top: "18%", left: "5%",  size: 8,  rotate: -30, color: "#4ade80" },
  { top: "20%", left: "88%", size: 7,  rotate: 10,  color: "#16a34a" },
  { top: "32%", left: "8%",  size: 6,  rotate: 0,   color: "#86efac" },
  { top: "30%", left: "84%", size: 9,  rotate: -20, color: "#4ade80" },
];

function Particle({ top, left, size, rotate, color }: typeof particles[0]) {
  return (
    // WCAG 1.1.1: elemento puramente decorativo — aria-hidden="true"
    <div
      aria-hidden="true"
      className="absolute rounded-sm opacity-75"
      style={{
        top,
        left,
        width: size,
        height: size,
        backgroundColor: color,
        transform: `rotate(${rotate}deg)`,
      }}
    />
  );
}

export default function Sucesso() {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Status Bar ─────────────────────────────────────────────────── */}
      {/* WCAG 1.1.1: status bar é decorativa — aria-hidden="true" */}
      <div className="px-5 pt-3 shrink-0" aria-hidden="true">
        <div className="flex justify-between items-center text-gray-800 text-xs font-semibold">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <svg width="15" height="11" viewBox="0 0 15 11" fill="#1f2937" aria-hidden="true">
              <rect x="0" y="7" width="3" height="4" rx="0.5" />
              <rect x="4" y="4.5" width="3" height="6.5" rx="0.5" />
              <rect x="8" y="2" width="3" height="9" rx="0.5" />
              <rect x="12" y="0" width="3" height="11" rx="0.5" />
            </svg>
            <svg width="15" height="11" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <circle cx="12" cy="20" r="1" fill="#1f2937" />
            </svg>
            <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden="true">
              <rect x="0" y="1" width="18" height="10" rx="2" fill="#1f2937" />
              <rect x="1" y="2" width="16" height="8" rx="1.5" fill="white" />
              <rect x="1" y="2" width="14" height="8" rx="1.5" fill="#1f2937" />
              <rect x="18.5" y="4" width="2" height="4" rx="1" fill="#1f2937" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Corpo principal ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-between px-6 py-6">

        {/* ── Seção Hero (ícone + título) ──────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center w-full relative">

          {/* Partículas decorativas — já têm aria-hidden="true" internamente */}
          {particles.map((p, i) => (
            <Particle key={i} {...p} />
          ))}

          {/* Círculo verde com check — ícone decorativo pois o h1 já descreve */}
          <div
            className="w-28 h-28 rounded-full bg-[#16a34a] flex items-center justify-center shadow-lg shadow-green-200 mb-8"
            aria-hidden="true"
          >
            <Check size={56} className="text-white" strokeWidth={3} />
          </div>

          {/* ── Mensagem de Sucesso ────────────────────────────────────────
              WCAG 4.1.3 — Status Messages: o usuário foi redirecionado
              programaticamente para esta página. role="status" + aria-live="polite"
              garante que o leitor de tela anuncie esta mensagem de confirmação
              mesmo que o foco não tenha sido movido para o elemento.
              aria-atomic="true" garante que a mensagem inteira seja lida de uma vez. */}
          <div role="status" aria-live="polite" aria-atomic="true">
            <h1 className="text-gray-900 text-[1.625rem] font-extrabold text-center leading-tight mb-3">
              Compra realizada<br />com sucesso!
            </h1>
            <p className="text-gray-500 text-[1rem] text-center leading-snug">
              Seu pacote de energia já<br />está ativo.
            </p>
          </div>

          {/* ── Card de Recibo ──────────────────────────────────────────── */}
          <div className="w-full mt-8 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 flex flex-col items-center gap-2 shadow-sm">
            <p className="text-gray-400 text-[0.8125rem]">Valor pago</p>
            <p className="text-gray-900 text-[2rem] font-extrabold leading-tight">
              R$ 15,00
            </p>

            <div className="w-full border-t border-gray-200 my-1" />

            <p className="text-gray-500 text-[0.8125rem] text-center leading-relaxed">
              Pagamento via PIX<br />
              12/05/2024 às 14:32
            </p>

            <div className="w-full border-t border-gray-200 my-1" />

            <p className="text-gray-400 text-[0.75rem] text-center font-mono tracking-wide">
              ID da transação:{" "}
              <span className="text-gray-600 font-semibold">E7F4...9D2A</span>
            </p>
          </div>
        </div>

        {/* ── Botão Voltar ao início ────────────────────────────────────── */}
        <Link
          href="/home"
          id="btn-voltar-inicio"
          className="w-full bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] transition-all text-white text-[1.0625rem] font-bold text-center py-4 rounded-2xl shadow-md shadow-green-200 mt-6 block"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
