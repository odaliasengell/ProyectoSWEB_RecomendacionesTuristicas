"""
Controladores para lógica de autenticación avanzada.
Maneja refresh tokens, revocación, etc.
"""
from datetime import datetime, timedelta
from app.models.token_model import RefreshToken, TokenRevocado
from app.models.usuario_model import Usuario
from app.auth.jwt import _hash_token, verify_token, REFRESH_TOKEN_EXPIRE_DAYS
from fastapi import HTTPException


async def crear_refresh_token_en_db(user_id: str, email: str, token: str):
    """Guardar refresh token en BD para poder revocarlo después."""
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    token_hash = _hash_token(token)
    
    refresh_token_doc = RefreshToken(
        user_id=user_id,
        email=email,
        token=token_hash,
        expires_at=expires_at
    )
    await refresh_token_doc.insert()


async def verificar_refresh_token_en_db(token: str) -> bool:
    """Verificar si un refresh token sigue siendo válido."""
    token_hash = _hash_token(token)
    
    refresh_token_doc = await RefreshToken.find_one(
        RefreshToken.token == token_hash,
        RefreshToken.is_valid == True
    )
    
    if not refresh_token_doc:
        return False
    
    # Verificar que no haya expirado
    if datetime.utcnow() > refresh_token_doc.expires_at:
        # Marcar como inválido
        refresh_token_doc.is_valid = False
        await refresh_token_doc.save()
        return False
    
    return True


async def revocar_token(token: str, user_id: str, email: str, razón: str = "logout"):
    """Agregar un token a la blacklist."""
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=400, detail="Token inválido")
    
    token_hash = _hash_token(token)
    expires_at = datetime.fromtimestamp(payload.get("exp", datetime.utcnow().timestamp()))
    
    token_revocado = TokenRevocado(
        user_id=user_id,
        email=email,
        token=token_hash,
        razón=razón,
        expires_at=expires_at
    )
    await token_revocado.insert()


async def está_token_revocado(token: str) -> bool:
    """Verificar si un token está en la blacklist."""
    token_hash = _hash_token(token)
    
    token_revocado = await TokenRevocado.find_one(
        TokenRevocado.token == token_hash
    )
    
    if token_revocado:
        # Si el token ya expiró naturalmente, podemos eliminar el registro
        if datetime.utcnow() > token_revocado.expires_at:
            await token_revocado.delete()
            return False
        return True
    
    return False


async def obtener_usuario_por_token(token: str) -> Usuario:
    """Obtener usuario desde un token JWT válido."""
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    user_id = payload.get("user_id")
    usuario = await Usuario.get(user_id)
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return usuario


async def validar_token_localmente(token: str) -> dict:
    """
    Validar un token LOCALMENTE sin consultar BD.
    Solo verifica firma y expiración.
    """
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    # Verificar que sea access token
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Token no válido para esta operación")
    
    return payload
