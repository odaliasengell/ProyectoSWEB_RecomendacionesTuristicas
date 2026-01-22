from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from config import get_settings
from models import Payment, Partner, WebhookLog
from routes import payment_router, partner_router, webhook_router, health_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestiona el ciclo de vida de la aplicación
    
    - Conecta a MongoDB al inicio
    - Cierra conexiones al finalizar
    """
    # Startup: Conectar a MongoDB
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    database = client[settings.DB_NAME]
    
    await init_beanie(
        database=database,
        document_models=[Payment, Partner, WebhookLog]
    )
    
    print(f"✅ Conectado a MongoDB: {settings.DB_NAME}")
    print(f"🚀 Payment Service iniciado en http://{settings.HOST}:{settings.PORT}")
    
    yield
    
    # Shutdown: Cerrar conexiones
    client.close()
    print("👋 Payment Service detenido")


# Crear aplicación FastAPI
app = FastAPI(
    title="Payment Service - Turismo Ecuador",
    description="""
    Microservicio de pagos con sistema de webhooks para interoperabilidad B2B.
    
    ## Características
    
    - **Patrón Adapter**: Abstracción de múltiples proveedores de pago (Stripe, MercadoPago, Mock)
    - **Webhooks bidireccionales**: Envío y recepción de eventos con partners
    - **Autenticación HMAC-SHA256**: Firma y verificación de webhooks
    - **Registro de Partners**: Sistema para que otros servicios se suscriban a eventos
    - **Normalización de eventos**: Conversión de diferentes formatos a estándar interno
    
    ## Eventos soportados
    
    - `payment.success` - Pago exitoso
    - `payment.failed` - Pago fallido
    - `payment.refunded` - Pago reembolsado
    - `booking.confirmed` - Reserva confirmada
    - `booking.cancelled` - Reserva cancelada
    - `order.created` - Orden creada
    - `order.completed` - Orden completada
    - `service.activated` - Servicio activado
    - `service.cancelled` - Servicio cancelado
    - `tour.purchased` - Tour comprado
    - `tour.cancelled` - Tour cancelado
    
    ## Autenticación
    
    La mayoría de endpoints requieren autenticación JWT del Auth Service.
    Los webhooks entrantes usan autenticación HMAC con secret compartido.
    """,
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

# Registrar routers
app.include_router(health_router)
app.include_router(payment_router)
app.include_router(partner_router)
app.include_router(webhook_router)


@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "service": "Payment Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "features": [
            "Multi-provider payment processing (Stripe, MercadoPago, Mock)",
            "Bidirectional webhooks with HMAC authentication",
            "Partner registration and management",
            "Event normalization across different payment gateways",
            "Comprehensive webhook logging"
        ]
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
