from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
import bcrypt
from config import get_settings
from models import User, RefreshToken, RevokedToken

settings = get_settings()


class JWTService:
    """Servicio para manejo de JWT (Access y Refresh tokens)"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Genera hash de contraseña usando bcrypt"""
        salt = bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifica contraseña contra hash"""
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Crea un access token JWT de corta duración
        
        Args:
            data: Datos a incluir en el token (user_id, email, role)
            expires_delta: Tiempo de expiración (por defecto 15 minutos)
        
        Returns:
            Token JWT firmado
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        """
        Crea un refresh token JWT de larga duración
        
        Args:
            data: Datos a incluir en el token (user_id)
        
        Returns:
            Refresh token JWT firmado
        """
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> Dict[str, Any]:
        """
        Decodifica y valida un token JWT
        
        Args:
            token: Token JWT a decodificar
        
        Returns:
            Payload del token decodificado
        
        Raises:
            jwt.ExpiredSignatureError: Token expirado
            jwt.InvalidTokenError: Token inválido
        """
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise jwt.ExpiredSignatureError("Token expirado")
        except jwt.InvalidTokenError:
            raise jwt.InvalidTokenError("Token inválido")
    
    @staticmethod
    async def is_token_revoked(token: str) -> bool:
        """
        Verifica si un token está en la blacklist
        
        Args:
            token: Token a verificar
        
        Returns:
            True si está revocado, False si no
        """
        revoked = await RevokedToken.find_one(RevokedToken.token == token)
        return revoked is not None
    
    @staticmethod
    async def revoke_token(token: str, user_id: str, reason: Optional[str] = None):
        """
        Agrega un token a la blacklist
        
        Args:
            token: Token a revocar
            user_id: ID del usuario
            reason: Razón de la revocación
        """
        try:
            # Decodificar para obtener expiración
            payload = JWTService.decode_token(token)
            expires_at = datetime.fromtimestamp(payload['exp'])
            
            # Crear entrada en blacklist
            revoked_token = RevokedToken(
                token=token,
                user_id=user_id,
                expires_at=expires_at,
                reason=reason
            )
            await revoked_token.insert()
            
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            # Si el token ya expiró, no es necesario agregarlo a blacklist
            pass
    
    @staticmethod
    async def save_refresh_token(user_id: str, token: str):
        """
        Guarda un refresh token en la base de datos
        
        Args:
            user_id: ID del usuario
            token: Refresh token a guardar
        """
        try:
            payload = JWTService.decode_token(token)
            expires_at = datetime.fromtimestamp(payload['exp'])
            
            refresh_token = RefreshToken(
                user_id=user_id,
                token=token,
                expires_at=expires_at
            )
            await refresh_token.insert()
            
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
            raise ValueError(f"Error al guardar refresh token: {str(e)}")
    
    @staticmethod
    async def validate_refresh_token(token: str) -> Optional[RefreshToken]:
        """
        Valida un refresh token
        
        Args:
            token: Refresh token a validar
        
        Returns:
            RefreshToken si es válido, None si no
        """
        # Buscar en la base de datos
        refresh_token = await RefreshToken.find_one(RefreshToken.token == token)
        
        if not refresh_token:
            return None
        
        # Verificar si está revocado
        if refresh_token.is_revoked:
            return None
        
        # Verificar si expiró
        if refresh_token.expires_at < datetime.utcnow():
            return None
        
        return refresh_token
    
    @staticmethod
    async def cleanup_expired_tokens():
        """
        Limpia tokens expirados de la base de datos
        Debe ejecutarse periódicamente (ej. con un cron job)
        """
        now = datetime.utcnow()
        
        # Eliminar refresh tokens expirados
        await RefreshToken.find(RefreshToken.expires_at < now).delete()
        
        # Eliminar tokens revocados que ya expiraron
        await RevokedToken.find(RevokedToken.expires_at < now).delete()
