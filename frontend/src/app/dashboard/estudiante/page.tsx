"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/services/sessionStore";
import AgreementModal from "@/features/business/features/contracts/AgreementModal";
import { Settings, LogOut } from "lucide-react";
import LiveTrabajoFeed from "@/features/student/features/dashboard/LiveTrabajoFeed";
import ActionCenter from "@/features/student/features/dashboard/ActionCenter";
import type { DashboardJob } from "@/features/student/features/dashboard/JobCard";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [agreementJob, setAgreementJob] = useState<DashboardJob | null>(null);
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // In a real app this comes from Zustand/Backend
  const balance = 35000;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const fetchJobsFeed = async () => {
    setIsLoadingJobs(true);
    try {
      const res = await fetch("http://localhost:8009/api/jobs/feed?radius_km=10.0&lat=-33.444&lon=-70.655", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error("Error fetching job feed:", err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (token) {
      fetchJobsFeed();
    }
  }, [token]);

  const handleAcceptJob = () => {
    setAgreementJob(null);
    alert("✅ ¡Compromiso confirmado! El empleador ha sido notificado.");
    fetchJobsFeed();
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
          {isLoadingJobs ? (
            <div className="py-12 text-center text-slate-500">Cargando trabajos disponibles...</div>
          ) : (
            <LiveTrabajoFeed jobs={jobs} onSelectJob={setAgreementJob} />
          )}
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


