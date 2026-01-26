"""
🔐 Verificación de Configuración de Claves Secretas
Valida que todas las claves estén sincronizadas correctamente entre servicios

Uso:
    python verify_secrets_config.py
"""

import os
from pathlib import Path
import json
from typing import Dict, List, Tuple
import re

# Colores
COLORS = {
    'GREEN': '\033[92m',
    'RED': '\033[91m',
    'YELLOW': '\033[93m',
    'BLUE': '\033[94m',
    'BOLD': '\033[1m',
    'END': '\033[0m',
}

class SecretVerifier:
    """Verifica sincronización de secretos entre servicios"""
    
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.secrets = {}
        self.issues = []
        self.warnings = []
        
    def print_header(self, text: str):
        print(f"\n{COLORS['BLUE']}{COLORS['BOLD']}\n{'='*70}")
        print(f"  {text}")
        print(f"{'='*70}{COLORS['END']}\n")
    
    def print_ok(self, text: str):
        print(f"{COLORS['GREEN']}✅ {text}{COLORS['END']}")
    
    def print_error(self, text: str):
        print(f"{COLORS['RED']}❌ {text}{COLORS['END']}")
        
    def print_warning(self, text: str):
        print(f"{COLORS['YELLOW']}⚠️  {text}{COLORS['END']}")
    
    def read_env_file(self, file_path: Path) -> Dict[str, str]:
        """Lee archivo .env y retorna diccionario de variables"""
        env_dict = {}
        if not file_path.exists():
            self.print_warning(f"Archivo no encontrado: {file_path}")
            return env_dict
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        env_dict[key.strip()] = value.strip()
            return env_dict
        except Exception as e:
            self.print_error(f"Error leyendo {file_path}: {str(e)}")
            return env_dict
    
    def verify_jwt_secrets(self):
        """Verifica sincronización de JWT_SECRET_KEY"""
        self.print_header("🔑 Verificando JWT_SECRET_KEY")
        
        services = {
            'auth-service': 'backend/auth-service/.env',
            'payment-service': 'backend/payment-service/.env',
            'rest-api': 'backend/rest-api/.env',
        }
        
        jwt_secrets = {}
        for service, env_path in services.items():
            full_path = self.base_path / env_path
            env_dict = self.read_env_file(full_path)
            jwt_secret = env_dict.get('JWT_SECRET_KEY', 'NO ENCONTRADO')
            jwt_secrets[service] = jwt_secret
            print(f"\n{service}:")
            print(f"  Ruta: {env_path}")
            if jwt_secret == 'NO ENCONTRADO':
                self.print_error(f"JWT_SECRET_KEY no configurada")
                self.issues.append(f"{service}: JWT_SECRET_KEY faltante")
            else:
                print(f"  Valor: {jwt_secret[:20]}...{jwt_secret[-10:]}")
        
        # Verificar sincronización
        unique_values = set(v for v in jwt_secrets.values() if v != 'NO ENCONTRADO')
        if len(unique_values) == 1:
            self.print_ok("Todos los servicios tienen el mismo JWT_SECRET_KEY ✓")
        elif len(unique_values) > 1:
            self.print_error("❌ JWT_SECRET_KEY diferente entre servicios")
            self.issues.append("JWT_SECRET_KEY no sincronizadas entre servicios")
            for service, secret in jwt_secrets.items():
                print(f"  {service}: {secret[:30]}...")
        else:
            self.print_warning("No se encontraron valores válidos de JWT_SECRET_KEY")
    
    def verify_integration_secrets(self):
        """Verifica sincronización de INTEGRACION_SECRET_KEY"""
        self.print_header("🔗 Verificando INTEGRACION_SECRET_KEY")
        
        services = {
            'auth-service': 'backend/auth-service/.env',
            'payment-service': 'backend/payment-service/.env',
            'rest-api': 'backend/rest-api/.env',
        }
        
        integracion_secrets = {}
        for service, env_path in services.items():
            full_path = self.base_path / env_path
            env_dict = self.read_env_file(full_path)
            secret = env_dict.get('INTEGRACION_SECRET_KEY', 'NO CONFIGURADA')
            integracion_secrets[service] = secret
            
            print(f"\n{service}:")
            if secret == 'NO CONFIGURADA':
                self.print_warning(f"INTEGRACION_SECRET_KEY no configurada")
                self.warnings.append(f"{service}: INTEGRACION_SECRET_KEY faltante")
            else:
                print(f"  ✓ Configurada: {secret}")
        
        # Verificar sincronización
        unique_values = set(v for v in integracion_secrets.values() 
                          if v != 'NO CONFIGURADA')
        if len(unique_values) <= 1:
            self.print_ok("INTEGRACION_SECRET_KEY sincronizadas ✓")
        else:
            self.issues.append("INTEGRACION_SECRET_KEY diferentes entre servicios")
            self.print_error("Valores diferentes detectados")
    
    def verify_stripe_config(self):
        """Verifica configuración de Stripe en payment-service"""
        self.print_header("💳 Verificando Configuración Stripe")
        
        env_path = self.base_path / 'backend/payment-service/.env'
        env_dict = self.read_env_file(env_path)
        
        stripe_key = env_dict.get('STRIPE_API_KEY', '')
        stripe_webhook = env_dict.get('STRIPE_WEBHOOK_SECRET', '')
        
        print(f"STRIPE_API_KEY:")
        if stripe_key and stripe_key != 'your_key_here' and 'sk_test' in stripe_key:
            self.print_ok(f"Configurada correctamente")
            print(f"  Valor: {stripe_key[:20]}...")
        else:
            self.print_warning("No configurada o valor de prueba")
            self.warnings.append("STRIPE_API_KEY no configurada correctamente")
        
        print(f"\nSTRIPE_WEBHOOK_SECRET:")
        if stripe_webhook and stripe_webhook != 'whsec_your_webhook_secret_here':
            self.print_ok(f"Configurada: {stripe_webhook}")
        else:
            self.print_warning("No configurada o valor de placeholder")
            self.warnings.append("STRIPE_WEBHOOK_SECRET necesita configurarse")
    
    def verify_mongodb_urls(self):
        """Verifica URLs de MongoDB"""
        self.print_header("🗄️  Verificando URLs de MongoDB")
        
        services = {
            'auth-service': 'backend/auth-service/.env',
            'payment-service': 'backend/payment-service/.env',
        }
        
        for service, env_path in services.items():
            full_path = self.base_path / env_path
            env_dict = self.read_env_file(full_path)
            mongo_url = env_dict.get('MONGODB_URL', 'NO ENCONTRADA')
            
            print(f"\n{service}:")
            if mongo_url == 'NO ENCONTRADA':
                self.print_warning(f"MONGODB_URL no configurada")
            else:
                print(f"  URL: {mongo_url}")
                if mongo_url == 'mongodb://localhost:27017':
                    self.print_ok("Configurada para desarrollo local ✓")
                elif 'mongodb+srv://' in mongo_url:
                    self.print_ok("Configurada para MongoDB Atlas ✓")
                else:
                    self.print_warning("URL de MongoDB inusual")
    
    def verify_service_urls(self):
        """Verifica URLs de servicios"""
        self.print_header("🌐 Verificando URLs de Servicios")
        
        env_path = self.base_path / 'backend/payment-service/.env'
        env_dict = self.read_env_file(env_path)
        
        print(f"SERVICE_URL: {env_dict.get('SERVICE_URL', 'NO ENCONTRADA')}")
        print(f"AUTH_SERVICE_URL: {env_dict.get('AUTH_SERVICE_URL', 'NO ENCONTRADA')}")
        
        service_url = env_dict.get('SERVICE_URL', '')
        auth_url = env_dict.get('AUTH_SERVICE_URL', '')
        
        if service_url == 'http://localhost:8002':
            self.print_ok("SERVICE_URL configurada correctamente ✓")
        else:
            self.print_warning("SERVICE_URL podría no ser correcta")
        
        if auth_url == 'http://localhost:8001':
            self.print_ok("AUTH_SERVICE_URL configurada correctamente ✓")
        else:
            self.print_warning("AUTH_SERVICE_URL podría no ser correcta")
    
    def verify_integration_flags(self):
        """Verifica flags de integración"""
        self.print_header("🚩 Verificando Flags de Integración")
        
        env_path = self.base_path / 'backend/payment-service/.env'
        env_dict = self.read_env_file(env_path)
        
        integracion_enabled = env_dict.get('INTEGRACION_ENABLED', 'NO ENCONTRADO')
        integracion_timeout = env_dict.get('INTEGRACION_TIMEOUT', 'NO ENCONTRADO')
        
        print(f"INTEGRACION_ENABLED: {integracion_enabled}")
        if integracion_enabled == 'true':
            self.print_ok("Integración bidireccional activada ✓")
        else:
            self.print_warning("Integración podría estar desactivada")
        
        print(f"INTEGRACION_TIMEOUT: {integracion_timeout}")
        if integracion_timeout == '10':
            self.print_ok("Timeout configurado en 10 segundos ✓")
        else:
            self.print_warning(f"Timeout podría no ser óptimo: {integracion_timeout}")
    
    def generate_report(self):
        """Genera reporte final"""
        self.print_header("📋 REPORTE FINAL", )
        
        if not self.issues and not self.warnings:
            print(f"{COLORS['GREEN']}{COLORS['BOLD']}")
            print("  ✅ TODA LA CONFIGURACIÓN ESTÁ CORRECTA")
            print(f"{COLORS['END']}")
            return True
        
        if self.warnings:
            print(f"\n{COLORS['YELLOW']}⚠️  ADVERTENCIAS ({len(self.warnings)}):{COLORS['END']}")
            for warning in self.warnings:
                print(f"  - {warning}")
        
        if self.issues:
            print(f"\n{COLORS['RED']}❌ PROBLEMAS CRÍTICOS ({len(self.issues)}):{COLORS['END']}")
            for issue in self.issues:
                print(f"  - {issue}")
            return False
        
        return True
    
    def run(self):
        """Ejecuta todas las verificaciones"""
        print(f"{COLORS['BLUE']}{COLORS['BOLD']}\n{'='*70}")
        print("  🔐 VERIFICACIÓN DE CONFIGURACIÓN DE CLAVES SECRETAS")
        print(f"{'='*70}{COLORS['END']}\n")
        
        self.verify_jwt_secrets()
        self.verify_integration_secrets()
        self.verify_stripe_config()
        self.verify_mongodb_urls()
        self.verify_service_urls()
        self.verify_integration_flags()
        
        success = self.generate_report()
        
        if success:
            print(f"\n{COLORS['GREEN']}Procede a ejecutar los tests de integración:{COLORS['END']}")
            print(f"  python test_integracion_bidireccional_completa.py")
        else:
            print(f"\n{COLORS['RED']}Por favor corrige los problemas antes de continuar{COLORS['END']}")
        
        return success

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    # Detectar ruta base
    current_dir = Path(__file__).parent
    workspace_root = current_dir.parent.parent  # Subir dos niveles a ProyectoSWEB...
    
    verifier = SecretVerifier(workspace_root)
    success = verifier.run()
    
    exit(0 if success else 1)
