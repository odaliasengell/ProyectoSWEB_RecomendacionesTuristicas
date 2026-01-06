"""
Rutas para webhooks bidireccionales con grupo partner.
Endpoints para recibir eventos de reservas, pagos, etc.
"""
from fastapi import APIRouter, HTTPException, Header, Request
from typing import Optional
import logging

from ..services.webhook_service import (
    WebhookEventValidator,
    HMACValidator,
    MY_WEBHOOK_SECRET
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/partner")
async def receive_partner_webhook(
    request: Request,
    x_webhook_signature: Optional[str] = Header(None),
    x_webhook_source: Optional[str] = Header(None)
):
    """
    Endpoint para recibir webhooks del grupo partner (grupo Reservas ULEAM).
    
    Headers requeridos:
    - X-Webhook-Signature: Firma HMAC-SHA256
    - X-Webhook-Source: Nombre del servicio que envía (ej: 'reservas_system')
    
    Eventos soportados:
    - booking.confirmed: Se confirmó una reserva de hotel
    - payment.success: Pago procesado exitosamente
    - order.created: Nueva orden recibida
    
    Ejemplo de curl para pruebas:
    ```
    curl -X POST http://localhost:8000/webhooks/partner \\
      -H "Content-Type: application/json" \\
      -H "X-Webhook-Signature: <firma_hmac>" \\
      -H "X-Webhook-Source: reservas_system" \\
      -d '{
        "event_type": "booking.confirmed",
        "timestamp": "2025-01-24T10:30:00",
        "source_service": "reservas_system",
        "data": {
          "booking_id": "book_123",
          "user_id": "user_456",
          "hotel_id": "hotel_789",
          "check_in": "2025-02-01",
          "check_out": "2025-02-05",
          "total_price": 500.00
        }
      }'
    ```
    
    Returns:
        - 200: Evento procesado exitosamente
        - 401: Firma HMAC inválida
        - 400: Evento no válido
    """
    
    # Validar firma
    if not x_webhook_signature:
        logger.warning("⚠️ Webhook sin firma HMAC recibido")
        raise HTTPException(status_code=401, detail="Firma HMAC requerida")

    # Leer payload
    body = await request.body()
    payload_str = body.decode('utf-8')

    # Validar evento
    is_valid, event_data = WebhookEventValidator.validate_partner_event(
        payload_str,
        x_webhook_signature,
        MY_WEBHOOK_SECRET
    )

    if not is_valid:
        raise HTTPException(status_code=401, detail="Firma HMAC inválida")

    if not event_data:
        raise HTTPException(status_code=400, detail="Evento inválido")

    # Procesar según tipo de evento
    event_type = event_data.get("event_type")
    logger.info(f"📥 Evento recibido: {event_type} desde {x_webhook_source}")

    try:
        if event_type == "booking.confirmed":
            result = WebhookEventValidator.process_booking_confirmed(event_data)
        elif event_type == "payment.success":
            result = WebhookEventValidator.process_payment_success(event_data)
        else:
            logger.warning(f"⚠️ Tipo de evento desconocido: {event_type}")
            result = {
                "processed": False,
                "message": f"Evento {event_type} no soportado"
            }

        # Retornar ACK
        return {
            "status": "received",
            "event_type": event_type,
            "source_service": x_webhook_source,
            "result": result,
            "ack": True
        }

    except Exception as e:
        logger.error(f"❌ Error procesando webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando evento: {str(e)}")


@router.get("/test")
async def test_webhook_endpoint():
    """
    Endpoint de prueba para verificar que el servicio de webhooks está activo.
    """
    return {
        "status": "ok",
        "service": "webhook_listener",
        "message": "Listo para recibir webhooks del grupo partner",
        "supported_events": [
            "booking.confirmed",
            "payment.success",
            "order.created"
        ]
    }


@router.post("/validate-hmac")
async def validate_hmac_test(
    payload: dict,
    signature: str,
    secret: str = "shared_secret_tourism_123"
):
    """
    Endpoint de prueba para validar firmas HMAC.
    
    Uso:
    ```
    POST /webhooks/validate-hmac
    {
        "payload": {"event_type": "test"},
        "signature": "...",
        "secret": "shared_secret_tourism_123"
    }
    ```
    """
    import json
    payload_str = json.dumps(payload)
    
    is_valid = HMACValidator.verify_signature(payload_str, signature, secret)
    
    return {
        "is_valid": is_valid,
        "payload": payload,
        "message": "✅ Firma válida" if is_valid else "❌ Firma inválida"
    }
