"""
Payment Service - Lógica de negocio para pagos
Autor: Odalis Senge
"""
from datetime import datetime
from typing import Optional, Dict, Any
from bson import ObjectId

from ..adapters.payment_provider import PaymentProvider
from ..adapters.mock_adapter import MockAdapter
from ..adapters.stripe_adapter import StripeAdapter


class PaymentService:
    """Servicio de gestión de pagos"""
    
    def __init__(self, db):
        self.db = db
        self.payments_collection = db.payments
        
        # Inicializar adapters disponibles
        self.providers: Dict[str, PaymentProvider] = {
            "mock": MockAdapter(),
            "stripe": StripeAdapter()
        }
        self.default_provider = "mock"
    
    async def create_payment(
        self,
        amount: float,
        currency: str,
        description: str,
        customer_email: str,
        provider: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Crear un nuevo pago usando el provider especificado"""
        
        # Seleccionar provider
        provider_name = provider or self.default_provider
        if provider_name not in self.providers:
            raise ValueError(f"Provider no soportado: {provider_name}")
        
        adapter = self.providers[provider_name]
        
        # Preparar datos del pago
        payment_data_dict = {
            "amount": amount,
            "currency": currency,
            "description": description,
            "customer_email": customer_email,
            "metadata": metadata or {}
        }
        
        # Crear pago en el provider
        provider_response = await adapter.create_payment(payment_data_dict)
        
        # Guardar en BD
        payment_doc = {
            "amount": amount,
            "currency": currency,
            "status": provider_response["status"],
            "description": description,
            "customer_email": customer_email,
            "provider": provider_name,
            "provider_payment_id": provider_response["id"],
            "metadata": metadata or {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.payments_collection.insert_one(payment_doc)
        payment_doc["id"] = str(result.inserted_id)
        payment_doc["_id"] = result.inserted_id
        
        return self._format_payment(payment_doc)
    
    async def get_payment(self, payment_id: str) -> Optional[Dict[str, Any]]:
        """Obtener un pago por ID"""
        try:
            payment = await self.payments_collection.find_one(
                {"_id": ObjectId(payment_id)}
            )
            if payment:
                return self._format_payment(payment)
        except:
            pass
        return None
    
    async def update_payment(
        self,
        payment_id: str,
        status: Optional[str] = None,
        provider_payment_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """Actualizar un pago"""
        update_data = {"updated_at": datetime.utcnow()}
        
        if status:
            update_data["status"] = status
        if provider_payment_id:
            update_data["provider_payment_id"] = provider_payment_id
        if metadata:
            update_data["metadata"] = metadata
        
        result = await self.payments_collection.find_one_and_update(
            {"_id": ObjectId(payment_id)},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            return self._format_payment(result)
        return None
    
    def _format_payment(self, payment_doc: Dict) -> Dict[str, Any]:
        """Formatear documento de pago para respuesta"""
        return {
            "id": str(payment_doc["_id"]),
            "amount": payment_doc["amount"],
            "currency": payment_doc["currency"],
            "status": payment_doc["status"],
            "description": payment_doc["description"],
            "customer_email": payment_doc["customer_email"],
            "provider": payment_doc["provider"],
            "provider_payment_id": payment_doc.get("provider_payment_id"),
            "metadata": payment_doc.get("metadata", {}),
            "created_at": payment_doc["created_at"],
            "updated_at": payment_doc["updated_at"]
        }
