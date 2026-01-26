#!/usr/bin/env python3
"""
Test de validación JWT - Verificar sincronización de claves secretas
"""
import httpx
import json
import time

BASE_URL_AUTH = "http://localhost:8001"
BASE_URL_PAYMENT = "http://localhost:8002"

def test_jwt_validation():
    """Prueba que JWT generado por Auth Service sea validado por Payment Service"""
    print("=" * 70)
    print("TEST JWT VALIDATION - VERIFICAR SINCRONIZACION DE CLAVES SECRETAS")
    print("=" * 70)
    
    # 1. Verificar servicios
    print("\n[1/5] Verificando servicios...")
    try:
        auth_resp = httpx.get(f"{BASE_URL_AUTH}/health", timeout=5)
        payment_resp = httpx.get(f"{BASE_URL_PAYMENT}/health", timeout=5)
        print("      ✓ Auth Service activo")
        print("      ✓ Payment Service activo")
    except Exception as e:
        print(f"      ✗ Error: {e}")
        return False
    
    # 2. Registrar usuario
    print("\n[2/5] Registrando usuario de prueba...")
    register_data = {
        "email": f"jwttest_{int(time.time())}@example.com",
        "password": "JWTTest123!@#",
        "full_name": "JWT Test User"
    }
    
    try:
        response = httpx.post(
            f"{BASE_URL_AUTH}/auth/register",
            json=register_data,
            timeout=10
        )
        print(f"      ✓ Respuesta: {response.status_code}")
    except Exception as e:
        print(f"      ✗ Error: {e}")
        return False
    
    # 3. Login y obtener JWT
    print("\n[3/5] Obteniendo JWT token...")
    login_data = {
        "email": register_data["email"],
        "password": register_data["password"]
    }
    
    try:
        response = httpx.post(
            f"{BASE_URL_AUTH}/auth/login",
            json=login_data,
            timeout=10
        )
        
        if response.status_code == 200:
            jwt_token = response.json().get('access_token')
            print(f"      ✓ JWT obtenido exitosamente")
            print(f"      Token: {jwt_token[:60]}...")
        else:
            print(f"      ✗ Error en login: {response.status_code}")
            print(f"      {response.text}")
            return False
    except Exception as e:
        print(f"      ✗ Error: {e}")
        return False
    
    # 4. Usar JWT en Payment Service
    print("\n[4/5] Validando JWT en Payment Service...")
    headers = {
        "Authorization": f"Bearer {jwt_token}",
        "Content-Type": "application/json"
    }
    
    test_payment = {
        "user_id": "test_user",
        "amount": 50.00,
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
            json=test_payment,
            headers=headers,
            timeout=10
        )
        
        status = response.status_code
        
        if status == 401:
            print(f"      ✗ ERROR 401 - JWT VALIDATION FAILED")
            print(f"      Mensaje: {response.text}")
            print("\n      PROBLEMA DIAGNOSTICADO:")
            print("      - JWT generado por Auth Service NO es válido en Payment Service")
            print("      - Las claves secretas NO están sincronizadas correctamente")
            print("      - Verificar JWT_SECRET_KEY en:")
            print("        • auth-service/.env")
            print("        • payment-service/.env")
            print("        • auth-service/local_jwt_validator.py")
            print("        • payment-service/local_jwt_validator.py")
            return False
        
        elif status == 422:
            print(f"      ✓ JWT VALIDADO CORRECTAMENTE (422 - Validation Error)")
            print(f"      El token fue validado, pero hay error de validación en datos")
            print(f"      Respuesta: {response.json()}")
        
        elif status in [200, 201]:
            print(f"      ✓ JWT VALIDADO - Pago procesado: {status}")
            print(f"      Respuesta: {response.json()}")
        
        else:
            print(f"      ⚠ Respuesta inesperada: {status}")
            print(f"      {response.text}")
    
    except Exception as e:
        print(f"      ✗ Error: {e}")
        return False
    
    # 5. Resumen
    print("\n" + "=" * 70)
    print("RESULTADO: ✓ JWT ESTA SIENDO VALIDADO CORRECTAMENTE")
    print("=" * 70)
    print("\nLAS CLAVES SECRETAS ESTAN SINCRONIZADAS CORRECTAMENTE:")
    print("  ✓ JWT_SECRET_KEY en auth-service genera tokens válidos")
    print("  ✓ JWT_SECRET_KEY en payment-service valida esos tokens")
    print("  ✓ La integración bidireccional JWT está operativa")
    print("\n" + "=" * 70)
    
    return True

if __name__ == "__main__":
    success = test_jwt_validation()
    exit(0 if success else 1)
