"""
Rutas de Partners - Registro y gestión de webhooks
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from uuid import uuid4
import secrets

router = APIRouter()

# Base de datos simulada de partners
partners_db = {}


class PartnerRegisterRequest(BaseModel):
    """Request para registrar partner"""
    partner_name: str
    webhook_url: str
    events: List[str] = ["payment.success", "payment.failed"]


class PartnerResponse(BaseModel):
    """Response de partner"""
    partner_id: str
    partner_name: str
    webhook_url: str
    shared_secret: str
    events: List[str]
    status: str = "active"


@router.post("/register", response_model=PartnerResponse)
async def register_partner(request: PartnerRegisterRequest):
    """Registrar webhook de partner"""
    try:
        partner_id = str(uuid4())
        shared_secret = secrets.token_urlsafe(32)
        
        partner = {
            "partner_id": partner_id,
            "partner_name": request.partner_name,
            "webhook_url": request.webhook_url,
            "shared_secret": shared_secret,
            "events": request.events,
            "status": "active"
        }
        
        partners_db[partner_id] = partner
        
        return PartnerResponse(**partner)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def list_partners():
    """Listar partners registrados"""
    try:
        partners = list(partners_db.values())
        # No incluir shared_secret en respuesta pública
        return {
            "partners": [
                {
                    "partner_id": p["partner_id"],
                    "partner_name": p["partner_name"],
                    "webhook_url": p["webhook_url"],
                    "events": p["events"],
                    "status": p["status"]
                }
                for p in partners
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{partner_id}")
async def get_partner(partner_id: str):
    """Obtener detalles de partner"""
    partner = partners_db.get(partner_id)
    if not partner:
        raise HTTPException(status_code=404, detail="Partner no encontrado")
    
    # No incluir secret
    return {
        "partner_id": partner["partner_id"],
        "partner_name": partner["partner_name"],
        "webhook_url": partner["webhook_url"],
        "events": partner["events"],
        "status": partner["status"]
    }


@router.delete("/{partner_id}")
async def delete_partner(partner_id: str):
    """Eliminar partner"""
    if partner_id not in partners_db:
        raise HTTPException(status_code=404, detail="Partner no encontrado")
    
    del partners_db[partner_id]
    return {"status": "deleted", "partner_id": partner_id}


@router.post("/{partner_id}/test-webhook")
async def test_webhook(partner_id: str):
    """Enviar webhook de prueba a partner"""
    partner = partners_db.get(partner_id)
    if not partner:
        raise HTTPException(status_code=404, detail="Partner no encontrado")
    
    # TODO: Enviar webhook de prueba firmado
    return {"status": "sent", "partner_id": partner_id}
