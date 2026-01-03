"""
Rutas de Pago
"""
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional
from ..services.payment_service import payment_service

router = APIRouter()


class PaymentInitRequest(BaseModel):
    """Request para iniciar pago"""
    amount: float
    currency: str = "USD"
    description: str
    metadata: Optional[dict] = None


class PaymentResponse(BaseModel):
    """Response de pago"""
    transaction_id: str
    status: str
    redirect_url: Optional[str] = None
    error_message: Optional[str] = None


@router.post("/init", response_model=PaymentResponse)
async def init_payment(
    request: PaymentInitRequest,
    authorization: Optional[str] = Header(None)
):
    """Iniciar procesamiento de pago"""
    try:
        # TODO: Validar JWT con Auth Service
        user_id = "test-user-id"  # Obtener del JWT
        
        if request.amount <= 0:
            raise HTTPException(status_code=400, detail="Monto debe ser mayor a 0")
        
        result = await payment_service.process_payment(
            amount=request.amount,
            currency=request.currency,
            description=request.description,
            user_id=user_id,
            metadata=request.metadata
        )
        
        return PaymentResponse(
            transaction_id=result.transaction_id,
            status=result.status,
            redirect_url=result.redirect_url,
            error_message=result.error_message
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{transaction_id}")
async def get_payment_status(transaction_id: str):
    """Obtener estado de un pago"""
    try:
        status = await payment_service.get_payment_status(transaction_id)
        return {"transaction_id": transaction_id, "status": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhooks")
async def receive_webhook(
    payload: dict,
    x_webhook_signature: Optional[str] = Header(None)
):
    """Recibir webhook de pasarela de pago"""
    try:
        # Validar firma HMAC
        if not payment_service.validate_webhook(payload, x_webhook_signature):
            raise HTTPException(status_code=401, detail="Firma inválida")
        
        # TODO: Procesar webhook
        # - Actualizar estado de pago en BD
        # - Enviar evento a n8n
        # - Notificar a grupo partner
        
        return {"status": "received"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refund")
async def refund_payment(
    transaction_id: str,
    amount: Optional[float] = None,
    authorization: Optional[str] = Header(None)
):
    """Solicitar reembolso"""
    try:
        # TODO: Validar JWT
        
        success = await payment_service.refund_payment(transaction_id, amount)
        
        if not success:
            raise HTTPException(status_code=400, detail="No se pudo procesar el reembolso")
        
        return {"status": "refunded", "transaction_id": transaction_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_payment_history(authorization: Optional[str] = Header(None)):
    """Obtener historial de pagos del usuario"""
    try:
        # TODO: Validar JWT y obtener user_id
        # TODO: Consultar pagos en MongoDB/PostgreSQL
        
        return {"payments": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
