"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/services/sessionStore";
import { 
  PlusCircle, 
  Briefcase, 
  Users, 
  LogOut, 
  TrendingUp, 
  Eye, 
  Clock, 
  CheckCircle,
  Bell,
  Search,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function NegocioDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Profesional */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-slate-900 tracking-tight text-lg">
            Ventana<span className="text-orange-600">Work</span>
          </span>
        </div>
        
        <div className="p-4 flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Gestión de Empleos</p>
          <nav className="space-y-1.5">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-orange-50 text-orange-700 font-bold rounded-xl transition-colors">
              <PlusCircle className="w-5 h-5" />
              Crear nuevo Gig
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold rounded-xl transition-colors">
              <Briefcase className="w-5 h-5" />
              Mis Ofertas Activas
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold rounded-xl transition-colors justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                Revisar Postulantes
              </div>
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">3</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 border-2 border-white shadow-sm overflow-hidden">
               <img src="https://i.pravatar.cc/150?img=12" alt="Avatar Negocio" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || "Tu Negocio"}</p>
              <p className="text-xs text-slate-500 truncate">Perfil Empleador</p>
            </div>
          </div>
          <button onClick={handleLogout} className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Buscar candidatos o gigs..." className="pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl text-sm w-64 transition-all outline-none" />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Contenido del Dashboard */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-1">¡Hola de nuevo, {user?.fullName?.split(' ')[0] || "Empleador"}! 👋</h2>
            <p className="text-slate-500 text-sm">Aquí tienes el resumen de la actividad de tus empleos hoy.</p>
          </div>

          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> +12%
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">1,248</h3>
              <p className="text-sm font-medium text-slate-500">Visualizaciones de tus ofertas</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> 3 Nuevos
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">12</h3>
              <p className="text-sm font-medium text-slate-500">Candidatos pendientes</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">45</h3>
              <p className="text-sm font-medium text-slate-500">Gigs completados (Mes)</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center items-center bg-gradient-to-br from-orange-500 to-orange-600 text-white transform hover:-translate-y-1 cursor-pointer">
              <PlusCircle className="w-8 h-8 mb-3 opacity-90" />
              <h3 className="text-lg font-bold">Publicar Gig Rápido</h3>
              <p className="text-xs text-orange-100 mt-1">Llega a +500 estudiantes</p>
            </div>
          </div>

          {/* Sección de Ofertas Recientes */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-lg">Ofertas Activas (Hoy)</h3>
              <button className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">Ver todas</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 bg-white">
                    <th className="p-4 font-bold">Rol / Puesto</th>
                    <th className="p-4 font-bold">Horario</th>
                    <th className="p-4 font-bold">Candidatos</th>
                    <th className="p-4 font-bold">Estado</th>
                    <th className="p-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {/* Fila 1 */}
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">Mesero/a Extra para hora punta</p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">$18.000 (Pago Base)</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Hoy, 13:00 - 15:00
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex -space-x-2 overflow-hidden">
                        <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200" src="https://i.pravatar.cc/100?img=1" alt=""/>
                        <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200" src="https://i.pravatar.cc/100?img=2" alt=""/>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white bg-orange-100 text-xs font-bold text-orange-600">+3</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">Publicado</span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-sm font-bold text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors">
                        Revisar (5)
                      </button>
                    </td>
                  </tr>

                  {/* Fila 2 */}
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors bg-blue-50/20">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">Ayudante de Inventario</p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">$12.000 (Pago Base)</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Hoy, 16:00 - 19:00
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200" src="https://i.pravatar.cc/100?img=3" alt=""/>
                        <span className="font-semibold text-slate-700">Juan P.</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-200">Asignado</span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-lg transition-colors shadow-sm">
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
