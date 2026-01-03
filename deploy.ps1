# Script de despliegue para Windows
# Asegúrate de tener Docker Desktop instalado

Write-Host "🚀 Sistema de Recomendaciones Turísticas - Deployment" -ForegroundColor Green
Write-Host "=================================================="

# Verificar Docker
try {
    docker --version | Out-Null
    Write-Host "✅ Docker encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado" -ForegroundColor Red
    exit 1
}

# Verificar Docker Compose
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose no está instalado" -ForegroundColor Red
    exit 1
}

# Build
Write-Host ""
Write-Host "📦 Construyendo imágenes Docker..." -ForegroundColor Cyan
docker-compose build

# Pull images
Write-Host ""
Write-Host "📥 Descargando imágenes..." -ForegroundColor Cyan
docker-compose pull

# Start services
Write-Host ""
Write-Host "🔄 Iniciando servicios..." -ForegroundColor Cyan
docker-compose up -d

# Wait for services
Write-Host ""
Write-Host "⏳ Esperando a que los servicios se inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Health check
Write-Host ""
Write-Host "🏥 Verificando salud de servicios..." -ForegroundColor Cyan

$services = @(
    @{name="auth-service"; port=3001},
    @{name="payment-service"; port=8001},
    @{name="ai-orchestrator"; port=8002},
    @{name="rest-api"; port=8000},
    @{name="graphql-service"; port=4000},
    @{name="websocket-server"; port=8080},
    @{name="nginx"; port=80}
)

foreach ($service in $services) {
    $ps = docker-compose ps | Select-String $service.name
    if ($ps) {
        Write-Host "✅ $($service.name) (Puerto $($service.port))" -ForegroundColor Green
    } else {
        Write-Host "❌ $($service.name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=================================================="
Write-Host "✅ Despliegue completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 URLs disponibles:" -ForegroundColor Yellow
Write-Host "   - API Gateway: http://localhost:80"
Write-Host "   - Auth Service: http://localhost:3001"
Write-Host "   - Payment Service: http://localhost:8001"
Write-Host "   - AI Orchestrator: http://localhost:8002"
Write-Host "   - REST API: http://localhost:8000"
Write-Host "   - GraphQL: http://localhost:4000"
Write-Host "   - WebSocket: http://localhost:8080"
Write-Host "   - n8n: http://localhost:5678"
Write-Host "   - Frontend: http://localhost:5173"
Write-Host ""
Write-Host "📊 Ver logs:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f [service_name]"
Write-Host ""
Write-Host "🛑 Detener servicios:" -ForegroundColor Yellow
Write-Host "   docker-compose down"
Write-Host "=================================================="
