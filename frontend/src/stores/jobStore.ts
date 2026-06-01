/**
 * Ventana-Work — Zustand Store (Estado Global de Jobs)
 * ======================================================
 * Maneja el estado de los micro-empleos usando Zustand.
 * Zustand es una librería de estado global minimalista para React
 * que evita el boilerplate de Redux.
 *
 * Estado:
 *   - jobs: Lista de MicroJobs disponibles.
 *   - selectedJob: Job actualmente seleccionado (para detalle/acción).
 *   - isLoading: Indicador de operación en curso.
 *   - error: Último error ocurrido.
 *
 * Acciones:
 *   - acceptJob: Acepta un trabajo (transiciona PUBLISHED → MATCHED).
 *   - completeJob: Envía código QR para completar un trabajo.
 */

import { create } from "zustand";

import type { MicroJob, QRValidationResponse } from "@/lib/api";
import { completeJobWithQR } from "@/lib/api";

// =============================================================================
// Tipos del Store
// =============================================================================

interface JobState {
  /** Lista de micro-empleos cargados */
  jobs: MicroJob[];
  /** Job actualmente seleccionado para ver detalle o realizar acción */
  selectedJob: MicroJob | null;
  /** Indica si hay una operación asíncrona en curso */
  isLoading: boolean;
  /** Último error ocurrido (null si no hay error) */
  error: string | null;
}

interface JobActions {
  /** Carga la lista de jobs desde el backend */
  fetchJobs: () => Promise<void>;
  /** Selecciona un job para ver detalle */
  selectJob: (job: MicroJob | null) => void;
  /**
   * Acepta un trabajo (el estudiante toma el job).
   * Dispara una mutación al backend para transicionar PUBLISHED → MATCHED.
   */
  acceptJob: (jobId: string) => Promise<void>;
  /**
   * Completa un trabajo enviando el código QR.
   * Transiciona IN_PROGRESS → COMPLETED y crea Transaction.
   */
  completeJob: (
    jobId: string,
    secretCode: string,
  ) => Promise<QRValidationResponse | null>;
  /** Limpia el error actual */
  clearError: () => void;
}

type JobStore = JobState & JobActions;

// =============================================================================
// Store
// =============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const useJobStore = create<JobStore>((set, get) => ({
  // --- Estado Inicial ---
  jobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,

  // --- Acciones ---

  fetchJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/jobs`);
      if (!response.ok) {
        throw new Error(`Error al cargar jobs: ${response.statusText}`);
      }
      const data: MicroJob[] = await response.json();
      set({ jobs: data, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error desconocido al cargar jobs";
      set({ error: message, isLoading: false });
    }
  },

  selectJob: (job) => {
    set({ selectedJob: job });
  },

  acceptJob: async (jobId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/jobs/${jobId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail ?? `Error al aceptar trabajo: ${response.statusText}`,
        );
      }

      const updatedJob: MicroJob = await response.json();

      // Actualizar el job en la lista local
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === jobId ? updatedJob : j)),
        selectedJob:
          state.selectedJob?.id === jobId ? updatedJob : state.selectedJob,
        isLoading: false,
      }));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error desconocido al aceptar trabajo";
      set({ error: message, isLoading: false });
    }
  },

  completeJob: async (jobId: string, secretCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await completeJobWithQR(jobId, secretCode);

      // Actualizar el estado del job en la lista local
      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === jobId ? { ...j, status: result.status } : j,
        ),
        selectedJob:
          state.selectedJob?.id === jobId
            ? { ...state.selectedJob, status: result.status }
            : state.selectedJob,
        isLoading: false,
      }));

      return result;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error desconocido al completar trabajo";
      set({ error: message, isLoading: false });
      return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
