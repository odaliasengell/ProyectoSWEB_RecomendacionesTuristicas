from fastapi import APIRouter, HTTPException, Depends
from app.schemas.usuario_schema import UsuarioBase, UsuarioUpdate
from app.services import usuario_service
from app.models.usuario import Usuario
from beanie import PydanticObjectId
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

@router.post("/", response_model=dict)
async def crear_usuario(usuario: UsuarioBase):
    nuevo = await usuario_service.registrar_usuario(usuario)
    return {"mensaje": "Usuario registrado", "data": nuevo}

@router.get("/buscar-por-email", response_model=dict)
async def buscar_usuario_por_email(email: str):
    """Buscar usuario por email"""
    try:
        user = await Usuario.find_one(Usuario.email == email)
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
            "pais": user.pais
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al buscar usuario: {str(e)}")

@router.put("/{user_id}", response_model=dict)
async def actualizar_perfil(user_id: str, usuario_data: UsuarioUpdate):
    """Actualizar perfil de usuario"""
    try:
        print(f"📝 Usuario {user_id} está editando su perfil")
        print(f"   Datos a actualizar: {usuario_data.dict(exclude_unset=True)}")
        
        # Buscar usuario
        user = await Usuario.get(PydanticObjectId(user_id))
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Actualizar solo los campos proporcionados
        update_data = usuario_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(user, field) and value is not None:
                setattr(user, field, value)
        
        await user.save()
        
        print(f"✅ Perfil de usuario {user_id} actualizado exitosamente")
        
        return {
            "mensaje": "Perfil actualizado exitosamente",
            "data": {
                "id": str(user.id),
                "nombre": user.nombre,
                "apellido": user.apellido,
                "email": user.email,
                "username": user.username,
                "fecha_nacimiento": user.fecha_nacimiento.isoformat() if user.fecha_nacimiento else None,
                "pais": user.pais
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error al actualizar perfil: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al actualizar perfil: {str(e)}")


