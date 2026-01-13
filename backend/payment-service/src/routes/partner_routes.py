"""
Partner Routes - Gestión de partners B2B
Autor: Odalis Senge
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from ..models.partner import PartnerCreate, Partner
from ..services.partner_service import PartnerService

router = APIRouter()


def get_partner_service(request: Request) -> PartnerService:
    """Dependency para obtener PartnerService"""
    return PartnerService(request.app.state.db)


@router.post("/register", response_model=Partner, status_code=201)
async def register_partner(
    partner_data: PartnerCreate,
    partner_service: PartnerService = Depends(get_partner_service)
):
    """
    Registrar un nuevo partner para recibir webhooks
    """
    try:
        partner = await partner_service.create_partner(partner_data)
        return partner
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error registering partner: {str(e)}")


@router.get("/{partner_id}", response_model=Partner)
async def get_partner(
    partner_id: str,
    partner_service: PartnerService = Depends(get_partner_service)
):
    """
    Obtener información de un partner
    """
    partner = await partner_service.get_partner(partner_id)
    
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    return partner


@router.get("/", response_model=List[Partner])
async def list_partners(
    active: bool = None,
    partner_service: PartnerService = Depends(get_partner_service)
):
    """
    Listar partners registrados
    """
    partners = await partner_service.list_partners(active=active)
    return partners


@router.delete("/{partner_id}")
async def deactivate_partner(
    partner_id: str,
    partner_service: PartnerService = Depends(get_partner_service)
):
    """
    Desactivar un partner
    """
    success = await partner_service.deactivate_partner(partner_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    return {"message": "Partner deactivated", "partner_id": partner_id}


@router.post("/{partner_id}/regenerate-secret")
async def regenerate_secret(
    partner_id: str,
    partner_service: PartnerService = Depends(get_partner_service)
):
    """
    Regenerar la clave secreta de un partner
    """
    new_secret = await partner_service.regenerate_secret(partner_id)
    
    if not new_secret:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    return {
        "message": "Secret regenerated",
        "partner_id": partner_id,
        "new_secret": new_secret
    }
