from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import date, datetime


class Recomendacion(Document):
    fecha: date = Field(default_factory=lambda: datetime.now().date())
    calificacion: int
    comentario: str
    id_usuario: str  # Referencia a Usuario por ObjectId como string

    # Referencias opcionales a tours o servicios
    id_tour: Optional[str] = None
    id_servicio: Optional[str] = None

    # Campos adicionales para mostrar info del tour/servicio
    tipo_recomendacion: Optional[str] = None
    nombre_referencia: Optional[str] = None

    class Settings:
        name = "recomendaciones"
        indexes = [
            "id_usuario",
            "id_tour",
            "id_servicio",
            "tipo_recomendacion",
            "fecha"
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "fecha": "2025-10-25",
                "calificacion": 5,
                "comentario": "Excelente destino turístico",
                "id_usuario": "507f1f77bcf86cd799439011",
                "id_tour": "507f1f77bcf86cd799439012",
                "tipo_recomendacion": "tour",
                "nombre_referencia": "Tour por las Islas Galápagos"
            }
        }
