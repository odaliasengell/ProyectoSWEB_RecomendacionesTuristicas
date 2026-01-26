"""
🧪 TEST LOCAL - EQUIPO A
Prueba de endpoints locales (SIN ngrok)

Este script verifica que los endpoints estén correctamente configurados
y listos para recibir y enviar datos de integración.

IMPORTANTE: Ejecutar después de que el servidor esté corriendo en puerto 8000
"""

import requests
import json
import hmac
import hashlib
from datetime import datetime

BASE_URL = "http://localhost:8000"
CLAVE_SECRETA = "integracion-turismo-2026-uleam"

# Colores para terminal
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"


def print_titulo(texto):
    print(f"\n{BLUE}{'=' * 70}{RESET}")
    print(f"{BLUE}{texto.center(70)}{RESET}")
    print(f"{BLUE}{'=' * 70}{RESET}\n")


def print_exito(texto):
    print(f"{GREEN}✅ {texto}{RESET}")


def print_error(texto):
    print(f"{RED}❌ {texto}{RESET}")


def print_info(texto):
    print(f"{YELLOW}ℹ️  {texto}{RESET}")


def generar_firma(payload_dict):
    """Genera firma HMAC-SHA256"""
    mensaje = json.dumps(payload_dict, sort_keys=True)
    return hmac.new(
        CLAVE_SECRETA.encode(),
        mensaje.encode(),
        hashlib.sha256
    ).hexdigest()


def test_1_status():
    """Test 1: Verificar status de integración"""
    print_titulo("TEST 1: Verificar Status de Integración")
    
    try:
        response = requests.get(f"{BASE_URL}/api/integracion/status")
        
        if response.status_code == 200:
            data = response.json()
            print_exito(f"Servidor activo: {data['equipo']}")
            print(f"Endpoints disponibles:")
            for key, value in data['endpoints'].items():
                print(f"  - {key}: {value}")
            print_exito("TEST 1: PASÓ ✓")
            return True
        else:
            print_error(f"Servidor respondió con status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"No se pudo conectar: {str(e)}")
        print_info("Asegúrate de que el servidor está corriendo en puerto 8000")
        return False


def test_2_recibir_reserva_firma_invalida():
    """Test 2: Intentar recibir reserva con firma inválida"""
    print_titulo("TEST 2: Recibir Reserva con Firma INVÁLIDA (debe fallar)")
    
    payload = {
        "user_id": "test_user_123",
        "recomendacion": {
            "id": "rec_test_001",
            "tour_recomendado": "Test Tour",
            "descripcion": "Test Description",
            "precio": 100.00,
            "destino": "Test Destination"
        },
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "firma": "firma_falsa_12345"  # Firma incorrecta
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/reservas",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 401:
            print_exito("Servidor rechazó firma inválida (401)")
            print_exito("TEST 2: PASÓ ✓ (rechazo correcto)")
            return True
        else:
            print_error(f"Servidor respondió con {response.status_code}, esperaba 401")
            print(f"Response: {response.json()}")
            return False
            
    except Exception as e:
        print_error(f"Error en request: {str(e)}")
        return False


def test_3_recibir_reserva_firma_valida():
    """Test 3: Recibir reserva con firma VÁLIDA"""
    print_titulo("TEST 3: Recibir Reserva con Firma VÁLIDA")
    
    payload = {
        "user_id": "usuario_456",
        "recomendacion": {
            "id": "rec_789",
            "tour_recomendado": "Volcán Cotopaxi",
            "descripcion": "Similar a tu tour anterior",
            "precio": 120.00,
            "destino": "Latacunga"
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    # Generar firma válida
    firma = generar_firma(payload)
    payload["firma"] = firma
    
    print(f"📦 Payload: {json.dumps(payload, indent=2)}")
    print(f"🔐 Firma: {firma}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/reservas",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\n📥 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_exito("Servidor aceptó firma válida (200)")
            print(f"Response: {json.dumps(data, indent=2)}")
            print_exito("TEST 3: PASÓ ✓")
            return True
        else:
            print_error(f"Servidor respondió con {response.status_code}")
            print(f"Response: {response.json()}")
            return False
            
    except Exception as e:
        print_error(f"Error en request: {str(e)}")
        return False


def test_4_enviar_reserva_sin_ngrok():
    """Test 4: Intentar enviar reserva (sin ngrok, debe fallar con error de conexión)"""
    print_titulo("TEST 4: Enviar Reserva (sin URL de Equipo B - esperado fallar)")
    
    params = {
        "user_id": "usuario_123",
        "tour_id": "tour_456",
        "tour_nombre": "Tour a Baños",
        "tour_precio": 150.00,
        "tour_destino": "Baños de Agua Santa",
        "tour_descripcion": "Aventura en cascadas"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/enviar-reserva-confirmada",
            params=params,
            timeout=5
        )
        
        print(f"📥 Status Code: {response.status_code}")
        data = response.json()
        
        if response.status_code in [400, 500]:
            print_info("Servidor respondió con error (esperado - sin ngrok configurado)")
            print(f"Detalle: {data.get('detail', data.get('error_type'))}")
            print_info("Para hacer pruebas bidireccionales necesitas:")
            print("  1. Instalar ngrok")
            print("  2. Ejecutar ngrok http 8000")
            print("  3. Obtener URL de Equipo B")
            print("  4. Pasar url_equipo_b como parámetro")
            print_exito("TEST 4: PASÓ ✓ (comportamiento esperado)")
            return True
        else:
            print_error(f"Comportamiento inesperado: {response.status_code}")
            return False
            
    except Exception as e:
        print_info(f"Error esperado (sin ngrok): {str(e)}")
        print_exito("TEST 4: PASÓ ✓ (error esperado sin configuración ngrok)")
        return True


def test_5_webhooks_test():
    """Test 5: Verificar endpoint /webhooks/test"""
    print_titulo("TEST 5: Endpoint /webhooks/test")
    
    try:
        response = requests.get(f"{BASE_URL}/webhooks/test")
        
        if response.status_code == 200:
            data = response.json()
            print_exito(f"Servicio activo: {data['service']}")
            print(f"Eventos soportados: {', '.join(data['supported_events'])}")
            print_exito("TEST 5: PASÓ ✓")
            return True
        else:
            print_error(f"Status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False


def main():
    print(f"\n{BLUE}{'#' * 70}{RESET}")
    print(f"{BLUE}{'#' * 70}{RESET}")
    print(f"{BLUE}# 🧪 TESTING LOCAL - EQUIPO A - INTEGRACIÓN BIDIRECCIONAL{RESET}")
    print(f"{BLUE}#{'Recomendaciones Turísticas ULEAM'.center(68)}{RESET}")
    print(f"{BLUE}{'#' * 70}{RESET}")
    print(f"{BLUE}{'#' * 70}{RESET}\n")
    
    print(f"{YELLOW}Base URL: {BASE_URL}{RESET}")
    print(f"{YELLOW}Clave Secreta: {CLAVE_SECRETA}{RESET}\n")
    
    resultados = []
    
    # Ejecutar tests
    resultados.append(("Status", test_1_status()))
    resultados.append(("Firma Inválida", test_2_recibir_reserva_firma_invalida()))
    resultados.append(("Firma Válida", test_3_recibir_reserva_firma_valida()))
    resultados.append(("Enviar Reserva", test_4_enviar_reserva_sin_ngrok()))
    resultados.append(("Webhooks Test", test_5_webhooks_test()))
    
    # Resumen
    print_titulo("RESUMEN DE RESULTADOS")
    
    passed = sum(1 for _, result in resultados if result)
    total = len(resultados)
    
    for test_name, result in resultados:
        status = f"{GREEN}✓ PASÓ{RESET}" if result else f"{RED}✗ FALLÓ{RESET}"
        print(f"  {test_name}: {status}")
    
    print(f"\n{BLUE}Resultados: {GREEN}{passed}/{total}{RESET} tests pasados\n")
    
    if passed == total:
        print_exito("TODOS LOS TESTS LOCALES PASARON ✓")
        print(f"\n{YELLOW}Próximos pasos:{RESET}")
        print("  1. Instalar ngrok: https://ngrok.com/download")
        print("  2. Crear cuenta en ngrok")
        print("  3. Ejecutar: ngrok config add-authtoken TU_TOKEN")
        print("  4. Ejecutar: ngrok http 8000")
        print("  5. Copiar URL de ngrok")
        print("  6. Compartir URL con Equipo B")
        print("  7. Recibir URL de Equipo B")
        print("  8. Ejecutar test_webhook_bidireccional.py")
    else:
        print_error("ALGUNOS TESTS FALLARON")
        print("Verifica los errores anteriores")


if __name__ == "__main__":
    main()
