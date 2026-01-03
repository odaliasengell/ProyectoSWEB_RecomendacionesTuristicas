"""
MercadoPagoAdapter - Integración con MercadoPago
"""
from typing import Dict, Optional
import mercadopago
from config import MERCADOPAGO_ACCESS_TOKEN
from .payment_provider import PaymentProvider, PaymentResult


class MercadoPagoAdapter(PaymentProvider):
    """MercadoPago Payment Provider - Para Latinoamérica"""

    def __init__(self):
        self.sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)

    async def process_payment(
        self,
        amount: float,
        currency: str,
        description: str,
        user_id: str,
        metadata: Dict = None
    ) -> PaymentResult:
        """Procesar pago con MercadoPago"""
        try:
            payment_data = {
                "transaction_amount": amount,
                "description": description,
                "payment_method_id": "master",
                "payer": {
                    "email": metadata.get("email") if metadata else "test@mercadopago.com"
                },
                "external_reference": user_id
            }
            
            result = self.sdk.payment().create(payment_data)
            
            if result["status"] == 201:
                payment_info = result["response"]
                return PaymentResult(
                    transaction_id=str(payment_info["id"]),
                    status="approved" if payment_info["status"] == "approved" else "pending",
                    provider_transaction_id=str(payment_info["id"])
                )
            else:
                return PaymentResult(
                    transaction_id="",
                    status="failed",
                    error_message=result.get("response", {}).get("message", "Unknown error")
                )
        except Exception as e:
            return PaymentResult(
                transaction_id="",
                status="failed",
                error_message=str(e)
            )

    async def get_payment_status(self, transaction_id: str) -> str:
        """Obtener estado de pago en MercadoPago"""
        try:
            result = self.sdk.payment().get(transaction_id)
            if result["status"] == 200:
                return result["response"]["status"]
            return "unknown"
        except Exception:
            return "unknown"

    def validate_webhook(self, payload: Dict, signature: str) -> bool:
        """Validar webhook de MercadoPago"""
        # MercadoPago usa firma diferente
        # Esta validación depende de los headers específicos de MP
        return True

    async def refund_payment(self, transaction_id: str, amount: float = None) -> bool:
        """Reembolsar pago en MercadoPago"""
        try:
            refund_data = {"amount": amount} if amount else {}
            result = self.sdk.refund().create(transaction_id, refund_data)
            return result["status"] == 201
        except Exception as e:
            print(f"Error en reembolso: {e}")
            return False
