from beanie import Document
from pydantic import Field, ConfigDict
from typing import Optional
from datetime import date, datetime


class Recomendacion(Document):
    fecha: date = Field(default_factory=lambda: datetime.now().date())
    calificacion: int
    comentario: str
    id_usuario: str  # Referencia a Usuario por ObjectId como string

    # Referencias opcionales solo a tours o servicios (NO destinos)
    id_tour: Optional[str] = None
    id_servicio: Optional[str] = None

    # Campos adicionales para mostrar info del tour/servicio
    tipo_recomendacion: Optional[str] = None  # 'tour' o 'servicio' únicamente
    nombre_referencia: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }
    )

    class Settings:
        name = "recomendaciones"
        validate_on_save = False
        use_state_management = False
        use_revision = False
        use_enum_values = True
        indexes = [
            "id_usuario",
            "id_tour",
            "id_servicio",
            "tipo_recomendacion",
            "fecha"
        ]
