# Esquema Pydantic para Recomendacion
from pydantic import BaseModel
from typing import Optional
from datetime import date

class RecomendacionBase(BaseModel):
	fecha: Optional[date] = None
	calificacion: int
	comentario: Optional[str] = None
	id_usuario: str  # MongoDB usa string IDs
	
	# Referencias opcionales a tours o servicios
	id_tour: Optional[str] = None
	id_servicio: Optional[str] = None
	tipo_recomendacion: Optional[str] = None  # "tour" o "servicio"
	nombre_referencia: Optional[str] = None  # Nombre del tour/servicio

class RecomendacionCreate(RecomendacionBase):
	pass

class RecomendacionResponse(RecomendacionBase):
	id: str
	class Config:
		from_attributes = True
