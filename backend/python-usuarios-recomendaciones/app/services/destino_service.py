# Servicio para Destinos
from sqlalchemy.orm import Session
from app.repositories import destino_repo
from app.schemas.destino_schema import DestinoBase

def registrar_destino(db: Session, data: DestinoBase):
	return destino_repo.crear_destino(db, data)

def listar_destinos(db: Session):
	return destino_repo.obtener_destinos(db)
