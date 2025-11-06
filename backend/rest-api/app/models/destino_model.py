from beanie import Document
from pydantic import Field, ConfigDict
from typing import Optional
from datetime import datetime


class Destino(Document):
    nombre: str
    descripcion: Optional[str] = None
    ubicacion: Optional[str] = None
    ruta: Optional[str] = None
    provincia: Optional[str] = None
    ciudad: Optional[str] = None
    categoria: Optional[str] = None
    calificacion_promedio: Optional[float] = 0.0
    activo: Optional[bool] = True
    fecha_creacion: Optional[datetime] = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    )

    class Settings:
        name = "destinos"
        validate_on_save = False
        use_state_management = False
        use_revision = False
        use_enum_values = True
        indexes = [
            "nombre",
            "categoria",
            "provincia",
            "ciudad"
        ]

