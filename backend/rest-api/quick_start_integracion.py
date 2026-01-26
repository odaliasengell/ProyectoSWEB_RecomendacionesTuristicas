"""
🚀 Script de Inicio Rápido - Integración Bidireccional Equipo A
Prepara y verifica todo para la integración bidireccional

Uso:
    python quick_start_integracion.py
"""

import subprocess
import sys
import time
from pathlib import Path
from datetime import datetime

COLORS = {
    'GREEN': '\033[92m',
    'RED': '\033[91m',
    'YELLOW': '\033[93m',
    'BLUE': '\033[94m',
    'CYAN': '\033[96m',
    'BOLD': '\033[1m',
    'END': '\033[0m',
}

def print_header(text: str):
    print(f"\n{COLORS['BLUE']}{COLORS['BOLD']}\n{'='*80}")
    print(f"  {text}")
    print(f"{'='*80}{COLORS['END']}\n")

def print_step(num: int, text: str):
    print(f"{COLORS['CYAN']}{COLORS['BOLD']}▶ Paso {num}: {text}{COLORS['END']}")

def print_ok(text: str):
    print(f"{COLORS['GREEN']}✅ {text}{COLORS['END']}")

def print_error(text: str):
    print(f"{COLORS['RED']}❌ {text}{COLORS['END']}")

def print_warning(text: str):
    print(f"{COLORS['YELLOW']}⚠️  {text}{COLORS['END']}")

def print_info(text: str):
    print(f"{COLORS['BLUE']}ℹ️  {text}{COLORS['END']}")

def main():
    print_header("🚀 Integración Bidireccional - Inicio Rápido Equipo A", )
    print_info(f"Iniciado: {datetime.now().strftime('%d de enero de %Y %H:%M:%S')}")
    
    # Paso 1: Verificar configuración de secretos
    print_step(1, "Verificar configuración de claves secretas")
    print_info("Ejecutando verificación...")
    
    try:
        result = subprocess.run(
            [sys.executable, "verify_secrets_config.py"],
            cwd=Path(__file__).parent,
            timeout=30
        )
        if result.returncode == 0:
            print_ok("✓ Verificación de secretos completada")
        else:
            print_warning("Verificación encontró algunas advertencias")
    except subprocess.TimeoutExpired:
        print_error("Timeout en verificación de secretos")
        return False
    except Exception as e:
        print_error(f"Error durante verificación: {str(e)}")
        return False
    
    time.sleep(1)
    
    # Paso 2: Mostrar instrucciones de ngrok
    print_step(2, "Configurar ngrok (exposición pública)")
    print_info("Para permitir que Equipo B se conecte:")
    print_info("")
    print(f"  {COLORS['YELLOW']}1. Instalar ngrok:{COLORS['END']}")
    print(f"     scoop install ngrok")
    print(f"")
    print(f"  {COLORS['YELLOW']}2. Autenticar ngrok (obtener token en https://dashboard.ngrok.com):{COLORS['END']}")
    print(f"     ngrok config add-authtoken <TU_TOKEN>")
    print(f"")
    print(f"  {COLORS['YELLOW']}3. Iniciar API Rest:{COLORS['END']}")
    print(f"     cd backend/rest-api")
    print(f"     python -m uvicorn main:app --reload --port 8000")
    print(f"")
    print(f"  {COLORS['YELLOW']}4. Exponer en otra terminal:{COLORS['END']}")
    print(f"     ngrok http 8000")
    print(f"")
    print_info("Copiar la URL de ngrok (ej: https://abc123.ngrok.io)")
    
    time.sleep(2)
    
    # Paso 3: Ejecutar tests de integración
    print_step(3, "Ejecutar tests de integración bidireccional")
    print_info("¿Deseas ejecutar los tests ahora? (requiere API local corriendo)")
    print_info("Responde 's' para sí, 'n' para no")
    
    try:
        response = input(">> ").strip().lower()
        if response == 's':
            print_info("Ejecutando tests...")
            subprocess.run(
                [sys.executable, "test_integracion_bidireccional_completa.py"],
                cwd=Path(__file__).parent
            )
        else:
            print_info("Tests omitidos. Puedes ejecutarlos manualmente:")
            print_info("  python test_integracion_bidireccional_completa.py")
    except KeyboardInterrupt:
        print_warning("\nInterrupción del usuario")
    except Exception as e:
        print_error(f"Error ejecutando tests: {str(e)}")
    
    time.sleep(1)
    
    # Paso 4: Instrucciones finales
    print_header("📋 PRÓXIMOS PASOS")
    
    print(f"{COLORS['BOLD']}1. Iniciar servicios locales:{COLORS['END']}")
    print_info("Terminal 1 (Auth Service):")
    print_info("  cd backend/auth-service && python main.py")
    print_info("")
    print_info("Terminal 2 (REST API):")
    print_info("  cd backend/rest-api && python -m uvicorn main:app --reload")
    print_info("")
    print_info("Terminal 3 (Payment Service):")
    print_info("  cd backend/payment-service && python main.py")
    print_info("")
    print_info("Terminal 4 (ngrok):")
    print_info("  ngrok http 8000")
    
    print(f"\n{COLORS['BOLD']}2. Solicitar información a Equipo B:{COLORS['END']}")
    print_info("Enviar email a Equipo B con:")
    print_info("  - Tu URL de ngrok: https://abc123.ngrok.io")
    print_info("  - Tu secret de integración: integracion-turismo-2026-uleam")
    print_info("  - Archivo: backend/rest-api/SOLICITUD_INTEGRACION_EQUIPO_B.md")
    
    print(f"\n{COLORS['BOLD']}3. Configurar URL de Equipo B:{COLORS['END']}")
    print_info("Una vez recibida la URL de ngrok de Equipo B:")
    print_info("  - Actualizar NGROK_URL en test_integracion_bidireccional_completa.py")
    print_info("  - Re-ejecutar los tests")
    
    print(f"\n{COLORS['BOLD']}4. Validar datos:{COLORS['END']}")
    print_info("Verificar que los datos se sincronizan correctamente en:")
    print_info("  - MongoDB de Equipo A (turismo_db)")
    print_info("  - MongoDB de Equipo B")
    
    print(f"\n{COLORS['GREEN']}{COLORS['BOLD']}")
    print("✅ CONFIGURACIÓN COMPLETADA - LISTO PARA INTEGRACIÓN")
    print(f"{COLORS['END']}\n")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{COLORS['YELLOW']}Interrumpido por el usuario{COLORS['END']}")
        sys.exit(1)
