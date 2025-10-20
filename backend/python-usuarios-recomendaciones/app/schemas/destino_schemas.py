from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DestinoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    provincia: Optional[str] = None
    ciudad: Optional[str] = None
    direccion: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    categoria: Optional[str] = None
    imagen_url: Optional[str] = None
    sitio_web: Optional[str] = None
    activo: Optional[bool] = True

class DestinoCreate(DestinoBase):
    pass

class DestinoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    provincia: Optional[str] = None
    ciudad: Optional[str] = None
    direccion: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    categoria: Optional[str] = None
    imagen_url: Optional[str] = None
    sitio_web: Optional[str] = None
    activo: Optional[bool] = None

class DestinoResponse(BaseModel):
    id_destino: int
    nombre: str
    descripcion: Optional[str] = None
    ubicacion: Optional[str] = None
    ruta: Optional[str] = None
    provincia: Optional[str] = None
    ciudad: Optional[str] = None
    categoria: Optional[str] = None
    calificacion_promedio: Optional[float] = 0.0
    activo: Optional[bool] = True
    fecha_creacion: Optional[str] = None  # Cambiado a string

    class Config:
        from_attributes = True