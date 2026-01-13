"""
Partner Service - Gestión de partners B2B
Autor: Odalis Senge
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from ..models.partner import PartnerCreate, Partner


class PartnerService:
    """Servicio para gestión de partners"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.partners_collection = db.partners
    
    async def create_partner(self, partner_data: PartnerCreate) -> Dict[str, Any]:
        """
        Registrar un nuevo partner
        """
        # Generar ID único
        partner_id = f"PARTNER-{uuid.uuid4().hex[:8].upper()}"
        
        # Generar secret key para HMAC
        secret_key = Partner.generate_secret_key()
        
        # Verificar que no exista un partner con la misma URL
        existing = await self.partners_collection.find_one(
            {"webhook_url": str(partner_data.webhook_url)}
        )
        
        if existing:
            raise ValueError("A partner with this webhook URL already exists")
        
        # Crear documento
        partner_doc = {
            "partner_id": partner_id,
            "name": partner_data.name,
            "webhook_url": str(partner_data.webhook_url),
            "secret_key": secret_key,
            "events": partner_data.events,
            "description": partner_data.description,
            "active": True,
            "created_at": datetime.utcnow(),
            "last_notification": None,
            "total_notifications": 0,
            "failed_notifications": 0
        }
        
        await self.partners_collection.insert_one(partner_doc)
        
        # Remover _id del response
        partner_doc.pop("_id", None)
        return partner_doc
    
    async def get_partner(self, partner_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtener un partner por ID
        """
        partner = await self.partners_collection.find_one(
            {"partner_id": partner_id},
            {"_id": 0}
        )
        return partner
    
    async def list_partners(
        self,
        active: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """
        Listar partners
        """
        query = {}
        if active is not None:
            query["active"] = active
        
        cursor = self.partners_collection.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1)
        
        partners = await cursor.to_list(length=None)
        return partners
    
    async def deactivate_partner(self, partner_id: str) -> bool:
        """
        Desactivar un partner
        """
        result = await self.partners_collection.update_one(
            {"partner_id": partner_id},
            {"$set": {"active": False}}
        )
        return result.modified_count > 0
    
    async def regenerate_secret(self, partner_id: str) -> Optional[str]:
        """
        Regenerar la clave secreta de un partner
        """
        new_secret = Partner.generate_secret_key()
        
        result = await self.partners_collection.find_one_and_update(
            {"partner_id": partner_id},
            {"$set": {"secret_key": new_secret}},
            return_document=True,
            projection={"_id": 0, "secret_key": 1}
        )
        
        return result.get("secret_key") if result else None
    
    async def increment_notifications(
        self,
        partner_id: str,
        success: bool = True
    ):
        """
        Incrementar contador de notificaciones
        """
        update = {
            "$set": {"last_notification": datetime.utcnow()},
            "$inc": {"total_notifications": 1}
        }
        
        if not success:
            update["$inc"]["failed_notifications"] = 1
        
        await self.partners_collection.update_one(
            {"partner_id": partner_id},
            update
        )
