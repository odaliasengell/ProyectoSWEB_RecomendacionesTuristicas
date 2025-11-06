from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime


class ContratacionServicio(Document):
    servicio_id: Optional[str] = None
    usuario_id: Optional[str] = None
    fecha_contratacion: Optional[datetime] = Field(default_factory=datetime.now)
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    cantidad_personas: Optional[int] = 1
    total: Optional[float] = 0.0
    
    # Campos adicionales para información de contacto
    cliente_nombre: Optional[str] = None
    cliente_email: Optional[str] = None
    cliente_telefono: Optional[str] = None
    notas: Optional[str] = None
    estado: Optional[str] = "pendiente"

    class Settings:
        name = "contrataciones"
        indexes = ["servicio_id", "usuario_id", "fecha_contratacion"]

    class Config:
        json_schema_extra = {
            "example": {
                "servicio_id": "507f1f77bcf86cd799439013",
                "usuario_id": "507f1f77bcf86cd799439011",
                "fecha_contratacion": "2025-10-30T12:00:00",
                "cantidad_personas": 2,
                "total": 90.0
            }
        }
