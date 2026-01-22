from fastapi import APIRouter, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from datetime import timedelta
import jwt

from models import User, RefreshToken
from schemas import (
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    LogoutRequest,
    ValidateTokenRequest,
    AuthResponse,
    UserResponse,
    TokenValidationResponse
)
from jwt_service import JWTService
from config import get_settings

settings = get_settings()

# Configurar rate limiter
limiter = Limiter(key_func=get_remote_address)

# Crear router
auth_router = APIRouter()


@auth_router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    """
    Registrar un nuevo usuario
    
    - Valida email único
    - Hashea la contraseña
    - Crea access y refresh tokens
    """
    # Verificar si el email ya existe
    existing_user = await User.find_one(User.email == request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Hashear contraseña
    password_hash = JWTService.hash_password(request.password)
    
    # Crear usuario
    user = User(
        email=request.email,
        password_hash=password_hash,
        full_name=request.full_name,
        role=request.role
    )
    await user.insert()
    
    # Generar tokens
    access_token = JWTService.create_access_token(
        data={
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role.value
        }
    )
    
    refresh_token = JWTService.create_refresh_token(
        data={"user_id": str(user.id)}
    )
    
    # Guardar refresh token
    await JWTService.save_refresh_token(str(user.id), refresh_token)
    
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active
        )
    )


@auth_router.post("/login", response_model=AuthResponse)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def login(request: Request, login_data: LoginRequest):
    """
    Iniciar sesión
    
    - Valida credenciales
    - Genera access y refresh tokens
    - Rate limited: 5 intentos por minuto
    """
    # Buscar usuario por email
    user = await User.find_one(User.email == login_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    
    # Verificar contraseña
    if not JWTService.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    
    # Verificar si está activo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario desactivado"
        )
    
    # Generar tokens
    access_token = JWTService.create_access_token(
        data={
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role.value
        }
    )
    
    refresh_token = JWTService.create_refresh_token(
        data={"user_id": str(user.id)}
    )
    
    # Guardar refresh token
    await JWTService.save_refresh_token(str(user.id), refresh_token)
    
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active
        )
    )


@auth_router.post("/refresh", response_model=AuthResponse)
async def refresh_access_token(request: RefreshTokenRequest):
    """
    Renovar access token usando refresh token
    
    - Valida refresh token
    - Genera nuevo access token
    - El refresh token sigue siendo válido
    """
    # Validar refresh token
    refresh_token_doc = await JWTService.validate_refresh_token(request.refresh_token)
    if not refresh_token_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido o expirado"
        )
    
    # Buscar usuario
    user = await User.get(refresh_token_doc.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo"
        )
    
    # Generar nuevo access token
    access_token = JWTService.create_access_token(
        data={
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role.value
        }
    )
    
    return AuthResponse(
        access_token=access_token,
        refresh_token=request.refresh_token,  # El mismo refresh token sigue válido
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active
        )
    )


@auth_router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(request: LogoutRequest):
    """
    Cerrar sesión
    
    - Revoca access token
    - Opcionalmente revoca refresh token
    - Agrega tokens a blacklist
    """
    try:
        # Decodificar access token para obtener user_id
        payload = JWTService.decode_token(request.access_token)
        user_id = payload.get("user_id")
        
        # Revocar access token
        await JWTService.revoke_token(
            request.access_token,
            user_id,
            reason="User logout"
        )
        
        # Revocar refresh token si se proporciona
        if request.refresh_token:
            # Marcar refresh token como revocado en la BD
            refresh_token_doc = await RefreshToken.find_one(
                RefreshToken.token == request.refresh_token
            )
            if refresh_token_doc:
                refresh_token_doc.is_revoked = True
                await refresh_token_doc.save()
        
        return {"message": "Sesión cerrada exitosamente"}
        
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido"
        )


@auth_router.post("/validate", response_model=TokenValidationResponse)
async def validate_token(request: ValidateTokenRequest):
    """
    Validar un token JWT
    
    - Verifica firma y expiración
    - Verifica blacklist
    - Retorna información del usuario
    
    Este endpoint permite a otros servicios validar tokens
    """
    try:
        # Decodificar token
        payload = JWTService.decode_token(request.token)
        
        # Verificar si está en blacklist
        is_revoked = await JWTService.is_token_revoked(request.token)
        if is_revoked:
            return TokenValidationResponse(
                valid=False,
                error="Token revocado"
            )
        
        # Token válido
        return TokenValidationResponse(
            valid=True,
            user_id=payload.get("user_id"),
            email=payload.get("email"),
            role=payload.get("role")
        )
        
    except jwt.ExpiredSignatureError:
        return TokenValidationResponse(
            valid=False,
            error="Token expirado"
        )
    except jwt.InvalidTokenError:
        return TokenValidationResponse(
            valid=False,
            error="Token inválido"
        )


@auth_router.get("/me", response_model=UserResponse)
async def get_current_user(request: Request):
    """
    Obtener información del usuario actual
    
    Requiere access token válido en header: Authorization: Bearer <token>
    """
    # Obtener token del header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no proporcionado"
        )
    
    token = auth_header.split(" ")[1]
    
    try:
        # Decodificar token
        payload = JWTService.decode_token(token)
        
        # Verificar blacklist
        is_revoked = await JWTService.is_token_revoked(token)
        if is_revoked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token revocado"
            )
        
        # Buscar usuario
        user = await User.get(payload.get("user_id"))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        return UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active
        )
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
