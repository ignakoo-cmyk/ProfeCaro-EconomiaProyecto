"""
Ventana-Work — Servicio de Validación QR
==========================================
Implementa la lógica de validación del código QR que el estudiante
escanea al llegar al local de la PYME.

Flujo:
  1. Estudiante llega al local.
  2. La PYME tiene un QR con el secret_code del MicroJob.
  3. El estudiante escanea el QR y envía el código al backend.
  4. Se valida el código con timing-safe comparison (previene timing attacks).
  5. Si es correcto, el MicroJob transiciona a COMPLETED.
  6. Se crea una Transaction con el desglose de pagos.

Seguridad:
  - secrets.compare_digest() hace comparación en tiempo constante.
    Esto previene ataques de temporización (timing attacks) donde un
    atacante podría inferir caracteres del código midiendo tiempos de respuesta.
"""

import secrets
import uuid

from sqlalchemy.orm import Session

from app.config import settings
from app.models.schema import (
    JobStatus,
    MicroJob,
    Transaction,
    TransactionStatus,
)


class QRValidationError(Exception):
    """Excepción base para errores de validación QR."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def validate_qr_and_complete(
    db: Session,
    job_id: uuid.UUID,
    submitted_code: str,
) -> tuple[MicroJob, Transaction]:
    """
    Valida el código QR y completa el MicroJob.

    Proceso:
      1. Obtiene el MicroJob y valida que existe.
      2. Verifica que está en estado IN_PROGRESS (el estudiante ya empezó).
      3. Compara el código enviado con el secret_code del job.
      4. Si coincide: transiciona a COMPLETED y crea Transaction.
      5. Si no coincide: lanza error 403.

    Cálculo de Montos:
      employer_charge = price_clp (lo que ya pagó la PYME)
      platform_fee    = floor(price_clp * PLATFORM_FEE_PERCENT / 100)
      worker_payment  = price_clp - platform_fee

    Args:
        db: Session de SQLAlchemy.
        job_id: UUID del MicroJob.
        submitted_code: Código de 6 caracteres enviado por el estudiante.

    Returns:
        Tupla (MicroJob actualizado, Transaction creada).

    Raises:
        QRValidationError: Si el job no existe, no está en IN_PROGRESS,
                          o el código no coincide.
    """
    # --- 1. Obtener el MicroJob ---
    job = db.query(MicroJob).filter(MicroJob.id == job_id).first()

    if job is None:
        raise QRValidationError(
            f"MicroJob con id '{job_id}' no encontrado.",
            status_code=404,
        )

    # --- 2. Validar estado ---
    if job.status != JobStatus.IN_PROGRESS:
        raise QRValidationError(
            f"El MicroJob debe estar en estado IN_PROGRESS para validar QR. "
            f"Estado actual: {job.status.value}.",
            status_code=400,
        )

    # --- 3. Comparación timing-safe del código ---
    # secrets.compare_digest() compara strings en tiempo constante O(n).
    # Esto significa que el tiempo de respuesta NO varía según cuántos
    # caracteres del código son correctos, previniendo timing attacks.
    #
    # Ejemplo de timing attack sin esta protección:
    #   "A?????" → respuesta en 1ms (falla en char 0)
    #   "AB????" → respuesta en 2ms (falla en char 1)
    #   El atacante puede inferir el código carácter por carácter.
    if not secrets.compare_digest(
        submitted_code.upper().encode("utf-8"),
        job.secret_code.upper().encode("utf-8"),
    ):
        raise QRValidationError(
            "Código QR inválido. Verifique el código e intente nuevamente.",
            status_code=403,
        )

    # --- 4. Transicionar a COMPLETED ---
    # Usa la State Machine definida en el modelo.
    job.transition_to(JobStatus.COMPLETED)

    # --- 5. Crear Transaction ---
    # Cálculo de la distribución del pago:
    #   - platform_fee: porcentaje que retiene Ventana-Work.
    #   - worker_payment: lo que recibe el estudiante (precio - comisión).
    #   - Se usa división entera (//) para evitar centavos (CLP no tiene).
    fee_percent = settings.PLATFORM_FEE_PERCENT
    platform_fee = job.price_clp * fee_percent // 100
    worker_payment = job.price_clp - platform_fee

    transaction = Transaction(
        job_id=job.id,
        employer_charge=job.price_clp,
        worker_payment=worker_payment,
        platform_fee=platform_fee,
        status=TransactionStatus.PENDING,
    )

    db.add(transaction)
    db.commit()
    db.refresh(job)
    db.refresh(transaction)

    return job, transaction
