"""
Mock Adapter para desarrollo
Simula pasarela de pago sin conexión externa
Autor: Odalis Senge
"""

from typing import Dict, Any
from datetime import datetime
import uuid
from .payment_provider import PaymentProvider, PaymentResponse, WebhookEvent


class MockAdapter(PaymentProvider):
    """Adapter simulado para desarrollo"""
    
    def __init__(self):
        self.payments = {}
    
    async def create_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crear pago simulado"""
        payment_id = f"mock_{uuid.uuid4().hex[:12]}"
        
        payment = PaymentResponse(
            payment_id=payment_id,
            status="completed",  # Siempre exitoso en mock
            amount=payment_data.get("amount", 0),
            currency=payment_data.get("currency", "USD"),
            created_at=datetime.utcnow(),
            provider="mock",
            metadata=payment_data.get("metadata", {})
        )
        
        self.payments[payment_id] = payment
        return payment.to_dict()
    
    async def get_payment_status(self, payment_id: str) -> str:
        """Obtener estado del pago"""
        if payment_id in self.payments:
            return self.payments[payment_id].status
        return "not_found"
    
    async def process_webhook(self, payload: Dict[str, Any], signature: str) -> Dict[str, Any]:
        """Procesar webhook (mock)"""
        # En mock, no verificamos la firma
        return self.normalize_webhook_event(payload)
    
    def normalize_webhook_event(self, raw_event: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizar evento"""
        event = WebhookEvent(
            event_id=f"evt_{uuid.uuid4().hex[:12]}",
            event_type=raw_event.get("type", "payment.success"),
            payment_id=raw_event.get("payment_id", ""),
            status="completed",
            provider="mock",
            timestamp=datetime.utcnow(),
            data=raw_event
        )
        
        return event.to_dict()
