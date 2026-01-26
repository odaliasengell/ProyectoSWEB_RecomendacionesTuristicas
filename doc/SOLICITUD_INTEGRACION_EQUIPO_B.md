# 📋 SOLICITUD A EQUIPO B - INFORMACIÓN DE INTEGRACIÓN

**Fecha:** 25 de Enero 2026  
**De:** EQUIPO A (Recomendaciones Turísticas ULEAM)  
**Para:** EQUIPO B (Sistema del Otro Equipo)  
**Asunto:** Configuración de Integración Bidireccional

---

## 🤝 Solicitud de Integración

Estamos preparando la **integración bidireccional** entre nuestros sistemas para automatizar el intercambio de **reservas y recomendaciones**.

Por favor, **completa la información a continuación** y comparte con nosotros:

---

## 📝 INFORMACIÓN QUE PROPORCIONA EQUIPO A (Nosotros)

```
┌─ EQUIPO A: Recomendaciones Turísticas ULEAM ─────┐
│                                                   │
│ URL ngrok:                                        │
│   https://[TU_URL_NGROK].ngrok.io                │
│   ⏳ Obtener después de: ngrok http 8000         │
│                                                   │
│ Puerto local:              8000                  │
│ Endpoint que RECIBE:       /api/reservas         │
│ Endpoint que ENVÍA:        /api/recomendaciones  │
│                                                   │
│ Lenguaje backend:          Python/FastAPI        │
│ Base de datos:             MongoDB               │
│                                                   │
│ Algoritmo seguridad:       HMAC-SHA256           │
│ Clave compartida:          integracion-turismo..│
│                            2026-uleam            │
│                                                   │
│ Formato timestamp:         ISO 8601 con Z       │
│   Ejemplo: 2026-01-25T15:30:00Z                │
│                                                   │
│ Contacto técnico:          [TU EMAIL]           │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## 🔄 INFORMACIÓN QUE SOLICITA EQUIPO B (Ustedes)

Por favor, proporcionen la siguiente información:

```
┌─ EQUIPO B: Sistema del Otro Equipo ──────────────┐
│                                                   │
│ URL ngrok:                                        │
│   https://[SU_URL_NGROK].ngrok.io               │
│   (La URL que genera al ejecutar: ngrok http ...) │
│                                                   │
│ Puerto local:              _____                 │
│ Endpoint que EXPONE:       /api/recomendaciones  │
│ Endpoint que CONSUME:      /api/reservas         │
│                                                   │
│ Lenguaje backend:          [Python/Node/Java]    │
│ Base de datos:             [Sí/No] [Tipo]        │
│                                                   │
│ Verifican firmas HMAC:     [Sí/No]               │
│ Clave compartida:          integracion-turismo..│
│                            2026-uleam (OK?)      │
│                                                   │
│ Formato timestamp:         ISO 8601 / Otro       │
│   Ejemplo:                                        │
│                                                   │
│ Contacto técnico:          [EMAIL]               │
│ Teléfono (emergencia):     [TELÉFONO]            │
│                                                   │
│ ¿Ya tienen ngrok?          [Sí/No]               │
│ ¿Qué versionde Python?     [Versión]             │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST - Qué necesitamos de ustedes

- [ ] URL de ngrok activa (ej: https://abc123xyz.ngrok.io)
- [ ] Puerto local donde corre su API
- [ ] Nombre del endpoint donde EXPONEN /api/recomendaciones
- [ ] Nombre del endpoint donde CONSUMEN /api/reservas
- [ ] Lenguaje/framework del backend
- [ ] Si tienen base de datos y de qué tipo
- [ ] Confirmación que usarán clave secreta: `integracion-turismo-2026-uleam`
- [ ] Confirmación que usan HMAC-SHA256
- [ ] Formato de timestamp que usan
- [ ] Contacto técnico con teléfono

---

## 🔐 IMPORTANTE - SEGURIDAD

**Clave Secreta (Acordada entre ambos equipos):**

```
integracion-turismo-2026-uleam
```

✅ Esta clave DEBE ser **idéntica en ambos sistemas**

**Algoritmo:** HMAC-SHA256

**Cómo se usa:**

1. Se genera un hash del payload usando la clave secreta
2. El hash se incluye en la solicitud como parámetro `firma`
3. Al recibir, se verifica que el hash coincida
4. Si no coincide → Rechazar con error 401

---

## 📥 ¿Cómo reciben ustedes nuestras reservas?

Cuando Equipo A confirma una reserva, enviará:

```json
POST https://[SU_URL_NGROK]/api/recomendaciones
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

**Pasos para ustedes:**

1. Recibir solicitud POST en `/api/recomendaciones`
2. Extraer campo `firma`
3. Generar HMAC del resto del payload
4. Verificar que hashes coincidan
5. Si OK: crear recomendación en BD y responder 200
6. Si error: responder 401

---

## 📤 ¿Cómo enviamos nuestras recomendaciones?

Cuando ustedes confirmen una recomendación, enviarán a:

```json
POST https://[NUESTRA_URL_NGROK]/api/reservas
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

**Pasos para ustedes:**

1. Cuando se aprueba una recomendación
2. Generar payload con estructura anterior
3. Generar HMAC con clave secreta
4. Incluir firma en payload
5. POST a nuestro `/api/reservas`
6. Si respuesta es 200: registrar éxito
7. Si 401: reintentaré después, alertar al admin

---

## 🧪 PRUEBAS

### Prueba 1: Verificar que reciben correctamente

**Endpoint para testing:**

```bash
curl -X POST http://localhost:[PUERTO]/api/recomendaciones \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test123",
    "tour_confirmado": {"id": "t1", "nombre": "Test"},
    "timestamp": "2026-01-25T15:00:00Z",
    "firma": "test_firma_invalida"
  }'
```

**Esperado:** Respuesta 401 (firma inválida)

---

### Prueba 2: Con firma válida

Se proporcionará un script Python que genera la firma correcta cuando estén listos.

---

## 📞 PASOS SIGUIENTES

1. **Ustedes:** Llenan la información anterior y nos la envían
2. **Nosotros:** Validamos que sea correcta y configuramos nuestra URL
3. **Ustedes:** Activan ngrok: `ngrok http [PUERTO]`
4. **Nosotros:** Ejecutamos script de prueba
5. **Ambos:** Verificamos que datos llegan correctamente a BD
6. **✅ INTEGRACIÓN EXITOSA**

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Necesitamos tener ngrok?**  
R: Sí, es necesario para exponer su API de forma segura

**P: ¿Cada cuánto cambia la URL de ngrok?**  
R: La URL cambia cada vez que reinician ngrok (puerta gratuita). Si la URL se cae, avisen para actualizar

**P: ¿Qué pasa si la firma no coincide?**  
R: El sistema rechaza la solicitud con error 401

**P: ¿Necesitamos encriptación?**  
R: ngrok usa HTTPS automáticamente. La firma HMAC proporciona autenticación

**P: ¿Pueden guardar los datos en BD?**  
R: Sí, recomendado para auditoría y trazabilidad

---

## 📋 PRÓXIMOS PASOS

- [ ] Ustedes completan información anterior
- [ ] Nosotros revisamos
- [ ] Compartimos script Python de prueba
- [ ] Ambos ejecutamos tests locales
- [ ] Ambos activamos ngrok
- [ ] Ambos hacemos pruebas bidireccionales
- [ ] Verificar datos en ambas BD
- [ ] ✅ INTEGRACIÓN COMPLETA

---

**Documento:** Solicitud de Integración Bidireccional  
**Fecha:** 25 de Enero 2026  
**Proyecto:** Recomendaciones Turísticas ULEAM ↔ Sistema Equipo B  
**Versión:** 1.0

---

## 📧 ENVIAR RESPUESTA A:

**Nombre:** [TU NOMBRE]  
**Email:** [TU EMAIL]  
**Teléfono:** [TU TELÉFONO]

---

_Por favor, completa TODOS los campos y devuelve este documento completado._
