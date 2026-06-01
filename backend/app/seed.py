"""
Ventana-Work v2 — Script de Inicialización (Seed)
===================================================
Asegura que el superusuario ADMIN exista en la base de datos
al iniciar la aplicación.
"""

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.schema import User, UserType

# Contexto de hashing para contraseñas (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def seed_admin_user():
    """
    Crea el usuario administrador si no existe.
    Credenciales (solo para desarrollo/MVP): admin / admin
    """
    db: Session = SessionLocal()
    try:
        admin_email = "admin"
        # Verificar si el admin ya existe
        admin = db.query(User).filter(User.email == admin_email).first()
        
        if not admin:
            print("🚀 Creando usuario ADMIN semilla...")
            hashed_pw = get_password_hash("admin")
            new_admin = User(
                email=admin_email,
                hashed_password=hashed_pw,
                full_name="Super Administrador",
                user_type=UserType.ADMIN,
                # is_premium y data_tracking_consent toman defaults
            )
            db.add(new_admin)
            db.commit()
            print("✅ Usuario ADMIN creado exitosamente.")
        else:
            print("✅ Usuario ADMIN ya existe.")
    except Exception as e:
        print(f"❌ Error al crear el seed de admin: {e}")
        db.rollback()
    finally:
        db.close()
