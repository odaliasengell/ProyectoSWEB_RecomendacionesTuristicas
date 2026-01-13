"""
Payment Service - Microservicio de Pagos
Autor: Odalis Senge
Semana 2: Implementación de pasarelas de pago y webhooks
"""
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
from datetime import datetime
import os
from typing import Optional
import uvicorn

from src.services.payment_service import PaymentService
from src.services.webhook_service import WebhookService
from src.models.payment import PaymentCreate, PaymentResponse
from src.models.partner import PartnerCreate, PartnerResponse

# Variables globales
db_client = None
payment_service = None
webhook_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manejo del ciclo de vida de la aplicación"""
    global db_client, payment_service, webhook_service
    
    # Startup
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    db_client = AsyncIOMotorClient(mongo_uri)
    db = db_client.payment_db
    
    payment_service = PaymentService(db)
    webhook_service = WebhookService(db)
    
    print("✅ Conectado a MongoDB: payment_db")
    
    yield
    
    # Shutdown
    if db_client:
        db_client.close()
        print("🔌 Conexión a MongoDB cerrada")


app = FastAPI(
    title="Payment Service",
    description="Microservicio de pagos con soporte para múltiples pasarelas",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "payment-service",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/payments/create", response_model=PaymentResponse)
async def create_payment(payment: PaymentCreate):
    """Crear un nuevo pago"""
    try:
        result = await payment_service.create_payment(
            amount=payment.amount,
            currency=payment.currency,
            description=payment.description,
            customer_email=payment.customer_email,
            metadata=payment.metadata
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/payments/{payment_id}", response_model=PaymentResponse)
async def get_payment(payment_id: str):
    """Obtener información de un pago"""
    payment = await payment_service.get_payment(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@app.post("/webhooks/payment")
async def receive_webhook(
    request: Request,
    x_signature: Optional[str] = Header(None)
):
    """Recibir webhooks de pasarelas de pago"""
    try:
        body = await request.json()
        provider = body.get("provider", "mock")
        
        # Verificar firma si existe
        if x_signature:
            # TODO: Implementar verificación de firma según provider
            pass
        
        # Procesar webhook
        result = await webhook_service.process_payment_webhook(provider, body)
        
        # Enviar a partners registrados
        await webhook_service.forward_to_partners(result)
        
        return {"status": "processed", "payment_id": result.get("payment_id")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/partners/register", response_model=PartnerResponse)
async def register_partner(partner: PartnerCreate):
    """Registrar un partner para recibir webhooks"""
    try:
        result = await webhook_service.register_partner(
            name=partner.name,
            webhook_url=partner.webhook_url,
            events=partner.events
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/partners")
async def list_partners():
    """Listar partners registrados"""
    partners = await webhook_service.list_partners()
    return {"partners": partners}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=True
    )
