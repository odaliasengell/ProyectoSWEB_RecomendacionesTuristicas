# Script para iniciar el Auth Service
Write-Host "Iniciando Auth Service..." -ForegroundColor Cyan

# Activar entorno virtual del proyecto raiz si existe
$venvPath = "..\..\venv\Scripts\Activate.ps1"
if (Test-Path $venvPath) {
    Write-Host "Activando entorno virtual..." -ForegroundColor Yellow
    & $venvPath
} else {
    Write-Host "No se encontro entorno virtual en la raiz del proyecto" -ForegroundColor Yellow
}

# Instalar dependencias
Write-Host "Instalando dependencias..." -ForegroundColor Yellow
pip install -r requirements.txt

# Iniciar servidor
Write-Host "Iniciando servidor en http://localhost:8001 ..." -ForegroundColor Green
uvicorn main:app --reload --host 0.0.0.0 --port 8001
