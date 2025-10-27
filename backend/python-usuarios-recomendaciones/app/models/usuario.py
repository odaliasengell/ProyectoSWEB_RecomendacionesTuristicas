from beanie import Document
from pydantic import Field, EmailStr
from typing import Optional
from datetime import date, datetime

class Usuario(Document):
    nombre: str
    apellido: str
    email: EmailStr = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    contraseña: str
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
                "contraseña": "hashed_password",
                "fecha_nacimiento": "1990-01-01",
                "pais": "Ecuador"
            }
        }
