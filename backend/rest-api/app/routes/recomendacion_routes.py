"""
Rutas REST para Recomendaciones.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.recomendacion_model import Recomendacion
import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete
from ..websocket_client import notificar_recomendacion_creada

router = APIRouter(prefix="/recomendaciones", tags=["recomendaciones"])


@router.get("/")
async def list_recomendaciones():
    recomendaciones = await api_controllers.listar_recomendaciones()
    # Serializar con id incluido
    return [
        {
            "id": str(r.id),
            **r.model_dump(exclude={"id", "revision_id"}),
        }
        for r in recomendaciones
    ]


@router.get("/{id}")
async def get_recomendacion(id: str):
    from ..controllers.base_controller import get_by_id
    r = await get_by_id(Recomendacion, id)
    if not r:
        raise HTTPException(status_code=404, detail="Recomendación no encontrada")
    # Serializar con id incluido
    return {
        "id": str(r.id),
        **r.model_dump(exclude={"id", "revision_id"}),
    }


@router.post("/")
async def create_recomendacion(payload: dict):
    recomendacion = await api_controllers.crear_recomendacion(payload)
    
    # Notificar nueva recomendación vía WebSocket
    try:
        tipo_rec = payload.get("tipo_recomendacion", "general")
        nombre_ref = payload.get("nombre_referencia", "")
        comentario = payload.get("comentario", "")
        
        # Crear título descriptivo
        if tipo_rec == "tour":
            titulo = f"Recomendación de Tour: {nombre_ref}"
        elif tipo_rec == "servicio":
            titulo = f"Recomendación de Servicio: {nombre_ref}"
        else:
            titulo = comentario[:50] if comentario else "Nueva Recomendación"
        
        await notificar_recomendacion_creada(
            recomendacion_id=str(recomendacion.id),
            titulo=titulo,
            usuario_id=str(payload.get("id_usuario", "")),
            usuario_nombre=payload.get("usuario_nombre", "Usuario"),
            calificacion=int(payload.get("calificacion", 5)),
            tipo_recomendacion=tipo_rec,
            nombre_referencia=nombre_ref
        )
    except Exception as e:
        print(f"⚠️ Error al enviar notificación de recomendación: {e}")
    
    return {
        "id": str(recomendacion.id),
        **recomendacion.model_dump(exclude={"id", "revision_id"}),
    }


@router.put("/{id}")
async def update_recomendacion(id: str, payload: dict):
    updated = await base_update(Recomendacion, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Recomendación no encontrada")
    return {
        "id": str(updated.id),
        **updated.model_dump(exclude={"id", "revision_id"}),
    }


@router.delete("/{id}")
async def delete_recomendacion(id: str):
    ok = await base_delete(Recomendacion, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Recomendación no encontrada")
    return {"ok": True}
