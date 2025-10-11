# Repositorio para Recomendaciones
from sqlalchemy.orm import Session
from app.models.recomendacion import Recomendacion
from app.schemas.recomendacion_schema import RecomendacionBase

def crear_recomendacion(db: Session, recomendacion: RecomendacionBase):
	nueva = Recomendacion(**recomendacion.dict())
	db.add(nueva)
	db.commit()
	db.refresh(nueva)
	return nueva

def obtener_recomendaciones(db: Session):
	return db.query(Recomendacion).all()
