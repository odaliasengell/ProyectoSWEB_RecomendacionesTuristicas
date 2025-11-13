# 🚀 Guía Rápida - Dashboard en Tiempo Real

## ✨ Características del Dashboard

- **Gráficos Animados**: Las barras suben automáticamente cuando se crean reservas
- **Actualización en Tiempo Real**: Sin necesidad de recargar la página
- **Métricas Visuales**: Tarjetas con estadísticas coloridas
- **Feed de Actividades**: Últimos 10 eventos en vivo
- **Indicador de Conexión**: Muestra si el WebSocket está conectado

## 🎬 Inicio Rápido (3 pasos)

### 1️⃣ Iniciar WebSocket Server
```powershell
cd backend\websocket-server
.\start.ps1
```
Debería ver: `🚀 Servidor WebSocket iniciado en http://localhost:8080`

### 2️⃣ Iniciar Frontend
```powershell
cd frontend\recomendaciones
npm run dev
```
Debería ver: `Local: http://localhost:5173/`

### 3️⃣ Abrir Dashboard
```
http://localhost:5173/dashboard
```

## 🧪 Probar el Dashboard

### Opción A: Script Automático
```powershell
cd backend\websocket-server
.\test_dashboard.ps1
```
Este script envía 12 eventos simulados y verás:
- Las barras del gráfico subiendo
- Los números de las tarjetas incrementándose
- El feed de actividades llenándose

### Opción B: Manual (PowerShell)
```powershell
# Enviar una reserva
Invoke-RestMethod -Uri http://localhost:8080/notify -Method Post -Body '{
  "type": "reserva_creada",
  "message": "Nueva reserva: Tour Machu Picchu",
  "data": {"monto": 350, "tour": "Tour Machu Picchu"}
}' -ContentType "application/json"

# Enviar un servicio
Invoke-RestMethod -Uri http://localhost:8080/notify -Method Post -Body '{
  "type": "servicio_contratado",
  "message": "Servicio: Guía Turístico",
  "data": {"precio": 120, "servicio": "Guía Turístico"}
}' -ContentType "application/json"
```

## 🎨 Lo que Verás

### Gráficos
- **Área Chart (Verde)**: Ingresos acumulados
- **Barras Azules**: Cantidad de reservas
- **Barras Naranjas**: Servicios contratados

### Tarjetas de Estadísticas
1. **Reservas Hoy** (Azul) - Contador de reservas
2. **Ingresos del Mes** (Verde) - Total de ingresos
3. **Usuarios Activos** (Morado) - Usuarios registrados
4. **Servicios Contratados** (Naranja) - Total de servicios
5. **Destinos Populares** (Rosa) - Catálogo de destinos
6. **Actividad en Vivo** (Índigo) - Eventos recientes

### Feed de Actividad
Panel lateral que muestra:
- Icono del tipo de evento
- Mensaje descriptivo
- Hora exacta
- Badge del tipo de evento
- Indicador de "LIVE" parpadeante

## 🔌 Integración Automática

Cuando tu REST API cree una reserva real, el WebSocket se notificará automáticamente gracias a la integración existente en:

```python
# backend/rest-api/app/routes/reserva_routes.py
await notificar_reserva_creada(...)
```

## 📊 Eventos Soportados

| Evento | Efecto en Dashboard |
|--------|-------------------|
| `reserva_creada` | ⬆️ Barra azul sube + Incrementa ingresos |
| `servicio_contratado` | ⬆️ Barra naranja sube + Incrementa ingresos |
| `usuario_registrado` | ⬆️ Incrementa usuarios activos |
| `destino_creado` | ⬆️ Incrementa destinos populares |

## 🎯 Tips

1. **Modo de Pantalla Completa**: Presiona F11 para vista inmersiva
2. **Múltiples Ventanas**: Abre el dashboard en varias pestañas para ver sincronización
3. **Prueba Continua**: Ejecuta `test_dashboard.ps1` varias veces para ver acumulación

## ❓ Problemas Comunes

### "No se conecta al WebSocket"
- ✅ Verificar que el servidor WebSocket esté corriendo en puerto 8080
- ✅ Revisar firewall o antivirus

### "No veo actualizaciones"
- ✅ Verificar el indicador verde "Conectado" en la parte superior
- ✅ Abrir consola del navegador (F12) y buscar errores

### "Los gráficos no se cargan"
- ✅ Asegurarse de que Recharts esté instalado: `npm install recharts`
- ✅ Limpiar caché: `Ctrl + Shift + R`

## 🌟 Próximos Pasos

1. Ver documentación completa en `DASHBOARD_REALTIME.md`
2. Personalizar colores y métricas según tus necesidades
3. Agregar más tipos de eventos
4. Implementar autenticación para el dashboard

## 🎉 ¡Disfruta tu Dashboard en Tiempo Real!

Si tienes preguntas, revisa la documentación completa o el código fuente de los componentes.
