#!/usr/bin/env python3
"""
Test de flujo completo JWT - Validar sincronización de claves secretas
"""
import httpx
import json
import time

BASE_URL_AUTH = "http://localhost:8001"
BASE_URL_REST = "http://localhost:8000"
BASE_URL_PAYMENT = "http://localhost:8002"

def test_jwt_flow():
    """Prueba el flujo completo de JWT"""
    print("=" * 60)
    print("PRUEBA DE FLUJO JWT - INTEGRACION COMPLETA")
    print("=" * 60)
    
    # 1. Verificar salud de servicios
    print("\n1. Verificando salud de servicios...")
    try:
        auth_health = httpx.get(f"{BASE_URL_AUTH}/health").json()
        print(f"   ✓ Auth Service: {auth_health}")
    except Exception as e:
        print(f"   ✗ Auth Service ERROR: {e}")
        return False
    
    try:
        rest_health = httpx.get(f"{BASE_URL_REST}/health").json()
        print(f"   ✓ REST API: {rest_health}")
    except Exception as e:
        print(f"   ✗ REST API ERROR: {e}")
        return False
    
    try:
        payment_health = httpx.get(f"{BASE_URL_PAYMENT}/health").json()
        print(f"   ✓ Payment Service: {payment_health}")
    except Exception as e:
        print(f"   ✗ Payment Service ERROR: {e}")
        return False
    
    # 2. Registrar usuario
    print("\n2. Registrando usuario de prueba...")
    register_data = {
        "email": f"test_{int(time.time())}@example.com",
        "password": "Test123!@#",
        "full_name": "Test User"
    }
    
    try:
        response = httpx.post(
            f"{BASE_URL_AUTH}/auth/register",
            json=register_data
        )
        
        if response.status_code == 201:
            user_data = response.json()
            print(f"   ✓ Usuario registrado: {user_data.get('email')}")
            user_id = user_data.get('_id')
        else:
            print(f"   ✗ Error en registro: {response.status_code}")
            print(f"      {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ Error en registro: {e}")
        return False
    
    # 3. Login para obtener JWT token
    print("\n3. Realizando login para obtener JWT token...")
    login_data = {
        "email": register_data["email"],
        "password": register_data["password"]
    }
    
    try:
        response = httpx.post(
            f"{BASE_URL_AUTH}/auth/login",
            json=login_data
        )
        
        if response.status_code == 200:
            auth_response = response.json()
            access_token = auth_response.get('access_token')
            print(f"   ✓ JWT Token obtenido (primeros 50 chars): {access_token[:50]}...")
        else:
            print(f"   ✗ Error en login: {response.status_code}")
            print(f"      {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ Error en login: {e}")
        return False
    
    # 4. Usar token para acceder al REST API
    print("\n4. Accediendo a REST API con JWT token...")
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = httpx.get(
            f"{BASE_URL_REST}/recommendations",
            headers=headers
        )
        
        if response.status_code == 200:
            print(f"   ✓ Acceso a REST API exitoso")
            print(f"      Respuesta: {response.json()}")
        else:
            print(f"   ✗ Error accediendo REST API: {response.status_code}")
            print(f"      {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ Error en REST API: {e}")
        return False
    
    # 5. Usar token para acceder al Payment Service
    print("\n5. Accediendo a Payment Service con JWT token...")
    
    payment_data = {
        "user_id": user_id,
        "amount": 100.00,
        "currency": "USD",
        "payment_method": "card",
        "card": {
            "number": "4111111111111111",
            "exp_month": 12,
            "exp_year": 2025,
            "cvc": "123"
        }
    }
    
    try:
        response = httpx.post(
            f"{BASE_URL_PAYMENT}/payments/",
            json=payment_data,
            headers=headers
        )
        
        if response.status_code in [200, 201]:
            print(f"   ✓ Acceso a Payment Service exitoso")
            print(f"      Status: {response.status_code}")
            print(f"      Respuesta: {response.json()}")
        elif response.status_code == 401:
            print(f"   ✗ ERROR 401 - JWT Signature verification failed")
            print(f"      Esto indica que las claves secretas NO están sincronizadas")
            print(f"      Respuesta: {response.text}")
            return False
        else:
            print(f"   ⚠ Payment Service respondió con: {response.status_code}")
            print(f"      Respuesta: {response.text}")
    except Exception as e:
        print(f"   ✗ Error en Payment Service: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("✓ TODAS LAS PRUEBAS EXITOSAS - JWT SINCRONIZADO CORRECTAMENTE")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = test_jwt_flow()
    exit(0 if success else 1)
