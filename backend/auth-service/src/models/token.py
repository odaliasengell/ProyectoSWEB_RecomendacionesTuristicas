"""
Modelo de Token para Auth Service
Autor: Odalis Senge
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class RefreshToken(BaseModel):
    """Modelo de Refresh Token"""
    id: Optional[str] = Field(alias="_id", default=None)
    token: str
    user_id: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    revoked: bool = False
    device_info: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class RevokedToken(BaseModel):
    """Modelo de Token Revocado (Blacklist)"""
    id: Optional[str] = Field(alias="_id", default=None)
    token: str
    user_id: str
    revoked_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    reason: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class TokenResponse(BaseModel):
    """Schema de respuesta de tokens"""
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int  # Segundos hasta expiración


class TokenRefresh(BaseModel):
    """Schema para renovar token"""
    refresh_token: str
