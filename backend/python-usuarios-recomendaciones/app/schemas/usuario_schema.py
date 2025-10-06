from pydantic import BaseModel

class UsuarioBase(BaseModel):
    nombre: str
    email: str
    contraseña: str
    pais: str | None = None

class UsuarioResponse(UsuarioBase):
    id_usuario: int
    class Config:
        from_attributes = True
