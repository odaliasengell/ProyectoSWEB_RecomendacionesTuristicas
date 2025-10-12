$ErrorActionPreference = "Stop"

# Cambiar al directorio del proyecto Go
Set-Location "c:\Users\DESKTOP\ProyectoSWEB_RecomendacionesTuristicas\backend\go-servicios-contrataciones"

Write-Host "📍 Directorio actual: $(Get-Location)" -ForegroundColor Cyan
Write-Host "🔍 Verificando archivo main.go..." -ForegroundColor Cyan

if (Test-Path "cmd\api\main.go") {
    Write-Host "✅ Archivo encontrado" -ForegroundColor Green
    Write-Host "🚀 Iniciando servicio Go en puerto 8080..." -ForegroundColor Yellow
    Write-Host ""
    
    & "C:\Program Files\Go\bin\go.exe" run cmd/api/main.go
} else {
    Write-Host "❌ ERROR: No se encuentra cmd\api\main.go" -ForegroundColor Red
    Write-Host "Contenido del directorio:" -ForegroundColor Yellow
    Get-ChildItem
    exit 1
}
