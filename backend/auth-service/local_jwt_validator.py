"""
Módulo de validación local de JWT para otros servicios

Este módulo permite a otros servicios validar tokens JWT localmente
sin necesidad de consultar al Auth Service en cada petición.

USO:
1. Copiar este archivo a cada servicio que necesite validar tokens
2. Configurar JWT_SECRET_KEY y JWT_ALGORITHM (deben ser los mismos del Auth Service)
3. Usar las funciones validate_access_token() o get_current_user_from_token()

IMPORTANTE: 
- Todos los servicios deben usar la MISMA clave secreta (JWT_SECRET_KEY)
- La verificación es SOLO local (firma y expiración)
- Para verificar blacklist, se debe consultar al Auth Service (opcional)
"""

from typing import Optional, Dict, Any
import jwt
from datetime import datetime
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


# ============================================
# CONFIGURACIÓN (ajustar según tu entorno)
# ============================================
JWT_SECRET_KEY = "integracion-turismo-2026-uleam-jwt-secret-key-payment-service"
JWT_ALGORITHM = "HS256"
AUTH_SERVICE_URL = "http://localhost:8001"  # URL del Auth Service (para verificar blacklist)

# HTTPBearer para extraer token del header
security = HTTPBearer()


class TokenPayload:
    """Clase para representar el payload de un token"""
    def __init__(self, user_id: str, email: str, role: str, exp: int, iat: int, token_type: str):
        self.user_id = user_id
        self.email = email
        self.role = role
        self.exp = exp
        self.iat = iat
        self.token_type = token_type
    
    def is_expired(self) -> bool:
        """Verifica si el token expiró"""
        return datetime.utcnow().timestamp() > self.exp
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte a diccionario"""
        return {
            "user_id": self.user_id,
            "email": self.email,
            "role": self.role,
            "exp": self.exp,
            "iat": self.iat,
            "token_type": self.token_type
        }


def decode_token_local(token: str) -> TokenPayload:
    """
    Decodifica y valida un token JWT localmente
    
    Verifica:
    - Firma del token (usando la clave secreta compartida)
    - Expiración del token
    
    NO verifica:
    - Blacklist (tokens revocados) - para eso usar verify_token_with_auth_service()
    
    Args:
        token: Token JWT a validar
    
    Returns:
        TokenPayload con información del usuario
    
    Raises:
        HTTPException: Si el token es inválido o expiró
    """
    try:
        # Decodificar token con verificación de firma y expiración
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )
        
        # Crear objeto TokenPayload
        return TokenPayload(
            user_id=payload.get("user_id"),
            email=payload.get("email"),
            role=payload.get("role"),
            exp=payload.get("exp"),
            iat=payload.get("iat"),
            token_type=payload.get("type", "access")
        )
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def validate_access_token(token: str) -> TokenPayload:
    """
    Valida un access token localmente
    
    Solo valida firma y expiración. Para verificar blacklist,
    usar verify_token_with_auth_service()
    
    Args:
        token: Access token JWT
    
    Returns:
        TokenPayload con información del usuario
    
    Raises:
        HTTPException: Si el token es inválido
    """
    payload = decode_token_local(token)
    
    # Verificar que sea un access token
    if payload.token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Se requiere un access token"
        )
    
    return payload


async def get_current_user_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenPayload:
    """
    Dependency para FastAPI: Obtiene el usuario actual del token JWT
    
    Uso en endpoints:
        @app.get("/protected")
        async def protected_route(user: TokenPayload = Depends(get_current_user_from_token)):
            return {"message": f"Hello {user.email}!"}
    
    Args:
        credentials: Credenciales HTTP Bearer (automático con Depends)
    
    Returns:
        TokenPayload con información del usuario
    
    Raises:
        HTTPException: Si el token es inválido
    """
    token = credentials.credentials
    return validate_access_token(token)


def require_role(allowed_roles: list[str]):
    """
    Dependency para requerir roles específicos
    
    Uso:
        @app.get("/admin")
        async def admin_route(user: TokenPayload = Depends(require_role(["admin"]))):
            return {"message": "Admin access"}
    
    Args:
        allowed_roles: Lista de roles permitidos
    
    Returns:
        Dependency function
    """
    async def role_checker(user: TokenPayload = Depends(get_current_user_from_token)) -> TokenPayload:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Rol requerido: {', '.join(allowed_roles)}"
            )
        return user
    
    return role_checker


async def verify_token_with_auth_service(token: str) -> bool:
    """
    Verifica un token con el Auth Service (incluye verificación de blacklist)
    
    NOTA: Esta función hace una llamada HTTP al Auth Service.
    Úsala solo cuando necesites verificar si el token está en blacklist.
    Para verificación básica, usa validate_access_token() (más rápido).
    
    Args:
        token: Token a verificar
    
    Returns:
        True si el token es válido, False si no
    """
    import httpx
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AUTH_SERVICE_URL}/auth/validate",
                json={"token": token},
                timeout=5.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("valid", False)
            
            return False
            
    except Exception as e:
        # Si el Auth Service no está disponible, validar solo localmente
        print(f"Warning: No se pudo conectar al Auth Service: {e}")
        try:
            validate_access_token(token)
            return True
        except:
            return False


# ============================================
# EJEMPLO DE USO
# ============================================
"""
# En tu servicio FastAPI:

from local_jwt_validator import get_current_user_from_token, require_role, TokenPayload

app = FastAPI()

# Ruta protegida básica
@app.get("/protected")
async def protected_route(user: TokenPayload = Depends(get_current_user_from_token)):
    return {
        "message": f"Hello {user.email}!",
        "user_id": user.user_id,
        "role": user.role
    }

# Ruta que requiere rol específico
@app.get("/admin")
async def admin_route(user: TokenPayload = Depends(require_role(["admin"]))):
    return {"message": "Admin access granted"}

# Validación manual
from local_jwt_validator import validate_access_token

@app.get("/manual")
async def manual_validation(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Token not provided")
    
    token = auth_header.split(" ")[1]
    user = validate_access_token(token)
    
    return {"user_id": user.user_id, "email": user.email}
"""
