#!/bin/bash

# Script para iniciar el servidor WebSocket en Linux/Mac

echo "🚀 Iniciando servidor WebSocket..."

# Verificar si Go está instalado
if ! command -v go &> /dev/null; then
    echo "❌ Go no está instalado. Por favor instala Go desde https://golang.org/dl/"
    exit 1
fi

# Verificar versión de Go
GO_VERSION=$(go version)
echo "✅ $GO_VERSION"

# Descargar dependencias si es necesario
if [ ! -f "go.sum" ]; then
    echo "📦 Descargando dependencias..."
    go mod download
fi

# Iniciar el servidor
echo "🌐 Iniciando servidor en puerto 8080..."
echo "📡 Endpoint WebSocket: ws://localhost:8080/ws"
echo "📮 Endpoint HTTP: http://localhost:8080/notify"
echo "🌐 Interfaz web: http://localhost:8080/"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

go run .
