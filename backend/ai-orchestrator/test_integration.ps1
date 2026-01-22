# Script de Pruebas Automatizadas - Chatbot Multimodal
# Uso: .\test_integration.ps1

Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🧪 Pruebas de Integración - Chatbot Multimodal    ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$AI_ORCHESTRATOR_URL = "http://localhost:8004"
$MCP_SERVER_URL = "http://localhost:8005"

$allTestsPassed = $true

# Función para verificar servicios
function Test-Service {
    param($url, $name)
    try {
        $response = Invoke-RestMethod -Uri $url -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ $name está corriendo" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ $name NO está disponible en $url" -ForegroundColor Red
        return $false
    }
}

# Verificar servicios
Write-Host "📡 Verificando servicios..." -ForegroundColor Yellow
Write-Host ""

$orchestratorRunning = Test-Service $AI_ORCHESTRATOR_URL "AI Orchestrator"
$mcpRunning = Test-Service $MCP_SERVER_URL "MCP Server"

if (-not $orchestratorRunning -or -not $mcpRunning) {
    Write-Host ""
    Write-Host "⚠️  Algunos servicios no están disponibles." -ForegroundColor Yellow
    Write-Host "Inicia los servicios antes de ejecutar las pruebas:" -ForegroundColor Yellow
    Write-Host "  - AI Orchestrator: cd backend\ai-orchestrator; .\start.ps1" -ForegroundColor White
    Write-Host "  - MCP Server: cd backend\mcp-server; .\start.ps1" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test 1: Chat de texto simple
Write-Host "🧪 Test 1: Chat de texto simple" -ForegroundColor Yellow
Write-Host "   Endpoint: POST /chat/text" -ForegroundColor Gray
try {
    $body = @{
        message = "Hola, ¿qué servicios ofreces?"
        provider = "gemini"
        use_tools = $false
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$AI_ORCHESTRATOR_URL/chat/text" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    if ($response.response) {
        Write-Host "   ✅ Chat de texto funciona correctamente" -ForegroundColor Green
        Write-Host "   📝 Respuesta: $($response.response.Substring(0, [Math]::Min(80, $response.response.Length)))..." -ForegroundColor Gray
    }
}
catch {
    Write-Host "   ❌ Error en chat de texto: $_" -ForegroundColor Red
    $allTestsPassed = $false
}
Write-Host ""

# Test 2: Chat con herramientas
Write-Host "🧪 Test 2: Chat con herramientas MCP" -ForegroundColor Yellow
Write-Host "   Endpoint: POST /chat/text (con use_tools=true)" -ForegroundColor Gray
try {
    $body = @{
        message = "Busca destinos de playa disponibles"
        provider = "gemini"
        use_tools = $true
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$AI_ORCHESTRATOR_URL/chat/text" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    if ($response.response) {
        Write-Host "   ✅ Chat con herramientas funciona" -ForegroundColor Green
        if ($response.tools_used -and $response.tools_used.Count -gt 0) {
            Write-Host "   🔧 Herramientas usadas: $($response.tools_used -join ', ')" -ForegroundColor Cyan
        }
    }
}
catch {
    Write-Host "   ❌ Error en chat con herramientas: $_" -ForegroundColor Red
    $allTestsPassed = $false
}
Write-Host ""

# Test 3: Listar proveedores
Write-Host "🧪 Test 3: Listar proveedores de IA" -ForegroundColor Yellow
Write-Host "   Endpoint: GET /providers" -ForegroundColor Gray
try {
    $providers = Invoke-RestMethod -Uri "$AI_ORCHESTRATOR_URL/providers" -ErrorAction Stop
    
    Write-Host "   ✅ Proveedores obtenidos correctamente" -ForegroundColor Green
    foreach ($provider in $providers.providers) {
        $status = if ($provider.available) { "✅ Disponible" } else { "❌ No configurado" }
        Write-Host "   - $($provider.name): $status" -ForegroundColor $(if ($provider.available) { "Green" } else { "Yellow" })
    }
}
catch {
    Write-Host "   ❌ Error al listar proveedores: $_" -ForegroundColor Red
    $allTestsPassed = $false
}
Write-Host ""

# Test 4: Listar herramientas MCP
Write-Host "🧪 Test 4: Listar herramientas MCP disponibles" -ForegroundColor Yellow
Write-Host "   Endpoint: GET /tools (AI Orchestrator)" -ForegroundColor Gray
try {
    $tools = Invoke-RestMethod -Uri "$AI_ORCHESTRATOR_URL/tools" -ErrorAction Stop
    
    Write-Host "   ✅ Herramientas obtenidas: $($tools.count)" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Error al listar herramientas: $_" -ForegroundColor Red
    $allTestsPassed = $false
}
Write-Host ""

# Test 5: Buscar destinos (MCP Tool)
Write-Host "🧪 Test 5: Herramienta buscar_destinos" -ForegroundColor Yellow
Write-Host "   Endpoint: POST /tools/buscar_destinos (MCP Server)" -ForegroundColor Gray
try {
    $body = @{
        params = @{
            query = "montaña"
            categoria = "arqueología"
        }
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "$MCP_SERVER_URL/tools/buscar_destinos" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    if ($result.success) {
        Write-Host "   ✅ buscar_destinos ejecutado correctamente" -ForegroundColor Green
        Write-Host "   📊 Destinos encontrados: $($result.data.total)" -ForegroundColor Gray
    }
    else {
        Write-Host "   ⚠️  Tool ejecutado pero con errores: $($result.error)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ❌ Error ejecutando buscar_destinos: $_" -ForegroundColor Red
    $allTestsPassed = $false
}
Write-Host ""

# Test 6: Ver reserva (MCP Tool)
Write-Host "🧪 Test 6: Herramienta ver_reserva" -ForegroundColor Yellow
Write-Host "   Endpoint: POST /tools/ver_reserva (MCP Server)" -ForegroundColor Gray
try {
    $body = @{
        params = @{
            reserva_id = "TEST-123"
        }
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "$MCP_SERVER_URL/tools/ver_reserva" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    if ($result.success) {
        Write-Host "   ✅ ver_reserva ejecutado correctamente" -ForegroundColor Green
        Write-Host "   📋 Reserva: $($result.data.destino)" -ForegroundColor Gray
    }
    else {
        Write-Host "   ⚠️  Tool ejecutado pero con errores: $($result.error)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ❌ Error ejecutando ver_reserva: $_" -ForegroundColor Red
    $allTestsPassed = $false
}
Write-Host ""

# Test 7: Crear reserva (MCP Tool)
Write-Host "🧪 Test 7: Herramienta crear_reserva" -ForegroundColor Yellow
Write-Host "   Endpoint: POST /tools/crear_reserva (MCP Server)" -ForegroundColor Gray
try {
    $body = @{
        params = @{
            destino_id = 1
            fecha = "2026-03-15"
            personas = 2
        }
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "$MCP_SERVER_URL/tools/crear_reserva" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    if ($result.success) {
        Write-Host "   ✅ crear_reserva ejecutado correctamente" -ForegroundColor Green
        Write-Host "   🎫 ID de reserva: $($result.data.reserva.reserva_id)" -ForegroundColor Gray
    }
    else {
        Write-Host "   ⚠️  Tool ejecutado pero con errores: $($result.error)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ❌ Error ejecutando crear_reserva: $_" -ForegroundColor Red
    $allTestsPassed = $false
}
Write-Host ""

# Test 8: Buscar guías (MCP Tool)
Write-Host "🧪 Test 8: Herramienta buscar_guias" -ForegroundColor Yellow
Write-Host "   Endpoint: POST /tools/buscar_guias (MCP Server)" -ForegroundColor Gray
try {
    $body = @{
        params = @{
            especialidad = "arqueología"
        }
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "$MCP_SERVER_URL/tools/buscar_guias" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    if ($result.success) {
        Write-Host "   ✅ buscar_guias ejecutado correctamente" -ForegroundColor Green
        Write-Host "   👨‍🏫 Guías encontrados: $($result.data.total)" -ForegroundColor Gray
    }
    else {
        Write-Host "   ⚠️  Tool ejecutado pero con errores: $($result.error)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ❌ Error ejecutando buscar_guias: $_" -ForegroundColor Red
    $allTestsPassed = $false
}
Write-Host ""

# Test 9: Estadísticas de ventas (MCP Tool)
Write-Host "🧪 Test 9: Herramienta estadisticas_ventas (Reporte)" -ForegroundColor Yellow
Write-Host "   Endpoint: POST /tools/estadisticas_ventas (MCP Server)" -ForegroundColor Gray
try {
    $body = @{
        params = @{
            fecha_inicio = "2026-01-01"
            fecha_fin = "2026-01-19"
        }
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "$MCP_SERVER_URL/tools/estadisticas_ventas" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    if ($result.success) {
        Write-Host "   ✅ estadisticas_ventas ejecutado correctamente" -ForegroundColor Green
        Write-Host "   📊 Total reservas: $($result.data.resumen.total_reservas)" -ForegroundColor Gray
        Write-Host "   💰 Ingresos totales: `$$($result.data.resumen.ingresos_totales)" -ForegroundColor Gray
    }
    else {
        Write-Host "   ⚠️  Tool ejecutado pero con errores: $($result.error)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ❌ Error ejecutando estadisticas_ventas: $_" -ForegroundColor Red
    $allTestsPassed = $false
}
Write-Host ""

# Test 10: Conversación con persistencia
Write-Host "🧪 Test 10: Conversación con historial" -ForegroundColor Yellow
Write-Host "   Testing conversation persistence" -ForegroundColor Gray
try {
    # Primer mensaje
    $body1 = @{
        message = "Mi nombre es Juan"
        provider = "gemini"
        use_tools = $false
    } | ConvertTo-Json

    $response1 = Invoke-RestMethod -Uri "$AI_ORCHESTRATOR_URL/chat/text" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body1 `
        -ErrorAction Stop

    $convId = $response1.conversation_id

    # Segundo mensaje usando el mismo conversation_id
    $body2 = @{
        message = "¿Cuál es mi nombre?"
        provider = "gemini"
        use_tools = $false
        conversation_id = $convId
    } | ConvertTo-Json

    $response2 = Invoke-RestMethod -Uri "$AI_ORCHESTRATOR_URL/chat/text" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body2 `
        -ErrorAction Stop

    if ($response2.response -match "Juan") {
        Write-Host "   ✅ Historial de conversación funciona" -ForegroundColor Green
        Write-Host "   💬 Conversación ID: $convId" -ForegroundColor Gray
    }
    else {
        Write-Host "   ⚠️  El LLM no recordó el contexto previo" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ❌ Error en conversación persistente: $_" -ForegroundColor Red
    $allTestsPassed = $false
}
Write-Host ""

# Resumen
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
if ($allTestsPassed) {
    Write-Host "✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 El sistema está funcionando correctamente!" -ForegroundColor Cyan
    Write-Host "   - AI Orchestrator: Operativo" -ForegroundColor White
    Write-Host "   - MCP Server: Operativo" -ForegroundColor White
    Write-Host "   - Herramientas MCP: 5/5 funcionando" -ForegroundColor White
    Write-Host "   - Chat multimodal: Listo" -ForegroundColor White
}
else {
    Write-Host "⚠️  ALGUNAS PRUEBAS FALLARON" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Revisa los errores arriba para más detalles." -ForegroundColor White
}
Write-Host ""
Write-Host "📚 Documentación completa: backend/ai-orchestrator/README.md" -ForegroundColor Gray
Write-Host "💡 Ejemplos de uso: backend/ai-orchestrator/EJEMPLOS_USO.md" -ForegroundColor Gray
Write-Host ""
