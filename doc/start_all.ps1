# Script Simple para Iniciar Todos los Servicios
# Ejecutar: .\start_all.ps1

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       Iniciando Sistema de Turismo - 9 Servicios" -ForegroundColor Cyan  
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = "C:\Users\DESKTOP\ProyectoSWEB_RecomendacionesTuristicas"

# 1. REST API
Write-Host "1. Iniciando REST API (Puerto 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\backend\rest-api'; python main.py"
Start-Sleep -Seconds 5

# 2. Auth Service
Write-Host "2. Iniciando Auth Service (Puerto 8001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\backend\auth-service'; python main.py"
Start-Sleep -Seconds 3

# 3. Payment Service
Write-Host "3. Iniciando Payment Service (Puerto 8002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\backend\payment-service'; python main.py"
Start-Sleep -Seconds 3

# 4. MCP Server
Write-Host "4. Iniciando MCP Server (Puerto 8005)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\backend\mcp-server'; python main.py"
Start-Sleep -Seconds 3

# 5. AI Orchestrator
Write-Host "5. Iniciando AI Orchestrator (Puerto 8004)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\backend\ai-orchestrator'; python main.py"
Start-Sleep -Seconds 3

# 6. GraphQL Service
Write-Host "6. Iniciando GraphQL Service (Puerto 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\backend\graphql-service'; npm start"
Start-Sleep -Seconds 5

# 7. WebSocket Server  
Write-Host "7. Iniciando WebSocket Server (Puerto 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\backend\websocket-server'; go run ."
Start-Sleep -Seconds 3

# 8. n8n Workflows
Write-Host "8. Iniciando n8n Workflows (Puerto 5678)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "$rootPath\backend\n8n-workflows\start.ps1"
Start-Sleep -Seconds 5

# 9. Frontend
Write-Host "9. Iniciando Frontend (Puerto 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\frontend\recomendaciones'; npm run dev"
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "TODOS LOS 9 SERVICIOS INICIADOS" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs de Acceso:" -ForegroundColor Cyan
Write-Host "   Frontend:        http://localhost:5173" -ForegroundColor White
Write-Host "   REST API:        http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Auth Service:    http://localhost:8001/docs" -ForegroundColor White
Write-Host "   Payment Service: http://localhost:8002/docs" -ForegroundColor White
Write-Host "   AI Orchestrator: http://localhost:8004/docs" -ForegroundColor White
Write-Host "   MCP Server:      http://localhost:8005/docs" -ForegroundColor White
Write-Host "   GraphQL:         http://localhost:4000/graphql" -ForegroundColor White
Write-Host "   WebSocket:       http://localhost:8080" -ForegroundColor White
Write-Host "   n8n Workflows:   http://localhost:5678" -ForegroundColor White
Write-Host ""
Write-Host "Cada servicio se abrio en una nueva ventana" -ForegroundColor Yellow
Write-Host "Cierra cada ventana para detener el servicio correspondiente" -ForegroundColor Yellow
Write-Host ""
Write-Host "Sistema listo para usar!" -ForegroundColor Green
Write-Host ""
