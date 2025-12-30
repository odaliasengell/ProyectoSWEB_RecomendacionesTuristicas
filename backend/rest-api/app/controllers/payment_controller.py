"""
Controlador de Pagos.
Maneja la lógica de procesar pagos, validar transacciones y gestionar reembolsos.
"""
from typing import Dict, Any, Optional
from datetime import datetime
from app.services.payment_client import payment_client
from app.models.reserva_model import Reserva
from app.models.usuario_model import Usuario
from beanie import PydanticObjectId


async def procesar_pago_reserva(
    reserva_id: str,
    user_id: str,
    monto: float,
    descripcion: str = ""
) -> Dict[str, Any]:
    """
    Procesar un pago para una reserva.
    
    Flujo:
    1. Obtener datos de la reserva
    2. Obtener datos del usuario
    3. Enviar a Payment Service
    4. Actualizar estado de la reserva si el pago es exitoso
    
    Args:
        reserva_id: ID de la reserva
        user_id: ID del usuario
        monto: Monto a pagar
        descripcion: Descripción del pago
    
    Returns:
        Resultado del pago
    """
    try:
        # Obtener la reserva
        reserva = await Reserva.get(PydanticObjectId(reserva_id))
        if not reserva:
            return {
                "status": "error",
                "message": "Reserva no encontrada"
            }
        
        # Obtener el usuario
        usuario = await Usuario.get(PydanticObjectId(user_id))
        if not usuario:
            return {
                "status": "error",
                "message": "Usuario no encontrado"
            }
        
        # Preparar metadata del pago
        metadata = {
            "reserva_id": str(reserva.id),
            "tour_id": str(reserva.tour_id) if hasattr(reserva, 'tour_id') else None,
            "usuario_email": usuario.email if hasattr(usuario, 'email') else "",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Procesar el pago en Payment Service
        resultado_pago = await payment_client.process_payment(
            user_id=user_id,
            amount=monto,
            currency="USD",
            description=descripcion or f"Pago de reserva {reserva_id}",
            metadata=metadata
        )
        
        # Si el pago fue exitoso, actualizar la reserva
        if resultado_pago.get("status") == "success":
            # Actualizar estado de la reserva a "pagada"
            reserva.estado = "pagada"
            reserva.fecha_pago = datetime.utcnow()
            if "payment_id" in resultado_pago:
                reserva.payment_id = resultado_pago["payment_id"]
            await reserva.save()
            
            return {
                "status": "success",
                "message": "Pago procesado exitosamente",
                "payment_id": resultado_pago.get("payment_id"),
                "reserva_id": str(reserva.id),
                "monto": monto
            }
        else:
            return {
                "status": "error",
                "message": resultado_pago.get("message", "Error en el procesamiento del pago"),
                "error_details": resultado_pago.get("error")
            }
    
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error procesando pago: {str(e)}",
            "error": str(e)
        }


async def obtener_estado_pago(payment_id: str) -> Dict[str, Any]:
    """
    Obtener el estado de un pago.
    
    Args:
        payment_id: ID del pago
    
    Returns:
        Estado del pago
    """
    return await payment_client.validate_payment(payment_id)


async def reembolsar_pago(payment_id: str, razón: str = "") -> Dict[str, Any]:
    """
    Procesar un reembolso.
    
    Args:
        payment_id: ID del pago a reembolsar
        razón: Razón del reembolso
    
    Returns:
        Resultado del reembolso
    """
    return await payment_client.refund_payment(payment_id, razón)


async def procesar_pago_tour(
    tour_id: str,
    user_id: str,
    cantidad_personas: int,
    precio_por_persona: float
) -> Dict[str, Any]:
    """
    Procesar pago para un tour.
    
    Args:
        tour_id: ID del tour
        user_id: ID del usuario
        cantidad_personas: Cantidad de personas
        precio_por_persona: Precio por persona
    
    Returns:
        Resultado del pago
    """
    monto_total = cantidad_personas * precio_por_persona
    descripcion = f"Pago tour {tour_id} para {cantidad_personas} personas"
    
    metadata = {
        "tour_id": tour_id,
        "cantidad_personas": cantidad_personas,
        "precio_por_persona": precio_por_persona,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    resultado_pago = await payment_client.process_payment(
        user_id=user_id,
        amount=monto_total,
        currency="USD",
        description=descripcion,
        metadata=metadata
    )
    
    return resultado_pago
