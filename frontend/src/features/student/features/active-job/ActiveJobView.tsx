"use client";

import { useJobRealtime } from "@/shared/lib/useJobRealtime";
import { useState } from "react";
import { MapPin, Phone, Wifi, WifiOff, CheckCircle2, Clock } from "lucide-react";

const DEMO_JOB_ID = "VW-8492";

export default function ActiveJobView() {
  const { jobState, isConnected, connectionMode, markArrived, lastUpdated } = useJobRealtime(DEMO_JOB_ID);
  const [marking, setMarking] = useState(false);

  const handleMarkArrived = async () => {
    setMarking(true);
    await markArrived();
    setMarking(false);
  };

  const status = jobState?.status ?? "MATCHED";
  const isArrived = status === "ARRIVED" || status === "IN_PROGRESS" || status === "COMPLETED";

  return (
    <div className="glass-panel bg-white rounded-3xl overflow-hidden border border-slate-200">

      {/* Connection Badge */}
      <div className="px-5 pt-4 flex justify-between items-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Turno Activo</span>
        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
          isConnected
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-slate-100 text-slate-500 border-slate-200"
        }`}>
          {isConnected
            ? <><Wifi className="h-3 w-3" /> {connectionMode === "websocket" ? "WebSocket" : "Polling"}</>
            : <><WifiOff className="h-3 w-3" /> Reconectando...</>
          }
        </div>
      </div>

      {/* Job Title */}
      <div className="px-5 pt-3 pb-4 border-b border-slate-100">
        <h3 className="text-lg font-black text-slate-900">{jobState?.title ?? "Mesero de Apoyo"}</h3>
        <p className="text-xs text-slate-500 font-mono mt-0.5">Job #{DEMO_JOB_ID} · {jobState?.employer_name ?? "Cafetería Central UAH"}</p>
      </div>

      {/* Map Placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-blue-50 to-slate-100 border-b border-slate-100 overflow-hidden">
        {/* Simulated map grid */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h30v30H0V0zm1 1h28v28H1V1z' fill='%2393c5fd' fill-opacity='0.4'/%3E%3C/svg%3E")` }}
        />
        {/* Route line */}
        <svg className="absolute inset-0 w-full h-full">
          <path d="M 60 120 Q 100 80 140 60 T 200 30" stroke="#2563eb" strokeWidth="3" fill="none" strokeDasharray="8 4" />
          {/* Point A */}
          <circle cx="60" cy="120" r="8" fill="#2563eb" stroke="white" strokeWidth="2" />
          {/* Point B */}
          <circle cx="200" cy="30" r="8" fill="#f97316" stroke="white" strokeWidth="2" />
        </svg>
        <div className="absolute bottom-2 left-2 text-xs font-bold text-blue-700 bg-white/80 px-2 py-1 rounded-lg border border-blue-100">📍 Tú</div>
        <div className="absolute top-2 right-6 text-xs font-bold text-orange-700 bg-white/80 px-2 py-1 rounded-lg border border-orange-100">🏪 Destino</div>
        {!isArrived && (
          <div className="absolute bottom-2 right-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <p className="text-xs text-slate-500">A pie</p>
            <p className="text-sm font-black text-slate-900">~{jobState?.eta_minutes ?? 15} min</p>
          </div>
        )}
      </div>

      {/* Status Card */}
      <div className="p-5 space-y-4">

        {/* Countdown / Status */}
        {!isArrived ? (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-3xl font-black text-slate-900">{jobState?.eta_minutes ?? 15} min</p>
            <p className="text-sm text-slate-500 mt-1">Tienes <span className="font-bold text-blue-700">{jobState?.eta_minutes ?? 15} minutos</span> para llegar</p>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-base font-black text-emerald-800">¡Llegaste! Muestra el PIN al empleador</p>
            {jobState?.pin_code && (
              <p className="text-3xl font-black tracking-[0.3em] text-emerald-900 mt-2 font-mono bg-emerald-100 rounded-xl px-4 py-2">
                {jobState.pin_code}
              </p>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
          <span>{jobState?.location ?? "Cafetería Central UAH"} · {jobState?.start_time ?? "13:00"} - {jobState?.end_time ?? "15:00"}</span>
        </div>

        {/* Net Salary */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <span className="text-sm text-slate-500 font-medium">Recibirás al terminar</span>
          <span className="text-xl font-black text-emerald-700">
            ${(jobState?.net_clp ?? 16200).toLocaleString("es-CL")}
          </span>
        </div>

        {/* Mark Arrival Button */}
        <button
          onClick={handleMarkArrived}
          disabled={marking || isArrived}
          className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
            isArrived
              ? "bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200"
              : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-200 active:scale-95"
          }`}
        >
          {marking ? <span className="animate-pulse">Marcando...</span>
            : isArrived ? <><CheckCircle2 className="h-5 w-5" /> ¡Llegada Registrada!</>
            : <>📍 Marcar Llegada al Local</>
          }
        </button>

        {/* Contact Button */}
        <button className="w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
          <Phone className="h-4 w-4" />
          Contactar Empleador
        </button>

        {/* Last update */}
        {lastUpdated && (
          <p className="text-center text-xs text-slate-400">
            Actualizado: {lastUpdated.toLocaleTimeString("es-CL")}
          </p>
        )}
      </div>
    </div>
  );
}
