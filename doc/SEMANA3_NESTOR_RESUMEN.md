## 📝 Resumen Ejecutivo - Semana 3: Webhooks Bidireccionales (Nestor)

**Fecha:** 24 de Enero de 2025  
**Responsable:** Nestor Ayala  
**Objetivo:** Implementar integración B2B con grupo Reservas ULEAM mediante webhooks firmados HMAC-SHA256

---

## ✅ Lo que se ha implementado

### 1. **Servicio de Webhooks** (`webhook_service.py`)

```python
✓ HMACValidator - Generación y validación de firmas HMAC-SHA256
✓ PartnerWebhookClient - Cliente para enviar webhooks al partner
✓ WebhookEventValidator - Procesador de eventos recibidos
```

**Características:**

- Firma HMAC-SHA256 de payloads JSON
- Validación segura contra timing attacks
- Soporte para múltiples tipos de eventos
- Manejo de excepciones y logging

---

### 2. **Rutas de Webhooks** (`webhook_routes.py`)

```
✓ POST /webhooks/partner             - Recibir webhooks del partner
✓ GET  /webhooks/test                 - Verificar servicio activo
✓ POST /webhooks/validate-hmac       - Debug de validación HMAC
```

**Autenticación:**

- Headers requeridos: `X-Webhook-Signature`, `X-Webhook-Source`
- Validación de firma antes de procesar
- ACK automático al partner

---

### 3. **Controlador de Reservas con Webhook** (`reserva_webhook_controller.py`)

```python
✓ crear_reserva_y_notificar_partner()
  - Crea reserva en BD
  - Envía evento 'tour.purchased' automáticamente
  - Retorna resultado de ambas operaciones
```

---

### 4. **Endpoint para Crear Reserva con Webhook**

```
✓ POST /reservas/webhook/tour-purchased
  - Integra creación de reserva + envío de webhook
  - Respuesta incluye ID de reserva y status del webhook
```

---

### 5. **Documentación Completa**

#### **Para desarrollo (tu documentación):**

- `SEMANA3_WEBHOOKS_GUIDE.md` - Guía completa con arquitectura, setup ngrok, testing

#### **Para compartir con partner:**

- `PARTNER_INTEGRATION_GUIDE.md` - Guía técnica de integración (códigos en Node/Python)

#### **Archivos de configuración:**

- `.env.example` - Variables de entorno necesarias

#### **Scripts de prueba:**

- `test_webhooks.py` - Pruebas Python (unittest-like)
- `test_webhooks.ps1` - Pruebas PowerShell (Windows)

---

## 🚀 Próximos Pasos (Orden de Ejecución)

### **PASO 1: Instalar ngrok (5 min)**

```powershell
# Windows - Descargar
Invoke-WebRequest -Uri https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip -OutFile ngrok.zip
Expand-Archive -Path ngrok.zip -DestinationPath C:\ngrok

# Agregar al PATH y validar
C:\ngrok\ngrok.exe version

# Crear cuenta en https://dashboard.ngrok.com
# Copiar token y configurar
C:\ngrok\ngrok.exe config add-authtoken <token>
```

---

### **PASO 2: Configurar variables de entorno (5 min)**

```bash
cd backend/rest-api

# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores
# Por ahora, dejar como está (localhost:8001)
```

---

### **PASO 3: Instalar httpx si no está (1 min)**

```bash
cd backend/rest-api
pip install httpx
```

---

### **PASO 4: Probar localmente SIN ngrok (10 min)**

#### Terminal 1: REST API

```bash
cd backend/rest-api
python main.py
# Esperar a que inicie correctamente
# ✅ Conectado a MongoDB - Base de datos: turismo_db
```

#### Terminal 2: Ejecutar tests

```bash
cd backend/rest-api

# Opción A: Tests Python
python test_webhooks.py

# Opción B: Tests PowerShell
.\test_webhooks.ps1 -TestType "all"
```

**Esperar salida similar a:**

```
✅ TEST 1 PASSED - HMAC-SHA256 Signature
✅ TEST 2 PASSED - Event Payload Construction
✅ TEST 3 PASSED - Webhook Event Validator
...
✅ TODOS LOS TESTS PASARON
```

---

### **PASO 5: Probar endpoint de crear reserva (5 min)**

#### PowerShell:

```powershell
$payload = @{
    usuario_id = "user_123"
    usuario_nombre = "Juan Pérez"
    usuario_email = "juan@example.com"
    tour_id = "tour_456"
    tour_nombre = "Tour Galápagos Premium"
    cantidad_personas = 2
    precio_total = 1200.50
    fecha = "2025-03-15"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/reservas/webhook/tour-purchased" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $payload | Select-Object -ExpandProperty Content
```

**Respuesta esperada:**

```json
{
  "success": true,
  "reserva": {
    "id": "...",
    "usuario_id": "user_123",
    "estado": "confirmada"
  },
  "webhook": {
    "sent": false,
    "status_code": null,
    "response": {}
  }
}
```

⚠️ `"sent": false` es normal porque PARTNER_WEBHOOK_URL=http://localhost:8001 (partner no está corriendo)

---

### **PASO 6: Activar ngrok (2 min)**

#### Terminal 3: ngrok

```bash
cd C:\ngrok  (o donde esté ngrok)
.\ngrok.exe http 8000

# Salida esperada:
# Forwarding                    https://abc123.ngrok.io -> http://localhost:8000
```

⚠️ **COPIAR LA URL**: `https://abc123.ngrok.io`

---

### **PASO 7: Coordinar con grupo partner (15 min)**

**Información a enviar al grupo partner:**

```
URL del webhook: https://abc123.ngrok.io/webhooks/partner
Secret compartido: shared_secret_tourism_123

Pasos de integración:
1. Crear endpoint POST /webhooks/from-tourism
2. Recibir header X-Webhook-Signature
3. Validar firma HMAC-SHA256
4. Procesar evento según type
5. Retornar ACK 200

Ver: PARTNER_INTEGRATION_GUIDE.md
```

**Información a recibir del partner:**

- [ ] URL de webhook del partner
- [ ] Secret compartido (validar que es igual)
- [ ] Tipos de eventos que enviarán
- [ ] Email de contacto técnico

---

### **PASO 8: Actualizar .env con URL del partner (2 min)**

```env
# .env
PARTNER_WEBHOOK_URL=https://abc123-partner.ngrok.io  # URL que te dio el partner
PARTNER_SECRET=shared_secret_tourism_123
MY_WEBHOOK_SECRET=shared_secret_tourism_123
```

---

### **PASO 9: Prueba bidireccional completa (10 min)**

#### Tú envías → Partner recibe:

```bash
curl -X POST https://abc123-partner.ngrok.io/webhooks/partner \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: <firma>" \
  -H "X-Webhook-Source: tourism_recomendaciones" \
  -d '{"event_type":"tour.purchased",...}'
```

**Verificar:** Partner recibe y retorna ACK 200

#### Partner envía → Tú recibes:

```bash
curl -X POST https://abc123.ngrok.io/webhooks/partner \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: <firma_partner>" \
  -H "X-Webhook-Source: reservas_system" \
  -d '{"event_type":"booking.confirmed",...}'
```

**Verificar:** Tu API recibe y retorna ACK 200

---

### **PASO 10: Documentar y hacer commit** (20 min)

```bash
cd ProyectoSWEB_RecomendacionesTuristicas

# Verificar qué cambios hay
git status

# Ver cambios
git diff backend/rest-api/

# Hacer commit (pero NO enviar - solo crear localmente)
git add backend/rest-api/app/services/webhook_service.py
git add backend/rest-api/app/routes/webhook_routes.py
git add backend/rest-api/app/controllers/reserva_webhook_controller.py
git add backend/rest-api/main.py
git add backend/rest-api/.env.example
git add backend/rest-api/test_webhooks.py
git add backend/rest-api/test_webhooks.ps1
git add SEMANA3_WEBHOOKS_GUIDE.md
git add PARTNER_INTEGRATION_GUIDE.md

git commit -m "feat(webhooks): implementar webhooks bidireccionales con HMAC-SHA256

- Crear servicio de webhooks con validación HMAC-SHA256
- Implementar rutas para recibir webhooks del partner
- Agregar endpoint POST /reservas/webhook/tour-purchased
- Documentar integración B2B con grupo partner
- Agregar tests Python y PowerShell
- Incluir guía de ngrok y coordinación"
```

---

## 📊 Checklist de Semana 3

### Implementación

- [x] Servicio de webhooks (HMAC + Cliente)
- [x] Rutas de webhooks (recepción)
- [x] Controlador de reserva con webhook
- [x] Endpoint /reservas/webhook/tour-purchased
- [x] Validación de eventos recibidos

### Documentación

- [x] SEMANA3_WEBHOOKS_GUIDE.md (tu documentación)
- [x] PARTNER_INTEGRATION_GUIDE.md (para partner)
- [x] .env.example (variables de entorno)
- [x] test_webhooks.py (pruebas Python)
- [x] test_webhooks.ps1 (pruebas PowerShell)

### Testing

- [ ] Pruebas locales (sin ngrok)
- [ ] Tests Python/PowerShell ejecutados
- [ ] Crear reserva y verificar respuesta
- [ ] Validar endpoint /webhooks/test
- [ ] Validar endpoint /webhooks/validate-hmac

### Coordinación

- [ ] Contactar grupo partner (email/Teams)
- [ ] Compartir PARTNER_INTEGRATION_GUIDE.md
- [ ] Compartir URL ngrok (cuando esté lista)
- [ ] Recibir información del partner
- [ ] Actualizar .env con datos del partner

### Integración Bidireccional

- [ ] Partner puede enviar webhooks a tu sistema
- [ ] Tú puedes enviar webhooks al partner
- [ ] Validación HMAC funciona en ambas direcciones
- [ ] ACKs se retornan correctamente

### Commit

- [ ] Todos los archivos agregados
- [ ] Commit con mensaje descriptivo
- [ ] **NO ENVIAR A REPO** (para evitar conflictos)

---

## 📞 Coordinación con Partner - Template de Email

```
Asunto: Integración de Webhooks - Sistema de Recomendaciones Turísticas

Hola equipo [Grupo Partner],

Les escribo para comenzar la integración bidireccional de webhooks para el Trabajo Autónomo.

Información de nuestro sistema:
- URL del webhook: https://abc123.ngrok.io/webhooks/partner
- Secret compartido: shared_secret_tourism_123
- Algoritmo: HMAC-SHA256
- Headers: X-Webhook-Signature, X-Webhook-Source

Eventos que enviaremos:
- tour.purchased (cuando se vende un tour)
- booking.updated (cambios en reservas)

Solicitamos:
- URL donde debemos enviar webhooks de ustedes
- Secret compartido (podemos usar el mismo o diferente)
- Eventos que enviarán a nuestro sistema

Documentación técnica adjunta: PARTNER_INTEGRATION_GUIDE.md

Para pruebas, podemos hacer videoconferencia en Semana 4.

Saludos,
Nestor Ayala
```

---

## 🐛 Troubleshooting Rápido

| Problema                       | Solución                                         |
| ------------------------------ | ------------------------------------------------ |
| `ModuleNotFoundError: httpx`   | `pip install httpx`                              |
| `Connection refused` (partner) | Verificar URL en .env, iniciar servicio partner  |
| `Firma HMAC inválida`          | Validar secret idéntico en ambos lados           |
| `ngrok URL cambia`             | Normal en plan gratuito, comunicar nueva URL     |
| `API no inicia`                | Verificar MongoDB en `mongodb://localhost:27017` |
| `timeout en webhook`           | Aumentar timeout en webhook_service.py           |

---

## 📚 Archivos Generados

```
backend/rest-api/
├── app/
│   ├── services/
│   │   └── webhook_service.py              ← NUEVO: Lógica de webhooks
│   ├── routes/
│   │   └── webhook_routes.py               ← NUEVO: Endpoints /webhooks
│   └── controllers/
│       └── reserva_webhook_controller.py   ← NUEVO: Crear reserva + webhook
├── main.py                                  ← MODIFICADO: Importar webhook_routes
├── .env.example                             ← MODIFICADO: Variables de webhook
├── test_webhooks.py                         ← NUEVO: Tests Python
└── test_webhooks.ps1                        ← NUEVO: Tests PowerShell

ProyectoSWEB_RecomendacionesTuristicas/
├── SEMANA3_WEBHOOKS_GUIDE.md               ← NUEVO: Guía completa (para ti)
└── PARTNER_INTEGRATION_GUIDE.md            ← NUEVO: Guía para partner
```

---

## ✨ Próximas Semanas

**Semana 4:**

- Webhooks bidireccionales operacionales
- Frontend mostrando confirmaciones
- n8n workflow para pagos

**Semana 5:**

- Pruebas de integración E2E
- Demo con grupo partner
- Documentación final

---

**Éxito! 🚀 Cualquier duda, revisa los archivos README o contacta a Odalia (Líder)**
