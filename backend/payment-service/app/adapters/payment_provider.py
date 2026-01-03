"""
Interfaz abstracta para Payment Providers
"""
from abc import ABC, abstractmethod
from typing import Dict, Optional
from dataclasses import dataclass


@dataclass
class PaymentResult:
    """Resultado de procesamiento de pago"""
    transaction_id: str
    status: str  # "completed", "pending", "failed"
    provider_transaction_id: Optional[str] = None
    redirect_url: Optional[str] = None
    error_message: Optional[str] = None


class PaymentProvider(ABC):
    """Interfaz abstracta para proveedores de pago"""

    @abstractmethod
    async def process_payment(
        self,
        amount: float,
        currency: str,
        description: str,
        user_id: str,
        metadata: Dict = None
    ) -> PaymentResult:
        """Procesar un pago"""
        pass

    @abstractmethod
    async def get_payment_status(self, transaction_id: str) -> str:
        """Obtener estado de un pago"""
        pass

    @abstractmethod
    def validate_webhook(self, payload: Dict, signature: str) -> bool:
        """Validar webhook recibido de proveedor"""
        pass

    @abstractmethod
    async def refund_payment(self, transaction_id: str, amount: float = None) -> bool:
        """Reembolsar un pago"""
        pass
