from beanie import Document
from pydantic import Field, ConfigDict
from typing import Optional
from datetime import datetime


class Reserva(Document):
    tour_id: Optional[str] = None
    usuario_id: Optional[str] = None
    fecha_reserva: Optional[datetime] = Field(default_factory=datetime.now)
    cantidad_personas: Optional[int] = 1
    estado: Optional[str] = "pendiente"
    precio_total: Optional[float] = 0.0
    comentarios: Optional[str] = None
    notas: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    )

    class Settings:
        name = "reservas"
        validate_on_save = False
        use_state_management = False
        use_revision = False
        use_enum_values = True
        indexes = ["tour_id", "usuario_id", "fecha_reserva"]
