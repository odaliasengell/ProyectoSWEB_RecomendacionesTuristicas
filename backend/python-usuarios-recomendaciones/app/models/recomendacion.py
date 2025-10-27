from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import date
from bson import ObjectId

class Recomendacion(Document):
    fecha: date
    calificacion: int
    comentario: str
    id_usuario: str  # Referencia a Usuario por ObjectId como string

    class Settings:
        name = "recomendaciones"
        indexes = [
            "id_usuario",
            "fecha"
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "fecha": "2025-10-25",
                "calificacion": 5,
                "comentario": "Excelente destino turístico",
                "id_usuario": "507f1f77bcf86cd799439011"
            }
        }

