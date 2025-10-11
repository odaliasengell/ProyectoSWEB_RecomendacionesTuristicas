# Repositorio para Destinos
from sqlalchemy.orm import Session
from app.models.destino import Destino
from app.schemas.destino_schema import DestinoBase

def crear_destino(db: Session, destino: DestinoBase):
	nuevo = Destino(**destino.dict())
	db.add(nuevo)
	db.commit()
	db.refresh(nuevo)
	return nuevo

def obtener_destinos(db: Session):
	return db.query(Destino).all()
