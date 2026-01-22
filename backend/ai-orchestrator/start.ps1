# Script para iniciar AI Orchestrator
# Uso: .\start.ps1

Write-Host "Iniciando AI Orchestrator..." -ForegroundColor Cyan

# Verificar que existe .env
if (-not (Test-Path ".env")) {
    Write-Host "Archivo .env no encontrado. Copiando desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Configura las API Keys en .env antes de continuar" -ForegroundColor Yellow
    exit 1
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

Write-Host "Iniciando servidor en puerto 8004..." -ForegroundColor Green
Write-Host "Documentacion: http://localhost:8004/docs" -ForegroundColor Cyan

python main.py
