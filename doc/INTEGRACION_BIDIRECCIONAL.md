# 🤝 INTEGRACIÓN BIDIRECCIONAL: RESERVAS & RECOMENDACIONES

**Fecha:** 25 de Enero 2026  
**Proyecto:** Recomendaciones Turísticas ULEAM ↔ Sistema del Otro Equipo  
**Objetivo:** Comunicación automática de reservas y recomendaciones entre sistemas

---

## 📊 Arquitectura General

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  EQUIPO A: Recomendaciones Turísticas ULEAM                    │
│  ─────────────────────────────────────────                     │
│  Backend: Python/FastAPI (Puerto 8000)                         │
│  ngrok: https://equipo-a.ngrok.io                              │
│                                                                  │
│  Expone: POST /api/reservas                                    │
│  Consume: POST https://equipo-b.ngrok.io/recomendaciones       │
│                                                                  │
└─────────────────────┬──────────────────────────────────────────┘
                      │
                      │ HTTP + HMAC-SHA256
                      │ JSON
                      │
┌─────────────────────┴──────────────────────────────────────────┐
│                                                                  │
│  EQUIPO B: Sistema del Otro Equipo                             │
│  ──────────────────────────────────                            │
│  Backend: [Python/Node/Java] (Puerto ???)                      │
│  ngrok: https://equipo-b.ngrok.io                              │
│                                                                  │
│  Expone: POST /api/recomendaciones                             │
│  Consume: POST https://equipo-a.ngrok.io/reservas              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Flujo de Datos:
  Equipo A confirma reserva → envía a Equipo B → Equipo B crea recomendación
  Equipo B confirma recomendación → envía a Equipo A → Equipo A crea reserva
```

---

## 🔑 Seguridad: HMAC-SHA256

**Clave Compartida (Acordada entre Equipos):**

```
Clave: "integracion-turismo-2026-uleam"
Algoritmo: HMAC-SHA256
```

**¿Por qué?** Asegura que solo sistemas autorizados puedan comunicarse.

---

## 🛠️ SETUP INICIAL - AMBOS EQUIPOS

### 1. Instalar ngrok

```bash
# Descargar desde https://ngrok.com/download
# O con chocolatey:
choco install ngrok

# Verificar
ngrok --version
```

### 2. Crear Cuenta ngrok

- Ir a https://ngrok.com
- Crear cuenta (email + contraseña)
- Copiar el token de autenticación

### 3. Autenticar Localmente

```bash
ngrok config add-authtoken TU_TOKEN_AQUI
```

### 4. Exponer API Local

```bash
# Reemplaza 8000 con el puerto de tu API
ngrok http 8000

# Salida esperada:
# Forwarding    https://abc123xyz.ngrok.io -> http://localhost:8000
```

**Guardar esa URL, la necesitarán para el siguiente paso**

---

## 📋 TAREAS POR EQUIPO

---

# EQUIPO A: Recomendaciones Turísticas ULEAM

## 📥 LADO QUE RECIBE: Endpoint `/api/reservas`

### Estructura de Solicitud (recibida de Equipo B)

```json
POST https://equipo-a.ngrok.io/api/reservas
Content-Type: application/json

{
  "user_id": "usuario456",
  "recomendacion": {
    "id": "rec789",
    "tour_recomendado": "Volcán Cotopaxi",
    "descripcion": "Similar a tu tour anterior",
    "precio": 120.00,
    "destino": "Latacunga"
  },
  "timestamp": "2026-01-25T15:35:00Z",
  "firma": "abc123def456..."
}
```

### Implementación en Python

```python
from fastapi import FastAPI, Request, HTTPException
import hmac
import hashlib
import json
from datetime import datetime

app = FastAPI()

CLAVE_SECRETA = "integracion-turismo-2026-uleam"

def verificar_firma(payload_dict, firma_recibida):
    """Verifica que la firma HMAC sea válida"""
    mensaje = json.dumps(payload_dict, sort_keys=True)
    firma_esperada = hmac.new(
        CLAVE_SECRETA.encode(),
        mensaje.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(firma_esperada, firma_recibida)


@app.post("/api/reservas")
async def recibir_reserva_desde_otro_equipo(request: Request):
    """
    Recibe reservas confirmadas del Equipo B
    Debe verificar firma y crear reserva en BD
    """
    try:
        payload = await request.json()

        # Extraer firma del payload
        firma_recibida = payload.pop("firma", None)

        if not firma_recibida:
            return {"error": "Firma no proporcionada"}, 400

        # Verificar firma HMAC
        if not verificar_firma(payload, firma_recibida):
            print("❌ [/api/reservas] Firma inválida recibida")
            return {"error": "Firma inválida"}, 401

        # Si llegamos aquí, la firma es válida
        print("✅ [/api/reservas] Firma válida")
        print(f"📦 Datos recibidos: {payload}")

        user_id = payload.get("user_id")
        recomendacion = payload.get("recomendacion", {})

        # TODO: Crear reserva en tu BD
        # ejemplo_bd.reservas.insert_one({
        #     "user_id": user_id,
        #     "tipo": "recomendacion_externa",
        #     "datos": recomendacion,
        #     "fecha_creacion": datetime.now()
        # })

        return {
            "status": "ok",
            "message": "Reserva recibida y procesada",
            "user_id": user_id
        }, 200

    except json.JSONDecodeError:
        return {"error": "JSON inválido"}, 400
    except Exception as e:
        print(f"❌ Error en /api/reservas: {str(e)}")
        return {"error": str(e)}, 500
```

---

## 📤 LADO QUE ENVÍA: Consumir `/api/recomendaciones`

### Estructura de Solicitud (enviada a Equipo B)

```json
POST https://equipo-b.ngrok.io/api/recomendaciones
Content-Type: application/json

{
  "user_id": "usuario123",
  "tour_confirmado": {
    "id": "tour456",
    "nombre": "Tour a Baños",
    "precio": 150.00,
    "destino": "Baños de Agua Santa",
    "descripcion": "Aventura en cascadas"
  },
  "timestamp": "2026-01-25T15:30:00Z",
  "firma": "xyz789abc..."
}
```

### Implementación en Python

```python
import requests
import hmac
import hashlib
import json
from datetime import datetime

CLAVE_SECRETA = "integracion-turismo-2026-uleam"
URL_EQUIPO_B_RECOMENDACIONES = "https://equipo-b.ngrok.io/api/recomendaciones"


def generar_firma(payload_dict):
    """Genera firma HMAC-SHA256 para el payload"""
    mensaje = json.dumps(payload_dict, sort_keys=True)
    firma = hmac.new(
        CLAVE_SECRETA.encode(),
        mensaje.encode(),
        hashlib.sha256
    ).hexdigest()
    return firma


async def enviar_reserva_confirmada_a_equipo_b(user_id, tour_data):
    """
    Cuando se confirma una reserva, enviamos a Equipo B
    para que cree una recomendación
    """

    payload = {
        "user_id": user_id,
        "tour_confirmado": {
            "id": tour_data.get("id"),
            "nombre": tour_data.get("nombre"),
            "precio": tour_data.get("precio"),
            "destino": tour_data.get("destino"),
            "descripcion": tour_data.get("descripcion")
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

    # Generar firma
    firma = generar_firma(payload)
    payload["firma"] = firma

    try:
        print(f"📤 [Webhooks] Enviando reserva a Equipo B: {URL_EQUIPO_B_RECOMENDACIONES}")
        print(f"   Payload: {json.dumps(payload, indent=2)}")

        response = requests.post(
            URL_EQUIPO_B_RECOMENDACIONES,
            json=payload,
            timeout=10,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 200:
            print(f"✅ [Webhooks] Reserva enviada exitosamente")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ [Webhooks] Error al enviar reserva")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ [Webhooks] Excepción al enviar reserva: {str(e)}")
        return False


# Usar cuando se confirma una reserva:
# await enviar_reserva_confirmada_a_equipo_b(
#     user_id="usuario123",
#     tour_data={
#         "id": "tour456",
#         "nombre": "Tour a Baños",
#         "precio": 150.00,
#         "destino": "Baños de Agua Santa"
#     }
# )
```

---

# EQUIPO B: Sistema del Otro Equipo

## 📥 LADO QUE RECIBE: Endpoint `/api/recomendaciones`

### Estructura de Solicitud (recibida de Equipo A)

```json
POST https://equipo-b.ngrok.io/api/recomendaciones
Content-Type: application/json

{
  "user_id": "usuario123",
  "tour_confirmado": {
    "id": "tour456",
    "nombre": "Tour a Baños",
    "precio": 150.00,
    "destino": "Baños de Agua Santa",
    "descripcion": "Aventura en cascadas"
  },
  "timestamp": "2026-01-25T15:30:00Z",
  "firma": "xyz789abc..."
}
```

### Implementación en Python

```python
from fastapi import FastAPI, Request, HTTPException
import hmac
import hashlib
import json
from datetime import datetime

app = FastAPI()

CLAVE_SECRETA = "integracion-turismo-2026-uleam"

def verificar_firma(payload_dict, firma_recibida):
    """Verifica que la firma HMAC sea válida"""
    mensaje = json.dumps(payload_dict, sort_keys=True)
    firma_esperada = hmac.new(
        CLAVE_SECRETA.encode(),
        mensaje.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(firma_esperada, firma_recibida)


@app.post("/api/recomendaciones")
async def recibir_recomendacion_desde_equipo_a(request: Request):
    """
    Recibe reservas confirmadas de Equipo A
    Debe crear una recomendación personalizada en su sistema
    """
    try:
        payload = await request.json()

        # Extraer firma del payload
        firma_recibida = payload.pop("firma", None)

        if not firma_recibida:
            return {"error": "Firma no proporcionada"}, 400

        # Verificar firma HMAC
        if not verificar_firma(payload, firma_recibida):
            print("❌ [/api/recomendaciones] Firma inválida recibida")
            return {"error": "Firma inválida"}, 401

        # Si llegamos aquí, la firma es válida
        print("✅ [/api/recomendaciones] Firma válida")
        print(f"📦 Datos recibidos: {payload}")

        user_id = payload.get("user_id")
        tour_confirmado = payload.get("tour_confirmado", {})

        # TODO: Crear recomendación en tu BD
        # recomendacion = {
        #     "user_id": user_id,
        #     "tour_id": tour_confirmado.get("id"),
        #     "tour_nombre": tour_confirmado.get("nombre"),
        #     "razon": "Similar a tu tour confirmado",
        #     "tipo": "recomendacion_automatica",
        #     "fecha_creacion": datetime.now()
        # }
        # bd.recomendaciones.insert_one(recomendacion)

        return {
            "status": "ok",
            "message": "Recomendación creada exitosamente",
            "user_id": user_id,
            "tour_recomendado": tour_confirmado.get("nombre")
        }, 200

    except json.JSONDecodeError:
        return {"error": "JSON inválido"}, 400
    except Exception as e:
        print(f"❌ Error en /api/recomendaciones: {str(e)}")
        return {"error": str(e)}, 500
```

---

## 📤 LADO QUE ENVÍA: Consumir `/api/reservas`

### Estructura de Solicitud (enviada a Equipo A)

```json
POST https://equipo-a.ngrok.io/api/reservas
Content-Type: application/json

{
  "user_id": "usuario456",
  "recomendacion": {
    "id": "rec789",
    "tour_recomendado": "Volcán Cotopaxi",
    "descripcion": "Similar a tu tour anterior",
    "precio": 120.00,
    "destino": "Latacunga"
  },
  "timestamp": "2026-01-25T15:35:00Z",
  "firma": "abc123def456..."
}
```

### Implementación en Python

```python
import requests
import hmac
import hashlib
import json
from datetime import datetime

CLAVE_SECRETA = "integracion-turismo-2026-uleam"
URL_EQUIPO_A_RESERVAS = "https://equipo-a.ngrok.io/api/reservas"


def generar_firma(payload_dict):
    """Genera firma HMAC-SHA256 para el payload"""
    mensaje = json.dumps(payload_dict, sort_keys=True)
    firma = hmac.new(
        CLAVE_SECRETA.encode(),
        mensaje.encode(),
        hashlib.sha256
    ).hexdigest()
    return firma


async def enviar_recomendacion_aprobada_a_equipo_a(user_id, recomendacion_data):
    """
    Cuando se aprueba una recomendación, enviamos a Equipo A
    para que cree una reserva
    """

    payload = {
        "user_id": user_id,
        "recomendacion": {
            "id": recomendacion_data.get("id"),
            "tour_recomendado": recomendacion_data.get("nombre"),
            "descripcion": recomendacion_data.get("descripcion"),
            "precio": recomendacion_data.get("precio"),
            "destino": recomendacion_data.get("destino")
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

    # Generar firma
    firma = generar_firma(payload)
    payload["firma"] = firma

    try:
        print(f"📤 [Webhooks] Enviando recomendación a Equipo A: {URL_EQUIPO_A_RESERVAS}")
        print(f"   Payload: {json.dumps(payload, indent=2)}")

        response = requests.post(
            URL_EQUIPO_A_RESERVAS,
            json=payload,
            timeout=10,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 200:
            print(f"✅ [Webhooks] Recomendación enviada exitosamente")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ [Webhooks] Error al enviar recomendación")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ [Webhooks] Excepción al enviar recomendación: {str(e)}")
        return False


# Usar cuando se aprueba una recomendación:
# await enviar_recomendacion_aprobada_a_equipo_a(
#     user_id="usuario456",
#     recomendacion_data={
#         "id": "rec789",
#         "nombre": "Volcán Cotopaxi",
#         "descripcion": "Similar a tu tour anterior",
#         "precio": 120.00,
#         "destino": "Latacunga"
#     }
# )
```

---

## 🧪 TESTING - AMBOS EQUIPOS

### Test 1: Verificar Endpoint Local (SIN ngrok)

**Equipo A:**

```bash
curl -X POST http://localhost:8000/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test123",
    "recomendacion": {"id": "r1", "tour_recomendado": "Test"},
    "timestamp": "2026-01-25T15:00:00Z",
    "firma": "test"
  }'
```

**Equipo B:**

```bash
curl -X POST http://localhost:5000/api/recomendaciones \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test456",
    "tour_confirmado": {"id": "t1", "nombre": "Test Tour"},
    "timestamp": "2026-01-25T15:00:00Z",
    "firma": "test"
  }'
```

**Esperado:** Respuesta 401 (firma inválida es esperado en tests)

---

### Test 2: Script Python con Firma Válida (Equipo A → Equipo B)

**Archivo: `test_webhook_a_to_b.py`**

```python
import requests
import hmac
import hashlib
import json
from datetime import datetime

CLAVE_SECRETA = "integracion-turismo-2026-uleam"
URL_EQUIPO_B = "https://REEMPLAZAR_CON_URL_NGROK_B.ngrok.io/api/recomendaciones"

def generar_firma(payload_dict):
    mensaje = json.dumps(payload_dict, sort_keys=True)
    return hmac.new(
        CLAVE_SECRETA.encode(),
        mensaje.encode(),
        hashlib.sha256
    ).hexdigest()

payload = {
    "user_id": "usuario_test_123",
    "tour_confirmado": {
        "id": "tour_test_456",
        "nombre": "Tour Test - Baños",
        "precio": 150.00,
        "destino": "Baños de Agua Santa",
        "descripcion": "Tour de prueba"
    },
    "timestamp": datetime.utcnow().isoformat() + "Z"
}

firma = generar_firma(payload)
payload["firma"] = firma

print(f"📤 Enviando a: {URL_EQUIPO_B}")
print(f"📦 Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(URL_EQUIPO_B, json=payload, timeout=10)
    print(f"\n✅ Status: {response.status_code}")
    print(f"📥 Response: {response.json()}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
```

**Ejecutar:**

```bash
# Reemplazar URL_EQUIPO_B con la URL real de ngrok
python test_webhook_a_to_b.py
```

---

### Test 3: Script Python con Firma Válida (Equipo B → Equipo A)

**Archivo: `test_webhook_b_to_a.py`**

```python
import requests
import hmac
import hashlib
import json
from datetime import datetime

CLAVE_SECRETA = "integracion-turismo-2026-uleam"
URL_EQUIPO_A = "https://REEMPLAZAR_CON_URL_NGROK_A.ngrok.io/api/reservas"

def generar_firma(payload_dict):
    mensaje = json.dumps(payload_dict, sort_keys=True)
    return hmac.new(
        CLAVE_SECRETA.encode(),
        mensaje.encode(),
        hashlib.sha256
    ).hexdigest()

payload = {
    "user_id": "usuario_test_456",
    "recomendacion": {
        "id": "rec_test_789",
        "tour_recomendado": "Volcán Cotopaxi Test",
        "descripcion": "Tour de prueba desde otro equipo",
        "precio": 120.00,
        "destino": "Latacunga"
    },
    "timestamp": datetime.utcnow().isoformat() + "Z"
}

firma = generar_firma(payload)
payload["firma"] = firma

print(f"📤 Enviando a: {URL_EQUIPO_A}")
print(f"📦 Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(URL_EQUIPO_A, json=payload, timeout=10)
    print(f"\n✅ Status: {response.status_code}")
    print(f"📥 Response: {response.json()}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
```

**Ejecutar:**

```bash
# Reemplazar URL_EQUIPO_A con la URL real de ngrok
python test_webhook_b_to_a.py
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Ambos Equipos:

- [ ] ngrok instalado y autenticado
- [ ] API local corriendo en un puerto
- [ ] ngrok exponiendo la API: `ngrok http PORT`
- [ ] URL de ngrok compartida con el otro equipo
- [ ] Clave secreta acordada: `"integracion-turismo-2026-uleam"`

### Equipo A (Recomendaciones ULEAM):

- [ ] Endpoint `/api/reservas` implementado (recibe de B)
- [ ] Función `generar_firma()` implementada
- [ ] Función `enviar_reserva_confirmada_a_equipo_b()` implementada
- [ ] Test local con curl funcionando
- [ ] Test con Python script funcionando
- [ ] Logs/debugging activados
- [ ] BD lista para guardar recomendaciones recibidas

### Equipo B (Sistema del otro equipo):

- [ ] Endpoint `/api/recomendaciones` implementado (recibe de A)
- [ ] Función `generar_firma()` implementada
- [ ] Función `enviar_recomendacion_aprobada_a_equipo_a()` implementada
- [ ] Test local con curl funcionando
- [ ] Test con Python script funcionando
- [ ] Logs/debugging activados
- [ ] BD lista para guardar reservas recibidas

---

## 📞 INFORMACIÓN A INTERCAMBIAR

### Cada Equipo Debe Compartir:

```
┌─ EQUIPO A ─────────────────────────────────┐
│ URL ngrok:         https://abc123.ngrok.io │
│ Puerto local:      8000                    │
│ Endpoint expone:   /api/reservas           │
│ Endpoint consume:  /api/recomendaciones    │
│ Lenguaje backend:  Python/FastAPI          │
│ Contacto:          email@ejemplo.com       │
│ BD:                MongoDB (sí/no)         │
└────────────────────────────────────────────┘

┌─ EQUIPO B ─────────────────────────────────┐
│ URL ngrok:         https://xyz789.ngrok.io │
│ Puerto local:      5000                    │
│ Endpoint expone:   /api/recomendaciones    │
│ Endpoint consume:  /api/reservas           │
│ Lenguaje backend:  [Python/Node/Java]      │
│ Contacto:          email@ejemplo.com       │
│ BD:                [sí/no]                 │
└────────────────────────────────────────────┘
```

---

## 🔄 FLUJO COMPLETO DE INTEGRACIÓN

### Escenario 1: Usuario confirma reserva en Equipo A

```
1. Usuario hace click en "Confirmar Tour" en frontend Equipo A
   ↓
2. Frontend llama: POST /api/reservas/confirmar {tour_id, user_id}
   ↓
3. Backend Equipo A valida y crea reserva en BD
   ↓
4. Backend genera firma HMAC del tour confirmado
   ↓
5. Backend POST a: https://equipo-b.ngrok.io/api/recomendaciones
   {
     "user_id": "...",
     "tour_confirmado": {...},
     "firma": "..."
   }
   ↓
6. Equipo B recibe solicitud
   ↓
7. Equipo B verifica firma (¿es válida?)
   ├─ NO: Responde 401 → Equipo A registra error
   └─ SÍ: Continúa...
   ↓
8. Equipo B crea recomendación en su BD
   ↓
9. Equipo B responde 200 OK
   ↓
10. Equipo A registra que webhook fue exitoso
    ↓
11. Usuario en Equipo B recibe notificación de nueva recomendación ✅
```

### Escenario 2: Recomendación aprobada en Equipo B

```
1. Usuario en Equipo B aprueba una recomendación
   ↓
2. Backend Equipo B valida y actualiza status
   ↓
3. Backend genera firma HMAC de la recomendación
   ↓
4. Backend POST a: https://equipo-a.ngrok.io/api/reservas
   {
     "user_id": "...",
     "recomendacion": {...},
     "firma": "..."
   }
   ↓
5. Equipo A recibe solicitud
   ↓
6. Equipo A verifica firma (¿es válida?)
   ├─ NO: Responde 401 → Equipo B registra error
   └─ SÍ: Continúa...
   ↓
7. Equipo A crea reserva en su BD
   ↓
8. Equipo A responde 200 OK
   ↓
9. Equipo B registra que webhook fue exitoso
    ↓
10. Usuario en Equipo A recibe confirmación de nueva reserva ✅
```

---

## 🚨 Manejo de Errores

### Si la firma no es válida:

```python
# Equipo A/B responde:
HTTP 401 Unauthorized
{
  "error": "Firma inválida"
}

# Equipo B/A:
# - Registra en logs
# - Intenta reintentar después de 5 minutos
# - Alerta al admin después de 3 intentos fallidos
```

### Si el servidor no responde:

```python
# El equipo que envía:
try:
    response = requests.post(url, json=payload, timeout=10)
except requests.exceptions.Timeout:
    print("⏱️ Timeout: Servidor no responde en 10 segundos")
    # Reintentará después
except requests.exceptions.ConnectionError:
    print("❌ Connection Error: No se puede conectar")
    # Reintentará después
```

---

## 📊 Debugging y Logs

### Equipo A debe registrar:

```
✅ [/api/reservas] Firma válida recibida de Equipo B
❌ [/api/reservas] Firma inválida recibida
✅ [Webhooks] Reserva confirmada enviada a Equipo B
❌ [Webhooks] Error al enviar reserva a Equipo B
```

### Equipo B debe registrar:

```
✅ [/api/recomendaciones] Firma válida recibida de Equipo A
❌ [/api/recomendaciones] Firma inválida recibida
✅ [Webhooks] Recomendación aprobada enviada a Equipo A
❌ [Webhooks] Error al enviar recomendación a Equipo A
```

---

## 🎯 Pasos Finales

1. **Cada equipo comparte** su información (checklist anterior)
2. **Cada equipo implementa** sus endpoints y funciones
3. **Cada equipo prueba** localmente (sin ngrok)
4. **Cada equipo expone** con ngrok
5. **Cada equipo** intercambia URL de ngrok
6. **Cada equipo prueba** scripts Python con firma válida
7. **Ambos equipos verifican** que reciben datos correctamente
8. **Ambos equipos comprueban** que BD tiene datos
9. ✅ **INTEGRACIÓN EXITOSA**

---

## 📝 Notas Importantes

- **URL de ngrok cambia cada vez que reinician** → Compartir URL nueva si cae ngrok
- **Clave secreta debe ser igual en ambos lados** → Verificar caracteres especiales
- **Timestamp debe estar en ISO format** → `2026-01-25T15:30:00Z`
- **HMAC se genera sobre el payload SIN firma** → Agregar firma después
- **Ambos endpoints deben responder 200 OK** → Para confirmar recepción
- **Revisar logs detallados** → Para debugging

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si enviamos firmas distintas?**  
R: Verifica que ambos usen la misma clave secreta exacta

**P: ¿Cada cuánto reintentar si falla?**  
R: Sugerencia: 5 minutos, máximo 3 intentos

**P: ¿Necesitan encriptación TLS?**  
R: ngrok usa HTTPS automáticamente (seguro)

**P: ¿Pueden almacenar en BD o solo testing?**  
R: Pueden almacenar, recomendado para auditoría

**P: ¿Qué pasa si Equipo A no responde?**  
R: Equipo B reintenta, luego alerta al admin

---

**Documento válido para ambos equipos**  
**Fecha:** 25 de Enero 2026  
**Versión:** 1.0
