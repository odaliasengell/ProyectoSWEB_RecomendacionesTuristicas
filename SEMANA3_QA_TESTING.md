## 🧪 QA Testing Checklist - Semana 3 Webhooks (Nestor)

**Objetivo:** Validar que la implementación de webhooks es robusta y lista para integración con el grupo partner.

---

## ✅ Pruebas Unitarias (Local, sin ngrok)

### Test 1: Validación HMAC-SHA256

- [ ] Script `test_webhooks.py` ejecuta sin errores
- [ ] Firma generada es determinista (mismo resultado cada vez)
- [ ] Firma rechaza payload modificado (tampering detection)
- [ ] Firma rechaza secret diferente

**Comando:**

```bash
python test_webhooks.py
# O específicamente:
python test_webhooks.py | grep "TEST 1"
```

---

### Test 2: Endpoints Disponibles

- [ ] `GET /webhooks/test` retorna 200
- [ ] Respuesta incluye status, service, supported_events
- [ ] Endpoint `/webhooks/test` es públicamente accesible

**Comando:**

```bash
curl http://localhost:8000/webhooks/test
```

**Respuesta esperada:**

```json
{
  "status": "ok",
  "service": "webhook_listener",
  "message": "Listo para recibir webhooks del grupo partner",
  "supported_events": ["booking.confirmed", "payment.success", "order.created"]
}
```

---

### Test 3: Validación HMAC Endpoint

- [ ] `POST /webhooks/validate-hmac` funciona
- [ ] Acepta payload, signature y secret
- [ ] Retorna `{"is_valid": true}` con firma correcta
- [ ] Retorna `{"is_valid": false}` con firma incorrecta

**Comando:**

```bash
# Generar payload y firma primero
$payload = @{test = $true} | ConvertTo-Json
$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.Key = [Text.Encoding]::UTF8.GetBytes("shared_secret_tourism_123")
$sig = ($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($payload)) | % ToString X2) -join ''

# Enviar
Invoke-WebRequest -Uri "http://localhost:8000/webhooks/validate-hmac" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body (@{payload = @{test = $true}; signature = $sig; secret = "shared_secret_tourism_123"} | ConvertTo-Json)
```

---

### Test 4: Crear Reserva con Webhook (Local)

- [ ] `POST /reservas/webhook/tour-purchased` retorna 200
- [ ] Respuesta incluye estructura `{success, reserva, webhook}`
- [ ] Campo `reserva.id` no está vacío
- [ ] Campo `webhook.sent` es `false` (porque partner no está corriendo localmente)

**Comando:**

```bash
$payload = @{
    usuario_id = "user_test_123"
    usuario_nombre = "Test User"
    usuario_email = "test@example.com"
    tour_id = "tour_test_456"
    tour_nombre = "Test Tour"
    cantidad_personas = 1
    precio_total = 100.00
    fecha = "2025-03-15"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/reservas/webhook/tour-purchased" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $payload | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

**Respuesta esperada:**

```json
{
  "success": true,
  "reserva": {
    "id": "507f1f77bcf86cd799439011",
    "usuario_id": "user_test_123",
    "tour_id": "tour_test_456",
    "estado": "confirmada"
  },
  "webhook": {
    "sent": false,
    "status_code": null,
    "response": {}
  }
}
```

---

### Test 5: Recibir Webhook del Partner

- [ ] `POST /webhooks/partner` sin firma retorna 401
- [ ] `POST /webhooks/partner` con firma incorrecta retorna 401
- [ ] `POST /webhooks/partner` con firma correcta retorna 200
- [ ] Respuesta incluye `{"status": "received", "ack": true}`

**Comando (Firma válida):**

```bash
$payload = @{
    event_type = "booking.confirmed"
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    source_service = "reservas_system"
    data = @{
        booking_id = "book_123"
        user_id = "user_123"
    }
} | ConvertTo-Json

$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.Key = [Text.Encoding]::UTF8.GetBytes("shared_secret_tourism_123")
$sig = ($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($payload)) | % ToString X2) -join ''

Invoke-WebRequest -Uri "http://localhost:8000/webhooks/partner" `
  -Method POST `
  -Headers @{
    "Content-Type" = "application/json"
    "X-Webhook-Signature" = $sig
    "X-Webhook-Source" = "reservas_system"
  } `
  -Body $payload | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

**Respuesta esperada:**

```json
{
  "status": "received",
  "event_type": "booking.confirmed",
  "source_service": "reservas_system",
  "result": {
    "processed": true,
    "booking_id": "book_123",
    "message": "Reserva de hotel confirmada. Se puede enviar paquete turístico relacionado."
  },
  "ack": true
}
```

---

## 🔌 Pruebas de Integración (Con Partner)

### Test 6: ngrok Funcionando

- [ ] ngrok está corriendo: `ngrok http 8000`
- [ ] URL ngrok visible en terminal
- [ ] URL ngrok es accesible desde browser
- [ ] Endpoint `/webhooks/test` responde vía ngrok URL

**Comando:**

```bash
curl https://abc123.ngrok.io/webhooks/test
```

---

### Test 7: Partner Puede Recibir Webhook

- [ ] Compartiste URL ngrok con partner
- [ ] Partner confirma que recibe webhook
- [ ] Partner confirma que valida firma HMAC
- [ ] Partner retorna ACK 200/202

**Pasos:**

1. Ejecutar: `POST /reservas/webhook/tour-purchased`
2. Verificar en logs del partner que recibió
3. Validar que firma fue correcta
4. Validar que ACK fue retornado

---

### Test 8: Tú Puedes Recibir Webhook del Partner

- [ ] Partner tiene tu URL ngrok
- [ ] Partner envía webhook a `https://abc123.ngrok.io/webhooks/partner`
- [ ] Tu API recibe y valida firma
- [ ] Tu API retorna ACK 200

**Verificación:**

1. Ver en logs de tu API
2. Buscar línea: `📥 Evento recibido: booking.confirmed`
3. Búscar línea: `✅ Respuesta del partner: 200`

---

## 🔒 Pruebas de Seguridad

### Test 9: Validación de Firma

- [ ] Payload modificado es rechazado
- [ ] Secret incorrecto es rechazado
- [ ] Firma vacía es rechazada
- [ ] Comparación de firma es resistant a timing attacks

**Código de prueba:**

```python
from app.services.webhook_service import HMACValidator

# Payload original
payload = '{"test": true}'
secret = "shared_secret_tourism_123"

# Firma correcta
sig = HMACValidator.generate_signature(payload, secret)
assert HMACValidator.verify_signature(payload, sig, secret) == True

# Payload modificado
modified = '{"test": false}'
assert HMACValidator.verify_signature(modified, sig, secret) == False

# Secret diferente
assert HMACValidator.verify_signature(payload, sig, "wrong_secret") == False

print("✅ All security tests passed")
```

---

### Test 10: Inyección de Eventos

- [ ] Solo eventos conocidos se procesan
- [ ] Eventos desconocidos no causan error (graceful degradation)
- [ ] Payloads malformados son rechazados
- [ ] Campos faltantes son manejados

**Comando:**

```bash
# Evento desconocido (pero válido)
$payload = @{
    event_type = "unknown.event"
    data = @{}
} | ConvertTo-Json

$sig = ... # generar firma

Invoke-WebRequest -Uri "http://localhost:8000/webhooks/partner" `
  -Method POST `
  -Headers @{
    "X-Webhook-Signature" = $sig
    "X-Webhook-Source" = "test"
  } `
  -Body $payload

# Debe retornar 200 con {"processed": false}
```

---

## 📊 Pruebas de Performance

### Test 11: Timeout y Latencia

- [ ] Webhook se envía en < 5 segundos
- [ ] Recibir webhook toma < 1 segundo
- [ ] No hay deadlocks con servicios externos

**Monitoreo:**

- Revisar logs de tiempo en `webhook_service.py`
- Buscar líneas como `📤 Enviando webhook`
- Medir diferencia con `✅ Respuesta del partner`

---

### Test 12: Manejo de Errores

- [ ] Partner está offline: error es logeado, no detiene API
- [ ] Payload incorrecto: retorna 400, no 500
- [ ] Firma inválida: retorna 401, no 500
- [ ] Base de datos offline: crear reserva retorna error claro

**Verificar en logs:**

```
✅ INFO level = eventos exitosos
⚠️ WARNING level = eventos rechazados (firma inválida)
❌ ERROR level = excepciones (errores reales)
```

---

## 🧩 Pruebas de Integración E2E

### Test 13: Flujo Completo

1. [ ] Usuario crea reserva en frontend (Abigail)
2. [ ] REST API crea reserva en MongoDB
3. [ ] Automáticamente envía webhook al partner (con firma)
4. [ ] Partner recibe y valida firma
5. [ ] Partner retorna ACK 200
6. [ ] Frontend muestra confirmación de envío

**Pasos manuales:**

```bash
# 1. Crear reserva
POST /reservas/webhook/tour-purchased

# 2. Verificar en logs:
#    ✅ Reserva creada: {id}
#    📤 Enviando webhook tour.purchased a http://...
#    ✅ Respuesta del partner: 200

# 3. Verificar en partner:
#    📥 Evento recibido: tour.purchased desde tourism_recomendaciones
#    ✅ Webhook procesado
```

---

## 📋 Checklist Final

### Funcionalidad

- [ ] Todos los 13 tests pasan
- [ ] No hay excepciones sin manejo
- [ ] Logs están limpios y informativos
- [ ] Documentación es precisa

### Documentación

- [ ] README tiene instrucciones claras
- [ ] PARTNER_INTEGRATION_GUIDE.md está completo
- [ ] Ejemplos de curl/PowerShell funcionan
- [ ] Variables de entorno documentadas

### Código

- [ ] No hay warnings al compilar/importar
- [ ] Código sigue estándares del proyecto
- [ ] Imports están organizados
- [ ] Funciones tienen docstrings

### Deployment

- [ ] ngrok está instalado y funciona
- [ ] .env está configurado correctamente
- [ ] Scripts de test ejecutan sin errores
- [ ] API inicia sin problemas

---

## 📊 Tabla de Resultados

```
TEST                              PASS  FAIL  NOTES
────────────────────────────────────────────────────────
Test 1: HMAC Validation           [  ]  [ ]
Test 2: Endpoints Available       [  ]  [ ]
Test 3: HMAC Endpoint             [  ]  [ ]
Test 4: Create Reservation        [  ]  [ ]
Test 5: Receive Webhook           [  ]  [ ]
Test 6: ngrok Running             [  ]  [ ]
Test 7: Partner Can Receive       [  ]  [ ]
Test 8: You Can Receive           [  ]  [ ]
Test 9: Signature Validation      [  ]  [ ]
Test 10: Event Injection          [  ]  [ ]
Test 11: Performance              [  ]  [ ]
Test 12: Error Handling           [  ]  [ ]
Test 13: E2E Flow                 [  ]  [ ]
────────────────────────────────────────────────────────
TOTAL:                            [  ]  [ ]
```

---

## 🐛 Debugging Tips

```bash
# Ver logs de la API
# En la terminal donde corre: python main.py

# Buscar errores
grep "ERROR\|❌" <logs>

# Buscar webhooks enviados
grep "📤 Enviando webhook" <logs>

# Validar firma manualmente
python -c "
import hmac, hashlib
payload = '...'
secret = 'shared_secret_tourism_123'
sig = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
print(sig)
"

# Monitorear ngrok
# Ir a http://localhost:4040 (dashboard de ngrok)
```

---

**Fecha de complección esperada:** Fin de Semana 3  
**Responsable:** Nestor Ayala  
**Revisó:** Odalia Senge Loor (Líder)
