"""
Ventana-Work — WebSocket Router (Real-time Job Status)
=======================================================
Implementa un WebSocket endpoint para sincronización en tiempo real
del estado de un MicroJob entre Estudiante, Empleador y Admin.

Flujo:
  - Cliente se conecta a /ws/job/{job_id}
  - El servidor hace broadcast de actualizaciones de estado a todos
    los suscriptores del mismo job_id cada vez que hay un cambio.
  - Fallback: Si no hay cambio, envía un heartbeat cada 5s.
"""

import asyncio
import json
import logging
from collections import defaultdict
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("ventana-work.ws")

router = APIRouter(tags=["websockets"])


# =============================================================================
# Connection Manager — gestiona las conexiones activas por job_id
# =============================================================================

class ConnectionManager:
    def __init__(self):
        # { job_id: [WebSocket, ...] }
        self.active_connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, job_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[job_id].append(websocket)
        logger.info(f"[WS] Nueva conexión en job={job_id}. Total: {len(self.active_connections[job_id])}")

    def disconnect(self, job_id: str, websocket: WebSocket):
        if websocket in self.active_connections[job_id]:
            self.active_connections[job_id].remove(websocket)
        logger.info(f"[WS] Conexión cerrada en job={job_id}. Restantes: {len(self.active_connections[job_id])}")

    async def broadcast(self, job_id: str, message: dict):
        """Envía mensaje a todos los clientes suscritos al job_id."""
        dead = []
        for ws in self.active_connections[job_id]:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(job_id, ws)

    def get_subscriber_count(self, job_id: str) -> int:
        return len(self.active_connections[job_id])


manager = ConnectionManager()


# =============================================================================
# Estado en memoria de los jobs (fuente de verdad para WS en MVP)
# En producción: usar Redis pub/sub o DB events
# =============================================================================

# job_id -> { status, eta_minutes, student_name, ... }
JOB_STATES: dict[str, dict] = {
    "VW-8492": {
        "job_id": "VW-8492",
        "title": "Mesero de Apoyo",
        "status": "MATCHED",          # PUBLISHED | MATCHED | IN_TRANSIT | ARRIVED | IN_PROGRESS | COMPLETED
        "student_name": "Maria González",
        "student_avatar": "https://i.pravatar.cc/150?img=5",
        "student_rating": 4.8,
        "employer_name": "Cafetería Central UAH",
        "eta_minutes": 8,
        "price_clp": 18000,
        "net_clp": 16200,
        "location": "Av. Almirante Barroso 6",
        "start_time": "13:00",
        "end_time": "15:00",
        "arrived_at": None,
        "completed_at": None,
        "pin_code": None,
        "updated_at": datetime.now().isoformat(),
    }
}


# =============================================================================
# Endpoint: GET /api/jobs/{job_id}/status (Polling fallback)
# =============================================================================

from fastapi import APIRouter as _APIRouter
from fastapi.responses import JSONResponse

rest_router = _APIRouter(prefix="/api/jobs", tags=["jobs-realtime"])


@rest_router.get("/{job_id}/status")
async def get_job_status(job_id: str):
    """Polling fallback: retorna el estado actual del job."""
    state = JOB_STATES.get(job_id)
    if not state:
        # Retornar estado demo para cualquier job_id no registrado
        return JSONResponse({
            "job_id": job_id,
            "status": "PUBLISHED",
            "message": "Job en estado inicial",
            "updated_at": datetime.now().isoformat(),
        })
    return JSONResponse(state)


@rest_router.post("/{job_id}/mark-arrived")
async def mark_student_arrived(job_id: str):
    """Estudiante marca llegada al local."""
    state = JOB_STATES.get(job_id, {})
    import secrets
    pin = secrets.token_hex(3).upper()  # Ej: "A3F9C2"
    state.update({
        "status": "ARRIVED",
        "arrived_at": datetime.now().isoformat(),
        "eta_minutes": 0,
        "pin_code": pin,
        "updated_at": datetime.now().isoformat(),
    })
    JOB_STATES[job_id] = state
    # Broadcast a todos los suscriptores
    await manager.broadcast(job_id, {
        "event": "STATUS_CHANGE",
        "data": state,
    })
    return {"success": True, "pin_code": pin, "state": state}


@rest_router.post("/{job_id}/validate-pin")
async def validate_arrival_pin(job_id: str, body: dict):
    """Empleador valida el PIN de llegada del estudiante."""
    state = JOB_STATES.get(job_id, {})
    submitted_pin = body.get("pin", "").upper()
    
    if state.get("pin_code") and state["pin_code"] == submitted_pin:
        state.update({
            "status": "IN_PROGRESS",
            "updated_at": datetime.now().isoformat(),
        })
        JOB_STATES[job_id] = state
        await manager.broadcast(job_id, {"event": "STATUS_CHANGE", "data": state})
        return {"success": True, "message": "PIN validado. Trabajo en progreso."}
    
    return JSONResponse({"success": False, "message": "PIN incorrecto."}, status_code=400)


# =============================================================================
# Endpoint: WebSocket /ws/job/{job_id}
# =============================================================================

@router.websocket("/ws/job/{job_id}")
async def websocket_job_feed(websocket: WebSocket, job_id: str):
    """
    WebSocket de estado del job en tiempo real.
    
    Eventos enviados al cliente:
      - CONNECTED: confirmación de conexión con estado actual
      - STATUS_CHANGE: cuando el estado cambia (estudiante llegó, etc.)
      - HEARTBEAT: señal de vida cada 5 segundos
    
    Mensajes recibidos del cliente:
      - { "action": "mark_arrived" }
      - { "action": "validate_pin", "pin": "A3F9C2" }
    """
    await manager.connect(job_id, websocket)
    
    # Estado inicial al conectarse
    current_state = JOB_STATES.get(job_id, {"job_id": job_id, "status": "UNKNOWN"})
    await websocket.send_json({
        "event": "CONNECTED",
        "data": current_state,
        "subscribers": manager.get_subscriber_count(job_id),
    })
    
    heartbeat_task = None
    
    async def send_heartbeat():
        while True:
            await asyncio.sleep(5)
            try:
                await websocket.send_json({
                    "event": "HEARTBEAT",
                    "latency_ms": 12,
                    "subscribers": manager.get_subscriber_count(job_id),
                    "timestamp": datetime.now().isoformat(),
                })
            except Exception:
                break
    
    heartbeat_task = asyncio.create_task(send_heartbeat())
    
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
                action = msg.get("action")
                
                if action == "mark_arrived":
                    state = JOB_STATES.get(job_id, {})
                    import secrets as _s
                    pin = _s.token_hex(3).upper()
                    state.update({
                        "status": "ARRIVED",
                        "arrived_at": datetime.now().isoformat(),
                        "eta_minutes": 0,
                        "pin_code": pin,
                        "updated_at": datetime.now().isoformat(),
                    })
                    JOB_STATES[job_id] = state
                    await manager.broadcast(job_id, {"event": "STATUS_CHANGE", "data": state})
                    
                elif action == "validate_pin":
                    state = JOB_STATES.get(job_id, {})
                    if state.get("pin_code") == msg.get("pin", "").upper():
                        state.update({
                            "status": "IN_PROGRESS",
                            "updated_at": datetime.now().isoformat(),
                        })
                        JOB_STATES[job_id] = state
                        await manager.broadcast(job_id, {"event": "STATUS_CHANGE", "data": state})
                        
            except json.JSONDecodeError:
                logger.warning(f"[WS] Mensaje inválido recibido en job={job_id}")
                
    except WebSocketDisconnect:
        manager.disconnect(job_id, websocket)
        if heartbeat_task:
            heartbeat_task.cancel()
