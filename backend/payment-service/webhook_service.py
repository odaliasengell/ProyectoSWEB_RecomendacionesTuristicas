from typing import List, Optional, Dict, Any
from datetime import datetime
import httpx
from beanie import PydanticObjectId
from models import Partner, WebhookLog, WebhookEventType
from hmac_utils import create_webhook_headers, generate_secret
from config import get_settings

settings = get_settings()


class WebhookService:
    """Servicio para gestión de webhooks"""
    
    @staticmethod
    async def register_partner(
        name: str,
        webhook_url: str,
        subscribed_events: List[WebhookEventType],
        contact_email: Optional[str] = None,
        description: Optional[str] = None
    ) -> Partner:
        """
        Registra un nuevo partner
        
        Args:
            name: Nombre del partner
            webhook_url: URL del webhook
            subscribed_events: Eventos suscritos
            contact_email: Email de contacto
            description: Descripción
        
        Returns:
            Partner creado
        """
        # Generar secret único para este partner
        secret = generate_secret(32)
        
        partner = Partner(
            name=name,
            webhook_url=webhook_url,
            secret=secret,
            subscribed_events=subscribed_events,
            contact_email=contact_email,
            description=description,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        await partner.insert()
        return partner
    
    @staticmethod
    async def get_partner(partner_id: str) -> Optional[Partner]:
        """Obtiene un partner por ID"""
        return await Partner.get(PydanticObjectId(partner_id))
    
    @staticmethod
    async def get_all_partners(
        is_active: Optional[bool] = None
    ) -> List[Partner]:
        """
        Obtiene todos los partners
        
        Args:
            is_active: Filtrar por estado activo/inactivo
        
        Returns:
            Lista de partners
        """
        query = {}
        if is_active is not None:
            query["is_active"] = is_active
        
        return await Partner.find(query).to_list()
    
    @staticmethod
    async def update_partner(
        partner_id: str,
        **update_data
    ) -> Optional[Partner]:
        """
        Actualiza un partner
        
        Args:
            partner_id: ID del partner
            **update_data: Datos a actualizar
        
        Returns:
            Partner actualizado
        """
        partner = await Partner.get(PydanticObjectId(partner_id))
        if not partner:
            return None
        
        update_data["updated_at"] = datetime.utcnow()
        
        for field, value in update_data.items():
            if value is not None and hasattr(partner, field):
                setattr(partner, field, value)
        
        await partner.save()
        return partner
    
    @staticmethod
    async def delete_partner(partner_id: str) -> bool:
        """
        Elimina un partner (soft delete)
        
        Args:
            partner_id: ID del partner
        
        Returns:
            True si se eliminó correctamente
        """
        partner = await Partner.get(PydanticObjectId(partner_id))
        if not partner:
            return False
        
        partner.is_active = False
        partner.updated_at = datetime.utcnow()
        await partner.save()
        return True
    
    @staticmethod
    async def send_webhook(
        event_type: WebhookEventType,
        data: Dict[str, Any],
        partner_ids: Optional[List[str]] = None,
        max_retries: int = 3
    ) -> List[WebhookLog]:
        """
        Envía un webhook a partners suscritos
        
        Args:
            event_type: Tipo de evento
            data: Datos del evento
            partner_ids: IDs de partners específicos (opcional)
            max_retries: Máximo número de reintentos
        
        Returns:
            Lista de logs de webhook
        """
        # Obtener partners
        if partner_ids:
            partners = []
            for pid in partner_ids:
                partner = await Partner.get(PydanticObjectId(pid))
                if partner:
                    partners.append(partner)
        else:
            # Obtener todos los partners activos suscritos a este evento
            partners = await Partner.find({
                "is_active": True,
                "subscribed_events": event_type
            }).to_list()
        
        if not partners:
            return []
        
        # Preparar payload
        payload = {
            "event": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "service": settings.SERVICE_NAME,
            "data": data
        }
        
        # Enviar a cada partner
        logs = []
        async with httpx.AsyncClient(timeout=10.0) as client:
            for partner in partners:
                log = await WebhookService._send_to_partner(
                    client,
                    partner,
                    payload,
                    event_type,
                    max_retries
                )
                logs.append(log)
        
        return logs
    
    @staticmethod
    async def _send_to_partner(
        client: httpx.AsyncClient,
        partner: Partner,
        payload: Dict[str, Any],
        event_type: WebhookEventType,
        max_retries: int = 3
    ) -> WebhookLog:
        """
        Envía webhook a un partner específico con reintentos
        
        Args:
            client: Cliente HTTP
            partner: Partner destino
            payload: Payload del webhook
            event_type: Tipo de evento
            max_retries: Máximo reintentos
        
        Returns:
            Log del webhook
        """
        # Crear headers con firma HMAC
        headers = create_webhook_headers(
            payload,
            partner.secret,
            settings.SERVICE_NAME
        )
        
        # Intentar enviar con reintentos
        retry_count = 0
        last_error = None
        
        while retry_count <= max_retries:
            try:
                response = await client.post(
                    partner.webhook_url,
                    json=payload,
                    headers=headers
                )
                
                # Crear log
                log = WebhookLog(
                    event_type=event_type,
                    direction="outgoing",
                    partner_id=str(partner.id),
                    partner_name=partner.name,
                    url=partner.webhook_url,
                    payload=payload,
                    headers=headers,
                    status_code=response.status_code,
                    success=200 <= response.status_code < 300,
                    signature=headers.get("X-Webhook-Signature"),
                    retry_count=retry_count,
                    created_at=datetime.utcnow(),
                    completed_at=datetime.utcnow()
                )
                
                await log.insert()
                
                # Actualizar last_ping del partner
                partner.last_ping = datetime.utcnow()
                await partner.save()
                
                return log
                
            except Exception as e:
                last_error = str(e)
                retry_count += 1
                
                if retry_count > max_retries:
                    # Falló todos los reintentos
                    log = WebhookLog(
                        event_type=event_type,
                        direction="outgoing",
                        partner_id=str(partner.id),
                        partner_name=partner.name,
                        url=partner.webhook_url,
                        payload=payload,
                        headers=headers,
                        success=False,
                        error_message=last_error,
                        retry_count=retry_count - 1,
                        created_at=datetime.utcnow(),
                        completed_at=datetime.utcnow()
                    )
                    
                    await log.insert()
                    return log
    
    @staticmethod
    async def log_incoming_webhook(
        event_type: str,
        payload: Dict[str, Any],
        headers: Dict[str, str],
        partner_name: Optional[str] = None,
        signature_verified: bool = False,
        success: bool = True,
        error_message: Optional[str] = None
    ) -> WebhookLog:
        """
        Registra un webhook entrante
        
        Args:
            event_type: Tipo de evento
            payload: Datos del webhook
            headers: Headers de la request
            partner_name: Nombre del partner
            signature_verified: Si la firma fue verificada
            success: Si el procesamiento fue exitoso
            error_message: Mensaje de error (si aplica)
        
        Returns:
            Log creado
        """
        log = WebhookLog(
            event_type=event_type,
            direction="incoming",
            partner_name=partner_name,
            url=headers.get("referer", "unknown"),
            payload=payload,
            headers=headers,
            success=success,
            error_message=error_message,
            signature=headers.get("X-Webhook-Signature"),
            signature_verified=signature_verified,
            created_at=datetime.utcnow(),
            completed_at=datetime.utcnow()
        )
        
        await log.insert()
        return log
    
    @staticmethod
    async def get_webhook_logs(
        direction: Optional[str] = None,
        partner_id: Optional[str] = None,
        event_type: Optional[WebhookEventType] = None,
        success: Optional[bool] = None,
        limit: int = 100
    ) -> List[WebhookLog]:
        """
        Obtiene logs de webhooks con filtros
        
        Args:
            direction: incoming o outgoing
            partner_id: ID del partner
            event_type: Tipo de evento
            success: Filtrar por éxito/fallo
            limit: Límite de resultados
        
        Returns:
            Lista de logs
        """
        query = {}
        
        if direction:
            query["direction"] = direction
        if partner_id:
            query["partner_id"] = partner_id
        if event_type:
            query["event_type"] = event_type
        if success is not None:
            query["success"] = success
        
        return await WebhookLog.find(query).sort("-created_at").limit(limit).to_list()
