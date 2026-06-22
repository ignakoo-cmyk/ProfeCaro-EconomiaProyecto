/**
 * applicationsStore.ts
 * Store persistente para las postulaciones del estudiante.
 * Usa localStorage para sobrevivir recargas de página.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Application {
  jobId: string;
  jobTitle: string;
  address: string;
  reward_amount: number;
  category: string;
  appliedAt: string; // ISO string
  status: "pending" | "accepted" | "rejected";
}

interface ApplicationsState {
  applications: Application[];
  addApplication: (app: Omit<Application, "appliedAt" | "status">) => void;
  hasApplied: (jobId: string) => boolean;
  clearAll: () => void;
}

export const useApplicationsStore = create<ApplicationsState>()(
  persist(
    (set, get) => ({
      applications: [],

      addApplication: (app) => {
        const exists = get().applications.some(a => a.jobId === app.jobId);
        if (exists) return;
        set(state => ({
          applications: [
            {
              ...app,
              appliedAt: new Date().toISOString(),
              status: "pending",
            },
            ...state.applications,
          ],
        }));
      },

      hasApplied: (jobId) => {
        return get().applications.some(a => a.jobId === jobId);
      },

      clearAll: () => set({ applications: [] }),
    }),
    {
      name: "ventana-work-applications",
    }
  )
);
