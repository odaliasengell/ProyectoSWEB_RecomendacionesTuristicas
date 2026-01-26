"""
Router de Integración Bidireccional - Equipo A
Endpoints para comunicación con Equipo B (Team B)
"""
from fastapi import APIRouter, HTTPException, status, Header, Body
from pydantic import BaseModel
from typing import Optional, Dict, Any
import hmac
import hashlib
import json
from datetime import datetime

router = APIRouter(
    prefix="/api",
    tags=["integracion"]
)

# Clave compartida para HMAC-SHA256 (debe ser la misma en Equipo B)
INTEGRACION_SECRET_KEY = "integracion-turismo-2026-uleam"


# Modelos
class Recomendacion(BaseModel):
    id: str
    tour_recomendado: str
    descripcion: str
    precio: float
    destino: str


class ReservaRecibida(BaseModel):
    user_id: str
    recomendacion: Recomendacion
    timestamp: str
    firma: str


class ReservaEnvio(BaseModel):
    user_id: str
    tour_id: str
    tour_nombre: str
    tour_precio: float
    tour_destino: str
    tour_descripcion: str
    timestamp: Optional[str] = None
    firma: Optional[str] = None


def calcular_firma_hmac(payload: str) -> str:
    """
    Calcula la firma HMAC-SHA256 del payload
    
    Args:
        payload: JSON string con los datos
        
    Returns:
        Firma hexadecimal
    """
    return hmac.new(
        INTEGRACION_SECRET_KEY.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()


def verificar_firma(payload: str, firma_recibida: str) -> bool:
    """
    Verifica que la firma corresponda al payload
    
    Args:
        payload: JSON string con los datos
        firma_recibida: Firma que envió el cliente
        
    Returns:
        True si la firma es válida, False en caso contrario
    """
    firma_esperada = calcular_firma_hmac(payload)
    return hmac.compare_digest(firma_esperada, firma_recibida)


@router.get("/integracion/status")
async def integracion_status():
    """
    Estado de la integración - Información para Equipo B
    """
    return {
        "equipo": "Equipo A - Recomendaciones Turísticas ULEAM",
        "integracion_activa": True,
        "endpoints": {
            "recibir_reserva": {
                "metodo": "POST",
                "ruta": "/api/reservas",
                "descripcion": "Recibir reserva confirmada de Equipo B"
            },
            "enviar_reserva": {
                "metodo": "POST",
                "ruta": "/api/enviar-reserva-confirmada",
                "descripcion": "Enviar reserva confirmada a Equipo B"
            },
            "status": {
                "metodo": "GET",
                "ruta": "/api/integracion/status",
                "descripcion": "Obtener estado de la integración"
            }
        },
        "seguridad": {
            "algoritmo": "HMAC-SHA256",
            "clave_compartida": "integracion-turismo-2026-uleam",
            "validacion_firma": True,
            "timestamp_requerido": True
        },
        "formato_timestamp": "ISO 8601 con Z (ej: 2026-01-25T15:30:00Z)"
    }


@router.post("/reservas")
async def recibir_reserva(
    reserva: ReservaRecibida,
    x_integracion_token: Optional[str] = Header(None)
):
    """
    Endpoint para RECIBIR reserva confirmada de Equipo B
    
    Verifica la firma HMAC antes de procesar
    """
    # Preparar payload para verificación de firma
    # IMPORTANTE: Usar el mismo orden y formato que el cliente
    payload_dict = {
        "user_id": reserva.user_id,
        "recomendacion": reserva.recomendacion.dict(),
        "timestamp": reserva.timestamp
    }
    
    # Convertir a JSON ordenado (importante para verificación)
    # Usar mismo formato que test: json.dumps(payload_dict, sort_keys=True)
    payload_json = json.dumps(payload_dict, sort_keys=True)
    
    # Debug: mostrar payload para verificación
    print(f"\n🔍 DEBUG - Verificación de firma:")
    print(f"   Payload para firma: {payload_json}")
    print(f"   Firma recibida: {reserva.firma}")
    
    # Verificar firma
    if not verificar_firma(payload_json, reserva.firma):
        print(f"   ❌ Firma INVÁLIDA")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: Firma HMAC-SHA256 no coincide"
        )
    
    print(f"   ✅ Firma VÁLIDA")
    
    # La firma es válida - procesar la reserva
    print(f"\n✅ RESERVA RECIBIDA DE EQUIPO B")
    print(f"   Usuario: {reserva.user_id}")
    print(f"   Tour: {reserva.recomendacion.tour_recomendado}")
    print(f"   Destino: {reserva.recomendacion.destino}")
    print(f"   Precio: ${reserva.recomendacion.precio}")
    
    # Aquí iría la lógica para guardar en BD
    # await Reserva.insert(...)
    
    return {
        "status": "success",
        "mensaje": "Reserva recibida y procesada correctamente",
        "user_id": reserva.user_id,
        "tour": reserva.recomendacion.tour_recomendado,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@router.post("/enviar-reserva-confirmada")
async def enviar_reserva_confirmada(
    user_id: str,
    tour_id: str,
    tour_nombre: str,
    tour_precio: float,
    tour_destino: str,
    tour_descripcion: str,
    url_equipo_b: Optional[str] = None
):
    """
    Endpoint para ENVIAR reserva confirmada a Equipo B
    
    Se llama cuando el usuario confirma una reserva en Equipo A
    y queremos notificar a Equipo B
    """
    import httpx
    from datetime import datetime, timezone
    
    # URL de Equipo B (obtener de configuración o parámetro)
    # Por defecto, usar ngrok si está disponible
    if not url_equipo_b:
        # Esta sería la URL de Equipo B que recibimos en la guía
        # Por ahora, retornar error
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL de Equipo B no configurada. Parámetro 'url_equipo_b' requerido"
        )
    
    # Preparar payload
    timestamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    
    payload_dict = {
        "user_id": user_id,
        "tour_id": tour_id,
        "tour_nombre": tour_nombre,
        "tour_precio": tour_precio,
        "tour_destino": tour_destino,
        "tour_descripcion": tour_descripcion,
        "timestamp": timestamp
    }
    
    # Calcular firma
    payload_json = json.dumps(payload_dict, sort_keys=True, separators=(',', ':'))
    firma = calcular_firma_hmac(payload_json)
    
    # Agregar firma al payload
    payload_dict["firma"] = firma
    
    # Construir URL de Equipo B
    if not url_equipo_b.endswith("/"):
        url_equipo_b = url_equipo_b + "/"
    
    endpoint_equipo_b = f"{url_equipo_b}api/recomendaciones"
    
    print(f"\n📤 ENVIANDO RESERVA A EQUIPO B")
    print(f"   Destino: {endpoint_equipo_b}")
    print(f"   Usuario: {user_id}")
    print(f"   Tour: {tour_nombre}")
    print(f"   Firma: {firma[:20]}...")
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                endpoint_equipo_b,
                json=payload_dict,
                headers={"Content-Type": "application/json"}
            )
        
        if response.status_code in [200, 201]:
            print(f"   ✅ Equipo B aceptó la reserva")
            return {
                "status": "success",
                "mensaje": "Reserva enviada a Equipo B correctamente",
                "equipo_b_response": response.json()
            }
        else:
            print(f"   ⚠️ Equipo B respondió con: {response.status_code}")
            return {
                "status": "error",
                "mensaje": f"Equipo B respondió con status {response.status_code}",
                "detalles": response.text
            }
    
    except Exception as e:
        print(f"   ❌ Error enviando a Equipo B: {e}")
        return {
            "status": "error",
            "mensaje": f"No se pudo conectar con Equipo B: {str(e)}",
            "tip": "Verificar que ngrok de Equipo B está activo"
        }


@router.get("/recomendaciones")
async def recomendaciones_from_team_b():
    """
    Endpoint alternativo para recibir recomendaciones de Equipo B
    (En caso que usen POST a este endpoint)
    """
    return {
        "status": "ok",
        "mensaje": "Endpoint de recomendaciones disponible",
        "metodo": "Usar POST con payload firmado"
    }


@router.post("/recomendaciones")
async def recibir_recomendacion_de_team_b(
    body: Dict[str, Any] = Body(...)
):
    """
    Endpoint para RECIBIR recomendaciones de Equipo B
    Alias para /api/reservas
    """
    # Extraer campos
    user_id = body.get("user_id")
    firma = body.get("firma")
    timestamp = body.get("timestamp")
    
    # Preparar payload para verificación
    payload_dict = {k: v for k, v in body.items() if k != "firma"}
    payload_json = json.dumps(payload_dict, sort_keys=True, separators=(',', ':'))
    
    # Verificar firma
    if not verificar_firma(payload_json, firma):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firma HMAC-SHA256 inválida"
        )
    
    print(f"\n✅ RECOMENDACION RECIBIDA DE EQUIPO B")
    print(f"   Usuario: {user_id}")
    print(f"   Timestamp: {timestamp}")
    
    return {
        "status": "success",
        "mensaje": "Recomendación recibida correctamente",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
