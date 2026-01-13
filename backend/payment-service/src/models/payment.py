"""
Modelos de Payment
Autor: Odalis Senge
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class PaymentCreate(BaseModel):
    """Schema para crear un pago"""
    amount: float = Field(..., gt=0)
    currency: str = Field(default="USD")
    description: str
    customer_email: str
    metadata: Optional[Dict[str, Any]] = None


class PaymentResponse(BaseModel):
    """Schema de respuesta de pago"""
    id: str
    amount: float
    currency: str
    status: str  # pending, completed, failed, refunded
    description: str
    customer_email: str
    provider: str
    provider_payment_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime


class PaymentUpdate(BaseModel):
    """Schema para actualizar un pago"""
    status: Optional[str] = None
    provider_payment_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
