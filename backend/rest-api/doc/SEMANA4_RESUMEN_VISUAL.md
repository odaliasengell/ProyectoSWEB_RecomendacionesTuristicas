# 📊 SEMANA 4: Resumen Visual de Implementación

**Nestor Ayala** | 24 de enero de 2026

---

## 🎯 Objetivo Semana 4

Implementar **validación de seguridad doble** (JWT + HMAC) en webhooks para garantizar:

- ✅ **Autenticación:** Confirmar identidad del usuario (JWT)
- ✅ **Integridad:** Garantizar que el payload no fue modificado (HMAC)
- ✅ **Auditoría:** Registrar quién validó cada webhook

---

## 📦 Archivos Creados

```
backend/rest-api/
├── app/services/
│   └── jwt_validator.py              ← NUEVO (320 líneas)
│       ├── JWTValidator              ← Generar/validar JWT
│       └── WebhookSecurityValidator  ← Validación dual
│
├── test_webhooks_semana4.py          ← NUEVO (380 líneas)
│   └── 9 tests de seguridad
│
├── test_webhooks_semana4.ps1         ← NUEVO (PowerShell)
│   └── Tests en Windows
│
├── SEMANA4_WEBHOOKS_JWT.md           ← NUEVA (documentación)
│   └── Guía técnica JWT + HMAC
│
└── SEMANA4_INTEGRACION_E2E.md        ← NUEVA (documentación)
    └── Arquitectura completa E2E
```

---

## 🔄 Flujo de Validación Dual

```
Webhook entrante
    ↓
┌─────────────────────────────┐
│ Step 1: Extract JWT         │  Header: Authorization: Bearer token
└──────────┬──────────────────┘
           ↓
    ✅ JWT válido?
           │
        No → 401 Unauthorized
           │
        Sí ↓
┌─────────────────────────────┐
│ Step 2: Extract HMAC        │  Header: X-Webhook-Signature
└──────────┬──────────────────┘
           ↓
    ✅ HMAC válido?
           │
        No → 401 Unauthorized
           │
        Sí ↓
┌─────────────────────────────┐
│ Step 3: Process Event       │  Crear reserva
│         + Audit             │  Registrar validador
└─────────────────────────────┘
           ↓
    Response 200 OK
    {
      "security": {
        "jwt_validated": true,
        "hmac_validated": true,
        "validated_by": "user_123"
      }
    }
```

---

## 🔐 Clase: JWTValidator

```python
JWTValidator
├── generate_token(user_id, email, username)
│   └─ Genera JWT con expiración
│
├── verify_token(token)
│   └─ Valida JWT y retorna payload
│
├── extract_token_from_header(auth_header)
│   └─ Extrae "Bearer token" del header
│
└── validate_webhook_token(token, required_scopes)
    └─ Valida específicamente para webhooks
```

### Ejemplo de uso:

```python
# Generar token
token_data = JWTValidator.generate_token(
    user_id="user_123",
    email="user@example.com",
    username="john_doe"
)
# Retorna: {"access_token": "eyJ...", "expires_in": 1800}

# Verificar token
payload = JWTValidator.verify_token(token)
# Retorna: {"user_id": "user_123", "email": "...", "exp": ...}

# Validar en webhook
payload = JWTValidator.validate_webhook_token(token)
```

---

## 🛡️ Clase: WebhookSecurityValidator

```python
WebhookSecurityValidator
└── validate_webhook_security(
    token,
    signature,
    payload_str,
    secret,
    require_jwt=True
)
```

### Validación Dual:

```python
result = WebhookSecurityValidator.validate_webhook_security(
    token="eyJ...",
    signature="abc123...",
    payload_str='{"event_type": "booking.confirmed"}',
    secret="my_secret_key_123",
    require_jwt=True
)

# Retorna:
{
    "jwt_valid": True,
    "hmac_valid": True,
    "jwt_payload": {...},
    "error": None  # ✅ Ambas válidas
}
```

---

## 🔌 Endpoints Semana 4

### 1️⃣ POST `/webhooks/generate-token` (NUEVO)

**Propósito:** Generar tokens JWT

```bash
curl -X POST http://localhost:8000/webhooks/generate-token \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "email": "user@example.com",
    "username": "john_doe"
  }'
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

---

### 2️⃣ POST `/webhooks/partner` (ACTUALIZADO)

**Cambios Semana 4:**

- ✅ Requiere `Authorization: Bearer <token>`
- ✅ Valida JWT antes de procesar
- ✅ Response incluye metadata de seguridad

```bash
# 1. Generar token
TOKEN=$(curl -s -X POST http://localhost:8000/webhooks/generate-token \
  -d '{"user_id":"user_123","email":"test@test.com","username":"test"}' \
  | jq -r '.access_token')

# 2. Crear firma HMAC
PAYLOAD='{"event_type":"booking.confirmed","data":{"id":"123"}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "my_secret_key_123" -hex | cut -d' ' -f2)

# 3. Enviar webhook
curl -X POST http://localhost:8000/webhooks/partner \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -H "X-Webhook-Source: reservas_system" \
  -d "$PAYLOAD"
```

**Response:**

```json
{
  "status": "received",
  "event_type": "booking.confirmed",
  "ack": true,
  "security": {
    "jwt_validated": true,
    "hmac_validated": true,
    "validated_by": "user_123"
  }
}
```

---

### 3️⃣ POST `/webhooks/validate-security` (NUEVO)

**Propósito:** Validar JWT + HMAC juntos (testing)

```bash
curl -X POST http://localhost:8000/webhooks/validate-security \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {"event_type": "test"},
    "signature": "abc123...",
    "token": "eyJ...",
    "secret": "my_secret_key_123"
  }'
```

**Response:**

```json
{
  "jwt_valid": true,
  "hmac_valid": true,
  "error": null,
  "message": "✅ Ambas validaciones pasaron"
}
```

---

## 🧪 Tests - 9 Casos

```
TEST 01 ✅ Generar token JWT
TEST 02 ✅ Validar solo HMAC
TEST 03 ✅ Rechazar HMAC inválido (401)
TEST 04 ✅ Rechazar sin JWT (401)
TEST 05 ✅ Rechazar JWT inválido (401)
TEST 06 ✅ Aceptar JWT + HMAC válidos (200)
TEST 07 ✅ Validador dual funciona
TEST 08 ✅ Endpoint de prueba
TEST 09 ✅ Metadata de seguridad en response
```

### Ejecutar tests:

```bash
# Python
python test_webhooks_semana4.py

# PowerShell
.\test_webhooks_semana4.ps1

# Pytest
pytest test_webhooks_semana4.py -v
```

---

## 📈 Estadísticas Semana 4

| Métrica                | Cantidad   |
| ---------------------- | ---------- |
| Archivos Nuevos        | 5          |
| Líneas de Código       | 700+       |
| Tests Implementados    | 9          |
| Endpoints Nuevos       | 2          |
| Endpoints Actualizados | 1          |
| Clases Implementadas   | 2          |
| Documentación          | 2 archivos |

---

## 🔗 Integración E2E

```
┌────────────────────────────┐
│    GRUPO PARTNER (RESERVAS) │
└────────┬───────────────────┘
         │ webhook + JWT + HMAC
         ↓
┌────────────────────────────┐
│       REST-API (SEMANA 4)   │
│                            │
│  1. Valida JWT              │
│  2. Valida HMAC             │
│  3. Crea reserva en BD      │
│  4. Envía evento WebSocket  │
└────────┬───────────────────┘
         │ evento en real-time
         ↓
┌────────────────────────────┐
│    FRONTEND (WebSocket)     │
│                            │
│  Recibe notificación        │
│  Actualiza UI               │
│  Muestra reserva            │
└────────────────────────────┘
```

---

## 🎓 Conceptos Implementados

### ✅ JWT (JSON Web Token)

- **Propósito:** Autenticar usuario
- **Estructura:** Header.Payload.Signature
- **Algoritmo:** HS256
- **Expiración:** 30 minutos

### ✅ HMAC-SHA256

- **Propósito:** Garantizar integridad
- **Fórmula:** HMAC(message, secret)
- **Validación:** Comparison en tiempo constante
- **Previene:** Man-in-the-middle attacks

### ✅ Doble Validación

- **Capa 1:** Identidad (JWT)
- **Capa 2:** Integridad (HMAC)
- **Auditoría:** Quién procesó el webhook

---

## 📚 Archivos de Documentación

1. **SEMANA4_WEBHOOKS_JWT.md**
   - Guía técnica completa
   - Todos los endpoints
   - Ejemplos de uso
   - Troubleshooting

2. **SEMANA4_INTEGRACION_E2E.md**
   - Arquitectura completa
   - Flujo end-to-end
   - Integración con WebSocket
   - Testing E2E

---

## ✨ Características Clave Semana 4

🔐 **Seguridad Dual**

- JWT para autenticación
- HMAC para integridad
- Validación combinada

📊 **Auditoría**

- Registra quién validó
- Metadata en responses
- Logs detallados

🧪 **Testing**

- 9 casos de prueba
- Python + PowerShell
- Cobertura de seguridad

📖 **Documentación**

- Guías técnicas
- Ejemplos completos
- Troubleshooting

---

## 🚀 Próximos Pasos (Semana 5)

- [ ] Integración con WebSocket Server
- [ ] Broadcast de eventos en real-time
- [ ] Frontend WebSocket listener
- [ ] Testing E2E completo
- [ ] Dashboard con actualizaciones live

---

## 📊 Estado General Proyecto

| Semana       | Estado          | Características                 |
| ------------ | --------------- | ------------------------------- |
| Semana 1     | ✅ Completa     | Auth, Estructuras básicas       |
| Semana 2     | ✅ Completa     | REST API, MongoDB               |
| Semana 3     | ✅ Completa     | Webhooks HMAC-SHA256            |
| **Semana 4** | ✅ **Completa** | **JWT + HMAC (Seguridad dual)** |
| Semana 5     | ⏳ Próxima      | WebSocket + E2E                 |

---

## 💾 Instalación/Setup

```bash
# 1. Instalar dependencias
pip install -r requirements.txt
# (PyJWT ya está incluido)

# 2. Configurar variables
# Copiar .env.example a .env
# Actualizar valores si es necesario

# 3. Iniciar servidor
python main.py

# 4. Ejecutar tests
python test_webhooks_semana4.py
```

---

**Semana 4 - Completada ✅**

Implementación: Validación de seguridad dual (JWT + HMAC)
Documentación: Completa y exhaustiva
Tests: 9 casos cubre todos los escenarios
Código: Listo para producción

Nestor Ayala | Enero 24, 2026
