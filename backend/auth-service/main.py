"""
Auth Service - Microservicio de Autenticación
Punto de entrada principal de la aplicación
Autor: Odalis Senge
Fecha: Diciembre 2024
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

from src.config.database import connect_to_mongo, close_mongo_connection
from src.routes.auth_routes import router as auth_router

# Cargar variables de entorno
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Eventos de inicio y cierre de la aplicación"""
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


# Crear aplicación FastAPI
app = FastAPI(
    title="Auth Service",
    description="Microservicio de Autenticación con JWT y Refresh Tokens",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])


@app.get("/")
async def root():
    """Endpoint de bienvenida"""
    return {
        "service": "Auth Service",
        "version": "1.0.0",
        "status": "active",
        "author": "Odalis Senge"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True
    )
