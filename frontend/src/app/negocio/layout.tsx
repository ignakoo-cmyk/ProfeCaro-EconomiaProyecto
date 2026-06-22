"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserDropdown } from "@/components/UserDropdown";
import { Logo } from "@/components/Logo";

export default function NegocioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/negocio/panel", label: "Panel Central" },
    { href: "/negocio/historial", label: "Historial" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
              Negocios
            </span>
          </div>
          <nav className="flex items-center gap-1 text-sm font-medium text-slate-600">
            {navLinks.map(link => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="ml-2">
              <UserDropdown />
            </div>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
