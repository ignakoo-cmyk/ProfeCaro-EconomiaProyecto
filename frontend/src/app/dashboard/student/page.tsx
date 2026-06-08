"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/services/sessionStore";
import AgreementModal from "@/features/business/features/contracts/AgreementModal";
import { Settings, LogOut } from "lucide-react";
import LiveGigFeed from "@/features/student/features/dashboard/LiveGigFeed";
import ActionCenter from "@/features/student/features/dashboard/ActionCenter";
import type { DashboardJob } from "@/features/student/features/dashboard/JobCard";

const DEMO_JOBS: DashboardJob[] = [
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
    urgency: true,
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
    urgency: false,
    tasks: [
      "Armar y sellar cajas de cartón para despachos del día.",
      "Etiquetar paquetes con órdenes de envío.",
      "Ordenar el área de bodega al finalizar.",
    ],
  },
];

export default function StudentDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [agreementJob, setAgreementJob] = useState<DashboardJob | null>(null);

  // In a real app this comes from Zustand/Backend
  const balance = 35000;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAcceptJob = () => {
    setAgreementJob(null);
    alert("✅ ¡Compromiso confirmado! El empleador ha sido notificado.");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-grid-pattern bg-slate-50/50 flex flex-col">
      {/* Header Minimalista */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
        <div className="mx-auto max-w-[1400px] px-6 py-4 flex items-center justify-between">
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

      {/* Main Layout Asimétrico */}
      <main className="flex-1 mx-auto max-w-[1400px] px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Izquierda (65% -> 8 de 12 columnas) */}
        <div className="lg:col-span-8">
          <LiveGigFeed jobs={DEMO_JOBS} onSelectJob={setAgreementJob} />
        </div>

        {/* Columna Derecha (35% -> 4 de 12 columnas) */}
        <div className="lg:col-span-4">
          <ActionCenter balance={balance} />
        </div>

      </main>

      {/* Modal de Acuerdo */}
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
