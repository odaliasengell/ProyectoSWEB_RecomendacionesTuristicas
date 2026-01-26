"""
🔄 TEST BIDIRECCIONAL - EQUIPO A ↔ EQUIPO B
Prueba de integración completa entre equipos

IMPORTANTE: Solo ejecutar después de:
1. Instalar y activar ngrok
2. Obtener la URL de ngrok del Equipo B
3. Actualizar URL_EQUIPO_B en este script
"""

import requests
import json
import hmac
import hashlib
from datetime import datetime

# ============= CONFIGURACIÓN =============
BASE_URL_LOCAL = "http://localhost:8000"
CLAVE_SECRETA = "integracion-turismo-2026-uleam"

# ⚠️ IMPORTANTE: Reemplazar con la verdadera URL de ngrok de Equipo B
URL_EQUIPO_B = "https://REEMPLAZAR_CON_URL_NGROK_B.ngrok.io"

# Colores
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


def print_paso(numero, texto):
    print(f"{BLUE}Paso {numero}:{RESET} {texto}")


def generar_firma(payload_dict):
    """Genera firma HMAC-SHA256"""
    mensaje = json.dumps(payload_dict, sort_keys=True)
    return hmac.new(
        CLAVE_SECRETA.encode(),
        mensaje.encode(),
        hashlib.sha256
    ).hexdigest()


def test_preparacion():
    """Verifica que todo esté configurado"""
    print_titulo("VERIFICACIÓN PREVIA")
    
    print_paso(1, "Verificando URL de Equipo B")
    if URL_EQUIPO_B == "https://REEMPLAZAR_CON_URL_NGROK_B.ngrok.io":
        print_error("URL de Equipo B no está configurada")
        print_info("Actualiza URL_EQUIPO_B en este script")
        return False
    print_exito(f"URL de Equipo B: {URL_EQUIPO_B}")
    
    print_paso(2, "Verificando servidor local")
    try:
        response = requests.get(f"{BASE_URL_LOCAL}/api/integracion/status", timeout=5)
        if response.status_code == 200:
            print_exito("Servidor local activo en puerto 8000")
        else:
            print_error("Servidor local no responde correctamente")
            return False
    except Exception as e:
        print_error(f"No se puede conectar a servidor local: {str(e)}")
        print_info("Asegúrate de ejecutar: python main.py")
        return False
    
    print_paso(3, "Clave secreta")
    print_exito(f"Configurada: {CLAVE_SECRETA}")
    
    return True


def test_enviar_a_equipo_b():
    """Simula que Equipo A envía una reserva confirmada a Equipo B"""
    print_titulo("TEST: ENVIAR RESERVA CONFIRMADA A EQUIPO B")
    
    print_paso(1, "Preparando payload")
    
    payload = {
        "user_id": "usuario_test_equipo_a_123",
        "tour_confirmado": {
            "id": "tour_test_456",
            "nombre": "Tour Test - Baños",
            "precio": 150.00,
            "destino": "Baños de Agua Santa",
            "descripcion": "Tour de prueba bidireccional"
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    print_paso(2, "Generando firma HMAC-SHA256")
    firma = generar_firma(payload)
    payload["firma"] = firma
    print(f"Firma: {firma}")
    print_exito("Firma generada")
    
    print_paso(3, f"Enviando POST a {URL_EQUIPO_B}/api/recomendaciones")
    
    try:
        response = requests.post(
            f"{URL_EQUIPO_B}/api/recomendaciones",
            json=payload,
            timeout=10,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\n📥 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_exito("Equipo B aceptó la reserva")
            print(f"\nRespuesta de Equipo B:")
            print(json.dumps(data, indent=2))
            return True
        elif response.status_code == 401:
            print_error("Equipo B rechazó la solicitud (401 - Firma inválida)")
            print(f"Response: {response.json()}")
            print_info("Verifica que:")
            print("  - La URL de Equipo B sea correcta")
            print("  - La clave secreta sea igual en ambos lados")
            return False
        else:
            print_error(f"Equipo B respondió con status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print_error("Timeout: Equipo B no responde en 10 segundos")
        print_info("Verifica que:")
        print("  - La URL de ngrok sea correcta")
        print("  - ngrok esté activo en Equipo B")
        return False
    except requests.exceptions.ConnectionError as e:
        print_error(f"Error de conexión: {str(e)}")
        print_info("Verifica que:")
        print("  - La URL de ngrok sea correcta")
        print("  - ngrok esté corriendo: ngrok http PUERTO")
        return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False


def test_enviar_via_endpoint_local():
    """Usa el endpoint local de Equipo A para enviar"""
    print_titulo("TEST: USAR ENDPOINT LOCAL PARA ENVIAR")
    
    print_paso(1, "Llamando POST /api/enviar-reserva-confirmada")
    
    params = {
        "user_id": "usuario_test_456",
        "tour_id": "tour_test_789",
        "tour_nombre": "Tour Test - Cotopaxi",
        "tour_precio": 120.00,
        "tour_destino": "Latacunga",
        "tour_descripcion": "Tour volcánico de prueba"
    }
    
    print(f"Parámetros: {json.dumps(params, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL_LOCAL}/api/enviar-reserva-confirmada",
            params=params,
            timeout=15
        )
        
        print(f"\n📥 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_exito("Endpoint local envió exitosamente")
            print(f"\nRespuesta:")
            print(json.dumps(data, indent=2))
            return True
        else:
            print_error(f"Endpoint respondió con {response.status_code}")
            data = response.json()
            print(json.dumps(data, indent=2))
            return False
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False


def instrucciones_finales():
    """Muestra instrucciones para completar la integración"""
    print_titulo("INSTRUCCIONES PARA COMPLETAR INTEGRACIÓN")
    
    print(f"{YELLOW}Pasos completados:{RESET}")
    print("  ✅ Endpoints implementados en Equipo A")
    print("  ✅ Seguridad con HMAC-SHA256 configurada")
    print("  ✅ Tests locales listos")
    
    print(f"\n{YELLOW}Pasos faltantes:{RESET}")
    print("  1. ⏳ Instalar y activar ngrok en Equipo A")
    print("     → ngrok http 8000")
    print("  2. ⏳ Copiar URL de ngrok (ej: https://abc123xyz.ngrok.io)")
    print("  3. ⏳ SOLICITAR URL de ngrok de Equipo B")
    print("  4. ⏳ Actualizar URL_EQUIPO_B en este script")
    print("  5. ⏳ Ejecutar este script nuevamente para pruebas bidireccionales")
    
    print(f"\n{YELLOW}Para solicitar a Equipo B, compartir:{RESET}")
    print(f"""
    {BLUE}┌─ EQUIPO A (Tú) ────────────────────────────┐{RESET}
    {BLUE}│ URL ngrok:         https://TU_URL.ngrok.io │{RESET}
    {BLUE}│ Puerto local:      8000                    │{RESET}
    {BLUE}│ Endpoint expone:   /api/reservas          │{RESET}
    {BLUE}│ Endpoint consume:  /api/recomendaciones   │{RESET}
    {BLUE}│ Lenguaje backend:  Python/FastAPI         │{RESET}
    {BLUE}│ Base de datos:     MongoDB                │{RESET}
    {BLUE}│ Seguridad:         HMAC-SHA256            │{RESET}
    {BLUE}│ Clave compartida:  integracion-turismo... │{RESET}
    {BLUE}└─────────────────────────────────────────────┘{RESET}
    
    {BLUE}Solicita que Equipo B comparta:{RESET}
    {BLUE}┌─ EQUIPO B (Otro equipo) ───────────────────┐{RESET}
    {BLUE}│ URL ngrok:         https://?????.ngrok.io │{RESET}
    {BLUE}│ Puerto local:      ????                   │{RESET}
    {BLUE}│ Endpoint expone:   /api/recomendaciones   │{RESET}
    {BLUE}│ Endpoint consume:  /api/reservas          │{RESET}
    {BLUE}│ Lenguaje backend:  [Python/Node/Java]     │{RESET}
    {BLUE}│ Base de datos:     [Sí/No]                │{RESET}
    {BLUE}└─────────────────────────────────────────────┘{RESET}
    """)


def main():
    print(f"\n{BLUE}{'#' * 70}{RESET}")
    print(f"{BLUE}{'#' * 70}{RESET}")
    print(f"{BLUE}# 🔄 TEST BIDIRECCIONAL - EQUIPO A ↔ EQUIPO B{RESET}")
    print(f"{BLUE}#{'Integración de Recomendaciones Turísticas'.center(68)}{RESET}")
    print(f"{BLUE}{'#' * 70}{RESET}")
    print(f"{BLUE}{'#' * 70}{RESET}\n")
    
    # Verificación previa
    if not test_preparacion():
        print_error("Verificación previa falló. Abortar.")
        return
    
    print("\n" + "=" * 70)
    
    # Test 1: Envío directo
    resultado_1 = test_enviar_a_equipo_b()
    
    print("\n" + "=" * 70)
    
    # Test 2: Via endpoint local
    resultado_2 = test_enviar_via_endpoint_local()
    
    print("\n" + "=" * 70)
    
    # Resumen
    print_titulo("RESUMEN")
    
    if resultado_1:
        print_exito("Prueba 1: Envío directo a Equipo B")
    else:
        print_error("Prueba 1: Envío directo a Equipo B")
    
    if resultado_2:
        print_exito("Prueba 2: Via endpoint local")
    else:
        print_error("Prueba 2: Via endpoint local")
    
    # Instrucciones finales
    instrucciones_finales()


if __name__ == "__main__":
    main()
