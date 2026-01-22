# 🚀 Guía Rápida - n8n Event Bus

## Inicio Rápido

### 1. Iniciar n8n
```powershell
cd backend/n8n-workflows
.\start.ps1
```

### 2. Acceder a n8n
- **URL**: http://localhost:5678
- **Usuario**: admin
- **Password**: admin123

### 3. Importar Workflows

1. En n8n, ir a **Workflows** → **Import from File**
2. Importar estos archivos desde `workflows/`:
   - `payment_handler.json`
   - `partner_handler.json`
   - `mcp_input_handler.json`
   - `scheduled_tasks.json`
3. **Activar** cada workflow (toggle en la esquina superior derecha)

## 📋 Workflows Implementados

### 1. Payment Handler ✅
**Webhook**: `POST http://localhost:5678/webhook/payment`

```json
{
  "event_type": "payment.completed",
  "payment_id": "pay_123",
  "amount": 100.00,
  "currency": "USD",
  "metadata": {
    "tour_id": "tour_456",
    "user_email": "cliente@example.com",
    "user_id": "user_789"
  }
}
```

**Flujo**:
```
Webhook → Validar → Activar Reserva → WebSocket → Email → Partner
```

### 2. Partner Handler ✅
**Webhook**: `POST http://localhost:5678/webhook/partner`

**Headers requeridos**:
```
X-HMAC-Signature: sha256=<firma_calculada>
```

```json
{
  "event_type": "reservation.created",
  "partner_id": "partner_001",
  "data": {
    "reservation_id": "ext_res_789",
    "tour_id": "tour_456",
    "date": "2026-02-15",
    "guests": 2
  }
}
```

**Eventos soportados**:
- `reservation.created`
- `reservation.cancelled`
- `availability.query`

### 3. MCP Input Handler ✅
**Webhook**: `POST http://localhost:5678/webhook/mcp-input`

```json
{
  "channel": "telegram",
  "user_id": "12345678",
  "message": "Quiero reservar un tour a Galápagos",
  "attachments": []
}
```

**Canales soportados**:
- `telegram`
- `email`
- `webhook`

### 4. Scheduled Tasks ✅
**Cron Jobs automáticos**:

| Tarea | Horario | Descripción |
|-------|---------|-------------|
| Reporte Diario | 8:00 AM | Envía estadísticas de ventas |
| Limpieza | 00:00 | Elimina datos antiguos |
| Recordatorios | 9:00 AM | Notifica reservas próximas |
| Health Check | Cada 5 min | Verifica servicios |

## 🧪 Pruebas

### Probar Payment Handler
```powershell
$body = @{
    event_type = "payment.completed"
    payment_id = "pay_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
    amount = 150.00
    currency = "USD"
    metadata = @{
        tour_id = "690bc31f327a2cfd0f2e83de"
        user_email = "test@example.com"
        tour_nombre = "Tour Galápagos"
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:5678/webhook/payment" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Probar Partner Handler (con HMAC)
```powershell
# Calcular HMAC
$secret = "shared_secret_key_change_me"
$body = '{"event_type":"reservation.created","partner_id":"partner_001","data":{"reservation_id":"ext_123","tour_id":"tour_456","date":"2026-02-15","guests":2}}'

$hmacsha = New-Object System.Security.Cryptography.HMACSHA256
$hmacsha.key = [Text.Encoding]::UTF8.GetBytes($secret)
$signature = "sha256=" + [BitConverter]::ToString($hmacsha.ComputeHash([Text.Encoding]::UTF8.GetBytes($body))).Replace("-","").ToLower()

Invoke-RestMethod -Uri "http://localhost:5678/webhook/partner" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ "X-HMAC-Signature" = $signature } `
    -Body $body
```

### Probar MCP Input
```powershell
$body = @{
    channel = "webhook"
    user_id = "test_user_123"
    message = "Quiero información sobre tours a Galápagos"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mcp-input" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

## ⚙️ Configuración

### Variables de Entorno (en .env o configuradas por start.ps1)
```env
# URLs de servicios
REST_API_URL=http://localhost:8000
PAYMENT_SERVICE_URL=http://localhost:8002
WEBSOCKET_URL=http://localhost:8080
AI_ORCHESTRATOR_URL=http://localhost:8004

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# Partner
PARTNER_WEBHOOK_URL=https://partner.example.com/webhook
PARTNER_HMAC_SECRET=clave_secreta_compartida
```

### Configurar Credenciales en n8n

1. **Email (SMTP)**:
   - Settings → Credentials → Add Credential → SMTP
   - Host: smtp.gmail.com
   - Port: 587
   - User: tu-email@gmail.com
   - Password: App password de Gmail

2. **Telegram** (opcional):
   - Settings → Credentials → Add Credential → Telegram API
   - Token: Tu bot token de @BotFather

## 🔗 Integración con Payment Service

Modificar `payment-service` para enviar webhook a n8n después de cada pago:

```python
# En payment_adapters.py o routes.py
import httpx

async def notify_n8n_payment(payment_data):
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                "http://localhost:5678/webhook/payment",
                json={
                    "event_type": "payment.completed",
                    "payment_id": payment_data["external_id"],
                    "amount": payment_data["amount"],
                    "currency": payment_data["currency"],
                    "metadata": payment_data.get("metadata", {})
                },
                timeout=10.0
            )
    except Exception as e:
        print(f"Error notificando a n8n: {e}")
```

## 📊 Monitoreo

- **Execution History**: Ver todas las ejecuciones en n8n UI
- **Logs**: Ver la consola donde se ejecuta `start.ps1`
- **Health**: Los health checks cada 5 min alertan por email si hay problemas

## ✅ Checklist Pilar 4

- [x] Payment Handler (webhook → validar → activar → WebSocket → email → partner)
- [x] Partner Handler (webhook → HMAC → procesar → ACK)
- [x] MCP Input Handler (mensaje → AI Orchestrator → responder)
- [x] Scheduled Tasks (reportes, limpieza, recordatorios, health checks)
- [x] Configuración Local (npx) lista
- [x] Workflows JSON exportables
- [x] Documentación completa
