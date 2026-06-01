/**
 * Ventana-Work v2 — Componente JobCard (Rediseño Light Theme)
 * ==========================================================
 * Diseño limpio, fondos blancos, sombras suaves y bordes redondeados.
 */

"use client";

import { useState, useCallback } from "react";
import { useJobStore } from "@/stores/jobStore";
import type { MicroJob } from "@/lib/api";

// =============================================================================
// Tipos
// =============================================================================

interface JobCardProps {
  job: MicroJob;
  distanceMeters?: number;
  onAccepted?: (jobId: string) => void;
}

// =============================================================================
// Helpers
// =============================================================================

function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

function formatDuration(hours: number): string {
  return hours === 1 ? "1 hr" : `${hours} hrs`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Retorna las clases CSS para el badge de estado adaptadas a Light Theme.
 */
function getStatusStyle(status: string): string {
  const styles: Record<string, string> = {
    PUBLISHED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    MATCHED: "bg-blue-100 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
    COMPLETED: "bg-purple-100 text-purple-700 border-purple-200",
    PAID: "bg-teal-100 text-teal-700 border-teal-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };
  return styles[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

const STATUS_LABELS: Record<string, string> = {
  PUBLISHED: "Disponible",
  MATCHED: "Asignado",
  IN_PROGRESS: "En Progreso",
  COMPLETED: "Completado",
  PAID: "Pagado",
  CANCELLED: "Cancelado",
};

// =============================================================================
// Componente
// =============================================================================

export default function JobCard({
  job,
  distanceMeters,
  onAccepted,
}: JobCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const acceptJob = useJobStore((state) => state.acceptJob);
  const error = useJobStore((state) => state.error);
  const clearError = useJobStore((state) => state.clearError);

  const canAccept = job.status === "PUBLISHED" && !accepted;

  const handleAccept = useCallback(async () => {
    if (!canAccept || isAccepting) return;

    setIsAccepting(true);
    clearError();

    try {
      await acceptJob(job.id);
      setAccepted(true);
      onAccepted?.(job.id);
    } catch {
      // El error se maneja en el store
    } finally {
      setIsAccepting(false);
    }
  }, [canAccept, isAccepting, acceptJob, job.id, onAccepted, clearError]);

  return (
    <div
      className="
        group relative overflow-hidden rounded-2xl bg-white
        border border-slate-200
        p-6 shadow-sm
        transition-all duration-300 ease-out
        hover:border-blue-300
        hover:shadow-md
        hover:-translate-y-1
      "
    >
      {/* Header: Status Badge + Duration */}
      <div className="mb-4 flex items-center justify-between">
        <span
          className={`
            inline-flex items-center rounded-full border px-2.5 py-0.5
            text-xs font-semibold uppercase tracking-wide
            ${getStatusStyle(job.status)}
          `}
        >
          <span
            className={`
              mr-1.5 h-1.5 w-1.5 rounded-full
              ${job.status === "PUBLISHED" ? "bg-emerald-500 animate-pulse" : ""}
              ${job.status === "IN_PROGRESS" ? "bg-amber-500 animate-pulse" : ""}
              ${job.status === "MATCHED" ? "bg-blue-500" : ""}
              ${job.status === "COMPLETED" ? "bg-purple-500" : ""}
              ${job.status === "PAID" ? "bg-teal-500" : ""}
              ${job.status === "CANCELLED" ? "bg-red-500" : ""}
            `}
          />
          {STATUS_LABELS[job.status] ?? job.status}
        </span>

        <span className="flex items-center gap-1 text-sm font-medium text-slate-500">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
            />
          </svg>
          {formatDuration(job.duration_hours)}
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-bold text-slate-900 leading-tight line-clamp-2">
        {job.title}
      </h3>

      {/* Description */}
      <p className="mb-4 text-sm text-slate-600 leading-relaxed line-clamp-2">
        {job.description}
      </p>

      {/* Price + Distance Row */}
      <div className="mb-5 flex items-end justify-between">
        {/* Price */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Pago
          </p>
          <p className="text-2xl font-black text-slate-900">
            {formatCLP(job.price_clp)}
          </p>
        </div>

        {/* Distance (if available from geospatial match) */}
        {distanceMeters !== undefined && (
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              A Distancia
            </p>
            <div className="flex items-center gap-1 text-slate-700">
              <svg
                className="h-4 w-4 text-[#0052FF]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm font-bold">
                {formatDistance(distanceMeters)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Start time */}
      <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
        <svg
          className="h-4 w-4 text-[#f97316]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>
          Inicio:{" "}
          <span className="text-slate-700 font-semibold">
            {new Date(job.start_time).toLocaleString("es-CL", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Accept Button (Vibrant Orange CTA) */}
      {canAccept ? (
        <button
          type="button"
          onClick={handleAccept}
          disabled={isAccepting}
          className="
            relative w-full overflow-hidden rounded-xl py-3 px-6
            text-sm font-bold text-white
            bg-[#f97316]
            transition-all duration-300 ease-out
            hover:bg-[#ea580c]
            hover:shadow-[0_4px_14px_rgba(249,115,22,0.4)]
            active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed
            disabled:hover:shadow-none
          "
        >
          {/* Shimmer effect */}
          <div
            className="
              absolute inset-0 -translate-x-full
              bg-gradient-to-r from-transparent via-white/30 to-transparent
              group-hover:animate-[shimmer-light_2s_infinite]
            "
          />

          <span className="relative flex items-center justify-center gap-2">
            {isAccepting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Aceptando...
              </>
            ) : (
              <>
                Aceptar Trabajo
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </span>
        </button>
      ) : accepted ? (
        <div
          className="
            flex w-full items-center justify-center gap-2 rounded-xl
            border border-emerald-200 bg-emerald-50
            py-3 px-6 text-sm font-bold text-emerald-600
          "
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Trabajo Aceptado
        </div>
      ) : null}
    </div>
  );
}
