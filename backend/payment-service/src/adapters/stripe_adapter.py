"""
Stripe Adapter - Implementación para Stripe
Autor: Odalis Senge
"""
from typing import Dict, Any, Optional
from .payment_provider import PaymentProvider
import os


class StripeAdapter(PaymentProvider):
    """Adapter para Stripe"""
    
    def __init__(self):
        self.api_key = os.getenv("STRIPE_API_KEY", "sk_test_mock")
        self.provider_name = "stripe"
    
    async def create_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crear pago en Stripe"""
        
        amount = payment_data.get("amount", 0)
        currency = payment_data.get("currency", "USD")
        customer_email = payment_data.get("customer_email", "")
        
        # TODO: Integración real con Stripe API
        # import stripe
        # stripe.api_key = self.api_key
        # payment_intent = stripe.PaymentIntent.create(
        #     amount=int(amount * 100),  # Stripe usa centavos
        #     currency=currency.lower(),
        #     description=payment_data.get("description"),
        #     metadata=payment_data.get("metadata", {})
        # )
        
        # Mock response por ahora
        return {
            "id": f"pi_mock_{hash(customer_email)}",
            "status": "pending",
            "amount": amount,
            "currency": currency,
            "client_secret": "pi_mock_secret_123"
        }
    
    async def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """Obtener pago de Stripe"""
        return {
            "id": payment_id,
            "status": "completed",
            "amount": 0,
            "currency": "USD"
        }
    
    async def refund_payment(
        self,
        payment_id: str,
        amount: Optional[float] = None
    ) -> Dict[str, Any]:
        """Reembolsar pago en Stripe"""
        return {
            "id": f"re_{payment_id}",
            "status": "refunded",
            "amount": amount or 0
        }
    
    async def cancel_payment(self, payment_id: str) -> Dict[str, Any]:
        """Cancelar pago en Stripe"""
        return {
            "id": payment_id,
            "status": "cancelled"
        }
    
    async def get_payment_status(self, payment_id: str) -> str:
        """Obtener estado de un pago"""
        # En producción: stripe.PaymentIntent.retrieve(payment_id)
        return "completed"
    
    async def process_webhook(self, payload: Dict[str, Any], signature: str) -> Dict[str, Any]:
        """Procesar webhook de Stripe"""
        # En producción: verificar firma con stripe.Webhook.construct_event()
        return self.normalize_webhook_event(payload)
    
    def normalize_webhook_event(self, raw_event: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizar evento de webhook de Stripe"""
        event_type = raw_event.get("type", "")
        
        event_mapping = {
            "payment_intent.succeeded": "payment.completed",
            "payment_intent.payment_failed": "payment.failed",
            "payment_intent.created": "payment.created"
        }
        
        payment_intent = raw_event.get("data", {}).get("object", {})
        
        return {
            "event_type": event_mapping.get(event_type, "payment.unknown"),
            "payment_id": payment_intent.get("id"),
            "status": payment_intent.get("status"),
            "amount": payment_intent.get("amount", 0) / 100,
            "currency": payment_intent.get("currency", "usd")
        }
