"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useApplicationsStore } from "@/stores/applicationsStore";
import {
  Briefcase, MapPin, DollarSign, Clock, CheckCircle2,
  Inbox, Trash2, RefreshCcw, Loader2, WifiOff
} from "lucide-react";

interface ApiApplication {
  job_id: string;
  job_title: string;
  address: string;
  reward_amount: number;
  category: string;
  status: string;
  applied_at: string | null;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  MATCHED:      { label: "Asignado",        color: "bg-blue-50 text-blue-700 border-blue-200" },
  IN_PROGRESS:  { label: "En Progreso",     color: "bg-amber-50 text-amber-700 border-amber-200" },
  COMPLETED:    { label: "Completado",      color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED:    { label: "Cancelado",       color: "bg-red-50 text-red-700 border-red-200" },
  pending:      { label: "Pendiente",       color: "bg-slate-50 text-slate-600 border-slate-200" },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8009";

export default function PostulacionesPage() {
  const { token } = useAuthStore();
  const { applications: localApps, clearAll } = useApplicationsStore();

  const [apiApps, setApiApps] = useState<ApiApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/jobs/my-applications`, { headers });
        if (res.ok) {
          const data: ApiApplication[] = await res.json();
          setApiApps(data);
          setIsBackendOnline(true);
        } else {
          setIsBackendOnline(false);
        }
      } catch {
        setIsBackendOnline(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [token]);

  const handleClear = () => {
    if (confirmClear) {
      clearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "Sin fecha";
    const d = new Date(iso);
    return d.toLocaleDateString("es-CL", {
      day: "numeric", month: "long",
      hour: "2-digit", minute: "2-digit",
    });
  };

  // Merge: backend data + any local apps not already in backend response
  const backendIds = new Set(apiApps.map(a => a.job_id));
  const localOnlyApps: ApiApplication[] = localApps
    .filter(a => !backendIds.has(a.jobId))
    .map(a => ({
      job_id: a.jobId,
      job_title: a.jobTitle,
      address: a.address,
      reward_amount: a.reward_amount,
      category: a.category,
      status: a.status,
      applied_at: a.appliedAt,
    }));

  const displayApps: ApiApplication[] = [...apiApps, ...localOnlyApps];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Encabezado */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              Mis Postulaciones
            </h1>
            <p className="text-slate-500 mt-1">
              {isLoading
                ? "Cargando..."
                : displayApps.length > 0
                  ? `Tienes ${displayApps.length} postulación${displayApps.length !== 1 ? "es" : ""}.`
                  : "Aún no has postulado a ningún trabajo."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Estado del backend */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              isBackendOnline
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}>
              {isBackendOnline
                ? <><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> En tiempo real</>
                : <><WifiOff className="w-3 h-3" /> Modo local</>
              }
            </div>

            {localApps.length > 0 && (
              <button
                onClick={handleClear}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  confirmClear
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-slate-500 border-slate-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {confirmClear ? "¿Confirmar?" : "Limpiar"}
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <p className="text-slate-500 font-medium">Cargando tus postulaciones...</p>
          </div>
        ) : displayApps.length === 0 ? (
          /* Estado vacío */
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-16 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <Inbox className="w-10 h-10 text-slate-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Sin postulaciones todavía</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Explora los trabajos disponibles y pulsa <strong>"Postular"</strong> para que aparezcan aquí.
              </p>
            </div>
            <a
              href="/estudiante/trabajos"
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20"
            >
              <Briefcase className="w-4 h-4" />
              Ver trabajos disponibles
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {displayApps.map((app) => {
              const statusInfo = STATUS_MAP[app.status] ?? { label: app.status, color: "bg-slate-50 text-slate-600 border-slate-200" };
              return (
                <div
                  key={app.job_id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all p-6 flex flex-col sm:flex-row gap-5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 self-start">
                    <Briefcase className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{app.job_title}</h3>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{app.category}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {app.address}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                        <DollarSign className="w-4 h-4" />
                        {new Intl.NumberFormat("es-CL").format(app.reward_amount)} CLP
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-4 h-4" />
                        {formatDate(app.applied_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Nota de fuente de datos */}
            <div className={`flex items-start gap-3 rounded-2xl p-5 mt-6 border ${
              isBackendOnline
                ? "bg-emerald-50 border-emerald-100"
                : "bg-blue-50 border-blue-100"
            }`}>
              {isBackendOnline
                ? <RefreshCcw className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                : <WifiOff className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              }
              <div>
                <p className={`text-sm font-bold mb-1 ${isBackendOnline ? "text-emerald-800" : "text-blue-800"}`}>
                  {isBackendOnline ? "Datos en tiempo real" : "Modo sin conexión"}
                </p>
                <p className={`text-xs leading-relaxed ${isBackendOnline ? "text-emerald-700" : "text-blue-600"}`}>
                  {isBackendOnline
                    ? "Tus postulaciones están sincronizadas con el servidor. El estado se actualiza en vivo."
                    : "El backend no está disponible. Mostrando postulaciones guardadas localmente en tu navegador."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
