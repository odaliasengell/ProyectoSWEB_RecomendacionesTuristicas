"""
Rutas REST para Destinos.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.destino_model import Destino
import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete

router = APIRouter(prefix="/destinos", tags=["destinos"])


@router.get("/")
async def list_destinos():
    destinos = await api_controllers.listar_destinos()
    # Serializar con id incluido
    return [
        {
            "id": str(d.id),
            **d.model_dump(exclude={"id", "revision_id"}),
        }
        for d in destinos
    ]


@router.get("/{id}")
async def get_destino(id: str):
    destino = await api_controllers.obtener_destino_por_id(id)
    if not destino:
        raise HTTPException(status_code=404, detail="Destino no encontrado")
    # Serializar con id incluido
    return {
        "id": str(destino.id),
        **destino.model_dump(exclude={"id", "revision_id"}),
    }


@router.post("/")
async def create_destino(payload: dict):
    # Reutiliza el helper genérico
    destino = await api_controllers.crear_destino(payload) if hasattr(api_controllers, 'crear_destino') else await base_update(Destino, None, payload)
    return {
        "id": str(destino.id),
        **destino.model_dump(exclude={"id", "revision_id"}),
    }


@router.put("/{id}")
async def update_destino(id: str, payload: dict):
    updated = await base_update(Destino, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Destino no encontrado")
    return {
        "id": str(updated.id),
        **updated.model_dump(exclude={"id", "revision_id"}),
    }


@router.delete("/{id}")
async def delete_destino(id: str):
    ok = await base_delete(Destino, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Destino no encontrado")
    return {"ok": True}
