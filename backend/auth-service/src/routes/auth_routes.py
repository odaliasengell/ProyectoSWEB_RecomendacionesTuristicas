"""
Rutas de autenticación para Auth Service
Autor: Odalis Senge
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Header
from typing import Optional
from src.models.user import UserCreate, UserLogin, UserResponse
from src.models.token import TokenResponse, TokenRefresh
from src.services.auth_service import AuthService
from src.middleware.rate_limiter import check_rate_limit

router = APIRouter()


def get_auth_service():
    """Dependency para obtener AuthService"""
    return AuthService()


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(
    user_data: UserCreate,
    request: Request,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Registrar nuevo usuario
    
    - **email**: Email del usuario (único)
    - **password**: Contraseña (mínimo 8 caracteres)
    - **nombre**: Nombre del usuario
    - **apellido**: Apellido (opcional)
    - **rol**: Rol del usuario (user, admin, guia)
    """
    # Rate limiting
    await check_rate_limit(request, "/auth/register")
    
    try:
        user = await auth_service.register_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar usuario: {str(e)}")


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    request: Request,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Iniciar sesión
    
    - **email**: Email del usuario
    - **password**: Contraseña
    
    Retorna access_token y refresh_token
    """
    # Rate limiting
    await check_rate_limit(request, "/auth/login")
    
    try:
        tokens = await auth_service.login_user(credentials)
        return tokens
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al iniciar sesión: {str(e)}")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    token_data: TokenRefresh,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Renovar access token usando refresh token
    
    - **refresh_token**: Refresh token válido
    
    Retorna nuevo access_token (el refresh_token se mantiene)
    """
    try:
        tokens = await auth_service.refresh_access_token(token_data.refresh_token)
        return tokens
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al renovar token: {str(e)}")


@router.post("/logout")
async def logout(
    refresh_token: str,
    authorization: Optional[str] = Header(None),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Cerrar sesión y revocar tokens
    
    - **Authorization**: Bearer token en header
    - **refresh_token**: Refresh token en body
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no proporcionado")
    
    access_token = authorization.split(" ")[1]
    
    try:
        success = await auth_service.logout_user(access_token, refresh_token)
        if success:
            return {"message": "Sesión cerrada exitosamente"}
        else:
            raise HTTPException(status_code=400, detail="Error al cerrar sesión")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cerrar sesión: {str(e)}")


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    authorization: Optional[str] = Header(None),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Obtener información del usuario autenticado
    
    - **Authorization**: Bearer token en header
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no proporcionado")
    
    token = authorization.split(" ")[1]
    
    try:
        user = await auth_service.get_current_user(token)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener usuario: {str(e)}")


@router.get("/validate")
async def validate_token(
    authorization: Optional[str] = Header(None),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Validar token (endpoint interno para otros microservicios)
    
    - **Authorization**: Bearer token en header
    
    Retorna información del usuario si el token es válido
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no proporcionado")
    
    token = authorization.split(" ")[1]
    
    try:
        is_valid = await auth_service.validate_token(token)
        if not is_valid:
            raise HTTPException(status_code=401, detail="Token inválido o revocado")
        
        # Obtener información del usuario
        user = await auth_service.get_current_user(token)
        
        return {
            "valid": True,
            "user": user
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
