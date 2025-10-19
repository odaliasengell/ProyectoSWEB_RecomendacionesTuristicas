# WebSocket Server - Sistema de Notificaciones en Tiempo Real

Servidor WebSocket usando **Socket.io** y **Node.js/TypeScript** para transmitir eventos en tiempo real al frontend.

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

## ⚙️ Configuración

Editar `.env`:

```env
PORT=8081
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 🏃 Ejecutar

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📡 Uso

### Desde los REST APIs (Notificar eventos):

```bash
POST http://localhost:8081/notify
Content-Type: application/json

{
  "event": "nueva_reserva",
  "data": {
    "id_reserva": 100,
    "tour_nombre": "Tour Galápagos",
    "usuario_nombre": "Juan Pérez"
  },
  "room": "dashboard"
}
```

### Desde el Frontend (Escuchar eventos):

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8081');

// Unirse a la sala dashboard
socket.emit('join_room', 'dashboard');

// Escuchar nuevas reservas
socket.on('nueva_reserva', (data) => {
  console.log('Nueva reserva:', data);
  // Actualizar UI
});

// Escuchar tours actualizados
socket.on('tour_actualizado', (data) => {
  console.log('Tour actualizado:', data);
});
```

## 📋 Eventos Disponibles

| Evento                | Descripción                | Datos                                              |
| --------------------- | -------------------------- | -------------------------------------------------- |
| `nueva_reserva`       | Nueva reserva creada       | `{ id_reserva, tour_nombre, usuario_nombre, ... }` |
| `reserva_actualizada` | Reserva modificada         | `{ id_reserva, estado, mensaje }`                  |
| `tour_actualizado`    | Tour creado/modificado     | `{ id_tour, nombre, accion }`                      |
| `guia_disponible`     | Guía cambió disponibilidad | `{ id_guia, nombre, disponible }`                  |
| `nuevo_usuario`       | Nuevo usuario registrado   | `{ id_usuario, nombre, email }`                    |
| `nuevo_destino`       | Nuevo destino agregado     | `{ id_destino, nombre, ubicacion }`                |
| `servicio_contratado` | Servicio contratado        | `{ id_contratacion, servicio_nombre }`             |
| `notificacion`        | Notificación general       | `{ tipo, titulo, mensaje }`                        |

## 🏠 Salas (Rooms)

- `dashboard`: Eventos para el dashboard
- `admin`: Eventos solo para administradores
- `user_{id}`: Eventos específicos de un usuario

## 🔍 Health Check

```bash
GET http://localhost:8081/health
```

Respuesta:

```json
{
  "status": "ok",
  "message": "WebSocket Server está funcionando",
  "connections": 5,
  "timestamp": "2025-10-06T10:00:00.000Z"
}
```

## 🔧 Troubleshooting

### Error: Cannot find module './\_tsc.js'

Si al ejecutar `npm run build` aparece el error:

```
Error: Cannot find module './_tsc.js'
Require stack:
- .../node_modules/typescript/lib/tsc.js
```

**Causa**: La instalación de TypeScript está corrupta o incompleta.

**Solución**:

```powershell
# Eliminar node_modules y lockfile
Remove-Item -Recurse -Force node_modules, package-lock.json

# Reinstalar dependencias
npm install

# Compilar
npm run build

# Ejecutar
npm start
```

### Error: Cannot find module 'dist/server.js'

Si `npm start` falla con este error, asegúrate de compilar primero:

```bash
npm run build
npm start
```

### Puerto ya en uso

Si el puerto 8081 está ocupado, cambia `PORT` en el archivo `.env`:

```env
PORT=8082
```
