# 🚀 SEMANA 4: Quick Start Guide

**Nestor Ayala** | 24 de enero de 2026

---

## ⚡ Quick Start (5 minutos)

### Opción 1: PowerShell (Windows)

```powershell
# Terminal 1: Iniciar servidor
cd "C:\Users\HP\OneDrive - ULEAM\Escritorio\odalia\ProyectoSWEB_RecomendacionesTuristicas\backend\rest-api"
python main.py

# Terminal 2: Ejecutar tests
cd "C:\Users\HP\OneDrive - ULEAM\Escritorio\odalia\ProyectoSWEB_RecomendacionesTuristicas\backend\rest-api"
.\test_webhooks_semana4.ps1
```

### Opción 2: Python (Cross-platform)

```bash
# Terminal 1: Iniciar servidor
cd backend/rest-api
python main.py

# Terminal 2: Ejecutar tests
cd backend/rest-api
python test_webhooks_semana4.py
```

---

## 📋 Endpoints Rápidos

### 1. Generar Token JWT

```bash
curl -X POST http://localhost:8000/webhooks/generate-token \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "email": "user@example.com",
    "username": "john_doe"
  }'
```

**Resultado:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

---

### 2. Test Webhook con JWT + HMAC

```bash
# Guardar token en variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Payload
PAYLOAD='{"event_type":"booking.confirmed","data":{"booking_id":"book_123"}}'

# Generar firma (Linux/Mac)
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "my_secret_key_123" -hex | cut -d' ' -f2)

# Enviar webhook
curl -X POST http://localhost:8000/webhooks/partner \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -H "X-Webhook-Source: reservas_system" \
  -d "$PAYLOAD"
```

---

### 3. Validar Seguridad Dual

```bash
curl -X POST http://localhost:8000/webhooks/validate-security \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {"event_type": "booking.confirmed"},
    "signature": "abc123...",
    "token": "eyJ...",
    "secret": "my_secret_key_123"
  }'
```

---

## 🧪 Tests de Referencia

### Test 1: Sin JWT (debe fallar con 401)

```bash
TOKEN="invalid"
PAYLOAD='{"event_type":"booking.confirmed"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "my_secret_key_123" -hex | cut -d' ' -f2)

curl -X POST http://localhost:8000/webhooks/partner \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -H "X-Webhook-Source: reservas_system" \
  -d "$PAYLOAD"

# Esperado: 401 Unauthorized
```

### Test 2: Con HMAC inválido (debe fallar con 401)

```bash
TOKEN="eyJ..."  # token válido
PAYLOAD='{"event_type":"booking.confirmed"}'
SIGNATURE="invalid_signature"

curl -X POST http://localhost:8000/webhooks/partner \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -H "X-Webhook-Source: reservas_system" \
  -d "$PAYLOAD"

# Esperado: 401 Unauthorized
```

### Test 3: Ambos válidos (debe pasar con 200)

```bash
TOKEN="eyJ..."  # token válido
PAYLOAD='{"event_type":"booking.confirmed","data":{"id":"123"}}'
SIGNATURE="abc123..."  # firma válida

curl -X POST http://localhost:8000/webhooks/partner \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -H "X-Webhook-Source: reservas_system" \
  -d "$PAYLOAD"

# Esperado: 200 OK con metadata de seguridad
```

---

## 📊 Checklist de Validación

- [ ] **Server corriendo en puerto 8000**

  ```bash
  # Verificar
  curl http://localhost:8000/docs  # Swagger UI
  ```

- [ ] **Generar token exitosamente**

  ```bash
  curl http://localhost:8000/webhooks/generate-token ...
  # Status: 200
  ```

- [ ] **Validar HMAC solo**

  ```bash
  curl http://localhost:8000/webhooks/validate-hmac ...
  # Response: is_valid: true
  ```

- [ ] **Webhook sin JWT rechazado**

  ```bash
  curl http://localhost:8000/webhooks/partner (sin Authorization)
  # Status: 401
  ```

- [ ] **Webhook con JWT válido aceptado**
  ```bash
  curl http://localhost:8000/webhooks/partner (con Authorization)
  # Status: 200 o 500 (si error en BD, pero pasó seguridad)
  ```

---

## 🔍 Debugging

### Ver logs en real-time

```bash
# Terminal 1
python main.py
# Verá logs como:
# ✅ [SEMANA 4] Validación de seguridad dual: JWT + HMAC
# ✅ [SEMANA 4] JWT válido para usuario: user_123
# ✅ [SEMANA 4] HMAC válido
```

### Ver requests en Swagger

```
http://localhost:8000/docs
```

Desde ahí puede:

- ✅ Ver todos los endpoints
- ✅ Ejecutar requests directamente
- ✅ Ver responses
- ✅ Probar con diferentes datos

---

## ⚠️ Errores Comunes

### Error: "Authorization header requerido"

```
Solución: Añadir header Authorization: Bearer <token>
```

### Error: "Token expirado"

```
Solución: Generar nuevo token (expiran en 30 min)
```

### Error: "Token inválido"

```
Solución: Verificar JWT_SECRET_KEY en .env.example
```

### Error: "Firma HMAC inválida"

```
Solución: Verificar que MY_WEBHOOK_SECRET sea correcto
Nota: No agregar espacios extras al payload
```

### Error: "Can't connect to localhost:8000"

```
Solución:
1. Verificar que main.py está corriendo
2. Verificar puerto 8000 no está en uso
3. python main.py
```

---

## 📚 Documentación Completa

Para documentación detallada, ver:

- **SEMANA4_WEBHOOKS_JWT.md** - Guía técnica completa
- **SEMANA4_INTEGRACION_E2E.md** - Arquitectura E2E
- **SEMANA4_RESUMEN_VISUAL.md** - Resumen visual

---

## 🎯 Próximos Pasos

1. ✅ Implementación Semana 4 completa
2. ⏳ WebSocket integration (Semana 5)
3. ⏳ Frontend E2E testing (Semana 5)
4. ⏳ Production deployment

---

**Semana 4 ✅ Lista para testing**

Todos los endpoints funcionando
Seguridad dual (JWT + HMAC) implementada
Tests listos

Nestor Ayala | Enero 24, 2026
