/**
 * authStore.ts — Re-exporta el store canónico.
 * Mantiene compatibilidad con cualquier import antiguo de "@/stores/authStore".
 */
export { useAuthStore } from "@/features/auth/services/sessionStore";
export type { UserRole, User } from "@/features/auth/services/sessionStore";

