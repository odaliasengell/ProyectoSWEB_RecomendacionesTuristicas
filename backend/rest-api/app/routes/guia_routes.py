"""
Rutas REST para Guías.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.guia_model import Guia
import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete

router = APIRouter(prefix="/guias", tags=["guias"])


@router.get("/")
async def list_guias():
    guias = await api_controllers.listar_guias()
    # Serializar con id incluido
    return [
        {
            "id": str(g.id),
            **g.model_dump(exclude={"id", "revision_id"}),
        }
        for g in guias
    ]


@router.get("/{id}")
async def get_guia(id: str):
    from ..controllers.base_controller import get_by_id
    guia = await get_by_id(Guia, id)
    if not guia:
        raise HTTPException(status_code=404, detail="Guía no encontrado")
    # Serializar con id incluido
    return {
        "id": str(guia.id),
        **guia.model_dump(exclude={"id", "revision_id"}),
    }


@router.post("/")
async def create_guia(payload: dict):
    guia = await api_controllers.crear_guia(payload) if hasattr(api_controllers, 'crear_guia') else await base_update(Guia, None, payload)
    return {
        "id": str(guia.id),
        **guia.model_dump(exclude={"id", "revision_id"}),
    }


@router.put("/{id}")
async def update_guia(id: str, payload: dict):
    updated = await base_update(Guia, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Guía no encontrado")
    return {
        "id": str(updated.id),
        **updated.model_dump(exclude={"id", "revision_id"}),
    }


@router.delete("/{id}")
async def delete_guia(id: str):
    ok = await base_delete(Guia, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Guía no encontrado")
    return {"ok": True}
