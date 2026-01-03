# 💳 Payment Service - Microservicio de Pagos

Servicio de pagos con patrón Adapter que soporta múltiples pasarelas (Stripe, MercadoPago, Mock).

## 🚀 Características

- ✅ Patrón Adapter para abstracción de proveedores de pago
- ✅ Mock Adapter para desarrollo sin credenciales reales
- ✅ StripeAdapter para procesamiento de pagos con Stripe
- ✅ MercadoPagoAdapter para Latinoamérica
- ✅ Webhooks con validación HMAC-SHA256
- ✅ Registro de partners (registro bidireccional de webhooks)
- ✅ Logs de transacciones en MongoDB

## 📋 Endpoints

### Públicos

- `POST /payment/init` - Iniciar pago
- `POST /payment/status/{transaction_id}` - Consultar estado de pago
- `POST /webhooks/payments` - Recibir webhook de pasarela de pago

### Protegidos (requieren Auth)

- `GET /payment/history` - Historial de pagos del usuario
- `POST /payment/refund` - Solicitar reembolso

### Admin

- `POST /partners/register` - Registrar webhook de partner
- `GET /partners` - Listar partners registrados
- `DELETE /partners/{partner_id}` - Remover partner

## 🏗️ Estructura del Código

```
payment-service/
├── main.py                    # Punto de entrada
├── config.py                  # Configuración
├── db.py                       # Conexión a BD
├── adapters/
│   ├── __init__.py
│   ├── payment_provider.py    # Interface abstracta
│   ├── mock_adapter.py        # Mock Adapter
│   ├── stripe_adapter.py      # Stripe Adapter
│   └── mercadopago_adapter.py # MercadoPago Adapter
├── services/
│   ├── __init__.py
│   ├── payment_service.py     # Lógica de pagos
│   ├── webhook_service.py     # Manejo de webhooks
│   └── partner_service.py     # Gestión de partners
├── models/
│   ├── __init__.py
│   ├── payment.py             # Modelo Payment
│   ├── partner.py             # Modelo Partner
│   └── transaction.py         # Modelo Transaction
├── routes/
│   ├── __init__.py
│   ├── payment_routes.py      # Rutas de pago
│   └── partner_routes.py      # Rutas de partners
└── schemas/
    ├── __init__.py
    ├── payment_schema.py      # Schemas de pago
    └── partner_schema.py      # Schemas de partners
```

## 🔧 Instalación

### Requisitos previos

- Python 3.11+
- PostgreSQL 14+
- Redis 7+

### Pasos

```bash
cd backend/payment-service

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Ejecutar
python main.py
```

## 🏦 Arquitectura: Patrón Adapter

```
┌─────────────────────────────────────────────────────┐
│         Payment Service API                         │
│  POST /payment/init                                 │
│  POST /webhooks/payments                            │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│         PaymentService (Factory Pattern)            │
│  • Selecciona adapter según config                  │
│  • Ejecuta procesamiento                            │
└──────────┬────────────────────────────────────────┬─┘
           │                                        │
    ┌──────▼──────────┐   ┌──────────────────┐   ┌──▼─────────────┐
    │  MockAdapter    │   │ StripeAdapter    │   │MercadoPagoAdapter
    │ (Desarrollo)    │   │ (Producción)     │   │ (LATAM)         │
    │                 │   │                  │   │                 │
    │ processPayment()│   │ processPayment() │   │processPayment() │
    │ validateWebhook │   │ validateWebhook  │   │validateWebhook  │
    │ getStatus()     │   │ getStatus()      │   │getStatus()      │
    └─────────────────┘   └──────────────────┘   └─────────────────┘
```

## 💰 Flujo de Pago

```
1. Frontend llama POST /payment/init
   ├── Amount: 100 USD
   ├── Currency: USD
   ├── Description: "Tour la Costa"
   └── Metadata: {tour_id, user_id, reservation_id}

2. Payment Service
   ├── Valida monto y usuario (via Auth Service)
   ├── Selecciona adapter (MockAdapter por defecto)
   ├── Ejecuta adapter.processPayment()
   ├── Guarda transacción en MongoDB
   └── Retorna {transaction_id, status, redirectUrl (si aplica)}

3. MockAdapter simula procesamiento
   ├── Genera transaction_id único
   ├── Retorna status = "completed" o "failed"
   └── Simula webhook después de 1s

4. Webhook a n8n
   ├── POST {n8n_webhook_url}
   ├── Payload: {event: "payment.success", transaction}
   ├── Signature HMAC-SHA256
   └── n8n ejecuta workflow de confirmación

5. n8n Payment Handler Workflow
   ├── Valida HMAC
   ├── Actualiza reserva en MongoDB
   ├── Notifica via WebSocket
   ├── Envía email
   └── Dispara webhook a grupo partner
```

## 🔐 Seguridad en Webhooks

### Firma HMAC-SHA256

```python
import hmac
import hashlib
import json

def sign_webhook(payload: dict, secret: str) -> str:
    """Genera firma HMAC para webhook"""
    payload_str = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        secret.encode(),
        payload_str.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature

def verify_webhook(payload: dict, signature: str, secret: str) -> bool:
    """Verifica firma HMAC de webhook recibido"""
    expected_signature = sign_webhook(payload, secret)
    return hmac.compare_digest(signature, expected_signature)
```

## 🔗 Integración de Partners

### Registro de Partner

```bash
POST /partners/register
{
  "partner_name": "Grupo B - Tours",
  "webhook_url": "https://partner-group.com/webhooks/payments",
  "events": ["payment.success", "payment.failed"],
  "shared_secret": "auto-generated-secret"
}

Response:
{
  "partner_id": "uuid",
  "shared_secret": "generated-secret-key",
  "webhook_url": "https://...",
  "status": "active"
}
```

### Envío de Webhook a Partner

```python
def send_webhook_to_partner(partner: Partner, event: str, payload: dict):
    """Envía webhook firmado a partner"""
    # Generar firma
    signature = sign_webhook(payload, partner.shared_secret)

    # Headers
    headers = {
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': event,
        'X-Timestamp': int(time.time()),
        'Content-Type': 'application/json'
    }

    # Enviar con reintentos
    for attempt in range(3):
        try:
            response = requests.post(
                partner.webhook_url,
                json=payload,
                headers=headers,
                timeout=10
            )

            if response.status_code == 200:
                return {'success': True, 'attempt': attempt + 1}

        except Exception as e:
            if attempt < 2:
                time.sleep(2 ** attempt)  # Exponential backoff

    return {'success': False}
```

## 📊 Base de Datos

### Tabla: payments (MongoDB)

```python
{
  "_id": ObjectId,
  "transaction_id": UUID,
  "user_id": UUID,
  "amount": Decimal,
  "currency": "USD",
  "status": "pending|completed|failed",
  "provider": "mock|stripe|mercadopago",
  "provider_transaction_id": String,
  "metadata": {
    "tour_id": ObjectId,
    "reservation_id": UUID
  },
  "created_at": DateTime,
  "updated_at": DateTime,
  "webhook_notified": Boolean,
  "webhook_notified_at": DateTime
}
```

### Tabla: partners (PostgreSQL)

```sql
CREATE TABLE partners (
    id UUID PRIMARY KEY,
    partner_name VARCHAR(255) NOT NULL,
    webhook_url VARCHAR(255) NOT NULL,
    shared_secret VARCHAR(255) NOT NULL,
    events JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_webhook_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 Testing

```bash
# Probar pago con MockAdapter
curl -X POST http://localhost:8001/payment/init \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt_token}" \
  -d '{
    "amount": 100,
    "currency": "USD",
    "description": "Test payment"
  }'

# Respuesta
{
  "transaction_id": "txn_123abc",
  "status": "completed",
  "amount": 100,
  "currency": "USD",
  "created_at": "2024-01-02T12:00:00Z"
}
```

## 🔄 Eventos de Webhook

### payment.success

```json
{
  "event": "payment.success",
  "timestamp": 1704186000,
  "transaction_id": "txn_123abc",
  "amount": 100,
  "currency": "USD",
  "user_id": "uuid",
  "metadata": {
    "tour_id": "uuid",
    "reservation_id": "uuid"
  }
}
```

### payment.failed

```json
{
  "event": "payment.failed",
  "timestamp": 1704186000,
  "transaction_id": "txn_123abc",
  "reason": "insufficient_funds",
  "user_id": "uuid"
}
```

## 📈 Escalabilidad

- **Stateless**: Puede escalarse horizontalmente
- **Redis**: Cache de transacciones y partners
- **Async Webhooks**: n8n maneja webhooks asincronamente
- **Database**: Índices en transaction_id, user_id

## 🔗 Referencias

- [Stripe API](https://stripe.com/docs/api)
- [MercadoPago API](https://www.mercadopago.com.ar/developers/docs)
- [Adapter Pattern](https://refactoring.guru/design-patterns/adapter)
- [HMAC Security](https://owasp.org/www-community/attacks/Webhook)
