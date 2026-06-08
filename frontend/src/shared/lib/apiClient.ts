/**
 * Ventana-Work — Cliente API Tipado
 * =====================================
 * Wrapper fetch para comunicarse con el backend FastAPI.
 * Incluye tipado estricto, manejo de errores centralizado,
 * y base URL configurable vía variable de entorno.
 */

// =============================================================================
// Types — Interfaces de dominio (espejo de los Pydantic schemas del backend)
// =============================================================================

/** Tipos de usuario en la plataforma */
export type UserType = "STUDENT" | "PYME";

/** State Machine del MicroJob */
export type JobStatus =
  | "PUBLISHED"
  | "MATCHED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PAID"
  | "CANCELLED";

/** Estudiante con distancia calculada por PostGIS */
export interface StudentMatch {
  id: string;
  email: string;
  full_name: string;
  reputation: number;
  is_available: boolean;
  /** Distancia geodésica en metros (calculada por ST_Distance) */
  distance_meters: number;
}

/** Respuesta del endpoint de match geoespacial */
export interface MatchListResponse {
  job_id: string;
  job_title: string;
  radius_meters: number;
  total_matches: number;
  students: StudentMatch[];
}

/** MicroJob completo */
export interface MicroJob {
  id: string;
  title: string;
  description: string;
  price_clp: number;
  duration_hours: number;
  start_time: string;
  status: JobStatus;
  employer_id: string;
  worker_id: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

/** Request para validación QR */
export interface QRValidationRequest {
  secret_code: string;
}

/** Respuesta de validación QR */
export interface QRValidationResponse {
  job_id: string;
  status: JobStatus;
  message: string;
  transaction_id: string | null;
}

/** Respuesta de error del backend */
export interface ApiError {
  detail: string;
  error_code?: string;
}

// =============================================================================
// API Client
// =============================================================================

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Wrapper genérico para fetch con manejo de errores.
 *
 * @throws Error con el mensaje del backend si la respuesta no es OK.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    // Intentar parsear el error del backend (formato FastAPI)
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorBody: ApiError = await response.json();
      errorMessage = errorBody.detail ?? errorMessage;
    } catch {
      // Si no se puede parsear el JSON, usar el mensaje por defecto
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

// =============================================================================
// Endpoints
// =============================================================================

/**
 * GET /api/jobs/{jobId}/match
 *
 * Busca estudiantes disponibles dentro de 500m del MicroJob.
 * Usa PostGIS ST_DWithin con geography cast.
 */
export async function fetchMatchingStudents(
  jobId: string,
): Promise<MatchListResponse> {
  return apiFetch<MatchListResponse>(`/api/jobs/${jobId}/match`);
}

/**
 * POST /api/jobs/{jobId}/complete
 *
 * Valida el código QR y completa el trabajo.
 */
export async function completeJobWithQR(
  jobId: string,
  secretCode: string,
): Promise<QRValidationResponse> {
  return apiFetch<QRValidationResponse>(`/api/jobs/${jobId}/complete`, {
    method: "POST",
    body: JSON.stringify({ secret_code: secretCode }),
  });
}

/**
 * GET /health
 *
 * Health check del backend.
 */
export async function healthCheck(): Promise<{
  status: string;
  service: string;
  version: string;
}> {
  return apiFetch("/health");
}
