#!/usr/bin/env python3
"""
Test JWT Simple - Validar que Payment Service acepta JWT del Auth Service
"""
import sys
import os
import jwt
import json

print("=" * 70)
print("TEST JWT SIMPLE - VALIDAR SINCRONIZACION SIN HACER LLAMADAS HTTP")
print("=" * 70)

try:
    # 1. Obtener las claves secretas de ambos servicios
    print("\n[1] Leyendo configuración...")
    
    # Leer JWT_SECRET_KEY del payment-service/local_jwt_validator.py
    with open('backend/payment-service/local_jwt_validator.py', 'r', encoding='utf-8') as f:
        payment_content = f.read()
        # Buscar JWT_SECRET_KEY
        for line in payment_content.split('\n'):
            if 'JWT_SECRET_KEY = ' in line and not line.strip().startswith('#'):
                payment_key = line.split('=')[1].strip().strip('"').strip("'")
                print(f"   ✓ Payment Service JWT_SECRET_KEY: {payment_key[:50]}...")
                break
    
    # Leer JWT_SECRET_KEY del auth-service/local_jwt_validator.py
    with open('backend/auth-service/local_jwt_validator.py', 'r', encoding='utf-8') as f:
        auth_content = f.read()
        # Buscar JWT_SECRET_KEY
        for line in auth_content.split('\n'):
            if 'JWT_SECRET_KEY = ' in line and not line.strip().startswith('#'):
                auth_key = line.split('=')[1].strip().strip('"').strip("'")
                print(f"   ✓ Auth Service JWT_SECRET_KEY: {auth_key[:50]}...")
                break
    
    # 2. Comparar claves
    print("\n[2] Comparando claves...")
    if payment_key == auth_key:
        print(f"   ✓ KEYS SINCRONIZADAS CORRECTAMENTE")
        print(f"   Clave: {payment_key}")
    else:
        print(f"   ✗ KEYS NO SINCRONIZADAS!")
        print(f"   Payment: {payment_key}")
        print(f"   Auth:    {auth_key}")
        sys.exit(1)
    
    # 3. Crear un JWT de prueba con la clave de Auth
    print("\n[3] Creando JWT de prueba...")
    test_payload = {
        "user_id": "test_user_123",
        "email": "test@example.com",
        "exp": 9999999999
    }
    
    # Usar la misma lógica que usa auth-service
    token = jwt.encode(test_payload, auth_key, algorithm="HS256")
    print(f"   ✓ Token creado: {token[:60]}...")
    
    # 4. Validar el token con la clave de Payment Service
    print("\n[4] Validando token con clave Payment Service...")
    try:
        decoded = jwt.decode(token, payment_key, algorithms=["HS256"])
        print(f"   ✓ TOKEN VALIDADO EXITOSAMENTE")
        print(f"   Payload: {decoded}")
    except jwt.InvalidSignatureError:
        print(f"   ✗ SIGNATURE VERIFICATION FAILED")
        print(f"   El token no puede ser validado - claves no sincronizadas")
        sys.exit(1)
    except Exception as e:
        print(f"   ✗ Error: {e}")
        sys.exit(1)
    
    print("\n" + "=" * 70)
    print("RESULTADO: ✓ JWT ESTA SINCRONIZADO CORRECTAMENTE")
    print("=" * 70)
    print("\nLOS SERVICIOS ESTAN LISTOS PARA:")
    print("  • Generar JWT en Auth Service")
    print("  • Validar JWT en Payment Service")
    print("  • Completar flujo de pago sin errores 401")
    print("\n" + "=" * 70)
    
except Exception as e:
    print(f"\n✗ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
