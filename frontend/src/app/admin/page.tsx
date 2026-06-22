"use client";

import { useAuthStore } from "@/features/auth/services/sessionStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Store,
  CheckCircle,
  Ticket,
  DollarSign,
  TrendingUp,
  MapPin,
  ShieldAlert,
  Search,
  MoreVertical,
  Activity,
  Zap,
  LogOut
} from "lucide-react";

export default function AdminControlCenter() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    setMounted(true);
    // Role protection still needed if a student tries to access /admin
    if (isAuthenticated && user && user.userType !== "ADMIN") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-grid-pattern text-slate-900 font-sans">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">ADMIN CONTROL CENTER</h1>
              <p className="text-xs text-slate-500 font-medium">VentanaWork · System Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
              <Activity className="h-3.5 w-3.5 animate-pulse" /> SISTEMA EN VIVO
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar usuarios, trabajos, tickets..."
                className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-400 transition-colors w-56 shadow-sm"
              />
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer shadow-md">
              <span className="text-xs font-black text-white">A</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left + Center: Metrics, Pipeline, Tickets */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Active Students", value: "1,248", change: "+12%", icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
              { label: "Verified Biz", value: "342", change: "+5%", icon: Store, color: "text-orange-600 bg-orange-50 border-orange-100" },
              { label: "Completed Trabajos", value: "8,992", change: "+24%", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
              { label: "Open Tickets", value: "14", change: "-2", icon: Ticket, color: "text-red-600 bg-red-50 border-red-100" },
              { label: "Revenue MTD", value: "$42k", change: "+18%", icon: DollarSign, color: "text-purple-600 bg-purple-50 border-purple-100" },
            ].map((m, i) => (
              <div key={i} className="glass-panel p-4 rounded-xl bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className={`h-9 w-9 rounded-lg border flex items-center justify-center ${m.color}`}>
                    <m.icon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${m.change.startsWith('+') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {m.change}
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-900">{m.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-wide">{m.label}</p>
                {/* Mini chart bars */}
                <div className="mt-3 h-5 flex items-end gap-0.5 opacity-40">
                  {[40, 65, 50, 80, 60, 90, 100].map((h, j) => (
                    <div key={j} className={`flex-1 rounded-t-sm ${m.color.split(' ')[1]}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Verification Pipeline */}
          <div className="glass-panel bg-white p-6 rounded-2xl">
            <h2 className="text-base font-bold mb-5 flex items-center gap-2 text-slate-800">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Tubería de Verificación de Usuarios
            </h2>
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              {[
                { label: 'Nuevos Registros', value: 45, color: 'border-slate-200 bg-slate-50', textColor: 'text-slate-700' },
                { label: 'Revisión de Documentos', value: 12, color: 'border-blue-200 bg-blue-50', textColor: 'text-blue-700', action: true },
                { label: 'Verificados (Hoy)', value: 28, color: 'border-emerald-200 bg-emerald-50', textColor: 'text-emerald-700' },
              ].map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className={`w-full rounded-xl p-4 border text-center ${s.color}`}>
                    <p className={`text-sm font-semibold mb-2 ${s.textColor}`}>{s.label}</p>
                    <p className="text-3xl font-black text-slate-900">{s.value}</p>
                    {s.action && (
                      <button className="mt-3 w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        Revisar Ahora
                      </button>
                    )}
                  </div>
                  {i < 2 && <TrendingUp className="h-5 w-5 text-slate-300 mt-3 rotate-90 md:rotate-0 hidden md:block" />}
                </div>
              ))}
            </div>
          </div>

          {/* Support Tickets Table */}
          <div className="glass-panel bg-white rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-slate-500" />
                SOPORTE TICKET (Abiertos)
              </h2>
              <button className="text-sm font-bold text-blue-600 hover:underline">Ver todos</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Ticket #</th>
                    <th className="px-5 py-3.5">Usuario</th>
                    <th className="px-5 py-3.5">Rol</th>
                    <th className="px-5 py-3.5">Asunto</th>
                    <th className="px-5 py-3.5">Prioridad</th>
                    <th className="px-5 py-3.5">Estado</th>
                    <th className="px-5 py-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: "TK-8892", user: "Maria Gonzalez", role: "STUDENT", subject: "Retraso pago trabajo #442", priority: "Alta", status: "Abierto" },
                    { id: "TK-8891", user: "Café Central", role: "PYME", subject: "Actualizar dirección", priority: "Media", status: "En Progreso" },
                    { id: "TK-8890", user: "Juan Perez", role: "STUDENT", subject: "Verificación rechazada", priority: "Alta", status: "Abierto" },
                    { id: "TK-8889", user: "Librería Sur", role: "PYME", subject: "No puede publicar trabajo", priority: "Baja", status: "Abierto" },
                  ].map((ticket, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{ticket.id}</td>
                      <td className="px-5 py-4 font-semibold text-slate-800">{ticket.user}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.role === 'STUDENT' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                          {ticket.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-sm">{ticket.subject}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold flex items-center gap-1.5 ${ticket.priority === 'Alta' ? 'text-red-600' : ticket.priority === 'Media' ? 'text-amber-600' : 'text-slate-400'}`}>
                          <span className={`h-2 w-2 rounded-full ${ticket.priority === 'Alta' ? 'bg-red-500' : ticket.priority === 'Media' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${ticket.status === 'Abierto' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Live Trabajo Map */}
        <div className="glass-panel bg-white p-6 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Live Trabajo Map
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-emerald-700">
              <Activity className="h-3 w-3 animate-pulse" /> Live · Santiago
            </div>
          </div>

          {/* Map Area */}
          <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative min-h-[400px]">
            {/* Grid Pattern on Map */}
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h30v30H0V0zm1 1h28v28H1V1z' fill='%23e2e8f0' fill-opacity='0.5' fill-rule='evenodd'/%3E%3C/svg%3E")`
            }} />

            {/* Trabajo Markers */}
            <div className="absolute top-[22%] left-[35%]">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-60" />
                <div className="relative bg-blue-600 h-5 w-5 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                  <div className="h-1.5 w-1.5 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <div className="absolute top-[48%] left-[58%]">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-60" />
                <div className="relative bg-orange-500 h-5 w-5 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                  <div className="h-1.5 w-1.5 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <div className="absolute top-[65%] left-[28%]">
              <div className="relative bg-emerald-500 h-4 w-4 rounded-full border-2 border-white shadow-md" />
            </div>
            <div className="absolute top-[18%] left-[72%]">
              <div className="relative bg-emerald-500 h-4 w-4 rounded-full border-2 border-white shadow-md" />
            </div>
            <div className="absolute top-[40%] left-[18%]">
              <div className="relative bg-blue-400 h-3 w-3 rounded-full border-2 border-white shadow-sm opacity-60" />
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur border border-slate-200 rounded-xl p-3 flex justify-between text-xs font-semibold shadow-sm">
              <span className="flex items-center gap-1.5 text-blue-700"><span className="h-2.5 w-2.5 bg-blue-600 rounded-full" /> Nuevo</span>
              <span className="flex items-center gap-1.5 text-orange-700"><span className="h-2.5 w-2.5 bg-orange-500 rounded-full" /> Urgente</span>
              <span className="flex items-center gap-1.5 text-emerald-700"><span className="h-2.5 w-2.5 bg-emerald-500 rounded-full" /> En Curso</span>
            </div>
          </div>

          {/* Quick Stats Below Map */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Trabajos Activos', value: '47', color: 'text-blue-600' },
              { label: 'Urgentes', value: '5', color: 'text-orange-600' },
              { label: 'En Curso', value: '23', color: 'text-emerald-600' },
            ].map((s, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Logo at bottom */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-black text-slate-700">Ventana<span className="text-blue-600">Work</span></span>
            <span className="ml-auto text-xs text-slate-400">v3 · Admin</span>
          </div>
        </div>

      </main>
    </div>
  );
}


