from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config.settings import settings

# Configuración de MongoDB desde settings
MONGODB_URL = settings.MONGODB_URL
DATABASE_NAME = settings.DATABASE_NAME

client = None
database = None

async def connect_to_mongo():
    """Conectar a MongoDB"""
    global client, database
    client = AsyncIOMotorClient(MONGODB_URL)
    database = client[DATABASE_NAME]
    
    # Importar modelos para Beanie
    from app.models.usuario import Usuario
    from app.models.destino import Destino
    from app.models.recomendacion import Recomendacion
    from app.models.administrador import Administrador
    
    # Inicializar Beanie con los modelos
    await init_beanie(database=database, document_models=[Usuario, Destino, Recomendacion, Administrador])
    print(f"✅ Conectado a MongoDB: {DATABASE_NAME}")

async def close_mongo_connection():
    """Cerrar conexión a MongoDB"""
    global client
    if client:
        client.close()
        print("❌ Conexión a MongoDB cerrada")

def get_database():
    """Obtener instancia de la base de datos"""
    return database


