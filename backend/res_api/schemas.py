"""
Esquemas / interfaces en Python usando Pydantic.
Contienen las definiciones de los DTOs que usaría la REST API.
Estas clases son independientes de la base de datos y sirven como contrato.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


class Destino(BaseModel):
    id_destino: Optional[int] = Field(None, description="ID del destino")
    nombre: str
    descripcion: Optional[str] = None
    ubicacion: Optional[str] = None
    ruta: Optional[str] = None


class Usuario(BaseModel):
    id_usuario: Optional[int] = Field(None, description="ID del usuario")
    nombre: str
    email: str
    contrasena: Optional[str] = None
    pais: Optional[str] = None


class Tour(BaseModel):
    id_tour: Optional[int] = Field(None, description="ID del tour")
    nombre: str
    duracion: Optional[str] = None
    precio: Optional[float] = None


class Servicio(BaseModel):
    id_servicio: Optional[int] = Field(None, description="ID del servicio")
    nombre: str
    descripcion: Optional[str] = None
    precio: Optional[float] = None


class Guia(BaseModel):
    id_guia: Optional[int] = Field(None, description="ID del guía")
    nombre: str
    idiomas: Optional[List[str]] = None
    experiencia: Optional[str] = None


class Reserva(BaseModel):
    id_reserva: Optional[int] = Field(None, description="ID de la reserva")
    fecha_reserva: Optional[date] = None
    cantidad_personas: Optional[int] = None


class Recomendacion(BaseModel):
    id_recomendacion: Optional[int] = Field(None, description="ID de la recomendación")
    fecha: Optional[date] = None
    calificacion: Optional[int] = None
    comentario: Optional[str] = None


class ContratacionServicio(BaseModel):
    id_contratacion: Optional[int] = Field(None, description="ID de la contratación")
    fecha_contratacion: Optional[date] = None
