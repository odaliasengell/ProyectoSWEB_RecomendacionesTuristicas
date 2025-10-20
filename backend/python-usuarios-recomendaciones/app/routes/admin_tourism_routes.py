from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.services.external_api_service import external_api_service
from app.models.destino import Destino
from app.schemas.destino_schemas import DestinoCreate, DestinoUpdate, DestinoResponse
from app.services.admin_auth_service import verify_admin_token

router = APIRouter()

# ==================== GESTIÓN DE SERVICIOS TURÍSTICOS ====================
@router.get("/servicios")
async def get_all_servicios(current_admin: dict = Depends(verify_admin_token)):
    """Obtener todos los servicios turísticos de la API Go"""
    try:
        servicios = await external_api_service.get_servicios()
        return {"servicios": servicios}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo servicios: {str(e)}")

@router.get("/servicios/{servicio_id}")
async def get_servicio(servicio_id: int, current_admin: dict = Depends(verify_admin_token)):
    """Obtener un servicio específico"""
    try:
        servicio = await external_api_service.get_servicio_by_id(servicio_id)
        return servicio
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Servicio no encontrado: {str(e)}")

@router.post("/servicios")
async def create_servicio(servicio_data: Dict[str, Any], current_admin: dict = Depends(verify_admin_token)):
    """Crear un nuevo servicio turístico"""
    try:
        nuevo_servicio = await external_api_service.create_servicio(servicio_data)
        return nuevo_servicio
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creando servicio: {str(e)}")

@router.put("/servicios/{servicio_id}")
async def update_servicio(servicio_id: int, servicio_data: Dict[str, Any], current_admin: dict = Depends(verify_admin_token)):
    """Actualizar un servicio turístico"""
    try:
        servicio_actualizado = await external_api_service.update_servicio(servicio_id, servicio_data)
        return servicio_actualizado
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error actualizando servicio: {str(e)}")

@router.delete("/servicios/{servicio_id}")
async def delete_servicio(servicio_id: int, current_admin: dict = Depends(verify_admin_token)):
    """Eliminar un servicio turístico"""
    try:
        success = await external_api_service.delete_servicio(servicio_id)
        if success:
            return {"message": "Servicio eliminado correctamente"}
        else:
            raise HTTPException(status_code=400, detail="Error eliminando servicio")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error eliminando servicio: {str(e)}")

# ==================== GESTIÓN DE GUÍAS ====================
@router.get("/guias")
async def get_all_guias(current_admin: dict = Depends(verify_admin_token)):
    """Obtener todas las guías de la API TypeScript"""
    try:
        guias = await external_api_service.get_guias()
        return {"guias": guias}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo guías: {str(e)}")

@router.get("/guias/{guia_id}")
async def get_guia(guia_id: int, current_admin: dict = Depends(verify_admin_token)):
    """Obtener una guía específica"""
    try:
        guia = await external_api_service.get_guia_by_id(guia_id)
        return guia
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Guía no encontrada: {str(e)}")

@router.post("/guias")
async def create_guia(guia_data: Dict[str, Any], current_admin: dict = Depends(verify_admin_token)):
    """Crear una nueva guía"""
    try:
        nueva_guia = await external_api_service.create_guia(guia_data)
        return nueva_guia
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creando guía: {str(e)}")

@router.put("/guias/{guia_id}")
async def update_guia(guia_id: int, guia_data: Dict[str, Any], current_admin: dict = Depends(verify_admin_token)):
    """Actualizar una guía"""
    try:
        guia_actualizada = await external_api_service.update_guia(guia_id, guia_data)
        return guia_actualizada
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error actualizando guía: {str(e)}")

@router.delete("/guias/{guia_id}")
async def delete_guia(guia_id: int, current_admin: dict = Depends(verify_admin_token)):
    """Eliminar una guía"""
    try:
        success = await external_api_service.delete_guia(guia_id)
        if success:
            return {"message": "Guía eliminada correctamente"}
        else:
            raise HTTPException(status_code=400, detail="Error eliminando guía")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error eliminando guía: {str(e)}")

# ==================== GESTIÓN DE TOURS ====================
@router.get("/tours")
async def get_all_tours(current_admin: dict = Depends(verify_admin_token)):
    """Obtener todos los tours de la API TypeScript"""
    try:
        tours = await external_api_service.get_tours()
        return {"tours": tours}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo tours: {str(e)}")

@router.get("/tours/{tour_id}")
async def get_tour(tour_id: int, current_admin: dict = Depends(verify_admin_token)):
    """Obtener un tour específico"""
    try:
        tour = await external_api_service.get_tour_by_id(tour_id)
        return tour
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Tour no encontrado: {str(e)}")

@router.post("/tours")
async def create_tour(tour_data: Dict[str, Any], current_admin: dict = Depends(verify_admin_token)):
    """Crear un nuevo tour"""
    try:
        nuevo_tour = await external_api_service.create_tour(tour_data)
        return nuevo_tour
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creando tour: {str(e)}")

@router.put("/tours/{tour_id}")
async def update_tour(tour_id: int, tour_data: Dict[str, Any], current_admin: dict = Depends(verify_admin_token)):
    """Actualizar un tour"""
    try:
        tour_actualizado = await external_api_service.update_tour(tour_id, tour_data)
        return tour_actualizado
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error actualizando tour: {str(e)}")

@router.delete("/tours/{tour_id}")
async def delete_tour(tour_id: int, current_admin: dict = Depends(verify_admin_token)):
    """Eliminar un tour"""
    try:
        success = await external_api_service.delete_tour(tour_id)
        if success:
            return {"message": "Tour eliminado correctamente"}
        else:
            raise HTTPException(status_code=400, detail="Error eliminando tour")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error eliminando tour: {str(e)}")

# ==================== GESTIÓN DE DESTINOS (Local) ====================
@router.get("/destinos")
async def get_all_destinos(
    db: Session = Depends(get_db),
    current_admin: dict = Depends(verify_admin_token),
    search: str = Query(None, description="Buscar por nombre o ciudad")
):
    """Obtener todos los destinos"""
    try:
        query = db.query(Destino)
        if search:
            query = query.filter(
                (Destino.nombre.contains(search)) | 
                (Destino.ciudad.contains(search))
            )
        destinos = query.all()
        
        # Convertir manualmente a diccionario
        result = []
        for destino in destinos:
            result.append({
                "id_destino": destino.id_destino,
                "nombre": destino.nombre,
                "descripcion": destino.descripcion,
                "ubicacion": destino.ubicacion,
                "ruta": destino.ruta,
                "provincia": getattr(destino, 'provincia', None),
                "ciudad": getattr(destino, 'ciudad', None),
                "categoria": getattr(destino, 'categoria', None),
                "calificacion_promedio": getattr(destino, 'calificacion_promedio', 0.0),
                "activo": getattr(destino, 'activo', True),
                "fecha_creacion": str(getattr(destino, 'fecha_creacion', ''))
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/destinos/{destino_id}", response_model=DestinoResponse)
async def get_destino(destino_id: int, db: Session = Depends(get_db), current_admin: dict = Depends(verify_admin_token)):
    """Obtener un destino específico"""
    destino = db.query(Destino).filter(Destino.id_destino == destino_id).first()
    if not destino:
        raise HTTPException(status_code=404, detail="Destino no encontrado")
    return destino

@router.post("/destinos", response_model=DestinoResponse)
async def create_destino(destino: DestinoCreate, db: Session = Depends(get_db), current_admin: dict = Depends(verify_admin_token)):
    """Crear un nuevo destino"""
    db_destino = Destino(**destino.dict())
    db.add(db_destino)
    db.commit()
    db.refresh(db_destino)
    return db_destino

@router.put("/destinos/{destino_id}", response_model=DestinoResponse)
async def update_destino(destino_id: int, destino: DestinoUpdate, db: Session = Depends(get_db), current_admin: dict = Depends(verify_admin_token)):
    """Actualizar un destino"""
    db_destino = db.query(Destino).filter(Destino.id_destino == destino_id).first()
    if not db_destino:
        raise HTTPException(status_code=404, detail="Destino no encontrado")
    
    for field, value in destino.dict(exclude_unset=True).items():
        setattr(db_destino, field, value)
    
    db.commit()
    db.refresh(db_destino)
    return db_destino

@router.delete("/destinos/{destino_id}")
async def delete_destino(destino_id: int, db: Session = Depends(get_db), current_admin: dict = Depends(verify_admin_token)):
    """Eliminar un destino"""
    db_destino = db.query(Destino).filter(Destino.id_destino == destino_id).first()
    if not db_destino:
        raise HTTPException(status_code=404, detail="Destino no encontrado")
    
    db.delete(db_destino)
    db.commit()
    return {"message": "Destino eliminado correctamente"}