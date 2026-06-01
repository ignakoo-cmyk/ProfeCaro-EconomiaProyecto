"""
Ventana-Work — FastAPI Application Entry Point
=================================================
Inicializa la app FastAPI, registra routers, middlewares y eventos de startup.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import jobs
from app.routers.ws import router as ws_router, rest_router as jobs_realtime_router
from app.seed import seed_admin_user


# =============================================================================
# Lifespan — Eventos de Startup/Shutdown
# =============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Maneja el ciclo de vida de la aplicación.
    
    Startup:
      - Crea todas las tablas en la DB si no existen.
      - En producción, usar Alembic para migraciones incrementales.
    
    Shutdown:
      - Limpieza de recursos (si aplica).
    """
    # --- Startup ---
    # Crear tablas (desarrollo). En prod, usar: alembic upgrade head
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas/verificadas en PostgreSQL + PostGIS")
    
    # Crear admin por defecto si no existe
    seed_admin_user()
    
    yield
    
    # --- Shutdown ---
    print("👋 Ventana-Work Backend apagándose...")


# =============================================================================
# FastAPI App
# =============================================================================
app = FastAPI(
    title="Ventana-Work API",
    description=(
        "API REST para Ventana-Work: marketplace hiper-local de micro-empleos "
        "para estudiantes universitarios. Incluye matching geoespacial con "
        "PostGIS y validación QR para completar trabajos."
    ),
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",       # Swagger UI
    redoc_url="/redoc",     # ReDoc
    openapi_url="/openapi.json",
)


# =============================================================================
# CORS Middleware
# =============================================================================
# Permite requests desde el frontend Next.js (localhost:3000 en desarrollo).
# En producción, restringir a los dominios reales.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # Next.js dev server
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Registrar Routers
# =============================================================================
app.include_router(jobs.router)
app.include_router(jobs_realtime_router)
app.include_router(ws_router)


# =============================================================================
# Health Check
# =============================================================================
@app.get(
    "/health",
    tags=["system"],
    summary="Health Check",
    description="Verifica que el servicio está activo y respondiendo.",
)
async def health_check():
    """Endpoint de health check para monitoreo y Docker healthcheck."""
    return {
        "status": "healthy",
        "service": "ventana-work-api",
        "version": "0.1.0",
    }
