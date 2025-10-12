# Script para iniciar el servidor Go correctamente
# Asegura que siempre se ejecute desde el directorio correcto

$ErrorActionPreference = "Stop"

# Cambiar al directorio del proyecto Go
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Iniciando Servidor Go" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
Write-Host "Directorio actual: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el directorio data/
# En PowerShell 5.1 el operador '!' no es válido; usamos '-not' para negar
if (-not (Test-Path ".\data")) {
    Write-Host "Creando directorio data..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path ".\data" -Force | Out-Null
    Write-Host "Directorio data/ creado" -ForegroundColor Green
}

# Verificar que existe cmd/api/main.go
# Usar '-not' en lugar de '!' para compatibilidad con PowerShell 5.1
if (-not (Test-Path ".\cmd\api\main.go")) {
    Write-Host "Error: No se encuentra cmd/api/main.go" -ForegroundColor Red
    Write-Host "Asegúrate de estar en el directorio go-servicios-contrataciones" -ForegroundColor Red
    exit 1
}

Write-Host "Archivo main.go encontrado" -ForegroundColor Green
Write-Host "Variable DB_PATH: .\data\app.db" -ForegroundColor Green
Write-Host ""
Write-Host "Iniciando servidor en puerto 8080..." -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Ejecutar el servidor
& "C:\Program Files\Go\bin\go.exe" run cmd/api/main.go
