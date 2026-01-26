# 🧪 SCRIPTS DE TESTING - EQUIPO A

**Localización:** `backend/rest-api/`

---

## 📋 SCRIPTS DISPONIBLES

### 1. `test_webhook_local.py`

**Propósito:** Verificar que endpoints locales funcionan correctamente

**Cuándo usar:**

- Después de iniciar el servidor (`python main.py`)
- Para validar instalación local
- ANTES de activar ngrok

**Cómo ejecutar:**

```bash
cd backend/rest-api
python test_webhook_local.py
```

**Qué verifica:**

```
✅ Test 1: Status de integración
   ↳ Verifica que /api/integracion/status responde

✅ Test 2: Recibir con firma INVÁLIDA
   ↳ Intenta POST a /api/reservas con firma falsa
   ↳ Espera respuesta 401 (rechazada)

✅ Test 3: Recibir con firma VÁLIDA
   ↳ POST a /api/reservas con firma correcta
   ↳ Espera respuesta 200 (aceptada)

✅ Test 4: Enviar sin ngrok
   ↳ Intenta enviar a Equipo B (sin URL)
   ↳ Espera error 500 (es normal sin ngrok)

✅ Test 5: Webhooks test
   ↳ Verifica /webhooks/test endpoint
```

**Resultado esperado:**

```
✅ TEST 1: PASÓ ✓
✅ TEST 2: PASÓ ✓
✅ TEST 3: PASÓ ✓
✅ TEST 4: PASÓ ✓
✅ TEST 5: PASÓ ✓

Resultados: 5/5 tests pasados
```

---

### 2. `test_webhook_bidireccional.py`

**Propósito:** Prueba la comunicación ENTRE Equipo A y Equipo B

**Cuándo usar:**

- Después de tener ngrok activo
- Cuando tengas la URL de ngrok de Equipo B
- Para validar integración completa

**Cómo ejecutar:**

```bash
# Primero: Actualizar URL de Equipo B
# Editar línea ~18 del script:
# URL_EQUIPO_B = "https://[TU_URL_NGROK].ngrok.io"

python test_webhook_bidireccional.py
```

**Qué hace:**

1. **Verificación Previa**
   - Confirma que URL de Equipo B esté configurada
   - Verifica que servidor local esté activo
   - Valida clave secreta

2. **Test 1: Envío Directo**
   - Prepara payload
   - Genera firma HMAC
   - Envía POST a `/api/recomendaciones` de Equipo B
   - Verifica que Equipo B lo acepte

3. **Test 2: Via Endpoint Local**
   - Llama a `/api/enviar-reserva-confirmada` localmente
   - El endpoint genera payload y firma
   - Envía a Equipo B
   - Valida respuesta

**Resultado esperado:**

```
✅ VERIFICACIÓN PREVIA
  ✓ URL de Equipo B configurada
  ✓ Servidor local activo
  ✓ Clave secreta

✅ TEST: ENVIAR RESERVA CONFIRMADA A EQUIPO B
  ✓ Payload generado
  ✓ Firma HMAC generada
  ✓ POST enviado
  ✓ Equipo B aceptó (200)

✅ TEST: USAR ENDPOINT LOCAL PARA ENVIAR
  ✓ Endpoint llamado
  ✓ Payload generado internamente
  ✓ Firma generada internamente
  ✓ Equipo B aceptó (200)
```

---

## 🔧 CONFIGURACIÓN PREVIA

### Antes de ejecutar `test_webhook_local.py`

```bash
# 1. Asegúrate que servidor está corriendo
cd backend/rest-api
python main.py

# 2. Verifica conexión a MongoDB
# Deberías ver: "✅ Conectado a MongoDB - Base de datos: recomendaciones_db"

# 3. En otra terminal, ejecuta test
python test_webhook_local.py
```

### Antes de ejecutar `test_webhook_bidireccional.py`

```bash
# 1. Asegúrate que ngrok está activo
# Terminal 1: python main.py
# Terminal 2: ngrok http 8000

# 2. Copia la URL de ngrok
# Ejemplo: https://abc123xyz.ngrok.io

# 3. Edita el script:
# - Línea ~18: URL_EQUIPO_B = "https://[REEMPLAZA].ngrok.io"

# 4. Ejecuta:
python test_webhook_bidireccional.py
```

---

## 📊 SALIDA DE TESTS

### Formato de colores

- 🟢 **Verde** (`✅`) = Éxito / Paso
- 🔴 **Rojo** (`❌`) = Error / Fallo
- 🟡 **Amarillo** (`ℹ️`) = Información / Advertencia
- 🔵 **Azul** = Títulos / Secciones

### Interpretación de resultados

| Resultado           | Significado                    | Acción                  |
| ------------------- | ------------------------------ | ----------------------- |
| `5/5 tests pasados` | Todo OK                        | Continuar               |
| `4/5 tests`         | Fallo esperado                 | Revisar qué fallo       |
| Firma inválida      | URL/clave incorrecta           | Verificar configuración |
| Connection Error    | ngrok no activo/URL incorrecta | Activar ngrok           |
| Timeout             | Equipo B no responde           | Contactar Equipo B      |

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: "Connection refused"

```
❌ No se puede conectar a servidor local

Solución:
1. Verifica que python main.py esté corriendo
2. Verifica puerto 8000 está disponible
3. Restart del servidor:
   Ctrl+C en la terminal de main.py
   python main.py
```

### Problema: "Firma inválida" (401)

```
❌ Equipo B rechaza con 401

Causas posibles:
- Clave secreta diferente
- Timestamp con formato incorrecto
- URL de Equipo B incorrecta

Solución:
1. Verificar clave: integracion-turismo-2026-uleam
2. Verificar timestamp: YYYY-MM-DDTHH:MM:SSZ
3. Verificar URL es correcta (copiar bien)
4. Contactar Equipo B para verificar su clave
```

### Problema: "Timeout"

```
❌ Equipo B no responde en 10 segundos

Causas posibles:
- Equipo B no tiene ngrok activo
- ngrok se reinició (URL cambió)
- Firewall/red bloqueando conexión

Solución:
1. Verifica que Equipo B tiene ngrok activo
2. Pide nueva URL de ngrok
3. Verifica que URL sea https (no http)
4. Contacta Equipo B para debugging
```

### Problema: "JSON inválido"

```
❌ Payload no es JSON válido

Solución:
- Los scripts generan JSON correcto
- Si ocurre, reportar bug
- Verificar encoding (UTF-8)
```

---

## 📝 LOGS Y DEBUGGING

### Ver logs detallados

Los scripts incluyen colores para facilitar lectura:

```bash
python test_webhook_local.py 2>&1 | tee test_output.log
```

Esto guarda salida en `test_output.log` para revisar después.

### Ver logs del servidor

En la terminal donde corre `python main.py`, verás:

```
✅ [/api/reservas] Firma válida
📦 Datos recibidos: {...}
💾 [BD] Recomendación almacenada
```

### Debug mode

Editar scripts para ver más detalles:

```python
# Descomentar líneas de logging adicional
logger.debug(f"Payload: {payload}")
logger.debug(f"Firma: {firma}")
```

---

## ✅ CHECKLIST DE TESTING

```
Fase 1: Tests Locales
- [ ] Servidor corriendo en puerto 8000
- [ ] MongoDB conectado
- [ ] Ejecuté test_webhook_local.py
- [ ] Todos los 5 tests pasaron

Fase 2: Preparación ngrok
- [ ] ngrok instalado
- [ ] ngrok autenticado
- [ ] ngrok corriendo: ngrok http 8000
- [ ] URL de ngrok copiada

Fase 3: Información compartida
- [ ] Compartí URL de ngrok con Equipo B
- [ ] Recibí URL de Equipo B
- [ ] Actualicé test_webhook_bidireccional.py

Fase 4: Tests Bidireccionales
- [ ] Ejecuté test_webhook_bidireccional.py
- [ ] Test 1 pasó (Envío directo)
- [ ] Test 2 pasó (Via endpoint)
- [ ] Equipo B confirma que recibió datos

Fase 5: Validación BD
- [ ] Datos aparecen en BD Equipo A
- [ ] Datos aparecen en BD Equipo B
- [ ] Ambos sistemas registran eventos
```

---

## 🎯 FLUJO COMPLETO DE TESTING

```
1. Instalar ngrok
   ↓
2. Ejecutar servidor: python main.py
   ↓
3. Ejecutar test_webhook_local.py
   ├─ 5/5 tests pasan? → Continuar
   └─ Alguno falla? → Debug local
   ↓
4. Activar ngrok: ngrok http 8000
   ↓
5. Compartir URL con Equipo B
   ↓
6. Recibir URL de Equipo B
   ↓
7. Actualizar test_webhook_bidireccional.py
   ↓
8. Ejecutar test_webhook_bidireccional.py
   ├─ Ambos tests pasan? → Integración OK ✅
   └─ Alguno falla? → Debug comunicación
   ↓
9. Verificar BD en ambos sistemas
   ├─ Datos presentes? → ✅ INTEGRACIÓN EXITOSA
   └─ Datos faltantes? → Revisar logs
```

---

## 📞 SOPORTE Y REFERENCIAS

### Si necesitas ayuda:

1. **Tests no corren:** Revisa que estés en `backend/rest-api/`
2. **Firma inválida:** Verifica clave secreta en ambos lados
3. **Connection Error:** Asegúrate que ngrok esté activo
4. **Timeout:** Contacta Equipo B para verificar su servidor

### Archivos relacionados:

- `webhook_routes.py` - Endpoints implementados
- `GUIA_RAPIDA_EQUIPO_A.md` - Pasos rápidos
- `INTEGRACION_BIDIRECCIONAL.md` - Especificación técnica
- `SOLICITUD_INTEGRACION_EQUIPO_B.md` - Plantilla para Equipo B

---

**Documento:** README Scripts de Testing  
**Fecha:** 25 de Enero 2026  
**Versión:** 1.0

---

_¡A ejecutar los tests!_ 🚀
