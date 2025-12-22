"""
Modelos para gestión de tokens JWT: refresh tokens y tokens revocados.
"""
from beanie import Document
from pydantic import Field, ConfigDict
from datetime import datetime
from typing import Optional


class RefreshToken(Document):
    """Almacena refresh tokens válidos para renovación de access tokens."""
    user_id: str = Field(..., index=True)
    email: str = Field(..., index=True)
    token: str = Field(..., unique=True, index=True)  # El token hasheado
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_valid: bool = True  # Permite revocar sin eliminar

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    )

    class Settings:
        name = "refresh_tokens"
        validate_on_save = False
        use_state_management = False
        use_revision = False
        use_enum_values = True


class TokenRevocado(Document):
    """Almacena tokens revocados (blacklist) para mantener control."""
    user_id: str = Field(..., index=True)
    email: str = Field(..., index=True)
    token: str = Field(..., unique=True, index=True)
    razón: Optional[str] = None  # logout, password_changed, etc.
    revocado_en: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime  # Cuando el token hubiese expirado naturalmente

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    )

    class Settings:
        name = "tokens_revocados"
        validate_on_save = False
        use_state_management = False
        use_revision = False
        use_enum_values = True
