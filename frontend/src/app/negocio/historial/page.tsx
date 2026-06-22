"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  Loader2, CheckCircle2, XCircle, DollarSign, Clock,
  History, RefreshCcw, User, Filter
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8009";

interface Job {
  id: string;
  title: string;
  description: string;
  price_clp: number;
  duration_hours: number;
  status: string;
  approval_status: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  COMPLETED: { label: "Completado", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  PAID:      { label: "Pagado",     color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  CANCELLED: { label: "Cancelado",  color: "bg-red-50 text-red-700 border-red-200",             icon: <XCircle className="w-3.5 h-3.5" /> },
};

const HISTORY_STATUSES = ["COMPLETED", "PAID", "CANCELLED"];

export default function HistorialPage() {
  const { token } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("Todos");

  const authHeaders = useCallback((): HeadersInit => ({
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs/employer`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        const history = (Array.isArray(data) ? data : []).filter((j: Job) => HISTORY_STATUSES.includes(j.status));
        setJobs(history);
      }
    } catch {
      console.error("Error fetching history");
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const filters = ["Todos", "Completado", "Cancelado"];
  const filteredJobs = activeFilter === "Todos"
    ? jobs
    : jobs.filter(j => {
        if (activeFilter === "Completado") return j.status === "COMPLETED" || j.status === "PAID";
        if (activeFilter === "Cancelado") return j.status === "CANCELLED";
        return true;
      });

  const totalPagado = jobs
    .filter(j => j.status === "COMPLETED" || j.status === "PAID")
    .reduce((acc, j) => acc + j.price_clp, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Encabezado */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-slate-500" />
            Historial de Trabajos
          </h1>
          <p className="text-slate-500 mt-1">
            {jobs.length > 0
              ? `${jobs.length} trabajo${jobs.length !== 1 ? "s" : ""} finalizado${jobs.length !== 1 ? "s" : ""}`
              : "Sin trabajos finalizados aún."}
          </p>
        </div>
        <button
          onClick={fetchJobs}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCcw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Resumen financiero */}
      {totalPagado > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Invertido</p>
            <p className="text-2xl font-black text-emerald-600">
              ${new Intl.NumberFormat("es-CL").format(totalPagado)} CLP
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Completados</p>
            <p className="text-2xl font-black text-slate-900">
              {jobs.filter(j => j.status === "COMPLETED" || j.status === "PAID").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cancelados</p>
            <p className="text-2xl font-black text-slate-900">
              {jobs.filter(j => j.status === "CANCELLED").length}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      {jobs.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-slate-400" />
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                activeFilter === f
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
          <p className="text-slate-500 font-medium">Cargando historial...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-16 text-center flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
            <History className="w-10 h-10 text-slate-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Sin historial</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Los trabajos completados o cancelados aparecerán aquí.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map(job => {
            const statusInfo = STATUS_CONFIG[job.status] ?? {
              label: job.status,
              color: "bg-slate-50 text-slate-600 border-slate-200",
              icon: null
            };
            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-all"
              >
                {/* Ícono estado */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 self-start ${
                  job.status === "CANCELLED" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
                }`}>
                  {job.status === "CANCELLED" ? <XCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{job.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(job.created_at).toLocaleDateString("es-CL", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{job.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <DollarSign className="w-4 h-4" />
                      ${new Intl.NumberFormat("es-CL").format(job.price_clp)} CLP
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {job.duration_hours}h de trabajo
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
