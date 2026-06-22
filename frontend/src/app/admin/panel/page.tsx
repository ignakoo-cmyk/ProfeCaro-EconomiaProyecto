"use client";

import { useState } from "react";
import { Users, Briefcase, LayoutDashboard, Settings, LogOut, CheckCircle2, XCircle, Search, ShieldAlert, Check, X } from "lucide-react";

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const mockUsers = [
    { id: "u1", name: "Ignacio Miranda", email: "nacho@uah.cl", role: "Estudiante", date: "Hoy, 10:45 AM", verified: true },
    { id: "u2", name: "Librería Central", email: "contacto@libreriauah.cl", role: "Empleador", date: "Hoy, 09:12 AM", verified: false },
    { id: "u3", name: "María José Pinto", email: "mpinto@uah.cl", role: "Estudiante", date: "Ayer, 16:30 PM", verified: true },
    { id: "u4", name: "Casino UAH", email: "casino@uah.cl", role: "Empleador", date: "Ayer, 11:20 AM", verified: true },
  ];

  const mockJobs = [
    { id: "j1", title: "Promotor de Evento", employer: "Centro de Estudiantes", amount: 20000, status: "pending", time: "Hace 10 min" },
    { id: "j2", title: "Limpieza de Laboratorio", employer: "Facultad de Ciencias", amount: 15000, status: "pending", time: "Hace 1 hora" },
    { id: "j3", title: "Digitador de Encuestas", employer: "Investigación Sociología", amount: 30000, status: "pending", time: "Hace 3 horas" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans overflow-hidden">
      
      {/* Sidebar (Antigravity Dark) */}
      <aside className="w-64 bg-slate-900/95 backdrop-blur-2xl border-r border-slate-800 text-slate-300 flex flex-col relative z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            <span className="font-black text-white text-xl tracking-tight">Admin<span className="text-cyan-400">Panel</span></span>
          </div>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard General
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'users' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
            Gestión de Usuarios
          </button>
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'jobs' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Briefcase className="w-5 h-5" />
            Moderación de Avisos
            <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">3</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        
        {/* Fondo Antigravity Claro */}
        <div className="fixed top-0 left-64 right-0 bottom-0 pointer-events-none z-0">
          <div className="absolute top-[10%] left-[20%] w-[30%] h-[40%] bg-cyan-400/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[50%] bg-violet-400/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 p-8 sm:p-12 max-w-6xl mx-auto space-y-8">
          
          <header className="flex justify-between items-center bg-white/60 backdrop-blur-md border border-white/80 p-4 rounded-2xl shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800">Visión General</h1>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input type="text" placeholder="Buscar ID, usuario..." className="pl-9 pr-4 py-2 bg-white/80 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500" />
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Tabla: Trabajos en Revisión */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-rose-500" />
                  Avisos Pendientes
                </h2>
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">Requiere Acción</span>
              </div>

              <div className="flex-1 space-y-3">
                {mockJobs.map(job => (
                  <div key={job.id} className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 truncate">{job.title}</h3>
                      <p className="text-xs text-slate-500 truncate mb-1">{job.employer}</p>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="text-emerald-600">${new Intl.NumberFormat('es-CL').format(job.amount)}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400">{job.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title="Aprobar Aviso">
                        <Check className="w-5 h-5" />
                      </button>
                      <button className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title="Rechazar Aviso">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabla: Nuevos Usuarios */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-600" />
                  Nuevos Registros
                </h2>
                <button className="text-xs font-bold text-cyan-600 hover:text-cyan-700">Ver Todos</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100">
                      <th className="pb-3 font-medium">Usuario</th>
                      <th className="pb-3 font-medium">Rol</th>
                      <th className="pb-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {mockUsers.map(user => (
                      <tr key={user.id} className="group">
                        <td className="py-3">
                          <p className="font-bold text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${user.role === 'Estudiante' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3">
                          {user.verified ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium text-xs">
                              <CheckCircle2 className="w-4 h-4" /> Verificado
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-500 font-medium text-xs">
                              <XCircle className="w-4 h-4" /> Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
