import React from 'react';
import Link from 'next/link';
import { CategoryPills } from '../dynamic-categories/CategoryPills';

export const Hero = () => {
  return (
    <section className="relative w-full pt-20 pb-16 px-4 flex flex-col items-center justify-center overflow-hidden">
      <div className="max-w-4xl mx-auto text-center z-10">
        
        {/* Etiqueta / Badge Superior */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          Plataforma de Economía Local · En Vivo
        </div>

        {/* Titulares Principales */}
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
          Rentabiliza tus ventanas. <br className="hidden md:block" />
          <span className="text-gradient-blue">Sin contratos largos, puro apañe.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Encuentra &apos;pegas&apos; de 1 a 3 horas cerca de tu campus. Desde tutorías hasta apoyo en locales de Barrio República.
        </p>

        {/* Dual CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 relative z-20">
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5"
          >
            Busco Pega (Soy Estudiante)
          </Link>
          <Link 
            href="/register?type=pyme" 
            className="inline-flex items-center justify-center bg-white border-2 border-orange-100 text-slate-700 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg"
          >
            Necesito Ayuda (Publicar Trabajo)
          </Link>
        </div>
      </div>

      {/* Marquee de Categorías */}
      <div className="w-full max-w-7xl mx-auto">
        <CategoryPills />
      </div>
    </section>
  );
};


