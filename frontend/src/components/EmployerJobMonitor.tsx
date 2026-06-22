"use client";

import { useJobRealtime } from "@/hooks/useJobRealtime";
import { useState } from "react";
import { CheckCircle2, AlertTriangle, Gift, Star, Activity, Wifi, WifiOff } from "lucide-react";

const DEMO_JOB_ID = "VW-8492";

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  MATCHED:      { label: "Confirmado · Estudiante en camino",   color: "text-blue-700 bg-blue-50 border-blue-200",   dot: "bg-blue-500" },
  IN_TRANSIT:   { label: "En tránsito",                        color: "text-blue-700 bg-blue-50 border-blue-200",   dot: "bg-blue-400 animate-pulse" },
  ARRIVED:      { label: "¡Estudiante llegó! Valida el PIN →", color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  IN_PROGRESS:  { label: "Trabajo en progreso",                color: "text-purple-700 bg-purple-50 border-purple-200", dot: "bg-purple-500 animate-pulse" },
  COMPLETED:    { label: "Trabajo completado ✓",               color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  PUBLISHED:    { label: "Publicado",                          color: "text-slate-700 bg-slate-50 border-slate-200",  dot: "bg-slate-400" },
};

export default function EmployerJobMonitor() {
  const { jobState, isConnected, connectionMode, validatePin, lastUpdated, subscribers } = useJobRealtime(DEMO_JOB_ID);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [validating, setValidating] = useState(false);

  const status = jobState?.status ?? "MATCHED";
  const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS.PUBLISHED;

  const handleValidatePin = async () => {
    if (!pinInput.trim()) return;
    setValidating(true);
    setPinError(false);
    const ok = await validatePin(pinInput.trim());
    setValidating(false);
    if (ok) {
      setPinSuccess(true);
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="glass-panel bg-white rounded-3xl overflow-hidden border border-slate-200">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Monitor de Turno</span>
          <h3 className="text-lg font-black text-slate-900">{jobState?.title ?? "Mesero de Apoyo"}</h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Job #{DEMO_JOB_ID}</p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
          isConnected ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
        }`}>
          {isConnected ? <><Wifi className="h-3 w-3" /> En Vivo</> : <><WifiOff className="h-3 w-3" /> Desconectado</>}
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Student Profile */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
            <img src={jobState?.student_avatar ?? "https://i.pravatar.cc/150?img=5"} alt="Estudiante" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <p className="font-black text-slate-900">{jobState?.student_name ?? "Maria González"}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(jobState?.student_rating ?? 4.8) ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
              ))}
              <span className="text-xs text-slate-500 ml-1 font-medium">{jobState?.student_rating ?? 4.8}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Pago neto</p>
            <p className="font-black text-slate-900">${(jobState?.net_clp ?? 16200).toLocaleString("es-CL")}</p>
          </div>
        </div>

        {/* Live Status */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${statusInfo.color}`}>
          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusInfo.dot}`} />
          <div className="flex-1">
            <p className="text-sm font-bold">{statusInfo.label}</p>
            {status === "MATCHED" && (
              <p className="text-xs opacity-70 mt-0.5">ETA: {jobState?.eta_minutes ?? 8} minutos</p>
            )}
          </div>
          {lastUpdated && (
            <p className="text-xs opacity-60 shrink-0">{lastUpdated.toLocaleTimeString("es-CL")}</p>
          )}
        </div>

        {/* PIN Validation (when student arrives) */}
        {status === "ARRIVED" && !pinSuccess && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              El estudiante llegó · Ingresa el PIN que te muestra:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={pinInput}
                onChange={e => { setPinInput(e.target.value.toUpperCase()); setPinError(false); }}
                placeholder="A3F9C2"
                maxLength={6}
                className={`flex-1 px-4 py-3 rounded-xl border font-mono font-bold text-center text-lg tracking-widest focus:outline-none focus:ring-2 transition-all ${
                  pinError ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-amber-300 bg-white focus:ring-amber-300"
                }`}
              />
              <button
                onClick={handleValidatePin}
                disabled={validating || !pinInput.trim()}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-emerald-200"
              >
                {validating ? "..." : "✔️ Validar"}
              </button>
            </div>
            {pinError && <p className="text-xs text-red-600 font-semibold mt-2">PIN incorrecto. Verifica con el estudiante.</p>}
          </div>
        )}

        {pinSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-emerald-800">¡Llegada validada! Turno en progreso.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2">
          {status !== "ARRIVED" && (
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-200">
              <CheckCircle2 className="h-4 w-4" />
              Validar Llegada (Generar PIN)
            </button>
          )}
          <button className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            <Gift className="h-4 w-4 text-orange-500" />
            Añadir Propina / Bono
          </button>
          <button className="w-full py-3 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4" />
            Reportar No-Show
          </button>
        </div>

        {/* Connection info */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            {connectionMode === "websocket" ? "WebSocket" : "Polling 5s"}
          </span>
          <span>{subscribers} suscriptor{subscribers !== 1 ? "es" : ""} activo{subscribers !== 1 ? "s" : ""}</span>
        </div>

      </div>
    </div>
  );
}

