from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.models.usuario import Usuario
from app.models.administrador import Administrador
from app.models.destino import Destino
from app.models.recomendacion import Recomendacion
from typing import List
import jwt

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/auth/token")

SECRET_KEY = "tu-clave-secreta-super-segura-123"
ALGORITHM = "HS256"

async def get_current_admin(token: str = Depends(oauth2_scheme)):
    """Verificar token JWT del administrador"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

@router.get("/panel/users")
async def get_all_users(admin: str = Depends(get_current_admin)):
    """Obtener todos los usuarios"""
    users = await Usuario.find_all().to_list()
    return [
        {
            "id": str(user.id),
            "id_usuario": str(user.id),  # Agregar id_usuario para compatibilidad
            "nombre": user.nombre,
            "apellido": user.apellido,
            "email": user.email,
            "username": user.username,
            "fecha_nacimiento": user.fecha_nacimiento.isoformat() if user.fecha_nacimiento else None,
            "pais": user.pais,
            "fecha_registro": user.fecha_registro.isoformat() if user.fecha_registro else None
        }
        for user in users
    ]

@router.get("/panel/users/{user_id}")
async def get_user(user_id: str, admin: str = Depends(get_current_admin)):
    """Obtener un usuario específico"""
    from beanie import PydanticObjectId
    try:
        user = await Usuario.get(PydanticObjectId(user_id))
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {
            "id": str(user.id),
            "id_usuario": str(user.id),
            "nombre": user.nombre,
            "apellido": user.apellido,
            "email": user.email,
            "username": user.username,
            "fecha_nacimiento": user.fecha_nacimiento.isoformat() if user.fecha_nacimiento else None,
            "pais": user.pais,
            "fecha_registro": user.fecha_registro.isoformat() if user.fecha_registro else None
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ID inválido: {str(e)}")

@router.delete("/panel/users/{user_id}")
async def delete_user(user_id: str, admin: str = Depends(get_current_admin)):
    """Eliminar un usuario"""
    from beanie import PydanticObjectId
    try:
        user = await Usuario.get(PydanticObjectId(user_id))
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        await user.delete()
        return {"message": "Usuario eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar: {str(e)}")

@router.get("/panel/stats")
async def get_stats(admin: str = Depends(get_current_admin)):
    """Obtener estadísticas del panel"""
    total_users = await Usuario.find_all().count()
    total_destinos = await Destino.find_all().count()
    total_recomendaciones = await Recomendacion.find_all().count()
    
    return {
        "total_usuarios": total_users,
        "total_destinos": total_destinos,
        "total_recomendaciones": total_recomendaciones,
        "usuarios_activos": total_users
    }