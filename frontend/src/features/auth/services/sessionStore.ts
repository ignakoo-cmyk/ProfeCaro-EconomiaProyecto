/**
 * sessionStore.ts — Fuente única de verdad para la autenticación.
 * Utiliza Zustand con persistencia en localStorage para sobrevivir recargas de página.
 * Conectado al backend FastAPI con el flujo OAuth2 Password (form-data).
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

export type UserRole = "STUDENT" | "PYME" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  userType: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole }>;
  register: (data: { email: string; password: string; role: "student" | "business"; name: string; career?: string; address?: string }) => Promise<{ success: boolean; role?: UserRole }>;
  logout: () => void;
  clearError: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8009";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        // --- MOCK AUTHENTICATION ---
        if (email === "user" && password === "user") {
          return new Promise((resolve) => {
            setTimeout(() => {
              const user: User = {
                id: "mock-student-123",
                email: "user@ventanawork.com",
                fullName: "Estudiante de Prueba",
                userType: "STUDENT"
              };
              
              const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
              const payload = btoa(JSON.stringify({ sub: user.id, full_name: user.fullName, role: user.userType }));
              const fakeToken = `${header}.${payload}.mocksignature`;

              Cookies.set("token", fakeToken, { expires: 1, path: "/" });
              set({ user, token: fakeToken, isAuthenticated: true, isLoading: false, error: null });
              resolve({ success: true, role: user.userType });
            }, 800);
          });
        }
        
        if (email === "admin" && password === "admin") {
          return new Promise((resolve) => {
            setTimeout(() => {
              const user: User = {
                id: "mock-admin-999",
                email: "admin@ventanawork.com",
                fullName: "Administrador Supremo",
                userType: "ADMIN"
              };
              
              const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
              const payload = btoa(JSON.stringify({ sub: user.id, full_name: user.fullName, role: user.userType }));
              const fakeToken = `${header}.${payload}.mocksignature`;

              Cookies.set("token", fakeToken, { expires: 1, path: "/" });
              set({ user, token: fakeToken, isAuthenticated: true, isLoading: false, error: null });
              resolve({ success: true, role: user.userType });
            }, 800);
          });
        }
        // --- FIN MOCK AUTHENTICATION ---

        try {
          // FastAPI OAuth2 Password flow requiere form-data, no JSON
          const formData = new URLSearchParams();
          formData.append("username", email);
          formData.append("password", password);

          const response = await fetch(`${API_URL}/auth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const message =
              response.status === 401
                ? "Credenciales incorrectas. Verifica tu email y contraseña."
                : errorData.detail || "Error del servidor. Intenta de nuevo.";
            set({ isLoading: false, error: message });
            return { success: false };
          }

          const data = await response.json();
          const token: string = data.access_token;

          // Decodificar payload del JWT para obtener info del usuario
          const payload = JSON.parse(atob(token.split(".")[1]));
          const userType: UserRole = payload.user_type || payload.role || "STUDENT";

          const user: User = {
            id: payload.sub || payload.id || "unknown",
            email: email,
            fullName: payload.full_name || payload.name || email,
            userType,
          };

          // Guardar en cookie para que el middleware de Next.js pueda leerlo
          Cookies.set("token", token, { expires: 1, path: "/" });

          set({ user, token, isAuthenticated: true, isLoading: false, error: null });
          return { success: true, role: userType };
        } catch {
          set({
            isLoading: false,
            error: "No se pudo conectar con el servidor. ¿Está Docker corriendo?",
          });
          return { success: false };
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            set({ isLoading: false, error: errorData.detail || "Error al registrar la cuenta." });
            return { success: false };
          }

          // Registration successful, immediately login
          return get().login(data.email, data.password);
        } catch {
          set({
            isLoading: false,
            error: "No se pudo conectar con el servidor.",
          });
          return { success: false };
        }
      },

      logout: () => {
        Cookies.remove("token", { path: "/" });
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "ventana-work-auth", // Clave en localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

