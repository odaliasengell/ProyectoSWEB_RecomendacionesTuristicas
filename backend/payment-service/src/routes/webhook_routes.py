"""
Webhook Routes - Recibir webhooks de pasarelas
Autor: Odalis Senge
"""
from fastapi import APIRouter, HTTPException, Request, Header
from typing import Optional
from ..adapters.mock_adapter import MockAdapter
from ..adapters.stripe_adapter import StripeAdapter
from ..services.payment_service import PaymentService
from ..services.webhook_service import WebhookService

router = APIRouter()


@router.post("/payment")
async def receive_payment_webhook(
    request: Request,
    x_provider: Optional[str] = Header(None, alias="X-Provider"),
    x_stripe_signature: Optional[str] = Header(None, alias="Stripe-Signature")
):
    """
    Endpoint para recibir webhooks de pasarelas de pago
    Soporta múltiples proveedores (Stripe, MercadoPago, etc.)
    """
    body = await request.body()
    json_data = await request.json()
    
    # Determinar el proveedor
    provider = x_provider or "mock"
    
    # Seleccionar adapter según el proveedor
    if provider == "stripe":
        adapter = StripeAdapter()
        # Verificar firma de Stripe
        if x_stripe_signature:
            is_valid = await adapter.verify_webhook(body, x_stripe_signature)
            if not is_valid:
                raise HTTPException(status_code=400, detail="Invalid webhook signature")
    else:
        adapter = MockAdapter()
    
    # Normalizar webhook
    normalized_data = adapter.normalize_webhook(json_data)
    
    # Procesar evento
    payment_service = PaymentService(request.app.state.db)
    webhook_service = WebhookService(request.app.state.db)
    
    transaction_id = normalized_data.get("transaction_id")
    event_type = normalized_data.get("event_type")
    
    if transaction_id and event_type:
        # Actualizar pago según el evento
        if event_type == "payment.completed":
            await payment_service.update_payment_status(transaction_id, "completed")
        elif event_type == "payment.failed":
            await payment_service.update_payment_status(transaction_id, "failed")
        
        # Obtener pago actualizado
        payment = await payment_service.get_payment(transaction_id)
        
        # Reenviar a partners
        if payment:
            await webhook_service.notify_partners(event_type, payment)
    
    return {"status": "received", "event": event_type}


@router.post("/test")
async def test_webhook(request: Request):
    """
    Endpoint de prueba para webhooks
    """
    data = await request.json()
    return {
        "status": "test_received",
        "data": data,
        "message": "Webhook test successful"
    }
