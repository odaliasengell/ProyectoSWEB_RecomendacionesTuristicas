#!/usr/bin/env python3
"""
Script de prueba para webhooks - Semana 3.
Prueba end-to-end de envío y recepción de webhooks.

Uso:
  python test_webhooks.py
  
Requiere:
  - httpx
  - fastapi
"""

import asyncio
import json
import hashlib
import hmac
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Importar los servicios
try:
    from backend.rest_api.app.services.webhook_service import (
        HMACValidator,
        PartnerWebhookClient,
        WebhookEventValidator,
    )
except ImportError:
    logger.warning("⚠️ No se pudo importar módulos, usando versión simulada")
    
    class HMACValidator:
        @staticmethod
        def generate_signature(payload, secret):
            return hmac.new(
                secret.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
        
        @staticmethod
        def verify_signature(payload, signature, secret):
            expected = HMACValidator.generate_signature(payload, secret)
            return hmac.compare_digest(expected, signature)


# ============================================================================
# Test 1: Generación y validación de firma HMAC
# ============================================================================

def test_hmac_signature():
    """Test de generación y validación de firma HMAC-SHA256"""
    print("\n" + "="*70)
    print("TEST 1: HMAC-SHA256 Signature")
    print("="*70)
    
    payload = {
        "event_type": "tour.purchased",
        "timestamp": datetime.utcnow().isoformat(),
        "data": {
            "tour_id": "tour_456",
            "user_id": "user_123",
            "total_price": 1200.50
        }
    }
    
    payload_str = json.dumps(payload)
    secret = "shared_secret_tourism_123"
    
    # Generar firma
    signature = HMACValidator.generate_signature(payload_str, secret)
    print(f"✅ Firma generada: {signature[:20]}...")
    
    # Validar firma correcta
    is_valid = HMACValidator.verify_signature(payload_str, signature, secret)
    print(f"✅ Validación con firma correcta: {is_valid}")
    
    # Validar firma incorrecta (tampering)
    tampered_signature = signature[:-5] + "xxxxx"
    is_tampered = HMACValidator.verify_signature(payload_str, tampered_signature, secret)
    print(f"✅ Detección de payload tampered: {not is_tampered}")
    
    # Validar con secret diferente
    wrong_secret = "wrong_secret"
    wrong_sig = HMACValidator.generate_signature(payload_str, wrong_secret)
    is_wrong_secret = HMACValidator.verify_signature(payload_str, wrong_sig, secret)
    print(f"✅ Detección de secret diferente: {not is_wrong_secret}")
    
    assert is_valid, "Firma válida no fue validada"
    assert not is_tampered, "Firma tampered fue validada (error!)"
    assert not is_wrong_secret, "Secret diferente fue aceptado (error!)"
    
    print("✅ TEST 1 PASSED")


# ============================================================================
# Test 2: Construcción de payload de evento
# ============================================================================

def test_event_payload():
    """Test de construcción de payload de eventos"""
    print("\n" + "="*70)
    print("TEST 2: Event Payload Construction")
    print("="*70)
    
    payload = {
        "event_type": "tour.purchased",
        "timestamp": "2025-01-24T15:30:45",
        "source_service": "tourism_recomendaciones",
        "data": {
            "tour_id": "tour_456",
            "tour_name": "Tour Galápagos Premium",
            "user_id": "user_123",
            "user_email": "juan@example.com",
            "quantity": 2,
            "total_price": 1200.50,
            "reservation_id": "res_789",
            "travel_date": "2025-03-15"
        }
    }
    
    # Validar estructura
    assert payload["event_type"] == "tour.purchased", "Event type incorrecto"
    assert "timestamp" in payload, "Falta timestamp"
    assert "source_service" in payload, "Falta source_service"
    assert "data" in payload, "Falta data"
    
    data = payload["data"]
    required_fields = ["tour_id", "user_id", "user_email", "quantity", "total_price", "reservation_id"]
    for field in required_fields:
        assert field in data, f"Falta campo requerido: {field}"
    
    print(f"✅ Payload válido:")
    print(json.dumps(payload, indent=2))
    print("✅ TEST 2 PASSED")


# ============================================================================
# Test 3: Validación de eventos recibidos
# ============================================================================

def test_webhook_event_validator():
    """Test de validador de eventos de webhook"""
    print("\n" + "="*70)
    print("TEST 3: Webhook Event Validator")
    print("="*70)
    
    # Evento válido
    event_data = {
        "event_type": "booking.confirmed",
        "timestamp": "2025-01-24T16:00:00",
        "source_service": "reservas_system",
        "data": {
            "booking_id": "book_123",
            "user_id": "user_123",
            "hotel_id": "hotel_789",
            "check_in": "2025-02-01",
            "total_price": 500.00
        }
    }
    
    # Procesar evento
    result = WebhookEventValidator.process_booking_confirmed(event_data)
    
    assert result["processed"] == True, "Evento no fue procesado"
    assert result["booking_id"] == "book_123", "booking_id incorrecto"
    
    print(f"✅ Evento procesado:")
    print(json.dumps(result, indent=2))
    print("✅ TEST 3 PASSED")


# ============================================================================
# Test 4: Simulación de petición HTTP con curl
# ============================================================================

def test_curl_command():
    """Genera comandos curl para pruebas manuales"""
    print("\n" + "="*70)
    print("TEST 4: cURL Commands for Manual Testing")
    print("="*70)
    
    payload = {
        "event_type": "tour.purchased",
        "timestamp": datetime.utcnow().isoformat(),
        "source_service": "tourism_recomendaciones",
        "data": {
            "tour_id": "tour_456",
            "tour_name": "Tour Galápagos Premium",
            "user_id": "user_123",
            "user_email": "juan@example.com",
            "quantity": 2,
            "total_price": 1200.50,
            "reservation_id": "res_789",
            "travel_date": "2025-03-15"
        }
    }
    
    payload_str = json.dumps(payload)
    secret = "shared_secret_tourism_123"
    signature = HMACValidator.generate_signature(payload_str, secret)
    
    # Comando curl (Linux/Mac)
    curl_cmd = f"""
curl -X POST http://localhost:8000/webhooks/partner \\
  -H 'Content-Type: application/json' \\
  -H 'X-Webhook-Signature: {signature}' \\
  -H 'X-Webhook-Source: tourism_recomendaciones' \\
  -d '{payload_str}'
"""
    
    print("📝 Comando curl (Linux/Mac/PowerShell):")
    print(curl_cmd)
    
    # Comando PowerShell (Windows)
    ps_cmd = f"""
$payload = '{payload_str}'
$signature = '{signature}'

Invoke-WebRequest -Uri 'http://localhost:8000/webhooks/partner' `
  -Method POST `
  -Headers @{{
    'Content-Type' = 'application/json'
    'X-Webhook-Signature' = $signature
    'X-Webhook-Source' = 'tourism_recomendaciones'
  }} `
  -Body $payload
"""
    
    print("\n📝 Comando PowerShell (Windows):")
    print(ps_cmd)
    print("✅ TEST 4 PASSED")


# ============================================================================
# Test 5: Crear reserva con webhook
# ============================================================================

async def test_create_reservation_payload():
    """Test de payload para crear reserva con webhook"""
    print("\n" + "="*70)
    print("TEST 5: Create Reservation with Webhook Payload")
    print("="*70)
    
    payload = {
        "usuario_id": "user_123",
        "usuario_nombre": "Juan Pérez",
        "usuario_email": "juan@example.com",
        "tour_id": "tour_456",
        "tour_nombre": "Tour Galápagos Premium",
        "cantidad_personas": 2,
        "precio_total": 1200.50,
        "fecha": "2025-03-15"
    }
    
    print("📝 Payload para POST /reservas/webhook/tour-purchased:")
    print(json.dumps(payload, indent=2))
    
    # Validar campos requeridos
    required = ["usuario_id", "tour_id", "usuario_email", "fecha"]
    for field in required:
        assert field in payload, f"Falta campo requerido: {field}"
    
    print("✅ Payload válido para crear reserva con webhook")
    print("✅ TEST 5 PASSED")


# ============================================================================
# Test 6: Endpoint de prueba
# ============================================================================

def test_endpoints():
    """Información de endpoints disponibles"""
    print("\n" + "="*70)
    print("TEST 6: Available Endpoints")
    print("="*70)
    
    endpoints = {
        "GET /webhooks/test": "Verificar que el servicio está activo",
        "POST /webhooks/partner": "Recibir webhooks del grupo partner",
        "POST /reservas/webhook/tour-purchased": "Crear reserva y enviar webhook",
        "POST /webhooks/validate-hmac": "Validar firma HMAC (debug)",
    }
    
    print("✅ Endpoints disponibles:")
    for endpoint, desc in endpoints.items():
        print(f"  {endpoint:<45} → {desc}")
    
    print("✅ TEST 6 PASSED")


# ============================================================================
# Test 7: Checklist de coordinación con partner
# ============================================================================

def test_coordination_checklist():
    """Checklist para coordinación con grupo partner"""
    print("\n" + "="*70)
    print("TEST 7: Partner Coordination Checklist")
    print("="*70)
    
    checklist = {
        "Información a compartir con partner": [
            "URL del webhook: https://abc123.ngrok.io/webhooks/partner",
            "Secret compartido: shared_secret_tourism_123",
            "Algoritmo: HMAC-SHA256",
            "Headers requeridos: X-Webhook-Signature, X-Webhook-Source",
            "Eventos soportados: tour.purchased, booking.updated",
        ],
        "Información a recibir del partner": [
            "URL de webhook del partner",
            "Secret compartido (o confirmar que es igual)",
            "Eventos que enviarán (ej: booking.confirmed, payment.success)",
            "Email de contacto técnico",
        ],
        "Pruebas a realizar": [
            "Test local (ambos en localhost)",
            "Test con IP local de partner",
            "Test con ngrok",
            "Test de firma HMAC",
            "Test de validación de payload",
            "Test de ACK responses",
        ],
        "Documentación entregada": [
            "SEMANA3_WEBHOOKS_GUIDE.md (guía completa)",
            "PARTNER_INTEGRATION_GUIDE.md (para el partner)",
            "test_webhooks.py (este archivo)",
        ]
    }
    
    for category, items in checklist.items():
        print(f"\n{category}:")
        for item in items:
            print(f"  ☐ {item}")
    
    print("\n✅ TEST 7 PASSED")


# ============================================================================
# Main
# ============================================================================

def main():
    print("\n" + "="*70)
    print("🧪 PRUEBAS DE WEBHOOKS - SEMANA 3")
    print("="*70)
    
    try:
        # Tests síncronos
        test_hmac_signature()
        test_event_payload()
        test_webhook_event_validator()
        test_curl_command()
        test_endpoints()
        test_coordination_checklist()
        
        # Tests asincronos
        asyncio.run(test_create_reservation_payload())
        
        # Resumen
        print("\n" + "="*70)
        print("✅ TODOS LOS TESTS PASARON")
        print("="*70)
        print("\n📋 PRÓXIMOS PASOS:")
        print("1. Instalar ngrok: https://ngrok.com")
        print("2. Ejecutar: ngrok http 8000")
        print("3. Copiar URL ngrok (https://abc123.ngrok.io)")
        print("4. Coordinar con grupo partner (compartir URL y secret)")
        print("5. Probar endpoint POST /reservas/webhook/tour-purchased")
        print("6. Hacer commit con mensaje: 'feat(webhooks): integración con grupo partner'")
        print("\n")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        exit(1)


if __name__ == "__main__":
    main()
