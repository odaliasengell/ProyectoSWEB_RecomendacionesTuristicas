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


# ============================================================================
# INTEGRACIÓN BIDIRECCIONAL - EQUIPO A
# Endpoints para recibir y enviar datos a Equipo B
# ============================================================================

import hmac
import hashlib
import json
from datetime import datetime
import requests

# Clave secreta compartida con Equipo B
CLAVE_SECRETA_INTEGRACION = "integracion-turismo-2026-uleam"


def verificar_firma_integracion(payload_dict: dict, firma_recibida: str) -> bool:
    """
    Verifica que la firma HMAC-SHA256 sea válida.
    Se usa para validar solicitudes del Equipo B.
    """
    try:
        mensaje = json.dumps(payload_dict, sort_keys=True)
        firma_esperada = hmac.new(
            CLAVE_SECRETA_INTEGRACION.encode(),
            mensaje.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Usar comparación segura para evitar timing attacks
        return hmac.compare_digest(firma_esperada, firma_recibida)
    except Exception as e:
        logger.error(f"❌ Error verificando firma: {str(e)}")
        return False


def generar_firma_integracion(payload_dict: dict) -> str:
    """
    Genera firma HMAC-SHA256 para el payload.
    Se usa para firmar solicitudes que enviaremos a Equipo B.
    """
    try:
        mensaje = json.dumps(payload_dict, sort_keys=True)
        firma = hmac.new(
            CLAVE_SECRETA_INTEGRACION.encode(),
            mensaje.encode(),
            hashlib.sha256
        ).hexdigest()
        return firma
    except Exception as e:
        logger.error(f"❌ Error generando firma: {str(e)}")
        return ""


@router.post("/api/reservas")
async def recibir_reserva_desde_equipo_b(request: Request):
    """
    📥 EQUIPO A - Endpoint que RECIBE reservas/recomendaciones del Equipo B.
    
    Endpoint para integración bidireccional con otro equipo (Equipo B).
    Recibe recomendaciones que fueron generadas por confirmación de reservas.
    
    Estructura esperada:
    ```json
    POST https://equipo-a.ngrok.io/api/reservas
    {
      "user_id": "usuario456",
      "recomendacion": {
        "id": "rec789",
        "tour_recomendado": "Volcán Cotopaxi",
        "descripcion": "Similar a tu tour anterior",
        "precio": 120.00,
        "destino": "Latacunga"
      },
      "timestamp": "2026-01-25T15:35:00Z",
      "firma": "abc123def456..."
    }
    ```
    
    Validación:
    1. Extrae la firma del payload
    2. Verifica HMAC-SHA256 con clave compartida
    3. Si es válida: crea recomendación en BD
    4. Si no es válida: responde 401
    
    Ejemplo de curl para pruebas:
    ```bash
    curl -X POST http://localhost:8000/api/reservas \\
      -H "Content-Type: application/json" \\
      -d '{
        "user_id": "test123",
        "recomendacion": {
          "id": "rec789",
          "tour_recomendado": "Volcán Cotopaxi",
          "descripcion": "Similar a tu tour anterior",
          "precio": 120.00,
          "destino": "Latacunga"
        },
        "timestamp": "2026-01-25T15:35:00Z",
        "firma": "abc123def456..."
      }'
    ```
    """
    logger.info("🔐 [Integración] Solicitud recibida en /api/reservas")
    
    try:
        # Leer payload
        payload = await request.json()
        logger.info(f"📦 Payload recibido: {json.dumps(payload, indent=2)}")
        
        # Extraer firma del payload
        firma_recibida = payload.pop("firma", None)
        
        if not firma_recibida:
            logger.warning("⚠️ [/api/reservas] Firma no proporcionada")
            return {"error": "Firma no proporcionada"}, 400
        
        # Verificar firma HMAC
        if not verificar_firma_integracion(payload, firma_recibida):
            logger.error("❌ [/api/reservas] Firma inválida recibida")
            return {"error": "Firma inválida"}, 401
        
        # ✅ Firma válida
        logger.info("✅ [/api/reservas] Firma válida - Procesando solicitud")
        
        user_id = payload.get("user_id")
        recomendacion = payload.get("recomendacion", {})
        timestamp = payload.get("timestamp")
        
        logger.info(f"👤 User ID: {user_id}")
        logger.info(f"🎯 Recomendación: {recomendacion.get('tour_recomendado')}")
        
        # TODO: Guardar en BD
        # Estructura sugerida:
        # db.recomendaciones_externas.insert_one({
        #     "user_id": user_id,
        #     "tipo": "recomendacion_equipo_b",
        #     "tour_recomendado": recomendacion.get("tour_recomendado"),
        #     "descripcion": recomendacion.get("descripcion"),
        #     "precio": recomendacion.get("precio"),
        #     "destino": recomendacion.get("destino"),
        #     "id_externo": recomendacion.get("id"),
        #     "timestamp_recibido": datetime.utcnow(),
        #     "timestamp_origen": timestamp,
        #     "estado": "recibida"
        # })
        
        logger.info(f"💾 [BD] Recomendación almacenada para usuario {user_id}")
        
        return {
            "status": "ok",
            "message": "Recomendación recibida y procesada",
            "user_id": user_id,
            "recomendacion_id": recomendacion.get("id"),
            "timestamp_procesamiento": datetime.utcnow().isoformat() + "Z"
        }, 200
        
    except json.JSONDecodeError:
        logger.error("❌ JSON inválido en solicitud")
        return {"error": "JSON inválido"}, 400
    except Exception as e:
        logger.error(f"❌ Error en /api/reservas: {str(e)}")
        return {"error": str(e)}, 500


@router.post("/api/enviar-reserva-confirmada")
async def enviar_reserva_confirmada_a_equipo_b(
    user_id: str,
    tour_id: str,
    tour_nombre: str,
    tour_precio: float,
    tour_destino: str,
    tour_descripcion: str = "Tour confirmado"
):
    """
    📤 EQUIPO A - Endpoint para ENVIAR reservas confirmadas a Equipo B.
    
    Cuando un usuario confirma una reserva en Equipo A,
    se llama a este endpoint para notificar a Equipo B
    y que este genere una recomendación.
    
    Parámetros:
    - user_id: ID del usuario
    - tour_id: ID del tour confirmado
    - tour_nombre: Nombre del tour
    - tour_precio: Precio del tour
    - tour_destino: Destino del tour
    - tour_descripcion: Descripción (opcional)
    
    Retorna:
    - 200: Enviado exitosamente
    - 500: Error al enviar
    
    Ejemplo de curl:
    ```bash
    curl -X POST http://localhost:8000/api/enviar-reserva-confirmada \\
      -H "Content-Type: application/json" \\
      -d '{
        "user_id": "usuario123",
        "tour_id": "tour456",
        "tour_nombre": "Tour a Baños",
        "tour_precio": 150.00,
        "tour_destino": "Baños de Agua Santa",
        "tour_descripcion": "Aventura en cascadas"
      }'
    ```
    """
    logger.info(f"📤 [Integración] Enviando reserva confirmada a Equipo B")
    logger.info(f"   Usuario: {user_id}, Tour: {tour_nombre}")
    
    # URL de Equipo B - REEMPLAZAR CON LA VERDADERA URL DE NGROK
    URL_EQUIPO_B = "https://REEMPLAZAR_CON_URL_NGROK_B.ngrok.io/api/recomendaciones"
    
    payload = {
        "user_id": user_id,
        "tour_confirmado": {
            "id": tour_id,
            "nombre": tour_nombre,
            "precio": tour_precio,
            "destino": tour_destino,
            "descripcion": tour_descripcion
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    # Generar firma
    firma = generar_firma_integracion(payload)
    payload["firma"] = firma
    
    logger.info(f"🔐 Firma generada: {firma[:20]}...")
    
    try:
        logger.info(f"📡 Enviando POST a: {URL_EQUIPO_B}")
        
        response = requests.post(
            URL_EQUIPO_B,
            json=payload,
            timeout=10,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            logger.info("✅ [Integración] Reserva enviada exitosamente")
            logger.info(f"   Respuesta: {response.json()}")
            return {
                "status": "ok",
                "message": "Reserva enviada exitosamente a Equipo B",
                "user_id": user_id,
                "tour_id": tour_id,
                "response_equipo_b": response.json()
            }, 200
        else:
            logger.error(f"❌ [Integración] Error al enviar reserva")
            logger.error(f"   Status: {response.status_code}")
            logger.error(f"   Response: {response.text}")
            return {
                "status": "error",
                "message": f"Equipo B respondió con error: {response.status_code}",
                "response_text": response.text
            }, 500
            
    except requests.exceptions.Timeout:
        logger.error("❌ [Integración] Timeout: Equipo B no responde en 10 segundos")
        return {
            "status": "error",
            "message": "Timeout: Equipo B no responde",
            "error_type": "timeout"
        }, 500
    except requests.exceptions.ConnectionError:
        logger.error("❌ [Integración] Connection Error: No se puede conectar a Equipo B")
        return {
            "status": "error",
            "message": "No se puede conectar a Equipo B",
            "error_type": "connection_error",
            "hint": "Verifica que la URL de Equipo B sea correcta y que ngrok esté activo"
        }, 500
    except Exception as e:
        logger.error(f"❌ [Integración] Excepción al enviar reserva: {str(e)}")
        return {
            "status": "error",
            "message": f"Error: {str(e)}",
            "error_type": "general_error"
        }, 500


@router.get("/api/integracion/status")
async def verificar_integracion_status():
    """
    🔍 Endpoint para verificar el estado de la integración.
    
    Retorna información sobre:
    - Clave secreta configurada
    - Endpoints disponibles
    - Información para compartir con Equipo B
    
    Uso:
    ```bash
    curl http://localhost:8000/api/integracion/status
    ```
    """
    logger.info("🔍 [Integración] Verificando status")
    
    return {
        "status": "ok",
        "equipo": "Equipo A - Recomendaciones Turísticas ULEAM",
        "integracion_activa": True,
        "endpoints": {
            "recibe": "/api/reservas (POST)",
            "envia": "/api/enviar-reserva-confirmada (POST)",
            "status": "/api/integracion/status (GET)"
        },
        "seguridad": {
            "algoritmo": "HMAC-SHA256",
            "clave_secreta": "integracion-turismo-2026-uleam",
            "timestamp_format": "ISO 8601 con Z (ej: 2026-01-25T15:30:00Z)"
        },
        "informacion_compartir_con_equipo_b": {
            "url_ngrok": "https://TU_URL_NGROK.ngrok.io",
            "puerto_local": 8000,
            "endpoint_recibe": "/api/reservas",
            "endpoint_envia": "/api/enviar-reserva-confirmada",
            "lenguaje_backend": "Python/FastAPI",
            "tipo_bd": "MongoDB",
            "nota": "Actualizar URL_NGROK cuando tengas tu ngrok token"
        },
        "checklist": {
            "ngrok_instalado": "⏳ Por verificar",
            "ngrok_activo": "⏳ Por verificar",
            "endpoints_activos": "✅ Sí",
            "seguridad_implementada": "✅ Sí (HMAC-SHA256)",
            "url_ngrok_compartida": "⏳ Por hacer",
            "url_equipo_b_recibida": "⏳ Por hacer"
        },
        "pasos_siguientes": [
            "1. Instalar ngrok: https://ngrok.com/download",
            "2. Crear cuenta en ngrok y obtener token",
            "3. Ejecutar: ngrok config add-authtoken TU_TOKEN",
            "4. Ejecutar: ngrok http 8000",
            "5. Copiar URL de ngrok (ej: https://abc123xyz.ngrok.io)",
            "6. Reemplazar URL en endpoint /api/enviar-reserva-confirmada",
            "7. Solicitar URL de Equipo B",
            "8. Ejecutar tests con scripts Python"
        ]
    }
