"""
Rutas REST para Servicios.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.servicio_model import Servicio
import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete

router = APIRouter(prefix="/servicios", tags=["servicios"])


@router.get("/")
async def list_servicios():
    servicios = await api_controllers.listar_servicios()
    # Serializar con id incluido
    return [
        {
            "id": str(s.id),
            **s.model_dump(exclude={"id", "revision_id"}),
        }
        for s in servicios
    ]


@router.get("/{id}")
async def get_servicio(id: str):
    from ..controllers.base_controller import get_by_id
    servicio = await get_by_id(Servicio, id)
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    # Serializar con id incluido
    return {
        "id": str(servicio.id),
        **servicio.model_dump(exclude={"id", "revision_id"}),
    }


@router.post("/")
async def create_servicio(payload: dict):
    servicio = await api_controllers.crear_servicio(payload) if hasattr(api_controllers, 'crear_servicio') else await base_update(Servicio, None, payload)
    return {
        "id": str(servicio.id),
        **servicio.model_dump(exclude={"id", "revision_id"}),
    }


@router.put("/{id}")
async def update_servicio(id: str, payload: dict):
    updated = await base_update(Servicio, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return {
        "id": str(updated.id),
        **updated.model_dump(exclude={"id", "revision_id"}),
    }


@router.delete("/{id}")
async def delete_servicio(id: str):
    ok = await base_delete(Servicio, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return {"ok": True}
