from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import EmailStr, Field
from enum import Enum


class UserRole(str, Enum):
    """Roles de usuario"""
    USER = "user"
    ADMIN = "admin"
    GUIDE = "guide"


class User(Document):
    """Modelo de usuario para el Auth Service"""
    
    email: EmailStr = Field(..., description="Email del usuario (único)")
    password_hash: str = Field(..., description="Hash de la contraseña")
    full_name: str = Field(..., description="Nombre completo del usuario")
    role: UserRole = Field(default=UserRole.USER, description="Rol del usuario")
    is_active: bool = Field(default=True, description="Indica si el usuario está activo")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
        indexes = [
            "email",  # Índice único para email
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com",
                "password_hash": "$2b$12$...",
                "full_name": "Juan Pérez",
                "role": "user",
                "is_active": True
            }
        }


class RefreshToken(Document):
    """Modelo para almacenar refresh tokens"""
    
    user_id: str = Field(..., description="ID del usuario")
    token: str = Field(..., description="Refresh token")
    expires_at: datetime = Field(..., description="Fecha de expiración")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_revoked: bool = Field(default=False, description="Indica si el token fue revocado")
    
    class Settings:
        name = "refresh_tokens"
        indexes = [
            "token",  # Índice único para token
            "user_id",
            "expires_at",
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "expires_at": "2026-01-25T10:00:00",
                "is_revoked": False
            }
        }


class RevokedToken(Document):
    """Modelo para blacklist de tokens revocados"""
    
    token: str = Field(..., description="Token revocado (JWT)")
    user_id: str = Field(..., description="ID del usuario")
    revoked_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(..., description="Fecha de expiración original del token")
    reason: Optional[str] = Field(None, description="Razón de la revocación")
    
    class Settings:
        name = "revoked_tokens"
        indexes = [
            "token",  # Índice único para token
            "expires_at",  # Para limpiar tokens expirados
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "user_id": "507f1f77bcf86cd799439011",
                "revoked_at": "2026-01-18T10:00:00",
                "expires_at": "2026-01-18T10:15:00",
                "reason": "User logout"
            }
        }
