"""
Rutas REST para Contrataciones.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.contratacion_model import ContratacionServicio
import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete
from ..websocket_client import notificar_servicio_contratado

router = APIRouter(prefix="/contrataciones", tags=["contrataciones"])


@router.get("/", response_model=List[ContratacionServicio])
async def list_contrataciones():
    return await api_controllers.listar_contrataciones()


@router.get("/{id}", response_model=ContratacionServicio)
async def get_contratacion(id: str):
    from ..controllers.base_controller import get_by_id
    c = await get_by_id(ContratacionServicio, id)
    if not c:
        raise HTTPException(status_code=404, detail="Contratación no encontrada")
    return c


@router.post("/", response_model=ContratacionServicio)
async def create_contratacion(payload: dict):
    contratacion = await api_controllers.crear_contratacion(payload)
    
    # Notificar contratación de servicio vía WebSocket
    try:
        await notificar_servicio_contratado(
            contratacion_id=str(contratacion.id),
            servicio_id=str(payload.get("servicio_id", "")),
            servicio_nombre=payload.get("servicio_nombre", "Servicio"),
            usuario_id=str(payload.get("usuario_id", "")),
            usuario_nombre=payload.get("usuario_nombre", "Usuario")
        )
    except Exception as e:
        print(f"⚠️ Error al enviar notificación de contratación: {e}")
    
    return contratacion


@router.put("/{id}", response_model=ContratacionServicio)
async def update_contratacion(id: str, payload: dict):
    updated = await base_update(ContratacionServicio, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Contratación no encontrada")
    return updated


@router.delete("/{id}")
async def delete_contratacion(id: str):
    ok = await base_delete(ContratacionServicio, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Contratación no encontrada")
    return {"ok": True}
