# 🌍 Sistema de Recomendaciones Turísticas

> **Proyecto Final** - Aplicación para el Servidor Web  
> **Docente:** John Cevallos    
> **Periodo:** 2025 - 2026  
> **Universidad Laica Eloy Alfaro de Manabí**  
> **Facultad de Ciencias de la Vida y Tecnologías**  
> **Carrera de Software - Nivel: Quinto**

---

## 📌 Estado del Proyecto

### ✅ Primer Parcial (COMPLETADO)
- REST API con FastAPI ✅
- GraphQL Service con Apollo Server ✅
- WebSocket Server con Go ✅
- Frontend con React + TypeScript ✅
- MongoDB como base de datos ✅

### 🚀 Segundo Parcial (EN PROGRESO - 80% COMPLETADO)
- **Pilar 1:** Auth Service con JWT ✅
- **Pilar 2:** Payment Service + Webhooks B2B ✅
- **Pilar 3:** MCP + Chatbot Multimodal con IA ✅
- **Pilar 4:** n8n Event Bus ⚠️ (En configuración)
- Integración bidireccional con Equipo B ✅
- Frontend extendido con nuevos módulos ✅

---

## 👥 Integrantes del Equipo

| Integrante | Tecnología | Componente |
|------------|------------|------------|
| **Odalia Senge Loor** | TypeScript | GraphQL Service - Capa de Reportes |
| **Abigail Plúa** | Golang (Go) | WebSocket Server - Notificaciones en Tiempo Real |
| **Néstor Ayala** | Python | REST API - Backend Principal |

---

## 📋 Descripción del Proyecto

### Primer Parcial - Fundamentos del Sistema

Sistema completo de recomendaciones turísticas que integra múltiples tecnologías y arquitecturas modernas. El proyecto implementa una arquitectura distribuida con microservicios que se comunican entre sí para proporcionar:

- ✅ Gestión completa de destinos, tours, guías y servicios turísticos
- 📊 Sistema de reportes y análisis con GraphQL
- 🔔 Notificaciones en tiempo real con WebSockets
- 👤 Autenticación y autorización con JWT
- 📱 Interfaz de usuario moderna y responsiva

### Segundo Parcial - Arquitectura Avanzada de Microservicios

**Objetivo General:** Extender el sistema mediante la implementación de una arquitectura de microservicios robusta que integre autenticación centralizada, pasarelas de pago con webhooks, inteligencia artificial conversacional mediante MCP (Model Context Protocol), y orquestación de eventos con n8n.

#### Los 4 Pilares Arquitectónicos

**🔐 Pilar 1: Microservicio de Autenticación (15%)**
- Auth Service independiente con base de datos propia
- JWT con access y refresh tokens
- Validación local de tokens (sin llamadas constantes al Auth Service)
- Seguridad: Rate limiting, blacklist de tokens revocados
- **Estado:** ✅ COMPLETADO (100%)

**💳 Pilar 2: Webhooks e Interoperabilidad B2B (20%)**
- Payment Service Wrapper con patrón Adapter
- Adapters: StripeAdapter, MercadoPagoAdapter, MockAdapter
- Registro de Partners para integración empresarial
- Autenticación HMAC-SHA256 en webhooks
- Comunicación bidireccional con Equipo B
- **Estado:** ✅ COMPLETADO (100%)

**🤖 Pilar 3: MCP - Chatbot Multimodal con IA (20%)**
- AI Orchestrator con patrón Strategy para LLMs
- Soporte multimodal: Texto, imágenes (OCR), PDFs, audio
- 5 Herramientas MCP implementadas
- Integración con Gemini/OpenAI
- Chat UI flotante en frontend
- **Estado:** ✅ COMPLETADO (100%)

**⚡ Pilar 4: n8n - Event Bus (15%)**
- Centralización de eventos externos
- Workflows: Payment Handler, Partner Handler, Scheduled Tasks
- Integración con todos los microservicios
- **Estado:** ⚠️ EN CONFIGURACIÓN (60%)

---

## 🏗️ Arquitectura del Sistema

### Arquitectura Completa - Primer y Segundo Parcial

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + TypeScript)                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  REST API  │  │  GraphQL   │  │ WebSocket  │  │  Chat IA   │       │
│  │   Calls    │  │  Queries   │  │ Connection │  │  Widget    │       │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘       │
└─────────┼────────────────┼────────────────┼────────────────┼───────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────┐  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│   REST API      │  │  GraphQL    │  │  WebSocket   │  │ AI Orches-  │
│   (Python)      │◄─┤  Service    │  │  Server (Go) │  │ trator      │
│   FastAPI       │  │(TypeScript) │  │              │  │ (Python)    │
│   Puerto: 8000  │  │Puerto: 4000 │  │Puerto: 8083  │  │Puerto: 8004 │
└────────┬────────┘  └─────────────┘  └──────▲───────┘  └──────┬──────┘
         │                                    │                 │
         │          ┌─────────────┐          │                 │
         ├─────────►│   MongoDB   │          │                 │
         │          └─────────────┘          │                 ▼
         │                                    │          ┌─────────────┐
         ▼                                    │          │ MCP Server  │
┌─────────────────┐                          │          │ (Python)    │
│  Auth Service   │                          │          │Puerto: 8005 │
│  (Python)       │                          │          └─────────────┘
│  Puerto: 8001   │                          │
└─────────────────┘                          │
         │                                    │
         ▼                                    │
┌─────────────────┐                          │
│ Payment Service │                          │
│  (Python)       │──────HTTP Notify─────────┘
│  Puerto: 8002   │          
└─────────────────┘          
         │
         ▼
┌─────────────────┐
│  n8n Event Bus  │ ⚡ Workflows de automatización
│  (Docker)       │
│  Puerto: 5678   │
└─────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Webhooks Bidireccionales con Equipo B  │
│  HMAC-SHA256 Authentication              │
└──────────────────────────────────────────┘
```

### Flujo de Datos del Sistema Completo

**1. Operaciones CRUD (Primer Parcial):**
- Frontend → REST API → MongoDB
- Notificaciones: REST API → WebSocket Server → Todos los clientes

**2. Reportes y Analytics (Primer Parcial):**
- Frontend → GraphQL → REST API → MongoDB
- Agregación y análisis de datos

**3. Autenticación (Segundo Parcial - Pilar 1):**
- Login: Frontend → Auth Service → JWT (access + refresh tokens)
- Validación: Cualquier servicio valida localmente sin llamar a Auth Service
- Renovación: Frontend → Auth Service (refresh token) → Nuevo access token

**4. Pagos (Segundo Parcial - Pilar 2):**
- Frontend → Payment Service → Adapter (Stripe/MP/Mock) → Pasarela
- Webhook: Pasarela → Payment Service → Validación HMAC → Activar servicio
- Notificación: Payment Service → WebSocket → Usuario
- Integración B2B: Payment Service → Equipo B (webhook firmado HMAC)

**5. Chatbot IA (Segundo Parcial - Pilar 3):**
- Frontend → AI Orchestrator → LLM Provider (Gemini/OpenAI)
- Con herramientas: AI Orchestrator → MCP Server → Acción en MongoDB
- Multimodal: Imagen/PDF → OCR → Extracción → Respuesta IA

**6. Event Bus (Segundo Parcial - Pilar 4):**
- Todos los eventos externos → n8n → Procesamiento → Servicios internos
- n8n → Email notifications, Slack, Webhooks, Tareas programadas

---

## 🚀 Tecnologías Utilizadas

### Backend - Microservicios

| Servicio | Tecnología | Framework/Librería | Puerto | Responsable | Pilar |
|----------|------------|-------------------|--------|-------------|-------|
| **REST API** | Python 3.11+ | FastAPI, Beanie (ODM) | 8000 | Néstor Ayala | P1 |
| **GraphQL** | TypeScript | Apollo Server, Node.js | 4000 | Odalia Senge Loor | P1 |
| **WebSocket** | Go 1.21+ | Gorilla WebSocket | 8083 | Abigail Plúa | P1 |
| **Auth Service** | Python 3.11+ | FastAPI, PyJWT | 8001 | Equipo | Pilar 1 |
| **Payment Service** | Python 3.11+ | FastAPI, Stripe SDK | 8002 | Equipo | Pilar 2 |
| **AI Orchestrator** | Python 3.11+ | FastAPI, Gemini/OpenAI | 8004 | Equipo | Pilar 3 |
| **MCP Server** | Python 3.11+ | FastAPI, MCP Protocol | 8005 | Equipo | Pilar 3 |
| **n8n Event Bus** | Docker | n8n Workflows | 5678 | Equipo | Pilar 4 |

### Frontend

| Tecnología | Propósito | Parcial |
|------------|-----------|---------|
| React 18 | Framework UI | 1 y 2 |
| TypeScript | Tipado estático | 1 y 2 |
| Vite | Build tool | 1 y 2 |
| Tailwind CSS | Estilos | 1 y 2 |
| React Router | Navegación | 1 y 2 |
| Axios | Cliente HTTP | 1 y 2 |
| Apollo Client | Cliente GraphQL | 1 |
| **Chat Widget** | Chatbot IA flotante | **2 (Pilar 3)** |
| **Payment UI** | Formularios de pago | **2 (Pilar 2)** |

### Patrones de Diseño Implementados (Segundo Parcial)

- **Adapter Pattern:** Payment Providers y LLM Providers
- **Strategy Pattern:** Intercambio de implementaciones de LLM
- **Factory Pattern:** Instanciación de providers según configuración
- **Observer Pattern:** Sistema de eventos y webhooks

### Seguridad

- **JWT:** Access tokens (30 min) + Refresh tokens
- **HMAC-SHA256:** Firma y validación de webhooks
- **Rate Limiting:** Protección contra ataques de fuerza bruta
- **Token Blacklist:** Revocación de tokens comprometidos
- **CORS:** Configurado en todos los servicios
- **Environment Variables:** Claves secretas en archivos .env

### Base de Datos

- **MongoDB** - Base de datos NoSQL
- **Beanie** - ODM para Python/FastAPI
- **Bases de datos separadas por servicio (Microservicios):**
  - `turismo_db` - REST API principal
  - `auth_db` - Auth Service
  - `payment_db` - Payment Service

---

## 📦 Estructura del Proyecto

```
ProyectoSWEB_RecomendacionesTuristicas/
│
├── backend/
│   ├── rest-api/              # 🐍 Python - REST API (Primer Parcial)
│   │   ├── app/
│   │   │   ├── auth/          # JWT y autenticación
│   │   │   ├── controllers/   # Lógica de negocio
│   │   │   ├── models/        # Modelos MongoDB (Beanie)
│   │   │   ├── routes/        # Endpoints REST
│   │   │   │   ├── integracion_routes.py  # 🆕 Integración Equipo B
│   │   │   │   └── ...        # Otros endpoints
│   │   │   └── websocket_client.py  # Cliente para notificaciones
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── auth-service/          # 🔐 Python - Auth Service (PILAR 1)
│   │   ├── config.py          # Configuración JWT + refresh tokens
│   │   ├── jwt_service.py     # Generación y validación de tokens
│   │   ├── local_jwt_validator.py  # Validación local sin llamadas
│   │   ├── main.py            # FastAPI server
│   │   ├── models.py          # User, RefreshToken, RevokedToken
│   │   ├── routes.py          # /auth/login, /register, /refresh, etc
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── requirements.txt
│   │   ├── run.ps1            # Script de inicio
│   │   ├── .env               # JWT_SECRET_KEY sincronizada
│   │   ├── README.md
│   │   └── TESTING_GUIDE.md   # Guía de pruebas
│   │
│   ├── payment-service/       # 💳 Python - Payment Service (PILAR 2)
│   │   ├── adapters/          # Patrón Adapter
│   │   │   ├── base_adapter.py      # Interface PaymentProvider
│   │   │   ├── stripe_adapter.py    # StripeAdapter
│   │   │   ├── mercadopago_adapter.py  # MercadoPagoAdapter
│   │   │   └── mock_adapter.py      # MockAdapter (desarrollo)
│   │   ├── config.py          # Configuración de pasarelas
│   │   ├── jwt_service.py     # Validación JWT
│   │   ├── local_jwt_validator.py  # Validación local
│   │   ├── main.py            # FastAPI server
│   │   ├── models.py          # Payment, Partner, Webhook
│   │   ├── routes.py          # /payments/, /webhooks/, /partners/
│   │   ├── webhooks.py        # Gestión de webhooks HMAC
│   │   ├── requirements.txt
│   │   ├── run.ps1
│   │   ├── .env               # STRIPE_KEY, INTEGRACION_SECRET_KEY
│   │   └── README.md
│   │
│   ├── graphql-service/       # 📊 TypeScript - GraphQL (Primer Parcial)
│   │   ├── src/
│   │   │   ├── datasource/    # Conexión con REST API
│   │   │   ├── resolvers/     # Lógica de queries
│   │   │   ├── schema/        # Schema GraphQL
│   │   │   ├── types.ts       # Tipos TypeScript
│   │   │   └── server.ts      # Apollo Server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── README.md
│   │   └── EJEMPLOS_QUERIES.md
│   │
│   ├── websocket-server/      # 🔔 Go - WebSocket (Primer Parcial)
│   │   ├── main.go            # Servidor principal + Dashboard HTML
│   │   ├── hub.go             # Hub de conexiones
│   │   ├── client.go          # Cliente WebSocket
│   │   ├── events.go          # Tipos de eventos
│   │   ├── go.mod
│   │   ├── README.md
│   │   └── start.ps1
│   │
│   ├── ai-orchestrator/       # 🤖 Python - AI Orchestrator (PILAR 3)
│   │   ├── llm_adapters.py    # Strategy Pattern (Gemini/OpenAI)
│   │   ├── multimodal_processor.py  # OCR, PDF, Audio
│   │   ├── mcp_client.py      # Cliente MCP
│   │   ├── main.py            # FastAPI server
│   │   ├── requirements.txt
│   │   ├── .env               # GEMINI_API_KEY, OPENAI_API_KEY
│   │   ├── start.ps1
│   │   ├── test_integration.ps1
│   │   ├── README.md
│   │   ├── EJEMPLOS_USO.md
│   │   └── CONFIGURACION_API_KEYS.md
│   │
│   ├── mcp-server/            # 🔧 Python - MCP Tools Server (PILAR 3)
│   │   ├── main.py            # 5 herramientas MCP
│   │   ├── requirements.txt
│   │   ├── .env
│   │   ├── start.ps1
│   │   └── README.md
│   │
│   └── n8n-workflows/         # ⚡ n8n - Event Bus (PILAR 4)
│       ├── docker-compose.yml        # Configuración Docker
│       ├── docker-compose.dev.yml    # Modo desarrollo
│       ├── workflows/                # Workflows JSON exportados
│       │   ├── payment_handler.json
│       │   ├── partner_handler.json
│       │   └── scheduled_tasks.json
│       ├── start_n8n_docker.ps1
│       ├── start_n8n_docker.sh
│       ├── README.md
│       └── DOCKER_SETUP_COMPLETO.md
│
├── frontend/
│   └── recomendaciones/       # ⚛️ React - Frontend
│       ├── src/
│       │   ├── components/    # Componentes reutilizables
│       │   │   ├── FloatingChatWidget.jsx  # 🆕 Chatbot IA (Pilar 3)
│       │   │   ├── LoginV2.tsx             # 🆕 Login mejorado
│       │   │   ├── DashboardV2.tsx         # 🆕 Dashboard 4 pilares
│       │   │   ├── PaymentForm.tsx         # 🆕 Pagos (Pilar 2)
│       │   │   ├── ChatBot.tsx             # 🆕 Chat UI multimodal
│       │   │   └── ...                     # Componentes P1
│       │   ├── pages/         # Páginas principales
│       │   │   ├── MainDashboardPage.tsx   # 🆕 Dashboard integrado
│       │   │   └── ...
│       │   ├── services/      # Servicios API
│       │   │   ├── api/       # REST services
│       │   │   │   ├── auth.service.ts     # 🆕 Auth Service
│       │   │   │   ├── payment.service.ts  # 🆕 Payment Service
│       │   │   │   ├── ai.service.ts       # 🆕 AI Service
│       │   │   │   └── ...
│       │   │   └── graphql-client.js
│       │   ├── hooks/         # Hooks personalizados
│       │   │   ├── useWebSocket.ts
│       │   │   ├── useAuth.ts              # 🆕 Hook de autenticación
│       │   │   └── ...
│       │   └── contexts/      # Contextos React
│       │       ├── AuthContext.tsx         # 🆕 Contexto JWT
│       │       └── ...
│       ├── package.json
│       └── README.md
│
├── doc/                       # 📚 Documentación (Organizada)
│   ├── ENDPOINTS_INTEGRACION_COMPLETADOS.md
│   ├── GUIA_RAPIDA_INICIO.md
│   ├── INTEGRACION_EQUIPO_B_RESUMEN.md
│   ├── INTEGRACION_EQUIPO_B.md
│   ├── INTEGRACION_JWT_COMPLETADA.md
│   ├── REFERENCIA_CLAVES_SECRETAS.md      # 🔐 Claves sincronizadas
│   ├── RESUMEN_CONFIGURACION_FINAL.txt
│   ├── RESUMEN_FINAL_INTEGRACION.md
│   ├── SOLUCION_JWT_TOKEN_ERROR.txt
│   ├── STATUS.txt
│   └── TRABAJO_COMPLETADO.txt
│
├── scripts/                   # 🛠️ Scripts de utilidad
│   ├── start_integracion_bidireccional.ps1  # Iniciar todos los servicios
│   ├── check_services_status.ps1             # Verificar estado
│   ├── check_services_status.bat
│   ├── estado_integracion.py
│   └── test_jwt_*.py                         # Tests de JWT
│
├── README.md                  # Este archivo
└── .gitignore

```

### 🆕 Nuevos Componentes del Segundo Parcial

**Backend (4 Pilares):**
- ✅ `auth-service/` - Autenticación JWT centralizada
- ✅ `payment-service/` - Pagos + Webhooks B2B
- ✅ `ai-orchestrator/` - Orquestador de IA multimodal
- ✅ `mcp-server/` - Herramientas MCP para el LLM
- ⚠️ `n8n-workflows/` - Event Bus (en configuración)

**Frontend:**
- ✅ `LoginV2.tsx` - Sistema de login mejorado
- ✅ `DashboardV2.tsx` - Dashboard de 4 pilares
- ✅ `FloatingChatWidget.jsx` - Chatbot IA flotante
- ✅ `PaymentForm.tsx` - Formulario de pagos
- ✅ `ChatBot.tsx` - Interfaz conversacional base

**Documentación:**
- ✅ Carpeta `doc/` con toda la documentación organizada
- ✅ Guías de integración bidireccional
- ✅ Referencias de claves secretas sincronizadas
- ✅ Resúmenes de implementación

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

---

## 🆕 Instalación de Servicios del Segundo Parcial

### 🔐 Pilar 1: Auth Service (JWT Centralizado)

```bash
cd backend/auth-service

# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual (Windows)
.\.venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (crear .env)
cat > .env << EOL
# Base de datos MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=auth_db

# JWT Configuration (¡IMPORTANTE: Debe ser la MISMA en todos los servicios!)
JWT_SECRET_KEY=integracion-turismo-2026-uleam-jwt-secret-key-payment-service
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Seguridad
RATE_LIMIT_LOGIN=5/minute

# Integración
INTEGRACION_SECRET_KEY=integracion-turismo-2026-uleam
INTEGRACION_ENABLED=true
EOL

# Iniciar servidor
python main.py

# O usar el script de PowerShell
.\run.ps1
```

**Servidor corriendo en:** `http://localhost:8001`  
**Documentación Swagger:** `http://localhost:8001/docs`  
**Health Check:** `http://localhost:8001/health`

**Endpoints principales:**
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión (retorna access + refresh token)
- `POST /auth/refresh` - Renovar access token con refresh token
- `POST /auth/logout` - Cerrar sesión (revoca tokens)
- `GET /auth/me` - Obtener usuario actual (requiere JWT)
- `GET /auth/validate` - Validar token (uso interno)

**Características:**
- ✅ JWT con access tokens (30 min) y refresh tokens (7 días)
- ✅ Validación local en otros servicios (sin llamadas constantes)
- ✅ Blacklist de tokens revocados
- ✅ Rate limiting en endpoints de autenticación
- ✅ Base de datos independiente para usuarios

### 💳 Pilar 2: Payment Service + Webhooks B2B

```bash
cd backend/payment-service

# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual (Windows)
.\.venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (crear .env)
cat > .env << EOL
# Base de datos MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=payment_db

# JWT Configuration (DEBE SER LA MISMA que en auth-service)
JWT_SECRET_KEY=integracion-turismo-2026-uleam-jwt-secret-key-payment-service
JWT_ALGORITHM=HS256

# Payment Providers
PAYMENT_PROVIDER=mock  # Opciones: mock, stripe, mercadopago
STRIPE_SECRET_KEY=sk_test_tu_clave_de_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_de_mp

# Webhooks e Integración B2B
INTEGRACION_SECRET_KEY=integracion-turismo-2026-uleam
INTEGRACION_ENABLED=true
INTEGRACION_TIMEOUT=10
INTEGRACION_URL=https://equipo-b.ngrok.io
INTEGRACION_VERIFY_SSL=false

# WebSocket Server (para notificaciones)
WEBSOCKET_URL=http://localhost:8083/notify
EOL

# Iniciar servidor
python main.py

# O usar el script de PowerShell
.\run.ps1
```

**Servidor corriendo en:** `http://localhost:8002`  
**Documentación Swagger:** `http://localhost:8002/docs`  
**Health Check:** `http://localhost:8002/health`

**Endpoints principales:**

**Pagos:**
- `POST /payments/` - Crear nuevo pago
- `GET /payments/{payment_id}` - Obtener estado de pago
- `POST /webhooks/stripe` - Webhook de Stripe
- `POST /webhooks/mercadopago` - Webhook de MercadoPago

**Partners (Integración B2B):**
- `POST /partners/register` - Registrar webhook de partner
- `GET /partners/` - Listar partners registrados
- `POST /webhooks/partner` - Recibir webhooks de partners (con HMAC)

**Características:**
- ✅ Patrón Adapter para múltiples pasarelas de pago
- ✅ MockAdapter para desarrollo sin pasarela real
- ✅ Autenticación HMAC-SHA256 en webhooks
- ✅ Registro de partners para integración empresarial
- ✅ Webhooks bidireccionales con Equipo B
- ✅ Validación local de JWT (sin llamar a auth-service)
- ✅ Notificaciones en tiempo real vía WebSocket

**Integración con Equipo B:**

El sistema está configurado para integración bidireccional con otro equipo:

1. **Registrar partner (una vez):**
```bash
curl -X POST http://localhost:8002/partners/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Equipo B",
    "webhook_url": "https://equipo-b.ngrok.io/webhooks/partner",
    "events": ["payment.success", "booking.confirmed"],
    "secret_key": "integracion-turismo-2026-uleam"
  }'
```

2. **Enviar evento a partner:**
```bash
curl -X POST http://localhost:8002/api/enviar-reserva-confirmada \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "user_id": "user_123",
    "tour_id": "tour_456",
    "tour_nombre": "Tour Galápagos",
    "tour_precio": 1500.00,
    "tour_destino": "Galápagos"
  }'
```

El sistema automáticamente:
- ✅ Calcula firma HMAC-SHA256 del payload
- ✅ Envía webhook al partner con firma en header
- ✅ Partner valida firma antes de procesar
- ✅ Retorna confirmación de recepción

### ⚡ Pilar 4: n8n Event Bus (En Configuración)

```bash
cd backend/n8n-workflows

# Opción 1: Iniciar con Docker (Recomendado)
docker-compose up -d

# Opción 2: Script de PowerShell
.\start_n8n_docker.ps1

# Ver logs
docker-compose logs -f n8n
```

**Interfaz web:** `http://localhost:5678`  
**Credenciales por defecto:**
- Email: `admin@turismo.com`
- Password: `admin123` (cambiar en producción)

**Workflows implementados:**

1. **Payment Handler** - Procesa webhooks de pasarela de pago
   - Recibe webhook de Stripe/MercadoPago
   - Valida payload y firma
   - Activa servicio/reserva en base de datos
   - Envía notificación WebSocket al usuario
   - Dispara webhook al grupo partner
   - Envía email de confirmación

2. **Partner Handler** - Procesa webhooks de partners
   - Recibe webhook de grupo partner
   - Verifica firma HMAC-SHA256
   - Procesa según tipo de evento
   - Ejecuta acción de negocio correspondiente
   - Responde ACK al partner

3. **Scheduled Tasks** - Tareas programadas
   - Reporte diario de ventas (9:00 AM)
   - Limpieza de tokens expirados (medianoche)
   - Health checks de servicios (cada hora)
   - Recordatorios de reservas próximas

**Configuración:**

Ver [doc/n8n-workflows/README.md](backend/n8n-workflows/README.md) para instrucciones completas.

---

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

## 🆕 Endpoints del Segundo Parcial

### 🔐 Auth Service API (Puerto 8001) - Pilar 1

Servicio de autenticación centralizado con JWT y refresh tokens.

#### Autenticación

```http
POST /auth/register           # Registrar nuevo usuario
POST /auth/login              # Iniciar sesión
POST /auth/refresh            # Renovar access token
POST /auth/logout             # Cerrar sesión
GET  /auth/me                 # Obtener perfil del usuario autenticado
GET  /auth/validate           # Validar token (uso interno)
GET  /health                  # Health check del servicio
```

#### Ejemplo: Registro de Usuario

```bash
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "turista@example.com",
    "username": "turista1",
    "password": "MiPassword123!",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "turista"
  }'
```

Respuesta:
```json
{
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "email": "turista@example.com",
    "username": "turista1",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "turista"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### Ejemplo: Login

```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "turista@example.com",
    "password": "MiPassword123!"
  }'
```

#### Ejemplo: Renovar Token

```bash
curl -X POST http://localhost:8001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Características:**
- ✅ Access tokens con expiración de 30 minutos
- ✅ Refresh tokens con expiración de 7 días
- ✅ Blacklist de tokens revocados
- ✅ Rate limiting: 5 intentos de login por minuto
- ✅ Validación local en otros servicios (sin llamadas constantes)

---

### 💳 Payment Service API (Puerto 8002) - Pilar 2

Servicio de pagos con soporte para múltiples pasarelas y webhooks bidireccionales.

#### Pagos

```http
POST   /payments/                    # Crear nuevo pago
GET    /payments/{payment_id}        # Obtener estado de pago
GET    /payments/                    # Listar todos los pagos (admin)
POST   /webhooks/stripe              # Webhook de Stripe
POST   /webhooks/mercadopago         # Webhook de MercadoPago
GET    /health                       # Health check del servicio
```

#### Partners (Integración B2B)

```http
POST   /partners/register            # Registrar partner para webhooks
GET    /partners/                    # Listar partners registrados
GET    /partners/{partner_id}        # Obtener partner específico
DELETE /partners/{partner_id}        # Eliminar partner
POST   /webhooks/partner             # Recibir webhooks de partners (HMAC)
```

#### Integración Bidireccional (Equipo B)

```http
GET    /api/integracion/status               # Status de integración
POST   /api/enviar-reserva-confirmada        # Enviar webhook a Equipo B
POST   /api/recomendaciones                  # Recibir webhook de Equipo B (HMAC)
POST   /api/reservas                         # Alias para recibir reservas
```

#### Ejemplo: Crear Pago

```bash
curl -X POST http://localhost:8002/payments/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 1500.00,
    "currency": "USD",
    "description": "Reserva Tour Galápagos",
    "customer_email": "turista@example.com",
    "metadata": {
      "tour_id": "tour_123",
      "user_id": "user_456",
      "reservation_id": "res_789"
    }
  }'
```

Respuesta:
```json
{
  "payment_id": "pay_abc123def456",
  "status": "pending",
  "amount": 1500.00,
  "currency": "USD",
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_xyz",
  "created_at": "2026-01-28T10:30:00Z"
}
```

#### Ejemplo: Registrar Partner para Webhooks

```bash
curl -X POST http://localhost:8002/partners/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Equipo B - Tours",
    "webhook_url": "https://equipo-b.ngrok.io/webhooks/partner",
    "events": ["payment.success", "booking.confirmed", "service.activated"],
    "secret_key": "integracion-turismo-2026-uleam"
  }'
```

#### Ejemplo: Enviar Webhook a Equipo B

```bash
curl -X POST http://localhost:8002/api/enviar-reserva-confirmada \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "user_id": "user_123",
    "tour_id": "tour_456",
    "tour_nombre": "Tour Galápagos",
    "tour_precio": 1500.00,
    "tour_destino": "Islas Galápagos",
    "tour_descripcion": "Aventura de 7 días"
  }'
```

El sistema automáticamente:
1. Calcula firma HMAC-SHA256 del payload
2. Agrega header `X-Webhook-Signature` con la firma
3. Agrega header `X-Webhook-Source: Equipo-A`
4. Envía POST al webhook_url del partner
5. Partner valida firma antes de procesar
6. Retorna confirmación

**Formato del webhook enviado:**
```
POST https://equipo-b.ngrok.io/webhooks/partner
Headers:
  Content-Type: application/json
  X-Webhook-Signature: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  X-Webhook-Source: Equipo-A

Body:
{
  "user_id": "user_123",
  "tour_id": "tour_456",
  "tour_nombre": "Tour Galápagos",
  "tour_precio": 1500.00,
  "tour_destino": "Islas Galápagos",
  "tour_descripcion": "Aventura de 7 días",
  "timestamp": "2026-01-28T10:30:00Z"
}
```

**Validación HMAC en Equipo B:**
```python
import hmac
import hashlib
import json

def validate_webhook(payload: dict, signature: str, secret: str) -> bool:
    # Serializar payload de forma determinística
    message = json.dumps(payload, sort_keys=True, separators=(',', ':'))
    
    # Calcular firma esperada
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    # Comparación timing-safe
    return hmac.compare_digest(signature, expected_signature)
```

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

### 🆕 6. Frontend → Auth Service

Gestión centralizada de autenticación con JWT:

```typescript
// services/auth.service.ts
export const loginUser = async (username: string, password: string) => {
  const response = await fetch('http://localhost:8001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  return data;
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  const response = await fetch('http://localhost:8001/auth/refresh', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${refresh}` }
  });
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  return data.access_token;
};
```

### 🆕 7. Todos los Servicios → Auth Service (Validación Local)

Los servicios validan tokens JWT localmente sin necesidad de llamadas HTTP:

```python
# En cualquier servicio (Payment, AI Orchestrator, REST API, etc.)
from local_jwt_validator import validate_token_local

def get_current_user(token: str):
    payload = validate_token_local(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    return payload

# Uso en endpoints protegidos
@app.get("/protected")
async def protected_endpoint(authorization: str = Header(None)):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token)
    return {"message": f"Hola {user['username']}!"}
```

**Ventajas de validación local:**
- ⚡ Sin latencia de red
- 🔒 Mismo secret key sincronizado en todos los servicios
- 🚀 Escalabilidad sin bottlenecks
- ✅ Validación de firma, expiración y estructura

### 🆕 8. Payment Service → n8n Event Bus

Los pagos disparan eventos automáticos en n8n:

```python
# payment-service/routes.py
@router.post("/payments/")
async def create_payment(payment: PaymentCreate):
    # Procesar pago con adapter (Stripe/MercadoPago)
    result = await payment_adapter.process_payment(payment)
    
    # Disparar webhook a n8n
    await trigger_n8n_webhook("payment_completed", {
        "payment_id": result.payment_id,
        "amount": payment.amount,
        "user_id": payment.user_id,
        "status": "completed"
    })
    
    return result
```

**Workflows de n8n activados:**
- 📧 Envío de email de confirmación
- 📊 Registro en analytics
- 🔔 Notificaciones push al usuario
- 🎫 Generación de voucher/ticket

### 🆕 9. Payment Service ↔ Equipo B (B2B Webhooks)

Integración bidireccional con HMAC-SHA256:

```python
# Enviar reserva confirmada a Equipo B
import hmac
import hashlib
import json

async def enviar_reserva_a_equipo_b(reserva: dict):
    payload = {
        "reserva_id": reserva["id"],
        "tour": reserva["tour"],
        "usuario": reserva["usuario"],
        "fecha": reserva["fecha"],
        "precio": reserva["precio"]
    }
    
    # Generar firma HMAC
    message = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        INTEGRACION_SECRET_KEY.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Enviar a Equipo B
    await http_client.post(
        EQUIPO_B_URL + "/api/reservas",
        json=payload,
        headers={"X-Signature": signature}
    )
```

**Endpoints B2B implementados:**
- ✅ `POST /api/reservas` - Recibir reservas de Equipo B
- ✅ `POST /api/enviar-reserva-confirmada` - Enviar reservas a Equipo B
- ✅ `POST /api/recomendaciones` - Intercambio de recomendaciones
- ✅ `GET /api/integracion/status` - Verificar estado de integración

### 🆕 10. Frontend → AI Orchestrator → MCP Server

Chatbot multimodal con procesamiento de imágenes:

```typescript
// Frontend - ChatBot.tsx
const sendMessage = async (message: string, image?: File) => {
  const formData = new FormData();
  formData.append('message', message);
  if (image) formData.append('image', image);
  
  const response = await fetch('http://localhost:8003/chat', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  return data.response;
};
```

```python
# AI Orchestrator - main.py
@app.post("/chat")
async def chat(message: str, image: UploadFile = None):
    # 1. Procesar imagen si existe (Tesseract OCR)
    if image:
        image_text = await multimodal_processor.extract_text(image)
        message += f"\n[Texto de imagen: {image_text}]"
    
    # 2. Consultar MCP Server para contexto
    context = await mcp_client.get_destinations()
    
    # 3. Generar respuesta con LLM (Gemini/OpenAI)
    response = await llm_adapter.generate(message, context)
    
    return {"response": response}
```

**Flujo completo:**
1. Usuario envía mensaje + imagen al Frontend
2. Frontend → AI Orchestrator (port 8003)
3. AI Orchestrator extrae texto de imagen (Tesseract)
4. AI Orchestrator → MCP Server (port 8005) - Obtiene destinos
5. AI Orchestrator → Gemini/OpenAI - Genera respuesta
6. Respuesta → Frontend → Usuario

### 🆕 11. n8n → Todos los Servicios (Event Bus)

n8n orquesta eventos entre servicios:

```yaml
# Ejemplo de workflow en n8n
Workflow: "Payment Handler"
1. Webhook Trigger (recibe evento de Payment Service)
2. Validar datos del pago
3. HTTP Request → REST API (guardar en MongoDB)
4. HTTP Request → WebSocket (notificar al usuario)
5. HTTP Request → Email Service (enviar confirmación)
6. Slack Notification (alertar a admins)
```

**Workflows implementados:**
- ⚠️ Payment Handler (60% completo)
- ⚠️ Partner Handler (60% completo)
- ⚠️ Scheduled Tasks (60% completo)

---

## 🧪 Testing y Ejemplos de Uso

### Test Completo de Flujo con JWT

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "rol": "turista"
  }'

# Respuesta:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "bearer",
#   "expires_in": 1800
# }

# 2. Usar access_token para crear un pago
ACCESS_TOKEN="<token_del_paso_anterior>"

curl -X POST http://localhost:8002/payments/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "amount": 150.00,
    "currency": "USD",
    "description": "Tour a Galápagos",
    "payment_method": "credit_card",
    "gateway": "stripe"
  }'

# 3. Renovar token cuando expire (después de 30 min)
REFRESH_TOKEN="<refresh_token_del_paso_1>"

curl -X POST http://localhost:8001/auth/refresh \
  -H "Authorization: Bearer $REFRESH_TOKEN"

# 4. Validar token desde cualquier servicio
curl -X POST http://localhost:8001/auth/validate \
  -H "Content-Type: application/json" \
  -d '{"token": "'$ACCESS_TOKEN'"}'
```

### Test de Integración B2B

```bash
# Script de test completo (ejecutar desde raíz del proyecto)
python test_jwt_flow.py

# O manualmente:
# 1. Verificar estado de integración
curl http://localhost:8002/api/integracion/status

# 2. Enviar reserva a Equipo B (con firma HMAC)
python -c "
import requests
import hmac
import hashlib
import json

payload = {
    'reserva_id': 'RES-001',
    'tour': 'Galápagos Express',
    'usuario': 'test_user',
    'fecha': '2025-02-15',
    'precio': 150.00
}

message = json.dumps(payload, sort_keys=True)
secret = 'integracion-turismo-2026-uleam'
signature = hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()

response = requests.post(
    'http://localhost:8002/api/enviar-reserva-confirmada',
    json=payload,
    headers={'X-Signature': signature}
)

print(response.json())
"
```

### Test de Chatbot Multimodal

```bash
# 1. Enviar mensaje de texto
curl -X POST http://localhost:8003/chat \
  -F "message=Recomiéndame tours en Galápagos para 3 días"

# Respuesta:
# {
#   "response": "Te recomiendo el tour 'Galápagos Express' que dura 3 días...",
#   "context_used": ["destino_galapagos", "tour_express"],
#   "llm_provider": "gemini"
# }

# 2. Enviar mensaje con imagen
curl -X POST http://localhost:8003/chat \
  -F "message=¿Qué puedes decirme sobre este lugar?" \
  -F "image=@/path/to/foto_destino.jpg"

# El sistema:
# - Extrae texto de la imagen con Tesseract OCR
# - Consulta MCP Server para obtener destinos relacionados
# - Genera respuesta contextual con Gemini/OpenAI
```

### Test de n8n Workflows

```bash
# 1. Acceder a n8n UI
# Abrir http://localhost:5678 en el navegador
# Credenciales: admin@turismo.com / TurismoAdmin2024!

# 2. Activar workflow "Payment Handler"
# - Ir a Workflows → Payment Handler
# - Click en "Active" toggle

# 3. Probar webhook manualmente
curl -X POST http://localhost:5678/webhook/payment-completed \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "PAY-123",
    "amount": 150.00,
    "user_id": "test_user",
    "status": "completed"
  }'

# Verificar en n8n UI que el workflow se ejecutó correctamente
```

### Scripts Automatizados de Inicio

```powershell
# Windows PowerShell - Iniciar todos los servicios
.\start_integracion_bidireccional.ps1

# Este script ejecuta:
# 1. MongoDB (verificar que esté corriendo)
# 2. Auth Service (port 8001)
# 3. Payment Service (port 8002)
# 4. AI Orchestrator (port 8003)
# 5. MCP Server (port 8005)
# 6. REST API (port 8000)
# 7. GraphQL (port 4000)
# 8. WebSocket (port 8083)
# 9. n8n (port 5678) - Docker

# Verificar estado de servicios
.\check_services_status.ps1
# O:
python estado_integracion.py
```

### Test de Validación Local de JWT

```python
# test_jwt_validation.py
import sys
sys.path.append('backend/auth-service')
from local_jwt_validator import validate_token_local, generate_token

# 1. Generar token
payload = {"username": "test_user", "rol": "turista"}
token = generate_token(payload, token_type="access")
print(f"Token generado: {token[:50]}...")

# 2. Validar localmente
decoded = validate_token_local(token)
print(f"Token válido: {decoded}")

# 3. Probar token expirado (simular)
expired_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
result = validate_token_local(expired_token)
print(f"Token expirado: {result}")  # None
```

### Monitoreo de Logs

```bash
# Ver logs de todos los servicios en tiempo real

# Auth Service
cd backend/auth-service
python main.py  # Logs en consola

# Payment Service
cd backend/payment-service
python main.py

# AI Orchestrator
cd backend/ai-orchestrator
python main.py

# n8n (Docker logs)
docker logs -f n8n-container

# WebSocket (Go)
cd backend/websocket-server
go run main.go
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

## � Deployment y Producción

### Consideraciones para Producción

#### 1. Variables de Entorno Seguras

```bash
# NO usar valores por defecto en producción
# Generar secrets únicos y fuertes

# JWT Secret (256 bits mínimo)
JWT_SECRET_KEY=$(openssl rand -hex 32)

# HMAC Secret para webhooks
INTEGRACION_SECRET_KEY=$(openssl rand -hex 32)

# MongoDB URI con autenticación
MONGODB_URI="mongodb://admin:strong_password@mongodb:27017/turismo_db?authSource=admin"

# API Keys de servicios externos
GEMINI_API_KEY="AIza..."
OPENAI_API_KEY="sk-..."
STRIPE_SECRET_KEY="sk_live_..."
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
```

#### 2. Docker Compose para Producción

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongo_data:/data/db
    networks:
      - turismo_network
    restart: always

  auth-service:
    build: ./backend/auth-service
    environment:
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      ACCESS_TOKEN_EXPIRE_MINUTES: 30
      REFRESH_TOKEN_EXPIRE_DAYS: 7
    ports:
      - "8001:8001"
    depends_on:
      - mongodb
    networks:
      - turismo_network
    restart: always

  payment-service:
    build: ./backend/payment-service
    environment:
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      INTEGRACION_SECRET_KEY: ${INTEGRACION_SECRET_KEY}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      MERCADOPAGO_ACCESS_TOKEN: ${MERCADOPAGO_ACCESS_TOKEN}
    ports:
      - "8002:8002"
    depends_on:
      - mongodb
      - auth-service
    networks:
      - turismo_network
    restart: always

  ai-orchestrator:
    build: ./backend/ai-orchestrator
    environment:
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      MCP_SERVER_URL: http://mcp-server:8005
    ports:
      - "8003:8003"
    depends_on:
      - mcp-server
    networks:
      - turismo_network
    restart: always

  mcp-server:
    build: ./backend/mcp-server
    environment:
      MONGODB_URI: ${MONGODB_URI}
    ports:
      - "8005:8005"
    depends_on:
      - mongodb
    networks:
      - turismo_network
    restart: always

  n8n:
    image: n8nio/n8n:latest
    environment:
      N8N_BASIC_AUTH_ACTIVE: true
      N8N_BASIC_AUTH_USER: ${N8N_USER}
      N8N_BASIC_AUTH_PASSWORD: ${N8N_PASSWORD}
      N8N_HOST: ${N8N_HOST}
      N8N_PORT: 5678
      N8N_PROTOCOL: https
      WEBHOOK_URL: https://${N8N_HOST}
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - turismo_network
    restart: always

  rest-api:
    build: ./backend/rest-api
    environment:
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      WEBSOCKET_URL: http://websocket-server:8083
    ports:
      - "8000:8000"
    depends_on:
      - mongodb
      - websocket-server
    networks:
      - turismo_network
    restart: always

  graphql-service:
    build: ./backend/graphql-service
    environment:
      REST_API_URL: http://rest-api:8000
      PORT: 4000
    ports:
      - "4000:4000"
    depends_on:
      - rest-api
    networks:
      - turismo_network
    restart: always

  websocket-server:
    build: ./backend/websocket-server
    ports:
      - "8083:8083"
    networks:
      - turismo_network
    restart: always

  frontend:
    build: ./frontend/recomendaciones
    environment:
      VITE_API_URL: https://api.turismo.com
      VITE_GRAPHQL_URL: https://api.turismo.com/graphql
      VITE_WEBSOCKET_URL: wss://api.turismo.com/ws
      VITE_AUTH_URL: https://api.turismo.com/auth
      VITE_PAYMENT_URL: https://api.turismo.com/payments
      VITE_AI_CHAT_URL: https://api.turismo.com/chat
    ports:
      - "80:80"
    depends_on:
      - rest-api
      - graphql-service
      - auth-service
    networks:
      - turismo_network
    restart: always

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    ports:
      - "443:443"
    depends_on:
      - frontend
    networks:
      - turismo_network
    restart: always

networks:
  turismo_network:
    driver: bridge

volumes:
  mongo_data:
  n8n_data:
```

#### 3. Configuración de Nginx (Reverse Proxy)

```nginx
# nginx.conf
upstream auth_backend {
    server auth-service:8001;
}

upstream payment_backend {
    server payment-service:8002;
}

upstream ai_backend {
    server ai-orchestrator:8003;
}

upstream rest_backend {
    server rest-api:8000;
}

upstream graphql_backend {
    server graphql-service:4000;
}

upstream websocket_backend {
    server websocket-server:8083;
}

server {
    listen 443 ssl http2;
    server_name turismo.com www.turismo.com;

    ssl_certificate /etc/letsencrypt/live/turismo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/turismo.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;

    location /auth/ {
        limit_req zone=auth_limit burst=10;
        proxy_pass http://auth_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /payments/ {
        proxy_pass http://payment_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /chat/ {
        proxy_pass http://ai_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        limit_req zone=api_limit burst=20;
        proxy_pass http://rest_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /graphql {
        proxy_pass http://graphql_backend/graphql;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
    }
}
```

#### 4. Monitoreo y Logging

```yaml
# Agregar a docker-compose.prod.yml
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - turismo_network

  grafana:
    image: grafana/grafana
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - turismo_network
    depends_on:
      - prometheus

  loki:
    image: grafana/loki
    ports:
      - "3100:3100"
    volumes:
      - loki_data:/loki
    networks:
      - turismo_network
```

#### 5. Checklist de Seguridad

- [ ] ✅ Cambiar todos los secrets por defecto
- [ ] ✅ Habilitar HTTPS con certificados válidos (Let's Encrypt)
- [ ] ✅ Configurar rate limiting en endpoints críticos
- [ ] ✅ Validar todas las entradas del usuario
- [ ] ✅ Implementar CORS restrictivo
- [ ] ✅ Encriptar datos sensibles en base de datos
- [ ] ✅ Configurar backups automáticos de MongoDB
- [ ] ✅ Implementar logging centralizado
- [ ] ✅ Configurar alertas de seguridad
- [ ] ✅ Revisar dependencias con `npm audit` y `pip-audit`
- [ ] ✅ Implementar CSP (Content Security Policy)
- [ ] ✅ Usar variables de entorno, nunca hardcodear secrets

#### 6. Comandos de Deployment

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-repo/turismo-recomendaciones.git
cd turismo-recomendaciones

# 2. Configurar variables de entorno
cp .env.example .env.production
nano .env.production  # Editar con valores reales

# 3. Construir imágenes
docker-compose -f docker-compose.prod.yml build

# 4. Ejecutar en modo producción
docker-compose -f docker-compose.prod.yml up -d

# 5. Verificar estado
docker-compose -f docker-compose.prod.yml ps

# 6. Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# 7. Backup de MongoDB
docker exec mongodb mongodump --out /backup/$(date +%Y%m%d)

# 8. Restaurar backup
docker exec mongodb mongorestore /backup/20250130
```

#### 7. Escalabilidad Horizontal

```yaml
# Para escalar servicios según demanda
docker-compose -f docker-compose.prod.yml up -d --scale rest-api=3
docker-compose -f docker-compose.prod.yml up -d --scale payment-service=2

# Configurar load balancer en nginx
upstream rest_backend {
    least_conn;
    server rest-api-1:8000;
    server rest-api-2:8000;
    server rest-api-3:8000;
}
```

### Performance y Optimización

- **Caché Redis:** Implementar para tokens JWT y sesiones
- **CDN:** Servir archivos estáticos del frontend
- **Database Indexing:** Crear índices en MongoDB para queries frecuentes
- **Connection Pooling:** Configurar pools de conexiones a MongoDB
- **Compression:** Habilitar gzip en Nginx
- **Image Optimization:** Comprimir imágenes de destinos turísticos

---

## �📄 Licencia

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

## � Contribuciones del Equipo

### Primer Parcial (P1) - Sistema Base Completo ✅

**Odalia Senge Loor** - GraphQL Service
- Diseño del esquema GraphQL
- Implementación de resolvers
- Integración con REST API
- Optimización de consultas

**Abigail Plúa** - WebSocket Server
- Arquitectura del servidor WebSocket en Go
- Sistema de broadcast en tiempo real
- Gestión de conexiones concurrentes
- Tipos de eventos y notificaciones
- Documentación técnica

**Néstor Ayala** - REST API
- Diseño de la API REST con FastAPI
- Modelos de datos (MongoDB/Beanie)
- Sistema de autenticación JWT inicial
- CRUD de todas las entidades (usuarios, tours, destinos, guías, servicios, reservas)
- Integración con WebSocket

**Trabajo Colaborativo P1:**
- Frontend React con TypeScript y Vite
- Integración entre los 3 servicios backend
- Testing y debugging conjunto
- Documentación del primer parcial

---

### Segundo Parcial (P2) - 4 Pilares Arquitectónicos ⚠️ 89%

**Néstor Ayala** - Responsable Principal del P2

#### ✅ Pilar 1: Auth Service (15% - Completo)
- Servicio centralizado de autenticación con JWT
- Sistema de access tokens (30 min) + refresh tokens (7 días)
- **local_jwt_validator.py:** Validación local sin llamadas HTTP
- Sincronización de `JWT_SECRET_KEY` en 5 servicios
- Blacklist de tokens revocados en MongoDB
- Endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/validate`, `/auth/me`
- Rate limiting (5 req/min en login)
- Documentación completa en [backend/auth-service/README.md](backend/auth-service/README.md)

#### ✅ Pilar 2: Payment Service + B2B Webhooks (20% - Completo)
- **Adapter Pattern** para múltiples gateways (Stripe, MercadoPago, Mock)
- Sistema de webhooks bidireccionales con **HMAC-SHA256**
- Integración B2B con Equipo B:
  - `POST /api/reservas` - Recibir reservas
  - `POST /api/enviar-reserva-confirmada` - Enviar reservas
  - `POST /api/recomendaciones` - Intercambio de datos
  - `GET /api/integracion/status` - Health check
- Gestión de partners con registro y validación
- Endpoints: `/payments/`, `/partners/`, `/webhooks/`, `/api/integracion/*`
- Validación de firmas HMAC en todos los webhooks
- Tests completos con 5/5 passed

#### ✅ Pilar 3: MCP + AI Chatbot Multimodal (20% - Completo)
- **AI Orchestrator** (port 8003):
  - **Strategy Pattern** para LLM providers (Gemini, OpenAI)
  - Procesamiento multimodal: texto + imágenes
  - **Tesseract OCR** para extracción de texto de imágenes
  - Integración con MCP Server para contexto
- **MCP Server** (port 8005):
  - Protocolo Model Context Protocol
  - Proporciona datos de destinos turísticos
  - Endpoints RESTful para el AI Orchestrator
- **Frontend ChatBot**:
  - Componente React con upload de imágenes
  - Interfaz conversacional
  - Visualización de respuestas del AI
- Documentación en [backend/ai-orchestrator/README.md](backend/ai-orchestrator/README.md)

#### ⚠️ Pilar 4: n8n Event Bus (9% de 15% - 60% completo)
- Configuración de **n8n en Docker** (port 5678)
- Workflows implementados (básicos):
  - **Payment Handler**: Procesa eventos de pagos completados
  - **Partner Handler**: Gestiona webhooks de partners
  - **Scheduled Tasks**: Tareas programadas
- Integración con Payment Service vía webhooks
- Documentación de setup en [backend/n8n-workflows/README.md](backend/n8n-workflows/README.md)

**Pendiente del Pilar 4 (6%):**
- Workflows avanzados con múltiples steps
- Triggers automáticos basados en eventos
- Integración con más servicios (Auth, AI)
- Error handling y retry logic
- Monitoreo de workflows

#### ✅ Integraciones Globales (10% - Completo)
- JWT sincronizado en **5 servicios** (Auth, Payment, AI, REST API, GraphQL)
- Validación local de tokens en todos los servicios
- Webhooks bidireccionales con Equipo B funcionando
- MCP Server conectado con AI Orchestrator
- n8n recibiendo eventos de Payment Service
- Scripts de inicio automatizados: `start_integracion_bidireccional.ps1`
- Scripts de verificación: `check_services_status.ps1`, `estado_integracion.py`

#### ✅ Frontend Updates (5% - Completo)
- **LoginV2.tsx**: Integración con Auth Service
- **DashboardV2.tsx**: Dashboard con autenticación
- **ChatBot.tsx**: Interfaz de chatbot multimodal
- **PaymentForm.tsx**: Formulario de pagos
- Context API para manejo global de auth
- Axios interceptors para refresh tokens automático

#### ✅ Documentación (5% - Completo)
- README.md actualizado con TODO el P2
- Documentación de cada servicio nuevo
- Ejemplos de uso con curl
- Guías de instalación paso a paso
- Diagramas de arquitectura
- Endpoints documentados con request/response examples
- Archivos en `/doc`:
  - `ENDPOINTS_INTEGRACION_COMPLETADOS.md`
  - `INTEGRACION_JWT_COMPLETADA.md`
  - `GUIA_RAPIDA_INICIO.md`
  - Y más...

#### ✅ Colaboración (5% - Completo)
- Coordinación con Equipo B para integración bidireccional
- Testing conjunto de webhooks HMAC
- Sincronización de secrets compartidos
- Resolución de bugs de autenticación JWT
- Documentación para partners externos

#### ⏳ Presentación (5% - Pendiente para Semana 15)
- Demo del sistema completo
- Presentación de los 4 pilares
- Mostrar flujos de integración
- Q&A sobre arquitectura

### 📊 Estado Global del Segundo Parcial

| Componente | % Requerido | % Completado | Estado |
|-----------|-------------|--------------|--------|
| **Pilar 1:** Auth Service | 15% | 15% | ✅ Completo |
| **Pilar 2:** Payment + B2B | 20% | 20% | ✅ Completo |
| **Pilar 3:** MCP + AI Chat | 20% | 20% | ✅ Completo |
| **Pilar 4:** n8n Event Bus | 15% | 9% | ⚠️ 60% |
| Integraciones | 10% | 10% | ✅ Completo |
| Frontend Updates | 5% | 5% | ✅ Completo |
| Documentación | 5% | 5% | ✅ Completo |
| Colaboración | 5% | 5% | ✅ Completo |
| Presentación | 5% | 0% | ⏳ Semana 15 |
| **TOTAL** | **100%** | **89%** | ⚠️ **-11%** |

**Resumen:**
- ✅ **Completado:** 89% del Segundo Parcial
- ⚠️ **Pendiente:** 11% (6% de n8n + 5% de presentación)
- 🎯 **Objetivo:** Completar workflows de n8n en Semana 14
- 🎤 **Presentación:** Semana 15 (según calendario académico)

---

## �🙏 Agradecimientos

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
