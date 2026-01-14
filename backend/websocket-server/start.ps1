# Script para iniciar el servidor WebSocket en Windows
Write-Host "Iniciando servidor WebSocket..." -ForegroundColor Cyan

# Verificar si Go esta instalado
if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    Write-Host "Go no esta instalado. Por favor instala Go desde https://golang.org/dl/" -ForegroundColor Red
    exit 1
}

# Verificar version de Go
$goVersion = go version
Write-Host "$goVersion" -ForegroundColor Green

# Descargar dependencias si es necesario
if (-not (Test-Path "go.sum")) {
    Write-Host "Descargando dependencias..." -ForegroundColor Yellow
    go mod download
}

# Iniciar el servidor
Write-Host "Iniciando servidor en puerto 8080..." -ForegroundColor Green
Write-Host "Endpoint WebSocket: ws://localhost:8080/ws" -ForegroundColor Cyan
Write-Host "Endpoint HTTP: http://localhost:8080/notify" -ForegroundColor Cyan
Write-Host "Interfaz web: http://localhost:8080/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Gray
Write-Host ""

go run .
