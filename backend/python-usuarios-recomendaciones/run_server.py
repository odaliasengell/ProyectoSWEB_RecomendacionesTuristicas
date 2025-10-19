#!/usr/bin/env python3
"""
Script para iniciar el servidor FastAPI y verificar que funciona
"""
import sys
import os

# Asegurarse de que estamos en el directorio correcto
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath('.'))

try:
    print("[*] Importando app...")
    from app.main import app
    print("[OK] App importada correctamente")
    
    print("[*] Iniciando servidor...")
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
