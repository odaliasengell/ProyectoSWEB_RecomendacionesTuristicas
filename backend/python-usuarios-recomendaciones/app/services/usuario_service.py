from typing import List, Optional
from app.repositories import usuario_repo
from app.schemas.usuario_schema import UsuarioBase
from app.models.usuario import Usuario

async def registrar_usuario(data: UsuarioBase) -> Usuario:
    """Registrar un nuevo usuario"""
    return await usuario_repo.crear_usuario(data)

async def listar_usuarios() -> List[Usuario]:
    """Listar todos los usuarios"""
    return await usuario_repo.obtener_usuarios()

async def obtener_usuario(usuario_id: str) -> Optional[Usuario]:
    """Obtener un usuario por ID"""
    return await usuario_repo.obtener_usuario_por_id(usuario_id)

async def obtener_por_email(email: str) -> Optional[Usuario]:
    """Obtener un usuario por email"""
    return await usuario_repo.obtener_usuario_por_email(email)

async def obtener_por_username(username: str) -> Optional[Usuario]:
    """Obtener un usuario por username"""
    return await usuario_repo.obtener_usuario_por_username(username)

async def actualizar_usuario(usuario_id: str, datos: dict) -> Optional[Usuario]:
    """Actualizar un usuario"""
    return await usuario_repo.actualizar_usuario(usuario_id, datos)

async def eliminar_usuario(usuario_id: str) -> bool:
    """Eliminar un usuario"""
    return await usuario_repo.eliminar_usuario(usuario_id)

