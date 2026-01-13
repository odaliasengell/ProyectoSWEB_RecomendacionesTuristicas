# 📝 SEMANA 4: Cambios Realizados - Detalles Técnicos

**Fecha:** 24 de enero de 2026  
**Author:** Nestor Ayala

---

## 📂 Estructura de Archivos - Semana 4

```
backend/rest-api/
│
├─── app/services/
│    ├─── jwt_validator.py           ← ✨ NUEVO
│    ├─── webhook_service.py         ← (de Semana 3)
│    └─── payment_client.py
│
├─── app/routes/
│    └─── webhook_routes.py          ← 🔄 ACTUALIZADO
│
├─── test_webhooks_semana4.py        ← ✨ NUEVO (tests)
├─── test_webhooks_semana4.ps1       ← ✨ NUEVO (tests PS)
│
├─── SEMANA4_*.md (5 archivos)       ← ✨ NUEVOS (docs)
│
└─── .env.example                    ← 🔄 ACTUALIZADO
```

---

## ✨ ARCHIVO NUEVO: `jwt_validator.py`

**Ubicación:** `app/services/jwt_validator.py`  
**Líneas:** 320  
**Propósito:** Generar y validar JWT + Validación dual

### Clases Implementadas:

#### 1. JWTValidator

```python
class JWTValidator:
    @staticmethod
    def generate_token(user_id, email, username, expires_delta=None)
        → Genera JWT con expiración

    @staticmethod
    def verify_token(token)
        → Valida JWT y retorna payload

    @staticmethod
    def extract_token_from_header(auth_header)
        → Extrae "Bearer token" del Authorization header

    @staticmethod
    def validate_webhook_token(token, required_scopes=None)
        → Valida específicamente para webhooks
```

#### 2. WebhookSecurityValidator

```python
class WebhookSecurityValidator:
    @staticmethod
    def validate_webhook_security(
        token, signature, payload_str, secret, require_jwt=True
    )
        → Valida JWT + HMAC juntos (seguridad dual)
```

---

## 🔄 ARCHIVO ACTUALIZADO: `webhook_routes.py`

**Cambios:**

- ✅ Importación de JWT services
- ✅ Endpoint `/webhooks/partner` actualizado
- ✅ 2 nuevos endpoints

### Cambio 1: Importaciones

**Antes:**

```python
from ..services.webhook_service import (
    WebhookEventValidator,
    HMACValidator,
    MY_WEBHOOK_SECRET
)
```

**Ahora:**

```python
from ..services.webhook_service import (
    WebhookEventValidator,
    HMACValidator,
    MY_WEBHOOK_SECRET
)
from ..services.jwt_validator import JWTValidator, WebhookSecurityValidator
```

---

### Cambio 2: Endpoint `/webhooks/partner` (ACTUALIZADO)

**Antes:** Solo validaba HMAC

```python
@router.post("/webhooks/partner")
async def receive_partner_webhook(
    request: Request,
    x_webhook_signature: Optional[str] = Header(None),
    x_webhook_source: Optional[str] = Header(None)
):
    # Solo validaba HMAC
    if not x_webhook_signature:
        raise HTTPException(status_code=401, detail="...")

    body = await request.body()
    payload_str = body.decode('utf-8')

    is_valid, event_data = WebhookEventValidator.validate_partner_event(...)
```

**Ahora:** Valida JWT + HMAC

```python
@router.post("/webhooks/partner")
async def receive_partner_webhook(
    request: Request,
    x_webhook_signature: Optional[str] = Header(None),
    x_webhook_source: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)  ← NUEVO
):
    # NUEVO: Validar JWT
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header requerido")

    token = JWTValidator.extract_token_from_header(authorization)

    # Leer body primero
    body = await request.body()
    payload_str = body.decode('utf-8')

    # NUEVO: Validar seguridad dual
    security_result = WebhookSecurityValidator.validate_webhook_security(
        token=token,
        signature=x_webhook_signature,
        payload_str=payload_str,
        secret=MY_WEBHOOK_SECRET,
        require_jwt=True
    )

    if security_result["error"]:
        raise HTTPException(status_code=401, detail=security_result["error"])

    # NUEVO: Response incluye metadata
    return {
        "status": "received",
        "event_type": event_type,
        "security": {  ← NUEVO
            "jwt_validated": security_result["jwt_valid"],
            "hmac_validated": security_result["hmac_valid"],
            "validated_by": security_result['jwt_payload'].get('user_id')
        }
    }
```

---

### Cambio 3: Nuevos Endpoints

#### A. POST `/webhooks/generate-token` (NUEVO)

```python
@router.post("/webhooks/generate-token")
async def generate_jwt_token(
    user_id: str,
    email: str,
    username: str
):
    """
    Generar tokens JWT para testing.
    """
    token_data = JWTValidator.generate_token(
        user_id=user_id,
        email=email,
        username=username
    )

    return {
        "access_token": token_data["access_token"],
        "token_type": token_data["token_type"],
        "expires_in": token_data["expires_in"],
        "message": "Token generado exitosamente",
        "usage": "Usar en header: Authorization: Bearer <access_token>"
    }
```

#### B. POST `/webhooks/validate-security` (NUEVO)

```python
@router.post("/webhooks/validate-security")
async def validate_webhook_security_endpoint(
    payload: dict,
    signature: str,
    token: str,
    secret: str = "shared_secret_tourism_123"
):
    """
    SEMANA 4: Validar JWT + HMAC juntos.
    """
    payload_str = json.dumps(payload)

    result = WebhookSecurityValidator.validate_webhook_security(
        token=token,
        signature=signature,
        payload_str=payload_str,
        secret=secret,
        require_jwt=True
    )

    return {
        "jwt_valid": result["jwt_valid"],
        "hmac_valid": result["hmac_valid"],
        "jwt_payload": result["jwt_payload"],
        "error": result["error"],
        "message": "✅ Ambas validaciones pasaron" if not result["error"] else ...
    }
```

---

## 🔄 ARCHIVO ACTUALIZADO: `.env.example`

**Nuevas variables agregadas:**

```bash
# JWT Configuration - NUEVO SEMANA 4
JWT_SECRET_KEY=tu_jwt_secret_key_muy_seguro_aqui
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30
```

---

## ✨ NUEVO: `test_webhooks_semana4.py`

**Líneas:** 380  
**Propósito:** Tests de seguridad dual

```python
class WebhookTestHelper:
    @staticmethod
    def generate_hmac_signature(payload, secret)
    @staticmethod
    def generate_jwt_token()
    @staticmethod
    def create_webhook_payload(event_type, data=None)

class TestWebhookSecuritySemana4:
    test_01_generate_jwt_token()          ✅
    test_02_validate_hmac_only()          ✅
    test_03_webhook_with_invalid_hmac()   ✅
    test_04_webhook_without_jwt()         ✅
    test_05_webhook_with_invalid_jwt()    ✅
    test_06_webhook_with_both_valid()     ✅
    test_07_validate_jwt_and_hmac()       ✅
    test_08_webhook_test_endpoint()       ✅
    test_09_security_response_metadata()  ✅
```

---

## ✨ NUEVO: `test_webhooks_semana4.ps1`

**Propósito:** Tests en PowerShell para Windows

```powershell
Function Generate-HMACSHA256
    → Genera firma HMAC

TEST 1: Generar Token JWT
TEST 2: Validar solo HMAC
TEST 3: Webhook sin JWT (debe rechazar 401)
TEST 4: Validador de seguridad dual
TEST 5: Webhook con JWT + HMAC válidos
TEST 6: Response incluye metadata
```

---

## 📖 NUEVOS: Archivos de Documentación

### 1. `SEMANA4_WEBHOOKS_JWT.md` (400 líneas)

- Arquitectura JWT + HMAC
- Todas las clases documentadas
- Todos los endpoints
- Ejemplos de curl
- Troubleshooting

### 2. `SEMANA4_INTEGRACION_E2E.md` (350 líneas)

- Arquitectura end-to-end
- Flujo completo
- Integración WebSocket (preview)
- Escenarios de testing

### 3. `SEMANA4_RESUMEN_VISUAL.md` (300 líneas)

- Diagramas de flujo
- Resumen visual
- Estadísticas
- Conceptos clave

### 4. `SEMANA4_QUICK_START.md` (200 líneas)

- Quick start 5 minutos
- Comandos listos
- Checklist
- Debugging

### 5. `SEMANA4_INDICE_DOCUMENTACION.md` (250 líneas)

- Índice de documentación
- Cómo navegar
- Referencias cruzadas
- FAQ

### 6. `SEMANA4_RESUMEN_ENTREGA.md` (200 líneas)

- Resumen de entrega
- Checklist
- Estadísticas
- Estado del proyecto

### 7. `SEMANA4_START_HERE.md` (100 líneas)

- Punto de entrada
- Resumen ejecutivo
- Quick links

---

## 📊 Líneas de Código

| Componente                | Líneas    | Estado         |
| ------------------------- | --------- | -------------- |
| jwt_validator.py          | 320       | ✨ NUEVO       |
| webhook_routes.py cambios | +100      | 🔄 ACTUALIZADO |
| test_webhooks_semana4.py  | 380       | ✨ NUEVO       |
| test_webhooks_semana4.ps1 | 150       | ✨ NUEVO       |
| Documentación (5 docs)    | 1500+     | ✨ NUEVA       |
| **TOTAL**                 | **~2500** | ✅             |

---

## 🔗 Dependencias Agregadas

**En `requirements.txt`:** Ya estaba

- PyJWT (para JWT generation/validation)

```python
# Ya en requirements.txt
PyJWT  # Para manejo de tokens JWT
```

---

## 🚀 Cómo Probar los Cambios

### 1. Iniciar servidor

```bash
cd backend/rest-api
python main.py
```

### 2. Ejecutar tests

```bash
# Opción 1: Python
python test_webhooks_semana4.py

# Opción 2: PowerShell
.\test_webhooks_semana4.ps1

# Opción 3: Pytest
pytest test_webhooks_semana4.py -v
```

### 3. Resultado esperado

```
======================== 9 PASSED ========================
✅ Todos los tests pasan
```

---

## 🔐 Cambios en Seguridad

### Antes (Semana 3):

```
Webhook → HMAC Validation → Procesar
          (Solo integridad)
```

### Ahora (Semana 4):

```
Webhook → JWT Validation → HMAC Validation → Procesar
          (Autenticación)  (Integridad)     (Con auditoría)
```

---

## ✅ Resumen de Cambios

| Item                            | Cambio         | Líneas           |
| ------------------------------- | -------------- | ---------------- |
| Archivo nuevo: jwt_validator.py | ✨ Creado      | 320              |
| Archivo nuevo: tests Python     | ✨ Creado      | 380              |
| Archivo nuevo: tests PowerShell | ✨ Creado      | 150              |
| Archivo nuevo: 5 documentos     | ✨ Creados     | 1500+            |
| webhook_routes.py               | 🔄 Actualizado | +100             |
| .env.example                    | 🔄 Actualizado | +3 vars          |
| **Total**                       |                | **~2500 líneas** |

---

## 🎯 Compatibilidad

✅ Backward compatible con Semana 3

- Endpoints anteriores siguen funcionando
- Webhooks sin JWT ahora requieren JWT (como debe ser)
- HMAC validation sigue funcionando igual

---

## 📞 Verificación

Para verificar que todo está en su lugar:

```bash
# 1. Verificar archivos
ls backend/rest-api/app/services/jwt_validator.py
ls backend/rest-api/test_webhooks_semana4.py
ls backend/rest-api/SEMANA4_*.md

# 2. Verificar imports en webhook_routes.py
grep "jwt_validator" backend/rest-api/app/routes/webhook_routes.py

# 3. Verificar requirements
grep PyJWT backend/rest-api/requirements.txt
```

---

**Cambios Semana 4 - Documentados ✅**

Nestor Ayala | 24 de enero de 2026
