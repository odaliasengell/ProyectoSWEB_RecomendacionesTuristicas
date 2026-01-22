from pydantic import BaseModel, Field, EmailStr, field_serializer
from typing import Optional, List, Dict, Any
from datetime import datetime
from models import PaymentStatus, PaymentProvider, WebhookEventType
from beanie import PydanticObjectId


# ==================== Payment Schemas ====================

class CreatePaymentRequest(BaseModel):
    """Request para crear un pago"""
    amount: float = Field(..., gt=0, description="Monto del pago")
    currency: str = Field(default="USD", description="Moneda")
    provider: PaymentProvider = Field(..., description="Proveedor de pago")
    description: Optional[str] = None
    order_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_schema_extra = {
            "example": {
                "amount": 150.00,
                "currency": "USD",
                "provider": "mock",
                "description": "Reserva de tour a Galápagos",
                "order_id": "booking_12345",
                "metadata": {
                    "tour_id": "tour_galapagos_001",
                    "user_email": "cliente@example.com"
                }
            }
        }


class PaymentResponse(BaseModel):
    """Response de un pago"""
    id: str
    amount: float
    currency: str
    status: PaymentStatus
    provider: PaymentProvider
    external_id: Optional[str] = None
    user_id: str
    order_id: Optional[str] = None
    description: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('id')
    def serialize_id(self, value: Any) -> str:
        """Serializa ObjectId a string"""
        return str(value)
    
    class Config:
        from_attributes = True
        arbitrary_types_allowed = True


class RefundPaymentRequest(BaseModel):
    """Request para reembolsar un pago"""
    amount: Optional[float] = Field(None, gt=0, description="Monto a reembolsar (opcional, por defecto total)")
    reason: Optional[str] = None


# ==================== Partner Schemas ====================

class RegisterPartnerRequest(BaseModel):
    """Request para registrar un partner"""
    name: str = Field(..., min_length=3, description="Nombre del partner")
    webhook_url: str = Field(..., description="URL del webhook")
    subscribed_events: List[WebhookEventType] = Field(
        ...,
        description="Eventos a los que se suscribe"
    )
    contact_email: Optional[EmailStr] = None
    description: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Hotel Paradise",
                "webhook_url": "https://hotel-paradise.com/webhooks/tourism",
                "subscribed_events": ["booking.confirmed", "payment.success"],
                "contact_email": "dev@hotel-paradise.com",
                "description": "Hotel en Quito que ofrece paquetes turísticos"
            }
        }


class PartnerResponse(BaseModel):
    """Response de un partner"""
    id: str
    name: str
    webhook_url: str
    secret: str = Field(..., description="Secret compartido para HMAC")
    subscribed_events: List[WebhookEventType]
    is_active: bool
    contact_email: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    
    @field_serializer('id')
    def serialize_id(self, value: Any) -> str:
        """Serializa ObjectId a string"""
        return str(value)
    
    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "id": "partner_123abc",
                "name": "Hotel Paradise",
                "webhook_url": "https://hotel-paradise.com/webhooks/tourism",
                "secret": "whs_AbCdEf1234567890",
                "subscribed_events": ["booking.confirmed", "payment.success"],
                "is_active": True,
                "contact_email": "dev@hotel-paradise.com",
                "created_at": "2024-01-15T10:30:00Z"
            }
        }


class UpdatePartnerRequest(BaseModel):
    """Request para actualizar un partner"""
    webhook_url: Optional[str] = None
    subscribed_events: Optional[List[WebhookEventType]] = None
    is_active: Optional[bool] = None
    contact_email: Optional[EmailStr] = None
    description: Optional[str] = None


# ==================== Webhook Schemas ====================

class WebhookPayload(BaseModel):
    """Payload estándar de webhook"""
    event: WebhookEventType = Field(..., description="Tipo de evento")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    service: str = Field(default="TurismoEcuador", description="Servicio que envía")
    data: Dict[str, Any] = Field(..., description="Datos del evento")
    
    class Config:
        json_schema_extra = {
            "example": {
                "event": "booking.confirmed",
                "timestamp": "2024-01-15T10:30:00Z",
                "service": "TurismoEcuador",
                "data": {
                    "booking_id": "booking_12345",
                    "tour_id": "tour_galapagos_001",
                    "user_id": "user_789",
                    "amount": 150.00,
                    "currency": "USD",
                    "booking_date": "2024-02-01"
                }
            }
        }


class SendWebhookRequest(BaseModel):
    """Request para enviar un webhook manualmente"""
    event: WebhookEventType
    data: Dict[str, Any]
    partner_ids: Optional[List[str]] = Field(
        None,
        description="IDs de partners específicos (opcional, por defecto todos los suscritos)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "event": "tour.purchased",
                "data": {
                    "tour_id": "tour_galapagos_001",
                    "user_id": "user_789",
                    "amount": 150.00
                }
            }
        }


class IncomingWebhook(BaseModel):
    """Webhook entrante de un partner"""
    event: str
    data: Dict[str, Any]
    timestamp: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "event": "service.activated",
                "timestamp": "2024-01-15T10:30:00Z",
                "data": {
                    "service_id": "hotel_room_101",
                    "booking_id": "booking_12345",
                    "status": "confirmed"
                }
            }
        }


class WebhookLogResponse(BaseModel):
    """Response de un log de webhook"""
    id: str
    event_type: WebhookEventType
    direction: str
    partner_name: Optional[str] = None
    url: str
    status_code: Optional[int] = None
    success: bool
    error_message: Optional[str] = None
    retry_count: int
    created_at: datetime
    
    @field_serializer('id')
    def serialize_id(self, value: Any) -> str:
        """Serializa ObjectId a string"""
        return str(value)
    
    class Config:
        from_attributes = True
        arbitrary_types_allowed = True


# ==================== General Responses ====================

class MessageResponse(BaseModel):
    """Response genérico con mensaje"""
    message: str
    success: bool = True
    data: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Response de error"""
    detail: str
    error_code: Optional[str] = None
