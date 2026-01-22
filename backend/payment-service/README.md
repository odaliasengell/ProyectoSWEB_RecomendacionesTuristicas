# Payment Service - Turismo Ecuador

Microservicio de pagos con sistema de webhooks para interoperabilidad B2B.

## 🎯 Características Principales

### 1. **Patrón Adapter para Múltiples Proveedores**
Abstracción de diferentes pasarelas de pago con interface común:
- **StripeAdapter**: Integración con Stripe
- **MercadoPagoAdapter**: Integración con MercadoPago
- **MockAdapter**: Simulador para testing

### 2. **Sistema de Webhooks Bidireccionales**
- Envío de eventos a partners suscritos
- Recepción de eventos de partners externos
- Autenticación HMAC-SHA256 en ambas direcciones
- Reintentos automáticos con logging completo

### 3. **Registro de Partners**
Sistema para que otros grupos/servicios se registren y reciban webhooks:
- Generación automática de secrets compartidos
- Suscripción a eventos específicos
- Gestión de partners activos/inactivos

### 4. **Normalización de Eventos**
Conversión de diferentes formatos de webhooks a formato estándar interno.

## 📋 Eventos Soportados

### Payment Events
- `payment.success` - Pago exitoso
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

## 🚀 Instalación

### Prerrequisitos
- Python 3.11+
- MongoDB
- Auth Service corriendo en puerto 8001

### Configuración

1. **Instalar dependencias**:
```powershell
cd backend/payment-service
pip install -r requirements.txt
```

2. **Configurar variables de entorno**:
Editar `.env` con tus credenciales:
```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DB_NAME=payment_service_db

# Server
PORT=8002

# Stripe (opcional)
STRIPE_API_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# MercadoPago (opcional)
MERCADOPAGO_ACCESS_TOKEN=your_token

# Auth Service
AUTH_SERVICE_URL=http://localhost:8001
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production-123456789
```

### Iniciar Servicio

```powershell
python main.py
```

El servicio estará disponible en `http://localhost:8002`

## 📚 Documentación API

Swagger UI: http://localhost:8002/docs
ReDoc: http://localhost:8002/redoc

## 🔐 Autenticación

### Para Endpoints de Pago
Se requiere JWT token del Auth Service:
```http
Authorization: Bearer <access_token>
```

### Para Webhooks Entrantes
Se requiere firma HMAC en headers:
```http
X-Webhook-Signature: <hmac_signature>
X-Webhook-Signature-Algorithm: sha256
X-Service-Name: <partner_name>
```

## 💡 Ejemplos de Uso

### 1. Crear un Pago (Mock)

```bash
curl -X POST http://localhost:8002/payments/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.00,
    "currency": "USD",
    "provider": "mock",
    "description": "Tour a Galápagos",
    "order_id": "booking_123",
    "metadata": {
      "tour_id": "galapagos_001",
      "user_email": "cliente@example.com"
    }
  }'
```

### 2. Registrar un Partner

```bash
curl -X POST http://localhost:8002/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hotel Paradise",
    "webhook_url": "https://hotel-paradise.com/webhooks/tourism",
    "subscribed_events": ["booking.confirmed", "payment.success"],
    "contact_email": "dev@hotel-paradise.com",
    "description": "Hotel en Quito"
  }'
```

**Respuesta**:
```json
{
  "id": "partner_123abc",
  "name": "Hotel Paradise",
  "webhook_url": "https://hotel-paradise.com/webhooks/tourism",
  "secret": "whs_AbCdEf1234567890XyZ",
  "subscribed_events": ["booking.confirmed", "payment.success"],
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

⚠️ **Importante**: Guardar el `secret` devuelto - se usará para firmar webhooks.

### 3. Enviar Webhook a Partners

```bash
curl -X POST http://localhost:8002/webhooks/send \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "booking.confirmed",
    "data": {
      "booking_id": "booking_12345",
      "tour_id": "galapagos_001",
      "user_id": "user_789",
      "amount": 150.00,
      "currency": "USD",
      "booking_date": "2024-02-01"
    }
  }'
```

### 4. Recibir Webhook de Partner

El partner debe enviar:

```bash
curl -X POST http://localhost:8002/webhooks/incoming/HotelParadise \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: <hmac_signature>" \
  -H "X-Webhook-Signature-Algorithm: sha256" \
  -H "X-Service-Name: HotelParadise" \
  -d '{
    "event": "service.activated",
    "timestamp": "2024-01-15T10:30:00Z",
    "data": {
      "service_id": "hotel_room_101",
      "booking_id": "booking_12345",
      "status": "confirmed"
    }
  }'
```

## 🔒 Firma HMAC

### Calcular Firma (Python)

```python
import hmac
import hashlib
import json

def sign_webhook(payload: dict, secret: str) -> str:
    """Calcula firma HMAC-SHA256"""
    payload_str = json.dumps(payload, sort_keys=True, separators=(',', ':'))
    signature = hmac.new(
        secret.encode('utf-8'),
        payload_str.encode('utf-8'),
        hashlib.sha256
    )
    return signature.hexdigest()

# Ejemplo
payload = {
    "event": "service.activated",
    "timestamp": "2024-01-15T10:30:00Z",
    "data": {"service_id": "hotel_room_101"}
}
secret = "whs_AbCdEf1234567890XyZ"

signature = sign_webhook(payload, secret)
print(f"X-Webhook-Signature: {signature}")
```

### Verificar Firma (Automático)

El servicio verifica automáticamente las firmas HMAC en webhooks entrantes.

## 📊 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Payment Service                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐     ┌──────────────────────────────┐     │
│  │   FastAPI    │────▶│    Payment Adapters          │     │
│  │   Routes     │     │  - StripeAdapter             │     │
│  └──────────────┘     │  - MercadoPagoAdapter        │     │
│         │             │  - MockAdapter               │     │
│         │             └──────────────────────────────┘     │
│         ▼                                                   │
│  ┌──────────────┐     ┌──────────────────────────────┐     │
│  │   Webhook    │────▶│    HMAC Utils                │     │
│  │   Service    │     │  - Sign webhooks             │     │
│  └──────────────┘     │  - Verify signatures         │     │
│         │             └──────────────────────────────┘     │
│         ▼                                                   │
│  ┌──────────────────────────────────────────────────┐     │
│  │            MongoDB                                │     │
│  │  - payments                                       │     │
│  │  - partners                                       │     │
│  │  - webhook_logs                                   │     │
│  └──────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │                            ▲
         │ Outgoing Webhooks          │ Incoming Webhooks
         │ (with HMAC)                │ (HMAC verified)
         ▼                            │
  ┌─────────────┐            ┌─────────────┐
  │  Partner A  │            │  Partner B  │
  │  (Hotel)    │            │ (Transport) │
  └─────────────┘            └─────────────┘
```

## 🗄️ Modelos de Datos

### Payment
```python
{
    "id": "payment_123",
    "amount": 150.00,
    "currency": "USD",
    "status": "completed",  # pending, processing, completed, failed, refunded, cancelled
    "provider": "stripe",   # mock, stripe, mercadopago
    "external_id": "pi_1234567890",
    "user_id": "user_789",
    "order_id": "booking_456",
    "metadata": {},
    "created_at": "2024-01-15T10:30:00Z"
}
```

### Partner
```python
{
    "id": "partner_123",
    "name": "Hotel Paradise",
    "webhook_url": "https://hotel-paradise.com/webhooks",
    "secret": "whs_AbCdEf1234567890",
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
    "direction": "outgoing",  # incoming or outgoing
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

## 🧪 Testing

### 1. Testing con Mock Adapter

No requiere configuración de proveedores externos:

```bash
# El provider "mock" simula pagos exitosos automáticamente
curl -X POST http://localhost:8002/payments/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "USD", "provider": "mock"}'
```

### 2. Testing de Webhooks

Registrar un endpoint de prueba en https://webhook.site y usar esa URL como webhook_url.

## 🔧 Integración con Otros Servicios

### Desde REST API (Python)

```python
import httpx
from hmac_utils import compute_hmac_signature

async def notify_payment_success(payment_data):
    """Envía notificación de pago exitoso"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8002/webhooks/send",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "event": "payment.success",
                "data": payment_data
            }
        )
        return response.json()
```

### Validar JWT desde Payment Service

El Payment Service usa el módulo `local_jwt_validator.py` del Auth Service para validar tokens sin hacer llamadas HTTP.

## 📝 Notas Importantes

1. **Secrets**: Los secrets de partners son sensibles - nunca exponerlos en logs
2. **HTTPS en Producción**: Los webhooks deben usar HTTPS
3. **Timeouts**: Los webhooks tienen timeout de 10 segundos
4. **Reintentos**: Se hacen hasta 3 reintentos automáticos
5. **Logs**: Todos los webhooks se registran para auditoría

## 🤝 Colaboración entre Grupos

Para que otro grupo se integre:

1. Registrarse como partner (POST /partners/register)
2. Recibir el secret compartido
3. Implementar endpoint de webhook en su servicio
4. Verificar firma HMAC en webhooks recibidos
5. Enviar webhooks de vuelta con firma HMAC

## 📧 Soporte

Para dudas o problemas, contactar al equipo de desarrollo.
