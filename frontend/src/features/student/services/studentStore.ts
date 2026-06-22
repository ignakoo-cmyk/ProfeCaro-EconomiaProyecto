import { create } from "zustand";
import type { MicroJob } from "@/shared/lib/apiClient";

interface StudentState {
  jobs: MicroJob[];
  selectedJob: MicroJob | null;
  isLoading: boolean;
  error: string | null;
}

interface StudentActions {
  fetchJobs: () => Promise<void>;
  selectJob: (job: MicroJob | null) => void;
  acceptJob: (jobId: string) => Promise<void>;
  clearError: () => void;
}

type StudentStore = StudentState & StudentActions;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8009";

export const useStudentStore = create<StudentStore>((set) => ({
  jobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,

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
      const message = err instanceof Error ? err.message : "Error desconocido al cargar jobs";
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

      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === jobId ? updatedJob : j)),
        selectedJob: state.selectedJob?.id === jobId ? updatedJob : state.selectedJob,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido al aceptar trabajo";
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

