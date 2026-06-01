"""
Ventana-Work — Pydantic Schemas (Request/Response)
=====================================================
Define los schemas de validación y serialización para la API REST.
Separados de los modelos SQLAlchemy para mantener la capa de transporte
independiente de la capa de persistencia (Clean Architecture).
"""

import uuid
from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)

from app.models.schema import JobStatus, UserType


# =============================================================================
# Schemas de Usuario
# =============================================================================

class UserBase(BaseModel):
    """Campos comunes para crear/leer un usuario."""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    user_type: UserType


class UserCreate(UserBase):
    """Schema para registro de usuario."""
    password: str = Field(..., min_length=8, max_length=128)
    # Ubicación inicial del estudiante (opcional en registro)
    latitude: float | None = Field(None, ge=-90.0, le=90.0)
    longitude: float | None = Field(None, ge=-180.0, le=180.0)

    @field_validator("email")
    @classmethod
    def validate_student_email(cls, v: str, info) -> str:
        """
        Regla de Negocio: Si el tipo es STUDENT, el email DEBE
        terminar en @uahurtado.cl. Si no, rechazar registro.
        """
        # Nota: info.data contiene los campos ya validados.
        # user_type se define ANTES de email en la clase, así que
        # estará disponible en info.data al momento de validar email.
        user_type = info.data.get("user_type")
        if user_type == UserType.STUDENT:
            if not v.lower().endswith("@uahurtado.cl"):
                raise ValueError(
                    "Los estudiantes deben registrarse con su email "
                    "institucional @uahurtado.cl"
                )
        return v.lower().strip()


class UserResponse(BaseModel):
    """Schema de respuesta para usuario (sin contraseña)."""
    id: uuid.UUID
    email: str
    full_name: str
    user_type: UserType
    reputation: float | None = None
    is_available: bool | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudentMatchResponse(BaseModel):
    """
    Schema para respuesta del endpoint de match geoespacial.
    Incluye la distancia en metros desde el job hasta el estudiante.
    """
    id: uuid.UUID
    email: str
    full_name: str
    reputation: float
    is_available: bool
    distance_meters: float = Field(
        ...,
        description=(
            "Distancia geodésica en metros entre el estudiante y el job. "
            "Calculada por PostGIS usando ST_Distance con geography cast "
            "(distancia real sobre la superficie de la Tierra, no euclidiana)."
        ),
    )

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Schemas de MicroJob
# =============================================================================

class MicroJobBase(BaseModel):
    """Campos comunes del MicroJob."""
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10)
    price_clp: int = Field(..., gt=0, description="Precio en CLP (entero, sin decimales)")
    duration_hours: float = Field(..., ge=1.0, le=3.0)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)


class MicroJobCreate(MicroJobBase):
    """Schema para crear un MicroJob."""
    start_time: datetime


class MicroJobResponse(BaseModel):
    """Schema de respuesta para MicroJob."""
    id: uuid.UUID
    title: str
    description: str
    price_clp: int
    duration_hours: float
    start_time: datetime
    status: JobStatus
    employer_id: uuid.UUID
    worker_id: uuid.UUID | None = None
    created_at: datetime

    # Nota: location (PostGIS Geometry) no se serializa directamente.
    # Se convierte a lat/lon en el router.
    latitude: float | None = None
    longitude: float | None = None

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Schemas de Validación QR
# =============================================================================

class QRValidationRequest(BaseModel):
    """
    Schema para validación de código QR.
    El estudiante envía el secret_code que escaneó en el local.
    """
    secret_code: str = Field(
        ...,
        min_length=6,
        max_length=6,
        description="Código de 6 caracteres del QR escaneado en el local.",
    )


class QRValidationResponse(BaseModel):
    """Respuesta tras validación QR exitosa."""
    job_id: uuid.UUID
    status: JobStatus
    message: str
    transaction_id: uuid.UUID | None = None


# =============================================================================
# Schemas de Transaction
# =============================================================================

class TransactionResponse(BaseModel):
    """Schema de respuesta para transacciones."""
    id: uuid.UUID
    job_id: uuid.UUID
    employer_charge: int
    worker_payment: int
    platform_fee: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Schemas Genéricos
# =============================================================================

class MatchListResponse(BaseModel):
    """Wrapper para la lista de matches geoespaciales."""
    job_id: uuid.UUID
    job_title: str
    radius_meters: int
    total_matches: int
    students: list[StudentMatchResponse]


class ErrorResponse(BaseModel):
    """Schema estándar para respuestas de error."""
    detail: str
    error_code: str | None = None
