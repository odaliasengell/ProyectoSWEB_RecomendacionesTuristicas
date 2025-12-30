"""
Script de pruebas para Payment Service Integration.
Ejecuta: python test_payment_integration.py

NOTA: Asegúrate de que:
1. MongoDB está corriendo en localhost:27017
2. REST API está corriendo en localhost:8000
3. Payment Service de Odalia está corriendo en localhost:8200 (o usa MockAdapter)
"""

import asyncio
import httpx
import json
from typing import Dict, Any

# Configuración
BASE_URL = "http://localhost:8000"
PAYMENT_SERVICE_URL = "http://localhost:8200"
TEST_USER = {
    "username": "admin",
    "password": "admin123"
}

# Variables globales para almacenar datos de prueba
auth_token = None
test_user_id = None
test_reserva_id = None
test_payment_id = None


async def hacer_request(
    method: str,
    endpoint: str,
    data: Dict[str, Any] = None,
    token: str = None
) -> Dict[str, Any]:
    """Helper para hacer requests HTTP."""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    async with httpx.AsyncClient() as client:
        try:
            if method == "GET":
                response = await client.get(url, headers=headers)
            elif method == "POST":
                response = await client.post(url, json=data, headers=headers)
            elif method == "PUT":
                response = await client.put(url, json=data, headers=headers)
            else:
                raise ValueError(f"Método HTTP no soportado: {method}")
            
            print(f"\n📤 {method} {endpoint}")
            print(f"Status: {response.status_code}")
            
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"✅ Respuesta: {json.dumps(result, indent=2, ensure_ascii=False)}")
                return result
            else:
                print(f"❌ Error: {response.text}")
                return {"error": response.text}
        
        except Exception as e:
            print(f"❌ Excepción: {str(e)}")
            return {"error": str(e)}


async def test_autenticacion():
    """Paso 1: Autenticarse en la REST API."""
    global auth_token, test_user_id
    
    print("\n" + "="*60)
    print("PASO 1: AUTENTICACIÓN")
    print("="*60)
    
    resultado = await hacer_request(
        "POST",
        "/api/auth/login",
        data={
            "username": TEST_USER["username"],
            "password": TEST_USER["password"]
        }
    )
    
    if "access_token" in resultado:
        auth_token = resultado["access_token"]
        test_user_id = resultado.get("user_id")
        print(f"\n✅ Token obtenido: {auth_token[:20]}...")
        print(f"✅ User ID: {test_user_id}")
        return True
    else:
        print(f"\n❌ No se pudo autenticar")
        return False


async def test_crear_reserva():
    """Paso 2: Crear una reserva para probar el pago."""
    global test_reserva_id
    
    print("\n" + "="*60)
    print("PASO 2: CREAR RESERVA DE PRUEBA")
    print("="*60)
    
    # Primero, obtener un tour disponible
    tours = await hacer_request("GET", "/api/tours", token=auth_token)
    
    if isinstance(tours, list) and len(tours) > 0:
        tour_id = tours[0].get("id") or tours[0].get("_id")
        print(f"\n✅ Tour encontrado: {tour_id}")
    else:
        print("\n⚠️  No hay tours disponibles, usando tour_id mock")
        tour_id = "507f1f77bcf86cd799439999"
    
    # Crear reserva
    resultado = await hacer_request(
        "POST",
        "/api/reservas",
        data={
            "tour_id": tour_id,
            "fecha_reserva": "2024-01-20",
            "cantidad_personas": 2,
            "estado": "pendiente"
        },
        token=auth_token
    )
    
    if "id" in resultado or "_id" in resultado:
        test_reserva_id = resultado.get("id") or resultado.get("_id")
        print(f"\n✅ Reserva creada: {test_reserva_id}")
        return True
    else:
        print(f"\n⚠️  No se pudo crear reserva, usando ID mock")
        test_reserva_id = "507f1f77bcf86cd799439011"
        return False


async def test_procesar_pago_reserva():
    """Paso 3: Procesar pago de reserva."""
    global test_payment_id
    
    print("\n" + "="*60)
    print("PASO 3: PROCESAR PAGO DE RESERVA")
    print("="*60)
    
    resultado = await hacer_request(
        "POST",
        "/api/pagos/reserva",
        data={
            "reserva_id": test_reserva_id,
            "monto": 150.00,
            "descripcion": "Pago de prueba - Semana 2"
        },
        token=auth_token
    )
    
    if resultado.get("status") == "success":
        test_payment_id = resultado.get("payment_id")
        print(f"\n✅ Pago procesado exitosamente")
        print(f"✅ Payment ID: {test_payment_id}")
        return True
    else:
        print(f"\n❌ Error procesando pago: {resultado.get('message')}")
        return False


async def test_procesar_pago_tour():
    """Paso 4: Procesar pago de tour directamente."""
    
    print("\n" + "="*60)
    print("PASO 4: PROCESAR PAGO DE TOUR")
    print("="*60)
    
    resultado = await hacer_request(
        "POST",
        "/api/pagos/tour",
        data={
            "tour_id": "507f1f77bcf86cd799439999",
            "cantidad_personas": 3,
            "precio_por_persona": 85.00
        },
        token=auth_token
    )
    
    if resultado.get("status") == "success":
        print(f"\n✅ Pago de tour procesado")
        print(f"✅ Monto total: {3 * 85.00} USD")
        return True
    else:
        print(f"\n❌ Error: {resultado.get('message')}")
        return False


async def test_obtener_estado_pago():
    """Paso 5: Obtener estado del pago."""
    
    print("\n" + "="*60)
    print("PASO 5: OBTENER ESTADO DEL PAGO")
    print("="*60)
    
    if not test_payment_id:
        print("\n⚠️  No hay payment_id disponible (el pago anterior falló)")
        return False
    
    resultado = await hacer_request(
        "GET",
        f"/api/pagos/estado/{test_payment_id}",
        token=auth_token
    )
    
    if "status" in resultado:
        print(f"\n✅ Estado del pago obtenido")
        return True
    else:
        print(f"\n⚠️  No se pudo obtener estado")
        return False


async def test_reembolso():
    """Paso 6: Procesar reembolso."""
    
    print("\n" + "="*60)
    print("PASO 6: PROCESAR REEMBOLSO")
    print("="*60)
    
    if not test_payment_id:
        print("\n⚠️  No hay payment_id disponible para reembolsar")
        return False
    
    resultado = await hacer_request(
        "POST",
        "/api/pagos/reembolso",
        data={
            "payment_id": test_payment_id,
            "razon": "Prueba de reembolso - Semana 2"
        },
        token=auth_token
    )
    
    if resultado.get("status") == "success":
        print(f"\n✅ Reembolso procesado")
        return True
    else:
        print(f"\n⚠️  Error en reembolso: {resultado.get('message')}")
        return False


async def verificar_payment_service():
    """Verificar si Payment Service está disponible."""
    
    print("\n" + "="*60)
    print("VERIFICACIÓN PREVIA: Payment Service")
    print("="*60)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{PAYMENT_SERVICE_URL}/health", timeout=5)
            if response.status_code == 200:
                print(f"\n✅ Payment Service disponible en {PAYMENT_SERVICE_URL}")
                return True
        except:
            pass
    
    print(f"\n⚠️  Payment Service NO está disponible en {PAYMENT_SERVICE_URL}")
    print("ℹ️  Los pagos fallarán. Asegúrate de que Odalia ha iniciado el servicio.")
    return False


async def main():
    """Ejecutar todas las pruebas."""
    
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " PRUEBAS DE INTEGRACIÓN - PAYMENT SERVICE (SEMANA 2) ".center(58) + "║")
    print("╚" + "="*58 + "╝")
    
    # Verificar servicios previos
    payment_service_ok = await verificar_payment_service()
    
    # Ejecutar pruebas
    resultados = {
        "Autenticación": await test_autenticacion(),
        "Crear Reserva": await test_crear_reserva(),
        "Procesar Pago Reserva": await test_procesar_pago_reserva(),
        "Procesar Pago Tour": await test_procesar_pago_tour(),
        "Obtener Estado Pago": await test_obtener_estado_pago(),
        "Procesar Reembolso": await test_reembolso(),
    }
    
    # Resumen
    print("\n" + "="*60)
    print("RESUMEN DE PRUEBAS")
    print("="*60)
    
    for nombre, resultado in resultados.items():
        status = "✅ PASÓ" if resultado else "❌ FALLÓ"
        print(f"{nombre}: {status}")
    
    total_pasadas = sum(1 for r in resultados.values() if r)
    total = len(resultados)
    
    print(f"\nTotal: {total_pasadas}/{total} pruebas pasadas")
    
    if total_pasadas == total:
        print("\n🎉 ¡TODAS LAS PRUEBAS PASARON!")
    else:
        print(f"\n⚠️  {total - total_pasadas} prueba(s) fallaron")


if __name__ == "__main__":
    asyncio.run(main())
