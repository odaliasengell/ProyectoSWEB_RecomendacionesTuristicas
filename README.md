# 🌍 Sistema de Recomendaciones Turísticas

> **Proyecto Final** - Aplicación para el Servidor Web  
> **Docente:** John Cevallos    
> **Periodo:** 2025

---

## 👥 Integrantes del Equipo

| Integrante | Tecnología | Componente |
|------------|------------|------------|
| **Odalia Senge Loor** | TypeScript | GraphQL Service - Capa de Reportes |
| **Abigail Plúa** | Golang (Go) | WebSocket Server - Notificaciones en Tiempo Real |
| **Néstor Ayala** | Python | REST API - Backend Principal |

---

## 📋 Descripción del Proyecto

Sistema completo de recomendaciones turísticas que integra múltiples tecnologías y arquitecturas modernas. El proyecto implementa una arquitectura distribuida con microservicios que se comunican entre sí para proporcionar:

- ✅ Gestión completa de destinos, tours, guías y servicios turísticos
- 📊 Sistema de reportes y análisis con GraphQL
- 🔔 Notificaciones en tiempo real con WebSockets
- 👤 Autenticación y autorización con JWT
- 📱 Interfaz de usuario moderna y responsiva

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   REST API   │  │   GraphQL    │  │  WebSocket   │         │
│  │   Calls      │  │   Queries    │  │  Connection  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   REST API      │  │  GraphQL        │  │  WebSocket      │
│   (Python)      │◄─┤  Service        │  │  Server (Go)    │
│   FastAPI       │  │  (TypeScript)   │  │                 │
│   Puerto: 8000  │  │  Puerto: 4000   │  │  Puerto: 8080   │
└────────┬────────┘  └─────────────────┘  └────────▲────────┘
         │                                          │
         │          ┌─────────────────┐            │
         └─────────►│    MongoDB      │            │
                    │   Base de Datos │            │
                    └─────────────────┘            │
                                                   │
         HTTP Notify ◄─────────────────────────────┘
         (REST → WebSocket)
```

### Flujo de Datos

1. **CRUD Operations**: Frontend → REST API → MongoDB
2. **Reportes/Analytics**: Frontend → GraphQL → REST API → MongoDB
3. **Notificaciones**: 
   - REST API realiza operación → Envía evento HTTP → WebSocket Server
   - WebSocket Server → Broadcast → Todos los clientes conectados

---

## 🚀 Tecnologías Utilizadas

### Backend

| Servicio | Tecnología | Framework/Librería | Puerto | Responsable |
|----------|------------|-------------------|--------|-------------|
| **REST API** | Python 3.11+ | FastAPI, Beanie (ODM) | 8000 | Néstor Ayala |
| **GraphQL** | TypeScript | Apollo Server, Node.js | 4000 | Odalia Senge Loor |
| **WebSocket** | Go 1.21+ | Gorilla WebSocket | 8080 | Abigail Plúa |
| **AI Orchestrator** | Python 3.11+ | FastAPI, Gemini/OpenAI | 8004 | Pilar 3 - IA |
| **MCP Server** | Python 3.11+ | FastAPI, MCP Protocol | 8005 | Pilar 3 - IA |

### Frontend

| Tecnología | Propósito |
|------------|-----------|
| React 18 | Framework UI |
| TypeScript | Tipado estático |
| Vite | Build tool |
| Tailwind CSS | Estilos |
| React Router | Navegación |
| Axios | Cliente HTTP |
| Apollo Client | Cliente GraphQL |

### Base de Datos

- **MongoDB** - Base de datos NoSQL
- **Beanie** - ODM para Python/FastAPI

---

## 📦 Estructura del Proyecto

```
ProyectoSWEB_RecomendacionesTuristicas/
│
├── backend/
│   ├── rest-api/              # 🐍 Python - REST API
│   │   ├── app/
│   │   │   ├── auth/          # JWT y autenticación
│   │   │   ├── controllers/   # Lógica de negocio
│   │   │   ├── models/        # Modelos MongoDB (Beanie)
│   │   │   ├── routes/        # Endpoints REST
│   │   │   └── websocket_client.py  # Cliente para notificaciones
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── graphql-service/       # 📊 TypeScript - GraphQL
│   │   ├── src/
│   │   │   ├── datasource/    # Conexión con REST API
│   │   │   ├── resolvers/     # Lógica de queries
│   │   │   ├── schema/        # Schema GraphQL
│   │   │   ├── types.ts       # Tipos TypeScript
│   │   │   └── server.ts      # Apollo Server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── websocket-server/      # 🔔 Go - WebSocket
│   │   ├── main.go            # Servidor principal
│   │   ├── hub.go             # Hub de conexiones
│   │   ├── client.go          # Cliente WebSocket
│   │   ├── events.go          # Tipos de eventos
│   │   ├── go.mod
│   │   └── README.md
│   │
│   ├── ai-orchestrator/       # 🤖 Python - AI Orchestrator
│   │   ├── main.py            # FastAPI server
│   │   ├── llm_adapters.py    # Strategy Pattern (Gemini/OpenAI)
│   │   ├── multimodal_processor.py  # OCR y PDF
│   │   ├── mcp_client.py      # Cliente MCP
│   │   ├── requirements.txt
│   │   ├── .env
│   │   ├── start.ps1
│   │   ├── test_integration.ps1
│   │   ├── README.md
│   │   ├── EJEMPLOS_USO.md
│   │   └── CONFIGURACION_API_KEYS.md
│   │
│   └── mcp-server/            # 🔧 Python - MCP Tools Server
│       ├── main.py            # 5 herramientas MCP
│       ├── requirements.txt
│       ├── .env
│       ├── start.ps1
│       └── README.md
│
└── frontend/
    └── recomendaciones/       # ⚛️ React - Frontend
        ├── src/
        │   ├── components/    # Componentes reutilizables
        │   │   └── FloatingChatWidget.jsx  # 🤖 Chatbot IA
        │   ├── pages/         # Páginas principales
        │   ├── services/      # Servicios API
        │   │   ├── api/       # REST services
        │   │   └── graphql-client.js
        │   ├── hooks/         # Hooks personalizados
        │   │   └── useWebSocket.ts
        │   └── contexts/      # Contextos React
        ├── package.json
        └── README.md
```

---

## 🔧 Instalación y Configuración

### Requisitos Previos

- **Node.js** 18+ y npm
- **Python** 3.11+
- **Go** 1.21+
- **MongoDB** 5.0+ (local o Atlas)
- **Git**

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/odaliasengell/ProyectoSWEB_RecomendacionesTuristicas.git

cd ProyectoSWEB_RecomendacionesTuristicas
```

### 2️⃣ Configurar MongoDB

**Opción A: MongoDB Local**
```bash
# Instalar MongoDB Community Edition
# Iniciar el servicio
mongod --dbpath /ruta/a/tu/data
```

**Opción B: MongoDB Atlas (Cloud)**
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crear cluster gratuito
3. Obtener connection string
4. Configurar en `backend/rest-api/config.py`

### 3️⃣ Backend - REST API (Python)

```bash
cd backend/rest-api

# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual (Windows)
.\.venv\Scripts\activate

# Activar entorno virtual (Linux/Mac)
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (crear .env)
# DATABASE_URL=mongodb://localhost:27017
# SECRET_KEY=tu-clave-secreta-jwt
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=30

# Iniciar servidor
python main.py
# O usar el script de PowerShell
.\run.ps1
```

**Servidor corriendo en:** `http://localhost:8000`  
**Documentación Swagger:** `http://localhost:8000/docs`

### 4️⃣ Backend - GraphQL Service (TypeScript)

```bash
cd backend/graphql-service

# Instalar dependencias
npm install

# Configurar variables de entorno (crear .env)
# PORT=4000
# REST_API_URL=http://localhost:8000

# Iniciar en modo desarrollo
npm run dev

# O usar el script de PowerShell
.\start.ps1
```

**Servidor corriendo en:** `http://localhost:4000`  
**GraphQL Playground:** `http://localhost:4000/graphql`

### 5️⃣ Backend - WebSocket Server (Go)

```bash
cd backend/websocket-server

# Descargar dependencias
go mod download

# Iniciar servidor
go run .

# O usar el script de PowerShell
.\start.ps1
```

**Servidor corriendo en:** `http://localhost:8080`  
**WebSocket endpoint:** `ws://localhost:8080/ws`  
**Página de prueba:** `http://localhost:8080/`

### 6️⃣ Backend - AI Orchestrator (Pilar 3 - Python)

```bash
cd backend/ai-orchestrator

# Instalar Tesseract OCR (requerido para procesamiento de imágenes)
# Windows: choco install tesseract
# O descargar: https://github.com/UB-Mannheim/tesseract/wiki

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (crear .env)
# GEMINI_API_KEY=tu_clave_de_gemini
# OPENAI_API_KEY=tu_clave_de_openai
# MCP_SERVER_URL=http://localhost:8005

# Ver guía de configuración
notepad CONFIGURACION_API_KEYS.md

# Iniciar servidor
.\start.ps1
```

**Servidor corriendo en:** `http://localhost:8004`  
**Documentación Swagger:** `http://localhost:8004/docs`  
**Obtener API Keys:**
- Gemini: https://makersuite.google.com/app/apikey
- OpenAI: https://platform.openai.com/api-keys

### 7️⃣ Backend - MCP Server (Pilar 3 - Python)

```bash
cd backend/mcp-server

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
.\start.ps1
```

**Servidor corriendo en:** `http://localhost:8005`  
**Documentación Swagger:** `http://localhost:8005/docs`  
**Herramientas disponibles:** `http://localhost:8005/tools`

### 8️⃣ Frontend (React)

```bash
cd frontend/recomendaciones

# Instalar dependencias
npm install

# Configurar variables de entorno (crear .env)
# VITE_REST_API_URL=http://localhost:8000
# VITE_GRAPHQL_API_URL=http://localhost:4000/graphql
# VITE_WEBSOCKET_URL=ws://localhost:8083/ws

# Iniciar servidor de desarrollo
npm run dev

# O también puedes usar
npm start
```

**Aplicación corriendo en:** `http://localhost:5173`

### 🎯 Nuevos Componentes V2 (Enero 2026)

#### Componentes de UI Base para Segundo Parcial

1. **LoginV2** - Sistema de login moderno
   - Diseño con gradientes y glassmorphism
   - Preparado para JWT y refresh tokens
   - Panel informativo sobre microservicios
   - Responsive design

2. **DashboardV2** - Panel principal mejorado
   - Seguimiento de los 4 pilares del segundo parcial
   - Estadísticas en tiempo real
   - Estados de microservicios
   - WebSocket integration

3. **ChatBot** - Interfaz conversacional base
   - Soporte multimodal (texto, imagen, PDF, audio)
   - Preparado para MCP (Model Context Protocol)
   - Acciones rápidas para turismo
   - Flotante y minimizable

4. **PaymentForm** - Sistema de pagos base
   - Múltiples métodos de pago
   - Flujo completo de procesamiento
   - Mock adapter para desarrollo
   - Preparado para Payment Service

5. **MainDashboardPage** - Página principal integrada
   - Integra todos los componentes V2
   - Gestión centralizada de estados
   - FAB buttons para acciones rápidas

**Rutas nuevas:**
- `/login` - LoginV2 (nuevo diseño)
- `/dashboard` - MainDashboardPage (componentes integrados)
- `/login-old` - Login anterior (respaldo)

**Características técnicas:**
- TypeScript para type safety
- CSS modular con animaciones
- WebSocket para tiempo real
- Preparado para microservicios

---

## 🎯 Endpoints y APIs

### REST API (Puerto 8000)

#### Autenticación
```http
POST /usuarios/login         # Iniciar sesión
POST /usuarios/register      # Registrar usuario
```

#### Usuarios
```http
GET    /usuarios             # Listar usuarios
GET    /usuarios/{id}        # Obtener usuario
PUT    /usuarios/{id}        # Actualizar usuario
DELETE /usuarios/{id}        # Eliminar usuario
```

#### Destinos
```http
GET    /destinos             # Listar destinos
GET    /destinos/{id}        # Obtener destino
POST   /destinos             # Crear destino
PUT    /destinos/{id}        # Actualizar destino
DELETE /destinos/{id}        # Eliminar destino
```

#### Tours
```http
GET    /tours                # Listar tours
GET    /tours/{id}           # Obtener tour
POST   /tours                # Crear tour
PUT    /tours/{id}           # Actualizar tour
DELETE /tours/{id}           # Eliminar tour
```

#### Guías
```http
GET    /guias                # Listar guías
GET    /guias/{id}           # Obtener guía
POST   /guias                # Crear guía
PUT    /guias/{id}           # Actualizar guía
DELETE /guias/{id}           # Eliminar guía
```

#### Servicios
```http
GET    /servicios            # Listar servicios
GET    /servicios/{id}       # Obtener servicio
POST   /servicios            # Crear servicio
PUT    /servicios/{id}       # Actualizar servicio
DELETE /servicios/{id}       # Eliminar servicio
```

#### Reservas
```http
GET    /reservas             # Listar reservas
GET    /reservas/{id}        # Obtener reserva
POST   /reservas             # Crear reserva
PUT    /reservas/{id}        # Actualizar reserva
DELETE /reservas/{id}        # Eliminar reserva
```

#### Recomendaciones
```http
GET    /recomendaciones      # Listar recomendaciones
GET    /recomendaciones/{id} # Obtener recomendación
POST   /recomendaciones      # Crear recomendación
PUT    /recomendaciones/{id} # Actualizar recomendación
DELETE /recomendaciones/{id} # Eliminar recomendación
```

#### Contrataciones
```http
GET    /contrataciones       # Listar contrataciones
GET    /contrataciones/{id}  # Obtener contratación
POST   /contrataciones       # Crear contratación
PUT    /contrataciones/{id}  # Actualizar contratación
DELETE /contrataciones/{id}  # Eliminar contratación
```

**Documentación completa:** `http://localhost:8000/docs`

---

### GraphQL API (Puerto 4000)

#### Queries de Consulta

```graphql
# Obtener todos los tours
query {
  tours {
    _id
    nombre
    descripcion
    precio
    duracion
    capacidad_maxima
    guia {
      nombre
      idiomas
    }
    destino {
      nombre
      ubicacion
    }
  }
}

# Obtener estadísticas generales
query {
  estadisticasGenerales {
    total_usuarios
    total_destinos
    total_tours
    total_reservas
    total_ingresos
    reservas_pendientes
    reservas_confirmadas
  }
}

# Top 5 tours más reservados
query {
  toursTop(limit: 5) {
    tour {
      nombre
      precio
      destino { nombre }
    }
    total_reservas
    total_personas
    ingresos_totales
  }
}

# Guías más activos
query {
  guiasTop(limit: 5) {
    guia {
      nombre
      idiomas
      calificacion
    }
    total_tours
    total_reservas
    calificacion_promedio
  }
}

# Destinos populares
query {
  destinosPopulares(limit: 5) {
    destino {
      nombre
      ubicacion
      categoria
    }
    total_tours
    total_reservas
    calificacion_promedio
  }
}

# Ingresos por mes
query {
  reservasPorMes(anio: 2025) {
    mes
    anio
    total_reservas
    total_ingresos
    ingresos_promedio
  }
}
```

**GraphQL Playground:** `http://localhost:4000/graphql`  
**Ejemplos completos:** Ver `backend/graphql-service/EJEMPLOS_QUERIES.md`

---

### WebSocket Server (Puerto 8080)

#### Conexión WebSocket

```javascript
// Conectar desde el cliente
const ws = new WebSocket('ws://localhost:8080/ws');

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('Notificación recibida:', notification);
};
```

#### Endpoint de Notificación (HTTP)

```http
POST http://localhost:8080/notify
Content-Type: application/json

{
  "type": "usuario_registrado",
  "message": "Nuevo usuario registrado: Juan Pérez",
  "data": {
    "userId": "123abc",
    "email": "juan@example.com",
    "role": "turista"
  }
}
```

#### Tipos de Eventos Soportados

**Eventos de Usuario:**
- `usuario_registrado` - Nuevo usuario creado
- `usuario_inicio_sesion` - Usuario autenticado

**Eventos de Reserva:**
- `reserva_creada` - Nueva reserva
- `reserva_actualizada` - Reserva modificada
- `reserva_cancelada` - Reserva cancelada

**Eventos de Servicios:**
- `servicio_contratado` - Nuevo servicio contratado

**Eventos de Administración:**
- `tour_creado`, `tour_actualizado`, `tour_eliminado`
- `servicio_creado`, `servicio_actualizado`, `servicio_eliminado`
- `destino_creado`, `destino_actualizado`, `destino_eliminado`
- `guia_creado`, `guia_actualizado`, `guia_eliminado`

**Eventos de Recomendaciones:**
- `recomendacion_creada` - Nueva recomendación publicada

**Página de prueba:** `http://localhost:8080/`

---

### AI Orchestrator API (Puerto 8004) - 🤖 Pilar 3

El AI Orchestrator proporciona capacidades de IA conversacional multimodal.

#### Endpoints de Chat

```http
POST /chat/text              # Chat de texto simple
POST /chat/image             # Procesar imágenes con OCR
POST /chat/pdf               # Extraer información de PDFs
POST /chat/multimodal        # Endpoint unificado multimodal
GET  /providers              # Listar proveedores IA disponibles
GET  /tools                  # Listar herramientas MCP
DELETE /conversation/{id}    # Limpiar historial de conversación
```

#### Ejemplo: Chat de Texto

```bash
curl -X POST http://localhost:8004/chat/text \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Busca destinos de playa disponibles",
    "provider": "gemini",
    "use_tools": true
  }'
```

Respuesta:
```json
{
  "response": "Encontré estos destinos de playa: Máncora ($80), Paracas ($65)...",
  "conversation_id": "conv_123",
  "tools_used": ["buscar_destinos"],
  "provider": "gemini"
}
```

#### Ejemplo: Análisis de Imagen

```bash
curl -X POST http://localhost:8004/chat/image \
  -F "image=@ticket.jpg" \
  -F "message=Analiza este ticket" \
  -F "provider=gemini"
```

**Proveedores soportados:**
- **Gemini** (Google AI) - Recomendado para desarrollo (tier gratuito)
- **OpenAI** (GPT-3.5) - Alternativa de pago

**Documentación completa:** `http://localhost:8004/docs`

---

### MCP Server API (Puerto 8005) - 🔧 Pilar 3

El MCP (Model Context Protocol) Server proporciona herramientas que el LLM puede invocar.

#### Herramientas Implementadas (5)

**Consulta (3):**
```http
POST /tools/buscar_destinos   # Buscar destinos turísticos
POST /tools/ver_reserva        # Consultar información de reserva
POST /tools/buscar_guias       # Buscar guías turísticos
```

**Acción (1):**
```http
POST /tools/crear_reserva      # Crear nueva reserva
```

**Reporte (1):**
```http
POST /tools/estadisticas_ventas  # Generar reportes de ventas
```

#### Ejemplo: Buscar Destinos

```bash
curl -X POST http://localhost:8005/tools/buscar_destinos \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "query": "playa",
      "categoria": "playa"
    }
  }'
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "destinos": [
      {
        "id": 1,
        "nombre": "Máncora",
        "categoria": "playa",
        "precio": 80.00,
        "disponible": true
      }
    ],
    "total": 3
  }
}
```

#### Ejemplo: Crear Reserva

```bash
curl -X POST http://localhost:8005/tools/crear_reserva \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "destino_id": 1,
      "fecha": "2026-02-15",
      "personas": 2
    }
  }'
```

**Documentación completa:** `http://localhost:8005/docs`  
**Listar herramientas:** `http://localhost:8005/tools`

---

## 🔗 Integración Entre Servicios

### 1. REST API → WebSocket

Cada vez que ocurre una acción importante en la REST API, se envía una notificación al servidor WebSocket:

```python
# Ejemplo en REST API (Python)
from app.websocket_client import enviar_notificacion

# Después de crear un usuario
await enviar_notificacion(
    tipo="usuario_registrado",
    mensaje=f"Nuevo usuario: {usuario.nombre}",
    data={
        "userId": str(usuario.id),
        "email": usuario.email,
        "rol": usuario.rol
    }
)
```

**Implementado en:**
- ✅ `usuario_routes.py` - Registro y login
- ✅ `reserva_routes.py` - Creación de reservas
- ✅ `tour_routes.py` - CRUD de tours
- ✅ `servicio_routes.py` - CRUD de servicios
- ✅ `destino_routes.py` - CRUD de destinos
- ✅ `guia_routes.py` - CRUD de guías
- ✅ `recomendacion_routes.py` - Creación de recomendaciones
- ✅ `contratacion_routes.py` - Contratación de servicios

### 2. GraphQL → REST API

El servicio GraphQL obtiene datos de la REST API:

```typescript
// datasource/restAPI.ts
export class RestAPIDataSource {
  async getTours(): Promise<Tour[]> {
    const response = await axios.get(`${REST_API_URL}/tours`);
    return response.data;
  }
  
  async getEstadisticas() {
    // Obtiene datos de múltiples endpoints
    // Procesa y agrega la información
    // Retorna estadísticas consolidadas
  }
}
```

### 3. Frontend → REST API

Operaciones CRUD estándar:

```typescript
// services/api/tours.service.ts
import api from './axios.config';

export const getTours = async () => {
  const response = await api.get('/tours');
  return response.data;
};

export const createTour = async (data) => {
  const response = await api.post('/tours', data);
  return response.data;
};
```

### 4. Frontend → GraphQL

Consultas de reportes y análisis:

```javascript
// services/graphql-client.js
export const executeQuery = async (query, variables = {}) => {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  return response.json();
};

// Usar en componentes
const data = await executeQuery(GET_ESTADISTICAS);
```

### 5. Frontend → WebSocket

Recepción de notificaciones en tiempo real:

```typescript
// hooks/useWebSocket.ts
export const useWebSocket = (onMessage) => {
  const ws = useRef(new WebSocket(WEBSOCKET_URL));
  
  ws.current.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data); // Callback personalizado
  };
  
  return { isConnected, notifications };
};
```

---

## 📊 Modelos de Datos

### Usuario
```typescript
{
  _id: ObjectId,
  nombre: string,
  apellido: string,
  email: string,
  username: string,
  contrasena: string (hash),
  fecha_nacimiento?: string,
  pais?: string,
  rol: "turista" | "admin",
  fecha_registro: DateTime
}
```

### Destino
```typescript
{
  _id: ObjectId,
  nombre: string,
  descripcion: string,
  ubicacion: string,
  ruta: string,
  provincia: string,
  ciudad: string,
  categoria: string,
  calificacion_promedio: number,
  activo: boolean,
  imagen_url?: string,
  fecha_creacion: DateTime
}
```

### Tour
```typescript
{
  _id: ObjectId,
  nombre: string,
  descripcion: string,
  duracion: string,
  precio: number,
  guia_id: ObjectId,
  destino_id: ObjectId,
  capacidad_maxima: number,
  disponible: boolean,
  imagen_url?: string,
  created_at: DateTime
}
```

### Guia
```typescript
{
  _id: ObjectId,
  id_guia: number,
  nombre: string,
  email: string,
  idiomas: string[],
  experiencia: string,
  disponible: boolean,
  calificacion: number,
  foto_url?: string,
  created_at: DateTime
}
```

### Servicio
```typescript
{
  _id: ObjectId,
  nombre: string,
  descripcion: string,
  precio: number,
  categoria: string,
  destino: string,
  disponible: boolean,
  imagen_url?: string,
  created_at: DateTime
}
```

### Reserva
```typescript
{
  _id: ObjectId,
  tour_id: ObjectId,
  usuario_id: ObjectId,
  fecha_reserva: DateTime,
  cantidad_personas: number,
  estado: "pendiente" | "confirmada" | "completada" | "cancelada",
  total: number,
  created_at: DateTime
}
```

### Recomendacion
```typescript
{
  _id: ObjectId,
  fecha: DateTime,
  calificacion: number (1-5),
  comentario: string,
  id_usuario: ObjectId,
  id_tour?: ObjectId,
  id_servicio?: ObjectId,
  tipo_recomendacion: "tour" | "servicio",
  nombre_referencia: string
}
```

### Contratacion
```typescript
{
  _id: ObjectId,
  servicio_id: ObjectId,
  usuario_id: ObjectId,
  fecha_inicio: DateTime,
  fecha_fin: DateTime,
  cantidad_personas: number,
  total: number,
  estado: "pendiente" | "confirmada" | "completada" | "cancelada",
  created_at: DateTime
}
```

---

## 🎨 Funcionalidades del Sistema

### Para Usuarios Turistas

1. **Explorar Destinos**
   - Ver catálogo de destinos turísticos
   - Filtrar por provincia, ciudad, categoría
   - Ver detalles y calificaciones

2. **Buscar Tours**
   - Explorar tours disponibles
   - Ver información de guías
   - Verificar disponibilidad y precios

3. **Realizar Reservas**
   - Reservar tours para fechas específicas
   - Seleccionar cantidad de personas
   - Ver estado de reservas

4. **Contratar Servicios**
   - Explorar servicios adicionales
   - Contratar servicios complementarios
   - Gestionar contrataciones

5. **Dejar Recomendaciones**
   - Calificar tours y servicios
   - Escribir comentarios
   - Ayudar a otros viajeros

6. **Gestión de Perfil**
   - Actualizar información personal
   - Ver historial de reservas
   - Ver recomendaciones realizadas

### Para Administradores

1. **Dashboard Administrativo**
   - Ver estadísticas en tiempo real
   - Monitorear actividad del sistema
   - Visualizar KPIs principales

2. **Gestión de Destinos**
   - Crear/editar/eliminar destinos
   - Subir imágenes
   - Gestionar información detallada

3. **Gestión de Tours**
   - Administrar catálogo de tours
   - Asignar guías
   - Configurar precios y disponibilidad

4. **Gestión de Guías**
   - Registrar guías turísticos
   - Actualizar información
   - Gestionar disponibilidad

5. **Gestión de Servicios**
   - Administrar servicios adicionales
   - Configurar precios
   - Controlar disponibilidad

6. **Gestión de Usuarios**
   - Ver todos los usuarios registrados
   - Ver detalles de actividad
   - Gestionar permisos

7. **Reportes y Analytics** (GraphQL)
   - Tours más populares
   - Guías más activos
   - Destinos más visitados
   - Análisis de ingresos
   - Estadísticas mensuales
   - KPIs del negocio

8. **Notificaciones en Tiempo Real** (WebSocket)
   - Nuevos usuarios registrados
   - Reservas creadas/actualizadas
   - Servicios contratados
   - Cambios en el sistema

---

## 🧪 Pruebas y Testing

### Probar REST API

**Con cURL:**
```bash
# Login
curl -X POST http://localhost:8000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Obtener tours
curl http://localhost:8000/tours
```

**Con Postman/Insomnia:**
- Importar colección desde `http://localhost:8000/docs`
- Configurar token JWT en headers

### Probar GraphQL

**Desde GraphQL Playground:**
1. Abrir `http://localhost:4000/graphql`
2. Escribir query
3. Ejecutar

**Ejemplo:**
```graphql
{
  estadisticasGenerales {
    total_usuarios
    total_tours
    total_ingresos
  }
}
```

### Probar WebSocket

**Desde navegador:**
1. Abrir `http://localhost:8080/`
2. Click en "Conectar"
3. Click en "Enviar prueba"

**Con código JavaScript:**
```javascript
const ws = new WebSocket('ws://localhost:8080/ws');
ws.onopen = () => console.log('Conectado');
ws.onmessage = (e) => console.log('Mensaje:', JSON.parse(e.data));
```

**Enviar notificación de prueba:**
```bash
curl -X POST http://localhost:8080/notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test",
    "message": "Prueba de notificación",
    "data": {}
  }'
```

---

## 🔐 Seguridad

### Autenticación JWT

- **Algoritmo:** HS256
- **Expiración:** 30 minutos (configurable)
- **Storage:** localStorage (frontend)
- **Headers:** `Authorization: Bearer <token>`

### Roles de Usuario

- **turista:** Acceso a funcionalidades públicas y reservas
- **admin:** Acceso completo al dashboard administrativo

### Protección de Rutas

**Frontend:**
- `ProtectedRoute` - Requiere autenticación
- `ProtectedAdminRoute` - Requiere rol admin

**Backend:**
- Middleware de autenticación en endpoints protegidos
- Validación de roles en operaciones administrativas

### CORS

Configurado en todos los servicios para permitir comunicación entre puertos:
- REST API: Permite orígenes configurables
- GraphQL: CORS habilitado
- WebSocket: CORS middleware

---

## 📱 Capturas de Pantalla

### Landing Page
![Landing Page](./docs/screenshots/landing.png)
> Página de inicio con destinos destacados

### Dashboard Administrativo
![Admin Dashboard](./docs/screenshots/admin-dashboard.png)
> Panel de control con estadísticas en tiempo real

### Reportes GraphQL
![Reportes](./docs/screenshots/reportes.png)
> Visualización de reportes y analytics

### Notificaciones WebSocket
![Notificaciones](./docs/screenshots/notificaciones.png)
> Panel de notificaciones en tiempo real

---

## 🚀 Despliegue

### Backend REST API (Python)

**Opciones:**
- Railway
- Render
- Heroku
- DigitalOcean

**Requisitos:**
- Configurar `MONGODB_URL` como variable de entorno
- Configurar `SECRET_KEY` para JWT
- Instalar dependencias con `pip install -r requirements.txt`

### GraphQL Service (TypeScript)

**Opciones:**
- Vercel
- Render
- Railway
- Heroku

**Requisitos:**
- Configurar `REST_API_URL` apuntando al backend desplegado
- Build: `npm run build`
- Start: `npm start`

### WebSocket Server (Go)

**Opciones:**
- Railway
- Render
- DigitalOcean
- Fly.io

**Requisitos:**
- Build: `go build -o server`
- Run: `./server`
- Puerto: 8080

### Frontend (React)

**Opciones:**
- Vercel (recomendado)
- Netlify
- GitHub Pages

**Configuración:**
- Build command: `npm run build`
- Output directory: `dist`
- Configurar variables de entorno en el hosting

---

## 📚 Documentación Adicional

Cada componente tiene su propia documentación detallada:

- 📖 [REST API Documentation](./backend/rest-api/README.md)
- 📖 [GraphQL Service Documentation](./backend/graphql-service/README.md)
- 📖 [WebSocket Server Documentation](./backend/websocket-server/README.md)
- 📖 [Frontend Documentation](./frontend/recomendaciones/README.md)

### Documentación GraphQL

- 📋 [Ejemplos de Queries](./backend/graphql-service/EJEMPLOS_QUERIES.md)

### Documentación WebSocket

- 🏗️ [Arquitectura WebSocket](./backend/websocket-server/ARQUITECTURA.md)
- 🚀 [Quick Start Guide](./backend/websocket-server/QUICK_START.md)
- 📡 [Ejemplos de Integración](./backend/websocket-server/EJEMPLOS_INTEGRACION.md)
- 📊 [Resumen Ejecutivo](./backend/websocket-server/RESUMEN_EJECUTIVO.md)

---

## 🐛 Solución de Problemas

### MongoDB no conecta

```bash
# Verificar que MongoDB está corriendo
mongod --version

# Si usas MongoDB Atlas, verifica:
# 1. IP whitelist (0.0.0.0/0 para desarrollo)
# 2. Usuario y contraseña correctos
# 3. Connection string en config.py
```

### Puerto ya en uso

```bash
# Windows (PowerShell)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

### CORS errors

Verificar configuración de CORS en cada servicio:
- REST API: `main.py` - CORSMiddleware
- GraphQL: `server.ts` - cors option
- WebSocket: `main.go` - CORS headers

### WebSocket no conecta

1. Verificar que el servidor Go está corriendo: `http://localhost:8080`
2. Verificar URL en frontend: `ws://localhost:8080/ws`
3. Revisar logs del servidor WebSocket

### GraphQL no obtiene datos

1. Verificar que REST API está corriendo
2. Verificar `REST_API_URL` en `.env`
3. Probar endpoints REST directamente
4. Revisar logs del servicio GraphQL

---

## 📈 Mejoras Futuras

- [ ] Sistema de pagos integrado (Stripe/PayPal)
- [ ] Notificaciones push móviles
- [ ] Chat en tiempo real entre usuarios y guías
- [ ] Sistema de cupones y descuentos
- [ ] Integración con mapas (Google Maps API)
- [ ] Sistema de calificaciones más robusto
- [ ] Multiidioma (i18n)
- [ ] App móvil (React Native)
- [ ] Sistema de favoritos
- [ ] Búsqueda avanzada con filtros

---

## 🤝 Contribuciones

Este proyecto fue desarrollado como trabajo final de la asignatura **Aplicación para el Servidor Web**.

### Distribución de Trabajo

**Odalia Senge Loor** - GraphQL Service
- Diseño del schema GraphQL
- Implementación de resolvers
- Queries de reportes y analytics
- Integración con REST API
- Optimización de consultas

**Abigail Plúa** - WebSocket Server
- Arquitectura del servidor WebSocket
- Sistema de broadcast
- Gestión de conexiones
- Tipos de eventos
- Documentación técnica

**Néstor Ayala** - REST API
- Diseño de la API REST
- Modelos de datos (MongoDB/Beanie)
- Sistema de autenticación JWT
- CRUD de todas las entidades
- Integración con WebSocket

**Trabajo Colaborativo:**
- Frontend React (desarrollo conjunto)
- Integración entre servicios
- Testing y debugging
- Documentación

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 📞 Contacto

**Docente:**  
John Cevallos  
[joancemac@gmail.com](mailto:joancemac@gmail.com)

**Equipo de Desarrollo:**
- Odalia Senge Loor - [GitHub](https://github.com/odaliasengell)
- Abigail Plúa
- Néstor Ayala

---

## 🙏 Agradecimientos

- A nuestro docente John Cevallos por su guía durante el desarrollo del proyecto
- A la comunidad de desarrolladores por las herramientas open source utilizadas
- A todos los que contribuyeron con feedback y sugerencias

---

<div align="center">

**Sistema de Recomendaciones Turísticas**  
Desarrollado con ❤️ por el equipo de desarrollo

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8.svg)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://www.mongodb.com/)

</div>
