# Script para iniciar MCP Server
# Uso: .\start.ps1

Write-Host "Iniciando MCP Server..." -ForegroundColor Cyan

# Verificar que existe .env
if (-not (Test-Path ".env")) {
    Write-Host "Archivo .env no encontrado. Copiando desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Activar entorno virtual si existe
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activando entorno virtual..." -ForegroundColor Green
    & "venv\Scripts\Activate.ps1"
}

# Instalar dependencias si es necesario
if (-not (Test-Path "venv")) {
    Write-Host "Creando entorno virtual..." -ForegroundColor Green
    python -m venv venv
    & "venv\Scripts\Activate.ps1"
    Write-Host "Instalando dependencias..." -ForegroundColor Green
    pip install -r requirements.txt
}

Write-Host "Iniciando servidor en puerto 8005..." -ForegroundColor Green
Write-Host "Documentacion: http://localhost:8005/docs" -ForegroundColor Cyan
Write-Host "Tools disponibles: http://localhost:8005/tools" -ForegroundColor Cyan

python main.py
