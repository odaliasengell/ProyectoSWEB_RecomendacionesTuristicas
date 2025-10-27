from typing import List, Optional
from app.models.usuario import Usuario
from app.schemas.usuario_schema import UsuarioBase
from beanie import PydanticObjectId

async def crear_usuario(usuario: UsuarioBase) -> Usuario:
    """Crear un nuevo usuario en MongoDB"""
    nuevo = Usuario(**usuario.dict())
    await nuevo.insert()
    return nuevo

async def obtener_usuarios() -> List[Usuario]:
    """Obtener todos los usuarios"""
    return await Usuario.find_all().to_list()

async def obtener_usuario_por_id(usuario_id: str) -> Optional[Usuario]:
    """Obtener un usuario por su ID"""
    return await Usuario.get(PydanticObjectId(usuario_id))

async def obtener_usuario_por_email(email: str) -> Optional[Usuario]:
    """Obtener un usuario por su email"""
    return await Usuario.find_one(Usuario.email == email)

async def obtener_usuario_por_username(username: str) -> Optional[Usuario]:
    """Obtener un usuario por su username"""
    return await Usuario.find_one(Usuario.username == username)

async def actualizar_usuario(usuario_id: str, datos: dict) -> Optional[Usuario]:
    """Actualizar un usuario"""
    usuario = await Usuario.get(PydanticObjectId(usuario_id))
    if usuario:
        await usuario.set(datos)
    return usuario

async def eliminar_usuario(usuario_id: str) -> bool:
    """Eliminar un usuario"""
    usuario = await Usuario.get(PydanticObjectId(usuario_id))
    if usuario:
        await usuario.delete()
        return True
    return False

