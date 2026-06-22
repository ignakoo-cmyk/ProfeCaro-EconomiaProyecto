"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserDropdown } from "@/components/UserDropdown";
import { Logo } from "@/components/Logo";
import { useApplicationsStore } from "@/stores/applicationsStore";

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { applications } = useApplicationsStore();

  const navLinks = [
    { href: "/estudiante/trabajos", label: "Trabajos" },
    { href: "/estudiante/postulaciones", label: "Mis Postulaciones", badge: applications.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />
          <nav className="flex items-center gap-1 text-sm font-medium text-slate-600">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="ml-2">
              <UserDropdown />
            </div>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
