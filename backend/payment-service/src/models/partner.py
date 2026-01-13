"""
Modelos de Partner
Autor: Odalis Senge
"""
from pydantic import BaseModel, HttpUrl
from typing import List
from datetime import datetime


class PartnerCreate(BaseModel):
    """Schema para registrar un partner"""
    name: str
    webhook_url: HttpUrl
    events: List[str] = ["payment.completed", "payment.failed"]


class PartnerResponse(BaseModel):
    """Schema de respuesta de partner"""
    id: str
    name: str
    webhook_url: str
    events: List[str]
    secret_key: str
    active: bool
    created_at: datetime
