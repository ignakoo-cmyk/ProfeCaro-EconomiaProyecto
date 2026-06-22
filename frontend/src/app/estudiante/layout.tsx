import { UserDropdown } from "@/components/UserDropdown";

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-blue-600">VentanaWork</div>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <span className="text-blue-600">Trabajos</span>
            <span className="cursor-pointer hover:text-slate-900 transition-colors hidden sm:block">Mis Postulaciones</span>
            <UserDropdown />
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

