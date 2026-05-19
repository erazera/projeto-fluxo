import Link from "next/link";
import { Inter } from "next/font/google";
import { Zap, Smartphone, Monitor, ArrowRight, ChevronRight } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function Hub() {
  return (
    <div
      className={`${inter.className} min-h-screen bg-[#f8faf9] flex flex-col`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Thin top accent bar ─────────────────────────── */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0a4d33] via-[#16a34a] to-[#4ade80]" />

      {/* ── Main centered content ───────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">

        {/* Logo mark */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#0e6641] rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/20">
            <Zap size={26} className="text-white" fill="white" />
          </div>
          <div>
            <span className="text-[28px] font-extrabold text-[#0d1f14] tracking-tight leading-none block">
              FLUXO
            </span>
            <span className="text-[12px] text-[#16a34a] font-semibold tracking-widest uppercase leading-none">
              Energia que conecta
            </span>
          </div>
        </div>

        {/* Tag */}
        <span className="inline-block bg-[#e6f2eb] text-[#0e6641] text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-8">
          Protótipo · IHC 2026
        </span>

        {/* Headline */}
        <h1 className="text-[36px] sm:text-[44px] font-extrabold text-[#0d1f14] text-center leading-tight mb-3 max-w-xl">
          Projeto Fluxo
        </h1>
        <p className="text-gray-500 text-[16px] text-center max-w-md leading-relaxed mb-14">
          Selecione a experiência interativa que deseja explorar:
        </p>

        {/* ── Cards ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">

          {/* Card 1 — Mobile Consumer */}
          <Link
            href="/mobile"
            className="group flex-1 bg-white border border-gray-100 rounded-3xl p-8 flex flex-col gap-5 shadow-sm hover:shadow-xl hover:border-[#16a34a]/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            {/* Icon */}
            <div className="w-14 h-14 bg-[#f0f7f3] rounded-2xl flex items-center justify-center group-hover:bg-[#dcf0e4] transition-colors duration-300">
              <Smartphone size={28} className="text-[#0e6641]" />
            </div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#16a34a] bg-[#e6f2eb] px-2 py-0.5 rounded-full">
                  Mobile
                </span>
              </div>
              <h2 className="text-[20px] font-bold text-[#0d1f14] mb-2 leading-tight">
                App Mobile
                <br />
                <span className="text-gray-400 font-semibold text-[16px]">(Consumidor)</span>
              </h2>
              <p className="text-gray-500 text-[14px] leading-relaxed">
                Fluxo de compra simplificada e modo avançado para clientes que queiram mais controle.
              </p>
            </div>

            {/* CTA row */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex gap-1.5">
                {["Tela 1", "Tela 2", "Tela 3", "Tela 4", "Tela 5"].map((t) => (
                  <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-[#0e6641] text-[13px] font-semibold group-hover:gap-2 transition-all">
                <span>Abrir</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2 — B2B Portal */}
          <Link
            href="/b2b"
            className="group flex-1 bg-white border border-gray-100 rounded-3xl p-8 flex flex-col gap-5 shadow-sm hover:shadow-xl hover:border-[#1e40af]/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            {/* Icon */}
            <div className="w-14 h-14 bg-[#eff6ff] rounded-2xl flex items-center justify-center group-hover:bg-[#dbeafe] transition-colors duration-300">
              <Monitor size={28} className="text-[#1d4ed8]" />
            </div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1d4ed8] bg-[#eff6ff] px-2 py-0.5 rounded-full">
                  Desktop
                </span>
              </div>
              <h2 className="text-[20px] font-bold text-[#0d1f14] mb-2 leading-tight">
                Portal B2B
                <br />
                <span className="text-gray-400 font-semibold text-[16px]">(Concessionária)</span>
              </h2>
              <p className="text-gray-500 text-[14px] leading-relaxed">
                Monitoramento de rede em tempo real e controle de demanda para administradores.
              </p>
            </div>

            {/* CTA row */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex gap-1.5">
                {["Tela 6"].map((t) => (
                  <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-[#1d4ed8] text-[13px] font-semibold group-hover:gap-2 transition-all">
                <span>Abrir</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="py-6 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[12px]">
          Protótipo de Alta Fidelidade
        </p>
      </footer>
    </div>
  );
}
