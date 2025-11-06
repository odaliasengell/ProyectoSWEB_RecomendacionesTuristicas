"""
Rutas REST para Reservas.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.reserva_model import Reserva
import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete

router = APIRouter(prefix="/reservas", tags=["reservas"])


@router.get("/")
async def list_reservas():
    reservas = await api_controllers.listar_reservas()
    # Serializar con id incluido
    return [
        {
            "id": str(r.id),
            **r.model_dump(exclude={"id", "revision_id"}),
        }
        for r in reservas
    ]


@router.get("/{id}")
async def get_reserva(id: str):
    from ..controllers.base_controller import get_by_id
    reserva = await get_by_id(Reserva, id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    # Serializar con id incluido
    return {
        "id": str(reserva.id),
        **reserva.model_dump(exclude={"id", "revision_id"}),
    }


@router.post("/")
async def create_reserva(payload: dict):
    reserva = await api_controllers.crear_reserva(payload)
    return {
        "id": str(reserva.id),
        **reserva.model_dump(exclude={"id", "revision_id"}),
    }


@router.put("/{id}")
async def update_reserva(id: str, payload: dict):
    updated = await base_update(Reserva, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return {
        "id": str(updated.id),
        **updated.model_dump(exclude={"id", "revision_id"}),
    }


@router.delete("/{id}")
async def delete_reserva(id: str):
    ok = await base_delete(Reserva, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return {"ok": True}
