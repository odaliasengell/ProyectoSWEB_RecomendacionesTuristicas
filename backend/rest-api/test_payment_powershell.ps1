# Script de prueba manual usando PowerShell
# Ejecuta: .\test_payment_powershell.ps1

$BASE_URL = "http://localhost:8000"
$TOKEN = ""
$RESERVA_ID = ""
$PAYMENT_ID = ""

Write-Host "================================"
Write-Host "PRUEBAS MANUALES - Payment Service"
Write-Host "================================" -ForegroundColor Cyan

# 1. Login
Write-Host "`n[1] Autenticándose..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body @{
    username = "admin"
    password = "admin123"
  } | ConvertTo-Json

Write-Host "Response: $response"
$TOKEN = (Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body @{
    username = "admin"
    password = "admin123"
  } | Select-Object -ExpandProperty access_token)

Write-Host "✅ Token: $($TOKEN.Substring(0, [Math]::Min(20, $TOKEN.Length)))..."

# 2. Crear una reserva de prueba
Write-Host "`n[2] Creando reserva de prueba..." -ForegroundColor Yellow
$headers = @{
  Authorization = "Bearer $TOKEN"
  "Content-Type" = "application/json"
}

$reserva = Invoke-RestMethod -Uri "$BASE_URL/api/reservas" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body @{
    tour_id = "507f1f77bcf86cd799439999"
    fecha_reserva = "2024-01-20"
    cantidad_personas = 2
    estado = "pendiente"
  } | ConvertTo-Json

Write-Host "Response: $reserva"

# 3. Procesar pago de reserva
Write-Host "`n[3] Procesando pago de reserva..." -ForegroundColor Yellow

# Para la prueba usamos un ID mock
$RESERVA_ID = "507f1f77bcf86cd799439011"

$pago = Invoke-RestMethod -Uri "$BASE_URL/api/pagos/reserva" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body @{
    reserva_id = $RESERVA_ID
    monto = 150.00
    descripcion = "Pago de prueba - Semana 2"
  } | ConvertTo-Json

Write-Host "Response: $pago"

# 4. Obtener estado del pago
Write-Host "`n[4] Consultando estado del pago..." -ForegroundColor Yellow

# Para la prueba usamos un ID mock
$PAYMENT_ID = "pay_1234567890"

$estado = Invoke-RestMethod -Uri "$BASE_URL/api/pagos/estado/$PAYMENT_ID" `
  -Method GET `
  -Headers $headers | ConvertTo-Json

Write-Host "Response: $estado"

# 5. Procesar pago de tour
Write-Host "`n[5] Procesando pago de tour..." -ForegroundColor Yellow

$pago_tour = Invoke-RestMethod -Uri "$BASE_URL/api/pagos/tour" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body @{
    tour_id = "507f1f77bcf86cd799439013"
    cantidad_personas = 3
    precio_por_persona = 85.00
  } | ConvertTo-Json

Write-Host "Response: $pago_tour"

# 6. Procesar reembolso
Write-Host "`n[6] Procesando reembolso..." -ForegroundColor Yellow

$reembolso = Invoke-RestMethod -Uri "$BASE_URL/api/pagos/reembolso" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body @{
    payment_id = $PAYMENT_ID
    razon = "Prueba de reembolso"
  } | ConvertTo-Json

Write-Host "Response: $reembolso"

Write-Host "`n================================"
Write-Host "✅ Pruebas completadas" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
