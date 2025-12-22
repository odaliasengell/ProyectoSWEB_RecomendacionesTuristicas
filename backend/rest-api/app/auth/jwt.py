"""
Funciones utilitarias para JWT con soporte para access y refresh tokens.
Implementa validación local, blacklist y seguridad.
"""
from datetime import datetime, timedelta
from jose import JWTError, jwt
from config import settings
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import hashlib

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Tokens de acceso cortos
REFRESH_TOKEN_EXPIRE_DAYS = 7     # Tokens de refresco más largos

security = HTTPBearer()


def _hash_token(token: str) -> str:
    """Hashear token para almacenamiento seguro."""
    return hashlib.sha256(token.encode()).hexdigest()


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Crear un token JWT de acceso de corta duración."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "type": "access"  # Marcar como access token
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: timedelta = None) -> str:
    """Crear un token JWT de refresco de larga duración."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "type": "refresh"  # Marcar como refresh token
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """
    Verificar y decodificar un token JWT.
    Retorna el payload si es válido, None si no.
    
    IMPORTANTE: Esta función SOLO verifica la firma y expiración.
    Para acciones críticas (logout, etc.), verificar también en blacklist.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


async def verify_access_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verificar que el token sea un access token válido.
    
    Args:
        credentials: Credenciales HTTP Bearer
        
    Returns:
        dict: Payload del token si es válido
        
    Raises:
        HTTPException: Si el token es inválido, expirado o no es access token
    """
    token = credentials.credentials
    
    # Verificar token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=401, 
            detail="Token inválido o expirado"
        )
    
    # Verificar que sea access token
    token_type = payload.get("type")
    if token_type != "access":
        raise HTTPException(
            status_code=401,
            detail="Token no válido para esta operación"
        )
    
    return payload


async def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verificar que el token JWT sea válido y pertenezca a un administrador.
    
    Args:
        credentials: Credenciales HTTP Bearer
        
    Returns:
        dict: Payload del token si es válido
        
    Raises:
        HTTPException: Si el token es inválido o no pertenece a un admin
    """
    token = credentials.credentials
    
    # Verificar token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=401, 
            detail="Token inválido o expirado"
        )
    
    # Verificar que el email sea de admin (admin@turismo.com)
    user_email = payload.get("sub")
    if user_email != "admin@turismo.com":
        raise HTTPException(
            status_code=403, 
            detail="No tienes permisos de administrador"
        )
    
    return payload
