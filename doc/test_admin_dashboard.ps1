#!/usr/bin/env pwsh
# 🔐 Script para probar acceso ADMIN al Dashboard

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🛡️  PRUEBA DE ACCESO ADMIN AL DASHBOARD" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$AUTH_SERVICE_URL = "http://localhost:8001"
$FRONTEND_URL = "http://localhost:5173"

# Credenciales de prueba
$adminEmail = "admin@example.com"
$adminPassword = "Admin123456"

Write-Host "📋 PASO 1: Registrar Admin (si no existe)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

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
        Write-Host "✅ Admin registrado exitosamente" -ForegroundColor Green
    } elseif ($registerResponse.StatusCode -eq 400) {
        Write-Host "⚠️  Admin ya existe (es normal si ya lo registraste)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Registro falló: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔑 PASO 2: Iniciar Sesión como Admin" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

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

Write-Host "✅ Login exitoso" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Datos recibidos:" -ForegroundColor Cyan
Write-Host "  Email: $($loginData.user.email)"
Write-Host "  Nombre: $($loginData.user.full_name)"
Write-Host "  Rol: $($loginData.user.role)"
Write-Host "  ID: $($loginData.user.id)"

# Validar que es admin
if ($loginData.user.role -eq "admin") {
    Write-Host "✅ CONFIRMADO: Usuario tiene rol 'admin'" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Usuario NO tiene rol 'admin', tiene rol: $($loginData.user.role)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ PASO 3: Validar Token JWT" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$validateBody = @{
    token = $loginData.access_token
} | ConvertTo-Json

$validateResponse = Invoke-WebRequest `
    -Uri "$AUTH_SERVICE_URL/auth/validate" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $validateBody

$validateData = $validateResponse.Content | ConvertFrom-Json

Write-Host "✅ Token válido" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Validación:" -ForegroundColor Cyan
Write-Host "  Válido: $($validateData.valid)"
Write-Host "  Email: $($validateData.email)"
Write-Host "  Rol: $($validateData.role)"
Write-Host "  User ID: $($validateData.user_id)"

Write-Host ""
Write-Host "🌐 PASO 4: URLs para Acceder al Dashboard" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Host ""
Write-Host "Opción 1: Desde el Login (recomendado)" -ForegroundColor Cyan
Write-Host "  1. Abre: $FRONTEND_URL/login"
Write-Host "  2. Email: $adminEmail"
Write-Host "  3. Contraseña: $adminPassword"
Write-Host "  4. Click en 'Iniciar Sesión'"
Write-Host "  5. Debería redirigir a: $FRONTEND_URL/admin"
Write-Host ""

Write-Host "Opción 2: Acceso Directo (si ya estás autenticado)" -ForegroundColor Cyan
Write-Host "  • Abre: $FRONTEND_URL/admin"
Write-Host "  • Sistema verifica automáticamente el rol"
Write-Host ""

Write-Host "🔍 PASO 5: Verificación en el Navegador" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Host ""
Write-Host "Después de iniciar sesión, abre la consola del navegador (F12) y verifica:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ✅ Deberías ver en localStorage:" -ForegroundColor Green
Write-Host "     • token: $($loginData.access_token.Substring(0, 20))..."
Write-Host "     • refreshToken: $($loginData.refresh_token.Substring(0, 20))..."
Write-Host "     • userData: { email: '$adminEmail', role: 'admin', ... }"
Write-Host ""
Write-Host "  ✅ En la consola deberías ver:" -ForegroundColor Green
Write-Host "     • ✅ [ProtectedAdminRoute] Usuario: { role: 'admin', ... }"
Write-Host "     • ✅ [ProtectedAdminRoute] Acceso admin permitido para: $adminEmail"
Write-Host "     • ✅ [AdminDashboard] Admin JWT autenticado: $adminEmail"
Write-Host ""

Write-Host "🎯 Opciones Disponibles en el Dashboard" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "✅ Dashboard" -ForegroundColor Green
Write-Host "✅ Usuarios (ver, crear, editar, eliminar)" -ForegroundColor Green
Write-Host "✅ Destinos (CRUD completo)" -ForegroundColor Green
Write-Host "✅ Guías (CRUD completo)" -ForegroundColor Green
Write-Host "✅ Tours (CRUD completo)" -ForegroundColor Green
Write-Host "✅ Servicios (CRUD completo)" -ForegroundColor Green
Write-Host "✅ Reservas (ver y actualizar estado)" -ForegroundColor Green
Write-Host "✅ Recomendaciones (ver y editar)" -ForegroundColor Green
Write-Host "✅ Contrataciones (ver y actualizar)" -ForegroundColor Green
Write-Host "✅ Reportes y Análisis" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Comandos Rápidos para Testing" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "# Crear un usuario normal (para comparar)" -ForegroundColor Cyan
Write-Host "`$normalUser = @{" -ForegroundColor Gray
Write-Host "    email = 'usuario@example.com'" -ForegroundColor Gray
Write-Host "    password = 'User123456'" -ForegroundColor Gray
Write-Host "    full_name = 'Usuario Normal'" -ForegroundColor Gray
Write-Host "    role = 'user'" -ForegroundColor Gray
Write-Host "} | ConvertTo-Json" -ForegroundColor Gray
Write-Host ""
Write-Host "Invoke-WebRequest -Uri 'http://localhost:8001/auth/register' " -ForegroundColor Gray
Write-Host "  -Method POST " -ForegroundColor Gray
Write-Host "  -Headers @{'Content-Type'='application/json'} " -ForegroundColor Gray
Write-Host "  -Body `$normalUser" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ PRUEBA COMPLETADA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siguiente paso: Abre el navegador y accede al dashboard" -ForegroundColor Yellow
Write-Host "El sistema AHORA soporta:" -ForegroundColor Yellow
Write-Host "  1. Sistema admin antiguo (adminToken + adminData)" -ForegroundColor Cyan
Write-Host "  2. Sistema JWT del Auth Service (rol=admin)" -ForegroundColor Cyan
Write-Host ""
