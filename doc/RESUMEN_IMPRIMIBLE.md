# 📋 RESUMEN PARA IMPRIMIR - EQUIPO A

**Imprime esto y ten a mano mientras trabajas** 📌

---

## 🎯 6 PASOS PARA ACTIVAR (15 MINUTOS)

### PASO 1: Instalar ngrok

```bash
choco install ngrok
ngrok --version
```

### PASO 2: Crear cuenta en ngrok.com

- Ir a https://ngrok.com
- Sign Up
- Copiar authtoken

### PASO 3: Autenticar

```bash
ngrok config add-authtoken TU_TOKEN_AQUI
```

### PASO 4: Iniciar API (Terminal 1)

```bash
cd backend/rest-api
python main.py
# Esperar: ✅ Conectado a MongoDB
```

### PASO 5: Exponer con ngrok (Terminal 2)

```bash
ngrok http 8000
# Copiar: https://abc123xyz.ngrok.io
```

### PASO 6: Ejecutar tests (Terminal 3)

```bash
cd backend/rest-api
python test_webhook_local.py
# Resultado esperado: 5/5 tests pasados ✅
```

---

## 📞 INFORMACIÓN PARA COMPARTIR CON EQUIPO B

Una vez que tengas ngrok activo, COPIA Y ENVÍA:

```
EQUIPO A - INFORMACIÓN DE INTEGRACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 URL ngrok:
   https://[COPIA_TU_URL].ngrok.io

🖥️  Puerto local: 8000

📥 Endpoint que RECIBE: /api/reservas

📤 Endpoint que ENVÍA: /api/recomendaciones

🔧 Backend: Python/FastAPI

💾 Base de datos: MongoDB

🔐 Seguridad: HMAC-SHA256

🔑 Clave secreta: integracion-turismo-2026-uleam

👤 Contacto: [TU EMAIL]

📱 Teléfono: [TU TELÉFONO]
```

---

## ✅ CHECKLIST

### ANTES DE EMPEZAR

- [ ] ngrok instalado
- [ ] Cuenta en ngrok.com
- [ ] authtoken guardado

### DURANTE SETUP

- [ ] Terminal 1: python main.py corriendo
- [ ] Terminal 2: ngrok http 8000 activo
- [ ] Terminal 3: python test_webhook_local.py ejecutado
- [ ] Resultado: 5/5 tests pasados

### DESPUÉS DE SETUP

- [ ] URL de ngrok copiada
- [ ] Información compartida con Equipo B
- [ ] URL de Equipo B recibida
- [ ] test_webhook_bidireccional.py actualizado
- [ ] test_webhook_bidireccional.py ejecutado
- [ ] Datos verificados en BD

---

## 🐛 SI ALGO FALLA...

### "Connection refused"

```
Solución:
1. Verifica que python main.py esté corriendo
2. Verifica puerto 8000 está disponible
3. Restart del servidor
```

### "Firma inválida" (401)

```
Solución:
1. Verifica clave: integracion-turismo-2026-uleam
2. Verifica URL de ngrok es correcta
3. Contacta Equipo B para verificar su clave
```

### "Timeout"

```
Solución:
1. Equipo B no tiene ngrok activo
2. Pide nueva URL de ngrok a Equipo B
3. Verifica que URL sea https (no http)
```

---

## 📁 ARCHIVOS IMPORTANTES

```
Lectura rápida:
→ GUIA_RAPIDA_EQUIPO_A.md

Para Equipo B:
→ SOLICITUD_INTEGRACION_EQUIPO_B.md

Tests:
→ backend/rest-api/test_webhook_local.py
→ backend/rest-api/test_webhook_bidireccional.py

Debugging:
→ backend/rest-api/README_TESTING.md
```

---

## 🔐 INFORMACIÓN CRÍTICA

**Clave Secreta (MEMORIZAR):**

```
integracion-turismo-2026-uleam
```

**ESTA CLAVE DEBE SER IGUAL EN AMBOS EQUIPOS**

---

## 📊 ENDPOINTS

| Endpoint                         | Método | Propósito           |
| -------------------------------- | ------ | ------------------- |
| `/api/reservas`                  | POST   | Recibir de Equipo B |
| `/api/enviar-reserva-confirmada` | POST   | Enviar a Equipo B   |
| `/api/integracion/status`        | GET    | Ver estado          |

---

## 🎯 ORDEN DE LECTURA

1. **Este documento** (2 min) ✓
2. **GUIA_RAPIDA_EQUIPO_A.md** (10 min)
3. **LISTA_PARA_EQUIPO_B.md** (5 min)
4. **SOLICITUD_INTEGRACION_EQUIPO_B.md** (2 min)

Luego: Seguir los 6 pasos

---

## ⏱️ TIMELINE ESTIMADO

| Actividad             | Tiempo      |
| --------------------- | ----------- |
| Lectura               | 10 min      |
| Instalar ngrok        | 5 min       |
| Crear cuenta          | 2 min       |
| Setup local           | 5 min       |
| Tests locales         | 2 min       |
| Compartir info        | 1 min       |
| **TOTAL EQUIPO A**    | **25 min**  |
| Esperar Equipo B      | ⏳          |
| Tests bidireccionales | 5 min       |
| Validación final      | 5 min       |
| **TOTAL COMPLETO**    | **~40 min** |

---

## 📝 NOTAS IMPORTANTES

1. URL de ngrok cambia cada restart
2. Clave secreta DEBE ser igual en ambos lados
3. Timestamp DEBE ser ISO 8601 con Z
4. Los tests generan HMAC correcto automáticamente
5. Si algo falla, revisar logs en Terminal 1 (python main.py)

---

## 🔗 CONEXIÓN CON EQUIPO B

```
Tu Equipo A
    ↓
    → Envías información
    ↓
Equipo B (ESPERA AQUÍ)
    ↓
    ← Recibe información
    ↓
    → Responde con su URL
    ↓
Tu Equipo A (AQUÍ ESTÁS AHORA)
    ↓
    → Actualiza test_webhook_bidireccional.py
    ↓
    → Ejecuta tests
    ↓
✅ INTEGRACIÓN LISTA
```

---

## 🚀 COMANDO RÁPIDO

Copia y pega para ejecutar TODO:

```bash
# Terminal 1
cd backend/rest-api && python main.py

# Terminal 2
ngrok http 8000

# Terminal 3
cd backend/rest-api && python test_webhook_local.py
```

---

## 📌 PRÓXIMO PASO INMEDIATO

→ **Leer: GUIA_RAPIDA_EQUIPO_A.md**

---

**Impreso:** 25 de Enero 2026  
**Equipo:** A - Recomendaciones Turísticas ULEAM  
**Status:** ✅ LISTO

---

_¡Guardá este documento y ten a mano mientras trabajas!_ 📌
