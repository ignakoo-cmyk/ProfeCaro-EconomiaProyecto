"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, DollarSign, Briefcase, GraduationCap, Clock, ChevronRight, UserCircle2, Sparkles, Filter } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  address: string;
  reward_amount: number;
  category: string;
  time_posted: string;
}

export default function EstudianteFeedPage() {
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Todos");

  const categories = ["Todos", "Tutorías", "Investigación", "Trabajo Físico", "Apoyo Académico"];

  useEffect(() => {
    // Simulando carga de datos mockeados
    setTimeout(() => {
      setActiveJobs([
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
      ]);
      setIsLoadingJobs(false);
    }, 1000);
  }, []);

  const filteredJobs = activeFilter === "Todos" 
    ? activeJobs 
    : activeJobs.filter(job => job.category === activeFilter);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans pt-6">
      
      {/* Fondo Antigravity (Brillos) */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-emerald-400/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-cyan-400/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Filtros Superiores */}
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
          
          {/* Feed de Trabajos (Columna 8) */}
          <div className="lg:col-span-8 space-y-6">
            {isLoadingJobs ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white/50 animate-pulse h-48 rounded-3xl border border-white/60"></div>
                ))}
              </div>
            ) : (
              filteredJobs.map(job => (
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
                    
                    <button className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-200 hover:shadow-emerald-500/20 hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 flex items-center justify-center gap-2 group/btn">
                      Postular
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>

                </div>
              ))
            )}
            
            {!isLoadingJobs && filteredJobs.length === 0 && (
              <div className="bg-white/50 backdrop-blur-md rounded-[2rem] border border-white/60 p-12 text-center">
                <p className="text-slate-500 text-lg font-medium">No hay trabajos disponibles en esta categoría.</p>
              </div>
            )}
          </div>

          {/* Widget Lateral de Perfil (Columna 4) */}
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
                    <h3 className="font-bold text-slate-900 text-lg">Tu Perfil</h3>
                    <p className="text-sm text-slate-500">Estudiante UAH</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-700">Fuerza del Perfil</span>
                    <span className="text-xl font-black text-emerald-500">60%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 w-[60%] rounded-full shadow-inner relative">
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_25%,rgba(255,255,255,0.2)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.2)_75%,rgba(255,255,255,0.2)_100%)] bg-[length:20px_20px] animate-[progress_1s_linear_infinite]" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-600 font-medium mb-3">
                    🚀 <strong className="text-slate-900">Sugerencia:</strong> Añade tus lenguajes de programación o habilidades blandas para desbloquear trabajos técnicos mejor pagados.
                  </p>
                  <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm">
                    Completar Perfil
                  </button>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-slate-900 text-white rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                  Impacto VentanaWork
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Trabajos Realizados</p>
                    <p className="text-2xl font-black text-emerald-400">12</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Ganancias Extra</p>
                    <p className="text-xl font-black text-white">$145k</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { background-position: 20px 0; }
          100% { background-position: 0 0; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
