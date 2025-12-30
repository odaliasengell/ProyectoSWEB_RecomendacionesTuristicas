# Guía Postman - Testing de Payment Service

## 📥 Importar a Postman

1. Abre Postman
2. Click en "Import"
3. Pega el contenido de esta colección
4. O crea manualmente los requests siguiendo esta guía

## 🔑 Variables de Postman (Recomendado)

Crea estas variables en Postman para mayor flexibilidad:

```
base_url:        http://localhost:8000
payment_service: http://localhost:8200
token:           <será llenado después de login>
reserva_id:      <será llenado después de crear reserva>
payment_id:      <será llenado después de procesar pago>
```

## 📝 Requests

### 1️⃣ LOGIN - Obtener Token JWT

```
Method: POST
URL: {{base_url}}/api/auth/login

Headers:
  Content-Type: application/json

Body (JSON):
{
  "username": "admin",
  "password": "admin123"
}

Test Script (llenar variable token):
pm.environment.set("token", pm.response.json().access_token);
pm.environment.set("user_id", pm.response.json().user_id);
```

**Respuesta Esperada:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user_id": "507f1f77bcf86cd799439011"
}
```

---

### 2️⃣ CREAR RESERVA - (Opcional, para testing)

```
Method: POST
URL: {{base_url}}/api/reservas

Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "tour_id": "507f1f77bcf86cd799439999",
  "fecha_reserva": "2024-01-20",
  "cantidad_personas": 2,
  "estado": "pendiente"
}

Test Script:
pm.environment.set("reserva_id", pm.response.json()._id || pm.response.json().id);
```

---

### 3️⃣ PROCESAR PAGO DE RESERVA ⭐

```
Method: POST
URL: {{base_url}}/api/pagos/reserva

Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "reserva_id": "507f1f77bcf86cd799439011",
  "monto": 150.00,
  "descripcion": "Pago de reserva de tour"
}

Test Script:
pm.environment.set("payment_id", pm.response.json().payment_id);
```

**Respuesta Esperada:**

```json
{
  "status": "success",
  "message": "Pago procesado exitosamente",
  "payment_id": "pay_1234567890",
  "reserva_id": "507f1f77bcf86cd799439011",
  "monto": 150.0
}
```

---

### 4️⃣ PROCESAR PAGO DE TOUR

```
Method: POST
URL: {{base_url}}/api/pagos/tour

Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "tour_id": "507f1f77bcf86cd799439013",
  "cantidad_personas": 3,
  "precio_por_persona": 85.00
}
```

**Respuesta Esperada:**

```json
{
  "status": "success",
  "payment_id": "pay_9876543210",
  "monto_total": 255.0,
  "cantidad_personas": 3
}
```

---

### 5️⃣ OBTENER ESTADO DEL PAGO

```
Method: GET
URL: {{base_url}}/api/pagos/estado/{{payment_id}}

Headers:
  Authorization: Bearer {{token}}
```

**Respuesta Esperada:**

```json
{
  "status": "success",
  "payment_id": "pay_1234567890",
  "estado": "completado",
  "monto": 150.0,
  "fecha": "2024-01-09T10:30:00",
  "usuario": "admin"
}
```

---

### 6️⃣ PROCESAR REEMBOLSO

```
Method: POST
URL: {{base_url}}/api/pagos/reembolso

Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body (JSON):
{
  "payment_id": "{{payment_id}}",
  "razon": "Cliente solicitó cancelación"
}
```

**Respuesta Esperada:**

```json
{
  "status": "success",
  "refund_id": "ref_1234567890",
  "payment_id": "pay_1234567890",
  "monto_reembolsado": 150.0
}
```

---

## 🔍 Validaciones en Postman

### Status Code Tests

```javascript
// En la sección "Tests" de cada request:

// Verificar status 200
pm.test('Status code is 200', function () {
  pm.response.to.have.status(200);
});

// Verificar response es JSON
pm.test('Response is JSON', function () {
  pm.response.to.be.json;
});

// Verificar campo "status"
pm.test('Response has status field', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('status');
});
```

### Error Cases

```javascript
// Si status es error:
pm.test('Error response validation', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.status).to.equal('error');
  pm.expect(jsonData).to.have.property('message');
});
```

---

## 📊 Orden de Ejecución Recomendado

```
1. LOGIN
   ↓ (obtienes token)

2. CREAR RESERVA (opcional)
   ↓ (obtienes reserva_id)

3. PROCESAR PAGO DE RESERVA
   ↓ (obtienes payment_id)

4. OBTENER ESTADO DEL PAGO
   ↓ (verificas estado)

5. PROCESAR PAGO DE TOUR
   ↓ (prueba flujo alternativo)

6. PROCESAR REEMBOLSO
   ↓ (prueba reembolso del paso 3)
```

---

## 🚀 Crear Colección Automatizada

### Paso 1: New Collection

Click en "+" → "New Collection"
Nombre: "Payment Service Integration"

### Paso 2: Add Requests

Agrega los 6 requests anteriores

### Paso 3: Collection Runner

1. Click en "Run Collection"
2. Selecciona tu colección
3. Ejecuta todos los tests secuencialmente

### Paso 4: Environment Setup

```json
{
  "name": "Local Payment Dev",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:8000",
      "enabled": true
    },
    {
      "key": "payment_service",
      "value": "http://localhost:8200",
      "enabled": true
    },
    {
      "key": "token",
      "value": "",
      "enabled": true
    }
  ]
}
```

---

## ⚙️ Configuración Pre-request

En algunos requests, puedes agregar scripts Pre-request para automátizar:

```javascript
// Si necesitas timestamp:
pm.environment.set('timestamp', new Date().toISOString());

// Si necesitas ID aleatorio:
pm.environment.set('request_id', pm.variables.randomUUID());
```

---

## 📈 Flow de Testing Completo

```
INICIO
  ↓
[1] LOGIN
  ↓
¿Token obtenido?
  ├─ SÍ → [2] CREAR RESERVA
  │        ↓
  │        [3] PROCESAR PAGO
  │        ↓
  │        [4] OBTENER ESTADO
  │        ↓
  │        [5] PROCESAR TOUR
  │        ↓
  │        [6] REEMBOLSO
  │        ↓
  │        ✅ TESTS COMPLETOS
  │
  └─ NO → ❌ ERROR EN LOGIN
```

---

## 🐛 Debugging en Postman

### Visualizar Request Completo

1. Click en "Code" (arriba del Body)
2. Selecciona lenguaje (cURL, Python, etc.)
3. Copia y ejecuta en terminal

### Visualizar Response

1. Tab "Response"
2. Alterna entre "Pretty", "Raw", "Preview"

### Verificar Headers

1. Tab "Headers"
2. Verifica `Authorization: Bearer <TOKEN>`

### Console

Usa Ctrl+Alt+C (o Cmd+Alt+C en Mac) para ver logs

---

## 💡 Tips de Testing

1. **Guarda Variables:** Usa Test Scripts para guardar valores
2. **Reusa Datos:** Usa {{variable}} en URLs y Bodies
3. **Parallel Testing:** Ejecuta múltiples requests
4. **Mock Data:** Crea fixtures JSON
5. **Assertions:** Verifica cada respuesta

---

## ❌ Errores Comunes

| Error              | Causa               | Solución                  |
| ------------------ | ------------------- | ------------------------- |
| 401 Unauthorized   | Token expirado      | Vuelve a hacer login      |
| 400 Bad Request    | Datos inválidos     | Verifica JSON del Body    |
| 500 Server Error   | Error interno       | Revisa logs de REST API   |
| Connection refused | Servidor no activo  | Inicia REST API           |
| CORS error         | Origen no permitido | Ya configurado en main.py |

---

## 📚 Referencia Rápida de Endpoints

```
LOGIN
POST /api/auth/login

PAGOS
POST   /api/pagos/reserva
POST   /api/pagos/tour
GET    /api/pagos/estado/{id}
POST   /api/pagos/reembolso

Documentación:
http://localhost:8000/docs (Swagger UI)
http://localhost:8000/redoc (ReDoc)
```

---

**¡Listo para testear!** 🚀
