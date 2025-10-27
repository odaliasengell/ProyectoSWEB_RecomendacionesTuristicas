from beanie import Document
from pydantic import Field, EmailStr
from typing import Optional
from datetime import datetime

class Administrador(Document):
    nombre: str
    email: EmailStr = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    password: str
    activo: bool = True
    fecha_creacion: datetime = Field(default_factory=datetime.now)
    ultimo_acceso: Optional[datetime] = None

    class Settings:
        name = "administradores"