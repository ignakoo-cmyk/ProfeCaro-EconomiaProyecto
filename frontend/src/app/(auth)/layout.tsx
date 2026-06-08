"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const GIGS_DATA = [
  {
    title: "Apoyo en Inventario",
    location: "Minimarket Barrio República",
    pay: "$15.000 / 2hrs",
    dist: "A 2 cuadras"
  },
  {
    title: "Mesero/a de Refuerzo",
    location: "Cafetería Central",
    pay: "$18.000 / 2hrs",
    dist: "A 1 cuadra"
  },
  {
    title: "Promotor de Evento",
    location: "Feria Universitaria",
    pay: "$25.000 / 3hrs",
    dist: "En campus"
  }
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [activeGig, setActiveGig] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setActiveGig((prev) => (prev + 1) % GIGS_DATA.length);
        setIsFading(false);
      }, 500); // Duración del fade out
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, []);

  const currentGig = GIGS_DATA[activeGig];

  return (
    <div className="min-h-screen flex w-full">
      {/* Lado Izquierdo: Visual & Mesh Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-blue-900 items-center justify-center">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 opacity-80" 
             style={{
               backgroundImage: `
                 radial-gradient(at 0% 0%, rgba(37,99,235,1) 0px, transparent 50%),
                 radial-gradient(at 100% 0%, rgba(29,78,216,1) 0px, transparent 50%),
                 radial-gradient(at 100% 100%, rgba(30,58,138,1) 0px, transparent 50%),
                 radial-gradient(at 0% 100%, rgba(59,130,246,1) 0px, transparent 50%)
               `,
               filter: 'blur(40px)',
               transform: 'scale(1.2)'
             }} 
        />
        
        {/* Floating 3D/Glassmorphism Element con Carrusel */}
        <div className="relative z-10 flex flex-col items-center w-full px-12">
          <Link href="/" className="absolute -top-32 left-8 text-white font-black text-2xl tracking-tight z-50 hover:opacity-80 transition-opacity">
            Ventana<span className="text-blue-300">Work</span>
          </Link>
          
          <div className={`w-[400px] h-[280px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transform -rotate-2 hover:rotate-0 transition-all duration-500 flex flex-col justify-between group ${isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest backdrop-blur-sm shadow-sm">Gig Activo</span>
              </div>
              <ShieldCheck className="text-emerald-400 w-6 h-6 animate-pulse" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{currentGig.title}</h3>
              <p className="text-blue-100/80 text-sm">{currentGig.location}</p>
            </div>
            
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg shadow-inner">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm">{currentGig.pay}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg shadow-inner">
                <MapPin className="w-4 h-4 text-blue-300" />
                <span className="font-medium text-sm">{currentGig.dist}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center max-w-sm">
            <h1 className="text-3xl font-black text-white mb-4 tracking-tight leading-[1.1]">
              Conectando el talento <br/> universitario.
            </h1>
            <p className="text-blue-100 text-lg opacity-80 leading-relaxed">
              Únete a la red local más rápida para rentabilizar tus ventanas o encontrar ayuda instantánea.
            </p>
          </div>
        </div>
      </div>

      {/* Lado Derecho: Formulario Container */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-12 bg-slate-50 relative min-h-screen">
        {/* Navbar Superior del Formulario: Botón Volver y Logo */}
        <div className="w-full flex justify-between items-center mb-10">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
          <Link href="/" className="lg:hidden font-black text-xl tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
            Ventana<span className="text-blue-600">Work</span>
          </Link>
        </div>

        {/* Contenedor Centrado para el formulario */}
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
