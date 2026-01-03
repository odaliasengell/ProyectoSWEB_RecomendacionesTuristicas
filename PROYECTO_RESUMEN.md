# 📖 Resumen Ejecutivo - Proyecto Ampliado

## 🎯 Proyecto

**Sistema de Recomendaciones Turísticas - Ampliación Segundo Semestre**

Universidad Laica Eloy Alfaro de Manabí (ULEAM)
Carrera: Ingeniería en Sistemas
Materia: Desarrollo de Software Empresarial (SWEB)

---

## 📋 Contenido del Proyecto

### ✅ Completado

#### 1️⃣ Pilar 1: Microservicio de Autenticación
- **Ubicación**: `backend/auth-service/`
- **Tecnología**: NestJS + TypeScript + PostgreSQL + Redis
- **Características**:
  - JWT con tokens de acceso (15 min) y refresh (7 días)
  - Validación de contraseña (8+ caracteres, mayúsculas, números, caracteres especiales)
  - Rate limiting (5 intentos / 10 minutos)
  - Token blacklist en Redis
  - Endpoints: `/register`, `/login`, `/logout`, `/refresh`, `/me`, `/validate`
  - Middleware reutilizable para otros servicios

#### 2️⃣ Pilar 2: Webhooks e Interoperabilidad B2B
- **Ubicación**: `backend/payment-service/`
- **Tecnología**: FastAPI + Python + PostgreSQL
- **Características**:
  - Patrón Adapter para proveedores de pago
  - 3 adapters implementados:
    - MockAdapter (testing con webhooks simulados)
    - StripeAdapter (integración Stripe)
    - MercadoPagoAdapter (integración MercadoPago)
  - Sistema de registro de partners
  - Validación HMAC-SHA256 de webhooks
  - Webhooks: `payment.success`, `payment.failed`, `booking.confirmed`
  - Endpoints partners: `/register`, `/list`, `/delete`, `/test-webhook`

#### 3️⃣ Pilar 3: MCP - Chatbot Multimodal con IA
- **Ubicación**: `backend/ai-orchestrator/`
- **Tecnología**: FastAPI + Python + MongoDB + LangChain
- **Características**:
  - Patrón Strategy para proveedores LLM
  - 2 adapters LLM:
    - GeminiAdapter (Google Gemini con Vision API)
    - OpenAIAdapter (OpenAI ChatGPT/GPT-4)
  - 5 MCP Tools implementadas:
    - `buscar_tours` (Query) - Búsqueda de tours
    - `obtener_reservas_usuario` (Query) - Historial de reservas
    - `crear_reserva` (Action) - Crear nueva reserva
    - `procesar_pago` (Action) - Procesar pago
    - `resumen_ventas_diarias` (Report) - Reportes admin
  - Multimodal:
    - Texto: Chat normal
    - Imagen: OCR con `/chat/with-image`
    - PDF: Extracción y análisis con `/chat/with-pdf`
  - Historial en MongoDB
  - Autorización por herramienta

#### 4️⃣ Pilar 4: n8n - Event Bus
- **Ubicación**: Documentación en `N8N_INTEGRATION_GUIDE.md`
- **4 Workflows Obligatorios**:
  1. **Payment Handler**: Procesa pagos → notifica → webhook a partners
  2. **Partner Handler**: Recibe webhooks de partners → procesa eventos
  3. **MCP Input Handler**: Telegram/Email → IA Orchestrator → respuesta
  4. **Scheduled Tasks**: Reportes diarios, health checks, limpieza

#### 5️⃣ Infraestructura
- **Docker Compose**: Orquestación de 8 servicios
- **API Gateway**: nginx con rate limiting y CORS
- **Bases de datos**:
  - PostgreSQL (Auth, Payments)
  - MongoDB (AI, Business data)
  - Redis (Cache, Token blacklist)
- **Scripts de deployment**:
  - `deploy.sh` (Linux/macOS)
  - `deploy.ps1` (Windows)

---

## 📁 Estructura de Archivos

```
ProyectoSWEB_RecomendacionesTuristicas/
├── backend/
│   ├── auth-service/                    ✅ Completo
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── README.md
│   │   └── src/
│   │       ├── main.ts
│   │       ├── entities/
│   │       ├── config/
│   │       ├── services/
│   │       ├── routes/
│   │       └── middleware/
│   │
│   ├── payment-service/                 ✅ Completo
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── .env.example
│   │   ├── requirements.txt
│   │   ├── main.py
│   │   ├── README.md
│   │   └── app/
│   │       ├── adapters/
│   │       ├── services/
│   │       └── routes/
│   │
│   ├── ai-orchestrator/                 ✅ Completo
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── .env.example
│   │   ├── requirements.txt
│   │   ├── main.py
│   │   ├── README.md
│   │   └── app/
│   │       ├── llm_adapters/
│   │       ├── mcp_tools/
│   │       └── routes/
│   │
│   ├── rest-api/                        ✅ Existente
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── ...
│   │
│   ├── graphql-service/                 ✅ Existente
│   │   ├── package.json
│   │   └── ...
│   │
│   └── websocket-server/                ✅ Existente
│       ├── main.go
│       └── ...
│
├── frontend/
│   └── recomendaciones/                 ✅ Existente
│       ├── src/
│       ├── vite.config.js
│       └── ...
│
├── docker-compose.yml                   ✅ Completo
├── nginx.Dockerfile                     ✅ Completo
├── nginx.conf                           ✅ Completo
├── nginx-site.conf                      ✅ Completo
├── deploy.sh                            ✅ Completo
├── deploy.ps1                           ✅ Completo
├── test-endpoints.sh                    ✅ Completo
├── test-endpoints.ps1                   ✅ Completo
├── SETUP_LOCAL.md                       ✅ Completo
├── ARCHITECTURE.md                      ✅ Completo
├── N8N_INTEGRATION_GUIDE.md            ✅ Completo
├── PARTNER_INTEGRATION_GUIDE.md        ✅ Completo
├── README.md                            ✅ Existente
└── .gitignore                           ✅ Existente
```

---

## 🚀 Cómo Iniciar

### Opción 1: Script Automático (Recomendado)

**Windows**:
```powershell
.\deploy.ps1
```

**Linux/macOS**:
```bash
./deploy.sh
```

### Opción 2: Manual

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Verificar servicios
docker-compose ps
```

---

## 🔌 Endpoints Principales

### Authentication (`/auth`)
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Renovar token
- `GET /auth/me` - Mi información
- `GET /auth/validate` - Validar token

### Payment (`/payment`, `/partners`)
- `POST /payment/init` - Iniciar pago
- `GET /payment/status/{id}` - Estado de pago
- `POST /payment/refund` - Reembolsar
- `POST /partners/register` - Registrar partner
- `GET /partners` - Listar partners
- `POST /partners/{id}/test-webhook` - Testing

### AI (`/chat`, `/tools`)
- `POST /chat` - Chat con IA
- `GET /chat/{conversation_id}` - Historial
- `POST /chat/with-image` - Chat con imagen
- `POST /chat/with-pdf` - Chat con PDF
- `GET /tools` - Listar herramientas
- `POST /tools/{name}/execute` - Ejecutar herramienta

### Original P1 (`/api`, `/graphql`, `/ws`)
- REST API en `/api`
- GraphQL en `/graphql`
- WebSocket en `/ws`

---

## 🔐 Seguridad Implementada

- ✅ JWT con refresh tokens
- ✅ bcrypt para contraseñas (factor 12)
- ✅ HMAC-SHA256 para webhooks
- ✅ Rate limiting por IP
- ✅ Token blacklist
- ✅ Validación de entrada
- ✅ CORS configurado
- ✅ Middleware de error

---

## 📊 Patrones de Diseño Utilizados

1. **Adapter Pattern** (Payment providers, LLM providers)
2. **Strategy Pattern** (LLM selection)
3. **Factory Pattern** (Provider instantiation)
4. **Observer Pattern** (Webhook system)
5. **Middleware Pattern** (JWT validation)

---

## 🧪 Testing

### Prueba Rápida
```powershell
.\test-endpoints.ps1
```

### Prueba Manual
```bash
curl -X POST http://localhost/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123!",
    "name":"Test User"
  }'
```

---

## 📖 Documentación

| Documento | Propósito |
|-----------|-----------|
| `ARCHITECTURE.md` | Arquitectura del sistema, diagramas, decisiones |
| `N8N_INTEGRATION_GUIDE.md` | Setup y workflows de n8n, event bus |
| `PARTNER_INTEGRATION_GUIDE.md` | Cómo integrarse como partner (webhooks bidireccionales) |
| `SETUP_LOCAL.md` | Guía detallada de setup local |
| `backend/*/README.md` | Documentación de cada servicio |

---

## 🎓 Competencias Demostrables

✅ **Arquitectura Microservicios**: 4 servicios independientes con responsabilidades claras
✅ **Integración B2B**: Webhooks bidireccionales con validación HMAC
✅ **Patrones de Diseño**: Adapter, Strategy, Factory, Observer, Middleware
✅ **Autenticación Centralizada**: JWT con refresh tokens reutilizable
✅ **AI/ML Integration**: LLM adapters con múltiples proveedores
✅ **Multimodal Input**: Texto, imagen, PDF
✅ **Event Bus**: n8n con 4 workflows obligatorios
✅ **Containerización**: Docker y Docker Compose
✅ **API Gateway**: nginx con rate limiting
✅ **Base de Datos Múltiples**: PostgreSQL, MongoDB, Redis
✅ **Testing**: Scripts para testing de endpoints

---

## 📝 Próximos Pasos

1. ✅ Crear `.env` en cada servicio con tus credenciales
2. ✅ Ejecutar `docker-compose build`
3. ✅ Ejecutar `docker-compose up -d`
4. ✅ Verificar con `docker-compose ps`
5. ✅ Ejecutar `test-endpoints.ps1` para validar
6. ✅ Crear workflows en n8n manualmente
7. ✅ Coordinar con otro grupo para webhooks bidireccionales
8. ✅ Presentar proyecto con demos funcionales

---

## 📞 Contacto y Soporte

- **Documentación**: Ver archivos README en cada servicio
- **Issues**: Crear issue en GitHub
- **n8n Help**: Ver `N8N_INTEGRATION_GUIDE.md`
- **Webhooks**: Ver `PARTNER_INTEGRATION_GUIDE.md`

---

**Última actualización**: 2 de enero de 2026
**Estado**: ✅ COMPLETADO - Listo para despliegue y testing
