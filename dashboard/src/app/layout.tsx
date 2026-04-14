import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";

export const metadata: Metadata = {
  title: "El Coro",
  description: "Panel de monitoreo de El Coro",
};

const navItems = [
  { href: "/", label: "Inicio", icon: "grid" },
  { href: "/growth", label: "Crecimiento", icon: "trending" },
  { href: "/support", label: "Soporte", icon: "ticket" },
  { href: "/agents", label: "Agentes", icon: "cpu" },
  { href: "/health", label: "Salud", icon: "pulse" },
  { href: "/tokens", label: "Tokens", icon: "coins" },
  { href: "/sombra", label: "Sombra", icon: "eye" },
];

function NavIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    grid: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    trending: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    ticket: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 0 0-2 2v3a2 2 0 1 1 0 4v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 1 1 0-4V7a2 2 0 0 0-2-2H5z" />
      </svg>
    ),
    cpu: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
      </svg>
    ),
    pulse: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    coins: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
        <path d="M7 6h1v4" />
        <path d="M16.71 13.88l.7.71-2.82 2.82" />
      </svg>
    ),
    eye: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  };
  return <>{icons[icon] || null}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <nav className="fixed top-0 left-0 z-40 flex h-full w-56 flex-col border-r border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm md:w-56 max-md:w-14">
            {/* Logo */}
            <div className="flex items-center gap-3 border-b border-zinc-800/60 px-4 py-5 max-md:justify-center max-md:px-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-wide text-zinc-100 max-md:hidden">El Coro</span>
            </div>

            {/* Nav Items */}
            <div className="flex flex-1 flex-col gap-0.5 px-2 py-3 max-md:px-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-100 max-md:justify-center max-md:px-2"
                >
                  <NavIcon icon={item.icon} />
                  <span className="max-md:hidden">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-800/60 px-4 py-3 max-md:px-2">
              <div className="flex items-center gap-2">
                <div className="status-dot up" />
                <span className="text-xs text-zinc-500 max-md:hidden">El Coro v1.0</span>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="ml-56 min-h-screen flex-1 max-md:ml-14">
            <div className="mx-auto max-w-7xl px-6 py-8">
              <AutoRefresh interval={30} />
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
