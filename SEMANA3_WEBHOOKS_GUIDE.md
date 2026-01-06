## Integración de Webhooks Bidireccionales - Semana 3 (Nestor)

### Objetivo

Implementar comunicación bidireccional con el grupo partner (grupo Reservas ULEAM) usando webhooks firmados con HMAC-SHA256 y ngrok para exponer servicios locales.

---

## 1. Setup Inicial - Variables de Entorno

Crear archivo `.env` en `backend/rest-api/`:

```env
# URLs de servicio
API_HOST=localhost
API_PORT=8000

# Configuración del grupo partner
PARTNER_WEBHOOK_URL=http://localhost:8001  # URL local del grupo partner (cambiar a ngrok después)
PARTNER_SECRET=shared_secret_tourism_123   # Secret compartido con el partner (coordinado)
MY_WEBHOOK_SECRET=shared_secret_tourism_123 # Secret para recibir webhooks del partner

# MongoDB
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=turismo_db
```

---

## 2. Instalar ngrok

ngrok permite exponer servidores locales a internet sin necesidad de hosting.

### Windows (PowerShell):

```powershell
# Descargar ngrok
Invoke-WebRequest -Uri https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip -OutFile ngrok.zip
Expand-Archive -Path ngrok.zip -DestinationPath ngrok

# Agregar al PATH
$env:Path += ";C:\ruta\a\ngrok"

# Validar instalación
ngrok version
```

### Linux / Mac:

```bash
# Descargar
curl -s https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz | tar xz
# O Mac:
curl -s https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-arm64.zip | tar xz

# Validar
./ngrok version
```

---

## 3. Arquitectura de Webhooks

```
┌─────────────────────────────────────────────────────────────────┐
│                    Grupo Recomendaciones Turísticas             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ REST API (localhost:8000)                               │   │
│  │ - POST /reservas              (crear reserva)           │   │
│  │ - POST /reservas/webhook/tour-purchased  (con webhook)  │   │
│  │ - POST /webhooks/partner      (recibir eventos)         │   │
│  │ - GET  /webhooks/test         (verificar servicio)      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↕                                       │
│              ┌────────────────────────────┐                     │
│              │ Webhook Service (Python)   │                     │
│              │ - HMAC Validation          │                     │
│              │ - Event Processing         │                     │
│              │ - Partner Client           │                     │
│              └────────────────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                        (ngrok tunnel)
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                 Grupo Reservas ULEAM (Partner)                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ REST API (localhost:8001)                               │   │
│  │ - POST /api/reservas              (enviar tours)        │   │
│  │ - POST /webhooks/partner          (recibir tours)       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Flujo Completode Webhook

### 4.1 Grupo Recomendaciones crea reserva → Envía webhook al Partner

**Paso 1: REST API recibe solicitud de crear reserva**

```bash
curl -X POST http://localhost:8000/reservas/webhook/tour-purchased \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": "user_123",
    "usuario_nombre": "Juan Pérez",
    "usuario_email": "juan@example.com",
    "tour_id": "tour_456",
    "tour_nombre": "Tour Galápagos Premium",
    "cantidad_personas": 2,
    "precio_total": 1200.50,
    "fecha": "2025-03-15"
  }'
```

**Paso 2: El servicio crea la reserva y genera webhook**

El payload se convierte a:

```json
{
  "event_type": "tour.purchased",
  "timestamp": "2025-01-24T15:30:00",
  "source_service": "tourism_recomendaciones",
  "data": {
    "tour_id": "tour_456",
    "tour_name": "Tour Galápagos Premium",
    "user_id": "user_123",
    "user_email": "juan@example.com",
    "quantity": 2,
    "total_price": 1200.5,
    "reservation_id": "res_789",
    "travel_date": "2025-03-15"
  }
}
```

**Paso 3: Se genera firma HMAC-SHA256**

```python
payload_str = json.dumps(payload)
signature = hmac.new(
    secret.encode(),  # shared_secret_tourism_123
    payload_str.encode(),
    hashlib.sha256
).hexdigest()
# signature = "a1b2c3d4e5f6..."
```

**Paso 4: Envía POST al webhook del partner con firma en header**

```
POST https://partner-ngrok-url/webhooks/partner
Headers:
  Content-Type: application/json
  X-Webhook-Signature: a1b2c3d4e5f6...
  X-Webhook-Source: tourism_recomendaciones

Body:
  {
    "event_type": "tour.purchased",
    ...
  }
```

**Paso 5: Partner recibe y valida**

- Valida que la firma coincida
- Procesa el evento
- Retorna ACK 200

---

### 4.2 Grupo Partner envía reserva confirmada → Se recibe en el webhook

**Paso 1: Partner envía webhook a nuestro servicio**

```
POST http://localhost:8000/webhooks/partner
  (en producción sería la URL ngrok)

Headers:
  X-Webhook-Signature: <firma_del_partner>
  X-Webhook-Source: reservas_system

Body:
{
  "event_type": "booking.confirmed",
  "timestamp": "2025-01-24T16:00:00",
  "source_service": "reservas_system",
  "data": {
    "booking_id": "book_123",
    "user_id": "user_123",
    "hotel_id": "hotel_789",
    "check_in": "2025-02-01",
    "check_out": "2025-02-05",
    "total_price": 500.00
  }
}
```

**Paso 2: Nuestro servicio valida y procesa**

- Valida firma HMAC
- Verifica que sea de un partner conocido
- Procesa según event_type
- Retorna ACK

---

## 5. Configuración de ngrok

### 5.1 Crear cuenta en ngrok (gratuito)

```
https://dashboard.ngrok.com/signup
```

### 5.2 Autenticar ngrok localmente

```powershell
# Copiar token de dashboard
ngrok config add-authtoken <token>
```

### 5.3 Exponer el servicio REST API

```powershell
# Crear túnel en puerto 8000
ngrok http 8000

# Salida:
# ngrok                                  (Ctrl+C to quit)
# Session Status                online
# Account                       tu_email@gmail.com
# Version                       3.0.0
# Region                        us (United States)
# Forwarding                    https://abc123.ngrok.io -> http://localhost:8000
# Connections                   ttl    opn    rt1    rt5    p50    p95
#                               0      0      0.00   0.00   0.00   0.00
```

⚠️ **LA URL NGROK CAMBIA CADA VEZ** - El plan gratuito regenera URL cada reinicio. Para testing, copiar la nueva URL y actualizar la configuración del partner.

### 5.4 Para uso permanente (plan pro)

```powershell
# Activar endpoint estático (requiere cuenta pago)
ngrok http 8000 --domain=your-custom-domain.ngrok-free.app
```

---

## 6. Coordinación con Grupo Partner

### 6.1 Información a compartir con Partner

Documento: **PARTNER_INTEGRATION_GUIDE.md**

```markdown
## Integración con Grupo Recomendaciones Turísticas

**URL de Webhook:** https://abc123.ngrok.io/webhooks/partner

**Secret compartido:** shared_secret_tourism_123

**Eventos que enviamos:**

- tour.purchased
- booking.updated

**Eventos que recibimos:**

- booking.confirmed
- payment.success

**Headers requeridos:**

- X-Webhook-Signature: <firma_hmac>
- X-Webhook-Source: tourism_recomendaciones
- Content-Type: application/json

**Ejemplo de Request:**
[Ver sección 4 arriba]
```

### 6.2 Información a recibir de Partner

```
URL de Webhook del Partner: http://localhost:8001/webhooks/partner
Secret compartido: shared_secret_tourism_123
Eventos que enviará:
- booking.confirmed
- payment.success
```

---

## 7. Testeo Local (Sin ngrok)

Ambos equipos en la misma red local:

### 7.1 Actualizar .env con IP local del Partner

```env
PARTNER_WEBHOOK_URL=http://192.168.1.100:8001
```

### 7.2 Probar desde tu máquina

```bash
# Terminal 1: tu REST API
cd backend/rest-api
python main.py

# Terminal 2: crear reserva
curl -X POST http://localhost:8000/reservas/webhook/tour-purchased \
  -H "Content-Type: application/json" \
  -d '{"usuario_id":"user_123",...}'
```

---

## 8. Testeo con Grupo Partner (ngrok)

### 8.1 Ejecutar ngrok

```powershell
ngrok http 8000
# Copiar URL: https://abc123.ngrok.io
```

### 8.2 Enviar URL al Partner

- Decirle que use: `https://abc123.ngrok.io/webhooks/partner`
- El partner actualiza su configuración

### 8.3 Crear reserva que envíe webhook

```bash
curl -X POST http://localhost:8000/reservas/webhook/tour-purchased \
  -H "Content-Type: application/json" \
  -d '{...}'

# Respuesta esperada:
{
  "success": true,
  "reserva": {"id": "...", "estado": "confirmada"},
  "webhook": {
    "sent": true,
    "status_code": 200,
    "response": {...}
  }
}
```

### 8.4 Verificar logs

```bash
# En terminal de ngrok verás:
POST /webhooks/partner HTTP/1.1
```

---

## 9. Endpoints de Prueba

### 9.1 Verificar que el servicio está activo

```bash
curl http://localhost:8000/webhooks/test

# Respuesta:
{
  "status": "ok",
  "service": "webhook_listener",
  "message": "Listo para recibir webhooks del grupo partner",
  "supported_events": ["booking.confirmed", "payment.success", "order.created"]
}
```

### 9.2 Validar firma HMAC (para debug)

```bash
curl -X POST http://localhost:8000/webhooks/validate-hmac \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {"event_type": "test"},
    "signature": "<tu_firma>",
    "secret": "shared_secret_tourism_123"
  }'
```

---

## 10. Troubleshooting

### Problema: "Connection refused" al enviar webhook

```
Solución:
- Verificar que el servicio REST del partner está corriendo
- Verificar URL en .env (si es local, usar localhost:8001)
- Si es remoto, usar ngrok URL correcta
```

### Problema: "Firma HMAC inválida"

```
Solución:
- Verificar que el secret es el mismo en ambos lados
- Verificar que el payload JSON está serializado igual en ambos lados
- Usar endpoint /webhooks/validate-hmac para debug
```

### Problema: ngrok URL cambia cada vez

```
Solución:
- En desarrollo, es normal
- Para pruebas: crear alias manual o usar plan pro
- Coordinar con partner: "nueva URL es https://xyz.ngrok.io"
```

### Problema: Timeout al enviar webhook (>10s)

```
Solución:
- Verificar conectividad con partner
- Verificar firewall/proxy bloqueando puertos
- Aumentar timeout en webhook_service.py si es necesario
```

---

## 11. Checklist para Semana 3

- [ ] Instalar ngrok
- [ ] Crear `.env` con configuración
- [ ] Probar endpoint POST /reservas/webhook/tour-purchased
- [ ] Probar endpoint POST /webhooks/partner (recepción)
- [ ] Coordinar con grupo partner (compartir URL ngrok)
- [ ] Hacer primera prueba bidireccional (tú envías → Partner recibe)
- [ ] Hacer segunda prueba (Partner envía → Tú recibes)
- [ ] Documentar URLs y secrets en archivo separado
- [ ] Crear commit con estos cambios

---

## 12. Archivos Creados/Modificados

```
backend/rest-api/
├── app/
│   ├── services/
│   │   └── webhook_service.py (NUEVO - HMACValidator, PartnerWebhookClient)
│   ├── routes/
│   │   └── webhook_routes.py (NUEVO - endpoints /webhooks/partner, /webhooks/test)
│   └── controllers/
│       └── reserva_webhook_controller.py (NUEVO - crear_reserva_y_notificar_partner)
├── main.py (MODIFICADO - agregar webhook_routes)
└── .env (NUEVO - configuración de partner)

DOCUMENTACIÓN/
└── SEMANA3_WEBHOOKS_GUIDE.md (ESTE ARCHIVO)
└── PARTNER_INTEGRATION_GUIDE.md (Para enviar al partner)
```

---

## Referencias

- https://en.wikipedia.org/wiki/Webhook
- https://ngrok.com/product/secure-tunnels
- https://developer.stripe.com/docs/webhooks/signatures
- https://datatracker.ietf.org/doc/html/rfc2104 (HMAC)
