from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from enum import Enum
import stripe
import httpx
from datetime import datetime
from models import PaymentStatus, PaymentProvider


class PaymentResult:
    """Resultado normalizado de una operación de pago"""
    
    def __init__(
        self,
        success: bool,
        external_id: Optional[str] = None,
        status: PaymentStatus = PaymentStatus.PENDING,
        message: Optional[str] = None,
        raw_response: Optional[Dict[str, Any]] = None
    ):
        self.success = success
        self.external_id = external_id
        self.status = status
        self.message = message
        self.raw_response = raw_response or {}


class PaymentProviderInterface(ABC):
    """Interface abstracta para proveedores de pago"""
    
    @abstractmethod
    async def create_payment(
        self,
        amount: float,
        currency: str,
        description: str,
        metadata: Dict[str, Any]
    ) -> PaymentResult:
        """Crea un pago en el proveedor externo"""
        pass
    
    @abstractmethod
    async def get_payment(self, external_id: str) -> PaymentResult:
        """Obtiene el estado de un pago"""
        pass
    
    @abstractmethod
    async def refund_payment(
        self,
        external_id: str,
        amount: Optional[float] = None
    ) -> PaymentResult:
        """Reembolsa un pago"""
        pass
    
    @abstractmethod
    async def cancel_payment(self, external_id: str) -> PaymentResult:
        """Cancela un pago pendiente"""
        pass
    
    @abstractmethod
    def normalize_webhook_event(
        self,
        webhook_payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Normaliza el payload de webhook del proveedor a formato estándar"""
        pass


class MockAdapter(PaymentProviderInterface):
    """Adaptador Mock para testing"""
    
    def __init__(self):
        self.payments: Dict[str, Dict[str, Any]] = {}
    
    async def create_payment(
        self,
        amount: float,
        currency: str,
        description: str,
        metadata: Dict[str, Any]
    ) -> PaymentResult:
        """Simula la creación de un pago"""
        import uuid
        external_id = f"mock_{uuid.uuid4().hex[:16]}"
        
        self.payments[external_id] = {
            "id": external_id,
            "amount": amount,
            "currency": currency,
            "description": description,
            "status": "completed",
            "metadata": metadata,
            "created_at": datetime.utcnow().isoformat()
        }
        
        return PaymentResult(
            success=True,
            external_id=external_id,
            status=PaymentStatus.COMPLETED,
            message="Pago mock creado exitosamente",
            raw_response=self.payments[external_id]
        )
    
    async def get_payment(self, external_id: str) -> PaymentResult:
        """Obtiene un pago simulado"""
        payment = self.payments.get(external_id)
        
        if not payment:
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                message="Pago no encontrado"
            )
        
        return PaymentResult(
            success=True,
            external_id=external_id,
            status=PaymentStatus.COMPLETED,
            raw_response=payment
        )
    
    async def refund_payment(
        self,
        external_id: str,
        amount: Optional[float] = None
    ) -> PaymentResult:
        """Simula reembolso"""
        payment = self.payments.get(external_id)
        
        if not payment:
            return PaymentResult(
                success=False,
                message="Pago no encontrado"
            )
        
        payment["status"] = "refunded"
        payment["refunded_at"] = datetime.utcnow().isoformat()
        
        return PaymentResult(
            success=True,
            external_id=external_id,
            status=PaymentStatus.REFUNDED,
            message="Reembolso mock exitoso",
            raw_response=payment
        )
    
    async def cancel_payment(self, external_id: str) -> PaymentResult:
        """Simula cancelación"""
        payment = self.payments.get(external_id)
        
        if not payment:
            return PaymentResult(
                success=False,
                message="Pago no encontrado"
            )
        
        payment["status"] = "cancelled"
        
        return PaymentResult(
            success=True,
            external_id=external_id,
            status=PaymentStatus.CANCELLED,
            message="Pago mock cancelado",
            raw_response=payment
        )
    
    def normalize_webhook_event(
        self,
        webhook_payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Normaliza webhook mock"""
        return {
            "event_type": webhook_payload.get("type", "payment.success"),
            "external_id": webhook_payload.get("data", {}).get("id"),
            "status": webhook_payload.get("data", {}).get("status", "completed"),
            "amount": webhook_payload.get("data", {}).get("amount"),
            "currency": webhook_payload.get("data", {}).get("currency", "USD"),
            "metadata": webhook_payload.get("data", {}).get("metadata", {}),
            "raw_event": webhook_payload
        }


class StripeAdapter(PaymentProviderInterface):
    """Adaptador para Stripe"""
    
    def __init__(self, api_key: str):
        stripe.api_key = api_key
    
    async def create_payment(
        self,
        amount: float,
        currency: str,
        description: str,
        metadata: Dict[str, Any]
    ) -> PaymentResult:
        """Crea un PaymentIntent en Stripe"""
        try:
            # Stripe usa centavos
            amount_cents = int(amount * 100)
            
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency.lower(),
                description=description,
                metadata=metadata,
                automatic_payment_methods={"enabled": True}
            )
            
            # Mapear status de Stripe a nuestro modelo
            status_map = {
                "requires_payment_method": PaymentStatus.PENDING,
                "requires_confirmation": PaymentStatus.PENDING,
                "requires_action": PaymentStatus.PENDING,
                "processing": PaymentStatus.PROCESSING,
                "succeeded": PaymentStatus.COMPLETED,
                "canceled": PaymentStatus.CANCELLED,
            }
            
            status = status_map.get(
                payment_intent.status,
                PaymentStatus.PENDING
            )
            
            return PaymentResult(
                success=True,
                external_id=payment_intent.id,
                status=status,
                message=f"PaymentIntent creado: {payment_intent.status}",
                raw_response=payment_intent.to_dict()
            )
            
        except stripe.error.StripeError as e:
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                message=str(e),
                raw_response={"error": str(e)}
            )
    
    async def get_payment(self, external_id: str) -> PaymentResult:
        """Obtiene un PaymentIntent de Stripe"""
        try:
            payment_intent = stripe.PaymentIntent.retrieve(external_id)
            
            status_map = {
                "requires_payment_method": PaymentStatus.PENDING,
                "requires_confirmation": PaymentStatus.PENDING,
                "requires_action": PaymentStatus.PENDING,
                "processing": PaymentStatus.PROCESSING,
                "succeeded": PaymentStatus.COMPLETED,
                "canceled": PaymentStatus.CANCELLED,
            }
            
            status = status_map.get(
                payment_intent.status,
                PaymentStatus.PENDING
            )
            
            return PaymentResult(
                success=True,
                external_id=payment_intent.id,
                status=status,
                raw_response=payment_intent.to_dict()
            )
            
        except stripe.error.StripeError as e:
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                message=str(e)
            )
    
    async def refund_payment(
        self,
        external_id: str,
        amount: Optional[float] = None
    ) -> PaymentResult:
        """Crea un reembolso en Stripe"""
        try:
            refund_params = {"payment_intent": external_id}
            
            if amount is not None:
                refund_params["amount"] = int(amount * 100)
            
            refund = stripe.Refund.create(**refund_params)
            
            return PaymentResult(
                success=True,
                external_id=refund.id,
                status=PaymentStatus.REFUNDED,
                message="Reembolso creado",
                raw_response=refund.to_dict()
            )
            
        except stripe.error.StripeError as e:
            return PaymentResult(
                success=False,
                message=str(e)
            )
    
    async def cancel_payment(self, external_id: str) -> PaymentResult:
        """Cancela un PaymentIntent en Stripe"""
        try:
            payment_intent = stripe.PaymentIntent.cancel(external_id)
            
            return PaymentResult(
                success=True,
                external_id=payment_intent.id,
                status=PaymentStatus.CANCELLED,
                message="PaymentIntent cancelado",
                raw_response=payment_intent.to_dict()
            )
            
        except stripe.error.StripeError as e:
            return PaymentResult(
                success=False,
                message=str(e)
            )
    
    def normalize_webhook_event(
        self,
        webhook_payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Normaliza eventos de webhook de Stripe"""
        event_type = webhook_payload.get("type", "")
        data = webhook_payload.get("data", {}).get("object", {})
        
        # Mapear eventos de Stripe a nuestros eventos
        event_map = {
            "payment_intent.succeeded": "payment.success",
            "payment_intent.payment_failed": "payment.failed",
            "charge.refunded": "payment.refunded",
        }
        
        normalized_event = event_map.get(event_type, event_type)
        
        return {
            "event_type": normalized_event,
            "external_id": data.get("id"),
            "status": data.get("status"),
            "amount": data.get("amount", 0) / 100,  # Convertir de centavos
            "currency": data.get("currency", "USD").upper(),
            "metadata": data.get("metadata", {}),
            "raw_event": webhook_payload
        }


class MercadoPagoAdapter(PaymentProviderInterface):
    """Adaptador para MercadoPago"""
    
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://api.mercadopago.com"
    
    async def create_payment(
        self,
        amount: float,
        currency: str,
        description: str,
        metadata: Dict[str, Any]
    ) -> PaymentResult:
        """Crea un pago en MercadoPago"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/v1/payments",
                    headers={
                        "Authorization": f"Bearer {self.access_token}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "transaction_amount": amount,
                        "description": description,
                        "payment_method_id": "master",  # Ejemplo
                        "payer": {
                            "email": metadata.get("email", "test@test.com")
                        },
                        "metadata": metadata
                    }
                )
                
                if response.status_code in [200, 201]:
                    data = response.json()
                    
                    status_map = {
                        "pending": PaymentStatus.PENDING,
                        "approved": PaymentStatus.COMPLETED,
                        "rejected": PaymentStatus.FAILED,
                        "cancelled": PaymentStatus.CANCELLED,
                    }
                    
                    status = status_map.get(
                        data.get("status"),
                        PaymentStatus.PENDING
                    )
                    
                    return PaymentResult(
                        success=True,
                        external_id=str(data.get("id")),
                        status=status,
                        message="Pago MercadoPago creado",
                        raw_response=data
                    )
                else:
                    return PaymentResult(
                        success=False,
                        status=PaymentStatus.FAILED,
                        message=f"Error {response.status_code}",
                        raw_response=response.json()
                    )
                    
        except Exception as e:
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                message=str(e)
            )
    
    async def get_payment(self, external_id: str) -> PaymentResult:
        """Obtiene un pago de MercadoPago"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/v1/payments/{external_id}",
                    headers={
                        "Authorization": f"Bearer {self.access_token}"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    status_map = {
                        "pending": PaymentStatus.PENDING,
                        "approved": PaymentStatus.COMPLETED,
                        "rejected": PaymentStatus.FAILED,
                        "cancelled": PaymentStatus.CANCELLED,
                    }
                    
                    status = status_map.get(
                        data.get("status"),
                        PaymentStatus.PENDING
                    )
                    
                    return PaymentResult(
                        success=True,
                        external_id=external_id,
                        status=status,
                        raw_response=data
                    )
                else:
                    return PaymentResult(
                        success=False,
                        status=PaymentStatus.FAILED,
                        message="Pago no encontrado"
                    )
                    
        except Exception as e:
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                message=str(e)
            )
    
    async def refund_payment(
        self,
        external_id: str,
        amount: Optional[float] = None
    ) -> PaymentResult:
        """Reembolsa un pago en MercadoPago"""
        try:
            async with httpx.AsyncClient() as client:
                payload = {}
                if amount:
                    payload["amount"] = amount
                
                response = await client.post(
                    f"{self.base_url}/v1/payments/{external_id}/refunds",
                    headers={
                        "Authorization": f"Bearer {self.access_token}",
                        "Content-Type": "application/json"
                    },
                    json=payload
                )
                
                if response.status_code in [200, 201]:
                    return PaymentResult(
                        success=True,
                        external_id=external_id,
                        status=PaymentStatus.REFUNDED,
                        message="Reembolso exitoso",
                        raw_response=response.json()
                    )
                else:
                    return PaymentResult(
                        success=False,
                        message="Error al reembolsar"
                    )
                    
        except Exception as e:
            return PaymentResult(
                success=False,
                message=str(e)
            )
    
    async def cancel_payment(self, external_id: str) -> PaymentResult:
        """Cancela un pago en MercadoPago"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.put(
                    f"{self.base_url}/v1/payments/{external_id}",
                    headers={
                        "Authorization": f"Bearer {self.access_token}",
                        "Content-Type": "application/json"
                    },
                    json={"status": "cancelled"}
                )
                
                if response.status_code == 200:
                    return PaymentResult(
                        success=True,
                        external_id=external_id,
                        status=PaymentStatus.CANCELLED,
                        message="Pago cancelado",
                        raw_response=response.json()
                    )
                else:
                    return PaymentResult(
                        success=False,
                        message="Error al cancelar"
                    )
                    
        except Exception as e:
            return PaymentResult(
                success=False,
                message=str(e)
            )
    
    def normalize_webhook_event(
        self,
        webhook_payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Normaliza eventos de webhook de MercadoPago"""
        event_type = webhook_payload.get("type", "")
        data = webhook_payload.get("data", {})
        
        # Mapear eventos
        event_map = {
            "payment.updated": "payment.success",
            "payment.created": "payment.success",
        }
        
        normalized_event = event_map.get(event_type, event_type)
        
        return {
            "event_type": normalized_event,
            "external_id": str(data.get("id")),
            "status": data.get("status"),
            "amount": data.get("transaction_amount"),
            "currency": data.get("currency_id", "USD"),
            "metadata": data.get("metadata", {}),
            "raw_event": webhook_payload
        }


def get_payment_adapter(
    provider: PaymentProvider,
    stripe_key: Optional[str] = None,
    mercadopago_token: Optional[str] = None
) -> PaymentProviderInterface:
    """
    Factory para obtener el adapter apropiado
    
    Args:
        provider: Proveedor de pago
        stripe_key: API key de Stripe (opcional)
        mercadopago_token: Token de MercadoPago (opcional)
    
    Returns:
        Instancia del adapter correspondiente
    """
    if provider == PaymentProvider.MOCK:
        return MockAdapter()
    elif provider == PaymentProvider.STRIPE:
        if not stripe_key:
            raise ValueError("Se requiere stripe_key para StripeAdapter")
        return StripeAdapter(stripe_key)
    elif provider == PaymentProvider.MERCADOPAGO:
        if not mercadopago_token:
            raise ValueError("Se requiere mercadopago_token para MercadoPagoAdapter")
        return MercadoPagoAdapter(mercadopago_token)
    else:
        raise ValueError(f"Proveedor no soportado: {provider}")
