import { create } from "zustand";

export type UserRole = "STUDENT" | "PYME" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  userType: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, userType: UserRole) => Promise<void>;
  logout: () => void;
}

// Mock inicial para desarrollo (simula que no hay sesión)
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // Mock Login: Simula un delay de red y setea el usuario
  login: async (email: string, userType: UserRole) => {
    set({ isLoading: true });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        set({
          user: {
            id: `mock-id-${Date.now()}`,
            email,
            fullName: userType === "STUDENT" ? "Estudiante Demo" : "Negocio Demo",
            userType,
          },
          isAuthenticated: true,
          isLoading: false,
        });
        resolve();
      }, 1000); // 1s delay
    });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
