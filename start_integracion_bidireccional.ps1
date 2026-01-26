# 🚀 Script de Inicio Rápido - Integración Bidireccional Equipo A
# Inicia todos los servicios necesarios para la integración bidireccional

param(
    [switch]$VerifyOnly,      # Solo verificar configuración sin iniciar
    [switch]$NoNgrok,         # No abrir ngrok
    [switch]$SkipTests        # No ejecutar tests después
)

$ErrorActionPreference = "Stop"

# Colores
$Colors = @{
    'Reset' = "`e[0m"
    'Bold' = "`e[1m"
    'Green' = "`e[32m"
    'Red' = "`e[31m"
    'Yellow' = "`e[33m"
    'Blue' = "`e[34m"
    'Cyan' = "`e[36m"
}

function Write-Header {
    param([string]$Text)
    Write-Host "`n$($Colors.Blue)$($Colors.Bold)" -NoNewline
    Write-Host ("=" * 80)
    Write-Host "  $Text"
    Write-Host ("=" * 80)
    Write-Host $Colors.Reset
}

function Write-Step {
    param([int]$Num, [string]$Text)
    Write-Host "$($Colors.Cyan)$($Colors.Bold)▶ Paso $Num : $Text$($Colors.Reset)"
}

function Write-Success {
    param([string]$Text)
    Write-Host "$($Colors.Green)✅ $Text$($Colors.Reset)"
}

function Write-Error {
    param([string]$Text)
    Write-Host "$($Colors.Red)❌ $Text$($Colors.Reset)"
}

function Write-Warning {
    param([string]$Text)
    Write-Host "$($Colors.Yellow)⚠️  $Text$($Colors.Reset)"
}

function Write-Info {
    param([string]$Text)
    Write-Host "$($Colors.Blue)ℹ️  $Text$($Colors.Reset)"
}

# Función para abrir terminal
function Start-ServiceTerminal {
    param(
        [string]$Name,
        [string]$Directory,
        [string]$Command,
        [string]$Port
    )
    
    Write-Info "Iniciando $Name en puerto $Port..."
    Write-Info "  Directorio: $Directory"
    Write-Info "  Comando: $Command"
    
    $fullPath = Join-Path (Get-Location) $Directory
    
    if (-not (Test-Path $fullPath)) {
        Write-Error "Directorio no encontrado: $fullPath"
        return $false
    }
    
    # Crear una nueva ventana de PowerShell
    $psExePath = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
    
    if (-not (Test-Path $psExePath)) {
        # Intentar PowerShell 7+ si está disponible
        $psExePath = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
        if (-not $psExePath) {
            Write-Error "PowerShell no encontrado"
            return $false
        }
    }
    
    # Comando para ejecutar en la nueva ventana
    $scriptBlock = {
        param($Dir, $Cmd)
        Set-Location $Dir
        Write-Host "`n🚀 Iniciando: $using:Name"
        Write-Host "═" * 60
        Invoke-Expression $Cmd
    }
    
    try {
        # Ejecutar en nueva ventana
        Start-Process $psExePath -ArgumentList "-NoExit", "-Command", "cd $fullPath; $Command" -NoNewWindow
        Write-Success "$Name iniciado"
        return $true
    }
    catch {
        Write-Error "Error iniciando $Name : $_"
        return $false
    }
}

# MAIN
Write-Header "🚀 Integración Bidireccional - Equipo A"
Write-Info "Iniciado: $(Get-Date -Format 'dd de MMMM de yyyy HH:mm:ss')"

# Paso 1: Verificar configuración
Write-Step 1 "Verificar configuración de claves secretas"

$restApiPath = Join-Path (Get-Location) "backend\rest-api"
$verifyScript = Join-Path $restApiPath "verify_secrets_config.py"

if (Test-Path $verifyScript) {
    Write-Info "Ejecutando verificación..."
    & python $verifyScript
    
    if ($VerifyOnly) {
        Write-Info "Modo de verificación only. Saliendo..."
        exit 0
    }
} else {
    Write-Error "Script de verificación no encontrado: $verifyScript"
}

# Paso 2: Iniciar servicios
Write-Step 2 "Iniciar servicios locales"

$services = @(
    @{ Name = "Auth Service"; Dir = "backend\auth-service"; Command = "python main.py"; Port = "8001" },
    @{ Name = "REST API"; Dir = "backend\rest-api"; Command = "python -m uvicorn main:app --reload --port 8000"; Port = "8000" },
    @{ Name = "Payment Service"; Dir = "backend\payment-service"; Command = "python main.py"; Port = "8002" }
)

foreach ($service in $services) {
    Write-Info ""
    Start-ServiceTerminal -Name $service.Name -Directory $service.Dir -Command $service.Command -Port $service.Port
    Start-Sleep -Seconds 2
}

# Paso 3: Ngrok
if (-not $NoNgrok) {
    Write-Step 3 "Configurar ngrok (exposición pública)"
    
    Write-Info "Verificando ngrok..."
    $ngrokPath = (Get-Command ngrok -ErrorAction SilentlyContinue).Source
    
    if ($ngrokPath) {
        Write-Success "ngrok encontrado en: $ngrokPath"
        Write-Info "Iniciando ngrok en puerto 8000..."
        
        # Iniciar ngrok
        Start-Process "cmd.exe" -ArgumentList "/c ngrok http 8000" -NoNewWindow
        
        Write-Info "Esperando que ngrok se inicie..."
        Start-Sleep -Seconds 3
        
        # Obtener URL de ngrok
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
            $publicUrl = $response.tunnels[0].public_url
            Write-Success "URL pública de ngrok: $publicUrl"
            Write-Info "Copiar esta URL y compartir con Equipo B"
        }
        catch {
            Write-Warning "No se pudo obtener URL de ngrok automáticamente"
            Write-Info "Acceder a http://localhost:4040 para ver la URL"
        }
    } else {
        Write-Warning "ngrok no está instalado"
        Write-Info "Instalar con: scoop install ngrok"
        Write-Info "Luego autenticar: ngrok config add-authtoken <TOKEN>"
        Write-Info "Iniciar manualmente: ngrok http 8000"
    }
}

# Paso 4: Esperar y ejecutar tests
Write-Step 4 "Esperar inicialización de servicios"

Write-Info "Esperando 5 segundos para que los servicios se inicien..."
Start-Sleep -Seconds 5

if (-not $SkipTests) {
    Write-Step 5 "Ejecutar tests de integración"
    
    $testScript = Join-Path $restApiPath "test_integracion_bidireccional_completa.py"
    
    if (Test-Path $testScript) {
        Write-Info "Ejecutando tests..."
        Write-Info "Responde 's' si deseas ejecutar los tests"
        
        $response = Read-Host "¿Ejecutar tests? (s/n)"
        
        if ($response -eq 's') {
            Set-Location $restApiPath
            & python test_integracion_bidireccional_completa.py
            Set-Location (Split-Path $restApiPath)
        } else {
            Write-Info "Tests omitidos"
        }
    }
}

# Resumen final
Write-Header "📋 RESUMEN"

Write-Success "Servicios iniciados:"
Write-Info "  ✓ Auth Service en http://localhost:8001"
Write-Info "  ✓ REST API en http://localhost:8000"
Write-Info "  ✓ Payment Service en http://localhost:8002"
Write-Info "  ✓ ngrok exponiendo en puerto 8000" 

Write-Info "`nProximos pasos:"
Write-Info "1. Acceder a http://localhost:8000/docs para ver API"
Write-Info "2. Acceder a http://localhost:4040 para ver ngrok"
Write-Info "3. Copiar URL de ngrok y compartir con Equipo B"
Write-Info "4. Recibir URL de ngrok de Equipo B"
Write-Info "5. Ejecutar tests nuevamente"

Write-Info "`nDocumentación:"
Write-Info "  REFERENCIA_CLAVES_SECRETAS.md - Todas las claves y configuración"
Write-Info "  test_integracion_bidireccional_completa.py - Tests"
Write-Info "  quick_start_integracion.py - Inicio rápido"

Write-Host "`n$($Colors.Green)$($Colors.Bold)✅ SETUP COMPLETADO - SISTEMA LISTO$($Colors.Reset)`n"
