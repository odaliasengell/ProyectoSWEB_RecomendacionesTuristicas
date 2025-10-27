from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    email: str
    username: str
    contraseña: str
    fecha_nacimiento: Optional[date] = None
    pais: Optional[str] = None


class UsuarioCreate(UsuarioBase):
    """Esquema para crear un usuario (entrada en POST /auth/register)."""
    pass

class UsuarioUpdate(BaseModel):
    """Esquema para actualizar datos de usuario (todos los campos son opcionales)."""
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    pais: Optional[str] = None

class UsuarioResponse(BaseModel):
    id: str  # MongoDB usa ObjectId como string
    nombre: str
    apellido: str
    email: str
    username: str
    fecha_nacimiento: Optional[date] = None
    pais: Optional[str] = None
    fecha_registro: Optional[datetime] = None
    
    class Config:
        from_attributes = True
