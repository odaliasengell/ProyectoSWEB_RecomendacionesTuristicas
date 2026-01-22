from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from models import UserRole


class RegisterRequest(BaseModel):
    """Schema para registro de usuario"""
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(..., min_length=8, description="Contraseña (mínimo 8 caracteres)")
    full_name: str = Field(..., min_length=2, description="Nombre completo")
    role: Optional[UserRole] = Field(default=UserRole.USER, description="Rol del usuario")
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Valida que la contraseña tenga requisitos mínimos"""
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        if not any(c.isupper() for c in v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        if not any(c.islower() for c in v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
        if not any(c.isdigit() for c in v):
            raise ValueError('La contraseña debe contener al menos un número')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com",
                "password": "Password123",
                "full_name": "Juan Pérez",
                "role": "user"
            }
        }


class LoginRequest(BaseModel):
    """Schema para login de usuario"""
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(..., description="Contraseña")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com",
                "password": "Password123"
            }
        }


class RefreshTokenRequest(BaseModel):
    """Schema para renovar access token"""
    refresh_token: str = Field(..., description="Refresh token válido")
    
    class Config:
        json_schema_extra = {
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }


class LogoutRequest(BaseModel):
    """Schema para logout"""
    access_token: str = Field(..., description="Access token a revocar")
    refresh_token: Optional[str] = Field(None, description="Refresh token a revocar (opcional)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }


class ValidateTokenRequest(BaseModel):
    """Schema para validar token"""
    token: str = Field(..., description="Token a validar")
    
    class Config:
        json_schema_extra = {
            "example": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }


class UserResponse(BaseModel):
    """Schema de respuesta de usuario"""
    id: str = Field(..., description="ID del usuario")
    email: EmailStr = Field(..., description="Email del usuario")
    full_name: str = Field(..., description="Nombre completo")
    role: UserRole = Field(..., description="Rol del usuario")
    is_active: bool = Field(..., description="Estado del usuario")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "email": "usuario@example.com",
                "full_name": "Juan Pérez",
                "role": "user",
                "is_active": True
            }
        }


class AuthResponse(BaseModel):
    """Schema de respuesta de autenticación exitosa"""
    access_token: str = Field(..., description="Access token JWT (15 min)")
    refresh_token: str = Field(..., description="Refresh token JWT (7 días)")
    token_type: str = Field(default="bearer", description="Tipo de token")
    expires_in: int = Field(..., description="Tiempo de expiración en segundos")
    user: UserResponse = Field(..., description="Datos del usuario")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 900,
                "user": {
                    "id": "507f1f77bcf86cd799439011",
                    "email": "usuario@example.com",
                    "full_name": "Juan Pérez",
                    "role": "user",
                    "is_active": True
                }
            }
        }


class TokenValidationResponse(BaseModel):
    """Schema de respuesta de validación de token"""
    valid: bool = Field(..., description="Indica si el token es válido")
    user_id: Optional[str] = Field(None, description="ID del usuario (si es válido)")
    email: Optional[str] = Field(None, description="Email del usuario (si es válido)")
    role: Optional[UserRole] = Field(None, description="Rol del usuario (si es válido)")
    error: Optional[str] = Field(None, description="Mensaje de error (si es inválido)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "valid": True,
                "user_id": "507f1f77bcf86cd799439011",
                "email": "usuario@example.com",
                "role": "user",
                "error": None
            }
        }
