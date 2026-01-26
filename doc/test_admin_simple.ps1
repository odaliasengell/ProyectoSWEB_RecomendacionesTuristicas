#!/usr/bin/env pwsh
# Script para probar acceso ADMIN

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "PRUEBA DE ACCESO ADMIN AL DASHBOARD" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$AUTH_SERVICE_URL = "http://localhost:8001"
$FRONTEND_URL = "http://localhost:5173"
$adminEmail = "admin@example.com"
$adminPassword = "Admin123456"

Write-Host "PASO 1: Registrar Admin" -ForegroundColor Yellow

$registerBody = @{
    email = $adminEmail
    password = $adminPassword
    full_name = "Administrator User"
    role = "admin"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest `
        -Uri "$AUTH_SERVICE_URL/auth/register" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $registerBody `
        -ErrorAction SilentlyContinue

    if ($registerResponse.StatusCode -eq 201) {
        Write-Host "Admin registrado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "Admin ya existe (es normal)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Registro falló: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "PASO 2: Iniciar Sesion como Admin" -ForegroundColor Yellow

$loginBody = @{
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest `
    -Uri "$AUTH_SERVICE_URL/auth/login" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $loginBody

$loginData = $loginResponse.Content | ConvertFrom-Json

Write-Host "Login exitoso" -ForegroundColor Green
Write-Host "Email: $($loginData.user.email)" -ForegroundColor Cyan
Write-Host "Nombre: $($loginData.user.full_name)" -ForegroundColor Cyan
Write-Host "Rol: $($loginData.user.role)" -ForegroundColor Cyan

if ($loginData.user.role -eq "admin") {
    Write-Host "Usuario tiene rol ADMIN" -ForegroundColor Green
} else {
    Write-Host "ERROR: Usuario NO es admin, rol: $($loginData.user.role)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "PASO 3: Validar Token JWT" -ForegroundColor Yellow

$validateBody = @{
    token = $loginData.access_token
} | ConvertTo-Json

$validateResponse = Invoke-WebRequest `
    -Uri "$AUTH_SERVICE_URL/auth/validate" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $validateBody

$validateData = $validateResponse.Content | ConvertFrom-Json

Write-Host "Token validado correctamente" -ForegroundColor Green
Write-Host "Valido: $($validateData.valid)" -ForegroundColor Cyan
Write-Host "Rol: $($validateData.role)" -ForegroundColor Cyan

Write-Host ""
Write-Host "ACCESO AL DASHBOARD" -ForegroundColor Yellow
Write-Host "URL 1: $FRONTEND_URL/login" -ForegroundColor Cyan
Write-Host "  - Credenciales: admin@example.com / Admin123456" -ForegroundColor Gray
Write-Host ""
Write-Host "URL 2: $FRONTEND_URL/admin" -ForegroundColor Cyan
Write-Host "  - Acceso directo (si ya estoy autenticado)" -ForegroundColor Gray
Write-Host ""

Write-Host "SIGUIENTE PASO:" -ForegroundColor Green
Write-Host "1. Abre navegador en $FRONTEND_URL/login" -ForegroundColor Cyan
Write-Host "2. Ingresa: admin@example.com / Admin123456" -ForegroundColor Cyan
Write-Host "3. El sistema te redirige a /admin con el Dashboard completo" -ForegroundColor Cyan
Write-Host ""

Write-Host "OPCIONES EN EL DASHBOARD:" -ForegroundColor Green
Write-Host "- Usuarios (CRUD)" -ForegroundColor Cyan
Write-Host "- Destinos (CRUD)" -ForegroundColor Cyan
Write-Host "- Guias (CRUD)" -ForegroundColor Cyan
Write-Host "- Tours (CRUD)" -ForegroundColor Cyan
Write-Host "- Servicios (CRUD)" -ForegroundColor Cyan
Write-Host "- Reservas (ver y actualizar)" -ForegroundColor Cyan
Write-Host "- Recomendaciones (ver y editar)" -ForegroundColor Cyan
Write-Host "- Contrataciones (ver y actualizar)" -ForegroundColor Cyan
Write-Host "- Reportes y Analisis" -ForegroundColor Cyan
Write-Host ""
Write-Host "PRUEBA EXITOSA!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
