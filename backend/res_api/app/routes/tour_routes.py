"""
Rutas REST para Tours.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.tour_model import Tour
from ... import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete

router = APIRouter(prefix="/tours", tags=["tours"])


@router.get("/", response_model=List[Tour])
async def list_tours():
    return await api_controllers.listar_tours()


@router.get("/{id}", response_model=Tour)
async def get_tour(id: str):
    # usamos el helper genérico
    from ..controllers.base_controller import get_by_id
    tour = await get_by_id(Tour, id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tour no encontrado")
    return tour


@router.post("/", response_model=Tour)
async def create_tour(payload: dict):
    return await api_controllers.crear_tour(payload) if hasattr(api_controllers, 'crear_tour') else await base_update(Tour, None, payload)


@router.put("/{id}", response_model=Tour)
async def update_tour(id: str, payload: dict):
    updated = await base_update(Tour, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Tour no encontrado")
    return updated


@router.delete("/{id}")
async def delete_tour(id: str):
    ok = await base_delete(Tour, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Tour no encontrado")
    return {"ok": True}
