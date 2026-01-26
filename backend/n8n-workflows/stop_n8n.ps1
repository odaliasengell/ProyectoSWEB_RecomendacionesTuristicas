# Script PowerShell para parar n8n
# Equipo A - ULEAM

Write-Host "🛑 Deteniendo n8n..." -ForegroundColor Yellow

# Parar y remover contenedor
docker stop n8n-dev-turismo
docker rm n8n-dev-turismo

# Limpiar red si existe
docker network rm n8n-workflows_default 2>$null

Write-Host "✅ n8n detenido correctamente" -ForegroundColor Green