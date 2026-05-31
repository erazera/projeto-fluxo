// WCAG 2.2 — Componente de Navegação Inferior do Modo Pro
// Critérios cobertos:
//   2.4.3 Focus Order — <nav> semântico
//   2.4.8 Location    — aria-current="page" determinado dinamicamente via usePathname
//   4.1.2 Name, Role, Value — <Link> com aria-label descritivo para cada tab
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, List, Settings } from "lucide-react";

// ── Definição das Abas (Pro Mode) ─────────────────────────────────────────────
const PRO_NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    href: "/pro",
    // Ativa apenas na raiz /pro (não em sub-rotas)
    matchExact: true,
    matchPaths: ["/pro"],
  },
  {
    id: "mapa",
    label: "Mapa",
    icon: MapPin,
    href: "/pro/mapa",
    matchExact: false,
    matchPaths: ["/pro/mapa"],
  },
  {
    id: "extrato",
    label: "Extrato",
    icon: List,
    href: "/pro/extrato",
    matchExact: false,
    matchPaths: ["/pro/extrato"],
  },
  {
    id: "config",
    label: "Config.",
    icon: Settings,
    href: "/pro/config",
    matchExact: false,
    matchPaths: ["/pro/config"],
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
export function ProBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="absolute bottom-0 left-0 right-0 bg-[#161b22] border-t border-[#30363d] flex justify-around items-center py-2 px-2 z-10"
    >
      {PRO_NAV_ITEMS.map(({ id, label, icon: Icon, href, matchExact, matchPaths }) => {
        // WCAG 2.4.8 — active state determinado pelo pathname real
        const isActive = matchExact
          ? pathname === href
          : matchPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

        return (
          <Link
            key={id}
            href={href}
            id={`pro-nav-${id}`}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0d1117]
              ${isActive ? "text-green-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.8}
              aria-hidden="true"
            />
            <span
              className={`text-[0.5625rem] font-semibold text-center leading-tight ${
                isActive ? "text-green-400" : "text-gray-500"
              }`}
              aria-hidden="true"
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
