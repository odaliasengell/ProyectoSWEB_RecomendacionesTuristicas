"""
Webhook Service - Gestión de webhooks bidireccionales
Autor: Odalis Senge
"""
import hmac
import hashlib
import secrets
from datetime import datetime
from typing import Dict, Any, List
from bson import ObjectId
import httpx


class WebhookService:
    """Servicio de gestión de webhooks"""
    
    def __init__(self, db):
        self.db = db
        self.partners_collection = db.partners
        self.webhook_logs_collection = db.webhook_logs
    
    async def process_payment_webhook(
        self,
        provider: str,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Procesar webhook recibido de una pasarela de pago"""
        
        # Normalizar payload según provider
        normalized = self._normalize_webhook(provider, payload)
        
        # Registrar webhook recibido
        log_doc = {
            "type": "incoming",
            "provider": provider,
            "payload": payload,
            "normalized": normalized,
            "timestamp": datetime.utcnow()
        }
        await self.webhook_logs_collection.insert_one(log_doc)
        
        return normalized
    
    async def forward_to_partners(self, payment_data: Dict[str, Any]):
        """Enviar webhook a partners registrados"""
        partners = await self.list_partners(active_only=True)
        
        for partner in partners:
            # Verificar si el partner está suscrito a este evento
            event_type = f"payment.{payment_data.get('status')}"
            if event_type not in partner.get("events", []):
                continue
            
            # Generar firma HMAC
            signature = self._generate_signature(
                partner["secret_key"],
                payment_data
            )
            
            # Enviar webhook
            await self._send_webhook(
                url=partner["webhook_url"],
                payload=payment_data,
                signature=signature,
                partner_id=str(partner["_id"])
            )
    
    async def register_partner(
        self,
        name: str,
        webhook_url: str,
        events: List[str]
    ) -> Dict[str, Any]:
        """Registrar un nuevo partner"""
        
        # Generar clave secreta para HMAC
        secret_key = secrets.token_urlsafe(32)
        
        partner_doc = {
            "name": name,
            "webhook_url": webhook_url,
            "events": events,
            "secret_key": secret_key,
            "active": True,
            "created_at": datetime.utcnow()
        }
        
        result = await self.partners_collection.insert_one(partner_doc)
        partner_doc["id"] = str(result.inserted_id)
        
        return {
            "id": partner_doc["id"],
            "name": name,
            "webhook_url": webhook_url,
            "events": events,
            "secret_key": secret_key,
            "active": True,
            "created_at": partner_doc["created_at"]
        }
    
    async def list_partners(self, active_only: bool = False) -> List[Dict]:
        """Listar partners registrados"""
        query = {"active": True} if active_only else {}
        cursor = self.partners_collection.find(query)
        partners = await cursor.to_list(length=100)
        return partners
    
    def _normalize_webhook(
        self,
        provider: str,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Normalizar payload de webhook según provider"""
        
        if provider == "mock":
            return {
                "payment_id": payload.get("payment_id"),
                "status": payload.get("status"),
                "amount": payload.get("amount"),
                "currency": payload.get("currency"),
                "provider": provider
            }
        elif provider == "stripe":
            # Normalizar formato de Stripe
            event_type = payload.get("type", "")
            data = payload.get("data", {}).get("object", {})
            
            status_map = {
                "payment_intent.succeeded": "completed",
                "payment_intent.payment_failed": "failed"
            }
            
            return {
                "payment_id": data.get("id"),
                "status": status_map.get(event_type, "unknown"),
                "amount": data.get("amount", 0) / 100,  # Stripe usa centavos
                "currency": data.get("currency", "USD").upper(),
                "provider": provider
            }
        else:
            return payload
    
    def _generate_signature(
        self,
        secret_key: str,
        payload: Dict[str, Any]
    ) -> str:
        """Generar firma HMAC para webhook"""
        import json
        payload_str = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            secret_key.encode(),
            payload_str.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    async def _send_webhook(
        self,
        url: str,
        payload: Dict[str, Any],
        signature: str,
        partner_id: str
    ):
        """Enviar webhook a partner"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "X-Webhook-Signature": signature,
                    "Content-Type": "application/json"
                }
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                    timeout=10.0
                )
                
                # Registrar envío
                log_doc = {
                    "type": "outgoing",
                    "partner_id": partner_id,
                    "url": url,
                    "payload": payload,
                    "status_code": response.status_code,
                    "timestamp": datetime.utcnow()
                }
                await self.webhook_logs_collection.insert_one(log_doc)
                
        except Exception as e:
            # Registrar error
            log_doc = {
                "type": "outgoing",
                "partner_id": partner_id,
                "url": url,
                "payload": payload,
                "error": str(e),
                "timestamp": datetime.utcnow()
            }
            await self.webhook_logs_collection.insert_one(log_doc)
