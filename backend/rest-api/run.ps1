<#
Run script for res_api (PowerShell)
Usage:
  .\run.ps1           # usa el venv del proyecto raíz
  .\run.ps1 -SkipDb   # run with SKIP_DB_INIT=true (start without Mongo)
#>
param(
    [switch]$SkipDb,
    [int]$Port = 8000
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# Usar el entorno virtual del proyecto raíz
$projectRoot = Split-Path -Parent (Split-Path -Parent $root)
$venvPath = Join-Path $projectRoot ".venv"

if (-Not (Test-Path -Path $venvPath)) {
    Write-Host "Error: No se encontró el entorno virtual en $venvPath"
    Write-Host "Por favor, crea el entorno virtual en la raíz del proyecto primero."
    exit 1
}

Write-Host "Usando entorno virtual del proyecto..."
$pythonExe = Join-Path $venvPath "Scripts\python.exe"

Write-Host "Instalando dependencias (requirements.txt)..."
& $pythonExe -m pip install -r .\requirements.txt

if ($SkipDb) {
    Write-Host 'SKIP_DB_INIT activado - el servidor saltará la inicialización de Mongo/Beanie'
    $env:SKIP_DB_INIT = 'true'
} else {
    Remove-Item Env:\SKIP_DB_INIT -ErrorAction SilentlyContinue
}
Write-Host ("Arrancando uvicorn en http://127.0.0.1:{0} ..." -f $Port)
& $pythonExe -m uvicorn main:app --reload --host 127.0.0.1 --port $Port
