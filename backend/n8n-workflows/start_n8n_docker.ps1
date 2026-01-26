# Script PowerShell para iniciar n8n con Docker
# Equipo A - ULEAM - Sistema de Recomendaciones Turísticas

Write-Host "Iniciando n8n con Docker para Turismo ULEAM..." -ForegroundColor Green

# Crear directorio de datos si no existe
if (!(Test-Path "./n8n_data")) {
    New-Item -ItemType Directory -Path "./n8n_data" -Force
    Write-Host "📁 Directorio n8n_data creado" -ForegroundColor Blue
}

# Verificar Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker detectado: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker no está instalado o no está disponible" -ForegroundColor Red
    Write-Host "   Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    pause
    exit 1
}

# Parar contenedor existente si existe
Write-Host "🧹 Limpiando contenedores existentes..." -ForegroundColor Yellow
docker stop n8n-dev-turismo 2>$null
docker rm n8n-dev-turismo 2>$null

# Verificar que los servicios de backend estén ejecutándose
Write-Host "🔍 Verificando servicios de backend..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ REST API (puerto 8000) está ejecutándose" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Advertencia: El REST API (puerto 8000) no parece estar ejecutándose" -ForegroundColor Yellow
    Write-Host "   Asegúrate de iniciar el backend antes de usar n8n workflows" -ForegroundColor Yellow
}

# Iniciar n8n
Write-Host "🔄 Iniciando n8n con Docker..." -ForegroundColor Blue
docker-compose -f docker-compose.dev.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar Docker Compose" -ForegroundColor Red
    pause
    exit 1
}

# Esperar a que n8n esté listo
Write-Host "⏳ Esperando a que n8n esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar estado
$containerStatus = docker ps --filter "name=n8n-dev-turismo" --format "table {{.Names}}\t{{.Status}}"

if ($containerStatus -match "n8n-dev-turismo") {
    Write-Host "" 
    Write-Host "✅ n8n iniciado correctamente!" -ForegroundColor Green
    Write-Host "" 
    Write-Host "📍 INFORMACIÓN DE ACCESO:" -ForegroundColor Cyan
    Write-Host "   🌐 URL: http://localhost:5678" -ForegroundColor White
    Write-Host "   🐳 Contenedor: n8n-dev-turismo" -ForegroundColor White
    Write-Host "" 
    Write-Host "📊 CONFIGURACIÓN INICIAL:" -ForegroundColor Cyan
    Write-Host "   1. Abre http://localhost:5678 en tu navegador" -ForegroundColor White
    Write-Host "   2. Configura tu usuario y contraseña (primera vez)" -ForegroundColor White
    Write-Host "   3. Ve a Settings > Import/Export" -ForegroundColor White
    Write-Host "   4. Importa: ./workflows/reportes_generales.json" -ForegroundColor White
    Write-Host "" 
    Write-Host "📱 COMANDOS ÚTILES:" -ForegroundColor Cyan
    Write-Host "   Ver logs:     docker logs -f n8n-dev-turismo" -ForegroundColor White
    Write-Host "   Parar n8n:    docker stop n8n-dev-turismo" -ForegroundColor White
    Write-Host "   Reiniciar:    docker restart n8n-dev-turismo" -ForegroundColor White
    Write-Host "" 
    
    # Intentar abrir el navegador automáticamente
    try {
        Start-Process "http://localhost:5678"
        Write-Host "🌐 Abriendo navegador..." -ForegroundColor Green
    }
    catch {
        Write-Host "💡 Abre manualmente: http://localhost:5678" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "" 
    Write-Host "❌ Error al iniciar n8n" -ForegroundColor Red
    Write-Host "📋 Logs del contenedor:" -ForegroundColor Yellow
    docker logs n8n-dev-turismo
    Write-Host "" 
    pause
    exit 1
}

Write-Host "" 
Write-Host "🎯 n8n está listo para automatizar reportes del sistema de turismo!" -ForegroundColor Green
Write-Host "   Presiona cualquier tecla para continuar..." -ForegroundColor Gray
pause