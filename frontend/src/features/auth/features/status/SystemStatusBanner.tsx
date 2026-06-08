"use client";

import { Database, Activity } from "lucide-react";

export function SystemStatusBanner() {
  return (
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
  );
}
