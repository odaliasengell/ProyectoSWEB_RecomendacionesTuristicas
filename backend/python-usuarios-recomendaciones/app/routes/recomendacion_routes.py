from fastapi import APIRouter, HTTPException
from app.models.recomendacion import Recomendacion
from app.schemas.recomendacion_schema import RecomendacionCreate
from typing import List
import httpx

router = APIRouter()

# URL del WebSocket server
WEBSOCKET_URL = "http://localhost:4001/notify"

@router.get("/")
async def get_recomendaciones():
    """Obtener todas las recomendaciones"""
    recomendaciones = await Recomendacion.find_all().to_list()
    
    # Asegurar que cada recomendación tenga el campo 'id' correctamente serializado como string
    result = []
    for rec in recomendaciones:
        rec_dict = rec.dict()
        # FORZAR conversión del ID a string
        rec_dict['id'] = str(rec.id)
        result.append(rec_dict)
    
    print(f"📋 Devolviendo {len(result)} recomendaciones")
    if result:
        print(f"🔍 Ejemplo de ID en primera recomendación: {result[0].get('id')} (tipo: {type(result[0].get('id'))})")
    return result

@router.post("/")
async def create_recomendacion(recomendacion: RecomendacionCreate):
    """Crear nueva recomendación"""
    try:
        # Crear la recomendación con los datos recibidos
        recomendacion_data = recomendacion.dict(exclude_none=True)
        
        # Si no viene fecha, agregar fecha actual
        from datetime import date
        if 'fecha' not in recomendacion_data or recomendacion_data['fecha'] is None:
            recomendacion_data['fecha'] = date.today()
        
        print(f"📝 Creando recomendación: {recomendacion_data}")
        
        nueva = Recomendacion(**recomendacion_data)
        await nueva.insert()
        
        print(f"✅ Recomendación creada con ID: {nueva.id}")
        
        # Notificar al WebSocket sobre la nueva recomendación
        try:
            print(f"🔔 Intentando notificar WebSocket en {WEBSOCKET_URL}")
            async with httpx.AsyncClient() as client:
                notification_payload = {
                    "event": "nueva_recomendacion",
                    "data": {
                        "id_recomendacion": str(nueva.id),
                        "id_tour": nueva.id_tour,
                        "tour_nombre": "Tour",  # Se puede enriquecer
                        "id_usuario": str(nueva.id_usuario),
                        "usuario_nombre": "Usuario",  # Se puede enriquecer
                        "comentario": nueva.comentario[:100] if nueva.comentario else "",  # Primeros 100 chars
                        "calificacion": nueva.calificacion
                    },
                    "room": "dashboard"
                }
                print(f"📤 Payload de notificación: {notification_payload}")
                
                response = await client.post(
                    WEBSOCKET_URL,
                    json=notification_payload,
                    timeout=5.0
                )
                print(f"✅ Respuesta del WebSocket: {response.status_code}")
        except Exception as notify_error:
            print(f"⚠️ Error al notificar WebSocket: {notify_error}")
            # No lanzar error, solo registrar
        
        return nueva
    except Exception as e:
        print(f"❌ Error creando recomendación: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al crear recomendación: {str(e)}")

@router.get("/{recomendacion_id}")
async def get_recomendacion(recomendacion_id: str):
    """Obtener recomendación por ID"""
    from beanie import PydanticObjectId
    recomendacion = await Recomendacion.get(PydanticObjectId(recomendacion_id))
    if not recomendacion:
        raise HTTPException(status_code=404, detail="Recomendación no encontrada")
    return recomendacion

@router.delete("/{recomendacion_id}")
async def delete_recomendacion(recomendacion_id: str):
    """Eliminar recomendación por ID"""
    try:
        print(f"🗑️  Intentando eliminar recomendación con ID: {recomendacion_id}")
        from beanie import PydanticObjectId
        
        # Validar que el ID sea válido
        try:
            obj_id = PydanticObjectId(recomendacion_id)
        except Exception as e:
            print(f"❌ ID inválido: {recomendacion_id}, Error: {e}")
            raise HTTPException(status_code=400, detail=f"ID inválido: {recomendacion_id}")
        
        recomendacion = await Recomendacion.get(obj_id)
        if not recomendacion:
            print(f"❌ Recomendación no encontrada: {recomendacion_id}")
            raise HTTPException(status_code=404, detail="Recomendación no encontrada")
        
        await recomendacion.delete()
        print(f"✅ Recomendación eliminada exitosamente: {recomendacion_id}")
        return {"message": "Recomendación eliminada exitosamente", "id": recomendacion_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error eliminando recomendación: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al eliminar recomendación: {str(e)}")
