from fastapi import APIRouter, HTTPException, Header, Request, Depends, status
from typing import Optional, List
from datetime import datetime

from models import Payment, Partner, PaymentStatus
from schemas import (
    CreatePaymentRequest, PaymentResponse, RefundPaymentRequest,
    RegisterPartnerRequest, PartnerResponse, UpdatePartnerRequest,
    SendWebhookRequest, IncomingWebhook, WebhookLogResponse,
    MessageResponse
)
from payment_adapters import get_payment_adapter
from webhook_service import WebhookService
from hmac_utils import verify_webhook_signature
from config import get_settings
from beanie import PydanticObjectId

# Importar validador JWT local
from local_jwt_validator import get_current_user_from_token, require_role as _require_role

# Helper para convertir documentos de Beanie a schemas Pydantic
def to_payment_response(payment: Payment) -> PaymentResponse:
    """Convierte Payment a PaymentResponse convirtiendo ObjectId a string"""
    data = payment.model_dump()
    data['id'] = str(payment.id)
    return PaymentResponse(**data)

def to_partner_response(partner: Partner) -> PartnerResponse:
    """Convierte Partner a PartnerResponse convirtiendo ObjectId a string"""
    data = partner.model_dump()
    data['id'] = str(partner.id)
    return PartnerResponse(**data)

def to_webhook_log_response(log) -> WebhookLogResponse:
    """Convierte WebhookLog a WebhookLogResponse convirtiendo ObjectId a string"""
    data = log.model_dump()
    data['id'] = str(log.id)
    return WebhookLogResponse(**data)

def require_role(role: str = None):
    """Wrapper para require_role que funciona sin argumentos o con rol"""
    if role is None:
        # Sin rol específico, solo autenticación
        async def dependency(user: dict = Depends(get_current_user_from_token)):
            return {"user_id": user.user_id, "email": user.email, "role": user.role}
        return dependency
    else:
        # Con rol específico
        async def dependency(user: dict = Depends(_require_role([role]))):
            return {"user_id": user.user_id, "email": user.email, "role": user.role}
        return dependency

settings = get_settings()

# Routers
payment_router = APIRouter(prefix="/payments", tags=["Payments"])
partner_router = APIRouter(prefix="/partners", tags=["Partners"])
webhook_router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


# ==================== Payment Routes ====================

@payment_router.post(
    "/",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear pago"
)
async def create_payment(
    request: CreatePaymentRequest,
    current_user: dict = Depends(require_role())
):
    """
    Crea un nuevo pago usando el proveedor especificado
    
    Requiere autenticación JWT.
    """
    try:
        # Obtener adapter para el proveedor
        adapter = get_payment_adapter(
            request.provider,
            stripe_key=settings.STRIPE_API_KEY if request.provider.value == "stripe" else None,
            mercadopago_token=settings.MERCADOPAGO_ACCESS_TOKEN if request.provider.value == "mercadopago" else None
        )
        
        # Crear pago en el proveedor
        result = await adapter.create_payment(
            amount=request.amount,
            currency=request.currency,
            description=request.description or "Pago",
            metadata=request.metadata
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error al crear pago: {result.message}"
            )
        
        # Guardar en base de datos
        payment = Payment(
            amount=request.amount,
            currency=request.currency,
            status=result.status,
            provider=request.provider,
            external_id=result.external_id,
            user_id=current_user["user_id"],
            order_id=request.order_id,
            description=request.description,
            metadata=request.metadata,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        await payment.insert()
        
        # Si el pago fue exitoso, enviar webhook
        if result.status == PaymentStatus.COMPLETED:
            payment.completed_at = datetime.utcnow()
            await payment.save()
            
            await WebhookService.send_webhook(
                event_type="payment.success",
                data={
                    "payment_id": str(payment.id),
                    "external_id": payment.external_id,
                    "amount": payment.amount,
                    "currency": payment.currency,
                    "user_id": payment.user_id,
                    "order_id": payment.order_id,
                    "metadata": payment.metadata
                }
            )
        
        return to_payment_response(payment)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar pago: {str(e)}"
        )


@payment_router.get(
    "/{payment_id}",
    response_model=PaymentResponse,
    summary="Obtener pago"
)
async def get_payment(
    payment_id: str,
    current_user: dict = Depends(require_role())
):
    """Obtiene los detalles de un pago"""
    payment = await Payment.get(PydanticObjectId(payment_id))
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )
    
    # Verificar que el usuario sea el dueño del pago o admin
    if payment.user_id != current_user["user_id"] and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver este pago"
        )
    
    return to_payment_response(payment)


@payment_router.get(
    "/",
    response_model=List[PaymentResponse],
    summary="Listar pagos del usuario"
)
async def list_payments(
    current_user: dict = Depends(require_role())
):
    """Lista todos los pagos del usuario autenticado"""
    payments = await Payment.find(
        {"user_id": current_user["user_id"]}
    ).sort("-created_at").to_list()
    
    return [to_payment_response(p) for p in payments]


@payment_router.post(
    "/{payment_id}/refund",
    response_model=MessageResponse,
    summary="Reembolsar pago"
)
async def refund_payment(
    payment_id: str,
    request: RefundPaymentRequest,
    current_user: dict = Depends(require_role("admin"))
):
    """
    Reembolsa un pago
    
    Requiere rol de administrador.
    """
    payment = await Payment.get(PydanticObjectId(payment_id))
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )
    
    if payment.status != PaymentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden reembolsar pagos completados"
        )
    
    # Obtener adapter
    adapter = get_payment_adapter(
        payment.provider,
        stripe_key=settings.STRIPE_API_KEY,
        mercadopago_token=settings.MERCADOPAGO_ACCESS_TOKEN
    )
    
    # Reembolsar
    result = await adapter.refund_payment(
        payment.external_id,
        request.amount
    )
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al reembolsar: {result.message}"
        )
    
    # Actualizar estado
    payment.status = PaymentStatus.REFUNDED
    payment.updated_at = datetime.utcnow()
    await payment.save()
    
    # Enviar webhook
    await WebhookService.send_webhook(
        event_type="payment.refunded",
        data={
            "payment_id": str(payment.id),
            "amount": request.amount or payment.amount,
            "reason": request.reason
        }
    )
    
    return MessageResponse(
        message="Pago reembolsado exitosamente",
        success=True
    )


# ==================== Partner Routes ====================

@partner_router.post(
    "/register",
    response_model=PartnerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar partner"
)
async def register_partner(request: RegisterPartnerRequest):
    """
    Registra un nuevo partner para recibir webhooks
    
    El secret compartido para HMAC se genera automáticamente.
    """
    try:
        partner = await WebhookService.register_partner(
            name=request.name,
            webhook_url=request.webhook_url,
            subscribed_events=request.subscribed_events,
            contact_email=request.contact_email,
            description=request.description
        )
        
        return to_partner_response(partner)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar partner: {str(e)}"
        )


@partner_router.get(
    "/",
    response_model=List[PartnerResponse],
    summary="Listar partners"
)
async def list_partners(
    is_active: Optional[bool] = None,
    current_user: dict = Depends(require_role("admin"))
):
    """
    Lista todos los partners
    
    Requiere rol de administrador.
    """
    partners = await WebhookService.get_all_partners(is_active=is_active)
    return [to_partner_response(p) for p in partners]


@partner_router.get(
    "/{partner_id}",
    response_model=PartnerResponse,
    summary="Obtener partner"
)
async def get_partner(
    partner_id: str,
    current_user: dict = Depends(require_role("admin"))
):
    """Obtiene los detalles de un partner"""
    partner = await WebhookService.get_partner(partner_id)
    
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner no encontrado"
        )
    
    return to_partner_response(partner)


@partner_router.put(
    "/{partner_id}",
    response_model=PartnerResponse,
    summary="Actualizar partner"
)
async def update_partner(
    partner_id: str,
    request: UpdatePartnerRequest,
    current_user: dict = Depends(require_role("admin"))
):
    """
    Actualiza un partner
    
    Requiere rol de administrador.
    """
    update_data = request.model_dump(exclude_unset=True)
    
    partner = await WebhookService.update_partner(partner_id, **update_data)
    
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner no encontrado"
        )
    
    return to_partner_response(partner)


@partner_router.delete(
    "/{partner_id}",
    response_model=MessageResponse,
    summary="Eliminar partner"
)
async def delete_partner(
    partner_id: str,
    current_user: dict = Depends(require_role("admin"))
):
    """
    Desactiva un partner
    
    Requiere rol de administrador.
    """
    success = await WebhookService.delete_partner(partner_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner no encontrado"
        )
    
    return MessageResponse(
        message="Partner desactivado exitosamente",
        success=True
    )


# ==================== Webhook Routes ====================

@webhook_router.post(
    "/send",
    response_model=MessageResponse,
    summary="Enviar webhook"
)
async def send_webhook(
    request: SendWebhookRequest,
    current_user: dict = Depends(require_role("admin"))
):
    """
    Envía un webhook a partners suscritos
    
    Requiere rol de administrador.
    """
    logs = await WebhookService.send_webhook(
        event_type=request.event,
        data=request.data,
        partner_ids=request.partner_ids
    )
    
    successful = sum(1 for log in logs if log.success)
    total = len(logs)
    
    return MessageResponse(
        message=f"Webhook enviado a {successful}/{total} partners",
        success=True,
        data={
            "total_sent": total,
            "successful": successful,
            "failed": total - successful
        }
    )


@webhook_router.post(
    "/incoming/{partner_name}",
    response_model=MessageResponse,
    summary="Recibir webhook de partner"
)
async def receive_webhook(
    partner_name: str,
    request: Request,
    payload: IncomingWebhook
):
    """
    Endpoint para recibir webhooks de partners externos
    
    Verifica la firma HMAC antes de procesar.
    """
    try:
        # Obtener partner por nombre
        partners = await Partner.find({"name": partner_name}).to_list()
        
        if not partners:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Partner '{partner_name}' no encontrado"
            )
        
        partner = partners[0]
        
        if not partner.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Partner desactivado"
            )
        
        # Verificar firma HMAC
        headers = dict(request.headers)
        payload_dict = payload.model_dump()
        
        is_valid, error_msg = verify_webhook_signature(
            payload_dict,
            headers,
            partner.secret
        )
        
        if not is_valid:
            await WebhookService.log_incoming_webhook(
                event_type=payload.event,
                payload=payload_dict,
                headers=headers,
                partner_name=partner_name,
                signature_verified=False,
                success=False,
                error_message=error_msg
            )
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Firma HMAC inválida: {error_msg}"
            )
        
        # Registrar webhook exitoso
        await WebhookService.log_incoming_webhook(
            event_type=payload.event,
            payload=payload_dict,
            headers=headers,
            partner_name=partner_name,
            signature_verified=True,
            success=True
        )
        
        # Actualizar last_ping
        partner.last_ping = datetime.utcnow()
        await partner.save()
        
        # TODO: Aquí se procesaría el evento según el tipo
        # Por ejemplo, actualizar reservas, activar servicios, etc.
        
        return MessageResponse(
            message="Webhook recibido y procesado correctamente",
            success=True,
            data={
                "event": payload.event,
                "partner": partner_name
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar webhook: {str(e)}"
        )


@webhook_router.get(
    "/logs",
    response_model=List[WebhookLogResponse],
    summary="Obtener logs de webhooks"
)
async def get_webhook_logs(
    direction: Optional[str] = None,
    partner_id: Optional[str] = None,
    success: Optional[bool] = None,
    limit: int = 100,
    current_user: dict = Depends(require_role("admin"))
):
    """
    Obtiene los logs de webhooks
    
    Requiere rol de administrador.
    """
    logs = await WebhookService.get_webhook_logs(
        direction=direction,
        partner_id=partner_id,
        success=success,
        limit=limit
    )
    
    return [to_webhook_log_response(log) for log in logs]


# ==================== Health Check ====================

health_router = APIRouter(tags=["Health"])

@health_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "payment-service",
        "timestamp": datetime.utcnow().isoformat()
    }
