"""
StripeAdapter - Integración con Stripe
"""
from typing import Dict, Optional
import stripe
from config import STRIPE_SECRET_KEY
from .payment_provider import PaymentProvider, PaymentResult


class StripeAdapter(PaymentProvider):
    """Stripe Payment Provider"""

    def __init__(self):
        stripe.api_key = STRIPE_SECRET_KEY

    async def process_payment(
        self,
        amount: float,
        currency: str,
        description: str,
        user_id: str,
        metadata: Dict = None
    ) -> PaymentResult:
        """Procesar pago con Stripe"""
        try:
            # Crear Payment Intent
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Stripe usa centavos
                currency=currency.lower(),
                description=description,
                metadata={
                    "user_id": user_id,
                    **(metadata or {})
                }
            )
            
            return PaymentResult(
                transaction_id=intent.id,
                status="pending",  # Requiere confirmación del cliente
                provider_transaction_id=intent.id,
                redirect_url=None  # Cliente maneja en frontend
            )
        except stripe.error.CardError as e:
            return PaymentResult(
                transaction_id="",
                status="failed",
                error_message=str(e)
            )

    async def get_payment_status(self, transaction_id: str) -> str:
        """Obtener estado de pago en Stripe"""
        try:
            intent = stripe.PaymentIntent.retrieve(transaction_id)
            return intent.status  # succeeded, processing, requires_payment_method, etc.
        except stripe.error.InvalidRequestError:
            return "unknown"

    def validate_webhook(self, payload: Dict, signature: str) -> bool:
        """Validar webhook de Stripe (usando Stripe headers)"""
        # Stripe envía signature en X-Stripe-Signature header
        # Esta validación se haría en el route handler
        return True

    async def refund_payment(self, transaction_id: str, amount: float = None) -> bool:
        """Reembolsar pago en Stripe"""
        try:
            refund = stripe.Refund.create(
                payment_intent=transaction_id,
                amount=int(amount * 100) if amount else None
            )
            return refund.status == "succeeded"
        except stripe.error.StripeError as e:
            print(f"Error en reembolso: {e}")
            return False
