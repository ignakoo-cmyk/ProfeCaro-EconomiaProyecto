"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Loader2, PlusCircle, MapPin, DollarSign, Store, X, BarChart3, Users, Briefcase } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  address: string;
  reward_amount: number;
  status: string;
}

export default function PanelNegocioPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    reward_amount: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { token } = useAuthStore();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8009";

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs/employer`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveJobs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching jobs", err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const amount = parseInt(formData.reward_amount);

    if (!formData.description.trim() || !formData.address.trim() || isNaN(amount)) {
      setError("Por favor completa la descripción, dirección y un monto válido.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formData.title.trim() || "Nuevo Trabajo",
          description: formData.description.trim(),
          address: formData.address.trim(),
          reward_amount: amount,
          latitude: 0,
          longitude: 0
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let errorMessage = "Error al crear el trabajo";
        
        // FASE 1: Corrección del Bug [object Object]
        // Detectar si el error es un array de validación (ej. Pydantic/Zod)
        if (Array.isArray(errData.detail)) {
          errorMessage = errData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(" • ");
        } else if (typeof errData.detail === "string") {
          errorMessage = errData.detail;
        } else if (errData.message) {
          errorMessage = errData.message;
        }

        throw new Error(errorMessage);
      }

      const newJob = await res.json();
      
      setActiveJobs([newJob, ...activeJobs]);
      
      setFormData({ title: "", description: "", address: "", reward_amount: "" });
      setIsModalOpen(false); // Cerrar modal al éxito
      
    } catch (err: any) {
      // Mostrar el mensaje extraído y formateado
      setError(err.message || "Error de conexión al intentar publicar el trabajo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Métricas calculadas
  const totalInvertido = activeJobs.reduce((acc, job) => acc + (job.reward_amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      
      {/* Fondo Antigravity (Brillos y gradientes) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-cyan-400/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-violet-400/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Encabezado Dashboard */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Store className="w-10 h-10 text-cyan-600" />
              Portal del Empleador
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Gestiona tus ofertas y encuentra el mejor talento universitario.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white transition-all duration-300 bg-slate-900 rounded-2xl hover:bg-slate-800 hover:shadow-xl hover:shadow-cyan-500/20 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <PlusCircle className="w-5 h-5" />
            <span>Publicar Nuevo Aviso</span>
          </button>
        </div>

        {/* Tarjetas de Métricas (Antigravity Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(6,182,212,0.1)] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avisos Activos</p>
                <h3 className="text-3xl font-black text-slate-900">{activeJobs.length}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(139,92,246,0.1)] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Interacciones</p>
                <h3 className="text-3xl font-black text-slate-900">--</h3>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Gasto Mensual</p>
                <h3 className="text-3xl font-black text-slate-900">
                  ${new Intl.NumberFormat('es-CL').format(totalInvertido)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla / Grid de Trabajos Activos */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/40">
            <h2 className="text-xl font-bold text-slate-800">Gestión de Avisos</h2>
          </div>
          
          <div className="p-8">
            {isLoadingJobs ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                <p className="text-slate-500 font-medium">Cargando tus avisos...</p>
              </div>
            ) : activeJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Store className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Aún no hay avisos</h3>
                <p className="text-slate-500 max-w-md">No tienes trabajos publicados actualmente. Crea un aviso para empezar a recibir postulaciones de estudiantes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {activeJobs.map(job => (
                  <div key={job.id} className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-900 text-xl group-hover:text-cyan-700 transition-colors">{job.title}</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-100">
                          Activo
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed">{job.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium">
                        <MapPin className="w-4 h-4 text-slate-400" /> {job.address}
                      </span>
                      <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                        <DollarSign className="w-4 h-4" /> {new Intl.NumberFormat('es-CL').format(job.reward_amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal Antigravity (Glassmorphism) para Crear Trabajo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Overlay desenfocado */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Contenido del Modal */}
          <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] shadow-2xl overflow-hidden transform transition-all">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-violet-500" />
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <PlusCircle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Publicar Aviso</h2>
                  <p className="text-slate-500 font-medium">Completa los detalles para atraer talento.</p>
                </div>
              </div>
              
              {error && (
                <div className="mb-6 bg-red-50/80 backdrop-blur-sm text-red-700 p-4 rounded-xl text-sm font-bold border border-red-200 flex flex-col gap-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Error de validación
                  </span>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Título del aviso</label>
                  <input 
                    type="text" 
                    name="title"
                    placeholder="Ej: Apoyo en tabulación de datos" 
                    value={formData.title}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-slate-900 transition-all font-medium placeholder:text-slate-400 shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Descripción detallada *</label>
                  <textarea 
                    name="description"
                    placeholder="¿Qué hay que hacer exactamente? Sé claro y directo." 
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-slate-900 transition-all font-medium placeholder:text-slate-400 shadow-sm resize-none" 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Ubicación *</label>
                    <div className="relative">
                      <MapPin className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        name="address"
                        placeholder="Ej: Biblioteca Central" 
                        value={formData.address}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-slate-900 transition-all font-medium shadow-sm" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pago ofrecido (CLP) *</label>
                    <div className="relative">
                      <DollarSign className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                      <input 
                        type="number" 
                        name="reward_amount"
                        placeholder="Ej: 15000" 
                        value={formData.reward_amount}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        min="0"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none text-slate-900 transition-all font-medium shadow-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-cyan-500/30 focus:ring-4 focus:ring-cyan-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      "Publicar Aviso"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
