# 🎯 Pilar 2: Webhooks e Interoperabilidad B2B - COMPLETADO

## ✅ Implementación Finalizada

El Payment Service con sistema de webhooks ha sido implementado exitosamente.

### 🚀 Servicio Activo

- **URL**: http://localhost:8002
- **Documentación**: http://localhost:8002/docs
- **Base de Datos**: payment_service_db (MongoDB)
- **Estado**: ✅ Corriendo

---

## 📋 Características Implementadas

### 1. ✅ Patrón Adapter para Proveedores de Pago

#### Archivo: `payment_adapters.py`

**Interface**: `PaymentProviderInterface`
- `create_payment()` - Crear pago
- `get_payment()` - Obtener estado de pago
- `refund_payment()` - Reembolsar
- `cancel_payment()` - Cancelar pago pendiente
- `normalize_webhook_event()` - Normalizar webhooks

**Adapters Implementados**:
- ✅ **MockAdapter**: Simulador para testing (todos los pagos exitosos)
- ✅ **StripeAdapter**: Integración con Stripe API
- ✅ **MercadoPagoAdapter**: Integración con MercadoPago API

**Uso**:
```python
from payment_adapters import get_payment_adapter

adapter = get_payment_adapter(
    provider=PaymentProvider.MOCK  # o STRIPE, MERCADOPAGO
)

result = await adapter.create_payment(
    amount=150.00,
    currency="USD",
    description="Tour Galápagos",
    metadata={"tour_id": "tour_001"}
)
```

---

### 2. ✅ Sistema de Registro de Partners

#### Endpoint: `POST /partners/register`

Permite que otros grupos/servicios se registren para recibir webhooks.

**Proceso**:
1. Partner envía: nombre, webhook_url, eventos suscritos
2. Sistema genera automáticamente **secret compartido** (HMAC)
3. Retorna partner_id y secret
4. Partner guarda secret para firmar sus webhooks

**Ejemplo**:
```bash
curl -X POST http://localhost:8002/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hotel Paradise",
    "webhook_url": "https://hotel-paradise.com/webhooks/tourism",
    "subscribed_events": ["booking.confirmed", "payment.success"],
    "contact_email": "dev@hotel-paradise.com"
  }'
```

**Respuesta**:
```json
{
  "id": "partner_123abc",
  "name": "Hotel Paradise",
  "webhook_url": "https://hotel-paradise.com/webhooks/tourism",
  "secret": "whs_A1B2C3D4E5F6G7H8...",
  "subscribed_events": ["booking.confirmed", "payment.success"],
  "is_active": true
}
```

---

### 3. ✅ Autenticación HMAC-SHA256

#### Archivo: `hmac_utils.py`

**Funciones**:
- `generate_secret()` - Genera secret aleatorio
- `compute_hmac_signature()` - Calcula firma HMAC
- `verify_hmac_signature()` - Verifica firma
- `create_webhook_headers()` - Crea headers con firma
- `verify_webhook_signature()` - Verifica webhook entrante

**Headers de Webhook**:
```http
Content-Type: application/json
X-Webhook-Signature: abc123...def456
X-Webhook-Signature-Algorithm: sha256
X-Service-Name: TurismoEcuador
```

**Cálculo de Firma** (Python):
```python
import hmac, hashlib, json

payload = {"event": "payment.success", "data": {...}}
payload_str = json.dumps(payload, sort_keys=True, separators=(',', ':'))
signature = hmac.new(
    secret.encode('utf-8'),
    payload_str.encode('utf-8'),
    hashlib.sha256
).hexdigest()
```

---

### 4. ✅ Webhooks Bidireccionales

#### A. Envío de Webhooks (Outgoing)

**Endpoint**: `POST /webhooks/send` (requiere admin)

Envía eventos a partners suscritos con:
- Firma HMAC automática
- Reintentos automáticos (hasta 3)
- Timeout de 10 segundos
- Logging completo

**Ejemplo**:
```bash
curl -X POST http://localhost:8002/webhooks/send \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "booking.confirmed",
    "data": {
      "booking_id": "booking_123",
      "user_id": "user_456",
      "amount": 150.00
    }
  }'
```

#### B. Recepción de Webhooks (Incoming)

**Endpoint**: `POST /webhooks/incoming/{partner_name}`

Recibe webhooks de partners con:
- Verificación automática de firma HMAC
- Validación de partner activo
- Logging de webhook
- Actualización de last_ping

**Ejemplo**:
```bash
curl -X POST http://localhost:8002/webhooks/incoming/HotelParadise \
  -H "X-Webhook-Signature: <hmac_signature>" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "service.activated",
    "data": {"service_id": "room_101"}
  }'
```

---

### 5. ✅ Normalización de Webhooks

Cada adapter implementa `normalize_webhook_event()` para convertir diferentes formatos a estándar interno.

**Formato Estándar**:
```python
{
    "event_type": "payment.success",  # Tipo normalizado
    "external_id": "pi_123abc",       # ID del proveedor
    "status": "completed",             # Estado normalizado
    "amount": 150.00,                  # Monto en dólares
    "currency": "USD",                 # Moneda
    "metadata": {...},                 # Metadata
    "raw_event": {...}                 # Evento original completo
}
```

**Mapeo de Eventos**:
- Stripe `payment_intent.succeeded` → `payment.success`
- Stripe `charge.refunded` → `payment.refunded`
- MercadoPago `payment.updated` → `payment.success`

---

## 📡 Eventos Soportados

### Payment Events
- `payment.success` - Pago completado exitosamente
- `payment.failed` - Pago fallido
- `payment.refunded` - Pago reembolsado

### Booking Events
- `booking.confirmed` - Reserva confirmada
- `booking.cancelled` - Reserva cancelada

### Order Events
- `order.created` - Orden creada
- `order.completed` - Orden completada

### Service Events
- `service.activated` - Servicio activado
- `service.cancelled` - Servicio cancelado

### Tour Events
- `tour.purchased` - Tour comprado
- `tour.cancelled` - Tour cancelado

---

## 🗄️ Modelos de Datos

### Payment
```python
{
    "id": "payment_123",
    "amount": 150.00,
    "currency": "USD",
    "status": "completed",
    "provider": "mock",
    "external_id": "mock_abc123",
    "user_id": "user_789",
    "order_id": "booking_456",
    "metadata": {...},
    "created_at": "2024-01-15T10:30:00Z"
}
```

### Partner
```python
{
    "id": "partner_123",
    "name": "Hotel Paradise",
    "webhook_url": "https://hotel-paradise.com/webhooks",
    "secret": "whs_AbCdEf...",
    "subscribed_events": ["booking.confirmed", "payment.success"],
    "is_active": true,
    "last_ping": "2024-01-15T10:30:00Z"
}
```

### WebhookLog
```python
{
    "id": "log_123",
    "event_type": "payment.success",
    "direction": "outgoing",  # o "incoming"
    "partner_name": "Hotel Paradise",
    "url": "https://hotel-paradise.com/webhooks",
    "payload": {...},
    "status_code": 200,
    "success": true,
    "signature": "abc123...",
    "retry_count": 0,
    "created_at": "2024-01-15T10:30:00Z"
}
```

---

## 🔐 Seguridad

### 1. Autenticación JWT
- Endpoints de pagos requieren JWT del Auth Service
- Validación local de tokens (sin llamadas HTTP)
- Roles: `user` para pagos propios, `admin` para reembolsos

### 2. HMAC para Webhooks
- Secret único por partner (32+ caracteres)
- Firma SHA-256 de todo el payload
- Comparación segura contra timing attacks
- Algoritmo configurable (sha256, sha512)

### 3. Validaciones
- Partner debe estar activo
- Firma HMAC obligatoria en webhooks entrantes
- Timeout de 10 segundos en webhooks salientes
- Logs completos para auditoría

---

## 📚 Documentación Creada

1. ✅ **README.md** - Documentación completa del servicio
2. ✅ **EJEMPLOS_USO.md** - Ejemplos prácticos con curl
3. ✅ **PILAR2_IMPLEMENTACION.md** - Este documento
4. ✅ **Swagger UI** - http://localhost:8002/docs

---

## 🧪 Testing

### Test Rápido con MockAdapter

```bash
# 1. Login para obtener token
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "odalis@gmail.com", "password": "tupassword"}'

# 2. Crear pago mock
curl -X POST http://localhost:8002/payments/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.00,
    "currency": "USD",
    "provider": "mock",
    "description": "Test Payment"
  }'
```

### Test de Webhooks con webhook.site

1. Ir a https://webhook.site y copiar URL única
2. Registrar como partner:
```bash
curl -X POST http://localhost:8002/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestPartner",
    "webhook_url": "https://webhook.site/abc123...",
    "subscribed_events": ["payment.success"]
  }'
```
3. Crear un pago mock - se enviará webhook automáticamente
4. Verificar en webhook.site que llegó con firma HMAC

---

## 🔧 Integración con Otros Servicios

### Desde REST API (Python)

```python
import httpx

async def notify_booking_confirmed(booking_data):
    """Notifica confirmación de reserva a partners"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8002/webhooks/send",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "event": "booking.confirmed",
                "data": booking_data
            }
        )
        return response.json()
```

### Desde GraphQL Service (TypeScript)

```typescript
import axios from 'axios';

async function sendTourPurchasedEvent(tourData: any) {
  const response = await axios.post(
    'http://localhost:8002/webhooks/send',
    {
      event: 'tour.purchased',
      data: tourData
    },
    {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    }
  );
  return response.data;
}
```

---

## 🤝 Colaboración entre Grupos

### Para que otro grupo se integre:

**Paso 1: Registro**
```bash
curl -X POST http://localhost:8002/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grupo5-Transporte",
    "webhook_url": "https://transporte-grupo5.com/api/webhooks",
    "subscribed_events": ["booking.confirmed", "tour.purchased"],
    "contact_email": "grupo5@example.com"
  }'
```

**Paso 2: Guardar Secret**
El otro grupo debe guardar el `secret` recibido.

**Paso 3: Implementar Endpoint**
El otro grupo implementa su endpoint de webhook con verificación HMAC.

**Paso 4: Enviar Eventos de Vuelta**
Cuando el otro grupo quiera notificarnos, calcula firma HMAC y envía a:
```
POST http://localhost:8002/webhooks/incoming/Grupo5-Transporte
```

---

## 📊 Arquitectura Final

```
┌─────────────────────────────────────────────────────────────┐
│                  Payment Service (Port 8002)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐     ┌──────────────────────────────┐     │
│  │   Payment    │────▶│    Payment Adapters          │     │
│  │   Routes     │     │  - MockAdapter               │     │
│  │              │     │  - StripeAdapter             │     │
│  └──────────────┘     │  - MercadoPagoAdapter        │     │
│         │             └──────────────────────────────┘     │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐     ┌──────────────────────────────┐     │
│  │   Webhook    │────▶│    HMAC Utils                │     │
│  │   Service    │     │  - Sign webhooks             │     │
│  │              │     │  - Verify signatures         │     │
│  └──────────────┘     │  - Generate secrets          │     │
│         │             └──────────────────────────────┘     │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────────────────────────────────────┐     │
│  │         MongoDB (payment_service_db)              │     │
│  │  - payments (pagos realizados)                    │     │
│  │  - partners (partners registrados)                │     │
│  │  - webhook_logs (logs de webhooks)                │     │
│  └──────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │                            ▲
         │ Outgoing Webhooks          │ Incoming Webhooks
         │ (HMAC signed)              │ (HMAC verified)
         ▼                            │
  ┌─────────────┐            ┌─────────────┐
  │  Partner A  │            │  Partner B  │
  │  (Hotel)    │            │ (Transport) │
  │             │            │             │
  │  Subscribed:│            │  Subscribed:│
  │  - booking  │            │  - tour     │
  │  - payment  │            │  - payment  │
  └─────────────┘            └─────────────┘
```

---

## ✅ Verificación de Implementación

### Checklist Pilar 2:

- [x] Payment Service Wrapper creado
- [x] Patrón Adapter implementado
  - [x] PaymentProviderInterface definido
  - [x] MockAdapter funcional
  - [x] StripeAdapter implementado
  - [x] MercadoPagoAdapter implementado
- [x] Registro de Partners
  - [x] POST /partners/register
  - [x] Generación automática de secrets
  - [x] CRUD completo de partners
- [x] Autenticación HMAC
  - [x] Firma HMAC-SHA256
  - [x] Verificación de firmas
  - [x] Headers estándar
- [x] Webhooks Bidireccionales
  - [x] Envío de webhooks salientes
  - [x] Recepción de webhooks entrantes
  - [x] Reintentos automáticos
  - [x] Logging completo
- [x] Normalización de Webhooks
  - [x] normalize_webhook_event() en cada adapter
  - [x] Formato estándar interno
  - [x] Mapeo de eventos por proveedor
- [x] Documentación
  - [x] README.md completo
  - [x] EJEMPLOS_USO.md
  - [x] Swagger UI auto-generado
- [x] Testing
  - [x] MockAdapter funcional
  - [x] Servicio corriendo en puerto 8002
  - [x] MongoDB conectado
  - [x] Autenticación JWT integrada

---

## 🎉 Resultado Final

**Pilar 2: COMPLETADO AL 100%**

El sistema de webhooks e interoperabilidad B2B está completamente implementado y funcional, permitiendo:

1. ✅ Procesar pagos con múltiples proveedores (Mock, Stripe, MercadoPago)
2. ✅ Registrar partners externos con webhooks
3. ✅ Autenticar webhooks con HMAC-SHA256
4. ✅ Enviar y recibir eventos de forma bidireccional
5. ✅ Normalizar eventos de diferentes proveedores
6. ✅ Logging completo para auditoría
7. ✅ Documentación exhaustiva

El servicio está listo para integración con otros grupos y servicios.

---

## 📞 Siguiente Paso

Con el Pilar 2 completado, el proyecto tiene:
- ✅ Pilar 1: Microservicio de Autenticación (Auth Service)
- ✅ Pilar 2: Webhooks e Interoperabilidad B2B (Payment Service)

**Listos para implementar Pilar 3 cuando lo solicites.**
