"""
Interface abstracta para Payment Providers
Patrón Adapter para abstracción de pasarelas
Autor: Odalis Senge
"""

from abc import ABC, abstractmethod
from typing import Dict, Any
from datetime import datetime


class PaymentProvider(ABC):
    """Interface abstracta para proveedores de pago"""
    
    @abstractmethod
    async def create_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crear un pago
        
        Args:
            payment_data: Datos del pago normalizados
        
        Returns:
            Respuesta normalizada del pago
        """
        pass
    
    @abstractmethod
    async def get_payment_status(self, payment_id: str) -> str:
        """
        Obtener estado de un pago
        
        Args:
            payment_id: ID del pago
        
        Returns:
            Estado del pago (pending, completed, failed, refunded)
        """
        pass
    
    @abstractmethod
    async def process_webhook(self, payload: Dict[str, Any], signature: str) -> Dict[str, Any]:
        """
        Procesar webhook de la pasarela
        
        Args:
            payload: Datos del webhook
            signature: Firma del webhook
        
        Returns:
            Datos normalizados del evento
        """
        pass
    
    @abstractmethod
    def normalize_webhook_event(self, raw_event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalizar evento de webhook a formato común
        
        Args:
            raw_event: Evento crudo de la pasarela
        
        Returns:
            Evento normalizado
        """
        pass


class PaymentResponse:
    """Respuesta normalizada de pago"""
    
    def __init__(
        self,
        payment_id: str,
        status: str,
        amount: float,
        currency: str,
        created_at: datetime,
        provider: str,
        metadata: Dict[str, Any] = None
    ):
        self.payment_id = payment_id
        self.status = status
        self.amount = amount
        self.currency = currency
        self.created_at = created_at
        self.provider = provider
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "payment_id": self.payment_id,
            "status": self.status,
            "amount": self.amount,
            "currency": self.currency,
            "created_at": self.created_at.isoformat(),
            "provider": self.provider,
            "metadata": self.metadata
        }


class WebhookEvent:
    """Evento de webhook normalizado"""
    
    def __init__(
        self,
        event_id: str,
        event_type: str,
        payment_id: str,
        status: str,
        provider: str,
        timestamp: datetime,
        data: Dict[str, Any] = None
    ):
        self.event_id = event_id
        self.event_type = event_type
        self.payment_id = payment_id
        self.status = status
        self.provider = provider
        self.timestamp = timestamp
        self.data = data or {}
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "payment_id": self.payment_id,
            "status": self.status,
            "provider": self.provider,
            "timestamp": self.timestamp.isoformat(),
            "data": self.data
        }
