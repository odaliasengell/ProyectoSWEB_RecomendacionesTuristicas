# Script de Prueba del Dashboard en Tiempo Real
# Envía múltiples eventos al WebSocket para simular actividad

Write-Host "🚀 Script de Prueba - Dashboard en Tiempo Real" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

$websocketUrl = "http://localhost:8080/notify"

# Función para enviar evento
function Send-Event {
    param(
        [string]$Type,
        [string]$Message,
        [hashtable]$Data
    )
    
    $body = @{
        type = $Type
        message = $Message
        data = $Data
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri $websocketUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "✅ Enviado: $Message" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al enviar: $Message" -ForegroundColor Red
        Write-Host "   $_" -ForegroundColor DarkRed
    }
    
    Start-Sleep -Milliseconds 1500
}

Write-Host "`n📊 Enviando eventos de prueba..." -ForegroundColor Yellow
Write-Host ""

# 1. Reserva de Tour
Send-Event -Type "reserva_creada" -Message "Nueva reserva: Tour Machu Picchu" -Data @{
    monto = 350
    tour = "Tour Machu Picchu"
    usuario = "Carlos Mendoza"
    fecha = "2025-12-15"
    personas = 2
}

# 2. Contratación de Servicio
Send-Event -Type "servicio_contratado" -Message "Servicio contratado: Transporte Aeropuerto" -Data @{
    precio = 80
    servicio = "Transporte Aeropuerto"
    usuario = "Ana López"
}

# 3. Nuevo Usuario
Send-Event -Type "usuario_registrado" -Message "Nuevo usuario registrado: maria@email.com" -Data @{
    nombre = "María García"
    email = "maria@email.com"
    usuario_id = "123"
}

# 4. Otra Reserva
Send-Event -Type "reserva_creada" -Message "Nueva reserva: Tour Amazónico" -Data @{
    monto = 450
    tour = "Tour Amazónico"
    usuario = "Pedro Ramírez"
    fecha = "2025-12-20"
    personas = 4
}

# 5. Otro Servicio
Send-Event -Type "servicio_contratado" -Message "Servicio contratado: Guía Turístico Premium" -Data @{
    precio = 150
    servicio = "Guía Turístico Premium"
    usuario = "Laura Fernández"
}

# 6. Nuevo Destino
Send-Event -Type "destino_creado" -Message "Nuevo destino agregado: Islas Galápagos" -Data @{
    destino_id = "15"
    nombre = "Islas Galápagos"
    pais = "Ecuador"
}

# 7. Más Reservas
Send-Event -Type "reserva_creada" -Message "Nueva reserva: City Tour Lima" -Data @{
    monto = 120
    tour = "City Tour Lima"
    usuario = "José Herrera"
    fecha = "2025-12-10"
    personas = 2
}

Send-Event -Type "reserva_creada" -Message "Nueva reserva: Tour Gastronómico" -Data @{
    monto = 200
    tour = "Tour Gastronómico"
    usuario = "Sofia Vargas"
    fecha = "2025-12-18"
    personas = 2
}

# 8. Servicio adicional
Send-Event -Type "servicio_contratado" -Message "Servicio contratado: Fotografía Profesional" -Data @{
    precio = 180
    servicio = "Fotografía Profesional"
    usuario = "Miguel Sánchez"
}

# 9. Más Usuarios
Send-Event -Type "usuario_registrado" -Message "Nuevo usuario registrado: juan@email.com" -Data @{
    nombre = "Juan Torres"
    email = "juan@email.com"
    usuario_id = "124"
}

# 10. Tour creado
Send-Event -Type "tour_creado" -Message "Nuevo tour creado: Aventura en Los Andes" -Data @{
    tour_id = "50"
    nombre = "Aventura en Los Andes"
    precio = 500
    duracion = "3 días"
}

# 11. Más actividad
Send-Event -Type "reserva_creada" -Message "Nueva reserva: Tour Valle Sagrado" -Data @{
    monto = 280
    tour = "Tour Valle Sagrado"
    usuario = "Carmen Díaz"
    fecha = "2025-12-22"
    personas = 3
}

Send-Event -Type "servicio_contratado" -Message "Servicio contratado: Alquiler de Equipos" -Data @{
    precio = 60
    servicio = "Alquiler de Equipos"
    usuario = "Roberto Pérez"
}

Write-Host "`n✨ ¡Prueba completada!" -ForegroundColor Cyan
Write-Host "📊 Revisa el dashboard en: http://localhost:8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Tip: Las barras del gráfico deberían estar subiendo" -ForegroundColor Green
Write-Host "    y el feed de actividades se actualiza en tiempo real" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 Para ejecutar el script de nuevo: .\test_dashboard.ps1" -ForegroundColor Cyan
Write-Host ""
