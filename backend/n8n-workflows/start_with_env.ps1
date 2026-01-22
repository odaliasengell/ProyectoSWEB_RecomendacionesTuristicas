# Script para iniciar n8n con variables de entorno
Write-Host "🔧 Configurando n8n con variables de entorno..." -ForegroundColor Cyan

# Cargar variables
$env:REST_API_URL = "http://localhost:8000"
$env:WEBSOCKET_URL = "http://localhost:8080"
$env:AI_ORCHESTRATOR_URL = "http://localhost:8004"
$env:PARTNER_WEBHOOK_URL = "https://webhook.site/your-unique-url"
$env:PARTNER_HMAC_SECRET = "shared_secret_key_change_me"

# Iniciar n8n
Write-Host "🚀 Iniciando n8n en http://localhost:5678" -ForegroundColor Green
n8n start
