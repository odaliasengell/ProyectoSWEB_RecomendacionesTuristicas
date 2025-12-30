"""
Cliente HTTP para comunicarse con el Payment Service.
Maneja la lógica de conectar con http://localhost:8200/payment/process
e integrar pagos en la REST API.
"""
import httpx
import json
import os
import hmac
import hashlib
from typing import Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

PAYMENT_SERVICE_URL = os.getenv("PAYMENT_SERVICE_URL", "http://localhost:8200")
PAYMENT_SERVICE_SECRET = os.getenv("PAYMENT_SERVICE_SECRET", "shared-secret-key")


class PaymentClient:
    """Cliente para interactuar con el Payment Service."""
    
    def __init__(self):
        self.base_url = PAYMENT_SERVICE_URL
        self.secret = PAYMENT_SERVICE_SECRET
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Cerrar la conexión HTTP."""
        await self.client.aclose()
    
    def _sign_payload(self, payload: Dict[str, Any]) -> str:
        """
        Firmar un payload con HMAC-SHA256.
        Retorna el hash en formato hexadecimal.
        """
        payload_str = json.dumps(payload, sort_keys=True, separators=(',', ':'))
        signature = hmac.new(
            self.secret.encode(),
            payload_str.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    async def process_payment(
        self,
        user_id: str,
        amount: float,
        currency: str = "USD",
        description: str = "",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Procesar un pago a través del Payment Service.
        
        Args:
            user_id: ID del usuario que realiza el pago
            amount: Monto a pagar
            currency: Moneda (USD, EUR, etc.)
            description: Descripción del pago
            metadata: Datos adicionales (tour_id, reserva_id, etc.)
        
        Returns:
            Respuesta del Payment Service con estado del pago
        """
        payload = {
            "user_id": user_id,
            "amount": amount,
            "currency": currency,
            "description": description,
            "metadata": metadata or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Firmar el payload
        signature = self._sign_payload(payload)
        
        headers = {
            "Content-Type": "application/json",
            "X-Signature": signature
        }
        
        try:
            response = await self.client.post(
                f"{self.base_url}/payment/process",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            return {
                "status": "error",
                "message": f"Error de conexión con Payment Service: {str(e)}",
                "error": str(e)
            }
        except httpx.HTTPStatusError as e:
            return {
                "status": "error",
                "message": f"Payment Service retornó error: {e.status_code}",
                "error": str(e)
            }
    
    async def validate_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Validar el estado de un pago existente.
        
        Args:
            payment_id: ID del pago a validar
        
        Returns:
            Estado del pago
        """
        try:
            response = await self.client.get(
                f"{self.base_url}/payment/validate/{payment_id}"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error validando pago: {str(e)}"
            }
    
    async def refund_payment(self, payment_id: str, reason: str = "") -> Dict[str, Any]:
        """
        Solicitar un reembolso para un pago.
        
        Args:
            payment_id: ID del pago a reembolsar
            reason: Razón del reembolso
        
        Returns:
            Estado del reembolso
        """
        payload = {
            "payment_id": payment_id,
            "reason": reason,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        signature = self._sign_payload(payload)
        headers = {"X-Signature": signature}
        
        try:
            response = await self.client.post(
                f"{self.base_url}/payment/refund",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error procesando reembolso: {str(e)}"
            }


# Instancia global del cliente
payment_client = PaymentClient()
