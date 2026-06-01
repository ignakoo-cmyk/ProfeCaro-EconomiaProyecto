"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Activity, Smartphone, Building2, Shield, Scan, Terminal, CheckCircle2 } from "lucide-react";

type Environment = "student" | "pyme" | "admin";

const ENV_CONFIG = {
  student: { path: "/dashboard/student", label: "Vista Estudiante (App)", icon: Smartphone, color: "blue" },
  pyme: { path: "/dashboard/pyme", label: "Vista Negocio (Gestión)", icon: Building2, color: "orange" },
  admin: { path: "/admin", label: "Consola Admin", icon: Shield, color: "emerald" },
};

export default function PresentationDemo() {
  const [activeEnv, setActiveEnv] = useState<Environment>("student");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // Capturar la URL actual dinámicamente (útil si usa ngrok/localtunnel)
    setBaseUrl(window.location.origin);
  }, []);

  const qrValue = `${baseUrl}${ENV_CONFIG[activeEnv].path}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden relative flex flex-col">
      
      {/* Background Architectural Diagram */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Grid */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Connection Lines */}
          <g stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="8 8">
            <path d="M 20% 50% Q 40% 20% 50% 50% T 80% 50%" className="animate-pulse" />
            <path d="M 20% 50% Q 40% 80% 50% 50% T 80% 50%" className="animate-pulse" />
          </g>
          {/* Nodes */}
          <circle cx="20%" cy="50%" r="8" fill="#3b82f6" />
          <circle cx="50%" cy="50%" r="12" fill="#10b981" />
          <circle cx="80%" cy="50%" r="8" fill="#f97316" />
        </svg>
      </div>

      {/* Top Status Bar */}
      <header className="bg-slate-900 text-slate-300 py-2 px-6 flex justify-between items-center z-10 shadow-md">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-mono tracking-widest uppercase">VentanaWork - Entorno de Desarrollo v1.0</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1 border border-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Estado: Operativo</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center gap-12 p-8 z-10">

        {/* Left Side: System Info (Subtle) */}
        <div className="hidden lg:flex flex-col gap-6 w-64 opacity-60">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Métricas de Base</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li className="flex justify-between"><span>Latencia DB</span> <span className="text-emerald-600">12ms</span></li>
              <li className="flex justify-between"><span>WebSockets</span> <span className="text-emerald-600">Conectado</span></li>
              <li className="flex justify-between"><span>PostGIS</span> <span className="text-emerald-600">Activo</span></li>
            </ul>
          </div>
        </div>

        {/* Center: The Inspection Portal */}
        <div className="w-full max-w-xl flex flex-col items-center">
          
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center relative w-full">
            {/* Glossy highlight */}
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-tr from-white/10 to-white/60 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center w-full">
              <Scan className="h-10 w-10 text-slate-400 mb-4" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center mb-2">Inspección en Vivo</h2>
              <p className="text-slate-500 text-center mb-8 font-medium">Escanee para ingresar al entorno de prueba</p>

              {/* QR Code Container */}
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 mb-8 relative group cursor-pointer transition-transform hover:scale-105">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white rounded-2xl">
                  {baseUrl ? (
                    <QRCode
                      value={qrValue}
                      size={240}
                      level="H"
                      fgColor="#0f172a"
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="w-[240px] h-[240px] flex items-center justify-center bg-slate-100 rounded-lg animate-pulse">
                      <Activity className="text-slate-400 h-8 w-8" />
                    </div>
                  )}
                  {/* Fake Logo inside QR */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-black text-xs">VW</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environment Selector (Pill Buttons) */}
              <div className="flex bg-slate-100/80 p-1.5 rounded-full w-full justify-between shadow-inner border border-slate-200/50">
                {(Object.keys(ENV_CONFIG) as Environment[]).map((env) => {
                  const isActive = activeEnv === env;
                  const config = ENV_CONFIG[env];
                  const Icon = config.icon;
                  return (
                    <button
                      key={env}
                      onClick={() => setActiveEnv(env)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-full text-xs font-bold transition-all ${
                        isActive
                          ? "bg-white text-slate-900 shadow-md shadow-slate-200/50 scale-100"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? `text-${config.color}-500` : ""}`} />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current URL indicator */}
          <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-500 bg-white/50 px-4 py-2 rounded-full border border-slate-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Apuntando a: <span className="font-mono text-slate-700">{qrValue || "Cargando..."}</span>
          </div>

        </div>

        {/* Right Side: Smartphone Mockup */}
        <div className="hidden md:block shrink-0 relative perspective-1000">
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-orange-500/10 rounded-[3.5rem] blur-xl" />
          
          <div className="relative w-[320px] h-[650px] bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-400/50 border-[6px] border-slate-800 overflow-hidden ring-4 ring-white/50 transform rotate-y-[-5deg] rotate-x-[2deg]">
            
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20 flex justify-center items-end pb-1">
              <div className="w-12 h-1.5 bg-slate-900 rounded-full" />
            </div>

            {/* Iframe to load the actual app view */}
            <div className="w-full h-full bg-white relative z-10 pt-6">
              {baseUrl ? (
                <iframe
                  src={qrValue}
                  className="w-full h-full border-none bg-white"
                  title="Mobile Mockup"
                  style={{ pointerEvents: 'none' }} // Disable interaction so it just acts as a visual mockup
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <span className="animate-pulse text-slate-400">Cargando UI...</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <span className="inline-block bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
              Vista Previa en Vivo
            </span>
          </div>
        </div>

      </main>
    </div>
  );
}
