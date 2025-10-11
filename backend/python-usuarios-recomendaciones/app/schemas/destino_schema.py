# Esquema Pydantic para Destino
from pydantic import BaseModel
from typing import Optional

class DestinoBase(BaseModel):
	nombre: str
	descripcion: Optional[str] = None
	ubicacion: Optional[str] = None
	ruta: Optional[str] = None

class DestinoResponse(DestinoBase):
	id_destino: int
	class Config:
		from_attributes = True
