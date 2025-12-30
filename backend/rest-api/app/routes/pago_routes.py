"""
Rutas de pagos para la REST API.
Endpoints para procesar pagos, validar transacciones y gestionar reembolsos.
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from app.controllers import payment_controller
from app.auth.jwt import verify_token

# Definir router
router = APIRouter(prefix="/api/pagos", tags=["Pagos"])


# Modelos Pydantic para validación de entrada
class PagoReservaRequest(BaseModel):
    """Request para procesar pago de una reserva."""
    reserva_id: str = Field(..., description="ID de la reserva a pagar")
    monto: float = Field(..., gt=0, description="Monto a pagar")
    descripcion: Optional[str] = Field(default="", description="Descripción del pago")
    
    class Config:
        json_schema_extra = {
            "example": {
                "reserva_id": "507f1f77bcf86cd799439011",
                "monto": 150.00,
                "descripcion": "Pago de reserva de tour"
            }
        }


class PagoTourRequest(BaseModel):
    """Request para procesar pago de un tour."""
    tour_id: str = Field(..., description="ID del tour")
    cantidad_personas: int = Field(..., gt=0, description="Cantidad de personas")
    precio_por_persona: float = Field(..., gt=0, description="Precio por persona")
    
    class Config:
        json_schema_extra = {
            "example": {
                "tour_id": "507f1f77bcf86cd799439012",
                "cantidad_personas": 2,
                "precio_por_persona": 75.00
            }
        }


class ReembolsoRequest(BaseModel):
    """Request para procesar reembolso."""
    payment_id: str = Field(..., description="ID del pago a reembolsar")
    razon: Optional[str] = Field(default="", description="Razón del reembolso")
    
    class Config:
        json_schema_extra = {
            "example": {
                "payment_id": "pay_1234567890",
                "razon": "Cliente solicitó cancelación"
            }
        }


# Endpoints

@router.post("/reserva")
async def procesar_pago_reserva(
    request: PagoReservaRequest,
    token: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Procesar pago para una reserva.
    
    Requiere autenticación JWT.
    
    **Flujo:**
    1. Valida el token JWT
    2. Obtiene los datos de la reserva
    3. Envía el pago al Payment Service
    4. Actualiza el estado de la reserva si el pago es exitoso
    5. Retorna el ID del pago generado
    
    **Respuesta exitosa:**
    ```json
    {
        "status": "success",
        "payment_id": "pay_1234567890",
        "reserva_id": "507f1f77bcf86cd799439011",
        "monto": 150.00
    }
    ```
    """
    try:
        # Extraer user_id del token
        user_id = token.get("user_id") if isinstance(token, dict) else str(token)
        
        resultado = await payment_controller.procesar_pago_reserva(
            reserva_id=request.reserva_id,
            user_id=user_id,
            monto=request.monto,
            descripcion=request.descripcion
        )
        
        if resultado.get("status") == "error":
            raise HTTPException(
                status_code=400,
                detail=resultado.get("message", "Error procesando pago")
            )
        
        return resultado
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error interno: {str(e)}"
        )


@router.post("/tour")
async def procesar_pago_tour(
    request: PagoTourRequest,
    token: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Procesar pago para un tour.
    
    Requiere autenticación JWT.
    
    **Cálculo:**
    - Monto total = cantidad_personas × precio_por_persona
    
    **Respuesta exitosa:**
    ```json
    {
        "status": "success",
        "payment_id": "pay_9876543210",
        "monto_total": 150.00,
        "cantidad_personas": 2
    }
    ```
    """
    try:
        user_id = token.get("user_id") if isinstance(token, dict) else str(token)
        
        resultado = await payment_controller.procesar_pago_tour(
            tour_id=request.tour_id,
            user_id=user_id,
            cantidad_personas=request.cantidad_personas,
            precio_por_persona=request.precio_por_persona
        )
        
        if resultado.get("status") == "error":
            raise HTTPException(
                status_code=400,
                detail=resultado.get("message", "Error procesando pago")
            )
        
        return resultado
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error interno: {str(e)}"
        )


@router.get("/estado/{payment_id}")
async def obtener_estado_pago(
    payment_id: str,
    token: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Obtener el estado de un pago.
    
    Requiere autenticación JWT.
    
    **Parámetros:**
    - payment_id: ID del pago (ej: pay_1234567890)
    
    **Respuesta:**
    ```json
    {
        "status": "success",
        "payment_id": "pay_1234567890",
        "estado": "completado",
        "monto": 150.00,
        "fecha": "2024-01-09T10:30:00"
    }
    ```
    """
    resultado = await payment_controller.obtener_estado_pago(payment_id)
    return resultado


@router.post("/reembolso")
async def reembolsar_pago(
    request: ReembolsoRequest,
    token: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Procesar un reembolso.
    
    Requiere autenticación JWT.
    
    **Flujo:**
    1. Valida que el pago exista
    2. Verifica que sea elegible para reembolso
    3. Procesa el reembolso en Payment Service
    4. Actualiza el estado del pago
    
    **Respuesta exitosa:**
    ```json
    {
        "status": "success",
        "refund_id": "ref_1234567890",
        "payment_id": "pay_1234567890",
        "monto_reembolsado": 150.00
    }
    ```
    """
    resultado = await payment_controller.reembolsar_pago(
        payment_id=request.payment_id,
        razón=request.razon
    )
    
    if resultado.get("status") == "error":
        raise HTTPException(
            status_code=400,
            detail=resultado.get("message", "Error procesando reembolso")
        )
    
    return resultado
