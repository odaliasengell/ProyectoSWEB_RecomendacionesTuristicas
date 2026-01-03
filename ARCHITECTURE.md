# 🏗️ Arquitectura del Sistema - Segundo Parcial

> Extensión de la arquitectura del primer parcial con 4 pilares estratégicos: Autenticación Centralizada, Webhooks B2B, IA Conversacional (MCP) y Orquestación de Eventos (n8n)

---

## 📊 Diagrama Arquitectónico Completo

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND (React)                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   REST API      │  │   GraphQL       │  │  WebSocket   │  │   Chat AI    │   │
│  │   Calls         │  │   Queries       │  │  Connection  │  │   Module     │   │
│  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘  └──────┬───────┘   │
└───────────┼──────────────────────────────────────────────────────────┼────────────┘
            │                                                           │
            │            ┌──────────────────────────────────────────┐  │
            │            │      API GATEWAY / SERVICE MESH           │  │
            │            │  (Kong / Traefik / Custom Orchestrator)   │  │
            │            │                                            │  │
            │  ┌─────────┼────────────────────────────────────────┐  │
            │  │         │                                        │  │
            ▼  ▼         ▼                                        ▼  ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │                         MICROSERVICIOS (Backend)                         │
  ├──────────────────────────────────────────────────────────────────────────┤
  │                                                                          │
  │  ┌─────────────────────┐  ┌──────────────────────────────────────────┐ │
  │  │  🔐 AUTH SERVICE    │  │     PILAR 1: Autenticación Centralizada  │ │
  │  │  (NestJS/Express)   │  │  • JWT (Access + Refresh Tokens)         │ │
  │  │  Puerto: 3001       │  │  • Validación Local en servicios         │ │
  │  │                     │  │  • Rate Limiting en login                │ │
  │  │  Endpoints:         │  │  • Blacklist de tokens revocados         │ │
  │  │  POST /register     │  │  • BD propia (usuarios + tokens)         │ │
  │  │  POST /login        │  │                                          │ │
  │  │  POST /logout       │  │  Tecnología: NestJS + PostgreSQL         │ │
  │  │  POST /refresh      │  │                                          │ │
  │  │  GET /me            │  │                                          │ │
  │  │  GET /validate      │  │                                          │ │
  │  └─────────────────────┘  └──────────────────────────────────────────┘ │
  │                                                                          │
  │  ┌─────────────────────┐  ┌──────────────────────────────────────────┐ │
  │  │ 💳 PAYMENT SERVICE  │  │  PILAR 2: Webhooks e Interoperabilidad  │ │
  │  │ (Python/FastAPI)    │  │  • Adapter Pattern (Stripe/MercadoPago) │ │
  │  │ Puerto: 8001        │  │  • Registro de Partners                  │ │
  │  │                     │  │  • HMAC-SHA256 para webhooks             │ │
  │  │ Endpoints:          │  │  • Eventos bidireccionales               │ │
  │  │ POST /payment/init  │  │  • MockAdapter para desarrollo           │ │
  │  │ POST /webhooks      │  │                                          │ │
  │  │ POST /partners      │  │  Tecnología: FastAPI + Adapters          │ │
  │  │ GET /partners       │  │                                          │ │
  │  └─────────────────────┘  └──────────────────────────────────────────┘ │
  │                                                                          │
  │  ┌─────────────────────┐  ┌──────────────────────────────────────────┐ │
  │  │  🤖 AI ORCHESTRATOR │  │  PILAR 3: MCP - Chatbot Multimodal       │ │
  │  │ (Python/LangChain)  │  │  • LLM Adapter (Strategy Pattern)        │ │
  │  │ Puerto: 8002        │  │  • 5+ MCP Tools (consulta, acción)       │ │
  │  │                     │  │  • Multimodal: texto, imagen, PDF        │ │
  │  │ Endpoints:          │  │  • Logs y auditoría de operaciones       │ │
  │  │ POST /chat          │  │                                          │ │
  │  │ POST /tools         │  │  Tecnología: Python + LangChain/Gemini   │ │
  │  │ POST /upload        │  │                                          │ │
  │  └─────────────────────┘  └──────────────────────────────────────────┘ │
  │                                                                          │
  │  ┌──────────────────────────────────────────────────────────────────┐ │
  │  │  REST API (P1)       │  GraphQL (P1)      │  WebSocket (P1)       │ │
  │  │  Puerto: 8000        │  Puerto: 4000      │  Puerto: 8080         │ │
  │  │  • Destinos          │  • Reportes        │  • Notificaciones     │ │
  │  │  • Tours             │  • Estadísticas    │  • Eventos en tiempo  │ │
  │  │  • Guías             │  • Analytics       │    real               │ │
  │  │  • Servicios         │                    │                       │ │
  │  └──────────────────────────────────────────────────────────────────┘ │
  │                                                                          │
  └────────────────┬──────────────────────────────────────────────────┬─────┘
                   │                                                  │
                   ▼                                                  ▼
  ┌────────────────────────────┐              ┌─────────────────────────────┐
  │   📦 DATA PERSISTENCE       │              │  ⚙️  PILAR 4: n8n Event Bus │
  │                             │              │                             │
  │  ┌───────────────────────┐  │              │  Workflows:                 │
  │  │ Auth DB (PostgreSQL)  │  │              │  1. Payment Handler         │
  │  │ • Usuarios            │  │              │  2. Partner Handler         │
  │  │ • Refresh Tokens      │  │              │  3. MCP Input Handler       │
  │  │ • Tokens Revocados    │  │              │  4. Scheduled Tasks         │
  │  └───────────────────────┘  │              │                             │
  │                             │              │  Tecnología: n8n (Docker)   │
  │  ┌───────────────────────┐  │              │  Puerto: 5678               │
  │  │ Business DB (MongoDB) │  │              │                             │
  │  │ • Destinos            │  │              │                             │
  │  │ • Tours               │  │              │                             │
  │  │ • Reservas            │  │              │                             │
  │  │ • Pagos               │  │              │                             │
  │  └───────────────────────┘  │              │                             │
  │                             │              │                             │
  └────────────────────────────┘              └─────────────────────────────┘
```

---

## 🔄 Flujos de Datos Clave

### Flujo 1: Autenticación y Autorización

```
┌─────────┐
│ Frontend│
└────┬────┘
     │ POST /auth/login
     ▼
┌──────────────────────┐
│  Auth Service        │
│ • Valida credenciales│
│ • Genera JWT + RT    │
└────┬─────────────────┘
     │ {accessToken, refreshToken}
     ▼
┌──────────────────┐
│ Almacena tokens  │
│ en localStorage  │
└────┬─────────────┘
     │ Headers: Authorization: Bearer {JWT}
     ▼
┌────────────────────────────┐
│ Otros servicios            │
│ • Validan JWT localmente   │
│ • NO consultan Auth Service│
│ • Si JWT expira → usa RT    │
└────────────────────────────┘

Validación Local (en cada servicio):
1. Verificar firma con PUBLIC_KEY
2. Verificar fecha de expiración
3. Verificar contra blacklist (Redis/BD local)
```

### Flujo 2: Procesamiento de Pago con Webhooks Bidireccionales

```
1. Usuario inicia pago
┌─────────┐
│ Frontend│ POST /payment/init {amount, serviceId}
└────┬────┘
     ▼
┌──────────────────┐
│ Payment Service  │ (Adapter Pattern)
│ • MockAdapter    │ (para desarrollo)
│ • StripeAdapter  │ (producción)
└────┬─────────────┘
     │ Simula/procesa pago
     ▼
2. Payment éxitoso
     │ Webhook → n8n Payment Handler
     ▼
┌──────────────────────────────────────┐
│ n8n Payment Handler Workflow         │
│ 1. Valida payload HMAC               │
│ 2. Actualiza BD (reserva pagada)     │
│ 3. Notifica via WebSocket            │
│ 4. Envía email de confirmación       │
│ 5. Dispara webhook a grupo PARTNER   │
└──────────┬───────────────────────────┘
           │
           ▼
3. Notifica grupo PARTNER
┌──────────────────────────────┐
│ Webhook a grupo Partner      │
│ POST /webhooks/payments      │
│ Payload firmado con HMAC     │
│ • event: payment.success     │
│ • reservaId, monto, etc.     │
└──────────────────────────────┘
```

### Flujo 3: Chat con IA Conversacional

```
┌──────────────┐
│ Chat UI      │ (Texto, Imagen, PDF)
└──────┬───────┘
       │ POST /chat {message, attachments}
       ▼
┌────────────────────────┐
│ AI Orchestrator        │
│ • Procesa entrada      │
│ • Extrae contenido     │
│ • Llama LLM Adapter    │
└────────┬───────────────┘
         │ 
         ▼
┌────────────────────────────────────┐
│ LLM Adapter (Strategy Pattern)     │
│ • Elige proveedor (Gemini/OpenAI) │
│ • Envía contexto + herramientas    │
└────────┬─────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ LLM (Gemini / OpenAI)              │
│ • Procesa mensaje                  │
│ • Ejecuta MCP Tools según necesita │
└────────┬─────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ MCP Tools (5+ herramientas)        │
│ 2 Consulta:                        │
│ • buscar_productos                 │
│ • obtener_reserva_usuario          │
│                                    │
│ 2 Acción:                          │
│ • crear_reserva                    │
│ • procesar_pago                    │
│                                    │
│ 1 Reporte:                         │
│ • resumen_ventas_diarias           │
└──────────────────────────────────────┘
```

---

## 🔑 Decisiones Arquitectónicas

### 1. **Auth Service Independiente**
- **Razón**: Evitar antipatrón de llamadas constantes en cada request
- **Implementación**: JWT con validación local en cada servicio
- **Ventajas**: 
  - Escalabilidad: Auth Service no es cuello de botella
  - Rendimiento: Validación local sin latencia de red
  - Resilencia: Si Auth Service cae, otros siguen funcionando
  
### 2. **Adapter Pattern para Pagos**
- **Razón**: Abstracción de proveedores de pago
- **Implementación**:
  ```typescript
  interface PaymentProvider {
    processPayment(amount: number, orderId: string): Promise<PaymentResult>
    validateWebhook(payload: any, signature: string): boolean
  }
  
  class MockAdapter implements PaymentProvider { }
  class StripeAdapter implements PaymentProvider { }
  class MercadoPagoAdapter implements PaymentProvider { }
  ```
- **Ventaja**: Intercambiar proveedores sin cambiar lógica de negocio

### 3. **LLM Adapter con Strategy Pattern**
- **Razón**: No tener dependencia de un único proveedor de IA
- **Implementación**:
  ```python
  class LLMProvider(ABC):
      def generate_response(self, context, tools): pass
      
  class GeminiAdapter(LLMProvider): pass
  class OpenAIAdapter(LLMProvider): pass
  ```
- **Ventaja**: Cambiar LLM sin afectar MCP Tools

### 4. **HMAC para Webhooks**
- **Razón**: Garantizar autenticidad e integridad de webhooks
- **Implementación**:
  ```python
  signature = hmac.new(
      secret.encode(),
      payload.encode(),
      hashlib.sha256
  ).hexdigest()
  ```
- **Ventaja**: Partner puede verificar que webhook vino de nosotros

### 5. **n8n como Event Bus Central**
- **Razón**: Orquestación visual sin código boilerplate
- **Implementación**: 
  - Webhooks → n8n → acciones
  - n8n ejecuta lógica compleja de forma visual
  - Fácil mantener y modificar workflows
- **Ventaja**: 
  - No requiere escribir código de orquestación
  - Logs detallados y debugging visual
  - Reutilizable entre equipos

---

## 🗄️ Estructura de Bases de Datos

### Auth Service DB (PostgreSQL)

```sql
-- Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Blacklist de Tokens
CREATE TABLE token_blacklist (
    id UUID PRIMARY KEY,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP DEFAULT NOW()
);

-- Rate Limiting
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    attempt_count INT DEFAULT 1,
    last_attempt TIMESTAMP DEFAULT NOW(),
    locked_until TIMESTAMP
);
```

### Business DB (MongoDB)

```javascript
// Colecciones de Reservas con estado de pago
db.reservas.schema = {
    _id: ObjectId,
    usuario_id: UUID,
    tour_id: ObjectId,
    payment_status: "pending" | "completed" | "failed",
    payment_id: String, // ID de transacción en Payment Service
    amount: Number,
    currency: "USD" | "EUR",
    created_at: Date,
    updated_at: Date,
    webhook_notified: Boolean,
    partner_notified: Boolean
}

// Registro de Webhooks
db.webhooks_log.schema = {
    _id: ObjectId,
    partner_id: String,
    event_type: String,
    payload: Object,
    signature: String,
    verified: Boolean,
    processed_at: Date,
    response_status: Number
}
```

---

## 🚀 Flujo End-to-End: Reserva de Tour con Pago

```
1. Usuario selecciona tour en Frontend
   └─► Completa formulario de reserva
   
2. Frontend POST /reservas {tour_id, user_id, dates}
   └─► REST API crea reserva (status: pending)
   
3. Usuario procede a pago → POST /payment/init
   └─► Payment Service.MockAdapter procesa pago
   
4. Pago exitoso
   └─► Payment Service HTTP POST a n8n
       └─► Webhook: {event: "payment.success", reserva_id, monto}
   
5. n8n Payment Handler Workflow
   └─► 5.1 Valida HMAC
   └─► 5.2 Actualiza MongoDB (reserva.status = "completed")
   └─► 5.3 Publica evento en WebSocket
       └─► Frontend actualiza estado en tiempo real
   └─► 5.4 Envía email de confirmación
   └─► 5.5 Envía webhook a PARTNER
       └─► POST {partner_webhook_url}
       └─► PARTNER procesa y responde ACK
   
6. Usuario abre chat AI
   └─► "Muéstrame mis reservas"
   
7. AI Orchestrator recibe mensaje
   └─► LLM Adapter (Gemini) procesa
   └─► Ejecuta MCP Tool: obtener_reservas_usuario
       └─► Consulta MongoDB por user_id
       └─► Devuelve reservas
   └─► LLM genera respuesta conversacional
   
8. Frontend muestra respuesta del chat
   └─► Usuario interactúa más: "Cancelar reserva 123"
   
9. AI ejecuta MCP Tool: cancelar_reserva
   └─► Actualiza BD
   └─► Dispara webhook a n8n (cancelación)
   └─► n8n procesa cancelación y reembolso
```

---

## 📋 Matriz de Tecnologías por Pilar

| Pilar | Componente | Tecnología | Lenguaje | Puerto |
|-------|-----------|-----------|----------|--------|
| **1** | Auth Service | NestJS / Express | TypeScript / JavaScript | 3001 |
| **1** | Auth DB | PostgreSQL | SQL | 5432 |
| **2** | Payment Service | FastAPI | Python | 8001 |
| **2** | Payment Adapters | SDK Stripe/MercadoPago | Python | - |
| **3** | AI Orchestrator | FastAPI + LangChain | Python | 8002 |
| **3** | LLM Provider | Gemini / OpenAI | API Calls | - |
| **4** | Event Bus | n8n | Node.js | 5678 |
| **4** | Scheduler | n8n Cron | Node.js | 5678 |
| **P1** | REST API | FastAPI | Python | 8000 |
| **P1** | GraphQL | Apollo Server | TypeScript | 4000 |
| **P1** | WebSocket | Go Gorilla | Go | 8080 |
| **P1** | Frontend | React | TypeScript/JSX | 5173 |
| **Infra** | MongoDB | MongoDB Community | - | 27017 |
| **Infra** | API Gateway | Kong / Traefik | Docker | 8080 |
| **Infra** | Redis (Cache/Tokens) | Redis | - | 6379 |

---

## 🔐 Seguridad en Profundidad

### Auth Service
- ✅ HTTPS/TLS en producción
- ✅ BCRYPT para hash de contraseñas (factor: 12)
- ✅ JWT con expiración corta (15 min para access)
- ✅ Refresh token con expiración larga (7 días)
- ✅ Rate limiting (5 intentos/10 min) en /login
- ✅ CORS configurado correctamente

### Webhooks
- ✅ HMAC-SHA256 para firma y verificación
- ✅ Timestamp en payload para detectar replay attacks
- ✅ Whitelist de IPs de partners (opcional)
- ✅ Retry mechanism con exponential backoff
- ✅ Logs de todos los webhooks recibidos

### MCP Tools
- ✅ Validación de entrada en cada tool
- ✅ Autorización basada en roles (usuario no puede acceder tools de admin)
- ✅ Logs de auditoría de cada ejecución de tool
- ✅ Timeouts para evitar tools muy lentos
- ✅ Rate limiting por usuario en chat

---

## 📝 Pasos de Implementación Sugeridos

### Semana 1
- ✅ Crear Auth Service (JWT + refresh tokens)
- ✅ Integrar Auth Service con servicios existentes
- ✅ Configurar n8n básico
- ✅ Coordinar con grupo partner

### Semana 2
- ✅ Implementar Payment Service con Adapters
- ✅ Crear API de registro de partners
- ✅ Implementar HMAC para webhooks
- ✅ Estructura básica de AI Orchestrator

### Semana 3
- ✅ MCP Tools (5 herramientas)
- ✅ LLM Adapter (Gemini/OpenAI)
- ✅ Workflows de n8n (Payment, Partner)
- ✅ Pruebas de webhooks con partner

### Semana 4
- ✅ Chat UI en Frontend
- ✅ Módulo de Pagos en Frontend
- ✅ Integración WebSocket para eventos
- ✅ Testing end-to-end

### Semana 5
- ✅ Refinamiento y optimización
- ✅ Documentación completa
- ✅ Demo y presentación

---

## 🔗 Referencias de Arquitectura

- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Webhook Security](https://owasp.org/www-community/attacks/Webhook)
- [Model Context Protocol](https://spec.modelcontextprotocol.io/)
- [n8n Documentation](https://docs.n8n.io/)
- [Microservices Patterns](https://microservices.io/patterns/index.html)
- [API Gateway Patterns](https://microservices.io/patterns/apigateway.html)

