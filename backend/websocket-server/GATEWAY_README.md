# API Gateway + WebSocket Server

Este servidor combina funcionalidades de WebSocket para tiempo real con un API Gateway completo que incluye todas las características avanzadas requeridas.

## 🚀 Características Implementadas

### ✅ API Gateway
- **Routing/Proxy**: Enruta automáticamente requests a los microservicios correctos
- **Load Balancing**: Distribuye carga entre múltiples instancias con health checks
- **Autenticación JWT**: Middleware avanzado de autenticación con validación de roles
- **Rate Limiting**: Limitación inteligente de velocidad para prevenir abuso
- **Request/Response Transformation**: Transforma y enriquece requests y responses

### ✅ WebSocket Server
- **Conexiones en tiempo real**: Socket.IO para comunicación bidireccional
- **Gestión de salas**: Organización automática de clientes por funcionalidad
- **Notificaciones**: Sistema de eventos para notificar cambios en tiempo real

## 📡 Arquitectura

```
Frontend (React) 
       ↓
API Gateway (WebSocket Server :4001)
       ↓
┌──────────────┬──────────────┬──────────────┐
│ TypeScript   │ Python       │ Go           │
│ Service      │ Service      │ Service      │
│ :3000        │ :8000        │ :8080        │
└──────────────┴──────────────┴──────────────┘
```

## 🛠️ Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# Puerto del servidor
PORT=4001

# JWT
JWT_SECRET=tu-secreto-super-seguro-websocket-2024

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Servicios
TYPESCRIPT_SERVICE_URL=http://localhost:3000
PYTHON_SERVICE_URL=http://localhost:8000
GOLANG_SERVICE_URL=http://localhost:8080

# Features
ENABLE_AUTH=true
ENABLE_RATE_LIMITING=true
ENABLE_LOAD_BALANCING=true
```

## 🚦 Endpoints del API Gateway

### Autenticación
```http
POST /auth/test-token
Content-Type: application/json

{
  "userId": "test-user",
  "email": "test@example.com", 
  "role": "admin"
}
```

### Proxy a Servicios
```http
# Tours y Guías (TypeScript Service)
GET /api/tours
GET /api/guias

# Usuarios y Recomendaciones (Python Service)  
GET /api/usuarios
GET /api/recomendaciones

# Servicios y Contrataciones (Go Service)
GET /api/servicios
GET /api/contrataciones
```

### Monitoreo
```http
# Estado general del WebSocket
GET /health

# Estadísticas del Gateway
GET /gateway/stats

# Estado de servicios (Load Balancer)
GET /gateway/health
```

## 🔐 Autenticación

### 1. Obtener Token
```bash
curl -X POST http://localhost:4001/auth/test-token \
  -H "Content-Type: application/json" \
  -d '{"userId":"123","email":"user@test.com","role":"admin"}'
```

### 2. Usar Token
```bash
curl -X GET http://localhost:4001/api/tours \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚫 Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/api/*` | 100 req | 15 min |
| `/auth/*` | 5 req | 15 min |
| WebSocket | 10 conn | 1 min |
| `/notify` | 30 req | 1 min |

## 🔄 Load Balancing

### Health Checks
- **Intervalo**: 30 segundos
- **Timeout**: 5 segundos  
- **Endpoint**: `/health` en cada servicio

### Algoritmo
- **Round Robin**: Distribución equitativa
- **Health-aware**: Solo instancias saludables
- **Failover**: Automático cuando una instancia falla

## 📊 Monitoreo

### Estadísticas del Gateway
```json
{
  "loadBalancer": {
    "typescript": {
      "healthy": 1,
      "total": 1,
      "availability": "100%",
      "avgResponseTime": "45ms"
    }
  }
}
```

### Logs
```bash
🔐 Usuario autenticado: user@test.com (admin)
🔀 Proxy: GET /api/tours -> http://localhost:3000 (ts-1)
📤 Enviando a typescript: GET /api/tours
📥 Respuesta de typescript: 200
```

## 🧪 Testing

### 1. Generar Token de Prueba
```bash
curl -X POST http://localhost:4001/auth/test-token \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```

### 2. Probar Proxy
```bash
# Con autenticación
curl -X GET http://localhost:4001/api/tours \
  -H "Authorization: Bearer JWT_TOKEN"

# Sin autenticación (debería fallar en rutas protegidas)
curl -X GET http://localhost:4001/api/protected/tours
```

### 3. Verificar Rate Limiting
```bash
# Hacer múltiples requests rápidos
for i in {1..10}; do
  curl -X GET http://localhost:4001/api/tours
done
```

### 4. Verificar Load Balancer
```bash
curl -X GET http://localhost:4001/gateway/health
```

## 🔧 Desarrollo

### Ejecutar en Desarrollo
```bash
npm run dev
```

### Estructura del Proyecto
```
src/
├── server.ts                    # Servidor principal con gateway
├── handlers/
│   └── socket.handler.ts        # Manejo de WebSocket
├── middlewares/
│   ├── auth.middleware.ts       # Autenticación JWT
│   └── rate-limit.middleware.ts # Rate limiting
├── gateway/
│   ├── load-balancer.ts         # Load balancing + health checks
│   └── proxy-gateway.ts         # Proxy y transformaciones
└── utils/
    └── room-manager.ts          # Gestión de salas WebSocket
```

## 🚨 Troubleshooting

### Error: "Servicio no disponible"
- Verificar que los microservicios estén ejecutándose
- Revisar `/gateway/health` para ver estado de servicios

### Error: "Token inválido"
- Verificar que el JWT_SECRET coincida
- Generar nuevo token con `/auth/test-token`

### Error: "Rate limit excedido"
- Esperar a que pase la ventana de tiempo
- Ajustar límites en variables de entorno

### WebSocket no conecta
- Verificar CORS_ORIGIN en configuración
- Comprobar que el puerto 4001 esté disponible