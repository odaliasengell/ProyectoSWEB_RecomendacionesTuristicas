from pydantic import BaseModel

class UsuarioBase(BaseModel):
    nombre: str
    email: str
    contraseña: str
    pais: str | None = None


class UsuarioCreate(UsuarioBase):
    """Esquema para crear un usuario (entrada en POST /auth/register)."""
    pass

class UsuarioResponse(UsuarioBase):
    id_usuario: int
    class Config:
        from_attributes = True
