"""
Servicio de notificación a WebSocket Server
Permite a la API Python enviar eventos en tiempo real al panel de administración
"""

import httpx
import logging
from datetime import datetime
from typing import Optional, Dict, Any
import os

logger = logging.getLogger(__name__)

WEBSOCKET_URL = os.getenv("WEBSOCKET_URL", "http://localhost:4001")


async def notify_websocket(
    event: str,
    data: Dict[str, Any],
    room: str = "admin_panel",
    source: str = "python_api"
) -> bool:
    """
    Envía una notificación al WebSocket Server
    
    Args:
        event: Nombre del evento (ej: 'user_created', 'destino_updated')
        data: Datos a enviar con el evento
        room: Sala destino (ej: 'usuarios', 'destinos', 'admin_panel')
        source: Origen del evento (siempre 'python_api')
    
    Returns:
        True si se envió exitosamente, False en caso de error
    """
    try:
        payload = {
            "event": event,
            "data": data,
            "room": room,
            "source": source,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                f"{WEBSOCKET_URL}/notify",
                json=payload
            )
            
            if response.status_code == 200:
                logger.info(f"✅ Evento '{event}' enviado a WebSocket")
                return True
            else:
                logger.error(f"❌ Error WebSocket ({response.status_code}): {response.text}")
                return False
                
    except Exception as e:
        logger.error(f"❌ Error al notificar WebSocket: {str(e)}")
        return False


# ==========================================
# FUNCIONES ESPECÍFICAS POR TIPO DE EVENTO
# ==========================================

async def notify_user_event(
    event_type: str,
    user_data: Dict[str, Any],
    room: str = "usuarios"
) -> bool:
    """
    Notifica un evento relacionado con usuarios
    
    Event types: 'user_created', 'user_updated', 'user_deleted', 'user_logged_in', 'user_logged_out'
    """
    return await notify_websocket(
        event=event_type,
        data={
            "user_id": str(user_data.get("id") or user_data.get("_id", "")),
            "username": user_data.get("username", ""),
            "email": user_data.get("email", ""),
            "role": user_data.get("role", "user"),
            "nombre": user_data.get("nombre", ""),
            "apellido": user_data.get("apellido", ""),
        },
        room=room,
        source="python_api"
    )


async def notify_destino_event(
    event_type: str,
    destino_data: Dict[str, Any],
    room: str = "destinos"
) -> bool:
    """
    Notifica un evento relacionado con destinos
    
    Event types: 'destino_created', 'destino_updated', 'destino_deleted'
    """
    return await notify_websocket(
        event=event_type,
        data={
            "destino_id": str(destino_data.get("id") or destino_data.get("_id", "")),
            "nombre": destino_data.get("nombre", ""),
            "descripcion": destino_data.get("descripcion", ""),
            "ubicacion": destino_data.get("ubicacion", ""),
            "rating": destino_data.get("calificacion_promedio", 0),
        },
        room=room,
        source="python_api"
    )


async def notify_recomendacion_event(
    event_type: str,
    recom_data: Dict[str, Any],
    room: str = "recomendaciones"
) -> bool:
    """
    Notifica un evento relacionado con recomendaciones
    
    Event types: 'recomendacion_created', 'recomendacion_updated', 'recomendacion_deleted'
    """
    return await notify_websocket(
        event=event_type,
        data={
            "recomendacion_id": str(recom_data.get("id") or recom_data.get("_id", "")),
            "usuario_id": str(recom_data.get("usuario_id", "")),
            "destino_id": str(recom_data.get("destino_id", "")),
            "rating": recom_data.get("rating", 0),
            "comentario": recom_data.get("comentario", ""),
        },
        room=room,
        source="python_api"
    )


async def notify_stats_update(
    total_usuarios: int = 0,
    total_destinos: int = 0,
    total_tours: int = 0,
    total_servicios: int = 0,
    usuarios_activos: int = 0,
    contratos_pendientes: int = 0,
    reservas_nuevas: int = 0,
    room: str = "admin_panel"
) -> bool:
    """
    Notifica actualización de estadísticas
    """
    return await notify_websocket(
        event="stats_updated",
        data={
            "total_usuarios": total_usuarios,
            "total_destinos": total_destinos,
            "total_tours": total_tours,
            "total_servicios": total_servicios,
            "usuarios_activos": usuarios_activos,
            "contratos_pendientes": contratos_pendientes,
            "reservas_nuevas": reservas_nuevas,
        },
        room=room,
        source="python_api"
    )


async def notify_admin_alert(
    titulo: str,
    mensaje: str,
    tipo: str = "info",
    room: str = "admin_panel"
) -> bool:
    """
    Notifica una alerta al panel de administración
    
    Tipos: 'info', 'success', 'warning', 'error'
    """
    return await notify_websocket(
        event="admin_alert",
        data={
            "titulo": titulo,
            "mensaje": mensaje,
            "tipo": tipo,
        },
        room=room,
        source="python_api"
    )


# ==========================================
# EJEMPLOS DE USO EN RUTAS
# ==========================================

"""
# En app/routes/usuario_routes.py:

from app.services.websocket_notifier import notify_user_event, notify_admin_alert

@router.post("/usuarios")
async def create_usuario(usuario_data: dict):
    try:
        # ... validar datos ...
        result = await usuarios_collection.insert_one(usuario_data)
        usuario_data["_id"] = result.inserted_id
        
        # ✨ NOTIFICAR EVENTO
        await notify_user_event("user_created", usuario_data)
        
        return {"message": "Usuario creado", "id": str(result.inserted_id)}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        await notify_admin_alert(
            titulo="Error al crear usuario",
            mensaje=str(e),
            tipo="error"
        )
        raise


@router.put("/usuarios/{usuario_id}")
async def update_usuario(usuario_id: str, updated_data: dict):
    try:
        result = await usuarios_collection.update_one(
            {"_id": ObjectId(usuario_id)},
            {"$set": updated_data}
        )
        
        if result.matched_count:
            updated_data["_id"] = usuario_id
            
            # ✨ NOTIFICAR EVENTO
            await notify_user_event("user_updated", updated_data)
            
            return {"message": "Usuario actualizado"}
        else:
            return {"error": "Usuario no encontrado"}, 404
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise


@router.delete("/usuarios/{usuario_id}")
async def delete_usuario(usuario_id: str):
    try:
        result = await usuarios_collection.delete_one({"_id": ObjectId(usuario_id)})
        
        if result.deleted_count:
            # ✨ NOTIFICAR EVENTO
            await notify_user_event("user_deleted", {"_id": usuario_id})
            
            return {"message": "Usuario eliminado"}
        else:
            return {"error": "Usuario no encontrado"}, 404
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise


# En app/routes/destino_routes.py:

from app.services.websocket_notifier import notify_destino_event

@router.post("/destinos")
async def create_destino(destino_data: DestinoCreate):
    try:
        result = await destinos_collection.insert_one(destino_data.dict())
        destino_data_dict = destino_data.dict()
        destino_data_dict["_id"] = result.inserted_id
        
        # ✨ NOTIFICAR EVENTO
        await notify_destino_event("destino_created", destino_data_dict)
        
        return {"message": "Destino creado", "id": str(result.inserted_id)}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise
"""
