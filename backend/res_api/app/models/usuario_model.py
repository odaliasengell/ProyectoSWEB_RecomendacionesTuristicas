from beanie import Document
from pydantic import Field, EmailStr
from typing import Optional
from datetime import date, datetime


class Usuario(Document):
    nombre: str
    apellido: Optional[str] = None
    email: EmailStr = Field(..., unique=True, index=True)
    username: Optional[str] = Field(None, unique=True, index=True)
    contrasena: str
    fecha_nacimiento: Optional[date] = None
    pais: Optional[str] = None
    fecha_registro: Optional[datetime] = Field(default_factory=datetime.now)

    class Settings:
        name = "usuarios"

    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Juan",
                "apellido": "Pérez",
                "email": "juan@example.com",
                "username": "juanperez",
                "contrasena": "hashed_password",
                "fecha_nacimiento": "1990-01-01",
                "pais": "Ecuador"
            }
        }
