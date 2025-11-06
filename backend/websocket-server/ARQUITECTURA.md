# 🏗️ ARQUITECTURA DEL SISTEMA WEBSOCKET

## 📐 Diagrama General

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SISTEMA DE TURISMO                            │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│                  │        │                  │        │                  │
│    FRONTEND      │◄──────►│   REST API       │◄──────►│    MONGODB       │
│   (React.js)     │  HTTP  │  (Python/FastAPI)│  Motor │                  │
│                  │        │                  │        │                  │
└────────┬─────────┘        └────────┬─────────┘        └──────────────────┘
         │                           │
         │ WebSocket                 │ HTTP POST
         │ ws://                     │ /notify
         │                           │
         └──────────┐       ┌────────┘
                    │       │
                    ▼       ▼
         ┌──────────────────────────┐
         │                          │
         │   WEBSOCKET SERVER       │
         │      (Golang)            │
         │                          │
         │  - Hub (Broadcaster)     │
         │  - Clients Management    │
         │  - Events Handler        │
         │                          │
         └──────────────────────────┘
```

---

## 🔄 FLUJO DE DATOS

### 1️⃣ Usuario Realiza una Acción

```
┌─────────┐
│ Usuario │
└────┬────┘
     │ Clic en "Registrarse"
     ▼
┌──────────────────┐
│   React Form     │
└────┬─────────────┘
     │ POST /usuarios/register
     ▼
┌──────────────────────────────────────┐
│ REST API - usuario_routes.py         │
│                                      │
│ 1. Validar datos                     │
│ 2. Crear usuario en MongoDB          │
│ 3. enviar_notificacion() ◄────────┐  │
└──────────────────┬───────────────┘  │
                   │                  │
                   │ HTTP POST        │
                   │ /notify          │
                   ▼                  │
┌──────────────────────────────────┐  │
│ WebSocket Server (Go)            │  │
│                                  │  │
│ Hub.BroadcastEvent()             │  │
└──────────────────┬───────────────┘  │
                   │                  │
         ┌─────────┼─────────┐        │
         │         │         │        │
         ▼         ▼         ▼        │
    ┌────────┐ ┌────────┐ ┌────────┐ │
    │Client 1│ │Client 2│ │Client N│ │
    └───┬────┘ └───┬────┘ └───┬────┘ │
        │          │          │      │
        ▼          ▼          ▼      │
    ┌────────────────────────────┐   │
    │  Navegadores Conectados    │   │
    │  (Admins, Dashboards)      │   │
    │                            │   │
    │  Toast: "Nuevo usuario"    │   │
    └────────────────────────────┘   │
                                     │
                Tiempo real ◄─────────┘
```

---

## 🏢 ARQUITECTURA INTERNA DEL WEBSOCKET

```
┌────────────────────────────────────────────────────────────────┐
│                    WEBSOCKET SERVER (Go)                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐      ┌──────────────┐      ┌─────────────┐ │
│  │              │      │              │      │             │ │
│  │   main.go    │─────►│   hub.go     │◄─────│  client.go  │ │
│  │              │      │              │      │             │ │
│  │ - HTTP Server│      │ - Register   │      │ - ReadPump  │ │
│  │ - /ws        │      │ - Unregister │      │ - WritePump │ │
│  │ - /notify    │      │ - Broadcast  │      │             │ │
│  │ - /          │      │              │      │             │ │
│  │              │      │              │      │             │ │
│  └──────────────┘      └──────┬───────┘      └─────────────┘ │
│         │                     │                               │
│         │              ┌──────▼───────┐                       │
│         └─────────────►│  events.go   │                       │
│                        │              │                       │
│                        │ - Event Types│                       │
│                        │ - Constants  │                       │
│                        │              │                       │
│                        └──────────────┘                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 📡 HUB (Gestor de Conexiones)

El Hub es el corazón del WebSocket Server:

```
┌─────────────────────────────────────────────────┐
│                   HUB                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  clients: map[*Client]bool                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │Client│  │Client│  │Client│  │Client│       │
│  │  1   │  │  2   │  │  3   │  │  N   │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│                                                 │
│  channels:                                     │
│  ┌──────────────────┐                          │
│  │ register         │◄── Nuevos clientes       │
│  └──────────────────┘                          │
│  ┌──────────────────┐                          │
│  │ unregister       │◄── Clientes que salen    │
│  └──────────────────┘                          │
│  ┌──────────────────┐                          │
│  │ broadcast        │◄── Mensajes para todos   │
│  └──────────────────┘                          │
│                                                 │
│  Run() loop infinito:                          │
│  - Escucha canales                             │
│  - Registra/desregistra clientes               │
│  - Envía mensajes a todos                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 👥 CLIENT (Conexión Individual)

Cada cliente conectado tiene:

```
┌─────────────────────────────────────┐
│           CLIENT                    │
├─────────────────────────────────────┤
│                                     │
│  conn: *websocket.Conn              │
│  send: chan []byte                  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │    ReadPump()                │  │
│  │    (Goroutine 1)             │  │
│  │                              │  │
│  │  Lee mensajes del cliente    │  │
│  │  Mantiene conexión viva      │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │    WritePump()               │  │
│  │    (Goroutine 2)             │  │
│  │                              │  │
│  │  Envía mensajes al cliente   │  │
│  │  Maneja pings/pongs          │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 CICLO DE VIDA DE UNA CONEXIÓN

```
1. Cliente conecta a ws://localhost:8080/ws
   │
   ▼
2. Servidor acepta conexión (Upgrade HTTP → WebSocket)
   │
   ▼
3. Crear instancia de Client
   │
   ▼
4. Registrar en Hub (hub.register <- client)
   │
   ▼
5. Iniciar goroutines: ReadPump() y WritePump()
   │
   ├─► ReadPump: Escucha mensajes del cliente
   │
   └─► WritePump: Envía mensajes al cliente
   │
   ▼
6. Cliente está activo
   │
   ├─► Recibe notificaciones vía hub.broadcast
   │
   └─► Envía pings/pongs para mantener conexión
   │
   ▼
7. Cliente se desconecta (cierra navegador, pierde red, etc.)
   │
   ▼
8. ReadPump detecta error
   │
   ▼
9. Desregistrar del Hub (hub.unregister <- client)
   │
   ▼
10. Cerrar conexión y canales
```

---

## 📨 FLUJO DE UNA NOTIFICACIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│                ENVÍO DE NOTIFICACIÓN                            │
└─────────────────────────────────────────────────────────────────┘

Backend REST API (Python)
│
│  from websocket_client import enviar_notificacion
│
│  await enviar_notificacion(
│      tipo="usuario_registrado",
│      mensaje="Nuevo usuario: Juan",
│      data={...}
│  )
│
└─► HTTP POST http://localhost:8080/notify
    │
    │  Content-Type: application/json
    │  Body: {"type": "...", "message": "...", "data": {...}}
    │
    ▼
    WebSocket Server recibe en handleNotify()
    │
    │  1. Decodifica JSON
    │  2. Valida campos requeridos
    │  3. hub.BroadcastEvent(event)
    │
    ▼
    Hub procesa en el loop:
    │
    │  case message := <-h.broadcast:
    │      for client := range h.clients {
    │          client.send <- message
    │      }
    │
    ▼
    Cada Client recibe en WritePump():
    │
    │  case message := <-c.send:
    │      conn.WriteMessage(TextMessage, message)
    │
    ▼
    Frontend recibe en ws.onmessage:
    │
    │  ws.onmessage = (event) => {
    │      const data = JSON.parse(event.data)
    │      toast.info(data.message)
    │  }
    │
    ▼
    Usuario ve la notificación en pantalla! 🎉
```

---

## 🔐 ENDPOINTS DEL SERVIDOR

### 1. `/ws` (WebSocket)

```
Protocolo: WebSocket (ws://)
Método: GET (Upgrade)
Uso: Conexión persistente para clientes

Cliente:
  const ws = new WebSocket('ws://localhost:8080/ws')

Servidor:
  - Upgrade HTTP → WebSocket
  - Crear Client
  - Registrar en Hub
  - Mantener conexión activa
```

### 2. `/notify` (HTTP)

```
Protocolo: HTTP
Método: POST
Content-Type: application/json
Uso: Backend REST envía notificaciones

Body:
{
  "type": "usuario_registrado",
  "message": "Nuevo usuario: Juan",
  "data": {
    "userId": "123",
    "email": "juan@example.com"
  }
}

Response:
{
  "status": "success",
  "message": "Notificación enviada a todos los clientes"
}
```

### 3. `/` (HTTP)

```
Protocolo: HTTP
Método: GET
Uso: Página de prueba

Respuesta: HTML con interfaz interactiva
- Conexión WebSocket
- Envío de notificaciones de prueba
- Visualización de notificaciones en tiempo real
```

---

## 🚦 ESTADOS DE CONEXIÓN

```
WebSocket.CONNECTING (0)  →  Conectando...
         │
         ▼
WebSocket.OPEN (1)        →  ✅ Conectado
         │
         ├──► Enviar/recibir mensajes
         │
         ▼
WebSocket.CLOSING (2)     →  Cerrando...
         │
         ▼
WebSocket.CLOSED (3)      →  🔴 Desconectado
         │
         │ (Reconexión automática)
         │
         └──► Volver a CONNECTING
```

---

## 📊 ESCALABILIDAD

### Configuración Actual (Desarrollo)

```
- 1 Instancia del WebSocket Server
- Puerto: 8080
- Conexiones simultáneas: Ilimitadas (limitado por RAM)
- Broadcast: Todos los clientes reciben todos los mensajes
```

### Para Producción (Opcional)

```
┌────────────────────────────────────────┐
│     Load Balancer (nginx)              │
└──────────┬─────────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐  ┌─────────┐
│  WS #1  │  │  WS #2  │
└────┬────┘  └────┬────┘
     │           │
     └─────┬─────┘
           ▼
     ┌──────────┐
     │  Redis   │  ← Pub/Sub para sincronizar
     │  Pub/Sub │     mensajes entre instancias
     └──────────┘
```

---

## 🔧 TECNOLOGÍAS UTILIZADAS

| Componente | Tecnología | Propósito |
|------------|-----------|-----------|
| WebSocket Protocol | RFC 6455 | Comunicación bidireccional |
| Gorilla WebSocket | Go Library | Implementación WebSocket |
| Goroutines | Go Concurrency | Manejo asíncrono |
| Channels | Go | Comunicación entre goroutines |
| HTTP/CORS | Go net/http + rs/cors | Servidor HTTP y CORS |

---

## 💡 VENTAJAS DE ESTA ARQUITECTURA

✅ **Simplicidad**: Un solo servidor, fácil de entender y mantener
✅ **Performance**: Go es extremadamente rápido y eficiente
✅ **Concurrencia**: Goroutines manejan miles de conexiones
✅ **Desacoplamiento**: El WebSocket es independiente del REST API
✅ **Escalable**: Fácil de replicar y distribuir
✅ **Confiable**: Reconexión automática en el cliente

---

## 🎯 CASOS DE USO IMPLEMENTADOS

1. ✅ Usuario se registra → Notificación en tiempo real
2. ✅ Usuario inicia sesión → Notificación en dashboard
3. ✅ Nueva reserva → Actualización automática
4. ✅ Servicio contratado → Alerta al admin
5. ✅ Nueva recomendación → Mostrar a usuarios
6. ✅ Admin crea tour → Notificar a turistas conectados
7. ✅ Admin crea servicio → Actualizar catálogo en vivo
8. ✅ Admin crea destino → Broadcast a todos
9. ✅ Admin crea guía → Notificación instantánea

---

¡Arquitectura completa y documentada! 🏗️✨
