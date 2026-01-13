"""
Rutas para webhooks bidireccionales con grupo partner.
Endpoints para recibir eventos de reservas, pagos, etc.
SEMANA 4: Integración de JWT + HMAC para seguridad doble
"""
from fastapi import APIRouter, HTTPException, Header, Request
from typing import Optional
import logging

from ..services.webhook_service import (
    WebhookEventValidator,
    HMACValidator,
    MY_WEBHOOK_SECRET
)
from ..services.jwt_validator import JWTValidator, WebhookSecurityValidator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/partner")
async def receive_partner_webhook(
    request: Request,
    x_webhook_signature: Optional[str] = Header(None),
    x_webhook_source: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
):
    """
    Endpoint para recibir webhooks del grupo partner (grupo Reservas ULEAM).
    SEMANA 4: Ahora incluye validación JWT + HMAC
    
    Headers requeridos:
    - Authorization: Bearer <token_jwt>
    - X-Webhook-Signature: Firma HMAC-SHA256
    - X-Webhook-Source: Nombre del servicio que envía (ej: 'reservas_system')
    
    Eventos soportados:
    - booking.confirmed: Se confirmó una reserva de hotel
    - payment.success: Pago procesado exitosamente
    - order.created: Nueva orden recibida
    
    Validación de seguridad (Semana 4):
    1. Valida JWT del header Authorization
    2. Valida firma HMAC del payload
    3. Procesa evento solo si ambas validaciones pasan
    
    Ejemplo de curl para pruebas:
    ```
    curl -X POST http://localhost:8000/webhooks/partner \\
      -H "Content-Type: application/json" \\
      -H "Authorization: Bearer eyJ..." \\
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
        - 401: JWT o HMAC inválido
        - 400: Evento no válido
    """
    
    logger.info("🔐 [SEMANA 4] Validación de seguridad dual: JWT + HMAC")
    
    # Leer payload primero (para validación HMAC)
    body = await request.body()
    payload_str = body.decode('utf-8')
    
    # Validaciones de seguridad
    if not x_webhook_signature:
        logger.warning("⚠️ Webhook sin firma HMAC recibido")
        raise HTTPException(status_code=401, detail="Firma HMAC requerida")
    
    if not authorization:
        logger.warning("⚠️ Webhook sin JWT recibido")
        raise HTTPException(status_code=401, detail="Authorization header requerido")
    
    # Extraer token del header
    try:
        token = JWTValidator.extract_token_from_header(authorization)
    except HTTPException as e:
        raise e
    
    # Validar seguridad dual: JWT + HMAC
    security_result = WebhookSecurityValidator.validate_webhook_security(
        token=token,
        signature=x_webhook_signature,
        payload_str=payload_str,
        secret=MY_WEBHOOK_SECRET,
        require_jwt=True
    )
    
    # Si hay error en JWT o HMAC
    if security_result["error"]:
        logger.error(f"❌ Validación de seguridad falló: {security_result['error']}")
        raise HTTPException(status_code=401, detail=security_result["error"])
    
    # Ambas validaciones deben pasar
    if not security_result["jwt_valid"] or not security_result["hmac_valid"]:
        logger.error("❌ JWT o HMAC no válido")
        raise HTTPException(
            status_code=401,
            detail="JWT o HMAC no válido"
        )
    
    logger.info(f"✅ [SEMANA 4] JWT válido para usuario: {security_result['jwt_payload'].get('user_id')}")
    logger.info(f"✅ [SEMANA 4] HMAC válido")
    
    # Validar y procesar evento
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
    logger.info(f"👤 Procesado por usuario: {security_result['jwt_payload'].get('user_id')}")

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

        # Retornar ACK con información de seguridad (Semana 4)
        return {
            "status": "received",
            "event_type": event_type,
            "source_service": x_webhook_source,
            "result": result,
            "ack": True,
            "security": {
                "jwt_validated": security_result["jwt_valid"],
                "hmac_validated": security_result["hmac_valid"],
                "validated_by": security_result['jwt_payload'].get('user_id')
            }
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


@router.post("/validate-security")
async def validate_webhook_security_endpoint(
    payload: dict,
    signature: str,
    token: str,
    secret: str = "shared_secret_tourism_123"
):
    """
    SEMANA 4: Endpoint para validar JWT + HMAC juntos.
    
    Uso:
    ```
    POST /webhooks/validate-security
    {
        "payload": {"event_type": "booking.confirmed"},
        "signature": "abc123...",
        "token": "eyJ...",
        "secret": "shared_secret_tourism_123"
    }
    ```
    """
    import json
    payload_str = json.dumps(payload)
    
    result = WebhookSecurityValidator.validate_webhook_security(
        token=token,
        signature=signature,
        payload_str=payload_str,
        secret=secret,
        require_jwt=True
    )
    
    return {
        "jwt_valid": result["jwt_valid"],
        "hmac_valid": result["hmac_valid"],
        "jwt_payload": result["jwt_payload"],
        "error": result["error"],
        "message": "✅ Ambas validaciones pasaron" if not result["error"] else f"❌ {result['error']}"
    }


@router.post("/generate-token")
async def generate_jwt_token(
    user_id: str,
    email: str,
    username: str
):
    """
    SEMANA 4: Endpoint para generar tokens JWT para testing.
    
    Uso:
    ```
    POST /webhooks/generate-token
    {
        "user_id": "user_123",
        "email": "user@example.com",
        "username": "john_doe"
    }
    ```
    
    Returns:
        Token JWT que se puede usar en el header Authorization: Bearer <token>
    """
    token_data = JWTValidator.generate_token(
        user_id=user_id,
        email=email,
        username=username
    )
    
    logger.info(f"✅ Token JWT generado para: {user_id}")
    
    return {
        "access_token": token_data["access_token"],
        "token_type": token_data["token_type"],
        "expires_in": token_data["expires_in"],
        "message": "Token generado exitosamente",
        "usage": "Usar en header: Authorization: Bearer <access_token>"
    }
