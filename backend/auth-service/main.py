from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import motor.motor_asyncio
from beanie import init_beanie

from config import get_settings
from models import User, RefreshToken, RevokedToken
from routes import auth_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manejo del ciclo de vida de la aplicación"""
    # Startup: Inicializar conexión a MongoDB
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    database = client[settings.DB_NAME]
    
    await init_beanie(
        database=database,
        document_models=[User, RefreshToken, RevokedToken]
    )
    
    print(f"✅ Conectado a MongoDB - Base de datos: {settings.DB_NAME}")
    
    yield
    
    # Shutdown: Cerrar conexión
    client.close()
    print("❌ Desconectado de MongoDB")


# Crear aplicación FastAPI
app = FastAPI(
    title="Auth Service - Microservicio de Autenticación",
    description="Servicio independiente para gestión de autenticación con JWT",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas
app.include_router(auth_router, prefix="/auth", tags=["authentication"])


@app.get("/")
async def root():
    """Endpoint raíz para verificar el servicio"""
    return {
        "service": "Auth Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "register": "POST /auth/register",
            "login": "POST /auth/login",
            "refresh": "POST /auth/refresh",
            "logout": "POST /auth/logout",
            "validate": "POST /auth/validate"
        }
    }


@app.get("/health")
async def health_check():
    """Endpoint de health check"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
