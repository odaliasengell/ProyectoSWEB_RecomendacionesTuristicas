"""
Conexión a la base de datos usando Motor (async) y helpers ligeros.

Este módulo intenta reutilizar configuración existente del proyecto (si está disponible)
importando `python-usuarios-recomendaciones` settings; si no está disponible, usa
valores por defecto definidos en `res_api/config.py`.

Exporta: connect_to_mongo(), close_mongo_connection(), get_database(), get_client()
"""
from typing import Optional
import asyncio

from motor.motor_asyncio import AsyncIOMotorClient

try:
    # Intentar usar settings del otro módulo si el equipo lo empaqueta en PYTHONPATH
    from app.config.settings import settings as external_settings  # type: ignore
    MONGO_URI = getattr(external_settings, "MONGODB_URL", None) or getattr(external_settings, "MONGODB_URL", None)
    DB_NAME = getattr(external_settings, "DATABASE_NAME", None) or getattr(external_settings, "DATABASE_NAME", None)
except Exception:
    # Fallback a configuración local
    from .config import settings
    MONGO_URI = getattr(settings, "mongo_uri", "mongodb://localhost:27017")
    DB_NAME = getattr(settings, "db_name", "turismo_db")


_client: Optional[AsyncIOMotorClient] = None
_database = None


async def connect_to_mongo():
    """Crear cliente Motor y exponer la base de datos.

    Nota: no inicializa Beanie aquí para evitar depender de modelos Beanie en este paquete.
    """
    global _client, _database
    if _client is None:
        _client = AsyncIOMotorClient(MONGO_URI)
        _database = _client[DB_NAME]
    return _client


async def close_mongo_connection():
    global _client
    if _client:
        _client.close()
        _client = None


async def close_mongo_connection_sync():
    """Sin función async alternativa para cerrar desde código sin await."""
    global _client
    if _client:
        _client.close()
        _client = None


def get_database():
    """Retornar la instancia de la base de datos (puede ser None si no conectado)."""
    return _database


def get_client() -> Optional[AsyncIOMotorClient]:
    return _client
