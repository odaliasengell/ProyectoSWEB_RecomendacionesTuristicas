from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Configuración del microservicio de pagos"""
    
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DB_NAME: str = "payment_service_db"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8002
    
    # Service Info
    SERVICE_NAME: str = "TurismoEcuador"
    SERVICE_URL: str = "http://localhost:8002"
    
    # Stripe (valores opcionales - usa Mock si están vacíos)
    STRIPE_API_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    
    # MercadoPago (valores opcionales)
    MERCADOPAGO_ACCESS_TOKEN: str = ""
    
    # Auth Service
    AUTH_SERVICE_URL: str = "http://localhost:8001"
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Retorna instancia singleton de configuración"""
    return Settings()
