"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import AgreementModal from "@/components/AgreementModal";
import type { MicroJob } from "@/lib/api";
import { MapPin, Settings, Zap, Filter } from "lucide-react";

const DEMO_JOBS: Array<MicroJob & { distance?: number; location?: string; tasks?: string[] }> = [
  {
    id: "job-1",
    title: "Mesero/a Extra para hora punta",
    description: "Apoyo urgente para el almuerzo. Pago de +20% por urgencia.",
    price_clp: 18000,
    duration_hours: 2,
    start_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    status: "PUBLISHED",
    employer_id: "emp-1",
    worker_id: null,
    latitude: 0,
    longitude: 0,
    created_at: new Date().toISOString(),
    distance: 150,
    location: "Cafetería Central UAH",
    tasks: [
      "Apoyar en atención de mesas durante hora punta.",
      "Manejo de bandeja y servicio de bebidas.",
      "Mantener el orden del área asignada.",
      "Reportarse con el encargado de turno al llegar.",
    ],
  },
  {
    id: "job-2",
    title: "Armado de cajas para despacho",
    description: "Necesitamos ayuda empacando pedidos online.",
    price_clp: 12000,
    duration_hours: 1.5,
    start_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: "PUBLISHED",
    employer_id: "emp-2",
    worker_id: null,
    latitude: 0,
    longitude: 0,
    created_at: new Date().toISOString(),
    distance: 400,
    location: "Librería Sur",
    tasks: [
      "Armar y sellar cajas de cartón para despachos del día.",
      "Etiquetar paquetes con órdenes de envío.",
      "Ordenar el área de bodega al finalizar.",
    ],
  },
];

export default function StudentDashboard() {
  const { user, logout } = useAuthStore();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [balance, setBalance] = useState(35000);
  const [agreementJob, setAgreementJob] = useState<typeof DEMO_JOBS[0] | null>(null);

  const handleWithdraw = () => {
    setIsWithdrawing(true);
    setTimeout(() => {
      setBalance(0);
      setIsWithdrawing(false);
      alert("Transferencia Flash a tu CuentaRUT realizada con éxito 💸");
    }, 1500);
  };

  const handleAcceptJob = () => {
    setAgreementJob(null);
    alert("✅ ¡Compromiso confirmado! El empleador ha sido notificado.");
  };

  const netAmount = (price: number) => price - Math.round(price * 0.1);

  return (
    <div className="min-h-screen bg-grid-pattern flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full overflow-hidden bg-slate-200 border-2 border-slate-300 shadow-sm">
              <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900">{user?.fullName || "Estudiante"}</h1>
                <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                  🥈 Nivel Plata
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">UAHurtado · 3 Ventanas Disponibles</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/settings" className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
              <Settings className="h-4 w-4 text-slate-500" />
            </Link>
            <button onClick={logout} className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-5xl px-6 py-8 w-full">

        {/* Balance Panel */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 mb-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-blue-400" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Saldo Disponible</p>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight">${balance.toLocaleString("es-CL")}</h2>
              <p className="text-sm text-slate-400 mt-2">Has aprovechado <span className="text-white font-bold">2 ventanas</span> esta semana.</p>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || balance === 0}
              className="w-full md:w-auto px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-500/30 text-white"
            >
              {isWithdrawing ? (
                <span className="animate-pulse">Transfiriendo...</span>
              ) : (
                "Retiro Flash a CuentaRUT"
              )}
            </button>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Trabajos a 500m
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">Por tu Nivel Plata, ves estas ofertas 5 min antes.</p>
          </div>
          <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-sm">
            <Filter className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {DEMO_JOBS.map((job) => (
            <div key={job.id} className="glass-panel bg-white rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-slate-900 text-base leading-tight mb-1">{job.title}</h4>
                  <p className="text-xs text-slate-500">{job.location} · {job.distance}m</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-black text-slate-900">${netAmount(job.price_clp).toLocaleString("es-CL")}</p>
                  <p className="text-xs text-slate-400 font-medium">líquido</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-5 flex-1">{job.description}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-5">
                <span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg font-medium">
                  ⏱ {job.duration_hours}h
                </span>
                <span className="bg-blue-50 border border-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium">
                  ${job.price_clp.toLocaleString("es-CL")} bruto
                </span>
              </div>
              <button
                onClick={() => setAgreementJob(job)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-sm shadow-md shadow-blue-200 flex items-center justify-center gap-2"
              >
                Ver Acuerdo y Postular
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Agreement Modal */}
      {agreementJob && (
        <AgreementModal
          isOpen={true}
          onClose={() => setAgreementJob(null)}
          onAccept={handleAcceptJob}
          job={agreementJob}
        />
      )}
    </div>
  );
}
