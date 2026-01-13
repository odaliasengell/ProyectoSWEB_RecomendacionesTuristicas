# 🚀 SEMANA 4: Webhooks Bidireccionales + JWT + HMAC

**Autor:** Nestor Ayala  
**Fecha:** 24 de enero de 2026  
**Objetivo:** Implementar validación de seguridad dual (JWT + HMAC) en webhooks

---

## 📋 Resumen Ejecutivo

En **Semana 4**, se implementó la **validación de seguridad doble** para webhooks:

1. **JWT (JSON Web Token):** Valida la identidad del usuario
2. **HMAC-SHA256:** Valida la integridad del payload

Esto proporciona una **capa de seguridad adicional** al sistema de webhooks bidireccionales.

---

## 🔐 Arquitectura de Seguridad - Semana 4

```
Webhook entrante
        ↓
┌───────────────────────────────────┐
│  1. Extraer Token del Header      │ ← Authorization: Bearer <token>
└───────────────────────────────────┘
        ↓
┌───────────────────────────────────┐
│  2. Validar JWT                   │ ← Firma, expiracion, usuario
└───────────────────────────────────┘
        ↓
┌───────────────────────────────────┐
│  3. Extraer Firma HMAC            │ ← X-Webhook-Signature header
└───────────────────────────────────┘
        ↓
┌───────────────────────────────────┐
│  4. Validar HMAC-SHA256           │ ← Integridad del payload
└───────────────────────────────────┘
        ↓
    ✅ AMBAS VÁLIDAS
        ↓
┌───────────────────────────────────┐
│  5. Procesar Evento               │ ← Crear reserva, etc
└───────────────────────────────────┘
```

---

## 📁 Archivos Creados/Modificados - Semana 4

### Nuevos:

- `app/services/jwt_validator.py` (320 líneas) - Servicio de validación JWT
- `test_webhooks_semana4.py` (380 líneas) - Tests de seguridad dual

### Modificados:

- `app/routes/webhook_routes.py` - Añadidos 3 endpoints + validación JWT
- `.env.example` - Añadidas variables JWT

---

## 🔑 Servicio JWT Validator

### Clase: `JWTValidator`

```python
from app.services.jwt_validator import JWTValidator

# 1. Generar token
token_data = JWTValidator.generate_token(
    user_id="user_123",
    email="user@example.com",
    username="john_doe"
)
print(token_data["access_token"])

# 2. Verificar token
payload = JWTValidator.verify_token(token)
print(payload["user_id"])  # user_123

# 3. Extraer del header
token = JWTValidator.extract_token_from_header(
    "Bearer eyJ..."
)

# 4. Validar token de webhook
payload = JWTValidator.validate_webhook_token(token)
```

---

## 🛡️ Validador de Seguridad Dual

### Clase: `WebhookSecurityValidator`

```python
from app.services.jwt_validator import WebhookSecurityValidator

# Validar JWT + HMAC juntos
result = WebhookSecurityValidator.validate_webhook_security(
    token="eyJ...",
    signature="abc123...",
    payload_str='{"event_type": "booking.confirmed"}',
    secret="shared_secret_123",
    require_jwt=True
)

print(result)
# {
#   "jwt_valid": True,
#   "hmac_valid": True,
#   "jwt_payload": {...},
#   "error": None
# }
```

---

## 🔌 Nuevos Endpoints - Semana 4

### 1. POST `/webhooks/partner` (ACTUALIZADO)

**Cambios Semana 4:**

- ✅ Ahora requiere header `Authorization: Bearer <token>`
- ✅ Valida JWT antes de procesar
- ✅ Respuesta incluye metadata de seguridad

**Headers requeridos:**

```
Authorization: Bearer <token_jwt>
X-Webhook-Signature: <firma_hmac>
X-Webhook-Source: reservas_system
Content-Type: application/json
```

**Ejemplo con curl:**

```bash
# 1. Generar token
TOKEN=$(curl -X POST http://localhost:8000/webhooks/generate-token \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "email": "user@example.com",
    "username": "john_doe"
  }' | jq -r '.access_token')

# 2. Crear payload y firma
PAYLOAD='{"event_type":"booking.confirmed","data":{"booking_id":"book_123"}}'
SIGNATURE=$(echo -n "$PAYLOAD" | \
  openssl dgst -sha256 -hmac "my_secret_key_123" -hex | cut -d' ' -f2)

# 3. Enviar webhook
curl -X POST http://localhost:8000/webhooks/partner \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -H "X-Webhook-Source: reservas_system" \
  -d "$PAYLOAD"
```

**Response exitosa (200):**

```json
{
  "status": "received",
  "event_type": "booking.confirmed",
  "source_service": "reservas_system",
  "result": {
    "processed": true,
    "booking_id": "book_123"
  },
  "ack": true,
  "security": {
    "jwt_validated": true,
    "hmac_validated": true,
    "validated_by": "user_123"
  }
}
```

---

### 2. POST `/webhooks/generate-token` (NUEVO)

**Propósito:** Generar tokens JWT para testing

**Body:**

```json
{
  "user_id": "user_123",
  "email": "user@example.com",
  "username": "john_doe"
}
```

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "message": "Token generado exitosamente",
  "usage": "Usar en header: Authorization: Bearer <access_token>"
}
```

**Ejemplo:**

```bash
curl -X POST http://localhost:8000/webhooks/generate-token \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "email": "test@example.com",
    "username": "test_user"
  }'
```

---

### 3. POST `/webhooks/validate-security` (NUEVO)

**Propósito:** Validar JWT + HMAC juntos (para testing)

**Body:**

```json
{
  "payload": { "event_type": "booking.confirmed" },
  "signature": "abc123def456...",
  "token": "eyJ...",
  "secret": "shared_secret_tourism_123"
}
```

**Response (200):**

```json
{
  "jwt_valid": true,
  "hmac_valid": true,
  "jwt_payload": {
    "user_id": "user_123",
    "email": "user@example.com",
    "username": "john_doe",
    "exp": 1706097600,
    "iat": 1706095800,
    "type": "access"
  },
  "error": null,
  "message": "✅ Ambas validaciones pasaron"
}
```

**Ejemplo:**

```bash
curl -X POST http://localhost:8000/webhooks/validate-security \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {"event_type": "test"},
    "signature": "...",
    "token": "eyJ...",
    "secret": "shared_secret_tourism_123"
  }'
```

---

## 🧪 Tests - Semana 4

**Archivo:** `test_webhooks_semana4.py`

### Tests disponibles:

1. **test_01_generate_jwt_token** - Generar token JWT
2. **test_02_validate_hmac_only** - Validar solo HMAC
3. **test_03_webhook_with_invalid_hmac** - Rechazar HMAC inválido (401)
4. **test_04_webhook_without_jwt** - Rechazar sin JWT (401)
5. **test_05_webhook_with_invalid_jwt** - Rechazar JWT inválido (401)
6. **test_06_webhook_with_both_valid** - Aceptar JWT + HMAC válidos (200)
7. **test_07_validate_jwt_and_hmac_together** - Validador dual funciona
8. **test_08_webhook_test_endpoint** - Endpoint de prueba
9. **test_09_security_response_includes_metadata** - Metadata de seguridad

### Ejecutar tests:

```bash
# Con Python directo
python test_webhooks_semana4.py

# Con pytest
pytest test_webhooks_semana4.py -v

# Test específico
pytest test_webhooks_semana4.py::TestWebhookSecuritySemana4::test_06_webhook_with_both_valid -v
```

---

## ⚙️ Configuración - Semana 4

**.env.example actualizaciones:**

```env
# JWT Configuration
JWT_SECRET_KEY=tu_jwt_secret_key_muy_seguro_aqui
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30

# Webhook Secrets
MY_WEBHOOK_SECRET=my_secret_key_123
PARTNER_WEBHOOK_URL=http://grupo-reservas/webhooks/receive
PARTNER_SECRET=partner_secret_456
```

---

## 🔄 Flujo Completo de Validación

```
1. Usuario EXTERNO solicita token JWT
   POST /webhooks/generate-token
   ↓
2. Sistema genera token con identidad del usuario
   Return: access_token, expires_in
   ↓
3. Usuario envía webhook CON token en Authorization header
   POST /webhooks/partner
   Headers: Authorization: Bearer <token>
   ↓
4. Sistema extrae token del header
   JWTValidator.extract_token_from_header()
   ↓
5. Sistema verifica JWT
   JWTValidator.verify_token(token)
   ↓
6. Sistema extrae firma HMAC del header
   X-Webhook-Signature
   ↓
7. Sistema verifica HMAC del payload
   HMACValidator.verify_signature()
   ↓
8. SI ambas son válidas → Procesa evento
   SI alguna inválida → Error 401
   ↓
9. Respuesta incluye metadata de validación
   {
     "security": {
       "jwt_validated": true,
       "hmac_validated": true,
       "validated_by": "user_123"
     }
   }
```

---

## 🐛 Troubleshooting - Semana 4

### Error 401: "Authorization header requerido"

```
Causa: Falta header Authorization
Solución: Añadir header: Authorization: Bearer <token>
```

### Error 401: "Token expirado"

```
Causa: Token JWT expirado (expiration time pasó)
Solución: Generar nuevo token con POST /webhooks/generate-token
```

### Error 401: "Token inválido"

```
Causa: Token JWT corrupto o firmado con otra key
Solución: Verificar que JWT_SECRET_KEY sea correcto
```

### Error 401: "Firma HMAC inválida"

```
Causa: Payload modificado después de firmar
Solución: Verificar que payload sea exacto (sin espacios adicionales)
```

### Error 401: "Authorization header inválido"

```
Causa: Formato incorrecto (no empieza con "Bearer ")
Solución: Usar formato: Authorization: Bearer <token>
```

---

## 📊 Flujo de Testing

```bash
# 1. Iniciar servidor
cd backend/rest-api
python main.py

# 2. En otra terminal
cd backend/rest-api
python test_webhooks_semana4.py

# 3. Ver resultados
# Esperado: 9 tests PASARON, 0 FALLARON
```

---

## 🎯 Checklist - Semana 4

- ✅ Servicio JWT implementado
- ✅ Validador dual (JWT + HMAC) implementado
- ✅ 3 nuevos endpoints en webhook_routes.py
- ✅ Endpoint `/webhooks/partner` actualizado con validación JWT
- ✅ 9 tests de seguridad dual
- ✅ Documentación completa
- ✅ Variables de configuración en .env.example

---

## 🔗 Integración con otras semanas

**Semana 3 ✓ Webhooks + HMAC**
**Semana 4 ✓ + JWT Validation**
**Semana 5 → WebSocket Integration**

---

## 📚 Referencias

- [RFC 7519: JWT](https://tools.ietf.org/html/rfc7519)
- [RFC 2104: HMAC](https://tools.ietf.org/html/rfc2104)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

---

**Semana 4 Completada ✅**

Nestor Ayala | Enero 24, 2026
