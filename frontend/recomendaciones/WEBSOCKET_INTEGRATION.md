# 🌐 Integración WebSocket - Frontend React

## 📋 Archivos Creados

- ✅ `src/hooks/useWebSocket.ts` - Hook personalizado para WebSocket
- ✅ `src/components/common/NotificationPanel.tsx` - Panel de notificaciones
- ✅ `src/components/common/WebSocketStatus.tsx` - Indicador de estado
- ✅ `src/components/dashboard/Dashboard.tsx` - Dashboard actualizado
- ✅ `src/index.css` - Animaciones agregadas

---

## 🚀 Uso del Hook

### Ejemplo Básico

```typescript
import { useWebSocket } from '../hooks/useWebSocket';

const MiComponente = () => {
  const { isConnected, notifications } = useWebSocket((data) => {
    console.log('Notificación recibida:', data);
  });

  return (
    <div>
      <p>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</p>
      <p>Notificaciones: {notifications.length}</p>
    </div>
  );
};
```

### Con Opciones Avanzadas

```typescript
const { isConnected, connect, disconnect } = useWebSocket(
  (data) => {
    // Manejar notificación
    toast.info(data.message);
  },
  {
    autoConnect: true,
    maxReconnectAttempts: 10,
    onOpen: () => console.log('Conectado'),
    onClose: () => console.log('Desconectado'),
    onError: (error) => console.error('Error:', error),
  }
);
```

### Con Toast (react-toastify)

```typescript
import { toast } from 'react-toastify';
import { useWebSocket } from '../hooks/useWebSocket';

const MiComponente = () => {
  const { isConnected } = useWebSocket((data) => {
    // Diferentes tipos de notificaciones
    switch (data.type) {
      case 'usuario_registrado':
        toast.success(`👤 ${data.message}`);
        break;
      case 'reserva_creada':
        toast.info(`🎫 ${data.message}`);
        break;
      case 'tour_creado':
        toast.success(`🗺️ ${data.message}`);
        break;
      default:
        toast.info(data.message);
    }
  });

  return <div>...</div>;
};
```

---

## 🎨 Componentes Disponibles

### 1. NotificationPanel

Panel completo para mostrar notificaciones:

```typescript
import { NotificationPanel } from '../components/common/NotificationPanel';

<NotificationPanel
  notifications={notifications}
  onClear={clearNotifications}
  maxHeight="400px"
/>
```

### 2. WebSocketStatus

Indicador de estado de conexión:

```typescript
import { WebSocketStatus } from '../components/common/WebSocketStatus';

<WebSocketStatus
  isConnected={isConnected}
  reconnectCount={reconnectCount}
  showLabel={true}
/>
```

---

## 📱 Notificaciones del Navegador

Para habilitar notificaciones del navegador:

```typescript
// Solicitar permiso
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, []);

// Usar en el callback
useWebSocket((data) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(data.message, {
      icon: '/favicon.ico',
      body: data.type.replace(/_/g, ' '),
    });
  }
});
```

---

## 🎯 Tipos de Eventos

El hook recibe notificaciones con esta estructura:

```typescript
interface WebSocketNotification {
  type: string;           // Tipo de evento
  message: string;        // Mensaje descriptivo
  data?: Record<string, any>;  // Datos adicionales
  timestamp: string;      // Marca de tiempo
}
```

Tipos disponibles:
- `usuario_registrado` 👤
- `usuario_inicio_sesion` 🔐
- `reserva_creada` 🎫
- `servicio_contratado` 🛎️
- `recomendacion_creada` ⭐
- `tour_creado` 🗺️
- `servicio_creado` 🎨
- `destino_creado` 📍
- `guia_creado` 👨‍🏫

---

## 🔧 Configuración

Puedes cambiar la URL del WebSocket en `src/hooks/useWebSocket.ts`:

```typescript
const WEBSOCKET_URL = 'ws://localhost:8080/ws';
```

Para producción:

```typescript
const WEBSOCKET_URL = process.env.VITE_WEBSOCKET_URL || 'wss://tu-dominio.com/ws';
```

---

## 🧪 Probar la Integración

1. **Iniciar el WebSocket Server:**
   ```bash
   cd backend/websocket-server
   ./start.ps1
   ```

2. **Iniciar el Frontend:**
   ```bash
   cd frontend/recomendaciones
   npm run dev
   ```

3. **Abrir el Dashboard:**
   ```
   http://localhost:5173
   ```

4. **Probar notificaciones:**
   - Registra un usuario desde otro navegador
   - Crea una reserva
   - Observa las notificaciones en tiempo real

---

## 📚 Ejemplos de Integración en Otros Componentes

### En un formulario de registro:

```typescript
const RegistroForm = () => {
  const { isConnected } = useWebSocket();

  return (
    <form>
      {!isConnected && (
        <div className="bg-yellow-100 p-2 rounded">
          ⚠️ Sin conexión en tiempo real
        </div>
      )}
      {/* ... resto del formulario */}
    </form>
  );
};
```

### En un listado de reservas:

```typescript
const ListaReservas = () => {
  const [reservas, setReservas] = useState([]);

  useWebSocket((data) => {
    if (data.type === 'reserva_creada') {
      // Actualizar la lista automáticamente
      fetchReservas();
    }
  });

  return <div>{/* Lista de reservas */}</div>;
};
```

---

## ✨ Características Implementadas

✅ Reconexión automática (máximo 10 intentos)  
✅ Gestión de estado de conexión  
✅ Historial de notificaciones (máximo 100)  
✅ Animaciones suaves  
✅ Soporte para notificaciones del navegador  
✅ TypeScript completo  
✅ Manejo de errores robusto  
✅ Panel de notificaciones interactivo  
✅ Indicador visual de estado  

---

¡Listo! Tu frontend ahora tiene notificaciones en tiempo real completamente funcionales. 🎉
