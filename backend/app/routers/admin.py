"""
Ventana-Work — Router de Administrador (Superadmin)
===================================================
Endpoints para moderación y aprobación de negocios y trabajos.
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.auth import get_current_user
from app.models.schema import User, MicroJob, UserType

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
)

def verify_superadmin(current_user: User):
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Requiere privilegios de Superadmin.",
        )

@router.get("/pending", summary="Listar trabajos y usuarios pendientes de aprobación")
async def get_pending_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_superadmin(current_user)
    
    # Buscar trabajos pendientes (ordenados de más antiguos a más nuevos)
    pending_jobs = db.query(MicroJob).filter(MicroJob.approval_status == 'pending').order_by(MicroJob.created_at.asc()).all()
    
    # Buscar usuarios pendientes (Cualquier usuario que necesite aprobación)
    pending_users = db.query(User).filter(User.account_status == 'pending', User.user_type != UserType.ADMIN).order_by(User.created_at.asc()).all()
    
    return {
        "pending_jobs": [
            {
                "id": str(j.id),
                "title": j.title,
                "description": j.description,
                "price_clp": j.price_clp,
                "created_at": j.created_at,
                "employer_id": str(j.employer_id),
                "employer_name": j.employer.full_name if j.employer else "Desconocido",
            } for j in pending_jobs
        ],
        "pending_users": [
            {
                "id": str(u.id),
                "full_name": u.full_name,
                "email": u.email,
                "user_type": u.user_type.value,
                "created_at": u.created_at,
            } for u in pending_users
        ]
    }


@router.patch("/approve/job/{job_id}", summary="Aprobar o rechazar un trabajo")
async def moderate_job(
    job_id: uuid.UUID,
    action: str, # "approve" o "reject"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_superadmin(current_user)
    
    job = db.query(MicroJob).filter(MicroJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trabajo no encontrado")
        
    if action == "approve":
        job.approval_status = "approved"
    elif action == "reject":
        job.approval_status = "rejected"
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Acción no válida")
        
    db.commit()
    return {"message": f"Trabajo {action}d exitosamente", "job_id": str(job.id), "approval_status": job.approval_status}


@router.patch("/approve/user/{user_id}", summary="Aprobar o rechazar una cuenta de negocio")
async def moderate_user(
    user_id: uuid.UUID,
    action: str, # "approve" o "reject"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_superadmin(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        
    if action == "approve":
        user.account_status = "approved"
    elif action == "reject":
        user.account_status = "rejected"
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Acción no válida")
        
    db.commit()
    return {"message": f"Usuario {action}d exitosamente", "user_id": str(user.id), "account_status": user.account_status}
