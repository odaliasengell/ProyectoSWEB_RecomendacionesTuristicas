from pydantic import BaseModel
from datetime import date
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

class UsuarioResponse(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    email: str
    username: str
    fecha_nacimiento: Optional[date] = None
    pais: Optional[str] = None
    
    class Config:
        from_attributes = True
