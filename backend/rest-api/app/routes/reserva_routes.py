"""
Rutas REST para Reservas.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.reserva_model import Reserva
import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete
from ..websocket_client import notificar_reserva_creada

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
    
    # Notificar creación de reserva vía WebSocket
    try:
        # Obtener información adicional si está disponible en el payload
        tour_nombre = payload.get("tour_nombre", "Tour")
        usuario_nombre = payload.get("usuario_nombre", "Usuario")
        fecha = payload.get("fecha", "")
        personas = payload.get("cantidad_personas", 1)
        monto = float(payload.get("precio_total", 0.0))
        
        await notificar_reserva_creada(
            reserva_id=str(reserva.id),
            tour_id=str(payload.get("tour_id", "")),
            tour_nombre=tour_nombre,
            usuario_id=str(payload.get("usuario_id", "")),
            usuario_nombre=usuario_nombre,
            fecha=str(fecha),
            personas=personas,
            monto=monto
        )
    except Exception as e:
        # No detener la ejecución si falla la notificación
        print(f"⚠️ Error al enviar notificación de reserva: {e}")
    
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


@router.post("/webhook/tour-purchased")
async def crear_reserva_con_webhook(payload: dict):
    """
    Endpoint para crear una reserva y notificar al grupo partner (grupo Reservas ULEAM).
    
    Automáticamente envía un webhook con evento 'tour.purchased'.
    
    Payload esperado:
    {
        "usuario_id": "user_123",
        "usuario_nombre": "Juan Pérez",
        "usuario_email": "juan@example.com",
        "tour_id": "tour_456",
        "tour_nombre": "Tour Galápagos Premium",
        "cantidad_personas": 2,
        "precio_total": 1200.50,
        "fecha": "2025-03-15"
    }
    
    Returns:
        {
            "success": true,
            "reserva": {...},
            "webhook": {
                "sent": true,
                "status_code": 200,
                "response": {...}
            }
        }
    
    Ejemplo de curl:
    ```
    curl -X POST http://localhost:8000/reservas/webhook/tour-purchased \\
      -H "Content-Type: application/json" \\
      -d '{
        "usuario_id": "user_123",
        "usuario_nombre": "Juan Pérez",
        "usuario_email": "juan@example.com",
        "tour_id": "tour_456",
        "tour_nombre": "Tour Galápagos Premium",
        "cantidad_personas": 2,
        "precio_total": 1200.50,
        "fecha": "2025-03-15"
      }'
    ```
    """
    from ..controllers.reserva_webhook_controller import crear_reserva_y_notificar_partner
    
    result = await crear_reserva_y_notificar_partner(payload)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result
