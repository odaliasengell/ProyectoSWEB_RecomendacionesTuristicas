# Ejemplos de Uso - Payment Service

## 🔐 Autenticación

Todos los ejemplos asumen que tienes un token JWT del Auth Service.

### Obtener Token de Acceso

```bash
# 1. Login en Auth Service
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "odalis@gmail.com",
    "password": "tupassword"
  }'
```

Respuesta:
```json
{
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG...",
  "token_type": "Bearer"
}
```

**Guardar el `access_token` para usar en los siguientes ejemplos.**

---

## 💳 Ejemplos de Pagos

### 1. Crear Pago con Mock Adapter

```bash
curl -X POST http://localhost:8002/payments/ \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.00,
    "currency": "USD",
    "provider": "mock",
    "description": "Reserva Tour Galápagos - 3 días",
    "order_id": "booking_galapagos_001",
    "metadata": {
      "tour_id": "tour_galapagos_001",
      "tour_name": "Galápagos Adventure",
      "passengers": 2,
      "user_email": "odalis@gmail.com",
      "booking_date": "2024-02-15"
    }
  }'
```

Respuesta:
```json
{
  "id": "67918ab...",
  "amount": 150.0,
  "currency": "USD",
  "status": "completed",
  "provider": "mock",
  "external_id": "mock_a1b2c3d4e5f6g7h8",
  "user_id": "67917...",
  "order_id": "booking_galapagos_001",
  "description": "Reserva Tour Galápagos - 3 días",
  "metadata": {
    "tour_id": "tour_galapagos_001",
    "tour_name": "Galápagos Adventure",
    "passengers": 2,
    "user_email": "odalis@gmail.com",
    "booking_date": "2024-02-15"
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 2. Listar Mis Pagos

```bash
curl -X GET http://localhost:8002/payments/ \
  -H "Authorization: Bearer eyJhbG..."
```

### 3. Obtener Pago Específico

```bash
curl -X GET http://localhost:8002/payments/67918ab... \
  -H "Authorization: Bearer eyJhbG..."
```

### 4. Reembolsar Pago (requiere rol admin)

```bash
curl -X POST http://localhost:8002/payments/67918ab.../refund \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.00,
    "reason": "Cancelación por parte del cliente"
  }'
```

---

## 🤝 Ejemplos de Partners

### 1. Registrar Partner (Público - No requiere auth)

```bash
curl -X POST http://localhost:8002/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hotel Quito Paradise",
    "webhook_url": "https://hotel-quito.com/api/webhooks/tourism",
    "subscribed_events": [
      "booking.confirmed",
      "payment.success",
      "tour.purchased"
    ],
    "contact_email": "dev@hotel-quito.com",
    "description": "Hotel 5 estrellas en Quito con paquetes turísticos integrados"
  }'
```

Respuesta:
```json
{
  "id": "67918cd...",
  "name": "Hotel Quito Paradise",
  "webhook_url": "https://hotel-quito.com/api/webhooks/tourism",
  "secret": "whs_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6",
  "subscribed_events": [
    "booking.confirmed",
    "payment.success",
    "tour.purchased"
  ],
  "is_active": true,
  "contact_email": "dev@hotel-quito.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**⚠️ IMPORTANTE: Guardar el `secret` - se usará para firmar webhooks**

### 2. Listar Todos los Partners (requiere admin)

```bash
curl -X GET http://localhost:8002/partners/ \
  -H "Authorization: Bearer eyJhbG..."
```

### 3. Actualizar Partner (requiere admin)

```bash
curl -X PUT http://localhost:8002/partners/67918cd... \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "subscribed_events": [
      "booking.confirmed",
      "payment.success",
      "payment.refunded",
      "tour.purchased",
      "tour.cancelled"
    ]
  }'
```

### 4. Desactivar Partner (requiere admin)

```bash
curl -X DELETE http://localhost:8002/partners/67918cd... \
  -H "Authorization: Bearer eyJhbG..."
```

---

## 📡 Ejemplos de Webhooks

### 1. Enviar Webhook a Partners Suscritos (requiere admin)

**Escenario**: Se confirmó una reserva y queremos notificar a todos los partners

```bash
curl -X POST http://localhost:8002/webhooks/send \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "event": "booking.confirmed",
    "data": {
      "booking_id": "booking_galapagos_001",
      "tour_id": "tour_galapagos_001",
      "tour_name": "Galápagos Adventure - 3 días",
      "user_id": "67917...",
      "user_email": "odalis@gmail.com",
      "passengers": 2,
      "total_amount": 150.00,
      "currency": "USD",
      "booking_date": "2024-02-15",
      "status": "confirmed",
      "payment_status": "completed"
    }
  }'
```

Respuesta:
```json
{
  "message": "Webhook enviado a 3/3 partners",
  "success": true,
  "data": {
    "total_sent": 3,
    "successful": 3,
    "failed": 0
  }
}
```

### 2. Enviar Webhook a Partner Específico

```bash
curl -X POST http://localhost:8002/webhooks/send \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "event": "tour.purchased",
    "data": {
      "tour_id": "tour_galapagos_001",
      "purchase_id": "purchase_123",
      "user_id": "67917...",
      "amount": 150.00
    },
    "partner_ids": ["67918cd..."]
  }'
```

### 3. Ver Logs de Webhooks (requiere admin)

```bash
# Todos los logs
curl -X GET "http://localhost:8002/webhooks/logs?limit=50" \
  -H "Authorization: Bearer eyJhbG..."

# Solo webhooks salientes
curl -X GET "http://localhost:8002/webhooks/logs?direction=outgoing" \
  -H "Authorization: Bearer eyJhbG..."

# Solo webhooks exitosos
curl -X GET "http://localhost:8002/webhooks/logs?success=true" \
  -H "Authorization: Bearer eyJhbG..."

# Combinar filtros
curl -X GET "http://localhost:8002/webhooks/logs?direction=incoming&success=false" \
  -H "Authorization: Bearer eyJhbG..."
```

---

## 🔐 Ejemplo de Webhook Entrante (Partner → Payment Service)

**Escenario**: Un partner (Hotel) confirma un servicio y nos notifica

### Paso 1: Partner calcula firma HMAC

```python
import hmac
import hashlib
import json
import httpx

# Secret compartido (obtenido al registrarse)
SECRET = "whs_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6"

# Payload del webhook
payload = {
    "event": "service.activated",
    "timestamp": "2024-01-15T11:00:00Z",
    "data": {
        "service_id": "hotel_room_deluxe_201",
        "service_type": "accommodation",
        "booking_id": "booking_galapagos_001",
        "user_id": "67917...",
        "status": "confirmed",
        "check_in": "2024-02-15",
        "check_out": "2024-02-18",
        "room_number": "201",
        "guest_name": "Odalis García"
    }
}

# Calcular firma HMAC-SHA256
payload_str = json.dumps(payload, sort_keys=True, separators=(',', ':'))
signature = hmac.new(
    SECRET.encode('utf-8'),
    payload_str.encode('utf-8'),
    hashlib.sha256
).hexdigest()

print(f"Firma HMAC: {signature}")
```

### Paso 2: Partner envía webhook

```bash
curl -X POST http://localhost:8002/webhooks/incoming/HotelQuitoParadise \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: <firma_calculada>" \
  -H "X-Webhook-Signature-Algorithm: sha256" \
  -H "X-Service-Name: HotelQuitoParadise" \
  -d '{
    "event": "service.activated",
    "timestamp": "2024-01-15T11:00:00Z",
    "data": {
      "service_id": "hotel_room_deluxe_201",
      "service_type": "accommodation",
      "booking_id": "booking_galapagos_001",
      "user_id": "67917...",
      "status": "confirmed",
      "check_in": "2024-02-15",
      "check_out": "2024-02-18",
      "room_number": "201",
      "guest_name": "Odalis García"
    }
  }'
```

Respuesta exitosa:
```json
{
  "message": "Webhook recibido y procesado correctamente",
  "success": true,
  "data": {
    "event": "service.activated",
    "partner": "HotelQuitoParadise"
  }
}
```

Respuesta con firma inválida:
```json
{
  "detail": "Firma HMAC inválida: Firma HMAC inválida"
}
```

---

## 🧪 Ejemplo Completo: Flujo de Reserva

### 1. Usuario hace una reserva y paga

```bash
# Usuario autenticado crea un pago
curl -X POST http://localhost:8002/payments/ \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 450.00,
    "currency": "USD",
    "provider": "mock",
    "description": "Paquete Completo Quito-Galápagos",
    "order_id": "booking_quito_galapagos_001",
    "metadata": {
      "package": "Complete Adventure",
      "includes": ["flights", "hotel", "tours", "meals"],
      "passengers": 2,
      "duration_days": 5
    }
  }'
```

### 2. Payment Service notifica a partners (automático)

Cuando el pago se completa, el servicio envía automáticamente `payment.success` a todos los partners suscritos.

### 3. Admin envía confirmación de reserva

```bash
curl -X POST http://localhost:8002/webhooks/send \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "event": "booking.confirmed",
    "data": {
      "booking_id": "booking_quito_galapagos_001",
      "user_email": "odalis@gmail.com",
      "package": "Complete Adventure",
      "total_paid": 450.00,
      "start_date": "2024-02-15",
      "end_date": "2024-02-20"
    }
  }'
```

### 4. Hotel confirma habitación (webhook entrante)

```bash
curl -X POST http://localhost:8002/webhooks/incoming/HotelQuitoParadise \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: <firma_hmac>" \
  -H "X-Webhook-Signature-Algorithm: sha256" \
  -d '{
    "event": "service.activated",
    "data": {
      "service_id": "hotel_suite_305",
      "booking_id": "booking_quito_galapagos_001",
      "confirmation_number": "HTL-20240215-305",
      "status": "confirmed"
    }
  }'
```

### 5. Verificar logs de webhooks

```bash
curl -X GET "http://localhost:8002/webhooks/logs?limit=10" \
  -H "Authorization: Bearer eyJhbG..."
```

---

## 🌐 Testing con webhook.site

Si no tienes un servidor webhook real, puedes usar https://webhook.site para testing:

1. Ve a https://webhook.site
2. Copia tu URL única (ej: `https://webhook.site/abc123...`)
3. Regístrala como partner:

```bash
curl -X POST http://localhost:8002/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestPartner",
    "webhook_url": "https://webhook.site/abc123...",
    "subscribed_events": ["payment.success", "booking.confirmed"],
    "contact_email": "test@test.com"
  }'
```

4. Envía un webhook de prueba:

```bash
curl -X POST http://localhost:8002/webhooks/send \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.success",
    "data": {
      "test": "Esto es una prueba",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }'
```

5. Verifica en webhook.site que recibiste el webhook con la firma HMAC

---

## 📊 Health Check

```bash
curl http://localhost:8002/health
```

Respuesta:
```json
{
  "status": "healthy",
  "service": "payment-service",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔑 Notas Importantes

1. **Tokens JWT**: Expiran en 15 minutos. Usa `/auth/refresh` si expira.
2. **HMAC Secrets**: Son sensibles. Nunca exponerlos en logs o repositorios públicos.
3. **Mock Adapter**: Todos los pagos son exitosos automáticamente.
4. **Roles**: Solo `admin` puede reembolsar pagos, ver todos los partners, y ver logs.
5. **Webhooks**: Se envían con timeout de 10 segundos y 3 reintentos automáticos.
