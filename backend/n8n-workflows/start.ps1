# Script para iniciar n8n Event Bus
# Pilar 4: n8n - Event Bus (15%) - Modo Local (Sin Docker)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  n8n Event Bus - Pilar 4 (Local)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Definir variables de entorno
$env:N8N_PORT = "5678"
$env:REST_API_URL = "http://localhost:8000"
$env:PAYMENT_SERVICE_URL = "http://localhost:8002"
$env:WEBSOCKET_URL = "http://localhost:8080"
$env:AI_ORCHESTRATOR_URL = "http://localhost:8004"
$env:AUTH_SERVICE_URL = "http://localhost:8001"
$env:PARTNER_HMAC_SECRET = "shared_secret_key_change_me"

# Variables para Email (Configurar aquí)
$env:SMTP_USER = "admin" 
# Nota: La contraseña se recomienda configurar directamente en las Credenciales de n8n por seguridad,
# pero si tus workflows usan $env.SMTP_PASS, descomenta la siguiente línea:
# $env:SMTP_PASS = "tu-app-password"

Write-Host "Variables de entorno configuradas." -ForegroundColor Green

# Verificar si n8n esta instalado
$n8nInstalled = Get-Command n8n -ErrorAction SilentlyContinue

if ($n8nInstalled) {
    Write-Host "Iniciando n8n localmente..." -ForegroundColor Green
    Write-Host "   URL: http://localhost:5678" -ForegroundColor White
    n8n start
} else {
    Write-Host "n8n no detectado en el PATH. Intentando con npx..." -ForegroundColor Yellow
    
    $npxInstalled = Get-Command npx -ErrorAction SilentlyContinue
    if ($npxInstalled) {
        Write-Host "Iniciando n8n via npx (esto puede tardar la primera vez)..." -ForegroundColor Green
        Write-Host "   URL: http://localhost:5678" -ForegroundColor White
        npx n8n start
    } else {
        Write-Host "Error: No se encontro ni n8n ni npx. Por favor instala Node.js y npm." -ForegroundColor Red
        Exit 1
    }
}
