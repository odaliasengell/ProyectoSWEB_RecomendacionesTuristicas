"""
Rutas REST para Tours.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from ..models.tour_model import Tour
import controllers as api_controllers
from ..controllers.base_controller import update as base_update, delete as base_delete

router = APIRouter(prefix="/tours", tags=["tours"])


@router.get("/")
async def list_tours():
    tours = await api_controllers.listar_tours()
    # Serializar con id incluido
    result = []
    for t in tours:
        tour_dict = {
            "id": str(t.id),
            **t.model_dump(exclude={"id", "revision_id"}),
        }
        result.append(tour_dict)
    return result


@router.get("/{id}")
async def get_tour(id: str):
    # usamos el helper genérico
    from ..controllers.base_controller import get_by_id
    tour = await get_by_id(Tour, id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tour no encontrado")
    # Serializar con id incluido
    tour_dict = {
        "id": str(tour.id),
        **tour.model_dump(exclude={"id", "revision_id"}),
    }
    return tour_dict


@router.post("/")
async def create_tour(payload: dict):
    # Crear el tour
    tour = await api_controllers.crear_tour(payload) if hasattr(api_controllers, 'crear_tour') else await base_update(Tour, None, payload)
    
    # Serializar la respuesta
    tour_dict = {
        "id": str(tour.id),
        **tour.model_dump(exclude={"id", "revision_id"}),
    }
    return tour_dict


@router.put("/{id}")
async def update_tour(id: str, payload: dict):
    print(f"🔄 Actualizando tour {id} con datos:", payload)
    
    updated = await base_update(Tour, id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Tour no encontrado")
    
    # Serializar la respuesta
    tour_dict = {
        "id": str(updated.id),
        **updated.model_dump(exclude={"id", "revision_id"}),
    }
    
    print(f"✅ Tour actualizado:", tour_dict)
    return tour_dict


@router.delete("/{id}")
async def delete_tour(id: str):
    ok = await base_delete(Tour, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Tour no encontrado")
    return {"ok": True}
