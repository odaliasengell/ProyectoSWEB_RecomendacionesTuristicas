from beanie import Document
from pydantic import Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class Servicio(Document):
    nombre: str
    descripcion: Optional[str] = None
    precio: Optional[float] = 0.0
    categoria: Optional[str] = None
    destino: Optional[str] = None
    duracion_dias: Optional[int] = None
    capacidad_maxima: Optional[int] = None
    disponible: Optional[bool] = True
    proveedor: Optional[str] = None
    telefono_contacto: Optional[str] = None
    email_contacto: Optional[str] = None
    imagen_url: Optional[str] = None  # Campo para la URL de la imagen del servicio
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    )

    class Settings:
        name = "servicios"
        validate_on_save = False
        use_state_management = False
        use_revision = False
        use_enum_values = True
        indexes = ["nombre", "categoria", "destino"]
