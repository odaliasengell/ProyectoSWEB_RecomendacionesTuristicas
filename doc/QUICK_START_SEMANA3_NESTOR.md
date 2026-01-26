## 🚀 Quick Start - Semana 3 (Nestor) - Referencia Rápida

**Tiempo total:** ~2 horas de implementación + testing

---

## ⚡ En 5 Minutos

```bash
# 1. Verificar que todo está en lugar
ls backend/rest-api/app/services/webhook_service.py          # ✓
ls backend/rest-api/app/routes/webhook_routes.py            # ✓
ls backend/rest-api/app/controllers/reserva_webhook_controller.py  # ✓

# 2. Instalar dependencia si falta
pip install httpx

# 3. Iniciar API
cd backend/rest-api
python main.py
# Esperar: ✅ Conectado a MongoDB

# 4. En otra terminal, test rápido
curl http://localhost:8000/webhooks/test

# 5. Si retorna JSON con "ok" → ¡Todo funciona! ✅
```

---

## 🔍 Archivos Principales

### Tu Implementación

```
backend/rest-api/
├── app/services/webhook_service.py      ← Lógica de webhooks
├── app/routes/webhook_routes.py         ← Endpoints /webhooks
└── app/controllers/reserva_webhook_controller.py  ← Crear reserva + webhook
```

### Configuración

```
backend/rest-api/
├── main.py                    ← Importar webhook_routes
├── .env.example               ← Variables de entorno
└── test_webhooks.ps1          ← Tests
```

### Documentación Para Ti

```
SEMANA3_WEBHOOKS_GUIDE.md          ← TODO (arquitectura, ngrok, flujos)
SEMANA3_NESTOR_RESUMEN.md          ← Guía paso a paso
SEMANA3_QA_TESTING.md              ← Checklist de testing
```

### Para Compartir con Partner

```
PARTNER_INTEGRATION_GUIDE.md        ← Enviar a grupo partner
```

---

## 📌 Endpoints Principales

### Que Tú Recibes (de partner)

```
POST /webhooks/partner
Headers:
  X-Webhook-Signature: <firma_hmac>
  X-Webhook-Source: reservas_system

Body:
{
  "event_type": "booking.confirmed",
  "data": {...}
}

Response: 200 {"status": "received", "ack": true}
```

### Que Tú Envías (al partner)

```
POST /reservas/webhook/tour-purchased
Headers:
  Content-Type: application/json

Body:
{
  "usuario_id": "user_123",
  "usuario_email": "usuario@example.com",
  "tour_id": "tour_456",
  "cantidad_personas": 2,
  "precio_total": 1200.50,
  "fecha": "2025-03-15"
}

Response: 200 {
  "success": true,
  "reserva": {...},
  "webhook": {"sent": true, "status_code": 200}
}
```

---

## 🔐 Secret HMAC

```
shared_secret_tourism_123
```

**Debe ser idéntico en:**

- Tu `.env` → `PARTNER_SECRET`
- En el `.env` del partner
- En la validación de firma

---

## 🧪 Prueba Rápida (PowerShell)

```powershell
# Test 1: Verificar servicio
curl.exe http://localhost:8000/webhooks/test | ConvertFrom-Json

# Test 2: Crear reserva
$p = @{
    usuario_id = "test_user"
    usuario_email = "test@test.com"
    tour_id = "test_tour"
    cantidad_personas = 1
    precio_total = 100
    fecha = "2025-03-15"
} | ConvertTo-Json

curl.exe -X POST http://localhost:8000/reservas/webhook/tour-purchased `
  -H "Content-Type: application/json" `
  -d $p | ConvertFrom-Json
```

---

## 🌐 ngrok (Para integración con partner)

```bash
# Instalar (Windows)
# https://ngrok.com/download

# Autenticar
ngrok config add-authtoken <token>

# Ejecutar
ngrok http 8000

# Copiar URL: https://abc123.ngrok.io
# Compartir con partner
```

---

## 📋 Flujo de Integración

```
Semana 3 Hitos:
━━━━━━━━━━━━━━━━━

Lunes:
  ✓ Implementar webhook_service.py
  ✓ Implementar webhook_routes.py
  ✓ Commit 1: webhook service

Martes:
  ✓ Integrar con reservas (controller)
  ✓ Endpoint /reservas/webhook/tour-purchased
  ✓ Commit 2: routes
  ✓ Commit 3: reserva integration

Miércoles:
  ✓ Tests locales funcionando
  ✓ Documentación completa
  ✓ Commit 4: documentation

Jueves:
  ✓ ngrok instalado y probado
  ✓ Contactar al grupo partner
  ✓ Compartir PARTNER_INTEGRATION_GUIDE.md
  ✓ Commit 5: tests

Viernes:
  ✓ Coordinar URL ngrok con partner
  ✓ Primeras pruebas bidireccionales
  ✓ Documentar cualquier issue
```

---

## 🔗 Variables de Entorno

```env
# .env (local)
PARTNER_WEBHOOK_URL=http://localhost:8001      # Cambiar después
PARTNER_SECRET=shared_secret_tourism_123
MY_WEBHOOK_SECRET=shared_secret_tourism_123
```

---

## 📊 Validación Rápida

```bash
# ¿Está OK?

❌ ModuleNotFoundError: httpx
→ pip install httpx

❌ Connection refused (partner)
→ Partner no está corriendo, normal en desarrollo

❌ Firma inválida
→ Verificar que el secret es idéntico en ambos lados

✅ POST /webhooks/test retorna JSON
→ Servicio está activo

✅ POST /reservas/webhook/tour-purchased retorna reserva
→ Todo funciona
```

---

## 🎯 Checklist Mínimo

- [ ] webhook_service.py está en app/services/
- [ ] webhook_routes.py está en app/routes/
- [ ] reserva_webhook_controller.py está en app/controllers/
- [ ] main.py importa webhook_routes
- [ ] Tests ejecutan sin error: `.\test_webhooks.ps1`
- [ ] Endpoint /webhooks/test retorna 200
- [ ] Endpoint /reservas/webhook/tour-purchased retorna reserva
- [ ] 5 commits creados (git log --oneline -5)
- [ ] Documentación completa

---

## 📞 Contacto

**Problemas?**

- Revisar `SEMANA3_NESTOR_RESUMEN.md` → Troubleshooting
- Revisar `SEMANA3_QA_TESTING.md` → Debugging
- Contactar a Odalia (Líder) en Teams

**Para compartir con partner:**

- Enviar `PARTNER_INTEGRATION_GUIDE.md`
- Compartir URL ngrok cuando esté lista
- Email template en `SEMANA3_NESTOR_RESUMEN.md`

---

## 🏆 Éxito =

```
✅ Webhooks enviados al partner
✅ Webhooks recibidos del partner
✅ Ambos validan firma HMAC
✅ ACKs funcionan correctamente
✅ 5 commits en repositorio
✅ Documentación actualizada
```

**Tiempo estimado:** 10-12 horas totales  
**Vencimiento:** Fin de Semana 3 (viernes)  
**Siguiente:** Semana 4 - Frontend + n8n integration

---

**¡Adelante! 🚀**
