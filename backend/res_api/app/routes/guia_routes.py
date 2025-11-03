"""
Rutas REST para Guías.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.guia_model import Guia
from ... import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete

router = APIRouter(prefix="/guias", tags=["guias"])


@router.get("/", response_model=List[Guia])
async def list_guias():
    return await api_controllers.listar_guias()


@router.get("/{id}", response_model=Guia)
async def get_guia(id: str):
    from ..controllers.base_controller import get_by_id
    guia = await get_by_id(Guia, id)
    if not guia:
        raise HTTPException(status_code=404, detail="Guía no encontrado")
    return guia


@router.post("/", response_model=Guia)
async def create_guia(payload: dict):
    return await api_controllers.crear_guia(payload) if hasattr(api_controllers, 'crear_guia') else await base_update(Guia, None, payload)


@router.put("/{id}", response_model=Guia)
async def update_guia(id: str, payload: dict):
    updated = await base_update(Guia, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Guía no encontrado")
    return updated


@router.delete("/{id}")
async def delete_guia(id: str):
    ok = await base_delete(Guia, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Guía no encontrado")
    return {"ok": True}
