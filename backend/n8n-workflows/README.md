# 🔄 n8n Event Bus - Pilar 4

## Descripción
n8n actúa como **Event Bus central** del sistema, orquestando todos los eventos externos según el principio:

> **"Todo evento externo pasa por n8n"**

## 🚀 Instalación de n8n

### Ejecución Local (Recomendado)
Este proyecto está configurado para ejecutarse localmente sin contenedores.

Ejecutar usando el script (Windows):
```powershell
./start.ps1
```

O manualmente con `npx`:
```bash
npx n8n start
```

O instalando globalmente:
```bash
npm install -g n8n
n8n start
```

## 📍 Acceso
- **URL**: http://localhost:5678
- **Usuario inicial**: Se configura en el primer acceso

## 🔌 Workflows Implementados

### 1. Payment Handler (`payment_handler.json`)
**Trigger**: Webhook `POST /webhook/payment`

**Flujo**:
```
Webhook → Validar Payload → Activar Servicio/Reserva → 
→ Notificar WebSocket → Enviar Email → Webhook Partner
```

**Eventos soportados**:
- `payment.completed` - Pago exitoso
- `payment.failed` - Pago fallido
- `payment.refunded` - Reembolso

### 2. Partner Handler (`partner_handler.json`)
**Trigger**: Webhook `POST /webhook/partner`

**Flujo**:
```
Webhook → Verificar HMAC → Procesar Evento → 
→ Ejecutar Acción → Responder ACK
```

**Eventos soportados**:
- `reservation.created` - Nueva reserva de partner
- `reservation.cancelled` - Cancelación de partner
- `availability.query` - Consulta de disponibilidad

### 3. MCP Input Handler (`mcp_input_handler.json`)
**Trigger**: Webhook `POST /webhook/mcp-input`

**Flujo**:
```
Mensaje (Telegram/Email) → Extraer Contenido → 
→ Enviar a AI Orchestrator → Responder por mismo canal
```

### 4. Scheduled Tasks (`scheduled_tasks.json`)
**Triggers**: Cron Jobs

**Tareas**:
- `0 8 * * *` - Reporte diario de ventas (8:00 AM)
- `0 0 * * *` - Limpieza de datos antiguos (Medianoche)
- `0 9 * * *` - Recordatorios de reservas (9:00 AM)
- `*/5 * * * *` - Health check de servicios (cada 5 min)

## 🔧 Configuración

### Variables de Entorno
Crear archivo `.env` en la carpeta n8n o configurar en la UI:

```env
# URLs de servicios internos
REST_API_URL=http://localhost:8000
PAYMENT_SERVICE_URL=http://localhost:8002
WEBSOCKET_URL=http://localhost:8080
AI_ORCHESTRATOR_URL=http://localhost:8004

# Configuración de email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# Partner webhook
PARTNER_WEBHOOK_URL=https://partner-group.com/webhook
PARTNER_HMAC_SECRET=shared_secret_with_partner

# Telegram (opcional)
TELEGRAM_BOT_TOKEN=your-bot-token
```

## 📥 Importar Workflows

1. Abrir n8n: http://localhost:5678
2. Ir a **Workflows** → **Import from File**
3. Seleccionar los archivos JSON de esta carpeta:
   - `payment_handler.json`
   - `partner_handler.json`
   - `mcp_input_handler.json`
   - `scheduled_tasks.json`
4. Configurar credenciales necesarias
5. Activar cada workflow

## 🔗 Endpoints de Webhook (n8n)

Una vez importados y activados, n8n expone estos endpoints:

| Workflow | Endpoint | Método |
|----------|----------|--------|
| Payment Handler | `http://localhost:5678/webhook/payment` | POST |
| Partner Handler | `http://localhost:5678/webhook/partner` | POST |
| MCP Input | `http://localhost:5678/webhook/mcp-input` | POST |

## 🧪 Pruebas

### Probar Payment Handler
```bash
curl -X POST http://localhost:5678/webhook/payment \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "payment.completed",
    "payment_id": "pay_123",
    "amount": 100.00,
    "currency": "USD",
    "metadata": {
      "tour_id": "tour_456",
      "user_email": "cliente@example.com"
    }
  }'
```

### Probar Partner Handler
```bash
curl -X POST http://localhost:5678/webhook/partner \
  -H "Content-Type: application/json" \
  -H "X-HMAC-Signature: sha256=..." \
  -d '{
    "event_type": "reservation.created",
    "partner_id": "partner_001",
    "data": {
      "reservation_id": "ext_res_789",
      "tour_id": "tour_456",
      "date": "2026-02-15"
    }
  }'
```

## 📊 Monitoreo

n8n proporciona:
- **Execution History**: Ver historial de ejecuciones
- **Error Logs**: Errores detallados por workflow
- **Metrics**: Tiempos de ejecución y estadísticas

## 🔐 Seguridad

1. **HMAC Validation**: Todos los webhooks de partners verifican firma
2. **Rate Limiting**: Configurado en n8n settings
3. **IP Whitelist**: Opcional para webhooks críticos
