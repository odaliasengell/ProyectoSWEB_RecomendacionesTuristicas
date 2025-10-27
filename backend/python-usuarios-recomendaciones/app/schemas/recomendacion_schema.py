# Esquema Pydantic para Recomendacion
from pydantic import BaseModel
from typing import Optional
from datetime import date

class RecomendacionBase(BaseModel):
	fecha: Optional[date] = None
	calificacion: int
	comentario: Optional[str] = None
	id_usuario: str  # MongoDB usa string IDs

class RecomendacionCreate(RecomendacionBase):
	pass

class RecomendacionResponse(RecomendacionBase):
	id: str
	class Config:
		from_attributes = True
