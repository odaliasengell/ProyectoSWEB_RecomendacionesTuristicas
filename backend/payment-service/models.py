from datetime import datetime
from typing import Optional, List, Dict, Any
from beanie import Document
from pydantic import Field
from enum import Enum


class PaymentStatus(str, Enum):
    """Estados de pago"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class PaymentProvider(str, Enum):
    """Proveedores de pago"""
    MOCK = "mock"
    STRIPE = "stripe"
    MERCADOPAGO = "mercadopago"


class WebhookEventType(str, Enum):
    """Tipos de eventos de webhook"""
    # Payment events
    PAYMENT_SUCCESS = "payment.success"
    PAYMENT_FAILED = "payment.failed"
    PAYMENT_REFUNDED = "payment.refunded"
    
    # Booking events
    BOOKING_CONFIRMED = "booking.confirmed"
    BOOKING_CANCELLED = "booking.cancelled"
    
    # Order events
    ORDER_CREATED = "order.created"
    ORDER_COMPLETED = "order.completed"
    
    # Service events
    SERVICE_ACTIVATED = "service.activated"
    SERVICE_CANCELLED = "service.cancelled"
    
    # Tour events
    TOUR_PURCHASED = "tour.purchased"
    TOUR_CANCELLED = "tour.cancelled"


class Payment(Document):
    """Modelo de pago"""
    
    amount: float = Field(..., description="Monto del pago")
    currency: str = Field(default="USD", description="Moneda")
    status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    provider: PaymentProvider = Field(..., description="Proveedor de pago")
    
    # IDs externos
    external_id: Optional[str] = Field(None, description="ID del proveedor externo")
    user_id: str = Field(..., description="ID del usuario")
    order_id: Optional[str] = Field(None, description="ID de la orden/reserva")
    
    # Metadata
    description: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    class Settings:
        name = "payments"
        indexes = [
            "external_id",
            "user_id",
            "order_id",
            "status",
            "created_at",
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "amount": 100.00,
                "currency": "USD",
                "status": "completed",
                "provider": "stripe",
                "external_id": "pi_1234567890",
                "user_id": "user123",
                "order_id": "order456",
                "description": "Pago de reserva de tour"
            }
        }


class Partner(Document):
    """Modelo de partner para webhooks"""
    
    name: str = Field(..., description="Nombre del partner")
    webhook_url: str = Field(..., description="URL del webhook")
    secret: str = Field(..., description="Secret compartido para HMAC")
    
    # Eventos suscritos
    subscribed_events: List[WebhookEventType] = Field(
        default_factory=list,
        description="Eventos a los que está suscrito"
    )
    
    # Status
    is_active: bool = Field(default=True, description="Si el partner está activo")
    
    # Metadata
    contact_email: Optional[str] = None
    description: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_ping: Optional[datetime] = None
    
    class Settings:
        name = "partners"
        indexes = [
            "name",
            "webhook_url",
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Hotel Paradise",
                "webhook_url": "https://hotel-paradise.com/webhooks/tourism",
                "subscribed_events": ["booking.confirmed", "payment.success"],
                "contact_email": "dev@hotel-paradise.com",
                "is_active": True
            }
        }


class WebhookLog(Document):
    """Log de webhooks enviados/recibidos"""
    
    # Información del webhook
    event_type: WebhookEventType = Field(..., description="Tipo de evento")
    direction: str = Field(..., description="incoming o outgoing")
    
    # Partner
    partner_id: Optional[str] = Field(None, description="ID del partner")
    partner_name: Optional[str] = Field(None, description="Nombre del partner")
    
    # Request/Response
    url: str = Field(..., description="URL del webhook")
    payload: Dict[str, Any] = Field(..., description="Payload del webhook")
    headers: Dict[str, str] = Field(default_factory=dict)
    
    # Status
    status_code: Optional[int] = None
    success: bool = Field(default=False)
    error_message: Optional[str] = None
    
    # HMAC
    signature: Optional[str] = Field(None, description="Firma HMAC")
    signature_verified: Optional[bool] = None
    
    # Retry
    retry_count: int = Field(default=0)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    class Settings:
        name = "webhook_logs"
        indexes = [
            "event_type",
            "direction",
            "partner_id",
            "created_at",
            "success",
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "event_type": "booking.confirmed",
                "direction": "outgoing",
                "partner_name": "Hotel Paradise",
                "url": "https://hotel-paradise.com/webhooks/tourism",
                "payload": {
                    "event": "booking.confirmed",
                    "data": {
                        "booking_id": "booking123",
                        "user_id": "user456"
                    }
                },
                "status_code": 200,
                "success": True
            }
        }
