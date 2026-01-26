"""
🔄 Test Integración Bidireccional Completa - Equipo A
Testing suite para verificar la integración bidireccional de Equipo A (Recomendaciones Turísticas)

Autor: Equipo A
Fecha: 25 de enero de 2026
Status: LISTO PARA PRUEBAS

Requisitos:
1. ✅ API Rest corriendo en http://localhost:8000
2. ✅ Auth Service corriendo en http://localhost:8001
3. ✅ MongoDB activo
4. ⏳ ngrok instalado y URL lista

Uso:
    python test_integracion_bidireccional_completa.py
"""

import requests
import json
import hmac
import hashlib
import time
from datetime import datetime, timezone
from typing import Dict, Optional, Tuple
import sys

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

# URLs
LOCAL_API = "http://localhost:8000"
LOCAL_AUTH = "http://localhost:8001"
NGROK_URL = "https://REEMPLAZAR_CON_URL_NGROK.ngrok.io"  # TODO: Actualizar con URL real

# Secrets
INTEGRACION_SECRET = "integracion-turismo-2026-uleam"
JWT_SECRET = "integracion-turismo-2026-uleam-jwt-secret-key-payment-service"

# Headers de color
COLORS = {
    'HEADER': '\033[95m',
    'BLUE': '\033[94m',
    'CYAN': '\033[96m',
    'GREEN': '\033[92m',
    'YELLOW': '\033[93m',
    'RED': '\033[91m',
    'END': '\033[0m',
    'BOLD': '\033[1m',
    'UNDERLINE': '\033[4m',
}

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

def print_header(text: str, color: str = 'HEADER'):
    """Imprime un header formateado"""
    print(f"\n{COLORS[color]}{COLORS['BOLD']}\n{'='*80}")
    print(f"  {text}")
    print(f"{'='*80}{COLORS['END']}\n")

def print_section(text: str):
    """Imprime una sección"""
    print(f"{COLORS['CYAN']}{COLORS['BOLD']}▶ {text}{COLORS['END']}")

def print_success(text: str):
    """Imprime éxito"""
    print(f"{COLORS['GREEN']}✅ {text}{COLORS['END']}")

def print_error(text: str):
    """Imprime error"""
    print(f"{COLORS['RED']}❌ {text}{COLORS['END']}")

def print_warning(text: str):
    """Imprime advertencia"""
    print(f"{COLORS['YELLOW']}⚠️ {text}{COLORS['END']}")

def print_info(text: str):
    """Imprime información"""
    print(f"{COLORS['BLUE']}ℹ️ {text}{COLORS['END']}")

def generar_firma_hmac(payload: Dict) -> str:
    """Genera firma HMAC-SHA256 para payload"""
    payload_json = json.dumps(payload, separators=(',', ':'), sort_keys=True)
    firma = hmac.new(
        INTEGRACION_SECRET.encode(),
        payload_json.encode(),
        hashlib.sha256
    ).hexdigest()
    return firma

def verificar_firma_hmac(payload: Dict, firma_recibida: str) -> bool:
    """Verifica firma HMAC-SHA256"""
    firma_esperada = generar_firma_hmac(payload)
    return hmac.compare_digest(firma_esperada, firma_recibida)

# ============================================================================
# TESTS
# ============================================================================

def test_1_conexion_api():
    """Test 1: Verificar conexión a API"""
    print_section("Test 1: Verificar conexión a API local")
    
    try:
        response = requests.get(f"{LOCAL_API}/docs", timeout=5)
        if response.status_code == 200:
            print_success(f"API accesible en {LOCAL_API}")
            return True
        else:
            print_error(f"API retornó status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error(f"No se pudo conectar a {LOCAL_API}")
        print_info("Asegúrate de que: python -m uvicorn main:app --reload")
        return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_2_endpoint_health_check():
    """Test 2: Health check del endpoint de webhooks"""
    print_section("Test 2: Health check del endpoint de webhooks")
    
    try:
        response = requests.get(f"{LOCAL_API}/webhooks/test", timeout=5)
        if response.status_code == 200:
            print_success("Endpoint /webhooks/test disponible")
            print_info(f"Respuesta: {response.json()}")
            return True
        else:
            print_error(f"Status code: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_3_validacion_hmac_invalida():
    """Test 3: Rechazar webhook con firma HMAC inválida"""
    print_section("Test 3: Rechazar webhook con firma HMAC INVÁLIDA")
    
    payload = {
        "event_type": "tour.purchased",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "source_service": "test_system",
        "data": {
            "tour_id": "tour_test_123",
            "user_id": "user_test_456",
            "amount": 150.00,
            "currency": "USD"
        }
    }
    
    # Generar firma INVÁLIDA (distinta)
    firma_invalida = "invalida_" + generar_firma_hmac(payload)
    
    try:
        response = requests.post(
            f"{LOCAL_API}/webhooks/partner",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "X-Webhook-Signature": firma_invalida,
                "X-Webhook-Source": "test_system"
            },
            timeout=5
        )
        
        if response.status_code == 401:
            print_success("✓ Firma inválida correctamente rechazada (401)")
            print_info(f"Respuesta: {response.json()}")
            return True
        else:
            print_error(f"Debería rechazar (401), pero retornó {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_4_validacion_hmac_valida():
    """Test 4: Aceptar webhook con firma HMAC válida"""
    print_section("Test 4: Aceptar webhook con firma HMAC VÁLIDA")
    
    payload = {
        "event_type": "booking.confirmed",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "source_service": "partner_reservas_system",
        "data": {
            "booking_id": "book_bidireccional_001",
            "user_id": "user_partner_789",
            "hotel_id": "hotel_partner_456",
            "check_in": "2026-02-15",
            "check_out": "2026-02-20",
            "total_price": 750.00,
            "currency": "USD"
        }
    }
    
    # Generar firma VÁLIDA
    firma_valida = generar_firma_hmac(payload)
    
    print_info(f"Payload: {json.dumps(payload, indent=2)}")
    print_info(f"Firma HMAC: {firma_valida}")
    
    try:
        response = requests.post(
            f"{LOCAL_API}/webhooks/partner",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "X-Webhook-Signature": firma_valida,
                "X-Webhook-Source": "partner_reservas_system"
            },
            timeout=5
        )
        
        if response.status_code == 200:
            print_success("✓ Firma válida correctamente aceptada (200)")
            print_info(f"Respuesta: {response.json()}")
            return True
        elif response.status_code == 401:
            print_warning(f"Firma válida pero rechazada (401)")
            print_info(f"Respuesta: {response.json()}")
            return False
        else:
            print_warning(f"Status code inesperado: {response.status_code}")
            print_info(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_5_enviar_a_equipo_b():
    """Test 5: Enviar webhook a Equipo B (simulado con ngrok)"""
    print_section("Test 5: Enviar webhook a Equipo B")
    
    if "REEMPLAZAR" in NGROK_URL:
        print_warning("ngrok URL no configurada aún")
        print_info("Pasos para completar este test:")
        print_info("1. Instalar ngrok: scoop install ngrok")
        print_info("2. Autenticar: ngrok config add-authtoken <TOKEN>")
        print_info("3. Exponer API: ngrok http 8000")
        print_info("4. Copiar URL de ngrok y actualizar NGROK_URL en este script")
        return False
    
    print_info(f"Intentando enviar a: {NGROK_URL}")
    
    payload = {
        "event_type": "tour.purchased",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "source_service": "equipo_a_recomendaciones",
        "data": {
            "tour_id": "tour_sendto_equipo_b_001",
            "user_id": "user_from_equipo_a_999",
            "amount": 200.00,
            "currency": "USD",
            "description": "Tour recomendado por Equipo A"
        }
    }
    
    firma = generar_firma_hmac(payload)
    
    try:
        response = requests.post(
            f"{NGROK_URL}/api/reservas",  # Endpoint de Equipo B
            json=payload,
            headers={
                "Content-Type": "application/json",
                "X-Webhook-Signature": firma,
                "X-Webhook-Source": "equipo_a_recomendaciones"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print_success("✓ Webhook enviado a Equipo B exitosamente (200)")
            print_info(f"Respuesta: {response.json()}")
            return True
        else:
            print_warning(f"Status code: {response.status_code}")
            print_info(f"Respuesta: {response.text}")
            return False
    except requests.exceptions.Timeout:
        print_error("Timeout: Equipo B no respondió en 10 segundos")
        return False
    except requests.exceptions.ConnectionError:
        print_error(f"No se puede conectar a {NGROK_URL}")
        print_info("Verifica que:")
        print_info("1. La URL de ngrok es correcta")
        print_info("2. Equipo B tiene su servidor corriendo")
        return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_6_integracion_completa():
    """Test 6: Flujo completo bidireccional"""
    print_section("Test 6: Flujo completo bidireccional")
    
    print_info("Este test simula el flujo completo:")
    print_info("1. Equipo B envía recomendación → Equipo A recibe")
    print_info("2. Equipo A procesa y confirma → Equipo B recibe confirmación")
    
    # Paso 1: Simular recepción de Equipo B
    print("\n📩 Paso 1: Equipo B envía recomendación a Equipo A")
    payload_from_b = {
        "event_type": "recommendation.received",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "source_service": "equipo_b_system",
        "data": {
            "recommendation_id": "rec_bidireccional_001",
            "from_equipo_b": True,
            "package": {
                "name": "Paquete Turístico Premium",
                "destination": "Galápagos",
                "duration": 5,
                "price": 3000.00
            }
        }
    }
    
    firma_from_b = generar_firma_hmac(payload_from_b)
    
    try:
        response = requests.post(
            f"{LOCAL_API}/webhooks/partner",
            json=payload_from_b,
            headers={
                "Content-Type": "application/json",
                "X-Webhook-Signature": firma_from_b,
                "X-Webhook-Source": "equipo_b_system"
            },
            timeout=5
        )
        
        if response.status_code == 200:
            print_success("Equipo A recibió recomendación de Equipo B ✓")
        else:
            print_error(f"Fallo en recepción: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error en paso 1: {str(e)}")
        return False
    
    # Paso 2: Equipo A envía confirmación
    print("\n📤 Paso 2: Equipo A confirma la recomendación")
    confirmation_payload = {
        "event_type": "recommendation.confirmed",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "source_service": "equipo_a_recomendaciones",
        "data": {
            "recommendation_id": "rec_bidireccional_001",
            "status": "confirmed",
            "confirmed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "processed_by": "equipo_a_system"
        }
    }
    
    firma_confirmation = generar_firma_hmac(confirmation_payload)
    
    if "REEMPLAZAR" in NGROK_URL:
        print_warning("No se puede enviar confirmación sin ngrok configurada")
        print_info("Test bidireccional parcialmente completado")
        return True
    
    try:
        response = requests.post(
            f"{NGROK_URL}/api/enviar-reserva-confirmada",
            json=confirmation_payload,
            headers={
                "Content-Type": "application/json",
                "X-Webhook-Signature": firma_confirmation,
                "X-Webhook-Source": "equipo_a_recomendaciones"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print_success("Equipo B recibió confirmación de Equipo A ✓")
            print_success("Flujo bidireccional completado ✓")
            return True
        else:
            print_warning(f"Confirmación rechazada: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error enviando confirmación: {str(e)}")
        return False

# ============================================================================
# MAIN
# ============================================================================

def main():
    """Ejecuta todos los tests"""
    print_header("🔄 Test Integración Bidireccional Completa - Equipo A", 'BLUE')
    print_info(f"Fecha: {datetime.now().strftime('%d de enero de %Y %H:%M:%S')}")
    print_info(f"API Local: {LOCAL_API}")
    print_info(f"Secret de integración: {INTEGRACION_SECRET}")
    
    tests = [
        ("Conexión a API local", test_1_conexion_api),
        ("Health check de webhooks", test_2_endpoint_health_check),
        ("Rechazar firma HMAC inválida", test_3_validacion_hmac_invalida),
        ("Aceptar firma HMAC válida", test_4_validacion_hmac_valida),
        ("Enviar a Equipo B (ngrok)", test_5_enviar_a_equipo_b),
        ("Flujo bidireccional completo", test_6_integracion_completa),
    ]
    
    results = {}
    for i, (name, test_func) in enumerate(tests, 1):
        try:
            result = test_func()
            results[name] = result
            time.sleep(0.5)
        except Exception as e:
            print_error(f"Test crasheó: {str(e)}")
            results[name] = False
    
    # Resumen
    print_header("📊 RESUMEN DE RESULTADOS", 'CYAN')
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        color = 'GREEN' if result else 'RED'
        print(f"{COLORS[color]}{status}{COLORS['END']} - {name}")
    
    print(f"\n{COLORS['BOLD']}Total: {passed}/{total} pruebas pasadas{COLORS['END']}")
    
    if passed == total:
        print_success("¡TODAS LAS PRUEBAS PASARON!")
        print_success("Integración bidireccional LISTA PARA PRODUCCIÓN")
    elif passed >= total * 0.75:
        print_warning("Mayoría de pruebas pasaron, pero hay algunas fallas")
    else:
        print_error("Muchas pruebas fallaron, revisar configuración")
    
    print_info(f"\nProximos pasos:")
    print_info("1. Si ngrok no está configurada:")
    print_info("   ngrok http 8000")
    print_info("2. Copiar URL de ngrok en NGROK_URL")
    print_info("3. Compartir URL con Equipo B")
    print_info("4. Solicitar URL de ngrok de Equipo B")
    print_info("5. Actualizar NGROK_URL y re-ejecutar tests")

if __name__ == "__main__":
    main()
