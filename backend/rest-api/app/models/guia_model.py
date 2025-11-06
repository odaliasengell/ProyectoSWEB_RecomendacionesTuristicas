from beanie import Document
from pydantic import Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class Guia(Document):
    id_guia: Optional[int] = Field(None, index=True)
    nombre: str
    email: Optional[str] = None
    telefono: Optional[str] = None
    idiomas: Optional[List[str]] = None
    experiencia: Optional[str] = None
    disponible: Optional[bool] = True
    calificacion: Optional[float] = 0.0
    created_at: Optional[datetime] = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    )

    class Settings:
        name = "guias"
        validate_on_save = False
        use_state_management = False
        use_revision = False
        use_enum_values = True
        indexes = ["id_guia", "email"]
