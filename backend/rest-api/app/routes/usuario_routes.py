"""
Rutas REST para Usuarios.
Usan los controladores implementados en `controllers` y los helpers genéricos.
"""
from typing import List
from datetime import timedelta

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from ..models.usuario_model import Usuario
import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete
from ..auth.jwt import create_access_token, verify_token
from utils import verify_password
from ..websocket_client import notificar_usuario_registrado, notificar_usuario_inicio_sesion

router = APIRouter(prefix="/usuarios", tags=["usuarios"])
security = HTTPBearer()


# Modelos para login y registro
class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    nombre: str
    apellido: str
    email: str
    username: str
    password: str
    fecha_nacimiento: str = None
    pais: str = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Iniciar sesión con email o username y contraseña."""
    # Buscar usuario por email o username
    usuario = await api_controllers.obtener_usuario_por_email(credentials.email)
    
    # Si no se encuentra por email, intentar buscar por username
    if not usuario:
        usuario = await api_controllers.obtener_usuario_por_username(credentials.email)
    
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    # Verificar contraseña
    if not verify_password(credentials.password, usuario.contrasena):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    # Crear token JWT
    access_token = create_access_token(
        data={"sub": usuario.email, "user_id": str(usuario.id)}
    )
    
    # Notificar inicio de sesión vía WebSocket
    await notificar_usuario_inicio_sesion(
        usuario_id=str(usuario.id),
        nombre=f"{usuario.nombre} {usuario.apellido}",
        rol=usuario.rol if hasattr(usuario, 'rol') else "turista"
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(usuario.id),
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "email": usuario.email,
            "username": usuario.username
        }
    }


@router.post("/register", response_model=Usuario)
async def register(user_data: RegisterRequest):
    """Registrar un nuevo usuario."""
    # Verificar si el email ya existe
    existing_user = await api_controllers.obtener_usuario_por_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Verificar si el username ya existe
    if user_data.username:
        existing_username = await api_controllers.obtener_usuario_por_username(user_data.username)
        if existing_username:
            raise HTTPException(status_code=400, detail="El username ya está en uso")
    
    # Crear usuario
    payload = {
        "nombre": user_data.nombre,
        "apellido": user_data.apellido,
        "email": user_data.email,
        "username": user_data.username,
        "contrasena": user_data.password,  # Se hasheará en el controlador
        "fecha_nacimiento": user_data.fecha_nacimiento,
        "pais": user_data.pais
    }
    
    nuevo_usuario = await api_controllers.crear_usuario(payload)
    
    # Notificar registro vía WebSocket
    await notificar_usuario_registrado(
        usuario_id=str(nuevo_usuario.id),
        nombre=f"{nuevo_usuario.nombre} {nuevo_usuario.apellido}",
        email=nuevo_usuario.email,
        rol=nuevo_usuario.rol if hasattr(nuevo_usuario, 'rol') else "turista"
    )
    
    return nuevo_usuario


@router.get("/", response_model=List[Usuario])
async def list_usuarios():
    return await api_controllers.listar_usuarios()


@router.get("/{id}", response_model=Usuario)
async def get_usuario(id: str):
    usuario = await api_controllers.obtener_usuario_por_id(id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.post("/", response_model=Usuario)
async def create_usuario(payload: dict):
    return await api_controllers.crear_usuario(payload)


@router.put("/{id}", response_model=Usuario)
async def update_usuario(id: str, payload: dict):
    updated = await base_update(Usuario, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return updated


@router.delete("/{id}")
async def delete_usuario(id: str):
    ok = await base_delete(Usuario, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"ok": True}
