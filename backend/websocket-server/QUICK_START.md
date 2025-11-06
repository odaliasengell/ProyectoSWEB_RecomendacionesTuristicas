# 🎯 GUÍA RÁPIDA - WebSocket Server

## 📦 Archivos Creados

```
backend/websocket-server/
├── main.go                    # Servidor principal con endpoints
├── hub.go                     # Gestor de conexiones y broadcast
├── client.go                  # Manejo de clientes individuales
├── events.go                  # Tipos de eventos predefinidos
├── go.mod                     # Dependencias de Go
├── start.ps1                  # Script de inicio para Windows
├── start.sh                   # Script de inicio para Linux/Mac
├── websocket_client.py        # Helper para integrar con Python
├── test_websocket.py          # Script de prueba
├── README.md                  # Documentación completa
├── EJEMPLOS_INTEGRACION.md    # Ejemplos de código
└── .gitignore                 # Archivos ignorados por Git
```

---

## 🚀 INICIO RÁPIDO

### 1️⃣ Iniciar el servidor

**Windows:**
```powershell
cd backend\websocket-server
.\start.ps1
```

**O directamente:**
```powershell
go run .
```

Deberías ver:
```
🚀 Servidor WebSocket iniciado en http://localhost:8080
📡 Endpoint WebSocket: ws://localhost:8080/ws
📮 Endpoint de notificación: http://localhost:8080/notify
🌐 Página de prueba: http://localhost:8080/
```

### 2️⃣ Probar en el navegador

Abre en tu navegador:
```
http://localhost:8080/
```

Verás una interfaz con:
- ✅ Estado de conexión en tiempo real
- 📊 Estadísticas de notificaciones
- 🎮 Botones para conectar/desconectar
- 🔔 Lista de notificaciones recibidas

---

## 🔗 INTEGRACIÓN CON BACKEND (Python)

### Paso 1: Copiar el helper

Copia `websocket_client.py` a tu API REST:

```bash
# Desde la raíz del proyecto
cp backend/websocket-server/websocket_client.py backend/rest-api/app/
```

### Paso 2: Usar en tus rutas

**Ejemplo en `usuario_routes.py`:**

```python
from app.websocket_client import notificar_usuario_registrado

@router.post("/usuarios/register")
async def registrar_usuario(usuario: UsuarioCreate):
    # Crear usuario
    nuevo_usuario = await crear_usuario(usuario)
    
    # Notificar vía WebSocket
    await notificar_usuario_registrado(
        usuario_id=str(nuevo_usuario.id),
        nombre=nuevo_usuario.nombre,
        email=nuevo_usuario.email,
        rol=nuevo_usuario.rol
    )
    
    return nuevo_usuario
```

**Ejemplo en `reserva_routes.py`:**

```python
from app.websocket_client import notificar_reserva_creada

@router.post("/reservas")
async def crear_reserva(reserva: ReservaCreate, current_user = Depends(get_current_user)):
    # Crear reserva
    nueva_reserva = await crear_reserva_db(reserva)
    
    # Notificar
    await notificar_reserva_creada(
        reserva_id=str(nueva_reserva.id),
        tour_id=str(reserva.tour_id),
        tour_nombre=reserva.tour_nombre,
        usuario_id=current_user["id"],
        usuario_nombre=current_user["nombre"],
        fecha=reserva.fecha.isoformat(),
        personas=reserva.cantidad_personas
    )
    
    return nueva_reserva
```

---

## 🎨 INTEGRACIÓN CON FRONTEND (React)

### Paso 1: Crear el Hook

Crea `src/hooks/useWebSocket.js`:

```javascript
import { useEffect, useRef, useState } from 'react';

const WEBSOCKET_URL = 'ws://localhost:8080/ws';

export const useWebSocket = (onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage(data);
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      setTimeout(() => {
        // Reconectar
      }, 3000);
    };

    return () => ws.current?.close();
  }, [onMessage]);

  return { isConnected };
};
```

### Paso 2: Usar en un Componente

```javascript
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const handleNotification = (data) => {
    toast.info(`${data.message}`);
  };

  const { isConnected } = useWebSocket(handleNotification);

  return (
    <div>
      <div className={isConnected ? 'conectado' : 'desconectado'}>
        {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
      </div>
    </div>
  );
};
```

---

## 🧪 PRUEBAS

### Probar con el script de Python

```bash
cd backend/websocket-server
python test_websocket.py
```

Esto enviará 9 notificaciones de prueba simulando:
- Registros de usuarios
- Reservas
- Contrataciones de servicios
- Creación de tours, servicios, destinos y guías

### Probar manualmente con cURL

```bash
curl -X POST http://localhost:8080/notify -H "Content-Type: application/json" -d "{\"type\":\"usuario_registrado\",\"message\":\"Nuevo usuario: Test\",\"data\":{}}"
```

---

## 📋 TIPOS DE EVENTOS DISPONIBLES

| Evento | Cuándo usarlo |
|--------|---------------|
| `usuario_registrado` | Un nuevo usuario se registra |
| `usuario_inicio_sesion` | Un usuario inicia sesión |
| `reserva_creada` | Se crea una reserva |
| `reserva_actualizada` | Se modifica una reserva |
| `reserva_cancelada` | Se cancela una reserva |
| `servicio_contratado` | Se contrata un servicio |
| `recomendacion_creada` | Se publica una recomendación |
| `tour_creado` | Admin crea un tour |
| `tour_actualizado` | Admin actualiza un tour |
| `tour_eliminado` | Admin elimina un tour |
| `servicio_creado` | Admin crea un servicio |
| `destino_creado` | Admin crea un destino |
| `guia_creado` | Admin crea un guía |

---

## ⚙️ FLUJO COMPLETO

```
1. Usuario hace una acción (ej: registrarse)
   ↓
2. Backend REST procesa la solicitud
   ↓
3. Backend REST llama a enviar_notificacion()
   ↓
4. WebSocket Server recibe la notificación
   ↓
5. WebSocket Server hace broadcast a todos los clientes
   ↓
6. Frontend recibe la notificación
   ↓
7. Frontend muestra un toast/alerta
```

---

## 🔥 COMANDOS ÚTILES

**Compilar para producción:**
```bash
go build -o websocket-server.exe
```

**Ejecutar en background (Windows):**
```powershell
Start-Process -NoNewWindow -FilePath ".\websocket-server.exe"
```

**Ver logs en tiempo real:**
```bash
go run . 2>&1 | tee logs.txt
```

---

## 🛠️ TROUBLESHOOTING

### El servidor no inicia

1. Verifica que Go esté instalado: `go version`
2. Verifica que el puerto 8080 esté libre
3. Ejecuta `go mod download` para instalar dependencias

### No puedo conectarme desde el frontend

1. Verifica que uses `ws://` (no `http://`)
2. Verifica que el servidor esté corriendo
3. Abre la consola del navegador para ver errores
4. Verifica que no haya bloqueadores de CORS

### Las notificaciones no llegan

1. Verifica que el servidor WebSocket esté corriendo
2. Verifica que estés enviando POST a `/notify` (no `/ws`)
3. Verifica el formato JSON del body
4. Revisa los logs del servidor WebSocket

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **README.md**: Documentación completa del servidor
- **EJEMPLOS_INTEGRACION.md**: Ejemplos de código completos
- Ver los comentarios en el código para más detalles

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Servidor WebSocket corriendo en puerto 8080
- [ ] Página de prueba accesible en `http://localhost:8080/`
- [ ] Backend REST puede enviar notificaciones
- [ ] Frontend puede conectarse y recibir notificaciones
- [ ] Las notificaciones se muestran en tiempo real
- [ ] La reconexión automática funciona

---

¡Listo! 🎉 Tu servidor WebSocket está completo y funcional.

**Próximos pasos:**
1. Inicia el servidor: `.\start.ps1`
2. Abre la página de prueba: `http://localhost:8080/`
3. Integra con tu backend REST
4. Integra con tu frontend React
5. ¡Disfruta de las notificaciones en tiempo real!
