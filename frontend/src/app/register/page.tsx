"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

type RegistrationType = "STUDENT" | "PYME" | null;

export default function RegisterPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [type, setType] = useState<RegistrationType>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !email || !password) return;

    // Simular registro automático + login
    await login(email, type);
    
    if (type === "STUDENT") router.push("/dashboard/student");
    else router.push("/dashboard/pyme");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header Simple */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#0052FF] flex items-center justify-center text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-bold text-slate-600 text-sm">Volver al inicio</span>
          </Link>
          <p className="text-sm font-medium text-slate-500">Paso {type ? "2/2" : "1/2"}</p>
        </div>

        <div className="p-8">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-slate-900">Únete a Ventana-Work</h1>
            <p className="text-slate-500 mt-2">La red local de micro-empleos</p>
          </div>

          {!type ? (
            // PASO 1: Selección de Rol (Giant Toggles)
            <div className="space-y-4 max-w-md mx-auto">
              <button 
                onClick={() => setType("STUDENT")}
                className="w-full flex items-center p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-[#0052FF] hover:bg-blue-50 transition-all group text-left"
              >
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-[#0052FF] mr-5 group-hover:scale-110 transition-transform">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Soy Estudiante</h3>
                  <p className="text-slate-500 text-sm mt-1">Busco generar ingresos en mis ventanas libres.</p>
                </div>
              </button>

              <button 
                onClick={() => setType("PYME")}
                className="w-full flex items-center p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-[#f97316] hover:bg-orange-50 transition-all group text-left"
              >
                <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center text-[#f97316] mr-5 group-hover:scale-110 transition-transform">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Tengo un Negocio</h3>
                  <p className="text-slate-500 text-sm mt-1">Necesito ayuda rápida y flexible para mi local.</p>
                </div>
              </button>
            </div>
          ) : (
            // PASO 2: Formulario
            <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 flex items-center justify-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${type === 'STUDENT' ? 'bg-[#0052FF] text-white' : 'bg-[#f97316] text-white'}`}>
                  Registro de {type === 'STUDENT' ? 'Estudiante' : 'Pyme'}
                </span>
                <button onClick={() => setType(null)} className="text-xs font-semibold text-slate-400 hover:text-slate-700 underline">Cambiar</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Email {type === 'STUDENT' && <span className="text-[#0052FF]">(Solo @uahurtado.cl)</span>}</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={type === 'STUDENT' ? "alumno@uahurtado.cl" : "contacto@empresa.cl"}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 transition-all ${type === 'STUDENT' ? 'focus:ring-[#0052FF]/50 focus:border-[#0052FF]' : 'focus:ring-[#f97316]/50 focus:border-[#f97316]'}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Contraseña</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 transition-all ${type === 'STUDENT' ? 'focus:ring-[#0052FF]/50 focus:border-[#0052FF]' : 'focus:ring-[#f97316]/50 focus:border-[#f97316]'}`}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 mt-6 ${type === 'STUDENT' ? 'bg-[#0052FF] hover:bg-blue-700' : 'bg-[#f97316] hover:bg-orange-600'}`}
                >
                  {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                </button>
              </form>
            </div>
          )}

          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-bold text-slate-900 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
