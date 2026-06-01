"""
Ventana-Work — Router de Jobs (Endpoints de MicroJob)
=======================================================
Implementa los endpoints REST para la gestión de micro-empleos:
  - GET /api/jobs/{job_id}/match  → Match geoespacial (500m)
  - POST /api/jobs/{job_id}/complete → Validación QR
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.schemas.responses import (
    ErrorResponse,
    MatchListResponse,
    QRValidationRequest,
    QRValidationResponse,
    StudentMatchResponse,
)
from app.services.matching import MatchingServiceError, find_nearby_students
from app.services.qr_validation import QRValidationError, validate_qr_and_complete

router = APIRouter(
    prefix="/api/jobs",
    tags=["jobs"],
    responses={
        404: {"model": ErrorResponse, "description": "Job no encontrado"},
        500: {"model": ErrorResponse, "description": "Error interno del servidor"},
    },
)


# =============================================================================
# GET /api/jobs/{job_id}/match — Match Geoespacial
# =============================================================================
@router.get(
    "/{job_id}/match",
    response_model=MatchListResponse,
    summary="Buscar estudiantes cercanos a un MicroJob",
    description=(
        "Retorna todos los estudiantes disponibles (is_available=True) "
        "dentro de un radio de 500 metros del MicroJob, ordenados por "
        "reputación descendente. Usa PostGIS ST_DWithin con geography "
        "cast para cálculo de distancia geodésica real en metros."
    ),
    responses={
        200: {
            "description": "Lista de estudiantes cercanos encontrados.",
            "content": {
                "application/json": {
                    "example": {
                        "job_id": "550e8400-e29b-41d4-a716-446655440000",
                        "job_title": "Mesero para hora punta",
                        "radius_meters": 500,
                        "total_matches": 2,
                        "students": [
                            {
                                "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                                "email": "estudiante@uahurtado.cl",
                                "full_name": "María González",
                                "reputation": 4.8,
                                "is_available": True,
                                "distance_meters": 123.45,
                            }
                        ],
                    }
                }
            },
        },
        400: {"description": "Job no está en estado PUBLISHED."},
        404: {"description": "Job no encontrado."},
    },
)
async def match_students_to_job(
    job_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> MatchListResponse:
    """
    Endpoint de Match Geoespacial.
    
    Flujo:
      1. Recibe el job_id del MicroJob.
      2. Delega al servicio de matching (find_nearby_students).
      3. El servicio ejecuta una query PostGIS con ST_DWithin.
      4. Retorna los estudiantes dentro del radio, ordenados por reputación.
    
    La query geoespacial internamente:
      - Castea las columnas Geometry a Geography para trabajar en metros.
      - Usa el índice GiST espacial para filtrado eficiente.
      - Calcula distancia geodésica real (sobre el esferoide WGS84).
    """
    try:
        job, student_distances = find_nearby_students(
            db=db,
            job_id=job_id,
            radius_meters=settings.MAX_MATCH_RADIUS_METERS,
        )
    except MatchingServiceError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message,
        )
    except Exception as e:
        # Error inesperado — loggear y retornar 500
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al buscar estudiantes: {str(e)}",
        )

    # Transformar resultados al schema de respuesta
    students = [
        StudentMatchResponse(
            id=student.id,
            email=student.email,
            full_name=student.full_name,
            reputation=student.reputation or 3.0,
            is_available=student.is_available or False,
            distance_meters=round(distance, 2),
        )
        for student, distance in student_distances
    ]

    return MatchListResponse(
        job_id=job.id,
        job_title=job.title,
        radius_meters=settings.MAX_MATCH_RADIUS_METERS,
        total_matches=len(students),
        students=students,
    )


# =============================================================================
# POST /api/jobs/{job_id}/complete — Validación QR
# =============================================================================
@router.post(
    "/{job_id}/complete",
    response_model=QRValidationResponse,
    summary="Validar código QR y completar trabajo",
    description=(
        "El estudiante envía el secret_code escaneado del QR en el local. "
        "Si coincide con el código del MicroJob (comparación timing-safe), "
        "el trabajo transiciona a COMPLETED y se crea la Transaction."
    ),
    responses={
        200: {"description": "QR validado exitosamente, trabajo completado."},
        400: {"description": "Job no está en estado IN_PROGRESS."},
        403: {"description": "Código QR inválido."},
        404: {"description": "Job no encontrado."},
    },
)
async def complete_job_with_qr(
    job_id: uuid.UUID,
    payload: QRValidationRequest,
    db: Session = Depends(get_db),
) -> QRValidationResponse:
    """
    Endpoint de Validación QR.
    
    Flujo:
      1. Estudiante escanea QR en el local → obtiene secret_code.
      2. Envía POST con { "secret_code": "ABC123" }.
      3. Backend compara con secrets.compare_digest (timing-safe).
      4. Si match: COMPLETED + crea Transaction con desglose de pagos.
      5. Si no match: HTTP 403 Forbidden.
    
    Seguridad:
      - Comparación en tiempo constante previene timing attacks.
      - El secret_code se genera con secrets.token_hex (crypto-random).
    """
    try:
        job, transaction = validate_qr_and_complete(
            db=db,
            job_id=job_id,
            submitted_code=payload.secret_code,
        )
    except QRValidationError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message,
        )
    except ValueError as e:
        # Error de transición de estado de la State Machine
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al validar QR: {str(e)}",
        )

    return QRValidationResponse(
        job_id=job.id,
        status=job.status,
        message=(
            f"Trabajo '{job.title}' completado exitosamente. "
            f"Pago de ${transaction.worker_payment:,} CLP será liberado."
        ),
        transaction_id=transaction.id,
    )
