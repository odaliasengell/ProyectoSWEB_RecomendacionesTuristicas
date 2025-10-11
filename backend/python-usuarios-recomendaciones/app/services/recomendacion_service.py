# Servicio para Recomendaciones
from sqlalchemy.orm import Session
from app.repositories import recomendacion_repo
from app.schemas.recomendacion_schema import RecomendacionBase

def registrar_recomendacion(db: Session, data: RecomendacionBase):
	return recomendacion_repo.crear_recomendacion(db, data)

def listar_recomendaciones(db: Session):
	return recomendacion_repo.obtener_recomendaciones(db)
