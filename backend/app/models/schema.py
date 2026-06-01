"""
Ventana-Work v2 — Modelos SQLAlchemy (Domain Models)
====================================================
Define las entidades core del dominio usando SQLAlchemy 2.0 (Mapped types)
con soporte para PostGIS vía GeoAlchemy2.

Roles: STUDENT, PYME, ADMIN.
Incluye lógica de suscripciones y monetización de datos.
"""

import enum
import secrets
import uuid
from datetime import datetime, timezone

from geoalchemy2 import Geometry
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    CheckConstraint,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from app.database import Base


# =============================================================================
# Enums del Dominio
# =============================================================================

class UserType(str, enum.Enum):
    """Tipos de usuario en la plataforma."""
    STUDENT = "STUDENT"
    PYME = "PYME"
    ADMIN = "ADMIN"


class JobStatus(str, enum.Enum):
    PUBLISHED = "PUBLISHED"
    MATCHED = "MATCHED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    PAID = "PAID"
    CANCELLED = "CANCELLED"


class TransactionStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    REFUNDED = "REFUNDED"


# =============================================================================
# Transiciones Válidas de Estado (State Machine)
# =============================================================================
VALID_TRANSITIONS: dict[JobStatus, set[JobStatus]] = {
    JobStatus.PUBLISHED: {JobStatus.MATCHED, JobStatus.CANCELLED},
    JobStatus.MATCHED: {JobStatus.IN_PROGRESS, JobStatus.CANCELLED},
    JobStatus.IN_PROGRESS: {JobStatus.COMPLETED, JobStatus.CANCELLED},
    JobStatus.COMPLETED: {JobStatus.PAID},
    JobStatus.PAID: set(),
    JobStatus.CANCELLED: set(),
}

def validate_status_transition(current: JobStatus, target: JobStatus) -> bool:
    valid_targets = VALID_TRANSITIONS.get(current, set())
    if target not in valid_targets:
        raise ValueError(
            f"Transición inválida: {current.value} → {target.value}. "
            f"Transiciones permitidas desde {current.value}: "
            f"{[s.value for s in valid_targets]}"
        )
    return True


# =============================================================================
# Modelo: User (Polimórfico)
# =============================================================================

class User(Base):
    """
    Usuario de la plataforma. Puede ser STUDENT, PYME o ADMIN.
    
    Reglas de Suscripción (Solo STUDENT):
      - is_premium: Si es True, no paga comisiones, prioridad en match.
      - data_tracking_consent: Si es False (o es premium), no vendemos sus datos.
      
    Datos Onboarding (Solo STUDENT):
      - free_windows: JSONB con arrays de horarios libres.
      - major: Carrera que estudia.
      - campus_location: Ubicación principal (POINT).
    """
    __tablename__ = "users"

    # --- Campos Comunes ---
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    user_type: Mapped[UserType] = mapped_column(
        Enum(UserType, name="user_type_enum", create_constraint=True),
        nullable=False,
        index=True,
    )

    # --- Campos Específicos de STUDENT (Onboarding & Lógica de Negocio) ---
    location = mapped_column(
        Geometry("POINT", srid=4326, spatial_index=True),
        nullable=True,
        doc="Ubicación dinámica/actual.",
    )
    campus_location = mapped_column(
        Geometry("POINT", srid=4326, spatial_index=True),
        nullable=True,
        doc="Ubicación estática del campus principal.",
    )
    reputation: Mapped[float | None] = mapped_column(
        Float, nullable=True, default=3.0
    )
    is_available: Mapped[bool | None] = mapped_column(
        Boolean, nullable=True, default=False
    )
    major: Mapped[str | None] = mapped_column(
        String(255), nullable=True, doc="Carrera universitaria."
    )
    free_windows = mapped_column(
        JSONB, nullable=True, doc="Horarios libres estructurados en JSON."
    )
    
    # --- Suscripción y Monetización de Datos ---
    is_premium: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False,
        doc="Si es True, el usuario paga mensualidad y recibe beneficios."
    )
    data_tracking_consent: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True,
        doc="Consentimiento para vender insights de tráfico (default True en plan Free)."
    )

    # --- Timestamps ---
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # --- Relaciones ---
    published_jobs: Mapped[list["MicroJob"]] = relationship(
        "MicroJob",
        back_populates="employer",
        foreign_keys="MicroJob.employer_id",
        lazy="selectin",
    )
    taken_jobs: Mapped[list["MicroJob"]] = relationship(
        "MicroJob",
        back_populates="worker",
        foreign_keys="MicroJob.worker_id",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint(
            "reputation IS NULL OR (reputation >= 1.0 AND reputation <= 5.0)",
            name="ck_user_reputation_range",
        ),
    )

    @validates("email")
    def validate_email_domain(self, key: str, email: str) -> str:
        """
        No se fuerza la validación de @uahurtado.cl a nivel ORM para todos 
        porque el ADMIN (ej: 'admin') no cumpliría la regla. 
        La validación estricta del dominio debe hacerse en los Schemas de Pydantic.
        """
        return email.lower().strip()


# =============================================================================
# Modelo: MicroJob
# =============================================================================

class MicroJob(Base):
    __tablename__ = "micro_jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price_clp: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_hours: Mapped[float] = mapped_column(Float, nullable=False)
    location = mapped_column(
        Geometry("POINT", srid=4326, spatial_index=True), nullable=False
    )
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus, name="job_status_enum", create_constraint=True),
        nullable=False, default=JobStatus.PUBLISHED, index=True
    )
    secret_code: Mapped[str] = mapped_column(
        String(6), nullable=False, default=lambda: secrets.token_hex(3).upper()
    )
    employer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    worker_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    employer: Mapped["User"] = relationship(
        "User", back_populates="published_jobs", foreign_keys=[employer_id]
    )
    worker: Mapped["User | None"] = relationship(
        "User", back_populates="taken_jobs", foreign_keys=[worker_id]
    )
    transaction: Mapped["Transaction | None"] = relationship(
        "Transaction", back_populates="job", uselist=False
    )

    __table_args__ = (
        CheckConstraint("price_clp > 0", name="ck_microjob_positive_price"),
        CheckConstraint(
            "duration_hours >= 1.0 AND duration_hours <= 3.0",
            name="ck_microjob_duration_range"
        ),
    )

    def transition_to(self, new_status: JobStatus) -> None:
        validate_status_transition(self.status, new_status)
        self.status = new_status


# =============================================================================
# Modelo: Transaction
# =============================================================================

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("micro_jobs.id", ondelete="CASCADE"),
        nullable=False, unique=True, index=True
    )
    employer_charge: Mapped[int] = mapped_column(Integer, nullable=False)
    worker_payment: Mapped[int] = mapped_column(Integer, nullable=False)
    platform_fee: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[TransactionStatus] = mapped_column(
        Enum(TransactionStatus, name="transaction_status_enum", create_constraint=True),
        nullable=False, default=TransactionStatus.PENDING
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    job: Mapped["MicroJob"] = relationship("MicroJob", back_populates="transaction")

    __table_args__ = (
        CheckConstraint("employer_charge > 0", name="ck_tx_positive_charge"),
        CheckConstraint("worker_payment >= 0", name="ck_tx_non_negative_payment"),
        CheckConstraint("platform_fee >= 0", name="ck_tx_non_negative_fee"),
        CheckConstraint(
            "employer_charge = worker_payment + platform_fee",
            name="ck_tx_amounts_balance"
        ),
    )
