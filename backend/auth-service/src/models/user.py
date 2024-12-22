"""
Modelo de Usuario para Auth Service
Autor: Odalis Senge
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Validador personalizado para ObjectId de MongoDB"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


class User(BaseModel):
    """Modelo de Usuario"""
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: EmailStr
    hashed_password: str
    nombre: str
    apellido: Optional[str] = None
    rol: str = "user"  # user, admin, guia
    activo: bool = True
    verificado: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    ultimo_acceso: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserCreate(BaseModel):
    """Schema para crear usuario"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    nombre: str = Field(..., min_length=2)
    apellido: Optional[str] = None
    rol: str = "user"


class UserLogin(BaseModel):
    """Schema para login"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema de respuesta de usuario (sin password)"""
    id: str
    email: EmailStr
    nombre: str
    apellido: Optional[str] = None
    rol: str
    activo: bool
    verificado: bool
    created_at: datetime
    ultimo_acceso: Optional[datetime] = None


class UserInDB(User):
    """Usuario en base de datos"""
    hashed_password: str
