"""
Rutas REST para Reservas.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.reserva_model import Reserva
from ... import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete

router = APIRouter(prefix="/reservas", tags=["reservas"])


@router.get("/", response_model=List[Reserva])
async def list_reservas():
    return await api_controllers.listar_reservas()


@router.get("/{id}", response_model=Reserva)
async def get_reserva(id: str):
    from ..controllers.base_controller import get_by_id
    reserva = await get_by_id(Reserva, id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return reserva


@router.post("/", response_model=Reserva)
async def create_reserva(payload: dict):
    return await api_controllers.crear_reserva(payload)


@router.put("/{id}", response_model=Reserva)
async def update_reserva(id: str, payload: dict):
    updated = await base_update(Reserva, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return updated


@router.delete("/{id}")
async def delete_reserva(id: str):
    ok = await base_delete(Reserva, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return {"ok": True}
