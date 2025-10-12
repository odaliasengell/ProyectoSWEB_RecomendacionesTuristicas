# Pruebas del WebSocket con TypeScript

Este documento explica cómo ejecutar pruebas del servidor WebSocket desde el proyecto TypeScript.

## 📋 Requisitos Previos

1. **Servidor WebSocket corriendo**:
   ```powershell
   cd 'C:\Users\DESKTOP\ProyectoSWEB_RecomendacionesTuristicas\backend\websocket-server'
   npm install
   npm run dev
   ```
   El servidor debe estar escuchando en `http://localhost:8081`

2. **Dependencias instaladas**:
   ```powershell
   cd 'C:\Users\DESKTOP\ProyectoSWEB_RecomendacionesTuristicas\backend\typescritp-tour-reversa-guia'
   npm install
   ```

## 🧪 Ejecutar Pruebas

### Opción 1: Script de Pruebas Completo (test-websocket.ts)

Este script prueba todas las funcionalidades del WebSocket:
- Conexión Socket.IO
- Unirse/abandonar salas
- Ping/Pong
- Estado del servidor
- Envío de eventos vía REST `/notify`
- Recepción de eventos en tiempo real

```powershell
cd 'C:\Users\DESKTOP\ProyectoSWEB_RecomendacionesTuristicas\backend\typescritp-tour-reversa-guia'
npx ts-node test-websocket.ts
```

**Salida esperada**:
```
🚀 Iniciando pruebas del WebSocket Server
✅ Conectado con socket ID: xxx
📥 Se unió a sala: dashboard
📊 Estado del servidor: { total_connections: 1, rooms: { dashboard: 1 } }
🏓 Pong recibido
🎉 EVENTO: nueva_reserva recibido
🎉 EVENTO: tour_actualizado recibido
🎉 EVENTO: guia_disponible recibido
🎉 EVENTO: notificacion recibido
📊 RESUMEN: 4 eventos recibidos
✅ Pruebas completadas exitosamente
```

### Opción 2: Usar el Cliente WebSocket desde tu código

El proyecto ya tiene un cliente HTTP en `src/utils/ws-client.ts` para enviar notificaciones vía REST:

```typescript
import { wsClient } from './utils/ws-client';

// Enviar evento de nueva reserva
await wsClient.notifyNuevaReserva({
  id_reserva: 100,
  tour_nombre: 'Tour Galápagos',
  usuario_nombre: 'Juan Pérez',
  cantidad_personas: 2,
  precio_total: 500.00
});

// Enviar evento genérico
await wsClient.notify('custom_event', { data: 'test' }, 'dashboard');
```

### Opción 3: Pruebas desde PowerShell (sin TypeScript)

**Health Check**:
```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:8081/health | ConvertTo-Json
```

**Enviar evento de prueba**:
```powershell
$body = @{
  event = 'nueva_reserva'
  data  = @{
    id_reserva = 100
    tour_nombre = 'Tour Galápagos'
    usuario_nombre = 'Juan Pérez'
  }
  room = 'dashboard'
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method Post -Uri http://localhost:8081/notify -Body $body -ContentType 'application/json'
```

**Verificar puerto en uso**:
```powershell
netstat -ano | Select-String ":8081"
```

**Listar procesos Node**:
```powershell
tasklist /fi "imagename eq node.exe"
```

## 📡 Eventos Soportados

| Evento | Sala | Descripción |
|--------|------|-------------|
| `nueva_reserva` | `dashboard` | Nueva reserva creada |
| `reserva_actualizada` | `dashboard` | Reserva modificada |
| `tour_actualizado` | `dashboard` | Tour creado/modificado |
| `guia_disponible` | `dashboard` | Guía cambió disponibilidad |
| `nuevo_usuario` | `dashboard` | Nuevo usuario registrado |
| `nuevo_destino` | `dashboard` | Nuevo destino agregado |
| `servicio_contratado` | `dashboard` | Servicio contratado |
| `notificacion` | (todos) | Notificación general |

## 🏠 Salas (Rooms)

- `dashboard`: Eventos para el dashboard
- `admin`: Eventos solo para administradores
- `user_{id}`: Eventos específicos de un usuario

## 🔧 Solución de Problemas

### El servidor no responde

1. Verificar que está corriendo:
   ```powershell
   netstat -ano | Select-String ":8081"
   ```

2. Ver logs del servidor:
   ```powershell
   cd 'C:\Users\DESKTOP\ProyectoSWEB_RecomendacionesTuristicas\backend\websocket-server'
   Get-Content ws.log -Tail 50
   ```

3. Reiniciar el servidor:
   ```powershell
   # Matar procesos node
   taskkill /F /IM node.exe
   
   # Reiniciar
   npm run dev
   ```

### Errores de CORS

Verifica el `.env` del servidor WebSocket:
```env
CORS_ORIGIN=http://localhost:5173
```

### No se reciben eventos

1. Verifica que estás conectado a la sala correcta:
   ```javascript
   socket.emit('join_room', 'dashboard');
   ```

2. Confirma que el evento se está enviando a la sala correcta en `/notify`:
   ```json
   {
     "event": "nueva_reserva",
     "data": { ... },
     "room": "dashboard"
   }
   ```

3. Revisa los logs del servidor para ver si el evento se está emitiendo.

## 🎯 Próximos Pasos

- Integrar el cliente Socket.IO en el frontend (`frontend/recomendaciones`)
- Implementar autenticación en las conexiones WebSocket
- Agregar más eventos específicos del negocio
- Crear tests unitarios con Jest para el servidor WebSocket
- Implementar reconexión automática en caso de desconexión

## 📚 Referencias

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- README del servidor: `backend/websocket-server/README.md`
