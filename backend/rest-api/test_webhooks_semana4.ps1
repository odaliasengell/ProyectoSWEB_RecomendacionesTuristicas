# SEMANA 4: Tests de Webhooks con JWT + HMAC
# Autor: Nestor Ayala
# Fecha: 24 de enero de 2026

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🚀 SEMANA 4: TESTS JWT + HMAC WEBHOOKS" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:8000"
$WEBHOOK_URL = "$BASE_URL/webhooks"
$SECRET = "my_secret_key_123"

# Colores
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"
$InfoColor = "Cyan"

function Generate-HMACSHA256 {
    param([string]$Message, [string]$Secret)
    
    $key = [System.Text.Encoding]::UTF8.GetBytes($Secret)
    $messageBytes = [System.Text.Encoding]::UTF8.GetBytes($Message)
    
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = $key
    
    $hashBytes = $hmac.ComputeHash($messageBytes)
    $hashHex = [System.BitConverter]::ToString($hashBytes) -replace "-", ""
    
    return $hashHex.ToLower()
}

# ============================================================================
# TEST 1: Generar Token JWT
# ============================================================================
Write-Host "[TEST 1] Generando Token JWT..." -ForegroundColor $InfoColor
try {
    $generateBody = @{
        user_id = "test_user_123"
        email = "test@example.com"
        username = "test_user"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$WEBHOOK_URL/generate-token" `
        -Method Post `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $generateBody

    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        $token = $data.access_token
        $expires = $data.expires_in
        
        Write-Host "✅ Token generado exitosamente" -ForegroundColor $SuccessColor
        Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor $WarningColor
        Write-Host "   Expira en: $expires segundos" -ForegroundColor $WarningColor
        Write-Host ""
    } else {
        Write-Host "❌ Error generando token (Status: $($response.StatusCode))" -ForegroundColor $ErrorColor
        exit 1
    }
} catch {
    Write-Host "❌ Error en TEST 1: $_" -ForegroundColor $ErrorColor
    exit 1
}

# ============================================================================
# TEST 2: Endpoint de Prueba
# ============================================================================
Write-Host "[TEST 2] Verificando Endpoint de Prueba..." -ForegroundColor $InfoColor
try {
    $response = Invoke-WebRequest -Uri "$WEBHOOK_URL/test" -Method Get
    
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✅ Endpoint activo" -ForegroundColor $SuccessColor
        Write-Host "   Estado: $($data.status)" -ForegroundColor $WarningColor
        Write-Host "   Servicio: $($data.service)" -ForegroundColor $WarningColor
        Write-Host ""
    } else {
        Write-Host "❌ Error en TEST 2 (Status: $($response.StatusCode))" -ForegroundColor $ErrorColor
    }
} catch {
    Write-Host "❌ Error en TEST 2: $_" -ForegroundColor $ErrorColor
}

# ============================================================================
# TEST 3: Validar solo HMAC
# ============================================================================
Write-Host "[TEST 3] Validando solo HMAC..." -ForegroundColor $InfoColor
try {
    $testPayload = @{
        event_type = "booking.confirmed"
        booking_id = "book_123"
    } | ConvertTo-Json -Compress
    
    $signature = Generate-HMACSHA256 -Message $testPayload -Secret $SECRET
    
    $validateBody = @{
        payload = ($testPayload | ConvertFrom-Json)
        signature = $signature
        secret = $SECRET
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$WEBHOOK_URL/validate-hmac" `
        -Method Post `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $validateBody

    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        if ($data.is_valid) {
            Write-Host "✅ HMAC válido" -ForegroundColor $SuccessColor
            Write-Host "   Firma: $($signature.Substring(0,16))..." -ForegroundColor $WarningColor
        } else {
            Write-Host "❌ HMAC inválido" -ForegroundColor $ErrorColor
        }
        Write-Host ""
    }
} catch {
    Write-Host "⚠️ Error en TEST 3: $_" -ForegroundColor $WarningColor
}

# ============================================================================
# TEST 4: Webhook sin JWT (debe fallar)
# ============================================================================
Write-Host "[TEST 4] Webhook sin JWT (debe rechazar)..." -ForegroundColor $InfoColor
try {
    $payload = @{
        event_type = "booking.confirmed"
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
        source_service = "reservas_system"
        data = @{
            booking_id = "book_123"
        }
    } | ConvertTo-Json -Compress
    
    $signature = Generate-HMACSHA256 -Message $payload -Secret $SECRET
    
    $response = Invoke-WebRequest -Uri "$WEBHOOK_URL/partner" `
        -Method Post `
        -Headers @{
            "Content-Type" = "application/json"
            "X-Webhook-Signature" = $signature
            "X-Webhook-Source" = "reservas_system"
        } `
        -Body $payload `
        -ErrorAction SilentlyContinue

    if ($response.StatusCode -eq 401) {
        Write-Host "✅ Correctamente rechazado (401)" -ForegroundColor $SuccessColor
    } elseif ($response.StatusCode) {
        Write-Host "⚠️ Status: $($response.StatusCode)" -ForegroundColor $WarningColor
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value
    if ($statusCode -eq 401) {
        Write-Host "✅ Correctamente rechazado (401: JWT requerido)" -ForegroundColor $SuccessColor
    } else {
        Write-Host "⚠️ Error en TEST 4: Status $statusCode" -ForegroundColor $WarningColor
    }
}
Write-Host ""

# ============================================================================
# TEST 5: Webhook con JWT + HMAC válidos
# ============================================================================
Write-Host "[TEST 5] Webhook con JWT + HMAC válidos..." -ForegroundColor $InfoColor
try {
    $payload = @{
        event_type = "booking.confirmed"
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
        source_service = "reservas_system"
        data = @{
            booking_id = "book_999"
            user_id = "user_456"
            hotel_id = "hotel_789"
            check_in = "2025-02-01"
            check_out = "2025-02-05"
            total_price = 500.00
        }
    } | ConvertTo-Json -Compress
    
    $signature = Generate-HMACSHA256 -Message $payload -Secret $SECRET
    
    Write-Host "   Enviando webhook..." -ForegroundColor $WarningColor
    
    $response = Invoke-WebRequest -Uri "$WEBHOOK_URL/partner" `
        -Method Post `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
            "X-Webhook-Signature" = $signature
            "X-Webhook-Source" = "reservas_system"
        } `
        -Body $payload `
        -ErrorAction SilentlyContinue

    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✅ Webhook procesado exitosamente (200)" -ForegroundColor $SuccessColor
        Write-Host "   Status: $($data.status)" -ForegroundColor $WarningColor
        Write-Host "   Event: $($data.event_type)" -ForegroundColor $WarningColor
        if ($data.security) {
            Write-Host "   JWT Validado: $($data.security.jwt_validated)" -ForegroundColor $WarningColor
            Write-Host "   HMAC Validado: $($data.security.hmac_validated)" -ForegroundColor $WarningColor
            Write-Host "   Validado por: $($data.security.validated_by)" -ForegroundColor $WarningColor
        }
    } elseif ($response.StatusCode) {
        Write-Host "⚠️ Status: $($response.StatusCode)" -ForegroundColor $WarningColor
        $data = $response.Content | ConvertFrom-Json
        if ($data.detail) {
            Write-Host "   Detalle: $($data.detail)" -ForegroundColor $WarningColor
        }
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value
    Write-Host "⚠️ Status: $statusCode" -ForegroundColor $WarningColor
    if ($statusCode -eq 500) {
        Write-Host "   (Esto es normal si no hay MongoDB disponible)" -ForegroundColor $WarningColor
    }
}
Write-Host ""

# ============================================================================
# TEST 6: Validador de Seguridad Dual
# ============================================================================
Write-Host "[TEST 6] Validador JWT + HMAC Dual..." -ForegroundColor $InfoColor
try {
    $payload = @{
        event_type = "payment.success"
        data = @{
            payment_id = "pay_123"
            amount = 99.99
        }
    } | ConvertTo-Json -Compress
    
    $signature = Generate-HMACSHA256 -Message $payload -Secret $SECRET
    
    $validateSecurityBody = @{
        payload = ($payload | ConvertFrom-Json)
        signature = $signature
        token = $token
        secret = $SECRET
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$WEBHOOK_URL/validate-security" `
        -Method Post `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $validateSecurityBody

    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "✅ Validación dual completada" -ForegroundColor $SuccessColor
        Write-Host "   JWT Válido: $($data.jwt_valid)" -ForegroundColor $WarningColor
        Write-Host "   HMAC Válido: $($data.hmac_valid)" -ForegroundColor $WarningColor
        Write-Host "   Error: $($data.error)" -ForegroundColor $WarningColor
        
        if ($data.jwt_valid -and $data.hmac_valid -and -not $data.error) {
            Write-Host "✅ Ambas validaciones pasaron" -ForegroundColor $SuccessColor
        }
    }
    Write-Host ""
} catch {
    Write-Host "⚠️ Error en TEST 6: $_" -ForegroundColor $WarningColor
}

# ============================================================================
# RESUMEN
# ============================================================================
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "📊 RESUMEN DE TESTS - SEMANA 4" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Tests completados" -ForegroundColor $SuccessColor
Write-Host ""
Write-Host "Endpoints disponibles:" -ForegroundColor $InfoColor
Write-Host "  • POST /webhooks/generate-token - Generar JWT" -ForegroundColor $WarningColor
Write-Host "  • POST /webhooks/partner - Recibir webhooks (con JWT + HMAC)" -ForegroundColor $WarningColor
Write-Host "  • POST /webhooks/validate-security - Validar seguridad dual" -ForegroundColor $WarningColor
Write-Host "  • POST /webhooks/validate-hmac - Validar solo HMAC" -ForegroundColor $WarningColor
Write-Host "  • GET /webhooks/test - Endpoint de prueba" -ForegroundColor $WarningColor
Write-Host ""
Write-Host "Para tests más completos, ejecuta:" -ForegroundColor $InfoColor
Write-Host "  python test_webhooks_semana4.py" -ForegroundColor $WarningColor
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
