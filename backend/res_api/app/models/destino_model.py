from beanie import Document
from pydantic import Field
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

    class Settings:
        name = "destinos"
        validate_on_save = False
        use_state_management = False
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
