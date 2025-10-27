from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime

class Destino(Document):
    nombre: str
    descripcion: str
    ubicacion: str
    ruta: Optional[str] = None
    provincia: Optional[str] = None
    ciudad: Optional[str] = None
    categoria: Optional[str] = None
    calificacion_promedio: float = 0.0
    activo: bool = True
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "destinos"
        indexes = [
            "nombre",
            "categoria",
            "provincia",
            "ciudad"
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Galápagos",
                "descripcion": "Islas únicas con vida silvestre endémica",
                "ubicacion": "Ecuador",
                "ruta": "/images/galapagos.jpg",
                "provincia": "Galápagos",
                "ciudad": "Puerto Baquerizo Moreno",
                "categoria": "Naturaleza",
                "calificacion_promedio": 4.8,
                "activo": True
            }
        }

