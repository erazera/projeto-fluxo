import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

// Layout do grupo (mobile): exibe as telas dentro do container de celular.
export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.className} min-h-screen bg-gray-100 flex items-center justify-center`}>

      {/* ── Controle de Protótipo */}
      <Link
        href="/"
        className="flex fixed top-4 left-4 z-[100] items-center gap-2 bg-white/90 backdrop-blur-md text-gray-600 px-3 py-1.5 rounded-full shadow-md border border-gray-200 hover:bg-white hover:shadow-lg hover:text-gray-900 transition-all text-xs font-medium"
        aria-label="Voltar ao portal de seleção de persona"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M5 12l7 7M5 12l7-7" />
        </svg>
        Voltar ao Portal
      </Link>

      {/* Mobile View Container — WCAG 1.4.4: max-h em rem para respeitar zoom */}
      <div className="w-full max-w-[400px] h-[100dvh] max-h-[53.125rem] bg-white sm:rounded-3xl sm:shadow-2xl overflow-hidden relative sm:border-[8px] sm:border-gray-900 flex flex-col">
        {children}
      </div>
    </div>
  );
}
