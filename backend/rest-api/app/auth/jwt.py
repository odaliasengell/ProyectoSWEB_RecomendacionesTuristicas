"""
Funciones utilitarias para JWT.
"""
from datetime import datetime, timedelta
from jose import JWTError, jwt
from config import settings
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Crear un token JWT con los datos proporcionados."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Verificar y decodificar un token JWT."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


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
