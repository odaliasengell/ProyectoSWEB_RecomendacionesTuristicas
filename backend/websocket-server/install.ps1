# ⚡ Script de Instalación y Configuración Automática
# WebSocket Server - Sistema de Turismo

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🚀 INSTALACIÓN WEBSOCKET SERVER - GOLANG" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Función para mostrar mensajes con iconos
function Show-Message {
    param(
        [string]$Message,
        [string]$Type = "info"
    )
    
    switch ($Type) {
        "success" { Write-Host "✅ $Message" -ForegroundColor Green }
        "error"   { Write-Host "❌ $Message" -ForegroundColor Red }
        "warning" { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
        "info"    { Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
        "step"    { Write-Host "📌 $Message" -ForegroundColor Magenta }
    }
}

# Paso 1: Verificar Go
Show-Message "Verificando instalación de Go..." "step"

if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    Show-Message "Go no está instalado" "error"
    Show-Message "Por favor instala Go desde: https://golang.org/dl/" "warning"
    Write-Host ""
    Write-Host "Pasos para instalar Go:" -ForegroundColor Yellow
    Write-Host "1. Visita https://golang.org/dl/"
    Write-Host "2. Descarga el instalador para Windows"
    Write-Host "3. Ejecuta el instalador"
    Write-Host "4. Reinicia PowerShell"
    Write-Host "5. Vuelve a ejecutar este script"
    Write-Host ""
    pause
    exit 1
}

$goVersion = go version
Show-Message "$goVersion" "success"
Write-Host ""

# Paso 2: Verificar módulos
Show-Message "Verificando módulos de Go..." "step"

if (Test-Path "go.mod") {
    Show-Message "go.mod encontrado" "success"
} else {
    Show-Message "go.mod no encontrado" "error"
    exit 1
}

Write-Host ""

# Paso 3: Descargar dependencias
Show-Message "Descargando dependencias..." "step"

try {
    go mod download
    Show-Message "Dependencias descargadas correctamente" "success"
} catch {
    Show-Message "Error al descargar dependencias: $_" "error"
    exit 1
}

Write-Host ""

# Paso 4: Compilar (opcional)
Show-Message "¿Deseas compilar el servidor? (s/n)" "info"
$compile = Read-Host

if ($compile -eq "s" -or $compile -eq "S") {
    Show-Message "Compilando servidor..." "step"
    
    try {
        go build -o websocket-server.exe
        Show-Message "Servidor compilado exitosamente: websocket-server.exe" "success"
    } catch {
        Show-Message "Error al compilar: $_" "error"
    }
}

Write-Host ""

# Paso 5: Verificar archivos importantes
Show-Message "Verificando archivos del proyecto..." "step"

$archivos = @(
    "main.go",
    "hub.go",
    "client.go",
    "events.go",
    "websocket_client.py",
    "README.md"
)

$todosExisten = $true
foreach ($archivo in $archivos) {
    if (Test-Path $archivo) {
        Show-Message "$archivo ✓" "success"
    } else {
        Show-Message "$archivo ✗ (no encontrado)" "error"
        $todosExisten = $false
    }
}

Write-Host ""

if (-not $todosExisten) {
    Show-Message "Algunos archivos no se encontraron" "warning"
    Show-Message "Verifica que estés en el directorio correcto" "info"
}

# Paso 6: Mostrar información
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ INSTALACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Show-Message "INFORMACIÓN DEL SERVIDOR:" "info"
Write-Host "  • Lenguaje: Go (Golang)" -ForegroundColor White
Write-Host "  • Puerto: 8080" -ForegroundColor White
Write-Host "  • WebSocket: ws://localhost:8080/ws" -ForegroundColor White
Write-Host "  • Notificaciones: http://localhost:8080/notify" -ForegroundColor White
Write-Host "  • Interfaz web: http://localhost:8080/" -ForegroundColor White
Write-Host ""

Show-Message "PRÓXIMOS PASOS:" "step"
Write-Host ""
Write-Host "  1️⃣  Iniciar el servidor:" -ForegroundColor Yellow
Write-Host "      .\start.ps1" -ForegroundColor White
Write-Host "      o" -ForegroundColor Gray
Write-Host "      go run ." -ForegroundColor White
Write-Host ""
Write-Host "  2️⃣  Probar en el navegador:" -ForegroundColor Yellow
Write-Host "      http://localhost:8080/" -ForegroundColor White
Write-Host ""
Write-Host "  3️⃣  Integrar con tu backend:" -ForegroundColor Yellow
Write-Host "      Ver: EJEMPLOS_INTEGRACION.md" -ForegroundColor White
Write-Host ""
Write-Host "  4️⃣  Ejecutar pruebas:" -ForegroundColor Yellow
Write-Host "      python test_websocket.py" -ForegroundColor White
Write-Host ""

Show-Message "DOCUMENTACIÓN:" "info"
Write-Host "  📖 README.md - Documentación completa" -ForegroundColor White
Write-Host "  🚀 QUICK_START.md - Guía rápida" -ForegroundColor White
Write-Host "  🏗️  ARQUITECTURA.md - Arquitectura del sistema" -ForegroundColor White
Write-Host "  💡 EJEMPLOS_INTEGRACION.md - Ejemplos de código" -ForegroundColor White
Write-Host ""

# Paso 7: Preguntar si quiere iniciar
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Show-Message "¿Deseas iniciar el servidor ahora? (s/n)" "info"
$iniciar = Read-Host

if ($iniciar -eq "s" -or $iniciar -eq "S") {
    Write-Host ""
    Show-Message "Iniciando servidor WebSocket..." "step"
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host ""
    
    # Iniciar el servidor
    go run .
} else {
    Write-Host ""
    Show-Message "Para iniciar el servidor más tarde, ejecuta:" "info"
    Write-Host "  .\start.ps1" -ForegroundColor White
    Write-Host ""
    Show-Message "¡Hasta luego! 👋" "success"
    Write-Host ""
}
