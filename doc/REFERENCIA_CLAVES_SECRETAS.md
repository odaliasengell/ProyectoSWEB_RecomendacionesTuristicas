# 🔐 Referencia de Claves Secretas - Integración Bidireccional Equipo A

## ✅ Estado Actual de Sincronización

**Fecha de actualización:** 25 de enero de 2026  
**Status:** ✅ CLAVES SECRETAS SINCRONIZADAS

---

## 📋 Claves Secretas por Servicio

### 1. **Auth Service** (`backend/auth-service/.env`)

```env
JWT_SECRET_KEY=integracion-turismo-2026-uleam-jwt-secret-key-payment-service
INTEGRACION_SECRET_KEY=integracion-turismo-2026-uleam
INTEGRACION_ENABLED=true
```

✅ **Status:** Configurada  
📍 **Ubicación:** `backend/auth-service/.env`  
🔗 **Uso:** Validación de tokens JWT para acceso a servicios protegidos

---

### 2. **Payment Service** (`backend/payment-service/.env`)

```env
JWT_SECRET_KEY=integracion-turismo-2026-uleam-jwt-secret-key-payment-service
JWT_ALGORITHM=HS256

# Integration (Equipo A - Bidireccional)
INTEGRACION_SECRET_KEY=integracion-turismo-2026-uleam
INTEGRACION_ENABLED=true
INTEGRACION_TIMEOUT=10
```

✅ **Status:** Configurada  
📍 **Ubicación:** `backend/payment-service/.env`  
🔗 **Uso:** Webhooks bidireccionales, procesamiento de pagos

---

### 3. **REST API** (`backend/rest-api/.env`)

```env
JWT_SECRET_KEY=integracion-turismo-2026-uleam-jwt-secret-key-payment-service
JWT_ALGORITHM=HS256

# Integration Configuration
INTEGRACION_SECRET_KEY=integracion-turismo-2026-uleam
INTEGRACION_ENABLED=true
INTEGRACION_TIMEOUT=10
```

✅ **Status:** Configurada  
📍 **Ubicación:** `backend/rest-api/.env`  
🔗 **Uso:** Recepción de webhooks de Equipo B, envío de confirmaciones

---

## 🔐 Descripciones de Claves

### JWT_SECRET_KEY

**Propósito:** Validación de tokens JWT entre servicios  
**Valor actual:** `integracion-turismo-2026-uleam-jwt-secret-key-payment-service`  
**Longitud:** 60 caracteres  
**Algoritmo:** HS256  
**Sincronización:** ✅ Idéntica en auth-service, payment-service y rest-api

**Uso:**

```python
# Generar token
from jose import jwt
token = jwt.encode(
    {"user_id": "123", "role": "admin"},
    JWT_SECRET_KEY,
    algorithm="HS256"
)

# Validar token
payload = jwt.decode(
    token,
    JWT_SECRET_KEY,
    algorithms=["HS256"]
)
```

---

### INTEGRACION_SECRET_KEY

**Propósito:** Firma HMAC-SHA256 de webhooks bidireccionales  
**Valor actual:** `integracion-turismo-2026-uleam`  
**Longitud:** 32 caracteres  
**Algoritmo:** HMAC-SHA256  
**Sincronización:** ✅ Idéntica entre Equipo A y Equipo B

**Uso:**

```python
import hmac
import hashlib
import json

payload = {"event": "tour.purchased", "user_id": "123"}
payload_json = json.dumps(payload, separators=(',', ':'), sort_keys=True)

# Generar firma
firma = hmac.new(
    INTEGRACION_SECRET_KEY.encode(),
    payload_json.encode(),
    hashlib.sha256
).hexdigest()

# Verificar firma (timing-attack resistant)
is_valid = hmac.compare_digest(firma_esperada, firma_recibida)
```

---

## 🔗 Configuración de Servicios Relacionados

### MongoDB

```env
MONGODB_URL=mongodb://localhost:27017
DB_NAME=turismo_db
```

**Bases de datos:**

- `auth_service_db` - Auth Service
- `payment_service_db` - Payment Service
- `turismo_db` - REST API

---

### URLs de Servicios Internos

```env
AUTH_SERVICE_URL=http://localhost:8001
PAYMENT_SERVICE_URL=http://localhost:8002
```

**Puertos:**

- 8000: REST API (Equipo A - Recomendaciones)
- 8001: Auth Service
- 8002: Payment Service
- 8003: WebSocket Server

---

### ngrok (Exposición Pública)

**Requiere configuración manual:**

```bash
# 1. Instalar ngrok
scoop install ngrok

# 2. Autenticar (token desde https://dashboard.ngrok.com)
ngrok config add-authtoken YOUR_AUTH_TOKEN

# 3. Exponer API local
ngrok http 8000
```

**Output esperado:**

```
Session Status                online
Session Expires               2 hours, 55 minutes
Version                       3.x.x
Region                        us
Latency                       xx ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def45.ngrok.io -> http://localhost:8000
```

**URL pública:**

- Copiar: `https://abc123def45.ngrok.io`
- Compartir con Equipo B
- Actualizar en tests cuando recibas URL de Equipo B

---

## ✅ Checklist de Sincronización

- [x] JWT_SECRET_KEY sincronizada entre auth-service y payment-service
- [x] INTEGRACION_SECRET_KEY configurada en payment-service y rest-api
- [x] INTEGRACION_ENABLED=true en todos los servicios
- [x] INTEGRACION_TIMEOUT=10 configurado
- [x] MongoDB URLs correctas
- [x] AUTH_SERVICE_URL correcto
- [x] Stripe y MercadoPago configurados (opcionales para testing)

---

## 🚀 Próximas Pasos

1. **Iniciar servicios locales:**

   ```bash
   # Terminal 1
   cd backend/auth-service && python main.py

   # Terminal 2
   cd backend/rest-api && python -m uvicorn main:app --reload

   # Terminal 3
   cd backend/payment-service && python main.py
   ```

2. **Exponer con ngrok:**

   ```bash
   # Terminal 4
   ngrok http 8000
   ```

3. **Ejecutar verificación:**

   ```bash
   cd backend/rest-api
   python verify_secrets_config.py
   ```

4. **Ejecutar tests:**

   ```bash
   python test_integracion_bidireccional_completa.py
   ```

5. **Compartir con Equipo B:**
   - ngrok URL: `https://abc123def45.ngrok.io`
   - Secret compartido: `integracion-turismo-2026-uleam`
   - Documentación: `SOLICITUD_INTEGRACION_EQUIPO_B.md`

---

## 📞 Contacto

**Equipo A - Recomendaciones Turísticas ULEAM**

- Punto de contacto: `[nombre]`
- Email: `[email]`
- Teléfono: `[teléfono]`
- URL ngrok: `https://abc123def45.ngrok.io`
- Endpoint de webhooks: `/webhooks/partner`

---

## ⚠️ Notas Importantes

1. **Nunca compartir JWT_SECRET_KEY públicamente**
2. **INTEGRACION_SECRET_KEY es compartida con Equipo B - protegerla**
3. **ngrok URL es temporal - regenerada cada reinicio**
4. **Cada 25 de enero actualizar referencias de fecha**
5. **INTEGRACION_TIMEOUT debe ser >= 10 segundos**

---

## 🔍 Verificación Manual

```bash
# Verificar que auth service está corriendo
curl http://localhost:8001/health

# Verificar que REST API está corriendo
curl http://localhost:8000/docs

# Verificar que payment service está corriendo
curl http://localhost:8002/health

# Verificar endpoint de webhooks
curl http://localhost:8000/webhooks/test
```

---

**Última actualización:** 25 de enero de 2026, 16:45 UTC
