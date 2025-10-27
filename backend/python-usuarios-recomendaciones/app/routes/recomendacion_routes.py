from fastapi import APIRouter, HTTPException
from app.models.recomendacion import Recomendacion
from app.schemas.recomendacion_schema import RecomendacionCreate
from typing import List

router = APIRouter()

@router.get("/")
async def get_recomendaciones():
    """Obtener todas las recomendaciones"""
    recomendaciones = await Recomendacion.find_all().to_list()
    return recomendaciones

@router.post("/")
async def create_recomendacion(recomendacion: RecomendacionCreate):
    """Crear nueva recomendación"""
    nueva = Recomendacion(**recomendacion.dict())
    await nueva.insert()
    return nueva

@router.get("/{recomendacion_id}")
async def get_recomendacion(recomendacion_id: str):
    """Obtener recomendación por ID"""
    from beanie import PydanticObjectId
    recomendacion = await Recomendacion.get(PydanticObjectId(recomendacion_id))
    if not recomendacion:
        raise HTTPException(status_code=404, detail="Recomendación no encontrada")
    return recomendacion
