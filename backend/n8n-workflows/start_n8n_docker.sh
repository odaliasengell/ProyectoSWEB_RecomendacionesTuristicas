#!/bin/bash
# Script para iniciar n8n con Docker

echo "🚀 Iniciando n8n con Docker para Turismo ULEAM..."

# Crear directorio de datos si no existe
mkdir -p ./n8n_data

# Verificar Docker
if ! docker --version > /dev/null 2>&1; then
    echo "❌ Docker no está instalado o no está disponible"
    exit 1
fi

# Parar contenedor existente si existe
echo "🧹 Limpiando contenedores existentes..."
docker stop n8n-dev-turismo 2>/dev/null || true
docker rm n8n-dev-turismo 2>/dev/null || true

# Verificar que los servicios de backend estén ejecutándose
echo "🔍 Verificando servicios de backend..."
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "⚠️  Advertencia: El REST API (puerto 8000) no parece estar ejecutándose"
    echo "   Asegúrate de iniciar el backend antes de usar n8n"
fi

# Iniciar n8n
echo "🔄 Iniciando n8n..."
docker-compose -f docker-compose.dev.yml up -d

# Esperar a que n8n esté listo
echo "⏳ Esperando a que n8n esté listo..."
sleep 10

# Verificar estado
if docker ps | grep -q n8n-dev-turismo; then
    echo "✅ n8n iniciado correctamente!"
    echo ""
    echo "📍 Acceso:"
    echo "   URL: http://localhost:5678"
    echo "   Contenedor: n8n-dev-turismo"
    echo ""
    echo "📊 Para importar workflows:"
    echo "   1. Abre http://localhost:5678"
    echo "   2. Ve a Settings > Import/Export"
    echo "   3. Importa: ./workflows/reportes_generales.json"
    echo ""
    echo "📱 Logs en tiempo real:"
    echo "   docker logs -f n8n-dev-turismo"
else
    echo "❌ Error al iniciar n8n"
    docker logs n8n-dev-turismo
    exit 1
fi