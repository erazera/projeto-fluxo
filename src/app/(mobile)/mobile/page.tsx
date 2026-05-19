import Link from "next/link";
import { Zap, Signal, Wifi, BatteryFull } from "lucide-react";

export default function Onboarding() {
  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top Green Section */}
      <div className="bg-[#0a4d33] h-[40%] rounded-b-[2.5rem] flex flex-col pt-4 px-6 relative shrink-0">
        {/* Status Bar Mock */}
        <div className="flex justify-between items-center text-white text-xs font-semibold">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal size={14} fill="currentColor" />
            <Wifi size={14} />
            <BatteryFull size={16} fill="currentColor" />
          </div>
        </div>

        {/* Logo and Tagline */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-6">
          <div className="flex items-center gap-2">
            <Zap size={28} className="text-white" fill="currentColor" />
            <span className="text-white text-3xl font-bold tracking-wide">FLUXO</span>
          </div>
          <p className="text-emerald-100 text-sm mt-1">Energia que conecta.</p>
        </div>
      </div>

      {/* Bottom Content Section */}
      <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo ao Fluxo!</h1>
          <p className="text-gray-500 text-sm">O que traz você aqui hoje?</p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Card 1 */}
          <Link href="/home" className="block transition-transform active:scale-[0.98]">
            <div className="border-[1.5px] border-[#e6f2eb] rounded-2xl p-4 flex items-center gap-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="shrink-0 w-14 h-14 flex items-center justify-center rounded-xl bg-[#f0f7f3]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#108c5b" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L2 12H5V20H19V12H22L12 3Z" />
                  <rect x="13" y="14" width="4" height="4" fill="white" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-[15px] leading-tight mb-1">
                  Quero economizar<br />na conta de luz
                </h3>
                <p className="text-xs text-gray-500 leading-snug pr-2">
                  Compre energia mais barata e reduza seus gastos.
                </p>
              </div>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/pro" className="block transition-transform active:scale-[0.98]">
            <div className="border-[1.5px] border-[#fff4e5] rounded-2xl p-4 flex items-center gap-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="shrink-0 w-14 h-14 flex items-center justify-center rounded-xl bg-[#fffaf0]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="10" width="18" height="10" rx="2" fill="#FFE6B3" stroke="none" />
                  <rect x="3" y="10" width="18" height="10" rx="2" />
                  <path d="M3 15H21" />
                  <path d="M9 10V20" />
                  <path d="M15 10V20" />
                  <circle cx="12" cy="5" r="2.5" fill="#F5A623" stroke="none" />
                  <path d="M12 2V3M12 7V8M16 5H17M7 5H8M14.5 2.5L14 3M10 7L9.5 7.5M14.5 7.5L14 7M10 2.5L9.5 3" stroke="#F5A623" strokeWidth="1" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-[15px] leading-tight mb-1">
                  Tenho painéis e<br />quero lucrar
                </h3>
                <p className="text-xs text-gray-500 leading-snug pr-2">
                  Venda sua energia e aumente seus ganhos.
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer Login Link */}
        <div className="text-center mt-auto pt-4">
          <span className="text-sm text-gray-500">
            Já tem conta? <button className="text-[#108c5b] font-bold">Entrar</button>
          </span>
        </div>
      </div>
    </div>
  );
}
