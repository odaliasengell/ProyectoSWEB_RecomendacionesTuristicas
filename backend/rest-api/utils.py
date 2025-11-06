"""
Utilidades varias para la REST API.
"""
import bcrypt


def to_dict(obj):
    """Intento simple de convertir Pydantic model o dict-like a dict."""
    try:
        return obj.dict()
    except Exception:
        return dict(obj) if isinstance(obj, dict) else obj


def hash_password(password: str) -> str:
    """Hashear una contraseña usando bcrypt."""
    # Convertir a bytes
    password_bytes = password.encode('utf-8')
    # Generar salt y hashear
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Retornar como string
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar si una contraseña coincide con su hash."""
    # Convertir a bytes
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    # Verificar
    return bcrypt.checkpw(password_bytes, hashed_bytes)
