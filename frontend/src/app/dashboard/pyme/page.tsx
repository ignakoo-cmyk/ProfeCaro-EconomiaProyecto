"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import CreateJobModal from "@/components/CreateJobModal";

export default function PymeDashboard() {
  const { user, logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#f97316] flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20">
              P
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Panel Pyme</h1>
              <p className="text-xs font-semibold text-slate-500">{user?.fullName || "Tu Negocio"}</p>
            </div>
          </div>
          
          <button onClick={logout} className="text-sm font-semibold text-slate-500 hover:text-slate-800">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-6xl px-6 py-8 w-full">
        
        {/* Top Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gestión de Empleos</h2>
            <p className="text-slate-500">Crea ofertas urgentes y administra tus postulantes locales.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#f97316] text-white font-bold rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Crear Oferta Rápida
          </button>
        </div>

        {/* Data Table (Simulada para visualización de UI limpia) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Trabajos Activos (Hoy)</h3>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              2 Activos
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                  <th className="p-4 font-bold">Oferta</th>
                  <th className="p-4 font-bold">Pago Base</th>
                  <th className="p-4 font-bold">Postulantes</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                
                {/* Fila 1: URGENTE */}
                <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">Mesero/a Extra para hora punta</p>
                    <p className="text-xs text-slate-500 mt-0.5">Hoy 13:00 • 2 hrs</p>
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    $18.000 <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded font-bold ml-1">Surge</span>
                  </td>
                  <td className="p-4">
                    <div className="flex -space-x-2 overflow-hidden">
                      <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200" src="https://i.pravatar.cc/100?img=1" alt=""/>
                      <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200" src="https://i.pravatar.cc/100?img=2" alt=""/>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white bg-slate-100 text-xs font-bold text-slate-500">+1</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Disponible</span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-sm font-bold text-[#f97316] hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
                      Revisar Perfiles
                    </button>
                  </td>
                </tr>

                {/* Fila 2: ASIGNADO */}
                <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors bg-blue-50/30">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">Ayudante de Inventario</p>
                    <p className="text-xs text-slate-500 mt-0.5">Hoy 16:00 • 3 hrs</p>
                  </td>
                  <td className="p-4 font-bold text-slate-900">$12.000</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200" src="https://i.pravatar.cc/100?img=3" alt=""/>
                      <span className="font-semibold text-slate-700">Juan P.</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">En Camino</span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-sm font-bold text-[#0052FF] hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-end w-full gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Ver QR
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </main>

      <CreateJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
