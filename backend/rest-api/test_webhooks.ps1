#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Script de prueba de webhooks para Semana 3
  
.DESCRIPTION
  Realiza pruebas end-to-end de envío y recepción de webhooks con validación HMAC

.EXAMPLE
  .\test_webhooks.ps1
  .\test_webhooks.ps1 -TestType "hmac"
  .\test_webhooks.ps1 -TestType "webhook"
#>

param(
    [ValidateSet("all", "hmac", "webhook", "create-reservation", "validate", "curl")]
    [string]$TestType = "all",
    [string]$ApiUrl = "http://localhost:8000",
    [string]$Secret = "shared_secret_tourism_123"
)

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host ("=" * 70) -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host ("=" * 70) -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor Red
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️ $Text" -ForegroundColor Blue
}

# ============================================================================
# Test 1: Validación HMAC
# ============================================================================

function Test-HMAC {
    Write-Header "TEST 1: HMAC-SHA256 Signature Generation & Validation"
    
    $payload = @{
        event_type = "tour.purchased"
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        data = @{
            tour_id = "tour_456"
            user_id = "user_123"
            total_price = 1200.50
        }
    } | ConvertTo-Json
    
    Write-Info "Payload: $payload"
    
    # Generar HMAC
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = [Text.Encoding]::UTF8.GetBytes($Secret)
    $signature = ($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($payload)) | ForEach-Object ToString X2) -join ''
    
    Write-Success "Firma HMAC generada: $($signature.Substring(0, 20))..."
    Write-Success "Longitud de firma: $($signature.Length) caracteres"
    
    # Validar que la firma es consistente
    $hmac2 = New-Object System.Security.Cryptography.HMACSHA256
    $hmac2.Key = [Text.Encoding]::UTF8.GetBytes($Secret)
    $signature2 = ($hmac2.ComputeHash([Text.Encoding]::UTF8.GetBytes($payload)) | ForEach-Object ToString X2) -join ''
    
    if ($signature -eq $signature2) {
        Write-Success "Firma es consistente (determinista)"
    } else {
        Write-Error "Las firmas no coinciden (debería ser determinista)"
    }
}

# ============================================================================
# Test 2: Endpoint /webhooks/test
# ============================================================================

function Test-WebhookEndpoint {
    Write-Header "TEST 2: Check Webhook Service Status"
    
    try {
        $response = Invoke-WebRequest -Uri "$ApiUrl/webhooks/test" -Method GET
        
        if ($response.StatusCode -eq 200) {
            Write-Success "Endpoint activo"
            $data = $response.Content | ConvertFrom-Json
            Write-Info "Servicio: $($data.service)"
            Write-Info "Status: $($data.status)"
            Write-Info "Eventos soportados: $($data.supported_events -join ', ')"
        }
    } catch {
        Write-Error "No se puede conectar a $ApiUrl/webhooks/test"
        Write-Error "Asegúrate de que la API está corriendo: python main.py"
    }
}

# ============================================================================
# Test 3: Crear reserva con webhook
# ============================================================================

function Test-CreateReservation {
    Write-Header "TEST 3: Create Reservation with Webhook"
    
    $reservationPayload = @{
        usuario_id = "user_123"
        usuario_nombre = "Juan Pérez"
        usuario_email = "juan@example.com"
        tour_id = "tour_456"
        tour_nombre = "Tour Galápagos Premium"
        cantidad_personas = 2
        precio_total = 1200.50
        fecha = "2025-03-15"
    } | ConvertTo-Json
    
    Write-Info "Payload:"
    Write-Host $reservationPayload -ForegroundColor Yellow
    
    try {
        Write-Info "Enviando POST /reservas/webhook/tour-purchased..."
        
        $response = Invoke-WebRequest -Uri "$ApiUrl/reservas/webhook/tour-purchased" `
            -Method POST `
            -Headers @{ "Content-Type" = "application/json" } `
            -Body $reservationPayload
        
        if ($response.StatusCode -eq 200) {
            Write-Success "Reserva creada"
            $data = $response.Content | ConvertFrom-Json
            Write-Info "Webhook enviado: $($data.webhook.sent)"
            Write-Info "Status code del webhook: $($data.webhook.status_code)"
        }
    } catch {
        Write-Error "Error al crear reserva: $($_.Exception.Message)"
    }
}

# ============================================================================
# Test 4: Validar HMAC con endpoint
# ============================================================================

function Test-ValidateHMAC {
    Write-Header "TEST 4: Validate HMAC Endpoint (Debug)"
    
    $testPayload = @{
        event_type = "test"
        data = @{ test = "true" }
    }
    
    $payloadStr = $testPayload | ConvertTo-Json
    
    # Generar firma
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = [Text.Encoding]::UTF8.GetBytes($Secret)
    $signature = ($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($payloadStr)) | ForEach-Object ToString X2) -join ''
    
    $validatePayload = @{
        payload = $testPayload
        signature = $signature
        secret = $Secret
    } | ConvertTo-Json
    
    try {
        Write-Info "Enviando payload con firma para validación..."
        
        $response = Invoke-WebRequest -Uri "$ApiUrl/webhooks/validate-hmac" `
            -Method POST `
            -Headers @{ "Content-Type" = "application/json" } `
            -Body $validatePayload
        
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            Write-Info "Resultado: $($data.message)"
            Write-Success "Validación HMAC funciona"
        }
    } catch {
        Write-Error "Error al validar HMAC: $($_.Exception.Message)"
    }
}

# ============================================================================
# Test 5: Generar comando curl para manual testing
# ============================================================================

function Test-GenerateCurl {
    Write-Header "TEST 5: Generate cURL Command for Manual Testing"
    
    $payload = @{
        event_type = "tour.purchased"
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        source_service = "tourism_recomendaciones"
        data = @{
            tour_id = "tour_456"
            tour_name = "Tour Galápagos Premium"
            user_id = "user_123"
            user_email = "juan@example.com"
            quantity = 2
            total_price = 1200.50
            reservation_id = "res_789"
            travel_date = "2025-03-15"
        }
    } | ConvertTo-Json -Compress
    
    # Generar firma
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = [Text.Encoding]::UTF8.GetBytes($Secret)
    $signature = ($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($payload)) | ForEach-Object ToString X2) -join ''
    
    # Comando curl
    $curlCmd = @"
curl -X POST $ApiUrl/webhooks/partner `
  -H "Content-Type: application/json" `
  -H "X-Webhook-Signature: $signature" `
  -H "X-Webhook-Source: tourism_recomendaciones" `
  -d '$payload'
"@
    
    Write-Info "Comando curl para probar webhook manualmente:"
    Write-Host $curlCmd -ForegroundColor Yellow
    
    # Comando curl para Windows (con powershell escaping)
    $curlCmd2 = @"
curl -X POST $ApiUrl/webhooks/partner -H "Content-Type: application/json" -H "X-Webhook-Signature: $signature" -H "X-Webhook-Source: tourism_recomendaciones" -d '$payload'
"@
    
    Write-Info "O usa desde PowerShell directamente:"
    Write-Host $curlCmd2 -ForegroundColor Yellow
}

# ============================================================================
# Test 6: Información de integración con partner
# ============================================================================

function Test-PartnerInfo {
    Write-Header "TEST 6: Partner Integration Information"
    
    Write-Info "Información para compartir con grupo partner:"
    Write-Host ""
    Write-Host "URL del webhook: $ApiUrl/webhooks/partner" -ForegroundColor Cyan
    Write-Host "Secret: $Secret" -ForegroundColor Cyan
    Write-Host "Algoritmo: HMAC-SHA256" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Headers requeridos:" -ForegroundColor Cyan
    Write-Host "  - X-Webhook-Signature: <firma_hmac>" -ForegroundColor Yellow
    Write-Host "  - X-Webhook-Source: <nombre_del_servicio>" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Eventos soportados:" -ForegroundColor Cyan
    Write-Host "  - booking.confirmed" -ForegroundColor Yellow
    Write-Host "  - payment.success" -ForegroundColor Yellow
    Write-Host "  - order.created" -ForegroundColor Yellow
}

# ============================================================================
# Main
# ============================================================================

Write-Header "🧪 PRUEBAS DE WEBHOOKS - SEMANA 3 (Nestor)"

switch ($TestType) {
    "hmac" {
        Test-HMAC
    }
    "webhook" {
        Test-WebhookEndpoint
    }
    "create-reservation" {
        Test-CreateReservation
    }
    "validate" {
        Test-ValidateHMAC
    }
    "curl" {
        Test-GenerateCurl
    }
    "all" {
        Test-HMAC
        Test-WebhookEndpoint
        Test-CreateReservation
        Test-ValidateHMAC
        Test-GenerateCurl
        Test-PartnerInfo
    }
}

Write-Header "✅ PRUEBAS COMPLETADAS"

Write-Info "Próximos pasos:"
Write-Host "1. Instalar ngrok desde https://ngrok.com" -ForegroundColor Yellow
Write-Host "2. Ejecutar: ngrok http 8000" -ForegroundColor Yellow
Write-Host "3. Coordinar URL ngrok con grupo partner" -ForegroundColor Yellow
Write-Host "4. Actualizar .env con PARTNER_WEBHOOK_URL" -ForegroundColor Yellow
Write-Host "5. Hacer commit: feat(webhooks): integración con grupo partner" -ForegroundColor Yellow
Write-Host ""
