## 📋 Guía de Integración de Webhooks - Grupo Recomendaciones Turísticas

**Para:** Grupo Reservas ULEAM (Partner)  
**De:** Sistema de Recomendaciones Turísticas  
**Fecha:** 24 de Enero de 2025

---

## 1. Resumen de Integración

El grupo de Recomendaciones Turísticas enviará eventos de tours comprados a través de webhooks firmados con HMAC-SHA256. El grupo partner puede procesar estos eventos y enviar confirmaciones de reservas de hotel.

**Flujo B2B:**

```
1. Usuario compra tour en Recomendaciones → Genera evento tour.purchased
2. Se envía webhook a partner con firma HMAC
3. Partner recibe y confirma con ACK
4. Partner crea reserva de hotel relacionada
5. Partner envía webhook booking.confirmed al sistema de recomendaciones
6. Sistema de recomendaciones actualiza itinerario del turista
```

---

## 2. Credenciales Compartidas

```
Secret compartido: shared_secret_tourism_123
Algoritmo: HMAC-SHA256
Encoding: UTF-8
```

⚠️ **IMPORTANTE:** Este secret debe ser guardado en variable de entorno `PARTNER_SECRET` en su servidor.

---

## 3. Endpoint para Recibir Webhooks

```
URL: http://localhost:8000/webhooks/partner
     (En producción: https://abc123.ngrok.io/webhooks/partner)

Método: POST
Content-Type: application/json
```

### Headers Requeridos

```
X-Webhook-Signature: <firma_hmac_sha256>
X-Webhook-Source: tourism_recomendaciones
Content-Type: application/json
```

---

## 4. Eventos Enviados por Recomendaciones

### 4.1 Evento: `tour.purchased`

Se envía cuando un usuario compra un tour en el sistema de recomendaciones.

**Payload:**

```json
{
  "event_type": "tour.purchased",
  "timestamp": "2025-01-24T15:30:45",
  "source_service": "tourism_recomendaciones",
  "data": {
    "tour_id": "tour_456",
    "tour_name": "Tour Galápagos Premium",
    "user_id": "user_123",
    "user_email": "juan@example.com",
    "quantity": 2,
    "total_price": 1200.5,
    "reservation_id": "res_789",
    "travel_date": "2025-03-15",
    "user_name": "Juan Pérez",
    "source_system": "tourism_recomendaciones"
  }
}
```

**Campos:**

- `tour_id`: ID único del tour
- `tour_name`: Nombre del tour (ej: "Tour Galápagos Premium")
- `user_id`: ID del usuario que compró
- `user_email`: Email para contacto
- `quantity`: Número de personas
- `total_price`: Precio total en USD
- `reservation_id`: ID de la reserva en sistema de recomendaciones
- `travel_date`: Fecha del viaje (YYYY-MM-DD)
- `user_name`: Nombre completo del usuario

**Respuesta esperada (HTTP 200):**

```json
{
  "status": "received",
  "event_type": "tour.purchased",
  "source_service": "tourism_recomendaciones",
  "result": {
    "processed": true,
    "message": "Tour registrado para oferta de alojamiento"
  },
  "ack": true
}
```

---

### 4.2 Evento: `booking.updated`

Se envía cuando hay cambios en una reserva de tour (cancelación, actualización de fechas, etc.).

**Payload:**

```json
{
  "event_type": "booking.updated",
  "timestamp": "2025-01-24T16:15:30",
  "source_service": "tourism_recomendaciones",
  "data": {
    "booking_id": "res_789",
    "status": "cancelled",
    "tour_id": "tour_456",
    "reason": "Usuario solicitó cancelación"
  }
}
```

---

## 5. Cómo Validar la Firma HMAC

**Pseudocódigo (Python):**

```python
import hashlib
import hmac
import json

def validate_webhook(payload_str, signature, secret):
    """Valida que la firma es correcta"""
    expected = hmac.new(
        secret.encode(),
        payload_str.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected, signature)

# En tu endpoint:
@app.post("/webhooks/from-tourism")
async def receive_webhook(request: Request, x_webhook_signature: str):
    body = await request.body()
    payload_str = body.decode('utf-8')

    if not validate_webhook(payload_str, x_webhook_signature, "shared_secret_tourism_123"):
        return {"error": "Firma inválida"}, 401

    event = json.loads(payload_str)
    # Procesar evento...
    return {"status": "received", "ack": True}
```

---

## 6. Prueba de Integración (curl)

### 6.1 Simular webhook desde Recomendaciones

```bash
#!/bin/bash

PAYLOAD='{"event_type":"tour.purchased","timestamp":"2025-01-24T15:30:45","source_service":"tourism_recomendaciones","data":{"tour_id":"tour_456","tour_name":"Tour Galápagos","user_id":"user_123","user_email":"juan@example.com","quantity":2,"total_price":1200.50,"reservation_id":"res_789","travel_date":"2025-03-15"}}'

SECRET="shared_secret_tourism_123"

# Generar firma HMAC
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)

echo "Payload: $PAYLOAD"
echo "Signature: $SIGNATURE"

# Enviar webhook
curl -X POST http://localhost:8000/webhooks/partner \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -H "X-Webhook-Source: tourism_recomendaciones" \
  -d "$PAYLOAD"
```

### 6.2 PowerShell (Windows)

```powershell
$payload = @{
    event_type = "tour.purchased"
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    source_service = "tourism_recomendaciones"
    data = @{
        tour_id = "tour_456"
        tour_name = "Tour Galápagos"
        user_id = "user_123"
        user_email = "juan@example.com"
        quantity = 2
        total_price = 1200.50
        reservation_id = "res_789"
        travel_date = "2025-03-15"
    }
} | ConvertTo-Json

$secret = "shared_secret_tourism_123"

# Generar HMAC (requiere .NET)
$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.Key = [Text.Encoding]::UTF8.GetBytes($secret)
$signature = ($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($payload)) | ForEach-Object ToString X2) -join ''

Invoke-WebRequest -Uri "http://localhost:8000/webhooks/partner" `
  -Method POST `
  -Headers @{
    "Content-Type" = "application/json"
    "X-Webhook-Signature" = $signature
    "X-Webhook-Source" = "tourism_recomendaciones"
  } `
  -Body $payload
```

---

## 7. Endpoint para Enviar Eventos del Partner

Cuando el grupo de Recomendaciones necesite enviar un evento a ustedes:

```
Coordinar URL con anticipación
(Puede ser http://localhost:8001/webhooks/to-tourism o ngrok URL)
```

**El grupo de Recomendaciones enviará:**

- `tour.purchased`
- `booking.updated`

**El grupo partner puede responder con:**

- `booking.confirmed`
- `payment.success`
- Cualquier otro evento relevante

---

## 8. Checklist de Implementación

- [ ] Guardar `shared_secret_tourism_123` en variable de entorno
- [ ] Crear endpoint `POST /webhooks/to-tourism` (o similar)
- [ ] Implementar validación HMAC-SHA256
- [ ] Parsear payload JSON
- [ ] Procesar según event_type
- [ ] Retornar ACK en 200
- [ ] Crear logs de eventos recibidos
- [ ] Probar con curl (ver sección 6)
- [ ] Coordinar URL final (ngrok o estática)
- [ ] Hacer prueba bidireccional completa

---

## 9. Estructura Recomendada (Node.js/Express)

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const SECRET = process.env.TOURISM_SECRET || 'shared_secret_tourism_123';

function validateHMAC(payload, signature) {
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(expected, signature);
}

app.post('/webhooks/from-tourism', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const source = req.headers['x-webhook-source'];

  if (!signature) {
    return res.status(401).json({ error: 'Signature required' });
  }

  const payload = JSON.stringify(req.body);

  if (!validateHMAC(payload, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const eventType = req.body.event_type;
  console.log(`📥 Evento recibido: ${eventType} de ${source}`);

  // Procesar según tipo de evento
  if (eventType === 'tour.purchased') {
    const tourData = req.body.data;
    // Crear oferta de alojamiento, etc.
  }

  return res.json({
    status: 'received',
    event_type: eventType,
    ack: true,
  });
});

app.listen(8001, () => {
  console.log('Webhook listener en puerto 8001');
});
```

---

## 10. Estructura Recomendada (Python/FastAPI)

```python
from fastapi import FastAPI, Header, HTTPException, Request
import hmac
import hashlib
import json

app = FastAPI()

SECRET = "shared_secret_tourism_123"

def validate_hmac(payload_str: str, signature: str) -> bool:
    expected = hmac.new(
        SECRET.encode(),
        payload_str.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

@app.post("/webhooks/from-tourism")
async def receive_webhook(
    request: Request,
    x_webhook_signature: str = Header(None),
    x_webhook_source: str = Header(None)
):
    if not x_webhook_signature:
        raise HTTPException(status_code=401, detail="Signature required")

    body = await request.body()
    payload_str = body.decode('utf-8')

    if not validate_hmac(payload_str, x_webhook_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    event = json.loads(payload_str)
    event_type = event.get('event_type')

    print(f"📥 Evento: {event_type} de {x_webhook_source}")

    if event_type == "tour.purchased":
        data = event.get('data', {})
        # Procesar: crear oferta, actualizar catálogo, etc.

    return {
        "status": "received",
        "event_type": event_type,
        "ack": True
    }
```

---

## 11. Contacto para Coordinación

**Contacto del grupo Recomendaciones Turísticas:**

- Odalia Senge Loor (Líder) - odalia@uleam.edu.ec
- Nestor Ayala - nestor@uleam.edu.ec
- Abigail Plua - abigail@uleam.edu.ec

**Información a proporcionar por Partner:**

- [ ] URL del endpoint para recibir webhooks
- [ ] Secret compartido (o usar el sugerido)
- [ ] Eventos que ustedes enviarán
- [ ] Email de contacto técnico

---

## 12. Troubleshooting Común

| Problema                   | Solución                                           |
| -------------------------- | -------------------------------------------------- |
| 401 Firma inválida         | Verificar que el secret es idéntico en ambos lados |
| 400 Bad Request            | Verificar estructura JSON del payload              |
| 404 Endpoint no encontrado | Verificar URL correcta (http vs https, puerto)     |
| Timeout                    | Verificar firewall, proxy, conectividad            |
| Eventos no se procesan     | Verificar logs del servidor                        |

---

**Documento versión:** 1.0  
**Última actualización:** 24 de Enero de 2025
