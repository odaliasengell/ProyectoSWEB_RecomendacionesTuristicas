"""
Rutas REST para Recomendaciones.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.recomendacion_model import Recomendacion
from ... import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete

router = APIRouter(prefix="/recomendaciones", tags=["recomendaciones"])


@router.get("/", response_model=List[Recomendacion])
async def list_recomendaciones():
    return await api_controllers.listar_recomendaciones()


@router.get("/{id}", response_model=Recomendacion)
async def get_recomendacion(id: str):
    from ..controllers.base_controller import get_by_id
    r = await get_by_id(Recomendacion, id)
    if not r:
        raise HTTPException(status_code=404, detail="Recomendación no encontrada")
    return r


@router.post("/", response_model=Recomendacion)
async def create_recomendacion(payload: dict):
    return await api_controllers.crear_recomendacion(payload)


@router.put("/{id}", response_model=Recomendacion)
async def update_recomendacion(id: str, payload: dict):
    updated = await base_update(Recomendacion, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Recomendación no encontrada")
    return updated


@router.delete("/{id}")
async def delete_recomendacion(id: str):
    ok = await base_delete(Recomendacion, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Recomendación no encontrada")
    return {"ok": True}
