"""
MockAdapter - Para desarrollo sin credenciales reales
"""
import uuid
import asyncio
from typing import Dict, Optional
from datetime import datetime
import json
import hmac
import hashlib
import requests
from .payment_provider import PaymentProvider, PaymentResult
from config import N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET


class MockAdapter(PaymentProvider):
    """Mock Payment Provider - Simula pagos para desarrollo"""

    async def process_payment(
        self,
        amount: float,
        currency: str,
        description: str,
        user_id: str,
        metadata: Dict = None
    ) -> PaymentResult:
        """Simula el procesamiento de un pago"""
        
        # Generar transaction_id
        transaction_id = f"mock_{uuid.uuid4().hex[:12]}"
        
        # Simular pago exitoso (80% de probabilidad)
        import random
        success = random.random() < 0.8
        
        result = PaymentResult(
            transaction_id=transaction_id,
            status="completed" if success else "failed",
            provider_transaction_id=f"mock_provider_{uuid.uuid4().hex[:8]}",
            error_message=None if success else "Fondos insuficientes simulados"
        )
        
        # Enviar webhook a n8n después de 1 segundo (simular demora)
        if success:
            asyncio.create_task(
                self._send_webhook(
                    transaction_id=transaction_id,
                    amount=amount,
                    currency=currency,
                    user_id=user_id,
                    metadata=metadata,
                    status="completed"
                )
            )
        
        return result

    async def get_payment_status(self, transaction_id: str) -> str:
        """Obtener estado de un pago mock"""
        # En mock, todos los pagos están "completed"
        if transaction_id.startswith("mock_"):
            return "completed"
        return "unknown"

    def validate_webhook(self, payload: Dict, signature: str) -> bool:
        """Validar webhook (no implementado en mock)"""
        return True

    async def refund_payment(self, transaction_id: str, amount: float = None) -> bool:
        """Reembolsar un pago mock"""
        return True

    async def _send_webhook(
        self,
        transaction_id: str,
        amount: float,
        currency: str,
        user_id: str,
        metadata: Dict,
        status: str
    ):
        """Enviar webhook a n8n simulando pagador real"""
        await asyncio.sleep(1)  # Simular demora de procesamiento
        
        payload = {
            "event": "payment.success" if status == "completed" else "payment.failed",
            "timestamp": int(datetime.utcnow().timestamp()),
            "transaction_id": transaction_id,
            "amount": amount,
            "currency": currency,
            "user_id": user_id,
            "metadata": metadata or {}
        }
        
        # Generar firma HMAC
        payload_str = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            N8N_WEBHOOK_SECRET.encode(),
            payload_str.encode(),
            hashlib.sha256
        ).hexdigest()
        
        try:
            headers = {
                "X-Webhook-Signature": signature,
                "X-Webhook-Event": payload["event"],
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                N8N_WEBHOOK_URL,
                json=payload,
                headers=headers,
                timeout=10
            )
            
            print(f"✅ Webhook enviado a n8n: {response.status_code}")
        except Exception as e:
            print(f"❌ Error enviando webhook: {e}")
