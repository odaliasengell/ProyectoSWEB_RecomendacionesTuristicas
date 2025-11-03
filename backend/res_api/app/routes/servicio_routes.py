"""
Rutas REST para Servicios.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.servicio_model import Servicio
from ... import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete

router = APIRouter(prefix="/servicios", tags=["servicios"])


@router.get("/", response_model=List[Servicio])
async def list_servicios():
    return await api_controllers.listar_servicios()


@router.get("/{id}", response_model=Servicio)
async def get_servicio(id: str):
    from ..controllers.base_controller import get_by_id
    servicio = await get_by_id(Servicio, id)
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio


@router.post("/", response_model=Servicio)
async def create_servicio(payload: dict):
    return await api_controllers.crear_servicio(payload) if hasattr(api_controllers, 'crear_servicio') else await base_update(Servicio, None, payload)


@router.put("/{id}", response_model=Servicio)
async def update_servicio(id: str, payload: dict):
    updated = await base_update(Servicio, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return updated


@router.delete("/{id}")
async def delete_servicio(id: str):
    ok = await base_delete(Servicio, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return {"ok": True}
