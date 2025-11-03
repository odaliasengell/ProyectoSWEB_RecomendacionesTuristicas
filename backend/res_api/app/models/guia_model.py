from beanie import Document
from pydantic import Field
from typing import Optional, List
from datetime import datetime


class Guia(Document):
    id_guia: Optional[int] = Field(None, index=True)
    nombre: str
    email: Optional[str] = None
    idiomas: Optional[List[str]] = None
    experiencia: Optional[str] = None
    disponible: Optional[bool] = True
    calificacion: Optional[float] = 0.0
    created_at: Optional[datetime] = Field(default_factory=datetime.now)

    class Settings:
        name = "guias"
        indexes = ["id_guia", "email"]

    class Config:
        json_schema_extra = {
            "example": {
                "id_guia": 1,
                "nombre": "Carlos López",
                "email": "carlos@example.com",
                "idiomas": ["es", "en"],
                "experiencia": "10 años",
                "disponible": True
            }
        }
