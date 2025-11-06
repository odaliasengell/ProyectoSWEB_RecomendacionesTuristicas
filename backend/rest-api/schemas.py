"""
Esquemas / interfaces en Python usando Pydantic.
Contienen las definiciones de los DTOs que usaría la REST API.
Estas clases son independientes de la base de datos y sirven como contrato.
Alineados con los modelos del frontend TypeScript.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class Usuario(BaseModel):
    """
    Schema de Usuario alineado con frontend y modelo de BD
    Frontend: { id_usuario, nombre, email, contraseña, pais }
    BD: usa 'contrasena' (sin tilde)
    """
    id_usuario: int = Field(..., description="ID del usuario")
    nombre: str
    email: str
    contrasena: str = Field(..., alias='contraseña')  # Acepta ambos formatos
    pais: str
    
    class Config:
        populate_by_name = True  # Permite usar tanto 'contrasena' como 'contraseña'


class Destino(BaseModel):
    """
    Schema de Destino alineado con frontend
    Frontend: { id_destino, nombre, descripcion, ubicacion, ruta }
    """
    id_destino: int = Field(..., description="ID del destino")
    nombre: str
    descripcion: str
    ubicacion: str
    ruta: str


class Guia(BaseModel):
    """
    Schema de Guía alineado con frontend
    Frontend: { id_guia, nombre, idiomas, experiencia }
    """
    id_guia: int = Field(..., description="ID del guía")
    nombre: str
    idiomas: str
    experiencia: str


class Tour(BaseModel):
    """
    Schema de Tour alineado con frontend
    Frontend: { id_tour, nombre, duracion, precio }
    """
    id_tour: int = Field(..., description="ID del tour")
    nombre: str
    duracion: str
    precio: float


class Servicio(BaseModel):
    """
    Schema de Servicio alineado con frontend
    Frontend: { id_servicio, nombre, descripcion, precio }
    """
    id_servicio: int = Field(..., description="ID del servicio")
    nombre: str
    descripcion: str
    precio: float


class Recomendacion(BaseModel):
    """
    Schema de Recomendación alineado con frontend
    Frontend: { id_recomendacion, fecha, calificacion, comentario }
    """
    id_recomendacion: int = Field(..., description="ID de la recomendación")
    fecha: str = Field(..., description="ISO date")
    calificacion: int
    comentario: str


class Reserva(BaseModel):
    """
    Schema de Reserva alineado con frontend
    Frontend: { id_reserva, fecha_reserva, cantidad_personas }
    """
    id_reserva: int = Field(..., description="ID de la reserva")
    fecha_reserva: str = Field(..., description="ISO date")
    cantidad_personas: int


class ContratacionServicio(BaseModel):
    """
    Schema de ContratacionServicio alineado con frontend
    Frontend: { id_contratacion, fecha_contratacion }
    """
    id_contratacion: int = Field(..., description="ID de la contratación")
    fecha_contratacion: str = Field(..., description="ISO date")
