# 🌐 WebSocket Server - Sistema de Turismo

Servidor WebSocket desarrollado en **Go** para notificaciones en tiempo real del sistema de recomendaciones turísticas.

## 🚀 Características

- ✅ Conexiones WebSocket persistentes
- 📡 Broadcast a múltiples clientes simultáneos
- 🔄 Reconexión automática
- 📮 Endpoint HTTP para enviar notificaciones desde el backend REST
- 🎨 Interfaz web de prueba incluida
- 🛡️ Manejo de errores y reconexiones
- ⚡ Alto rendimiento con goroutines

---

## 📋 Requisitos

- **Go** 1.21 o superior
- Puertos libres: `8080` (configurable)

---

## 🔧 Instalación

### 1. Instalar dependencias

```bash
cd backend/websocket-server
go mod download
```

### 2. Iniciar el servidor

**Windows (PowerShell):**
```powershell
go run .
```

**Linux/Mac:**
```bash
go run .
```

### 3. Verificar que está corriendo

Deberías ver:
```
🚀 Servidor WebSocket iniciado en http://localhost:8080
📡 Endpoint WebSocket: ws://localhost:8080/ws
📮 Endpoint de notificación: http://localhost:8080/notify
🌐 Página de prueba: http://localhost:8080/
```

---

## 🎯 Endpoints

### 1. WebSocket Connection

```
ws://localhost:8080/ws
```

Los clientes (frontend) se conectan aquí para recibir notificaciones en tiempo real.

### 2. HTTP Notification Endpoint

```
POST http://localhost:8080/notify
Content-Type: application/json

{
  "type": "usuario_registrado",
  "message": "Nuevo usuario registrado: Juan Pérez",
  "data": {
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "juan@example.com",
    "role": "turista"
  }
}
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Notificación enviada a todos los clientes"
}
```

### 3. Página de Prueba

```
http://localhost:8080/
```

Abre esta URL en tu navegador para probar el WebSocket con una interfaz visual.

---

## 📡 Tipos de Eventos

### 👤 Eventos de Usuario

| Tipo | Descripción |
|------|-------------|
| `usuario_registrado` | Un nuevo usuario se registró |
| `usuario_inicio_sesion` | Un usuario inició sesión |

### 🎫 Eventos de Reserva

| Tipo | Descripción |
|------|-------------|
| `reserva_creada` | Nueva reserva creada |
| `reserva_actualizada` | Reserva modificada |
| `reserva_cancelada` | Reserva cancelada |

### 🛎️ Eventos de Contratación

| Tipo | Descripción |
|------|-------------|
| `servicio_contratado` | Un servicio fue contratado |

### ⭐ Eventos de Recomendación

| Tipo | Descripción |
|------|-------------|
| `recomendacion_creada` | Nueva recomendación publicada |

### 🎨 Eventos de Administración

| Tipo | Descripción |
|------|-------------|
| `tour_creado` | Nuevo tour creado |
| `tour_actualizado` | Tour actualizado |
| `tour_eliminado` | Tour eliminado |
| `servicio_creado` | Nuevo servicio creado |
| `servicio_actualizado` | Servicio actualizado |
| `servicio_eliminado` | Servicio eliminado |
| `destino_creado` | Nuevo destino creado |
| `destino_actualizado` | Destino actualizado |
| `destino_eliminado` | Destino eliminado |
| `guia_creado` | Nuevo guía creado |
| `guia_actualizado` | Guía actualizado |
| `guia_eliminado` | Guía eliminado |

---

## 🔗 Integración con Backend REST (Python/FastAPI)

### Opción 1: Helper Function (Recomendado)

Crea un archivo `websocket_client.py` en tu REST API:

```python
import httpx
from typing import Dict, Any, Optional

WEBSOCKET_URL = "http://localhost:8080/notify"

async def enviar_notificacion(
    tipo: str,
    mensaje: str,
    data: Optional[Dict[str, Any]] = None
):
    """
    Envía una notificación al servidor WebSocket
    
    Args:
        tipo: Tipo de evento (ej: "usuario_registrado")
        mensaje: Mensaje descriptivo
        data: Datos adicionales (opcional)
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                WEBSOCKET_URL,
                json={
                    "type": tipo,
                    "message": mensaje,
                    "data": data or {}
                },
                timeout=3.0
            )
            if response.status_code == 200:
                print(f"✅ Notificación enviada: {tipo}")
            else:
                print(f"⚠️ Error al enviar notificación: {response.status_code}")
    except Exception as e:
        print(f"❌ Error de conexión al WebSocket: {e}")
        # No detener la ejecución si el WS no está disponible
```

### Opción 2: Ejemplos de Uso en Rutas

#### 📝 Registro de Usuario

```python
from app.routes.usuario_routes import router
from websocket_client import enviar_notificacion
import httpx

@router.post("/usuarios/register")
async def registrar_usuario(usuario: UsuarioCreate):
    # Crear usuario en la base de datos
    nuevo_usuario = await crear_usuario_db(usuario)
    
    # Enviar notificación WebSocket
    await enviar_notificacion(
        tipo="usuario_registrado",
        mensaje=f"Nuevo usuario registrado: {nuevo_usuario['nombre']}",
        data={
            "userId": str(nuevo_usuario['_id']),
            "nombre": nuevo_usuario['nombre'],
            "email": nuevo_usuario['email'],
            "rol": nuevo_usuario['rol']
        }
    )
    
    return nuevo_usuario
```

#### 🔐 Inicio de Sesión

```python
@router.post("/usuarios/login")
async def login(credenciales: LoginSchema):
    usuario = await autenticar_usuario(credenciales)
    
    await enviar_notificacion(
        tipo="usuario_inicio_sesion",
        mensaje=f"{usuario['nombre']} ha iniciado sesión",
        data={
            "userId": str(usuario['_id']),
            "nombre": usuario['nombre'],
            "rol": usuario['rol']
        }
    )
    
    return {"token": generar_token(usuario)}
```

#### 🎫 Crear Reserva

```python
@router.post("/reservas")
async def crear_reserva(reserva: ReservaCreate):
    nueva_reserva = await guardar_reserva(reserva)
    
    await enviar_notificacion(
        tipo="reserva_creada",
        mensaje=f"Nueva reserva para el tour: {reserva.tour_nombre}",
        data={
            "reservaId": str(nueva_reserva['_id']),
            "tourId": str(reserva.tour_id),
            "usuarioId": str(reserva.usuario_id),
            "fecha": reserva.fecha.isoformat(),
            "personas": reserva.cantidad_personas
        }
    )
    
    return nueva_reserva
```

#### 🛎️ Contratar Servicio

```python
@router.post("/contrataciones")
async def contratar_servicio(contratacion: ContratacionCreate):
    nueva_contratacion = await guardar_contratacion(contratacion)
    
    await enviar_notificacion(
        tipo="servicio_contratado",
        mensaje=f"Servicio contratado: {contratacion.servicio_nombre}",
        data={
            "contratacionId": str(nueva_contratacion['_id']),
            "servicioId": str(contratacion.servicio_id),
            "usuarioId": str(contratacion.usuario_id)
        }
    )
    
    return nueva_contratacion
```

#### ⭐ Crear Recomendación

```python
@router.post("/recomendaciones")
async def crear_recomendacion(recomendacion: RecomendacionCreate):
    nueva_recomendacion = await guardar_recomendacion(recomendacion)
    
    await enviar_notificacion(
        tipo="recomendacion_creada",
        mensaje=f"Nueva recomendación: {recomendacion.titulo}",
        data={
            "recomendacionId": str(nueva_recomendacion['_id']),
            "titulo": recomendacion.titulo,
            "calificacion": recomendacion.calificacion
        }
    )
    
    return nueva_recomendacion
```

#### 🎨 Eventos de Admin (Tour)

```python
@router.post("/tours")
async def crear_tour(tour: TourCreate):
    nuevo_tour = await guardar_tour(tour)
    
    await enviar_notificacion(
        tipo="tour_creado",
        mensaje=f"Nuevo tour disponible: {tour.nombre}",
        data={
            "tourId": str(nuevo_tour['_id']),
            "nombre": tour.nombre,
            "precio": tour.precio,
            "destino": tour.destino
        }
    )
    
    return nuevo_tour

@router.put("/tours/{tour_id}")
async def actualizar_tour(tour_id: str, tour: TourUpdate):
    tour_actualizado = await actualizar_tour_db(tour_id, tour)
    
    await enviar_notificacion(
        tipo="tour_actualizado",
        mensaje=f"Tour actualizado: {tour.nombre}",
        data={"tourId": tour_id}
    )
    
    return tour_actualizado
```

---

## 🎨 Integración con Frontend (React)

### 1. Crear Hook personalizado

Crea `src/hooks/useWebSocket.js`:

```javascript
import { useEffect, useRef, useState } from 'react';

const WEBSOCKET_URL = 'ws://localhost:8080/ws';

export const useWebSocket = (onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(WEBSOCKET_URL);

      ws.current.onopen = () => {
        console.log('✅ WebSocket conectado');
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Notificación recibida:', data);
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('Error al parsear mensaje:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error);
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket desconectado, reconectando...');
        setIsConnected(false);
        
        // Reconectar después de 3 segundos
        setTimeout(() => {
          connect();
        }, 3000);
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [onMessage]);

  return { isConnected };
};
```

### 2. Usar en Componente (Dashboard Admin)

```javascript
import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  const handleNotification = (data) => {
    // Agregar a la lista
    setNotificaciones(prev => [data, ...prev]);

    // Mostrar toast según el tipo
    switch (data.type) {
      case 'usuario_registrado':
        toast.info(`👤 ${data.message}`);
        break;
      case 'reserva_creada':
        toast.success(`🎫 ${data.message}`);
        break;
      case 'tour_creado':
        toast.success(`🎨 ${data.message}`);
        break;
      case 'servicio_contratado':
        toast.info(`🛎️ ${data.message}`);
        break;
      default:
        toast.info(data.message);
    }
  };

  const { isConnected } = useWebSocket(handleNotification);

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Panel de Administración</h1>
        <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </div>
      </div>

      <div className="notifications-panel">
        <h2>🔔 Notificaciones en Tiempo Real</h2>
        {notificaciones.map((notif, index) => (
          <div key={index} className="notification-card">
            <span className="type">{notif.type}</span>
            <p>{notif.message}</p>
            <small>{new Date(notif.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
```

---

## 🧪 Pruebas

### Prueba 1: Desde la Interfaz Web

1. Abre `http://localhost:8080/`
2. Haz clic en "Conectar"
3. Haz clic en "Enviar prueba"
4. Deberías ver la notificación aparecer

### Prueba 2: Con cURL

```bash
curl -X POST http://localhost:8080/notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "usuario_registrado",
    "message": "Nuevo usuario: Test User",
    "data": {"userId": "123", "email": "test@example.com"}
  }'
```

### Prueba 3: Con Python

```python
import requests

response = requests.post('http://localhost:8080/notify', json={
    "type": "reserva_creada",
    "message": "Nueva reserva para Tour Machu Picchu",
    "data": {
        "tourId": "abc123",
        "usuarioId": "user456",
        "fecha": "2025-12-25"
    }
})

print(response.json())
```

---

## 📦 Compilar para Producción

### Windows

```powershell
go build -o websocket-server.exe
./websocket-server.exe
```

### Linux

```bash
GOOS=linux GOARCH=amd64 go build -o websocket-server
./websocket-server
```

### Docker (Opcional)

```dockerfile
FROM golang:1.21-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o websocket-server

EXPOSE 8080

CMD ["./websocket-server"]
```

```bash
docker build -t turismo-websocket .
docker run -p 8080:8080 turismo-websocket
```

---

## 🔍 Logs y Debugging

El servidor imprime logs detallados:

```
✅ Cliente registrado. Total clientes: 1
📨 Notificación recibida: [usuario_registrado] Nuevo usuario: Juan
📡 Broadcast enviado a 1 clientes: [usuario_registrado] Nuevo usuario: Juan
❌ Cliente desregistrado. Total clientes: 0
```

---

## 🛡️ Seguridad

### Para Producción:

1. **Configurar CORS específicos:**

```go
c := cors.New(cors.Options{
    AllowedOrigins:   []string{"https://tu-dominio.com"},
    AllowedMethods:   []string{"GET", "POST"},
    AllowCredentials: true,
})
```

2. **Agregar autenticación:** Validar tokens JWT antes de aceptar conexiones

3. **Rate limiting:** Limitar notificaciones por IP

4. **HTTPS/WSS:** Usar certificados SSL

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles

---

## 👥 Autores

- **Integrante 3** - WebSocket Server (Go)

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que Go esté instalado: `go version`
2. Verifica que el puerto 8080 esté libre
3. Revisa los logs del servidor
4. Asegúrate de que las dependencias estén instaladas

---

¡Listo! 🎉 Ahora tienes un servidor WebSocket completo y funcional para tu sistema de turismo.
