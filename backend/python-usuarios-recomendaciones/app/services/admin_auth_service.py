from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import hashlib
from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config.settings import settings
from app.models.administrador import Administrador
from app.schemas.admin_schema import AdminCreate

# Instancia del esquema de seguridad
security = HTTPBearer()

class AdminAuthService:
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        plain_hash = hashlib.sha256(plain_password.encode()).hexdigest()
        return plain_hash == hashed_password

    def get_password_hash(self, password: str) -> str:
        return hashlib.sha256(password.encode()).hexdigest()

    def authenticate_admin(self, db: Session, username: str, password: str) -> Optional[Administrador]:
        admin = db.query(Administrador).filter(
            Administrador.username == username,
            Administrador.activo == True
        ).first()
        if not admin or not self.verify_password(password, admin.password):
            return None
        
        # Actualizar último acceso
        admin.ultimo_acceso = datetime.utcnow()
        db.commit()
        return admin

    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire, "type": "admin"})
        return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    def create_admin(self, db: Session, admin: AdminCreate) -> Administrador:
        hashed_password = self.get_password_hash(admin.contraseña)
        db_admin = Administrador(
            nombre=admin.nombre,
            email=admin.email,
            username=admin.username,
            password=hashed_password
        )
        db.add(db_admin)
        db.commit()
        db.refresh(db_admin)
        return db_admin

    def verify_admin_token(self, token: str) -> bool:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            return payload.get("type") == "admin"
        except JWTError:
            return False

# Función de utilidad para verificación de token de admin
def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verificar token de administrador y retornar payload"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        
        if payload.get("type") != "admin":
            raise HTTPException(status_code=403, detail="Token de administrador requerido")
        
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

# Instancia global del servicio
admin_auth_service = AdminAuthService()