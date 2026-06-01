"""
Ventana-Work — Configuración de la Aplicación
===============================================
Usa Pydantic BaseSettings para cargar variables de entorno
con validación de tipos automática.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configuración centralizada de la aplicación.
    Los valores se cargan desde variables de entorno o archivo .env.
    """

    # --- Base de Datos ---
    DATABASE_URL: str = "postgresql://ventana:ventana_secret@db:5432/ventana_db"

    # --- Seguridad ---
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 horas
    ALGORITHM: str = "HS256"

    # --- Lógica de Negocio ---
    # Comisión de la plataforma en porcentaje (entero).
    # Ejemplo: 10 = la plataforma retiene 10% de cada transacción.
    PLATFORM_FEE_PERCENT: int = 10

    # Radio máximo de búsqueda geoespacial en metros.
    # ST_DWithin usa este valor para filtrar estudiantes cercanos.
    MAX_MATCH_RADIUS_METERS: int = 500

    # Dominio de email permitido para estudiantes.
    # Regla de negocio: solo emails @uahurtado.cl pueden registrarse como STUDENT.
    ALLOWED_STUDENT_EMAIL_DOMAIN: str = "uahurtado.cl"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Instancia singleton — importar desde aquí en toda la app
settings = Settings()
