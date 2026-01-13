"""
Servicio de validación JWT - Semana 4
Valida tokens JWT en endpoints de webhook
Integración con Auth Service
"""
import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import jwt
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Configuración
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "tu_jwt_secret_key_muy_seguro_aqui")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "30"))


class JWTValidator:
    """
    Validador de tokens JWT para webhooks.
    Referencia: https://tools.ietf.org/html/rfc7519
    """

    @staticmethod
    def generate_token(
        user_id: str,
        email: str,
        username: str,
        expires_delta: Optional[timedelta] = None
    ) -> Dict[str, str]:
        """
        Genera un token JWT.
        
        Args:
            user_id: ID del usuario
            email: Email del usuario
            username: Username del usuario
            expires_delta: Tiempo de expiración (default: 30 min)
            
        Returns:
            Dict con token y tiempo de expiración
        """
        if expires_delta is None:
            expires_delta = timedelta(minutes=JWT_EXPIRATION_MINUTES)
        
        expire = datetime.utcnow() + expires_delta
        
        payload = {
            "user_id": user_id,
            "email": email,
            "username": username,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        }
        
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        logger.info(f"✅ Token JWT generado para usuario: {user_id}")
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": int(expires_delta.total_seconds())
        }

    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """
        Verifica un token JWT.
        
        Args:
            token: Token JWT a verificar
            
        Returns:
            Payload del token si es válido
            
        Raises:
            HTTPException si el token es inválido o expirado
        """
        try:
            payload = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=[JWT_ALGORITHM]
            )
            logger.info(f"✅ Token JWT válido para usuario: {payload.get('user_id')}")
            return payload
        
        except jwt.ExpiredSignatureError:
            logger.warning("⚠️ Token JWT expirado")
            raise HTTPException(status_code=401, detail="Token expirado")
        
        except jwt.InvalidTokenError:
            logger.warning("⚠️ Token JWT inválido")
            raise HTTPException(status_code=401, detail="Token inválido")
        
        except Exception as e:
            logger.error(f"❌ Error verificando token: {str(e)}")
            raise HTTPException(status_code=401, detail="Error en validación de token")

    @staticmethod
    def extract_token_from_header(auth_header: Optional[str]) -> str:
        """
        Extrae token JWT del header Authorization.
        
        Args:
            auth_header: Header Authorization (ej: "Bearer token...")
            
        Returns:
            Token sin "Bearer "
            
        Raises:
            HTTPException si el header no es válido
        """
        if not auth_header:
            raise HTTPException(status_code=401, detail="Authorization header faltante")
        
        parts = auth_header.split()
        
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=401,
                detail="Authorization header inválido. Formato: 'Bearer <token>'"
            )
        
        return parts[1]

    @staticmethod
    def validate_webhook_token(
        token: str,
        required_scopes: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Valida token JWT para webhooks.
        
        Args:
            token: Token a validar
            required_scopes: Scopes requeridos (opcional)
            
        Returns:
            Payload del token si es válido
        """
        payload = JWTValidator.verify_token(token)
        
        # Validar que es de tipo "access"
        if payload.get("type") != "access":
            logger.warning(f"⚠️ Token no es de tipo access: {payload.get('type')}")
            raise HTTPException(status_code=401, detail="Token no es de tipo access")
        
        # Validar scopes si son requeridos
        if required_scopes:
            token_scopes = payload.get("scopes", [])
            if not any(scope in token_scopes for scope in required_scopes):
                logger.warning(f"⚠️ Token sin scopes requeridos")
                raise HTTPException(
                    status_code=403,
                    detail="Token sin permisos suficientes"
                )
        
        logger.info(f"✅ Token de webhook válido para: {payload.get('user_id')}")
        return payload


class WebhookSecurityValidator:
    """
    Combina validación de JWT + HMAC para webhooks.
    Doble capa de seguridad.
    """

    @staticmethod
    def validate_webhook_security(
        token: Optional[str],
        signature: str,
        payload_str: str,
        secret: str,
        require_jwt: bool = True
    ) -> Dict[str, Any]:
        """
        Valida JWT + HMAC en un webhook.
        
        Args:
            token: Token JWT (opcional si require_jwt=False)
            signature: Firma HMAC del payload
            payload_str: Payload JSON como string
            secret: Secret para HMAC
            require_jwt: Si se requiere JWT o no
            
        Returns:
            Dict con ambas validaciones
            
        Ejemplo:
            result = WebhookSecurityValidator.validate_webhook_security(
                token="eyJ...",
                signature="abc123...",
                payload_str='{"event": "tour.purchased"}',
                secret="shared_secret_123",
                require_jwt=True
            )
        """
        result = {
            "jwt_valid": False,
            "hmac_valid": False,
            "jwt_payload": None,
            "error": None
        }
        
        # Validar JWT
        if require_jwt and token:
            try:
                result["jwt_payload"] = JWTValidator.verify_token(token)
                result["jwt_valid"] = True
                logger.info("✅ JWT válido en webhook")
            except Exception as e:
                logger.error(f"❌ JWT inválido: {str(e)}")
                result["error"] = f"JWT inválido: {str(e)}"
                return result
        
        elif require_jwt and not token:
            logger.warning("⚠️ JWT requerido pero no proporcionado")
            result["error"] = "JWT requerido"
            return result
        
        # Validar HMAC
        try:
            from ..services.webhook_service import HMACValidator
            if HMACValidator.verify_signature(payload_str, signature, secret):
                result["hmac_valid"] = True
                logger.info("✅ HMAC válido en webhook")
            else:
                logger.warning("⚠️ HMAC inválido")
                result["error"] = "HMAC inválido"
                return result
        except Exception as e:
            logger.error(f"❌ Error validando HMAC: {str(e)}")
            result["error"] = f"Error HMAC: {str(e)}"
            return result
        
        return result
