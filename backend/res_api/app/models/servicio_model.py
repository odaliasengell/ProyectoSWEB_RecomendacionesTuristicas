from beanie import Document
from pydantic import Field
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
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)

    class Settings:
        name = "servicios"
        indexes = ["nombre", "categoria", "destino"]

    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Tour isla",
                "descripcion": "Recorrido por la isla",
                "precio": 45.5,
                "categoria": "tour",
                "destino": "Galápagos",
                "duracion_dias": 1,
                "capacidad_maxima": 20,
                "disponible": True
            }
        }
