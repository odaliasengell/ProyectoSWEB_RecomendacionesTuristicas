from beanie import Document
from pydantic import Field
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
    created_at: Optional[datetime] = Field(default_factory=datetime.now)

    class Settings:
        name = "tours"
        indexes = ["guia_id", "destino_id"]

    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Tour a la montaña",
                "duracion": "3 horas",
                "precio": 20.0,
                "guia_id": "1",
                "destino_id": "507f1f77bcf86cd799439011"
            }
        }
