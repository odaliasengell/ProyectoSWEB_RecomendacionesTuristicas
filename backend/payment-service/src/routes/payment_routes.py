"""
Payment Routes
Autor: Odalis Senge
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from ..models.payment import PaymentCreate, Payment, PaymentResponse, PaymentStatus
from ..services.payment_service import PaymentService
from ..services.webhook_service import WebhookService
import uuid
from datetime import datetime

router = APIRouter()


def get_payment_service(request: Request) -> PaymentService:
    """Dependency para obtener PaymentService"""
    return PaymentService(request.app.state.db)


def get_webhook_service(request: Request) -> WebhookService:
    """Dependency para obtener WebhookService"""
    return WebhookService(request.app.state.db)


@router.post("/create", response_model=PaymentResponse, status_code=201)
async def create_payment(
    payment_data: PaymentCreate,
    payment_service: PaymentService = Depends(get_payment_service),
    webhook_service: WebhookService = Depends(get_webhook_service)
):
    """
    Crear un nuevo pago
    """
    try:
        # Crear pago usando el servicio
        payment = await payment_service.create_payment(payment_data)
        
        # Notificar a partners sobre el nuevo pago
        await webhook_service.notify_partners(
            event_type="payment.created",
            payment_data=payment
        )
        
        return PaymentResponse(
            transaction_id=payment["transaction_id"],
            status=PaymentStatus(payment["status"]),
            amount=payment["amount"],
            currency=payment["currency"],
            message="Payment created successfully",
            checkout_url=f"http://localhost:8002/checkout/{payment['transaction_id']}"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment: {str(e)}")


@router.get("/{transaction_id}", response_model=Payment)
async def get_payment(
    transaction_id: str,
    payment_service: PaymentService = Depends(get_payment_service)
):
    """
    Obtener información de un pago
    """
    payment = await payment_service.get_payment(transaction_id)
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return payment


@router.get("/", response_model=List[Payment])
async def list_payments(
    status: str = None,
    limit: int = 50,
    payment_service: PaymentService = Depends(get_payment_service)
):
    """
    Listar pagos con filtros opcionales
    """
    payments = await payment_service.list_payments(status=status, limit=limit)
    return payments


@router.post("/{transaction_id}/complete")
async def complete_payment(
    transaction_id: str,
    payment_service: PaymentService = Depends(get_payment_service),
    webhook_service: WebhookService = Depends(get_webhook_service)
):
    """
    Completar un pago (para testing con MockAdapter)
    """
    payment = await payment_service.get_payment(transaction_id)
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Actualizar estado
    updated_payment = await payment_service.update_payment_status(
        transaction_id,
        PaymentStatus.COMPLETED
    )
    
    # Notificar a partners
    await webhook_service.notify_partners(
        event_type="payment.completed",
        payment_data=updated_payment
    )
    
    return {
        "message": "Payment completed",
        "transaction_id": transaction_id,
        "status": "completed"
    }


@router.post("/{transaction_id}/refund")
async def refund_payment(
    transaction_id: str,
    payment_service: PaymentService = Depends(get_payment_service),
    webhook_service: WebhookService = Depends(get_webhook_service)
):
    """
    Reembolsar un pago
    """
    payment = await payment_service.get_payment(transaction_id)
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail="Only completed payments can be refunded"
        )
    
    # Actualizar estado
    updated_payment = await payment_service.update_payment_status(
        transaction_id,
        PaymentStatus.REFUNDED
    )
    
    # Notificar a partners
    await webhook_service.notify_partners(
        event_type="payment.refunded",
        payment_data=updated_payment
    )
    
    return {
        "message": "Payment refunded",
        "transaction_id": transaction_id,
        "status": "refunded"
    }
