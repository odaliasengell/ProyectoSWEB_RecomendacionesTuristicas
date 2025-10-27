# Servicio para Recomendaciones con MongoDB/Beanie
from app.models.recomendacion import Recomendacion
from app.schemas.recomendacion_schema import RecomendacionCreate
from typing import List

async def registrar_recomendacion(data: RecomendacionCreate) -> Recomendacion:
    """Crear recomendación en MongoDB"""
    nueva_recomendacion = Recomendacion(**data.dict())
    await nueva_recomendacion.insert()
    return nueva_recomendacion

async def listar_recomendaciones() -> List[Recomendacion]:
    """Obtener todas las recomendaciones de MongoDB"""
    return await Recomendacion.find_all().to_list()
