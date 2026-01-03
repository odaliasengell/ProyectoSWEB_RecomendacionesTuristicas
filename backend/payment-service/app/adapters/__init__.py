"""
__init__.py - Exportar adapters
"""
from .payment_provider import PaymentProvider, PaymentResult
from .mock_adapter import MockAdapter
from .stripe_adapter import StripeAdapter
from .mercadopago_adapter import MercadoPagoAdapter

__all__ = [
    "PaymentProvider",
    "PaymentResult",
    "MockAdapter",
    "StripeAdapter",
    "MercadoPagoAdapter",
]
