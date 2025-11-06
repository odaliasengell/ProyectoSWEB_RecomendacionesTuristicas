# ============================================
# 🚀 Script de inicio rápido - GraphQL Service
# ============================================

Write-Host "🚀 Iniciando GraphQL Service..." -ForegroundColor Cyan
Write-Host ""

# Verificar si existe node_modules
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Verificar si existe .env
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  No se encontró archivo .env" -ForegroundColor Yellow
    Write-Host "📋 Copiando .env.example a .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Archivo .env creado. Configura las variables si es necesario." -ForegroundColor Green
    Write-Host ""
}

# Iniciar el servidor
Write-Host "🌐 Iniciando servidor GraphQL en modo desarrollo..." -ForegroundColor Green
npm run dev
