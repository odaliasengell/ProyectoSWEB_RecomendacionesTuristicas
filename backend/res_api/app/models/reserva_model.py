from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime


class Reserva(Document):
    tour_id: Optional[str] = None
    usuario_id: Optional[str] = None
    fecha_reserva: Optional[datetime] = Field(default_factory=datetime.now)
    cantidad_personas: Optional[int] = 1
    estado: Optional[str] = "pendiente"

    class Settings:
        name = "reservas"
        indexes = ["tour_id", "usuario_id", "fecha_reserva"]

    class Config:
        json_schema_extra = {
            "example": {
                "tour_id": "507f1f77bcf86cd799439012",
                "usuario_id": "507f1f77bcf86cd799439011",
                "fecha_reserva": "2025-11-03T10:00:00",
                "cantidad_personas": 2
            }
        }
