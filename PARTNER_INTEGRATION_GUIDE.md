# 👥 Guía de Integración para Grupos Partner

> Instrucciones para que otros grupos integren webhooks bidireccionales con nuestro sistema

---

## 📋 Introducción

Este documento explica cómo tu grupo puede integrarse con nuestro sistema de recomendaciones turísticas para recibir notificaciones de eventos (pagos confirmados, reservas creadas, etc.) y enviar eventos propios.

### Flujo de Integración

```
Tu Sistema                      Nuestro Sistema
    │                                 │
    ├─ 1. Registrate                 │
    │     POST /partners/register────→│
    │                                 │
    │  ←─ Recibe shared_secret        │
    │                                 │
    ├─ 2. Implementa receptor         │
    │     POST /webhook (en tu lado)  │
    │                                 │
    │  ←─ Webhook firmado             │
    │     X-Webhook-Signature         │
    │                                 │
    └─ 3. Valida y procesa           │
         HMAC-SHA256                 │
         ↓
         Responde ACK
         ─────────────→               │
         (HTTP 200)
```

---

## 1️⃣ Registro de Tu Grupo

### Paso 1: Contactar a Nuestro Equipo

Proporciona:

- Nombre del grupo
- Email de contacto
- URL donde recibirás webhooks
- Eventos que deseas suscribirse

### Paso 2: Enviar Request de Registro

```bash
curl -X POST https://api.nuestro-sistema.com/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "partner_name": "Tu Grupo - Nombre",
    "webhook_url": "https://tu-dominio.com/webhooks/events",
    "events": [
      "payment.success",
      "payment.failed",
      "booking.confirmed",
      "booking.cancelled"
    ]
  }'
```

### Paso 3: Guardar las Credenciales

**Response** (Guarda estos valores de forma segura):

```json
{
  "partner_id": "partner_abc123xyz",
  "webhook_url": "https://tu-dominio.com/webhooks/events",
  "shared_secret": "sk_live_9a8b7c6d5e4f3g2h1i0j_DO_NOT_SHARE",
  "status": "active",
  "events_subscribed": [
    "payment.success",
    "payment.failed",
    "booking.confirmed"
  ]
}
```

⚠️ **IMPORTANTE**: Almacena `shared_secret` en variable de entorno, NUNCA en código visible.

---

## 2️⃣ Implementar Receptor de Webhooks

### Paso 1: Crear Endpoint en Tu Backend

```python
# Python + FastAPI Ejemplo
from fastapi import FastAPI, Request, HTTPException
import hmac
import hashlib
import json
import os

app = FastAPI()

SHARED_SECRET = os.getenv("PARTNER_SHARED_SECRET")

@app.post("/webhooks/events")
async def receive_webhook(request: Request):
    """
    Recibe webhooks de nuestro sistema
    Todos están firmados con HMAC-SHA256
    """

    # 1. Obtener signature del header
    signature = request.headers.get("X-Webhook-Signature")
    event_type = request.headers.get("X-Webhook-Event")

    if not signature or not event_type:
        raise HTTPException(status_code=400, detail="Missing headers")

    # 2. Leer body
    body = await request.json()

    # 3. Validar firma (ver función abajo)
    if not verify_signature(body, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # 4. Procesar evento
    if event_type == "payment.success":
        await handle_payment_success(body)
    elif event_type == "booking.confirmed":
        await handle_booking_confirmed(body)
    elif event_type == "payment.failed":
        await handle_payment_failed(body)

    # 5. Responder ACK
    return {"status": "received", "timestamp": int(time.time())}


def verify_signature(payload: dict, signature: str) -> bool:
    """
    Verifica que el webhook viene de nuestro sistema
    """
    # Serializar payload igual a como lo hizo el servidor
    payload_str = json.dumps(payload, sort_keys=True, separators=(',', ':'))

    # Generar firma esperada
    expected_signature = hmac.new(
        SHARED_SECRET.encode('utf-8'),
        payload_str.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    # Comparar con timing seguro (evita timing attacks)
    return hmac.compare_digest(signature, expected_signature)


async def handle_payment_success(payload: dict):
    """Procesar pago exitoso"""
    print(f"✅ Pago exitoso: {payload['transaction_id']}")

    # Ejemplo: Actualizar registro en tu BD
    # db.reservas.update_one(
    #     {"_id": payload['metadata']['reservation_id']},
    #     {"$set": {"payment_confirmed": True}}
    # )

    # Enviar email al cliente
    # send_email(payload['user_email'], "Pago confirmado")


async def handle_booking_confirmed(payload: dict):
    """Procesar reserva confirmada"""
    print(f"📅 Reserva confirmada: {payload['booking_id']}")

    # Crear paquete turístico relacionado
    # tour = create_related_tour_package(
    #     user_id=payload['user_id'],
    #     destination=payload['destination'],
    #     dates=(payload['start_date'], payload['end_date'])
    # )
    #
    # notify_user(payload['user_email'], tour)


async def handle_payment_failed(payload: dict):
    """Procesar pago fallido"""
    print(f"❌ Pago fallido: {payload['transaction_id']}")
    # Tomar acciones (reintentar, notificar usuario, etc.)
```

### Paso 2: Testing Local

```bash
# Instalar ngrok para exponer localhost
ngrok http 8000
# Nota: https://abc123.ngrok.io → tu localhost

# Registrar con URL de ngrok
curl -X POST https://api.nuestro-sistema.com/partners/register \
  -d '{
    "partner_name": "Mi Grupo",
    "webhook_url": "https://abc123.ngrok.io/webhooks/events",
    "events": ["payment.success"]
  }'

# Probar webhook manualmente
curl -X POST https://abc123.ngrok.io/webhooks/events \
  -H "X-Webhook-Signature: abc123..." \
  -H "X-Webhook-Event: payment.success" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.success",
    "transaction_id": "test_123"
  }'
```

---

## 3️⃣ Estructura de Eventos

### Evento: payment.success

Se envía cuando un pago es confirmado.

```json
{
  "event": "payment.success",
  "timestamp": 1704186000,
  "transaction_id": "txn_abc123def456",
  "amount": 150.0,
  "currency": "USD",
  "user_id": "user_uuid_here",
  "user_email": "cliente@example.com",
  "user_name": "Juan Pérez",
  "metadata": {
    "tour_id": "tour_uuid_here",
    "tour_name": "Amazonía Premium",
    "destination": "Amazonía",
    "reservation_id": "res_uuid_here",
    "start_date": "2024-02-15",
    "end_date": "2024-02-18",
    "num_people": 4
  },
  "provider": "stripe" // o "mercadopago", "mock"
}
```

**Tiempo de retención**: 5 segundos de timeout
**Reintentos**: Hasta 3 intentos con backoff exponencial

### Evento: booking.confirmed

Se envía cuando una reserva es confirmada.

```json
{
  "event": "booking.confirmed",
  "timestamp": 1704186000,
  "booking_id": "res_uuid_here",
  "tour_id": "tour_uuid_here",
  "tour_name": "Galápagos Explorer",
  "user_id": "user_uuid_here",
  "user_email": "cliente@example.com",
  "start_date": "2024-03-10",
  "end_date": "2024-03-15",
  "total_participants": 2,
  "status": "confirmed",
  "payment_status": "completed"
}
```

### Evento: payment.failed

Se envía cuando un pago falla.

```json
{
  "event": "payment.failed",
  "timestamp": 1704186000,
  "transaction_id": "txn_failed_123",
  "reason": "insufficient_funds",
  "user_id": "user_uuid_here",
  "user_email": "cliente@example.com",
  "amount": 100.0,
  "attempted_at": "2024-01-02T10:30:00Z"
}
```

---

## 4️⃣ Enviar Eventos Propios (Opcional)

Si tu grupo quiere notificarnos sobre tus eventos:

```python
import hmac
import hashlib
import json
import requests
from datetime import datetime

def send_webhook_to_partner(event_type: str, payload: dict):
    """
    Envía webhook a nuestro sistema
    """

    # URL donde nuestro grupo recibe webhooks
    webhook_url = "https://api.nuestro-sistema.com/webhooks/partners"

    # Tu shared_secret (guardado en env vars)
    shared_secret = os.getenv("PARTNER_SHARED_SECRET")

    # Serializar payload
    payload_str = json.dumps(payload, sort_keys=True, separators=(',', ':'))

    # Generar firma
    signature = hmac.new(
        shared_secret.encode('utf-8'),
        payload_str.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    # Headers
    headers = {
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": event_type,
        "Content-Type": "application/json",
        "User-Agent": "TuGrupoWebhooks/1.0"
    }

    # Enviar con reintentos
    for attempt in range(3):
        try:
            response = requests.post(
                webhook_url,
                json=payload,
                headers=headers,
                timeout=10
            )

            if response.status_code == 200:
                print(f"✅ Webhook enviado: {event_type}")
                return True

            print(f"⚠️ Intento {attempt+1} falló: {response.status_code}")
        except requests.RequestException as e:
            print(f"⚠️ Error de conexión: {e}")

        # Esperar antes de reintentar (exponential backoff)
        if attempt < 2:
            time.sleep(2 ** attempt)

    return False


# Ejemplo de uso
tour_payload = {
    "event": "tour.purchased",
    "timestamp": int(datetime.now().timestamp()),
    "tour_id": "tour_xyz789",
    "tour_name": "Montaña Blanca",
    "buyer_email": "turista@example.com",
    "buyer_name": "María González",
    "purchase_date": "2024-01-02T10:30:00Z",
    "price": 250.00
}

send_webhook_to_partner("tour.purchased", tour_payload)
```

---

## 5️⃣ Flujo Completo de Ejemplo

### Escenario: Tu Grupo Vende Tours de Montaña

```
Pasos:

1. Usuario compra tour en tu grupo
   └─ Status: Pendiente de pago

2. Nuestro grupo recibe pago
   └─ Publica webhook: payment.success

3. Tu grupo recibe el webhook
   ├─ Valida firma HMAC
   ├─ Actualiza la reserva: status = "confirmed"
   ├─ Envía email de confirmación
   └─ Responde ACK (HTTP 200)

4. Tu grupo quiere promover combo
   ├─ Crea paquete: "Tour + alojamiento"
   ├─ Envía webhook a nuestro grupo: "tour.promoted"
   └─ Nuestro sistema recibe y actualiza

5. Nuestro grupo notifica al usuario
   ├─ WebSocket: "Nueva oferta disponible"
   └─ El usuario ve la promoción en el chat
```

---

## 6️⃣ Headers Esperados

Todos los webhooks que recibas incluirán:

```
X-Webhook-Signature: [HMAC-SHA256 signature]
X-Webhook-Event: [payment.success|booking.confirmed|...]
Content-Type: application/json
```

---

## 7️⃣ Checklist de Implementación

- [ ] Registrate en `/partners/register`
- [ ] Guarda `shared_secret` en variable de entorno
- [ ] Implementa endpoint `/webhooks/events`
- [ ] Implementa función `verify_signature()`
- [ ] Maneja eventos: `payment.success`, `booking.confirmed`, `payment.failed`
- [ ] Responde con HTTP 200 y `{"status": "received"}`
- [ ] Testing local con curl
- [ ] Testing con ngrok
- [ ] Implementa retry logic (opcional)
- [ ] Añade logging y monitoreo
- [ ] Comunica cambios de webhook_url

---

## 8️⃣ Troubleshooting

### Webhook no se recibe

**Verificar**:

```bash
# 1. Que la URL sea accesible
curl https://tu-dominio.com/webhooks/events

# 2. Que firewalls lo permitan
# Whitelist IP: nuestro servidor

# 3. Ver logs en nuestro sistema
# Contacta al equipo si tienes problemas
```

### Firma HMAC no coincide

**Verificar**:

1. `shared_secret` está correcto y en env vars
2. Payload se serializa con `sort_keys=True`
3. Usar `hashlib.sha256` (no md5, no sha1)
4. Header exacto es `X-Webhook-Signature`

```python
# TEST: Validar localmente
payload = {"event": "test", "data": 123}
secret = "test_secret"

# Forma correcta
payload_str = json.dumps(payload, sort_keys=True, separators=(',', ':'))
sig = hmac.new(secret.encode(), payload_str.encode(), hashlib.sha256).hexdigest()
print(sig)
```

### Timeout al recibir

**Soluciones**:

1. Optimizar tu handler (no hagas queries largas sincrónicamente)
2. Usar queue: recibe → guarda en DB → procesa en background job
3. Timeout es 5 segundos, responde rápido con 200 OK

```python
# Mejor práctica
@app.post("/webhooks/events")
async def receive_webhook(request: Request):
    body = await request.json()

    # Validar rápido
    if not verify_signature(body, ...):
        return {"error": "Invalid"}, 401

    # Encolar para procesamiento en background
    task_queue.enqueue(process_webhook, body)

    # Responder inmediatamente
    return {"status": "received"}


# En background job (sin tiempo límite)
def process_webhook(payload):
    # Aquí sí puedes hacer operaciones largas
    # emails, DB queries, cálculos, etc.
    pass
```

---

## 9️⃣ Ejemplos en Otros Lenguajes

### Node.js / Express

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

const SHARED_SECRET = process.env.PARTNER_SHARED_SECRET;

function verifySignature(payload, signature) {
  const payloadStr = JSON.stringify(payload);
  const expectedSignature = crypto
    .createHmac('sha256', SHARED_SECRET)
    .update(payloadStr)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

app.post('/webhooks/events', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const eventType = req.headers['x-webhook-event'];

  if (!verifySignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  console.log(`✅ Webhook recibido: ${eventType}`);

  // Procesar evento
  if (eventType === 'payment.success') {
    handlePaymentSuccess(req.body);
  }

  res.json({ status: 'received' });
});

app.listen(3000);
```

### PHP

```php
<?php
$sharedSecret = getenv('PARTNER_SHARED_SECRET');
$payload = json_decode(file_get_contents('php://input'), true);
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'];

$payloadStr = json_encode($payload);
$expectedSignature = hash_hmac('sha256', $payloadStr, $sharedSecret);

if (!hash_equals($signature, $expectedSignature)) {
    http_response_code(401);
    die('Invalid signature');
}

echo json_encode(['status' => 'received']);
?>
```

---

## 🔟 Soporte y Contacto

- **Email**: webhook-support@nuestro-sistema.com
- **Documentación**: https://docs.nuestro-sistema.com/webhooks
- **Status Page**: https://status.nuestro-sistema.com
- **Slack**: #webhook-partners en nuestro workspace

---

## 📚 Referencias

- [HMAC-SHA256 Verification](https://tools.ietf.org/html/rfc2104)
- [Webhook Best Practices](https://webhooks.fyi/)
- [Webhook Security](https://owasp.org/www-community/attacks/Webhook)
- [JSON Serialization](https://www.json.org/)
