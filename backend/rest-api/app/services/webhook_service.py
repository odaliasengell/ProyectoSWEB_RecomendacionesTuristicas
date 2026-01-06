"""
Servicio de webhooks bidireccionales con grupo partner.
Maneja envío y recepción de eventos con validación HMAC.
Referencia: https://en.wikipedia.org/wiki/Webhook
"""
import os
import hashlib
import hmac
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any
import httpx

logger = logging.getLogger(__name__)

# Variables de configuración - EN PRODUCCIÓN, usar variables de entorno
PARTNER_URL = os.getenv("PARTNER_WEBHOOK_URL", "http://localhost:8001")  # URL del grupo partner
PARTNER_SECRET = os.getenv("PARTNER_SECRET", "shared_secret_tourism_123")  # Secret compartido con partner
MY_SERVICE_NAME = "tourism_recomendaciones"
MY_WEBHOOK_SECRET = os.getenv("MY_WEBHOOK_SECRET", "shared_secret_tourism_123")


class HMACValidator:
    """
    Valida firmas HMAC-SHA256 de webhooks.
    Referencia: https://developer.stripe.com/docs/webhooks/signatures
    """

    @staticmethod
    def generate_signature(payload: str, secret: str) -> str:
        """
        Genera firma HMAC-SHA256.
        
        Args:
            payload: String del payload JSON
            secret: Secret compartido
            
        Returns:
            Firma en formato hexadecimal
        """
        return hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

    @staticmethod
    def verify_signature(payload: str, signature: str, secret: str) -> bool:
        """
        Verifica firma HMAC-SHA256.
        
        Args:
            payload: String del payload JSON
            signature: Firma recibida
            secret: Secret compartido
            
        Returns:
            True si la firma es válida
        """
        expected_signature = HMACValidator.generate_signature(payload, secret)
        # Usar comparación segura contra timing attacks
        return hmac.compare_digest(expected_signature, signature)


class PartnerWebhookClient:
    """
    Cliente para enviar webhooks al grupo partner.
    Implementa patrón Observer para eventos de reserva.
    """

    def __init__(self, partner_url: str = PARTNER_URL, secret: str = PARTNER_SECRET):
        self.partner_url = partner_url
        self.secret = secret
        self.client = httpx.Client(timeout=10.0)

    async def send_tour_purchased(
        self,
        tour_id: str,
        tour_name: str,
        user_id: str,
        user_email: str,
        quantity: int,
        total_price: float,
        reservation_id: str,
        travel_date: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Envía evento 'tour.purchased' al grupo partner (Reservas ULEAM).
        
        Args:
            tour_id: ID del tour
            tour_name: Nombre del tour
            user_id: ID del usuario que compró
            user_email: Email del usuario
            quantity: Cantidad de personas
            total_price: Precio total
            reservation_id: ID de la reserva
            travel_date: Fecha del viaje
            metadata: Datos adicionales
            
        Returns:
            Dict con status de la respuesta
            
        Ejemplo de uso:
            result = await client.send_tour_purchased(
                tour_id="tour_123",
                tour_name="Tour Galápagos Premium",
                user_id="user_456",
                user_email="cliente@example.com",
                quantity=2,
                total_price=1200.50,
                reservation_id="res_789",
                travel_date="2025-03-15"
            )
        """
        try:
            payload = {
                "event_type": "tour.purchased",
                "timestamp": datetime.utcnow().isoformat(),
                "source_service": MY_SERVICE_NAME,
                "data": {
                    "tour_id": tour_id,
                    "tour_name": tour_name,
                    "user_id": user_id,
                    "user_email": user_email,
                    "quantity": quantity,
                    "total_price": total_price,
                    "reservation_id": reservation_id,
                    "travel_date": travel_date,
                    **(metadata or {})
                }
            }

            payload_str = json.dumps(payload)
            signature = HMACValidator.generate_signature(payload_str, self.secret)

            headers = {
                "Content-Type": "application/json",
                "X-Webhook-Signature": signature,
                "X-Webhook-Source": MY_SERVICE_NAME,
                "User-Agent": "TourismRecommendations/1.0"
            }

            logger.info(f"📤 Enviando webhook tour.purchased a {self.partner_url}")

            response = await self._async_post(
                f"{self.partner_url}/webhooks/partner",
                content=payload_str,
                headers=headers
            )

            logger.info(f"✅ Respuesta del partner: {response.status_code}")
            
            return {
                "success": response.status_code in [200, 201, 202],
                "status_code": response.status_code,
                "response": response.json() if response.text else {}
            }

        except Exception as e:
            logger.error(f"❌ Error enviando webhook: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    async def send_booking_updated(
        self,
        booking_id: str,
        status: str,
        tour_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Envía evento de actualización de reserva al partner.
        """
        try:
            payload = {
                "event_type": "booking.updated",
                "timestamp": datetime.utcnow().isoformat(),
                "source_service": MY_SERVICE_NAME,
                "data": {
                    "booking_id": booking_id,
                    "status": status,
                    "tour_id": tour_id,
                    **(metadata or {})
                }
            }

            payload_str = json.dumps(payload)
            signature = HMACValidator.generate_signature(payload_str, self.secret)

            headers = {
                "Content-Type": "application/json",
                "X-Webhook-Signature": signature,
                "X-Webhook-Source": MY_SERVICE_NAME
            }

            response = await self._async_post(
                f"{self.partner_url}/webhooks/partner",
                content=payload_str,
                headers=headers
            )

            return {
                "success": response.status_code in [200, 201, 202],
                "status_code": response.status_code,
                "response": response.json() if response.text else {}
            }

        except Exception as e:
            logger.error(f"❌ Error en booking.updated: {str(e)}")
            return {"success": False, "error": str(e)}

    async def _async_post(self, url: str, content: str, headers: Dict[str, str]) -> httpx.Response:
        """Wrapper para petición async POST."""
        async with httpx.AsyncClient() as client:
            return await client.post(url, content=content, headers=headers)


class WebhookEventValidator:
    """
    Valida y procesa eventos recibidos de partners.
    """

    @staticmethod
    def validate_partner_event(
        payload_str: str,
        signature: str,
        secret: str = MY_WEBHOOK_SECRET
    ) -> tuple[bool, Optional[Dict[str, Any]]]:
        """
        Valida evento de partner.
        
        Returns:
            Tupla (is_valid, payload_dict)
        """
        # Verificar firma
        if not HMACValidator.verify_signature(payload_str, signature, secret):
            logger.warning("⚠️ Firma HMAC inválida en webhook de partner")
            return False, None

        try:
            payload = json.loads(payload_str)
            return True, payload
        except json.JSONDecodeError as e:
            logger.error(f"❌ Error decodificando payload: {e}")
            return False, None

    @staticmethod
    def process_booking_confirmed(event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Procesa evento 'booking.confirmed' del grupo partner.
        
        Ejemplo payload:
        {
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
        }
        """
        logger.info(f"📥 Procesando evento booking.confirmed del partner")
        
        data = event_data.get("data", {})
        
        return {
            "processed": True,
            "booking_id": data.get("booking_id"),
            "user_id": data.get("user_id"),
            "message": "Reserva de hotel confirmada. Se puede enviar paquete turístico relacionado."
        }

    @staticmethod
    def process_payment_success(event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Procesa evento 'payment.success'."""
        logger.info("💳 Procesando evento payment.success")
        data = event_data.get("data", {})
        return {
            "processed": True,
            "payment_id": data.get("payment_id"),
            "message": "Pago procesado exitosamente"
        }


# Instancia global del cliente
partner_client = PartnerWebhookClient()
