"""
Cliente WebSocket para integrar con el backend REST (Python/FastAPI)

Este módulo proporciona funciones para enviar notificaciones al servidor WebSocket
desde la API REST.

Uso:
    from websocket_client import enviar_notificacion
    
    await enviar_notificacion(
        tipo="usuario_registrado",
        mensaje="Nuevo usuario: Juan Pérez",
        data={"userId": "123", "email": "juan@example.com"}
    )
"""

import httpx
from typing import Dict, Any, Optional
import logging

# Configuración
WEBSOCKET_URL = "http://localhost:8080/notify"
TIMEOUT = 3.0  # segundos

logger = logging.getLogger(__name__)


async def enviar_notificacion(
    tipo: str,
    mensaje: str,
    data: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Envía una notificación al servidor WebSocket para broadcast a todos los clientes.
    
    Args:
        tipo: Tipo de evento (ej: "usuario_registrado", "reserva_creada")
        mensaje: Mensaje descriptivo del evento
        data: Datos adicionales del evento (opcional)
    
    Returns:
        bool: True si la notificación se envió exitosamente, False en caso contrario
    
    Ejemplo:
        await enviar_notificacion(
            tipo="usuario_registrado",
            mensaje="Nuevo usuario: María González",
            data={
                "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
                "nombre": "María González",
                "email": "maria@example.com",
                "rol": "turista"
            }
        )
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                WEBSOCKET_URL,
                json={
                    "type": tipo,
                    "message": mensaje,
                    "data": data or {}
                },
                timeout=TIMEOUT
            )
            
            if response.status_code == 200:
                logger.info(f"✅ Notificación enviada: [{tipo}] {mensaje}")
                return True
            else:
                logger.warning(
                    f"⚠️ Error al enviar notificación: "
                    f"Status {response.status_code} - {response.text}"
                )
                return False
                
    except httpx.TimeoutException:
        logger.error(
            f"⏱️ Timeout al enviar notificación al WebSocket. "
            f"¿El servidor está corriendo en {WEBSOCKET_URL}?"
        )
        return False
        
    except httpx.ConnectError:
        logger.error(
            f"❌ No se pudo conectar al servidor WebSocket en {WEBSOCKET_URL}. "
            f"Asegúrate de que el servidor esté corriendo."
        )
        return False
        
    except Exception as e:
        logger.error(f"❌ Error inesperado al enviar notificación: {e}")
        return False


# Funciones de conveniencia para eventos específicos

async def notificar_usuario_registrado(usuario_id: str, nombre: str, email: str, rol: str) -> bool:
    """Notifica que un nuevo usuario se registró"""
    return await enviar_notificacion(
        tipo="usuario_registrado",
        mensaje=f"Nuevo usuario registrado: {nombre}",
        data={
            "userId": usuario_id,
            "nombre": nombre,
            "email": email,
            "rol": rol
        }
    )


async def notificar_usuario_inicio_sesion(usuario_id: str, nombre: str, rol: str) -> bool:
    """Notifica que un usuario inició sesión"""
    return await enviar_notificacion(
        tipo="usuario_inicio_sesion",
        mensaje=f"{nombre} ha iniciado sesión",
        data={
            "userId": usuario_id,
            "nombre": nombre,
            "rol": rol
        }
    )


async def notificar_reserva_creada(
    reserva_id: str,
    tour_id: str,
    tour_nombre: str,
    usuario_id: str,
    usuario_nombre: str,
    fecha: str,
    personas: int
) -> bool:
    """Notifica que se creó una nueva reserva"""
    return await enviar_notificacion(
        tipo="reserva_creada",
        mensaje=f"Nueva reserva para {tour_nombre} - {personas} persona(s)",
        data={
            "reservaId": reserva_id,
            "tourId": tour_id,
            "tourNombre": tour_nombre,
            "usuarioId": usuario_id,
            "usuarioNombre": usuario_nombre,
            "fecha": fecha,
            "personas": personas
        }
    )


async def notificar_servicio_contratado(
    contratacion_id: str,
    servicio_id: str,
    servicio_nombre: str,
    usuario_id: str,
    usuario_nombre: str
) -> bool:
    """Notifica que se contrató un servicio"""
    return await enviar_notificacion(
        tipo="servicio_contratado",
        mensaje=f"Servicio contratado: {servicio_nombre}",
        data={
            "contratacionId": contratacion_id,
            "servicioId": servicio_id,
            "servicioNombre": servicio_nombre,
            "usuarioId": usuario_id,
            "usuarioNombre": usuario_nombre
        }
    )


async def notificar_recomendacion_creada(
    recomendacion_id: str,
    titulo: str,
    usuario_id: str,
    usuario_nombre: str,
    calificacion: int
) -> bool:
    """Notifica que se creó una nueva recomendación"""
    return await enviar_notificacion(
        tipo="recomendacion_creada",
        mensaje=f"Nueva recomendación: {titulo} (⭐ {calificacion}/5)",
        data={
            "recomendacionId": recomendacion_id,
            "titulo": titulo,
            "usuarioId": usuario_id,
            "usuarioNombre": usuario_nombre,
            "calificacion": calificacion
        }
    )


async def notificar_tour_creado(tour_id: str, nombre: str, destino: str, precio: float) -> bool:
    """Notifica que se creó un nuevo tour"""
    return await enviar_notificacion(
        tipo="tour_creado",
        mensaje=f"Nuevo tour disponible: {nombre}",
        data={
            "tourId": tour_id,
            "nombre": nombre,
            "destino": destino,
            "precio": precio
        }
    )


async def notificar_servicio_creado(servicio_id: str, nombre: str, tipo: str, precio: float) -> bool:
    """Notifica que se creó un nuevo servicio"""
    return await enviar_notificacion(
        tipo="servicio_creado",
        mensaje=f"Nuevo servicio disponible: {nombre}",
        data={
            "servicioId": servicio_id,
            "nombre": nombre,
            "tipo": tipo,
            "precio": precio
        }
    )


async def notificar_destino_creado(destino_id: str, nombre: str, pais: str, estado: str) -> bool:
    """Notifica que se creó un nuevo destino"""
    return await enviar_notificacion(
        tipo="destino_creado",
        mensaje=f"Nuevo destino agregado: {nombre}, {estado}",
        data={
            "destinoId": destino_id,
            "nombre": nombre,
            "pais": pais,
            "estado": estado
        }
    )


async def notificar_guia_creado(guia_id: str, nombre: str, especialidad: str, idiomas: list) -> bool:
    """Notifica que se creó un nuevo guía"""
    return await enviar_notificacion(
        tipo="guia_creado",
        mensaje=f"Nuevo guía disponible: {nombre} - {especialidad}",
        data={
            "guiaId": guia_id,
            "nombre": nombre,
            "especialidad": especialidad,
            "idiomas": idiomas
        }
    )
