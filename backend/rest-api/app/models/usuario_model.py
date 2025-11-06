from beanie import Document
from pydantic import Field, EmailStr, ConfigDict
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

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }
    )

    class Settings:
        name = "usuarios"
        validate_on_save = False
        use_state_management = False
        use_revision = False
        use_enum_values = True
