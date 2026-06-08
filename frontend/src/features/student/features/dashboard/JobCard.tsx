"use client";

import { Clock, MapPin, Zap } from "lucide-react";
import type { MicroJob } from "@/shared/lib/apiClient";

export type DashboardJob = MicroJob & {
  distance?: number;
  location?: string;
  tasks?: string[];
  urgency?: boolean; // Para etiqueta de "Alta Demanda"
};

interface JobCardProps {
  job: DashboardJob;
  onSelect: (job: DashboardJob) => void;
}

export default function JobCard({ job, onSelect }: JobCardProps) {
  // 10% fee calculation
  const netAmount = Math.round(job.price_clp - (job.price_clp * 0.1));

  return (
    <div className="glass-panel bg-white/80 backdrop-blur border border-slate-200/60 rounded-2xl p-5 hover:shadow-[0_8px_30px_-4px_rgba(37,99,235,0.12)] hover:border-blue-200 transition-all duration-300 flex flex-col group relative overflow-hidden">
      
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />

      {/* Header: Urgency Tag & Time */}
      <div className="flex justify-between items-start mb-3">
        {job.urgency ? (
          <span className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide uppercase">
            <Zap className="h-3 w-3 fill-red-600" />
            🔥 Alta Demanda
          </span>
        ) : (
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide">
            ✓ Verificado
          </span>
        )}
        <span className="flex items-center gap-1 text-slate-500 text-xs font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          <Clock className="h-3 w-3" />
          {job.duration_hours} hrs
        </span>
      </div>

      {/* Body: Title & Location */}
      <div className="mb-4">
        <h4 className="font-black text-slate-900 text-base leading-tight mb-1.5 group-hover:text-blue-700 transition-colors line-clamp-2">
          {job.title}
        </h4>
        <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {job.location} · a {job.distance}m
        </p>
      </div>

      <div className="flex-1" /> {/* Spacer */}

      {/* Footer: Price & Action */}
      <div className="flex items-end justify-between mt-2 pt-4 border-t border-slate-100/60">
        <div>
          <p className="text-xs text-slate-400 font-medium mb-0.5 uppercase tracking-wider">Pago Líquido</p>
          <p className="text-xl font-black text-slate-900 tracking-tight">
            ${netAmount.toLocaleString("es-CL")}
          </p>
        </div>
        <button
          onClick={() => onSelect(job)}
          className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-blue-200"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  );
}
