"""
Controlador para operaciones de reservas con integración de webhooks.
Cuando se crea una reserva de tour, se envía automáticamente al grupo partner.
"""
import logging
from typing import Dict, Any, Optional
from ..services.webhook_service import partner_client
from ..models.reserva_model import Reserva

logger = logging.getLogger(__name__)


async def crear_reserva_y_notificar_partner(
    reserva_data: Dict[str, Any],
    tour_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Crea una reserva y automáticamente envía evento 'tour.purchased' al grupo partner.
    
    Args:
        reserva_data: Datos de la reserva
        tour_data: Datos adicionales del tour (opcional)
        
    Returns:
        Dict con resultado de creación y envío de webhook
        
    Ejemplo de uso en endpoint POST /reservas/with-webhook:
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
    """
    try:
        # Datos mínimos de la reserva
        usuario_id = reserva_data.get("usuario_id")
        usuario_nombre = reserva_data.get("usuario_nombre", "Usuario")
        usuario_email = reserva_data.get("usuario_email")
        tour_id = reserva_data.get("tour_id")
        tour_nombre = reserva_data.get("tour_nombre", "Tour")
        cantidad_personas = reserva_data.get("cantidad_personas", 1)
        precio_total = float(reserva_data.get("precio_total", 0.0))
        fecha = reserva_data.get("fecha")

        # Validaciones mínimas
        if not all([usuario_id, tour_id, usuario_email, fecha]):
            return {
                "success": False,
                "error": "Campos requeridos: usuario_id, tour_id, usuario_email, fecha"
            }

        # Crear la reserva
        reserva = Reserva(
            usuario_id=usuario_id,
            tour_id=tour_id,
            cantidad_personas=cantidad_personas,
            precio_total=precio_total,
            fecha=fecha,
            estado="confirmada",
            # Campos adicionales si los necesitas
            notas=reserva_data.get("notas", "")
        )

        await reserva.insert()
        logger.info(f"✅ Reserva creada: {reserva.id}")

        # Enviar webhook al partner
        webhook_result = await partner_client.send_tour_purchased(
            tour_id=tour_id,
            tour_name=tour_nombre,
            user_id=usuario_id,
            user_email=usuario_email,
            quantity=cantidad_personas,
            total_price=precio_total,
            reservation_id=str(reserva.id),
            travel_date=fecha,
            metadata={
                "user_name": usuario_nombre,
                "source_system": "tourism_recomendaciones"
            }
        )

        logger.info(f"📤 Webhook enviado: {webhook_result['success']}")

        return {
            "success": True,
            "reserva": {
                "id": str(reserva.id),
                "usuario_id": usuario_id,
                "tour_id": tour_id,
                "estado": "confirmada"
            },
            "webhook": {
                "sent": webhook_result['success'],
                "status_code": webhook_result.get('status_code'),
                "response": webhook_result.get('response', {})
            }
        }

    except Exception as e:
        logger.error(f"❌ Error en crear_reserva_y_notificar_partner: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
