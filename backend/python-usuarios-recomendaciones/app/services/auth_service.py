from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import hashlib
from app.config.settings import settings
from app.models.usuario import Usuario
from app.schemas.usuario_schema import UsuarioCreate

class AuthService:
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        # Usar SHA-256 para verificar contraseñas
        plain_hash = hashlib.sha256(plain_password.encode()).hexdigest()
        return plain_hash == hashed_password

    def get_password_hash(self, password: str) -> str:
        # Usar SHA-256 en lugar de bcrypt para evitar problemas de compatibilidad
        return hashlib.sha256(password.encode()).hexdigest()

    async def authenticate_user(self, email_or_username: str, password: str) -> Optional[Usuario]:
        """Autenticar usuario con MongoDB/Beanie"""
        # Buscar por email o username
        user = await Usuario.find_one(
            {"$or": [
                {"email": email_or_username},
                {"username": email_or_username}
            ]}
        )
        if not user or not self.verify_password(password, user.contraseña):
            return None
        return user

    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    async def register_user(self, usuario: UsuarioCreate) -> Usuario:
        """Registrar usuario con MongoDB/Beanie"""
        hashed_password = self.get_password_hash(usuario.contraseña)
        db_usuario = Usuario(
            nombre=usuario.nombre,
            apellido=usuario.apellido,
            email=usuario.email,
            username=usuario.username,
            contraseña=hashed_password,
            fecha_nacimiento=usuario.fecha_nacimiento,
            pais=usuario.pais,
            fecha_registro=datetime.now()
        )
        await db_usuario.insert()
        return db_usuario