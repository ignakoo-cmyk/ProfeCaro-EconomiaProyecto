"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { Zap, ArrowRight, User, Briefcase, Database, Activity } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"STUDENT" | "PYME">("STUDENT");
  const [email, setEmail] = useState("admin@tickets.uah.cl");
  const [password, setPassword] = useState("password123");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    let role: "STUDENT" | "PYME" | "ADMIN" = activeTab;
    if (email === "admin" || email === "admin@tickets.uah.cl") role = "ADMIN";

    await login(email, role);

    if (role === "ADMIN") router.push("/admin");
    else if (role === "STUDENT") router.push("/dashboard/student");
    else router.push("/dashboard/pyme");
  };

  return (
    <div className="min-h-screen bg-grid-pattern flex items-center justify-center p-6">

      <div className="w-full max-w-md">

        {/* Back to Home */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900">Ventana<span className="text-blue-600">Work</span></span>
          </Link>
        </div>

        {/* System Status Banner */}
        <div className="mb-4 glass-panel rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Database className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">ESTADO DEL SISTEMA EN VIVO:</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              DB Docker <span className="font-bold text-emerald-600">OPERATIVA</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-500" />
              Registro <span className="font-bold text-emerald-600">ACTIVO</span>
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-panel p-8 rounded-3xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">Conéctate a VentanaWork</h1>
            <p className="text-slate-500 text-sm">Selecciona tu rol e ingresa a tu cuenta.</p>
          </div>

          {/* Role Selector */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-7 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("STUDENT")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "STUDENT"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <User className="h-4 w-4" /> ESTUDIANTE
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PYME")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "PYME"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Briefcase className="h-4 w-4" /> NEGOCIO
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm shadow-sm tracking-[0.3em]"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                Recordarme
              </label>
              <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-md mt-2 ${
                activeTab === "STUDENT"
                  ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                  : "bg-orange-500 hover:bg-orange-600 shadow-orange-200"
              }`}
            >
              {isLoading ? <span className="animate-pulse">Ingresando...</span> : (<>Entrar <ArrowRight className="h-4 w-4" /></>)}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">O continúa con</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {['Google', 'LinkedIn', 'Meta'].map(s => (
              <button key={s} className="flex items-center justify-center py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 text-xs font-semibold transition-all shadow-sm">
                {s}
              </button>
            ))}
          </div>

          <div className="mt-7 text-center space-y-3">
            <p className="text-sm text-slate-500">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:underline underline-offset-2">
                Registrarse
              </Link>
            </p>
            <p>
              <Link href="/admin" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                Login de Soporte / Admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
