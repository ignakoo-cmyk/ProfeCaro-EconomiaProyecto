"""
Ventana-Work — Configuración de Base de Datos
===============================================
Engine SQLAlchemy con soporte para PostGIS.
Provee la session factory y la base declarativa para los modelos.
"""

from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

# =============================================================================
# Engine SQLAlchemy
# =============================================================================
# pool_pre_ping: verifica que la conexión siga activa antes de usarla.
# echo: loggea las queries SQL (desactivar en producción).
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=True,  # TODO: desactivar en producción
)

# Session factory — cada request de FastAPI obtiene su propia session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# =============================================================================
# Base Declarativa
# =============================================================================
class Base(DeclarativeBase):
    """
    Clase base para todos los modelos SQLAlchemy.
    Hereda de DeclarativeBase (estilo moderno SQLAlchemy 2.0).
    """
    pass


# =============================================================================
# Habilitar PostGIS al crear las tablas
# =============================================================================
@event.listens_for(engine, "connect")
def enable_postgis(dbapi_connection, connection_record):
    """
    Asegura que la extensión PostGIS esté habilitada en la base de datos.
    Se ejecuta automáticamente al establecer una nueva conexión.
    """
    cursor = dbapi_connection.cursor()
    cursor.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
    cursor.close()


# =============================================================================
# Dependency Injection para FastAPI
# =============================================================================
def get_db() -> Generator[Session, None, None]:
    """
    Genera una session de base de datos para cada request.
    Se usa como dependencia en los endpoints de FastAPI:
    
        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            ...
    
    La session se cierra automáticamente al finalizar el request,
    incluso si ocurre una excepción.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
