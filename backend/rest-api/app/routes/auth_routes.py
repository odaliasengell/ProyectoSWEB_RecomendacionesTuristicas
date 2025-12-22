"""
Rutas dedicadas a autenticación con JWT, refresh tokens y validación.
Fase 2: Microservicio de autenticación completo.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from typing import Optional

from app.models.usuario_model import Usuario
from app.auth.jwt import (
    create_access_token, 
    create_refresh_token, 
    verify_token,
    verify_access_token
)
from app.controllers.auth_controller import (
    crear_refresh_token_en_db,
    verificar_refresh_token_en_db,
    revocar_token,
    está_token_revocado,
    obtener_usuario_por_token,
    validar_token_localmente
)
import controllers as api_controllers
from utils import verify_password, hash_password

router = APIRouter(prefix="/auth", tags=["autenticación"])
security = HTTPBearer()


# ==================== MODELOS ====================

class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # segundos
    user: dict


class RegisterRequest(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    username: str
    password: str
    fecha_nacimiento: Optional[str] = None
    pais: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class ValidateResponse(BaseModel):
    valid: bool
    user_id: str
    email: str
    iat: int
    exp: int


class MeResponse(BaseModel):
    id: str
    nombre: str
    apellido: Optional[str]
    email: str
    username: Optional[str]


class LogoutRequest(BaseModel):
    access_token: str


# ==================== ENDPOINTS ====================

@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login(credentials: LoginRequest):
    """
    Iniciar sesión con email/username y contraseña.
    Retorna access_token (corta duración) y refresh_token (larga duración).
    """
    # Buscar usuario por email o username
    usuario = await api_controllers.obtener_usuario_por_email(credentials.email)
    
    if not usuario:
        usuario = await api_controllers.obtener_usuario_por_username(credentials.email)
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    # Verificar contraseña
    if not verify_password(credentials.password, usuario.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    # Crear tokens
    access_token = create_access_token(
        data={"sub": usuario.email, "user_id": str(usuario.id)}
    )
    
    refresh_token = create_refresh_token(
        data={"sub": usuario.email, "user_id": str(usuario.id)}
    )
    
    # Guardar refresh token en BD
    await crear_refresh_token_en_db(str(usuario.id), usuario.email, refresh_token)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 15 * 60,  # 15 minutos en segundos
        "user": {
            "id": str(usuario.id),
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "email": usuario.email,
            "username": usuario.username
        }
    }


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: RegisterRequest):
    """
    Registrar un nuevo usuario y obtener tokens.
    """
    # Verificar si el email ya existe
    existing_user = await api_controllers.obtener_usuario_por_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Verificar si el username ya existe
    if user_data.username:
        existing_username = await api_controllers.obtener_usuario_por_username(user_data.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El username ya está en uso"
            )
    
    # Crear usuario
    payload = {
        "nombre": user_data.nombre,
        "apellido": user_data.apellido,
        "email": user_data.email,
        "username": user_data.username,
        "contrasena": hash_password(user_data.password),
        "fecha_nacimiento": user_data.fecha_nacimiento,
        "pais": user_data.pais
    }
    
    nuevo_usuario = await api_controllers.crear_usuario(payload)
    
    # Crear tokens
    access_token = create_access_token(
        data={"sub": nuevo_usuario.email, "user_id": str(nuevo_usuario.id)}
    )
    
    refresh_token = create_refresh_token(
        data={"sub": nuevo_usuario.email, "user_id": str(nuevo_usuario.id)}
    )
    
    # Guardar refresh token en BD
    await crear_refresh_token_en_db(str(nuevo_usuario.id), nuevo_usuario.email, refresh_token)
    
    return {
        "message": "Usuario registrado exitosamente",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 15 * 60,
        "user": {
            "id": str(nuevo_usuario.id),
            "nombre": nuevo_usuario.nombre,
            "apellido": nuevo_usuario.apellido,
            "email": nuevo_usuario.email,
            "username": nuevo_usuario.username
        }
    }


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh(request: RefreshTokenRequest):
    """
    Renovar access_token usando un refresh_token válido.
    El refresh_token debe estar en BD y no haber expirado.
    """
    # Verificar que el refresh token sea válido
    payload = verify_token(request.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido o expirado"
        )
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no válido para refresh"
        )
    
    # Verificar en BD que siga siendo válido
    is_valid = await verificar_refresh_token_en_db(request.refresh_token)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token no válido o revocado"
        )
    
    # Crear nuevo access token
    user_email = payload.get("sub")
    user_id = payload.get("user_id")
    
    new_access_token = create_access_token(
        data={"sub": user_email, "user_id": user_id}
    )
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": 15 * 60
    }


@router.post("/logout")
async def logout(
    request: LogoutRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Cerrar sesión revocando el access token.
    El token se agrega a la blacklist para que no pueda usarse de nuevo.
    """
    token = credentials.credentials
    
    # Verificar que el token sea válido
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    user_id = payload.get("user_id")
    user_email = payload.get("sub")
    
    # Revocar el token (agregarlo a blacklist)
    await revocar_token(token, user_id, user_email, razón="logout")
    
    return {"message": "Sesión cerrada exitosamente"}


@router.get("/validate", response_model=ValidateResponse)
async def validate_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    ENDPOINT INTERNO: Validar token localmente sin consultar BD.
    Verifica firma y expiración.
    Otros microservicios pueden llamar a este endpoint para validar tokens.
    """
    token = credentials.credentials
    
    # Validación local del token
    payload = await validar_token_localmente(token)
    
    return {
        "valid": True,
        "user_id": payload.get("user_id"),
        "email": payload.get("sub"),
        "iat": payload.get("iat", 0),
        "exp": payload.get("exp", 0)
    }


@router.get("/me", response_model=MeResponse)
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Obtener datos del usuario autenticado actual.
    """
    token = credentials.credentials
    
    usuario = await obtener_usuario_por_token(token)
    
    return {
        "id": str(usuario.id),
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "email": usuario.email,
        "username": usuario.username
    }
