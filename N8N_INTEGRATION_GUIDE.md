# 🔄 Guía de Integración - n8n Event Bus y Webhooks B2B

> Documentación para implementar el Pilar 4 (n8n Event Bus) e integración bidireccional con grupo partner

---

## 📋 Tabla de Contenidos

1. [n8n Setup](#n8n-setup)
2. [Workflows Obligatorios](#workflows-obligatorios)
3. [Integración con Partners](#integración-con-partners)
4. [Contrato de Eventos](#contrato-de-eventos)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## n8n Setup

### 1. Iniciar n8n

```bash
# Usando Docker
docker-compose up n8n

# Acceder a la UI
# http://localhost:5678/
# Usuario: admin
# Contraseña: admin
```

### 2. Configuración Inicial

1. Cambiar contraseña de admin
2. Crear API key para webhooks
3. Configurar credenciales:
   - PostgreSQL (para BD propia de n8n)
   - HTTP (para llamadas a servicios)
   - Email (para notificaciones)

---

## Workflows Obligatorios

### Workflow 1: Payment Handler

**Objetivo**: Procesar webhooks de pagos exitosos y actualizar el sistema

**Trigger**: HTTP Request (Webhook)

```
Webhook (POST /webhook/payments)
  ↓
[1. Validate HMAC Signature]
  ├─ Verifica header X-Webhook-Signature
  └─ Si inválido → STOP
  ↓
[2. Parse Payload]
  ├─ Extrae transaction_id, amount, user_id
  └─ Valida datos requeridos
  ↓
[3. Update Database - MongoDB]
  ├─ Actualiza reserva: status = "confirmed"
  ├─ Guarda transaction_id
  └─ Marca webhook_notified = true
  ↓
[4. WebSocket Notification]
  ├─ POST http://websocket-server:8080/notify
  ├─ Body: {user_id, event: "payment.confirmed"}
  └─ Frontend se actualiza en tiempo real
  ↓
[5. Send Email Confirmation]
  ├─ Usa credencial Email
  ├─ Destinatario: usuario.email
  └─ Template: "Pago confirmado"
  ↓
[6. Dispatch Partner Webhook]
  ├─ Obtiene partner_webhook_url de DB
  ├─ Prepara payload: {event: "payment.success", ...}
  ├─ Firma con HMAC
  ├─ POST con reintentos (exponential backoff)
  └─ Guarda respuesta en logs
  ↓
[7. Send Response ACK]
  └─ Retorna HTTP 200 al pagador
```

**Implementación en n8n**:

```javascript
// Node: HTTP Webhook
{
  "method": "POST",
  "path": "payments",
  "authentication": "none" // n8n valida internamente
}

// Node: Set signature verification
{
  "algorithm": "sha256",
  "secret": process.env.N8N_WEBHOOK_SECRET,
  "header": "x-webhook-signature"
}

// Node: Call MongoDB update
{
  "operation": "update",
  "database": "tourism_db",
  "collection": "reservas",
  "filter": {
    "payment.transaction_id": "{{ $json.body.transaction_id }}"
  },
  "update": {
    "$set": {
      "status": "confirmed",
      "updated_at": new Date()
    }
  }
}

// Node: HTTP POST WebSocket notification
{
  "method": "POST",
  "url": "http://websocket-server:8080/notify",
  "body": {
    "event": "payment.confirmed",
    "user_id": "{{ $json.body.user_id }}",
    "data": "{{ $json.body }}"
  }
}

// Node: Send Email
{
  "to": "{{ $json.body.user_email }}",
  "subject": "Pago Confirmado",
  "html": "<h1>Tu pago ha sido confirmado</h1>"
}

// Node: Dispatch to Partner
{
  "method": "POST",
  "url": "{{ $json.partner_webhook_url }}",
  "headers": {
    "X-Webhook-Signature": "{{ $json.signature }}",
    "X-Webhook-Event": "payment.success",
    "Content-Type": "application/json"
  },
  "body": {
    "event": "payment.success",
    "transaction_id": "{{ $json.body.transaction_id }}",
    "timestamp": "{{ Date.now() }}"
  }
}
```

### Workflow 2: Partner Handler

**Objetivo**: Recibir webhooks de grupo partner y procesar

**Trigger**: HTTP Request (Webhook en path `/webhook/partners`)

```
Webhook (POST /webhook/partners)
  ↓
[1. Verify HMAC]
  └─ Usa partner.shared_secret de DB
  ↓
[2. Parse Event Type]
  ├─ Si event = "tour.purchased"
  ├─ Si event = "booking.confirmed"
  └─ etc.
  ↓
[3. Execute Action Based on Event]
  ├─ booking.confirmed
  │  └─ Actualizar itinerario del huésped
  ├─ payment.success
  │  └─ Activar promoción de paquete
  └─ tour.purchased
     └─ Incrementar estadísticas
  ↓
[4. Update Database]
  ├─ Guarda webhook recibido en logs
  └─ Marca como procesado
  ↓
[5. Send Response ACK]
  └─ Retorna HTTP 200 {"status": "received"}
```

### Workflow 3: MCP Input Handler (Opcional)

**Objetivo**: Integrar chat AI con múltiples canales (Telegram, Email, etc.)

```
Email / Telegram Incoming
  ↓
[1. Extract Content]
  ├─ Extrae mensaje, attachments
  └─ Detecta formato
  ↓
[2. Send to AI Orchestrator]
  ├─ POST /chat
  ├─ Parámetro: user_id, message, files
  └─ Espera respuesta
  ↓
[3. Format Response]
  └─ Adapta formato según canal
  ↓
[4. Send Back]
  ├─ Si Telegram: envía mensaje
  ├─ Si Email: responde email
  └─ Si Chat UI: usa WebSocket
```

### Workflow 4: Scheduled Task

**Objetivo**: Ejecutar tareas programadas (reportes, limpieza, health checks)

**Ejemplos**:

```
Cron: Todos los días 6:00 AM
  ↓
[1. Generate Daily Report]
  ├─ Total de reservas del día
  ├─ Ingresos por tour
  ├─ Clientes nuevos
  └─ Envia email a admin
  ↓

Cron: Cada 12 horas
  ↓
[2. Health Check]
  ├─ Verifica que todos los servicios están UP
  ├─ POST /health a cada microservicio
  ├─ Si alguno falla, envía alert
  └─ Registra en logs
  ↓

Cron: Cada hora
  ↓
[3. Cleanup Stale Data]
  ├─ Elimina sesiones expiradas
  ├─ Limpia tokens revocados
  └─ Archi va logs antiguos
```

---

## Integración con Partners

### Paso 1: Registrar Partner

**Endpoint**: `POST /partners/register`

```bash
curl -X POST http://localhost:8001/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "partner_name": "Grupo B - Tours Especializados",
    "webhook_url": "https://partner-grupo-b.com/webhooks/payment-events",
    "events": ["payment.success", "payment.failed", "reservation.created"]
  }'
```

**Response**:

```json
{
  "partner_id": "uuid-123",
  "partner_name": "Grupo B - Tours Especializados",
  "webhook_url": "https://partner-grupo-b.com/webhooks/payment-events",
  "shared_secret": "sk_test_partner_secret_abc123xyz",
  "status": "active"
}
```

### Paso 2: Guardar Credenciales de Partner

El grupo partner debe guardar:

- `partner_id`: Para identificarse
- `shared_secret`: Para verificar firmas de webhooks

### Paso 3: Implementar Validación en Partner

El grupo partner debe validar webhooks:

```python
import hmac
import hashlib
import json

def verify_webhook(payload, signature, shared_secret):
    """Verifica webhook firmado de nuestro grupo"""
    payload_str = json.dumps(payload, sort_keys=True)
    expected_signature = hmac.new(
        shared_secret.encode(),
        payload_str.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected_signature)

# En endpoint webhook del partner
@app.post("/webhooks/payment-events")
async def receive_webhook(request: Request):
    payload = await request.json()
    signature = request.headers.get("X-Webhook-Signature")

    if not verify_webhook(payload, signature, SHARED_SECRET):
        return {"error": "Invalid signature"}, 401

    # Procesar evento
    if payload["event"] == "payment.success":
        # Actualizar datos locales
        pass

    return {"status": "received"}
```

### Paso 4: Pruebas Bidireccionales

```bash
# 1. Nuestro grupo envía a partner
curl -X POST http://localhost:5678/webhook/test-partner-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": "uuid-123",
    "event_type": "payment.success"
  }'

# 2. Partner envía de vuelta
curl -X POST http://localhost:8001/webhooks/partners \
  -H "X-Webhook-Signature: signature-hash" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "tour.purchased",
    "timestamp": 1704186000,
    "tour_id": "uuid-456",
    "user_email": "cliente@example.com"
  }'
```

---

## Contrato de Eventos

### Eventos de Pago

#### payment.success

```json
{
  "event": "payment.success",
  "timestamp": 1704186000,
  "transaction_id": "txn_abc123",
  "amount": 100.0,
  "currency": "USD",
  "user_id": "uuid-user",
  "user_email": "user@example.com",
  "metadata": {
    "tour_id": "uuid-tour",
    "reservation_id": "uuid-reserva",
    "client_name": "John Doe"
  },
  "proof_url": "https://... (link al comprobante)"
}
```

#### payment.failed

```json
{
  "event": "payment.failed",
  "timestamp": 1704186000,
  "transaction_id": "txn_abc123",
  "reason": "insufficient_funds",
  "user_id": "uuid-user",
  "user_email": "user@example.com"
}
```

### Eventos de Reserva

#### booking.confirmed

```json
{
  "event": "booking.confirmed",
  "timestamp": 1704186000,
  "booking_id": "uuid-reserva",
  "tour_id": "uuid-tour",
  "user_id": "uuid-user",
  "start_date": "2024-02-15",
  "end_date": "2024-02-20",
  "total_price": 500.0
}
```

---

## Testing

### Test Local

```bash
# 1. Inicia n8n
docker-compose up n8n

# 2. Crea workflow de prueba
# Accede a http://localhost:5678
# Crea workflow con HTTP Trigger

# 3. Prueba con curl
curl -X POST http://localhost:5678/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# 4. Ver logs en n8n UI
```

### Test con Partner

```bash
# 1. Registrar partner en BD local
curl -X POST http://localhost:8001/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "partner_name": "Test Partner",
    "webhook_url": "https://webhook.site/unique-id",
    "events": ["payment.success"]
  }'

# 2. Simular pago
curl -X POST http://localhost:8001/payment/init \
  -H "Authorization: Bearer test-jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "description": "Test Tour"
  }'

# 3. Ver webhook en https://webhook.site
```

---

## Troubleshooting

### n8n no recibe webhooks

**Causa**: Firewall o configuración de túnel

```bash
# Verificar configuración
docker logs n8n | grep -i webhook

# Reiniciar n8n
docker restart n8n
```

### Webhooks no se envían a partner

**Causa**: URL inválida o partner caído

```bash
# Verificar en n8n logs
# Implementar retry automático en workflow
# Usar Webhook.site para testing: https://webhook.site
```

### Firma HMAC no coincide

**Verificar**:

1. Secret está correctamente guardado
2. Payload se serializa igual en ambos lados (sort_keys=true)
3. Hash algorithm es SHA256
4. Header name es "X-Webhook-Signature"

---

## Monitoreo

### Metricas a Trackear

- **Webhooks procesados**: Cantidad por tipo de evento
- **Tasa de éxito**: % de webhooks procesados exitosamente
- **Latencia**: Tiempo entre receipt y procesamiento
- **Errores**: Errores por causa

### Dashboard n8n

En `http://localhost:5678/workflow` puedes ver:

- Executions de cada workflow
- Duración de cada ejecución
- Logs detallados de errores
- Estadísticas de uso

---

## Referencias

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Webhooks](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base-webhook/)
- [Webhook Security Best Practices](https://owasp.org/www-community/attacks/Webhook)
- [n8n CLI](https://docs.n8n.io/reference/cli/)
