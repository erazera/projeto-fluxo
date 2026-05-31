// WCAG 2.2 — Componente de Navegação Inferior do Modo Lite
// Critérios cobertos:
//   2.4.3 Focus Order — <nav> semântico com role="navigation"
//   2.4.8 Location    — aria-current="page" determinado dinamicamente via usePathname
//   4.1.2 Name, Role, Value — <Link> com aria-label descritivo para cada tab
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Zap, Bell, User } from "lucide-react";

// ── Definição das Abas (Lite Mode) ────────────────────────────────────────────
const LITE_NAV_ITEMS = [
  {
    id: "inicio",
    label: "Início",
    icon: Home,
    href: "/home",
    // Rotas que devem ativar este tab
    matchPaths: ["/home"],
  },
  {
    id: "atividades",
    label: "Atividades",
    icon: Zap,
    href: "/extrato",
    matchPaths: ["/extrato"],
  },
  {
    id: "notificacoes",
    label: "Avisos",
    icon: Bell,
    href: "/notificacoes",
    matchPaths: ["/notificacoes"],
  },
  {
    id: "perfil",
    label: "Perfil",
    icon: User,
    href: "/perfil",
    matchPaths: ["/perfil"],
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
export function LiteBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-2 z-10"
    >
      {LITE_NAV_ITEMS.map(({ id, label, icon: Icon, href, matchPaths }) => {
        // WCAG 2.4.8 — active state determinado pelo pathname real
        const isActive = matchPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

        return (
          <Link
            key={id}
            href={href}
            id={`lite-nav-${id}`}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1
              ${isActive ? "text-green-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.8}
              aria-hidden="true"
            />
            <span
              className={`text-[0.5625rem] font-semibold text-center leading-tight ${
                isActive ? "text-green-600" : "text-gray-400"
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
