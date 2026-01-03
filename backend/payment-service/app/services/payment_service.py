"""
Payment Service - Lógica de pagos
"""
from typing import Dict, Optional
from uuid import uuid4
from .app.adapters import (
    PaymentProvider,
    MockAdapter,
    StripeAdapter,
    MercadoPagoAdapter
)
from config import PAYMENT_PROVIDER


class PaymentService:
    """Servicio de pagos con inyección de adapter"""

    def __init__(self, provider: PaymentProvider = None):
        """Inicializar con adapter específico o usar del config"""
        if provider:
            self.provider = provider
        else:
            self.provider = self._get_provider_from_config()

    @staticmethod
    def _get_provider_from_config() -> PaymentProvider:
        """Factory method - obtener provider según configuración"""
        if PAYMENT_PROVIDER == "stripe":
            return StripeAdapter()
        elif PAYMENT_PROVIDER == "mercadopago":
            return MercadoPagoAdapter()
        else:  # default a mock
            return MockAdapter()

    async def process_payment(
        self,
        amount: float,
        currency: str,
        description: str,
        user_id: str,
        metadata: Dict = None
    ):
        """Procesar pago delegando al adapter"""
        return await self.provider.process_payment(
            amount=amount,
            currency=currency,
            description=description,
            user_id=user_id,
            metadata=metadata
        )

    async def get_payment_status(self, transaction_id: str):
        """Obtener estado de pago"""
        return await self.provider.get_payment_status(transaction_id)

    async def refund_payment(self, transaction_id: str, amount: float = None):
        """Reembolsar pago"""
        return await self.provider.refund_payment(transaction_id, amount)

    def validate_webhook(self, payload: Dict, signature: str) -> bool:
        """Validar webhook"""
        return self.provider.validate_webhook(payload, signature)


# Instancia global
payment_service = PaymentService()
