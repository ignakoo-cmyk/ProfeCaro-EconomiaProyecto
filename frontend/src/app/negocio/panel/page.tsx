"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  Loader2, PlusCircle, MapPin, DollarSign, Store, X,
  BarChart3, Users, Briefcase, Clock, CheckCircle2,
  XCircle, AlertTriangle, User, GraduationCap, Star,
  History, RefreshCcw, ChevronRight
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
  worker?: {
    id: string;
    full_name: string;
    email: string;
    reputation: number | null;
    major: string | null;
  } | null;
}

interface FormData {
  title: string;
  description: string;
  address: string;
  reward_amount: string;
  duration_hours: string;
  start_time: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PUBLISHED:   { label: "Publicado",    color: "bg-blue-50 text-blue-700 border-blue-200",     icon: <Briefcase className="w-3 h-3" /> },
  MATCHED:     { label: "Asignado",     color: "bg-violet-50 text-violet-700 border-violet-200", icon: <User className="w-3 h-3" /> },
  IN_PROGRESS: { label: "En Progreso",  color: "bg-amber-50 text-amber-700 border-amber-200",   icon: <Clock className="w-3 h-3" /> },
  COMPLETED:   { label: "Completado",   color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  PAID:        { label: "Pagado",       color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: <CheckCircle2 className="w-3 h-3" /> },
  CANCELLED:   { label: "Cancelado",    color: "bg-red-50 text-red-700 border-red-200",         icon: <XCircle className="w-3 h-3" /> },
};

const ACTIVE_STATUSES = ["PUBLISHED", "MATCHED", "IN_PROGRESS"];
const HISTORY_STATUSES = ["COMPLETED", "PAID", "CANCELLED"];

export default function PanelNegocioPage() {
  const { token, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    address: "",
    reward_amount: "",
    duration_hours: "1",
    start_time: "",
  });

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
        setJobs(Array.isArray(data) ? data : []);
      }
    } catch {
      console.error("Error fetching jobs");
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const amount = parseInt(formData.reward_amount);
    const duration = parseFloat(formData.duration_hours);

    if (!formData.title.trim() || !formData.description.trim() || !formData.start_time || isNaN(amount) || isNaN(duration)) {
      setError("Por favor completa todos los campos requeridos.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          price_clp: amount,
          duration_hours: duration,
          start_time: new Date(formData.start_time).toISOString(),
          latitude: -33.4372,   // UAH default location
          longitude: -70.6506,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let msg = "Error al crear el trabajo";
        if (Array.isArray(errData.detail)) {
          msg = errData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(" • ");
        } else if (typeof errData.detail === "string") {
          msg = errData.detail;
        }
        throw new Error(msg);
      }

      setFormData({ title: "", description: "", address: "", reward_amount: "", duration_hours: "1", start_time: "" });
      setIsModalOpen(false);
      await fetchJobs();
    } catch (err: any) {
      setError(err.message || "Error de conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (jobId: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar este aviso?")) return;
    setCancellingId(jobId);
    try {
      const res = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        await fetchJobs();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "Error al cancelar el trabajo.");
      }
    } catch {
      alert("Error de conexión al cancelar.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewDetail = async (job: Job) => {
    setSelectedJob(job);
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs/${job.id}/detail`, { headers: authHeaders() });
      if (res.ok) {
        const detail = await res.json();
        setSelectedJob(detail);
      }
    } catch {
      // keep base job data
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const activeJobs = jobs.filter(j => ACTIVE_STATUSES.includes(j.status));
  const historyJobs = jobs.filter(j => HISTORY_STATUSES.includes(j.status));
  const totalGasto = jobs.reduce((acc, j) => acc + (j.price_clp || 0), 0);
  const displayJobs = activeTab === "active" ? activeJobs : historyJobs;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* Brillos */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-cyan-400/10 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] bg-violet-400/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Encabezado */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Store className="w-10 h-10 text-cyan-600" />
              Portal del Empleador
            </h1>
            <p className="text-slate-500 mt-2">Hola, <strong>{user?.fullName || "Empleador"}</strong>. Gestiona tus ofertas de trabajo.</p>
          </div>
          <button
            onClick={() => { setError(null); setIsModalOpen(true); }}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white bg-slate-900 rounded-2xl hover:bg-slate-800 hover:shadow-xl hover:shadow-cyan-500/20 focus:ring-4 focus:ring-cyan-500/30 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <PlusCircle className="w-5 h-5" />
            Publicar Aviso
          </button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { label: "Avisos Activos", value: activeJobs.length, icon: Briefcase, color: "bg-cyan-100 text-cyan-600", glow: "hover:shadow-cyan-500/10" },
            { label: "Estudiantes Asignados", value: jobs.filter(j => j.status === "MATCHED" || j.status === "IN_PROGRESS").length, icon: Users, color: "bg-violet-100 text-violet-600", glow: "hover:shadow-violet-500/10" },
            { label: "Gasto Total", value: `$${new Intl.NumberFormat("es-CL").format(totalGasto)}`, icon: BarChart3, color: "bg-emerald-100 text-emerald-600", glow: "hover:shadow-emerald-500/10" },
          ].map((m, i) => (
            <div key={i} className={`bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px] ${m.glow} transition-all`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${m.color} rounded-2xl flex items-center justify-center`}>
                  <m.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{m.label}</p>
                  <h3 className="text-3xl font-black text-slate-900">{m.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/60 backdrop-blur-md border border-white/60 p-1.5 rounded-2xl w-fit shadow-sm">
          {[
            { key: "active", label: "Anuncios Activos", count: activeJobs.length, icon: Briefcase },
            { key: "history", label: "Historial", count: historyJobs.length, icon: History },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "active" | "history")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-white/80"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                activeTab === tab.key ? "bg-white/20" : "bg-slate-100"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Panel de trabajos */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white/40">
            <h2 className="text-lg font-bold text-slate-800">
              {activeTab === "active" ? "Avisos en Curso" : "Trabajos Finalizados"}
            </h2>
            <button onClick={fetchJobs} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                <p className="text-slate-500 font-medium">Cargando avisos...</p>
              </div>
            ) : displayJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5">
                  {activeTab === "active" ? <Store className="w-9 h-9 text-slate-400" /> : <History className="w-9 h-9 text-slate-400" />}
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">
                  {activeTab === "active" ? "No hay avisos activos" : "Sin historial aún"}
                </h3>
                <p className="text-slate-400 max-w-xs text-sm">
                  {activeTab === "active"
                    ? "Publica tu primer aviso para empezar a recibir postulaciones."
                    : "Los trabajos completados o cancelados aparecerán aquí."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {displayJobs.map(job => {
                  const statusInfo = STATUS_CONFIG[job.status] ?? { label: job.status, color: "bg-slate-50 text-slate-600 border-slate-200", icon: null };
                  return (
                    <div key={job.id} className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 mr-3">
                          <h3 className="font-bold text-slate-900 text-lg group-hover:text-cyan-700 transition-colors leading-tight mb-1">
                            {job.title}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                          {job.approval_status === "pending" && (
                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" /> Pendiente de aprobación
                            </span>
                          )}
                        </div>
                        <span className="font-black text-emerald-600 text-xl shrink-0">
                          ${new Intl.NumberFormat("es-CL").format(job.price_clp)}
                        </span>
                      </div>

                      <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">{job.description}</p>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.duration_hours}h</span>
                        <span>•</span>
                        <span>{new Date(job.created_at).toLocaleDateString("es-CL")}</span>
                      </div>

                      {/* Estudiante asignado */}
                      {(job.status === "MATCHED" || job.status === "IN_PROGRESS") && (
                        <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 mb-4 flex items-center gap-3">
                          <div className="w-8 h-8 bg-violet-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-violet-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-violet-500 font-semibold">Estudiante asignado</p>
                            <p className="text-sm font-bold text-violet-800 truncate">
                              {job.worker?.full_name || "Cargando..."}
                            </p>
                          </div>
                          <button
                            onClick={() => handleViewDetail(job)}
                            className="text-violet-600 hover:text-violet-800 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleViewDetail(job)}
                          className="flex-1 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100"
                        >
                          Ver Detalle
                        </button>
                        {ACTIVE_STATUSES.slice(0, 2).includes(job.status) && (
                          <button
                            onClick={() => handleCancel(job.id)}
                            disabled={cancellingId === job.id}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"
                          >
                            {cancellingId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Publicar aviso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-white rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 to-violet-500" />
            <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Publicar Aviso</h2>
                  <p className="text-slate-500 text-sm">Completa los detalles para atraer estudiantes.</p>
                </div>
              </div>

              {error && (
                <div className="mb-5 bg-red-50 text-red-700 p-4 rounded-xl text-sm font-semibold border border-red-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Título del aviso *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} disabled={isSubmitting}
                    placeholder="Ej: Apoyo en tabulación de datos"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-slate-900 font-medium placeholder:text-slate-400 shadow-sm transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Descripción detallada *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} disabled={isSubmitting}
                    placeholder="¿Qué hay que hacer exactamente? Sé claro y específico." rows={3}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-slate-900 font-medium placeholder:text-slate-400 shadow-sm resize-none transition-all" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Pago (CLP) *</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input type="number" name="reward_amount" value={formData.reward_amount} onChange={handleChange} disabled={isSubmitting}
                        placeholder="15000" min="1000"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none font-medium shadow-sm transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Duración (h) *</label>
                    <select name="duration_hours" value={formData.duration_hours} onChange={handleChange} disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none font-medium shadow-sm transition-all">
                      <option value="1">1 hora</option>
                      <option value="1.5">1.5 horas</option>
                      <option value="2">2 horas</option>
                      <option value="2.5">2.5 horas</option>
                      <option value="3">3 horas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha y hora *</label>
                    <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none font-medium shadow-sm transition-all" />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}
                    className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-cyan-500/25">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</> : "Publicar Aviso"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalle del trabajo */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${selectedJob.status === "COMPLETED" || selectedJob.status === "PAID" ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-cyan-400 to-violet-500"}`} />
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-1">{selectedJob.title}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_CONFIG[selectedJob.status]?.color || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {STATUS_CONFIG[selectedJob.status]?.label || selectedJob.status}
                  </span>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-2 border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed">{selectedJob.description}</p>
                <div className="flex gap-4 pt-2 text-sm">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <DollarSign className="w-4 h-4" />
                    ${new Intl.NumberFormat("es-CL").format(selectedJob.price_clp)} CLP
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-4 h-4" />
                    {selectedJob.duration_hours}h
                  </span>
                </div>
              </div>

              {/* Estudiante asignado */}
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                </div>
              ) : selectedJob.worker ? (
                <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
                  <p className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-3">Estudiante Asignado</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-violet-200 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-lg">{selectedJob.worker.full_name}</p>
                      <p className="text-sm text-slate-500">{selectedJob.worker.email}</p>
                      {selectedJob.worker.major && (
                        <p className="text-xs text-violet-600 font-semibold flex items-center gap-1 mt-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {selectedJob.worker.major}
                        </p>
                      )}
                    </div>
                    {selectedJob.worker.reputation && (
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-0.5">Reputación</p>
                        <p className="text-xl font-black text-amber-500 flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400" />
                          {selectedJob.worker.reputation.toFixed(1)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-500">
                    {ACTIVE_STATUSES.includes(selectedJob.status)
                      ? "Aún no hay estudiante asignado. Esperando postulaciones."
                      : "No se asignó estudiante a este trabajo."}
                  </p>
                </div>
              )}

              <button onClick={() => setSelectedJob(null)} className="mt-5 w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
