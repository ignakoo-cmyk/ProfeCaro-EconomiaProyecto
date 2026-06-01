"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Store,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  ArrowRight,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userType === "ADMIN") router.push("/admin");
      else if (user.userType === "STUDENT") router.push("/dashboard/student");
      else router.push("/dashboard/pyme");
    }
  }, [isAuthenticated, user, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-grid-pattern">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-200">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Ventana<span className="text-blue-600">Work</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
              Iniciar Sesión
            </Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-200">
              Unirse Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-20 pb-12 px-4 max-w-7xl mx-auto w-full">

        <div className="text-center mb-16 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Plataforma de Economía Local · En Vivo
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
            Conecta el Talento Local con las<br />
            <span className="text-gradient-blue">Necesidades Locales</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            La plataforma inteligente que une a estudiantes universitarios con tiempo libre y negocios de barrio que necesitan ayuda rápida.
          </p>
        </div>

        {/* Two Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl relative">

          {/* Connector */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20
                          w-14 h-14 rounded-full bg-white border-2 border-slate-200 shadow-lg
                          items-center justify-center text-xs font-black text-slate-400 tracking-widest">
            &amp;
          </div>

          {/* Student Card */}
          <div className="glass-panel glass-panel-hover p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-100 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
                <GraduationCap className="h-3.5 w-3.5" /> Estudiantes
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Flexible Gigs. <br /><span className="text-gradient-blue">Cash in Your Gaps.</span>
              </h2>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Aprovecha tus ventanas entre clases. Encuentra trabajos por horas cerca de tu campus y cobra al instante al terminar.
              </p>

              {/* Fake App Illustration */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3 text-blue-700">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs font-semibold">Gigs cerca (500m)</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-white border border-blue-100 rounded-xl px-3 py-2 flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-700">Mesero · Cafetería Central</span>
                    <span className="text-xs text-emerald-600 font-bold">$12.000/hr</span>
                  </div>
                  <div className="bg-white border border-blue-100 rounded-xl px-3 py-2 flex justify-between items-center opacity-60">
                    <span className="text-xs font-medium text-slate-700">Inventario · Librería Sur</span>
                    <span className="text-xs text-emerald-600 font-bold">$8.500/hr</span>
                  </div>
                </div>
              </div>

              <Link href="/login" className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200">
                Explora Gigs Locales (Gratis)
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Business Card */}
          <div className="glass-panel glass-panel-hover p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-orange-100 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest mb-6">
                <Store className="h-3.5 w-3.5" /> Negocios
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Quick Help. <br /><span className="text-gradient-orange">Verified Talent in Minutes.</span>
              </h2>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                ¿Pico inesperado? Publica una alerta y recibe universitarios verificados listos para ayudar en cuestión de minutos.
              </p>

              {/* Fake App Illustration */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3 text-orange-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-semibold">Respuestas rápidas (avg. 4 min)</span>
                </div>
                <div className="flex gap-2 items-center">
                  {[1,2,3].map(i => (
                    <div key={i} className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${i < 3 ? 'bg-white border-emerald-300' : 'bg-white border-slate-200 animate-pulse'}`}>
                      {i < 3 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Clock className="h-4 w-4 text-slate-300" />}
                    </div>
                  ))}
                  <span className="text-xs text-slate-400 font-medium">3 aplicantes en espera</span>
                </div>
              </div>

              <Link href="/login" className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200">
                Postea un Gig Rápido
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* How it Works */}
      <section className="bg-white border-t border-slate-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Cómo Funciona</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full mx-auto" />
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Registro Simple', icon: ShieldCheck, color: 'text-blue-600 bg-blue-50 border-blue-100', desc: 'Crea tu cuenta en minutos.' },
              { step: '2', title: 'Verificación', icon: CheckCircle2, color: 'text-indigo-600 bg-indigo-50 border-indigo-100', desc: 'Aprobación rápida del equipo.' },
              { step: '3', title: 'Match de Gigs', icon: MapPin, color: 'text-orange-600 bg-orange-50 border-orange-100', desc: 'Conexión inteligente por ubicación.' },
              { step: '4', title: 'Pago Instantáneo', icon: Wallet, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'El pago se libera al terminar.' },
            ].map((item, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl text-center">
                <div className={`inline-flex h-12 w-12 rounded-xl items-center justify-center border mb-4 ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="text-xs font-black text-slate-300 mb-1 uppercase tracking-widest">Paso {item.step}</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-10">
          <div className="col-span-2">
            <span className="text-xl font-black text-slate-900 mb-3 block">
              Ventana<span className="text-blue-600">Work</span>
            </span>
            <p className="text-slate-500 text-sm max-w-xs">
              Economía local a demanda. Democratizando el acceso a oportunidades flexibles y ayuda rápida.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Plataforma</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Gigs Verificados</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Para Estudiantes</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Para Negocios</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Confianza</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Confianza y Seguridad</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Soporte</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Términos de Servicio</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>© 2026 VentanaWork · Todos los derechos reservados</p>
          <p className="text-xs">Economía local a demanda</p>
        </div>
      </footer>
    </div>
  );
}
