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
import { useAuthStore } from "@/features/auth/services/sessionStore";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8009";

export const useJobStore = create<JobStore>((set) => ({
  // --- Estado Inicial ---
  jobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,

  // --- Acciones ---

  fetchJobs: async () => {
    set({ isLoading: true, error: null });
    
    // MOCK DATA: Simulamos una pequeña latencia para simular red
    setTimeout(() => {
      const mockJobs: MicroJob[] = [
        {
          id: "mock-1",
          title: "Corcheteador y Ordenador de Pruebas",
          description: "Trabajo rápido de medio tiempo. Se requiere apoyo logístico urgente a profesores de la facultad durante la época de exámenes finales para ordenar, corchetear y clasificar pruebas. Ubicación: Sala de Profesores (Edificio A).",
          price_clp: 15000,
          duration_hours: 3,
          start_time: new Date(Date.now() + 86400000).toISOString(), // Mañana
          status: "PUBLISHED",
          employer_id: "prof-123",
          worker_id: null,
          latitude: -33.444, // Coordenadas ficticias
          longitude: -70.655,
          created_at: new Date().toISOString(),
        },
        {
          id: "mock-2",
          title: "Analista de Datos Junior para Tesis",
          description: "Apoyo intensivo a tesistas de postgrado en la tabulación, limpieza de datos en Excel y análisis estadístico básico en SPSS o R. Se valorará conocimiento previo en el área de ciencias sociales.",
          price_clp: 45000,
          duration_hours: 10,
          start_time: new Date(Date.now() + 172800000).toISOString(), // Pasado mañana
          status: "PUBLISHED",
          employer_id: "tesis-456",
          worker_id: null,
          latitude: null,
          longitude: null,
          created_at: new Date().toISOString(),
        },
        {
          id: "mock-3",
          title: "Ayudante de Investigación",
          description: "Apoyo exhaustivo en revisión bibliográfica, catalogación y organización de documentos antiguos e históricos. Ideal para estudiantes de humanidades. Trabajo presencial. Ubicación: Archivo Patrimonial / Biblioteca Central.",
          price_clp: 30000,
          duration_hours: 6,
          start_time: new Date(Date.now() + 259200000).toISOString(),
          status: "PUBLISHED",
          employer_id: "inv-789",
          worker_id: null,
          latitude: -33.445,
          longitude: -70.656,
          created_at: new Date().toISOString(),
        },
        {
          id: "mock-4",
          title: "Buscador/Recopilador de Material de Estudio",
          description: "Necesito alguien ágil que busque, recopile y digitalice apuntes, libros específicos de la bibliografía del curso o pruebas antiguas de distintas facultades para armar un dossier de estudio completo.",
          price_clp: 20000,
          duration_hours: 4,
          start_time: new Date(Date.now() + 43200000).toISOString(),
          status: "PUBLISHED",
          employer_id: "alumn-012",
          worker_id: null,
          latitude: null,
          longitude: null,
          created_at: new Date().toISOString(),
        }
      ];
      set({ jobs: mockJobs, isLoading: false });
    }, 800);

    /* 
    // === CÓDIGO ORIGINAL FETCHJOBS (COMENTADO POR ERROR 401) ===
    // try {
    //   const token = useAuthStore.getState().token;
    //   const headers: HeadersInit = {
    //     "Content-Type": "application/json",
    //   };
    //
    //   if (token) {
    //     headers["Authorization"] = `Bearer ${token}`;
    //   }
    //
    //   const response = await fetch(`${API_URL}/api/jobs/feed`, {
    //     method: "GET",
    //     headers,
    //   });
    //
    //   if (response.status === 401) {
    //     console.warn("⚠️ Sesión expirada o token inválido (401). Redirigiendo a Login...");
    //     useAuthStore.getState().logout();
    //     if (typeof window !== "undefined") {
    //       window.location.href = "/login";
    //     }
    //     return;
    //   }
    //
    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${response.statusText}`);
    //   }
    //
    //   const data: MicroJob[] = await response.json();
    //   set({ jobs: data, isLoading: false });
    // } catch (err) {
    //   console.error("🚨 Error al cargar jobs (fetchJobs):", err);
    //   const message =
    //     err instanceof Error ? err.message : "Error desconocido al cargar jobs";
    //   set({ error: message, isLoading: false });
    // }
    */
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

