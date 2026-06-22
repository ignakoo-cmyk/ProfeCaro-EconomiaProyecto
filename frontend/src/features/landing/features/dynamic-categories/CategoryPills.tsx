"use client";

import React from 'react';
import { TRABAJO_CATEGORIES } from '../../data/trabajoCategories';

export const CategoryPills = () => {

  return (
    <div className="w-full overflow-hidden py-8 mt-8 relative group">
      {/* Sombras en los bordes para un efecto de difuminado (fade) más pronunciado */}
      <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Contenedor del Marquee con animación CSS */}
      <div className="flex w-[200%] animate-marquee group-hover:[animation-play-state:paused] transition-all duration-500">
        <div className="flex gap-6 px-3 w-1/2 justify-around">
          {TRABAJO_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={`first-${category.id}`}
                className="flex-shrink-0 flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(37,99,235,0.12)] hover:border-blue-200 hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer group/pill"
              >
                <div className={`p-2 rounded-xl bg-slate-50 group-hover/pill:bg-white transition-colors border border-slate-100 shadow-sm ${category.color}`}>
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover/pill:text-slate-900 transition-colors">
                  {category.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-6 px-3 w-1/2 justify-around">
          {TRABAJO_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={`second-${category.id}`}
                className="flex-shrink-0 flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(37,99,235,0.12)] hover:border-blue-200 hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer group/pill"
              >
                <div className={`p-2 rounded-xl bg-slate-50 group-hover/pill:bg-white transition-colors border border-slate-100 shadow-sm ${category.color}`}>
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover/pill:text-slate-900 transition-colors">
                  {category.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


