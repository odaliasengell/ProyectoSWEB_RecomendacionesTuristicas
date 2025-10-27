from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AdminBase(BaseModel):
    nombre: str
    email: str
    username: str
    activo: bool = True

class AdminCreate(BaseModel):
    nombre: str
    email: str
    username: str
    contraseña: str

class AdminLogin(BaseModel):
    username: str
    contraseña: str

class AdminResponse(AdminBase):
    id_admin: int
    fecha_creacion: datetime
    ultimo_acceso: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class AdminInfo(BaseModel):
    username: str
    email: str
    nombre: str

class AdminToken(BaseModel):
    access_token: str
    token_type: str
    admin: AdminInfo