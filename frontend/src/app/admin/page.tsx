"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard, Users, Store, CheckCircle, Ticket, DollarSign, TrendingUp,
  MapPin, ShieldAlert, Search, MoreVertical, Activity, LogOut, Briefcase,
  XCircle, Loader2
} from "lucide-react";
import { Logo } from "@/components/Logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8009";

interface PendingUser {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  created_at: string;
}

interface PendingJob {
  id: string;
  title: string;
  description: string;
  price_clp: number;
  employer_name: string;
  created_at: string;
}

export default function AdminControlCenter() {
  const router = useRouter();
  const { user, isAuthenticated, logout, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const authHeaders = useCallback((): HeadersInit => ({
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  const fetchPendingData = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/pending`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPendingUsers(data.pending_users || []);
        setPendingJobs(data.pending_jobs || []);
      }
    } catch (err) {
      console.error("Error fetching pending admin data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated || (user && user.userType !== "ADMIN")) {
      router.push("/");
    } else {
      fetchPendingData();
    }
  }, [isAuthenticated, user, router, fetchPendingData]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleModerateUser = async (userId: string, action: "approve" | "reject") => {
    setProcessingId(userId);
    try {
      const res = await fetch(`${API_URL}/api/admin/approve/user/${userId}?action=${action}`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (res.ok) {
        await fetchPendingData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail}`);
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setProcessingId(null);
    }
  };

  const handleModerateJob = async (jobId: string, action: "approve" | "reject") => {
    setProcessingId(jobId);
    try {
      const res = await fetch(`${API_URL}/api/admin/approve/job/${jobId}?action=${action}`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (res.ok) {
        await fetchPendingData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail}`);
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setProcessingId(null);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">ADMIN CONTROL CENTER</h1>
              <p className="text-xs text-slate-500 font-medium">VentanaWork · Moderación</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
              <Activity className="h-3.5 w-3.5 animate-pulse" /> SISTEMA EN VIVO
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors">
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          {/* Métricas Generales (Estáticas por ahora) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Usuarios Pendientes", value: pendingUsers.length, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
              { label: "Trabajos Pendientes", value: pendingJobs.length, icon: Briefcase, color: "text-orange-600 bg-orange-50 border-orange-100" },
              { label: "Soporte Tickets", value: "0", icon: Ticket, color: "text-red-600 bg-red-50 border-red-100" },
              { label: "Sistema Salud", value: "100%", icon: Activity, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
            ].map((m, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className={`h-9 w-9 rounded-lg border flex items-center justify-center ${m.color}`}>
                    <m.icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900">{m.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-wide">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Tabla de Usuarios Pendientes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                VERIFICACIÓN DE USUARIOS
              </h2>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">{pendingUsers.length} pendientes</span>
            </div>
            
            {isLoading ? (
              <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : pendingUsers.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No hay usuarios pendientes de aprobación.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-5 py-3.5">Usuario</th>
                      <th className="px-5 py-3.5">Rol</th>
                      <th className="px-5 py-3.5">Fecha Registro</th>
                      <th className="px-5 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">{user.full_name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${user.user_type === 'STUDENT' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                            {user.user_type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-xs">
                          {new Date(user.created_at).toLocaleString("es-CL")}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleModerateUser(user.id, "approve")}
                              disabled={processingId === user.id}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {processingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleModerateUser(user.id, "reject")}
                              disabled={processingId === user.id}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {processingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                              Rechazar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tabla de Trabajos Pendientes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                MODERACIÓN DE TRABAJOS
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">{pendingJobs.length} pendientes</span>
            </div>
            
            {isLoading ? (
              <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : pendingJobs.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No hay trabajos pendientes de moderación.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-5 py-3.5">Título</th>
                      <th className="px-5 py-3.5">Empleador</th>
                      <th className="px-5 py-3.5">Pago</th>
                      <th className="px-5 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingJobs.map(job => (
                      <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800 line-clamp-1">{job.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-[250px]" title={job.description}>
                            {job.description}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-700">{job.employer_name}</td>
                        <td className="px-5 py-4 font-black text-emerald-600">
                          ${new Intl.NumberFormat("es-CL").format(job.price_clp)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleModerateJob(job.id, "approve")}
                              disabled={processingId === job.id}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {processingId === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleModerateJob(job.id, "reject")}
                              disabled={processingId === job.id}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {processingId === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                              Rechazar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right side static components */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Actividad Reciente
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-slate-500 italic">No hay actividad reciente registrada.</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
