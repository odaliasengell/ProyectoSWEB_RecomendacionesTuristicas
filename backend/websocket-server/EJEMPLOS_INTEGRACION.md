# 📡 Ejemplos de Integración - WebSocket Server

Este documento contiene ejemplos prácticos de cómo integrar el servidor WebSocket con tu backend REST y frontend.

---

## 📝 Tabla de Contenidos

1. [Backend Python/FastAPI](#backend-pythonfastapi)
2. [Frontend React](#frontend-react)
3. [Pruebas con cURL](#pruebas-con-curl)
4. [Pruebas con JavaScript](#pruebas-con-javascript)

---

## 🐍 Backend Python/FastAPI

### Ejemplo 1: Registro de Usuario

**Archivo:** `backend/rest-api/app/routes/usuario_routes.py`

```python
from fastapi import APIRouter, HTTPException
from app.models.usuario_model import Usuario, UsuarioCreate
from app.controllers.usuario_controller import crear_usuario
import sys
sys.path.append('../../websocket-server')
from websocket_client import notificar_usuario_registrado

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

@router.post("/register", response_model=Usuario)
async def registrar_usuario(usuario: UsuarioCreate):
    """Registra un nuevo usuario y notifica vía WebSocket"""
    try:
        # Crear usuario en la base de datos
        nuevo_usuario = await crear_usuario(usuario)
        
        # Enviar notificación en tiempo real
        await notificar_usuario_registrado(
            usuario_id=str(nuevo_usuario.id),
            nombre=nuevo_usuario.nombre,
            email=nuevo_usuario.email,
            rol=nuevo_usuario.rol
        )
        
        return nuevo_usuario
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Ejemplo 2: Login de Usuario

```python
@router.post("/login")
async def login(credenciales: LoginSchema):
    """Autentica un usuario y notifica el inicio de sesión"""
    from app.auth.jwt import crear_token
    from websocket_client import notificar_usuario_inicio_sesion
    
    # Validar credenciales
    usuario = await autenticar_usuario(
        credenciales.email,
        credenciales.password
    )
    
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    # Generar token JWT
    token = crear_token({"sub": str(usuario.id), "rol": usuario.rol})
    
    # Notificar inicio de sesión
    await notificar_usuario_inicio_sesion(
        usuario_id=str(usuario.id),
        nombre=usuario.nombre,
        rol=usuario.rol
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(usuario.id),
            "nombre": usuario.nombre,
            "email": usuario.email,
            "rol": usuario.rol
        }
    }
```

### Ejemplo 3: Crear Reserva

**Archivo:** `backend/rest-api/app/routes/reserva_routes.py`

```python
from fastapi import APIRouter, Depends
from app.models.reserva_model import Reserva, ReservaCreate
from app.controllers.reserva_controller import crear_reserva_db
from app.controllers.tour_controller import obtener_tour
from app.auth.jwt import get_current_user
import sys
sys.path.append('../../websocket-server')
from websocket_client import notificar_reserva_creada

router = APIRouter(prefix="/reservas", tags=["reservas"])

@router.post("", response_model=Reserva)
async def crear_reserva(
    reserva_data: ReservaCreate,
    current_user = Depends(get_current_user)
):
    """Crea una nueva reserva y notifica en tiempo real"""
    
    # Obtener información del tour
    tour = await obtener_tour(reserva_data.tour_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tour no encontrado")
    
    # Crear la reserva
    nueva_reserva = await crear_reserva_db(
        usuario_id=current_user["id"],
        tour_id=reserva_data.tour_id,
        fecha=reserva_data.fecha,
        cantidad_personas=reserva_data.cantidad_personas
    )
    
    # Notificar en tiempo real
    await notificar_reserva_creada(
        reserva_id=str(nueva_reserva.id),
        tour_id=str(tour.id),
        tour_nombre=tour.nombre,
        usuario_id=current_user["id"],
        usuario_nombre=current_user["nombre"],
        fecha=reserva_data.fecha.isoformat(),
        personas=reserva_data.cantidad_personas
    )
    
    return nueva_reserva
```

### Ejemplo 4: Crear Tour (Admin)

**Archivo:** `backend/rest-api/app/routes/tour_routes.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from app.models.tour_model import Tour, TourCreate
from app.controllers.tour_controller import crear_tour_db
from app.auth.jwt import require_admin
import sys
sys.path.append('../../websocket-server')
from websocket_client import notificar_tour_creado

router = APIRouter(prefix="/tours", tags=["tours"])

@router.post("", response_model=Tour)
async def crear_tour(
    tour_data: TourCreate,
    current_user = Depends(require_admin)
):
    """Crea un nuevo tour (solo administradores) y notifica"""
    
    nuevo_tour = await crear_tour_db(tour_data)
    
    # Notificar a todos los usuarios conectados
    await notificar_tour_creado(
        tour_id=str(nuevo_tour.id),
        nombre=nuevo_tour.nombre,
        destino=nuevo_tour.destino,
        precio=nuevo_tour.precio
    )
    
    return nuevo_tour
```

### Ejemplo 5: Contratar Servicio

**Archivo:** `backend/rest-api/app/routes/contratacion_routes.py`

```python
@router.post("", response_model=Contratacion)
async def contratar_servicio(
    contratacion_data: ContratacionCreate,
    current_user = Depends(get_current_user)
):
    """Contrata un servicio y notifica"""
    from websocket_client import notificar_servicio_contratado
    
    # Obtener información del servicio
    servicio = await obtener_servicio(contratacion_data.servicio_id)
    
    # Crear la contratación
    nueva_contratacion = await crear_contratacion_db(
        usuario_id=current_user["id"],
        servicio_id=contratacion_data.servicio_id,
        fecha_inicio=contratacion_data.fecha_inicio,
        fecha_fin=contratacion_data.fecha_fin
    )
    
    # Notificar
    await notificar_servicio_contratado(
        contratacion_id=str(nueva_contratacion.id),
        servicio_id=str(servicio.id),
        servicio_nombre=servicio.nombre,
        usuario_id=current_user["id"],
        usuario_nombre=current_user["nombre"]
    )
    
    return nueva_contratacion
```

---

## ⚛️ Frontend React

### Hook Personalizado: `useWebSocket.js`

**Archivo:** `frontend/recomendaciones/src/hooks/useWebSocket.js`

```javascript
import { useEffect, useRef, useState, useCallback } from 'react';

const WEBSOCKET_URL = 'ws://localhost:8080/ws';
const RECONNECT_DELAY = 3000; // 3 segundos

export const useWebSocket = (onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(WEBSOCKET_URL);

      ws.current.onopen = () => {
        console.log('✅ WebSocket conectado');
        setIsConnected(true);
        setReconnectCount(0);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Notificación recibida:', data);
          
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('❌ Error al parsear mensaje:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error);
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        setIsConnected(false);
        
        // Intentar reconectar
        reconnectTimeout.current = setTimeout(() => {
          console.log(`🔄 Intentando reconectar... (intento ${reconnectCount + 1})`);
          setReconnectCount(prev => prev + 1);
          connect();
        }, RECONNECT_DELAY);
      };

    } catch (error) {
      console.error('❌ Error al crear conexión WebSocket:', error);
    }
  }, [onMessage, reconnectCount]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return { 
    isConnected, 
    reconnectCount 
  };
};
```

### Componente: Dashboard con Notificaciones

**Archivo:** `frontend/recomendaciones/src/pages/Dashboard.jsx`

```javascript
import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  const handleNotification = (data) => {
    // Agregar a la lista de notificaciones
    setNotificaciones(prev => [data, ...prev].slice(0, 50)); // Máximo 50

    // Mostrar notificación según el tipo
    const iconMap = {
      usuario_registrado: '👤',
      usuario_inicio_sesion: '🔐',
      reserva_creada: '🎫',
      servicio_contratado: '🛎️',
      recomendacion_creada: '⭐',
      tour_creado: '🗺️',
      servicio_creado: '🎨',
      destino_creado: '📍',
      guia_creado: '👨‍🏫'
    };

    const icon = iconMap[data.type] || '🔔';
    
    toast.info(`${icon} ${data.message}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  };

  const { isConnected, reconnectCount } = useWebSocket(handleNotification);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Panel de Administración
            </h1>
            
            {/* Estado de conexión */}
            <div className="flex items-center space-x-2">
              <div className={`
                flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium
                ${isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
                }
              `}>
                <div className={`
                  w-2 h-2 rounded-full
                  ${isConnected ? 'bg-green-500' : 'bg-red-500'}
                  ${isConnected ? 'animate-pulse' : ''}
                `}></div>
                <span>
                  {isConnected ? 'Conectado' : `Desconectado ${reconnectCount > 0 ? `(${reconnectCount})` : ''}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Panel de notificaciones */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🔔</span>
            Notificaciones en Tiempo Real
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              {notificaciones.length}
            </span>
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <p className="mt-2">No hay notificaciones aún</p>
              </div>
            ) : (
              notificaciones.map((notif, index) => (
                <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800 uppercase">
                        {notif.type.replace(/_/g, ' ')}
                      </p>
                      <p className="mt-1 text-gray-700">
                        {notif.message}
                      </p>
                      {notif.data && Object.keys(notif.data).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer">
                            Ver detalles
                          </summary>
                          <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                            {JSON.stringify(notif.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                      {new Date(notif.timestamp).toLocaleTimeString('es-ES')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
```

### Integrar en App.jsx

```javascript
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <>
      <Dashboard />
      <ToastContainer />
    </>
  );
}

export default App;
```

---

## 🧪 Pruebas con cURL

### Ejemplo 1: Usuario Registrado

```bash
curl -X POST http://localhost:8080/notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "usuario_registrado",
    "message": "Nuevo usuario: María González",
    "data": {
      "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "nombre": "María González",
      "email": "maria@example.com",
      "rol": "turista"
    }
  }'
```

### Ejemplo 2: Reserva Creada

```bash
curl -X POST http://localhost:8080/notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "reserva_creada",
    "message": "Nueva reserva para Tour Machu Picchu",
    "data": {
      "reservaId": "abc123",
      "tourId": "tour456",
      "tourNombre": "Machu Picchu 3 días",
      "usuarioId": "user789",
      "usuarioNombre": "Carlos Ruiz",
      "fecha": "2025-12-25",
      "personas": 4
    }
  }'
```

### Ejemplo 3: Tour Creado

```bash
curl -X POST http://localhost:8080/notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "tour_creado",
    "message": "Nuevo tour disponible: Aventura en Cusco",
    "data": {
      "tourId": "tour789",
      "nombre": "Aventura en Cusco",
      "destino": "Cusco, Perú",
      "precio": 1200.00
    }
  }'
```

---

## 🌐 Pruebas con JavaScript (Consola del Navegador)

### Conectar y escuchar

```javascript
// Abrir conexión
const ws = new WebSocket('ws://localhost:8080/ws');

// Cuando se conecta
ws.onopen = () => {
  console.log('✅ Conectado al WebSocket');
};

// Recibir mensajes
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Notificación:', data);
};

// Errores
ws.onerror = (error) => {
  console.error('❌ Error:', error);
};

// Desconexión
ws.onclose = () => {
  console.log('🔌 Desconectado');
};
```

### Enviar notificación de prueba

```javascript
fetch('http://localhost:8080/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'test',
    message: 'Esto es una prueba desde JavaScript',
    data: { timestamp: new Date().toISOString() }
  })
})
.then(response => response.json())
.then(data => console.log('✅ Respuesta:', data))
.catch(error => console.error('❌ Error:', error));
```

---

## 🔥 Tips Importantes

1. **Manejo de errores**: El cliente WebSocket debe intentar reconectar automáticamente
2. **Timeout**: Usa un timeout corto (3 segundos) para no bloquear la API REST
3. **Log de errores**: No detengas la ejecución si el WebSocket no está disponible
4. **Testing**: Prueba con el WebSocket apagado para verificar que la API sigue funcionando
5. **Producción**: Usa WSS (WebSocket Secure) en producción con certificados SSL

---

¡Listo! Con estos ejemplos puedes integrar completamente el WebSocket en tu proyecto. 🚀
