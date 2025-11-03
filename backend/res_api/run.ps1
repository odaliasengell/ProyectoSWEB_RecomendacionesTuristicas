<#
Run script for res_api (PowerShell)
Usage:
  .\run.ps1           # create venv if missing, install deps, run with DB if available
  .\run.ps1 -SkipDb   # run with SKIP_DB_INIT=true (start without Mongo)
#>
param(
    [switch]$SkipDb,
    [int]$Port = 8001
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-Not (Test-Path -Path ".venv")) {
    Write-Host "Creando entorno virtual .venv..."
    python -m venv .venv
}

Write-Host "Activando entorno virtual..."
. .\.venv\Scripts\Activate.ps1

Write-Host "Instalando dependencias (requirements.txt)..."
pip install -r .\requirements.txt

if ($SkipDb) {
    Write-Host 'SKIP_DB_INIT activado - el servidor saltará la inicialización de Mongo/Beanie'
    $env:SKIP_DB_INIT = 'true'
} else {
    Remove-Item Env:\SKIP_DB_INIT -ErrorAction SilentlyContinue
}
Write-Host ("Arrancando uvicorn en http://127.0.0.1:{0} ..." -f $Port)
python -m uvicorn main:app --reload --host 127.0.0.1 --port $Port
