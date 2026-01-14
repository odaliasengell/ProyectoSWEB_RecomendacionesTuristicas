# Script para ejecutar Auth Service
# Autor: Odalis Senge

Write-Host "Iniciando Auth Service..." -ForegroundColor Cyan

# Verificar si existe el entorno virtual
if (-not (Test-Path "venv")) {
    Write-Host "Creando entorno virtual..." -ForegroundColor Yellow
    python -m venv venv
}

# Activar entorno virtual
Write-Host "Activando entorno virtual..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Instalar dependencias
Write-Host "Instalando dependencias..." -ForegroundColor Yellow
pip install -r requirements.txt

# Verificar .env
if (-not (Test-Path ".env")) {
    Write-Host "Archivo .env no encontrado. Copiando desde .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "Por favor edita el archivo .env con tus configuraciones" -ForegroundColor Red
}

# Ejecutar aplicación
Write-Host "Iniciando servidor..." -ForegroundColor Green
python main.py
