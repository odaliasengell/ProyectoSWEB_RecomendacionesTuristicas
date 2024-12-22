"""
Servicio de Autenticación para Auth Service
Lógica de negocio para registro, login, logout, etc.
Autor: Odalis Senge
"""

from datetime import datetime, timedelta
from typing import Optional, Dict
from src.models.user import User, UserCreate, UserLogin, UserResponse
from src.models.token import RefreshToken, RevokedToken, TokenResponse
from src.services.jwt_service import JWTService
from src.config.database import get_database
from bson import ObjectId


class AuthService:
    """Servicio de autenticación"""
    
    def __init__(self):
        self.db = get_database()
        self.jwt_service = JWTService()
    
    async def register_user(self, user_data: UserCreate) -> UserResponse:
        """Registrar nuevo usuario"""
        # Verificar si el email ya existe
        existing_user = await self.db.users.find_one({"email": user_data.email})
        if existing_user:
            raise ValueError("El email ya está registrado")
        
        # Crear usuario
        hashed_password = self.jwt_service.get_password_hash(user_data.password)
        
        new_user = {
            "email": user_data.email,
            "hashed_password": hashed_password,
            "nombre": user_data.nombre,
            "apellido": user_data.apellido,
            "rol": user_data.rol,
            "activo": True,
            "verificado": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "ultimo_acceso": None
        }
        
        result = await self.db.users.insert_one(new_user)
        new_user["_id"] = result.inserted_id
        
        # Retornar respuesta sin password
        return UserResponse(
            id=str(result.inserted_id),
            email=new_user["email"],
            nombre=new_user["nombre"],
            apellido=new_user["apellido"],
            rol=new_user["rol"],
            activo=new_user["activo"],
            verificado=new_user["verificado"],
            created_at=new_user["created_at"],
            ultimo_acceso=new_user["ultimo_acceso"]
        )
    
    async def login_user(self, credentials: UserLogin) -> TokenResponse:
        """Iniciar sesión y generar tokens"""
        # Buscar usuario
        user = await self.db.users.find_one({"email": credentials.email})
        if not user:
            raise ValueError("Credenciales inválidas")
        
        # Verificar contraseña
        if not self.jwt_service.verify_password(credentials.password, user["hashed_password"]):
            raise ValueError("Credenciales inválidas")
        
        # Verificar que el usuario esté activo
        if not user.get("activo", True):
            raise ValueError("Usuario inactivo")
        
        # Generar tokens
        user_id = str(user["_id"])
        token_data = {
            "sub": user_id,
            "email": user["email"],
            "rol": user.get("rol", "user")
        }
        
        access_token = self.jwt_service.create_access_token(token_data)
        refresh_token = self.jwt_service.create_refresh_token({"sub": user_id})
        
        # Guardar refresh token
        refresh_token_doc = {
            "token": refresh_token,
            "user_id": user_id,
            "expires_at": datetime.utcnow() + timedelta(days=7),
            "created_at": datetime.utcnow(),
            "revoked": False
        }
        await self.db.refresh_tokens.insert_one(refresh_token_doc)
        
        # Actualizar último acceso
        await self.db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"ultimo_acceso": datetime.utcnow()}}
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=15 * 60  # 15 minutos en segundos
        )
    
    async def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        """Renovar access token usando refresh token"""
        # Verificar que el refresh token sea válido
        if not self.jwt_service.verify_token(refresh_token):
            raise ValueError("Refresh token inválido o expirado")
        
        # Verificar que no esté revocado
        revoked = await self.db.revoked_tokens.find_one({"token": refresh_token})
        if revoked:
            raise ValueError("Refresh token revocado")
        
        # Buscar en la BD
        token_doc = await self.db.refresh_tokens.find_one({"token": refresh_token})
        if not token_doc or token_doc.get("revoked"):
            raise ValueError("Refresh token no válido")
        
        # Extraer user_id
        user_id = self.jwt_service.extract_user_id(refresh_token)
        if not user_id:
            raise ValueError("Token inválido")
        
        # Buscar usuario
        user = await self.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise ValueError("Usuario no encontrado")
        
        # Generar nuevo access token
        token_data = {
            "sub": user_id,
            "email": user["email"],
            "rol": user.get("rol", "user")
        }
        
        new_access_token = self.jwt_service.create_access_token(token_data)
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=15 * 60
        )
    
    async def logout_user(self, access_token: str, refresh_token: str) -> bool:
        """Cerrar sesión y revocar tokens"""
        # Extraer user_id del access token
        user_id = self.jwt_service.extract_user_id(access_token)
        if not user_id:
            return False
        
        # Revocar refresh token
        await self.db.refresh_tokens.update_one(
            {"token": refresh_token},
            {"$set": {"revoked": True}}
        )
        
        # Añadir ambos tokens a la blacklist
        access_payload = self.jwt_service.decode_token(access_token)
        refresh_payload = self.jwt_service.decode_token(refresh_token)
        
        revoked_docs = [
            {
                "token": access_token,
                "user_id": user_id,
                "revoked_at": datetime.utcnow(),
                "expires_at": datetime.fromtimestamp(access_payload["exp"]),
                "reason": "logout"
            },
            {
                "token": refresh_token,
                "user_id": user_id,
                "revoked_at": datetime.utcnow(),
                "expires_at": datetime.fromtimestamp(refresh_payload["exp"]),
                "reason": "logout"
            }
        ]
        
        await self.db.revoked_tokens.insert_many(revoked_docs)
        
        return True
    
    async def get_current_user(self, token: str) -> Optional[UserResponse]:
        """Obtener usuario actual desde token"""
        user_id = self.jwt_service.extract_user_id(token)
        if not user_id:
            return None
        
        user = await self.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return None
        
        return UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            nombre=user["nombre"],
            apellido=user.get("apellido"),
            rol=user.get("rol", "user"),
            activo=user.get("activo", True),
            verificado=user.get("verificado", False),
            created_at=user["created_at"],
            ultimo_acceso=user.get("ultimo_acceso")
        )
    
    async def validate_token(self, token: str) -> bool:
        """Validar token (endpoint interno)"""
        # Verificar que el token sea válido
        if not self.jwt_service.verify_token(token):
            return False
        
        # Verificar que no esté en la blacklist
        revoked = await self.db.revoked_tokens.find_one({"token": token})
        if revoked:
            return False
        
        return True
