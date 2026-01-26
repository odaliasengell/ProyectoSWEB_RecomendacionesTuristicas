# ⚡ GUÍA RÁPIDA - EQUIPO A - INTEGRACIÓN LISTA

**Fecha:** 25 de Enero 2026  
**Equipo:** A - Recomendaciones Turísticas ULEAM  
**Estado:** ✅ **LISTO PARA PRUEBAS**

---

## 🎯 RESUMEN EJECUTIVO

Tu sistema **Equipo A (Recomendaciones Turísticas ULEAM)** ya está 100% listo para la integración bidireccional con Equipo B.

### ✅ Lo que ya está implementado:

- ✅ Endpoint `/api/reservas` - Para RECIBIR recomendaciones de Equipo B
- ✅ Endpoint `/api/enviar-reserva-confirmada` - Para ENVIAR reservas a Equipo B
- ✅ Seguridad HMAC-SHA256 implementada
- ✅ Scripts de prueba locales
- ✅ Scripts de prueba bidireccionales
- ✅ Documentación completa

---

## 🚀 PASOS PARA ACTIVAR INTEGRACIÓN

### Paso 1: Instalar ngrok (⏱️ 5 minutos)

```bash
# Opción 1: Descargar desde https://ngrok.com/download
# Opción 2: Con Chocolatey (Windows)
choco install ngrok

# Verificar instalación
ngrok --version
```

### Paso 2: Crear cuenta ngrok (⏱️ 2 minutos)

1. Ir a https://ngrok.com
2. Click en "Sign Up"
3. Crear cuenta (email + contraseña)
4. Verificar email
5. Copiar el **authtoken**

### Paso 3: Autenticar ngrok (⏱️ 1 minuto)

```bash
ngrok config add-authtoken TU_TOKEN_AQUI
```

### Paso 4: Iniciar tu API (⏱️ 1 minuto)

En la carpeta `backend/rest-api/`:

```bash
# Opción 1: Directamente
python main.py

# Opción 2: Con PowerShell
.\run.ps1
```

Esperar hasta ver:

```
✅ Conectado a MongoDB - Base de datos: recomendaciones_db
Uvicorn running on http://127.0.0.1:8000
```

### Paso 5: Exponer con ngrok (⏱️ 1 minuto)

En **otra terminal**:

```bash
ngrok http 8000
```

Verás algo como:

```
Forwarding    https://abc123xyz.ngrok.io -> http://localhost:8000
```

**COPIAR ESA URL** - La necesitarás después 👆

### Paso 6: Ejecutar tests locales (⏱️ 5 minutos)

En **otra terminal** (en `backend/rest-api/`):

```bash
python test_webhook_local.py
```

Deberías ver:

```
✅ TEST 1: PASÓ ✓
✅ TEST 2: PASÓ ✓
✅ TEST 3: PASÓ ✓
✅ TEST 4: PASÓ ✓
✅ TEST 5: PASÓ ✓

Resultados: 5/5 tests pasados
```

---

## 📋 INFORMACIÓN PARA COMPARTIR CON EQUIPO B

Una vez que tengas activo ngrok, **COPIA ESTA INFORMACIÓN** y **ENVÍA A EQUIPO B**:

```
┌─ EQUIPO A: INFORMACIÓN DE INTEGRACIÓN ──────────────┐
│                                                       │
│ 🌐 URL ngrok:                                        │
│    https://[COPIA_TU_URL].ngrok.io                  │
│                                                       │
│ 🖥️  Puerto local:              8000                 │
│                                                       │
│ 📥 Endpoint que RECIBE:        /api/reservas        │
│    (Ustedes envían aquí cuando confirman            │
│     una recomendación)                              │
│                                                       │
│ 📤 Endpoint que ENVÍA:         /api/recomendaciones│
│    (Nosotros enviamos aquí cuando confirmamos       │
│     una reserva)                                    │
│                                                       │
│ 🔧 Lenguaje backend:           Python/FastAPI      │
│ 💾 Base de datos:              MongoDB              │
│                                                       │
│ 🔐 Seguridad:                  HMAC-SHA256          │
│ 🔑 Clave compartida:           integracion-turismo..│
│                                2026-uleam           │
│                                                       │
│ ⏰ Formato timestamp:           ISO 8601 con Z      │
│    Ejemplo: 2026-01-25T15:30:00Z                   │
│                                                       │
│ 👤 Contacto técnico:           [TU EMAIL/TELÉFONO]  │
│                                                       │
└───────────────────────────────────────────────────────┘
```

**SOLICITAR A EQUIPO B** que compartan información similar (ver documento `SOLICITUD_INTEGRACION_EQUIPO_B.md`)

---

## 🔄 PRUEBAS BIDIRECCIONALES

Cuando recibas la URL de ngrok de Equipo B:

### Paso 1: Actualizar URL en script de prueba

Editar archivo: `backend/rest-api/test_webhook_bidireccional.py`

Buscar línea ~18:

```python
URL_EQUIPO_B = "https://REEMPLAZAR_CON_URL_NGROK_B.ngrok.io"
```

Reemplazar con la verdadera URL:

```python
URL_EQUIPO_B = "https://[URL_QUE_RECIBISTE].ngrok.io"
```

### Paso 2: Ejecutar pruebas bidireccionales

```bash
python test_webhook_bidireccional.py
```

Deberías ver:

```
✅ VERIFICACIÓN PREVIA
  ✓ URL de Equipo B configurada
  ✓ Servidor local activo
  ✓ Clave secreta

✅ TEST: ENVIAR RESERVA CONFIRMADA A EQUIPO B
  Paso 1: Preparando payload
  Paso 2: Generando firma HMAC-SHA256
  Paso 3: Enviando POST...

✅ Equipo B aceptó la reserva
```

---

## 📊 FLUJO COMPLETO

### Escenario 1: Tú confirmas una reserva

```
1. Usuario en Equipo A confirma reserva en app
   ↓
2. Tu backend crea reserva en BD
   ↓
3. Tu backend llama a:
   POST http://localhost:8000/api/enviar-reserva-confirmada
   {
     "user_id": "usuario123",
     "tour_id": "tour456",
     ...
   }
   ↓
4. Tu backend genera firma HMAC
   ↓
5. Tu backend envía POST a ngrok Equipo B:
   https://equipo-b.ngrok.io/api/recomendaciones
   ↓
6. Equipo B recibe y verifica firma
   ↓
7. Equipo B crea recomendación en su BD
   ↓
8. Equipo B responde: 200 OK ✅
   ↓
9. Usuario en Equipo B ve nueva recomendación 🎉
```

### Escenario 2: Equipo B confirma una recomendación

```
1. Equipo B genera firma HMAC de recomendación
   ↓
2. Equipo B envía POST a tu ngrok:
   https://tu-url.ngrok.io/api/reservas
   {
     "user_id": "usuario456",
     "recomendacion": {...},
     "firma": "..."
   }
   ↓
3. Tu backend recibe en /api/reservas
   ↓
4. Tu backend verifica firma HMAC
   ↓
5. Si firma OK: crea reserva en BD
   ↓
6. Responde: 200 OK ✅
   ↓
7. Equipo B registra éxito
   ↓
8. Usuario en Equipo A ve nueva reserva 🎉
```

---

## 🔧 ENDPOINTS DISPONIBLES

### 1. Verificar Status

```bash
curl http://localhost:8000/api/integracion/status

# Respuesta:
{
  "equipo": "Equipo A - Recomendaciones Turísticas ULEAM",
  "integracion_activa": true,
  "endpoints": {...},
  "seguridad": {...}
}
```

### 2. Recibir Reserva (RECIBE de Equipo B)

```bash
curl -X POST http://localhost:8000/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 3. Enviar Reserva (ENVÍA a Equipo B)

```bash
curl -X POST "http://localhost:8000/api/enviar-reserva-confirmada?user_id=usuario123&tour_id=tour456&tour_nombre=Tour%20a%20Ba%C3%B1os&tour_precio=150&tour_destino=Ba%C3%B1os&tour_descripcion=Aventura"

# Mejor: usar Python script
python test_webhook_bidireccional.py
```

---

## 🐛 DEBUGGING

### Si algo falla...

#### "Connection refused" / "No se puede conectar"

```bash
# Verificar que servidor está corriendo
curl http://localhost:8000/api/integracion/status

# Si no funciona, reiniciar:
# Terminal 1: python main.py
# Terminal 2: ngrok http 8000
```

#### "Firma inválida" (401)

```
Causas posibles:
1. Clave secreta diferente en ambos lados
2. Timestamp con formato incorrecto
3. Payload con espacios/formato incorrecto
4. ngrok URL incorrecta

Solución:
- Verificar que ambos usan: integracion-turismo-2026-uleam
- Verificar timestamp: 2026-01-25T15:30:00Z (con Z)
- Generar payload con json.dumps(..., sort_keys=True)
```

#### "Timeout" / "No responde"

```
Causas posibles:
1. Equipo B está apagado/caído
2. URL de ngrok incorrecta
3. ngrok se reinició (URL cambió)

Solución:
- Verificar que Equipo B tiene ngrok activo
- Pedirles nueva URL de ngrok
- Actualizar en test_webhook_bidireccional.py
```

---

## 📝 CHECKLIST - ANTES DE DECIR "LISTO"

- [ ] ✅ ngrok instalado y funcionando
- [ ] ✅ API corriendo en puerto 8000
- [ ] ✅ ngrok exponiendo API: `ngrok http 8000`
- [ ] ✅ Copié URL de ngrok
- [ ] ✅ Ejecuté test_webhook_local.py (5/5 tests pasados)
- [ ] ✅ Compartí información con Equipo B
- [ ] ✅ Recibí URL de ngrok de Equipo B
- [ ] ✅ Actualicé URL_EQUIPO_B en test_webhook_bidireccional.py
- [ ] ✅ Ejecuté test_webhook_bidireccional.py (todos los tests pasaron)
- [ ] ✅ Ambas BD tienen datos de integración

---

## 📞 SOPORTE

Si algo no funciona:

1. **Revisar logs** en la terminal donde corre `main.py`
2. **Ejecutar test_webhook_local.py** para aislamiento
3. **Verificar URLs** de ngrok
4. **Contactar a Equipo B** si es problema de conexión

---

## 🎉 CUANDO TODO ESTÁ LISTO

Podrás:

✅ Confirmar reservas en tu app y Equipo B recibe automáticamente  
✅ Equipo B confirma recomendaciones y tú las recibes  
✅ Ambos sistemas se comunican en tiempo real  
✅ Datos se guardan en ambas BD  
✅ Todo seguro con HMAC-SHA256

---

**Documento:** Guía Rápida Equipo A  
**Fecha:** 25 de Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ LISTO

---

_¡Ahora sí, a solicitar la información a Equipo B!_ 🚀
