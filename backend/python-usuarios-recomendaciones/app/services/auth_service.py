from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.config.settings import settings
from app.models.usuario import Usuario
from app.schemas.usuario_schema import UsuarioCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[Usuario]:
        user = db.query(Usuario).filter(Usuario.email == email).first()
        if not user or not self.verify_password(password, user.contraseña):
            return None
        return user

    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    def register_user(self, db: Session, usuario: UsuarioCreate) -> Usuario:
        hashed_password = self.get_password_hash(usuario.contraseña)
        db_usuario = Usuario(
            email=usuario.email,
            contraseña=hashed_password,
            nombre=usuario.nombre,
            pais=usuario.pais
        )
        db.add(db_usuario)
        db.commit()
        db.refresh(db_usuario)
        return db_usuario