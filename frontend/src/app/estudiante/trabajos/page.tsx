"use client";

import { useState, useEffect } from "react";
import {
  Search, MapPin, DollarSign, Briefcase, GraduationCap,
  Clock, ChevronRight, UserCircle2, Sparkles, Filter,
  X, CheckCircle, Loader2, Send
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useApplicationsStore } from "@/stores/applicationsStore";

interface Job {
  id: string;
  title: string;
  description: string;
  address: string;
  reward_amount: number;
  category: string;
  time_posted: string;
}

const MOCK_JOBS: Job[] = [
  {
    id: "m1",
    title: "Tutor Par - Álgebra y Física",
    description: "Se necesita estudiante de 3er año en adelante para dar tutorías a mechones de la Facultad de Ingeniería. Horario flexible.",
    address: "Biblioteca Central / Salas de Estudio",
    reward_amount: 12000,
    category: "Tutorías",
    time_posted: "Hace 2 horas"
  },
  {
    id: "m2",
    title: "Apoyo en Archivo Patrimonial",
    description: "Organización, catalogación y digitalización de documentos históricos. Ideal para estudiantes de Historia o Literatura.",
    address: "Archivo Patrimonial UAH",
    reward_amount: 25000,
    category: "Investigación",
    time_posted: "Hace 5 horas"
  },
  {
    id: "m3",
    title: "Corcheteador de Pruebas",
    description: "Se requiere apoyo urgente para corchetear, ordenar y clasificar pruebas finales para el departamento de Matemáticas.",
    address: "Sala de Profesores, Edificio A",
    reward_amount: 15000,
    category: "Trabajo Físico",
    time_posted: "Hace 1 día"
  },
  {
    id: "m4",
    title: "Levantamiento de Datos Estadísticos",
    description: "Apoyo a tesista de Sociología en encuestas presenciales a estudiantes en el patio central. Duración 2 días.",
    address: "Patio Central",
    reward_amount: 35000,
    category: "Apoyo Académico",
    time_posted: "Hace 1 día"
  }
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8009";

export default function EstudianteFeedPage() {
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const { token, user } = useAuthStore();
  const { applications, addApplication, hasApplied } = useApplicationsStore();

  // Modal state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [modalStep, setModalStep] = useState<"confirm" | "submitting" | "success">("confirm");

  const categories = ["Todos", "Tutorías", "Investigación", "Trabajo Físico", "Apoyo Académico"];

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/api/jobs/feed`, { headers });
        if (res.ok) {
          const data = await res.json();
          const jobs: Job[] = (Array.isArray(data) ? data : []).map((j: any) => ({
            id: j.id,
            title: j.title,
            description: j.description,
            address: j.address || "Sin dirección especificada",
            reward_amount: j.price_clp || j.reward_amount || 0,
            category: j.category || "General",
            time_posted: j.created_at
              ? new Date(j.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "short" })
              : "Reciente"
          }));
          setActiveJobs(jobs.length > 0 ? jobs : MOCK_JOBS);
        } else {
          setActiveJobs(MOCK_JOBS);
        }
      } catch {
        setActiveJobs(MOCK_JOBS);
      } finally {
        setIsLoadingJobs(false);
      }
    };
    loadJobs();
  }, [token]);

  const openApplyModal = (job: Job) => {
    setSelectedJob(job);
    setModalStep("confirm");
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    setModalStep("submitting");

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch(`${API_URL}/api/jobs/${selectedJob.id}/apply`, { method: "POST", headers });
    } catch {
      // Backend not available — continue in mock mode
    }

    await new Promise(r => setTimeout(r, 1000));
    // Save to persistent store
    addApplication({
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      address: selectedJob.address,
      reward_amount: selectedJob.reward_amount,
      category: selectedJob.category,
    });
    setModalStep("success");
  };

  const closeModal = () => {
    setSelectedJob(null);
    setModalStep("confirm");
  };

  const filteredJobs = activeJobs
    .filter(job => activeFilter === "Todos" || job.category === activeFilter)
    .filter(job =>
      searchQuery === "" ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans pt-6">

      {/* Fondo Antigravity */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-emerald-400/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-cyan-400/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Encabezado + Filtros */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-emerald-500" />
            Descubre Oportunidades
          </h1>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por palabra clave..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-md border border-white rounded-2xl shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto w-full pb-2 md:pb-0 hide-scrollbar">
              <div className="flex gap-2 items-center">
                <Filter className="w-5 h-5 text-slate-400 ml-2 mr-1" />
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-all ${
                      activeFilter === cat
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                        : 'bg-white/60 text-slate-600 hover:bg-white border border-white hover:shadow-sm'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Feed de Trabajos */}
          <div className="lg:col-span-8 space-y-6">
            {isLoadingJobs ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white/50 animate-pulse h-48 rounded-3xl border border-white/60" />
                ))}
              </div>
            ) : (
              filteredJobs.map(job => {
                const isApplied = hasApplied(job.id);
                return (
                  <div key={job.id} className="group bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] hover:border-emerald-200/50 transition-all duration-300 flex flex-col sm:flex-row gap-6">

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                          <Briefcase className="w-3 h-3" />
                          {job.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <Clock className="w-3 h-3" />
                          {job.time_posted}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{job.title}</h2>
                      <p className="text-slate-600 mb-6 line-clamp-2 leading-relaxed">{job.description}</p>

                      <div className="flex flex-wrap gap-4 items-center">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {job.address}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-slate-200/50 pt-4 sm:pt-0 sm:pl-6 shrink-0">
                      <div className="mb-4 sm:mb-0">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 sm:text-right">Pago Estimado</p>
                        <h3 className="text-3xl font-black text-emerald-600 flex items-center gap-1">
                          <DollarSign className="w-6 h-6" />
                          {new Intl.NumberFormat('es-CL').format(job.reward_amount)}
                        </h3>
                      </div>

                      {hasApplied(job.id) ? (
                        <div className="w-full sm:w-auto px-6 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Postulado
                        </div>
                      ) : (
                        <button
                          onClick={() => openApplyModal(job)}
                          className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-200 hover:shadow-emerald-500/20 hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 flex items-center justify-center gap-2 group/btn"
                        >
                          Postular
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {!isLoadingJobs && filteredJobs.length === 0 && (
              <div className="bg-white/50 backdrop-blur-md rounded-[2rem] border border-white/60 p-12 text-center">
                <p className="text-slate-500 text-lg font-medium">No hay trabajos disponibles en esta categoría.</p>
              </div>
            )}
          </div>

          {/* Widget Lateral */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">

              {/* Profile Card */}
              <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 border border-white shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 shadow-inner">
                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                      <UserCircle2 className="w-8 h-8 text-slate-300" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{user?.fullName || "Tu Perfil"}</h3>
                    <p className="text-sm text-slate-500">Estudiante UAH</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-700">Fuerza del Perfil</span>
                    <span className="text-xl font-black text-emerald-500">60%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 w-[60%] rounded-full" />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-600 font-medium mb-3">
                    🚀 <strong className="text-slate-900">Sugerencia:</strong> Añade habilidades para desbloquear trabajos mejor pagados.
                  </p>
                  <a href="/settings" className="block w-full text-center py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm">
                    Completar Perfil
                  </a>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-slate-900 text-white rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                  Mis Postulaciones
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Esta Sesión</p>
                    <p className="text-2xl font-black text-emerald-400">{applications.length}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Disponibles</p>
                    <p className="text-2xl font-black text-white">{filteredJobs.length}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Modal de Postulación */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={modalStep !== "submitting" ? closeModal : undefined} />

          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            {/* Barra de acento superior */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-cyan-500" />

            {modalStep === "success" ? (
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-emerald-50 border-4 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">¡Postulación Enviada!</h2>
                <p className="text-slate-500 mb-2">Tu interés en <strong className="text-slate-700">"{selectedJob.title}"</strong> ha sido registrado.</p>
                <p className="text-sm text-slate-400 mb-8">El empleador revisará tu perfil y se pondrá en contacto contigo pronto.</p>
                <button
                  onClick={closeModal}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/30"
                >
                  Seguir Explorando
                </button>
              </div>
            ) : (
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <Send className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Confirmar Postulación</h2>
                      <p className="text-sm text-slate-500">Revisa los detalles antes de enviar</p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    disabled={modalStep === "submitting"}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Detalles del trabajo */}
                <div className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-3 border border-slate-100">
                  <h3 className="font-bold text-slate-900 text-lg">{selectedJob.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedJob.description}</p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <span className="flex items-center gap-1.5 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {selectedJob.address}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <DollarSign className="w-4 h-4" />
                      {new Intl.NumberFormat('es-CL').format(selectedJob.reward_amount)} CLP
                    </span>
                  </div>
                </div>

                {/* Nota informativa */}
                <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                  <span className="text-blue-500 text-lg shrink-0">ℹ️</span>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Al postular, el empleador verá tu perfil y podrá contactarte para coordinar los detalles del trabajo.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    disabled={modalStep === "submitting"}
                    className="flex-1 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={modalStep === "submitting"}
                    className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                  >
                    {modalStep === "submitting" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Postular Ahora
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
