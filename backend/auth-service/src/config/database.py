"""
Configuración de base de datos para Auth Service
Autor: Odalis Senge
"""

from motor.motor_asyncio import AsyncIOMotorClient
import os
from typing import Optional

# Variables globales
client: Optional[AsyncIOMotorClient] = None
database = None


async def connect_to_mongo():
    """Conectar a MongoDB"""
    global client, database
    
    database_url = os.getenv("DATABASE_URL", "mongodb://localhost:27017/auth_db")
    
    try:
        client = AsyncIOMotorClient(database_url)
        database = client.get_default_database()
        
        # Verificar conexión
        await client.admin.command('ping')
        print(f"✅ Conectado a MongoDB: {database_url}")
        
        # Crear índices
        await create_indexes()
        
    except Exception as e:
        print(f"❌ Error conectando a MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Cerrar conexión a MongoDB"""
    global client
    if client:
        client.close()
        print("🔌 Conexión a MongoDB cerrada")


async def create_indexes():
    """Crear índices en las colecciones"""
    if database is None:
        return
    
    # Índice único para email en usuarios
    await database.users.create_index("email", unique=True)
    
    # Índices para refresh tokens
    await database.refresh_tokens.create_index("token", unique=True)
    await database.refresh_tokens.create_index("user_id")
    await database.refresh_tokens.create_index("expires_at")
    
    # Índice para tokens revocados
    await database.revoked_tokens.create_index("token", unique=True)
    await database.revoked_tokens.create_index("expires_at")
    
    print("📑 Índices creados correctamente")


def get_database():
    """Obtener instancia de la base de datos"""
    return database
