#!/usr/bin/env python3
"""
Test de Integración Bidireccional - Equipo A <-> Equipo B
Verifica la comunicación con Equipo B usando ngrok
"""

import requests
import json
import hmac
import hashlib
from datetime import datetime

# Configuración
EQUIPO_A_URL = "http://localhost:8000"
EQUIPO_B_URL = "https://heuristically-farraginous-marquitta.ngrok-free.dev"
EQUIPO_B_LOCAL = "http://localhost:8082"
SECRET_KEY = "integracion-turismo-2026-uleam"

def calcular_firma(payload_dict):
    """Calcula HMAC-SHA256"""
    payload_json = json.dumps(payload_dict, sort_keys=True, separators=(',', ':'))
    firma = hmac.new(
        SECRET_KEY.encode(),
        payload_json.encode(),
        hashlib.sha256
    ).hexdigest()
    return payload_json, firma


def test_1_status_equipo_a():
    """Test 1: Verificar status de Equipo A"""
    print("\n" + "="*60)
    print("TEST 1: Status de Equipo A")
    print("="*60)
    
    try:
        response = requests.get(f"{EQUIPO_A_URL}/api/integracion/status")
        print(f"Status: {response.status_code}")
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_2_conectar_equipo_b():
    """Test 2: Intentar conectar con Equipo B"""
    print("\n" + "="*60)
    print("TEST 2: Conectar con Equipo B")
    print("="*60)
    
    print(f"Intentando conectar a: {EQUIPO_B_URL}")
    
    try:
        # Intentar con ngrok URL
        response = requests.get(
            f"{EQUIPO_B_URL}/api/integracion/status",
            timeout=5,
            verify=False
        )
        print(f"✅ Equipo B respondió!")
        print(f"Status: {response.status_code}")
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
        return True
    except Exception as e:
        print(f"⚠️ No se pudo conectar con Equipo B: {e}")
        print(f"Nota: Asegúrate que Equipo B está corriendo en puerto 8082")
        return False


def test_3_enviar_reserva_a_equipo_b():
    """Test 3: Enviar reserva a Equipo B"""
    print("\n" + "="*60)
    print("TEST 3: Enviar Reserva a Equipo B")
    print("="*60)
    
    payload = {
        "user_id": "usuario_test_001",
        "tour_id": "tour_001",
        "tour_nombre": "Tour de Galápagos",
        "tour_precio": 1500.00,
        "tour_destino": "Islas Galápagos",
        "tour_descripcion": "Aventura en las islas",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    payload_json, firma = calcular_firma(payload)
    payload["firma"] = firma
    
    print(f"Enviando a: {EQUIPO_B_URL}/api/recomendaciones")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print(f"Firma: {firma[:30]}...")
    
    try:
        response = requests.post(
            f"{EQUIPO_B_URL}/api/recomendaciones",
            json=payload,
            timeout=5,
            verify=False
        )
        print(f"✅ Respuesta de Equipo B: {response.status_code}")
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
        return response.status_code in [200, 201, 400]
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_4_endpoint_recepcion():
    """Test 4: Verificar endpoint de recepción en Equipo A"""
    print("\n" + "="*60)
    print("TEST 4: Endpoint de Recepción (Equipo A)")
    print("="*60)
    
    payload = {
        "user_id": "usuario_equipo_b_001",
        "tour_id": "tour_b_001",
        "tour_nombre": "Tour de Quito",
        "tour_precio": 800.00,
        "tour_destino": "Quito",
        "tour_descripcion": "Centro histórico",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    payload_json, firma = calcular_firma(payload)
    payload["firma"] = firma
    
    print(f"Enviando a: {EQUIPO_A_URL}/api/recomendaciones")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{EQUIPO_A_URL}/api/recomendaciones",
            json=payload
        )
        print(f"✅ Respuesta de Equipo A: {response.status_code}")
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_5_firma_invalida():
    """Test 5: Verificar rechazo de firma inválida"""
    print("\n" + "="*60)
    print("TEST 5: Firma Inválida (Debe rechazarse)")
    print("="*60)
    
    payload = {
        "user_id": "usuario_001",
        "tour_id": "tour_001",
        "tour_nombre": "Tour Fake",
        "tour_precio": 100.00,
        "tour_destino": "Fake",
        "tour_descripcion": "Fake tour",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "firma": "firma_falsa_123abc"
    }
    
    print(f"Enviando con firma inválida...")
    
    try:
        response = requests.post(
            f"{EQUIPO_A_URL}/api/recomendaciones",
            json=payload
        )
        if response.status_code == 401:
            print(f"✅ Correctamente rechazado: {response.status_code}")
            return True
        else:
            print(f"❌ Debería haber sido rechazado")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    print("\n" + "="*60)
    print("TESTS DE INTEGRACION: EQUIPO A <-> EQUIPO B")
    print("="*60)
    print(f"Equipo A: {EQUIPO_A_URL}")
    print(f"Equipo B: {EQUIPO_B_URL}")
    print(f"Secret Key: {SECRET_KEY[:20]}...")
    
    # Ejecutar tests
    results = {
        "Status Equipo A": test_1_status_equipo_a(),
        "Conectar Equipo B": test_2_conectar_equipo_b(),
        "Enviar Reserva": test_3_enviar_reserva_a_equipo_b(),
        "Recepción": test_4_endpoint_recepcion(),
        "Firma Inválida": test_5_firma_invalida()
    }
    
    # Resumen
    print("\n" + "="*60)
    print("RESUMEN DE TESTS")
    print("="*60)
    
    for test_name, result in results.items():
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        print(f"{test_name:.<40} {status}")
    
    passed = sum(1 for r in results.values() if r)
    total = len(results)
    print(f"\nTotal: {passed}/{total} tests pasaron")
    
    if passed == total:
        print("\n🎉 ¡INTEGRACIÓN COMPLETAMENTE FUNCIONAL!")
    else:
        print("\n⚠️ Algunos tests fallaron. Verifica la configuración.")


if __name__ == "__main__":
    main()
