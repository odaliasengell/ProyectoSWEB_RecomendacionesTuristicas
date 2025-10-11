# Esquema Pydantic para Recomendacion
from pydantic import BaseModel
from typing import Optional
from datetime import date

class RecomendacionBase(BaseModel):
	fecha: Optional[date] = None
	calificacion: int
	comentario: Optional[str] = None
	id_usuario: int

class RecomendacionResponse(RecomendacionBase):
	id_recomendacion: int
	class Config:
		from_attributes = True
