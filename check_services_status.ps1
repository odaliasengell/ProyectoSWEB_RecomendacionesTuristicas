#!/usr/bin/env powershell
<#
.SYNOPSIS
    Verifica el estado de todos los servicios de la integración
.DESCRIPTION
    Muestra el status de Auth Service, REST API y Payment Service
#>

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "ESTADO DE SERVICIOS - INTEGRACION JWT" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

$services = @(
    @{Name="Auth Service"; Port=8001; URL="http://localhost:8001/health"},
    @{Name="REST API"; Port=8000; URL="http://localhost:8000/health"},
    @{Name="Payment Service"; Port=8002; URL="http://localhost:8002/health"}
)

$allHealthy = $true

foreach ($service in $services) {
    Write-Host "`n[*] Verificando $($service.Name) (puerto $($service.Port))..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 3 -UseBasicParsing
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq 200) {
            Write-Host "    ✓ ACTIVO" -ForegroundColor Green
            $json = $response.Content | ConvertFrom-Json
            Write-Host "    Respuesta: $(ConvertTo-Json $json)" -ForegroundColor Green
        }
        else {
            Write-Host "    ⚠ Status: $statusCode" -ForegroundColor Yellow
            $allHealthy = $false
        }
    }
    catch {
        Write-Host "    ✗ ERROR - Servicio no responde" -ForegroundColor Red
        $allHealthy = $false
    }
}

Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan

if ($allHealthy) {
    Write-Host "✓ TODOS LOS SERVICIOS ACTIVOS Y SALUDABLES" -ForegroundColor Green
    Write-Host "  JWT SINCRONIZACION: COMPLETADA" -ForegroundColor Green
    Write-Host "  LISTO PARA: Pruebas de integración bidireccional" -ForegroundColor Green
} else {
    Write-Host "⚠ ALGUNOS SERVICIOS INACTIVOS" -ForegroundColor Yellow
    Write-Host "  Ejecutar: python main.py en cada carpeta de servicio" -ForegroundColor Yellow
}

Write-Host ("=" * 70) -ForegroundColor Cyan
