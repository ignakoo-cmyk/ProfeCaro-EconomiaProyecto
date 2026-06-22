/**
 * useJobRealtime — Hook de sincronización en tiempo real
 * ========================================================
 * Estrategia dual: WebSocket primario + Polling como fallback.
 *
 * 1. Intenta conectarse al WebSocket del backend (/ws/job/{jobId})
 * 2. Si falla o no está disponible, cae en polling de 5 segundos
 * 3. Expone el estado del job y funciones de acción (markArrived, validatePin)
 */

import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8009";
const WS_URL = API_URL.replace("http://", "ws://").replace("https://", "wss://");

export type JobStatus =
  | "PUBLISHED"
  | "MATCHED"
  | "IN_TRANSIT"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "UNKNOWN";

export interface LiveJobState {
  job_id: string;
  title: string;
  status: JobStatus;
  student_name: string;
  student_avatar: string;
  student_rating: number;
  employer_name: string;
  eta_minutes: number;
  price_clp: number;
  net_clp: number;
  location: string;
  start_time: string;
  end_time: string;
  arrived_at: string | null;
  completed_at: string | null;
  pin_code: string | null;
  updated_at: string;
}

interface UseJobRealtimeReturn {
  jobState: LiveJobState | null;
  isConnected: boolean;
  connectionMode: "websocket" | "polling" | "disconnected";
  subscribers: number;
  latency: number;
  markArrived: () => Promise<void>;
  validatePin: (pin: string) => Promise<boolean>;
  lastUpdated: Date | null;
}

export function useJobRealtime(jobId: string): UseJobRealtimeReturn {
  const [jobState, setJobState] = useState<LiveJobState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMode, setConnectionMode] = useState<"websocket" | "polling" | "disconnected">("disconnected");
  const [subscribers, setSubscribers] = useState(0);
  const [latency, setLatency] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const wsFailedRef = useRef(false);

  const updateState = useCallback((data: LiveJobState) => {
    setJobState(data);
    setLastUpdated(new Date());
  }, []);

  // --- Polling Fallback ---
  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    setConnectionMode("polling");
    setIsConnected(true);

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/jobs/${jobId}/status`);
        if (res.ok) {
          const data = await res.json();
          updateState(data);
        }
      } catch { /* network error, keep trying */ }
    };

    poll(); // immediate first call
    pollingRef.current = setInterval(poll, 5000);
  }, [jobId, updateState]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // --- WebSocket Connection ---
  useEffect(() => {
    let ws: WebSocket;

    const connect = () => {
      try {
        ws = new WebSocket(`${WS_URL}/ws/job/${jobId}`);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnectionMode("websocket");
          setIsConnected(true);
          wsFailedRef.current = false;
          stopPolling(); // stop polling if ws connects
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.event === "CONNECTED" || msg.event === "STATUS_CHANGE") {
              updateState(msg.data);
              if (msg.subscribers) setSubscribers(msg.subscribers);
            } else if (msg.event === "HEARTBEAT") {
              if (msg.latency_ms) setLatency(msg.latency_ms);
              if (msg.subscribers) setSubscribers(msg.subscribers);
            }
          } catch { /* ignore bad JSON */ }
        };

        ws.onerror = () => {
          wsFailedRef.current = true;
        };

        ws.onclose = () => {
          setIsConnected(false);
          setConnectionMode("disconnected");
          // Fallback to polling if WS fails
          if (wsFailedRef.current) {
            startPolling();
          } else {
            // Reconnect after 3s
            setTimeout(connect, 3000);
          }
        };
      } catch {
        // WS not available (e.g., HTTP-only), fall back to polling
        startPolling();
      }
    };

    connect();

    return () => {
      stopPolling();
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close();
      }
    };
  }, [jobId, startPolling, stopPolling, updateState]);

  // --- Actions ---
  const markArrived = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "mark_arrived" }));
    } else {
      // REST fallback
      await fetch(`${API_URL}/api/jobs/${jobId}/mark-arrived`, { method: "POST" });
    }
  }, [jobId]);

  const validatePin = useCallback(async (pin: string): Promise<boolean> => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "validate_pin", pin }));
      return true;
    } else {
      const res = await fetch(`${API_URL}/api/jobs/${jobId}/validate-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      return res.ok;
    }
  }, [jobId]);

  return { jobState, isConnected, connectionMode, subscribers, latency, markArrived, validatePin, lastUpdated };
}

