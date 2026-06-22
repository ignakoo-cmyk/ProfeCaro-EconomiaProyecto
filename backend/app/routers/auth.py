"""
Ventana-Work — Router de Autenticación
========================================
Provee el endpoint OAuth2 Password Flow para emitir JWT tokens.
Compatible con el estándar FastAPI OAuth2PasswordRequestForm.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.schema import User, UserType

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/token", summary="Login OAuth2 — obtiene un JWT token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Autenticación estándar OAuth2 Password Flow.
    
    - **username**: email del usuario (o 'admin' para el admin de semilla)
    - **password**: contraseña en texto plano
    
    Retorna un JWT `access_token` válido por 24 horas.
    """
    # Buscar usuario por email
    user: User | None = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "user_type": user.user_type.value,
        }
    )

    return {"access_token": token, "token_type": "bearer"}


# =============================================================================
# Register Schemas & Endpoint
# =============================================================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str = Field(..., pattern="^(student|business)$")
    name: str
    # Conditional fields based on role
    career: str | None = None
    address: str | None = None

@router.post("/register", summary="Registro de nuevos usuarios", status_code=status.HTTP_201_CREATED)
async def register_user(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Registra un nuevo usuario como Estudiante o Empresa.
    Asigna el Enum correcto en base al `role`.
    """
    # Verificar si el email ya existe
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado.",
        )

    # Validar el dominio si es estudiante (Regla de negocio)
    if data.role == "student" and not data.email.lower().endswith(f"@{settings.ALLOWED_STUDENT_EMAIL_DOMAIN}"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Los estudiantes deben usar un correo @{settings.ALLOWED_STUDENT_EMAIL_DOMAIN}",
        )

    user_type = UserType.STUDENT if data.role == "student" else UserType.PYME

    new_user = User(
        email=data.email,
        hashed_password=pwd_context.hash(data.password),
        full_name=data.name,
        user_type=user_type,
        major=data.career if data.role == "student" else None,
        # Nota: La dirección (address) podría guardarse en un campo location si se usara geocoding, 
        # pero por ahora no está expuesto directamente como string en el modelo base salvo que agreguemos un campo de texto o procesemos la geometria.
        # Asumiremos defaults para los otros.
    )

    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear el usuario en la base de datos."
        )
        
    return {"message": "Usuario creado exitosamente", "id": str(new_user.id)}
