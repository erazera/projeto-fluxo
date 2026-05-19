import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// Layout do grupo (mobile): exibe as telas dentro do container de celular.
export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.className} min-h-screen bg-gray-100 flex items-center justify-center`}>
      {/* Mobile View Container */}
      <div className="w-full max-w-[400px] h-[100dvh] max-h-[850px] bg-white sm:rounded-3xl sm:shadow-2xl overflow-hidden relative sm:border-[8px] sm:border-gray-900 flex flex-col">
        {children}
      </div>
    </div>
  );
}
