from beanie import Document
from pydantic import Field, ConfigDict, field_validator
from typing import Optional
from datetime import datetime


class Tour(Document):
    nombre: str
    duracion: Optional[str] = None
    precio: Optional[float] = 0.0
    guia_id: Optional[str] = None
    destino_id: Optional[str] = None
    descripcion: Optional[str] = None
    capacidad_maxima: Optional[int] = None
    disponible: Optional[bool] = True
    imagen_url: Optional[str] = None  # Campo para la URL de la imagen del tour
    created_at: Optional[datetime] = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    )

    class Settings:
        name = "tours"
        validate_on_save = False
        use_state_management = False
        use_revision = False
        use_enum_values = True
        indexes = ["guia_id", "destino_id"]
