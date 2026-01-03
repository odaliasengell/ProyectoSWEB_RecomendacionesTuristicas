#!/bin/bash

# Script de despliegue local con Docker Compose
# Asegúrate de tener Docker y Docker Compose instalados

set -e

echo "🚀 Sistema de Recomendaciones Turísticas - Deployment"
echo "=================================================="

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

echo "✅ Docker encontrado"

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

echo "✅ Docker Compose encontrado"

# Build
echo ""
echo "📦 Construyendo imágenes Docker..."
docker-compose build

# Pull images
echo ""
echo "📥 Descargando imágenes..."
docker-compose pull

# Start services
echo ""
echo "🔄 Iniciando servicios..."
docker-compose up -d

# Wait for services
echo ""
echo "⏳ Esperando a que los servicios se inicien..."
sleep 10

# Health check
echo ""
echo "🏥 Verificando salud de servicios..."

services=(
    "auth-service:3001"
    "payment-service:8001"
    "ai-orchestrator:8002"
    "rest-api:8000"
    "graphql-service:4000"
    "websocket-server:8080"
    "nginx:80"
)

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    if docker-compose ps | grep -q "$name"; then
        echo "✅ $name (Puerto $port)"
    else
        echo "❌ $name"
    fi
done

echo ""
echo "=================================================="
echo "✅ Despliegue completado!"
echo ""
echo "📋 URLs disponibles:"
echo "   - API Gateway: http://localhost:80"
echo "   - Auth Service: http://localhost:3001"
echo "   - Payment Service: http://localhost:8001"
echo "   - AI Orchestrator: http://localhost:8002"
echo "   - REST API: http://localhost:8000"
echo "   - GraphQL: http://localhost:4000"
echo "   - WebSocket: http://localhost:8080"
echo "   - n8n: http://localhost:5678"
echo "   - Frontend: http://localhost:5173"
echo ""
echo "📊 Ver logs:"
echo "   docker-compose logs -f [service_name]"
echo ""
echo "🛑 Detener servicios:"
echo "   docker-compose down"
echo "=================================================="
