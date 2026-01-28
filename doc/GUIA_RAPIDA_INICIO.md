# 🚀 GUÍA RÁPIDA - INTEGRACIÓN BIDIRECCIONAL EQUIPO A

**Estado:** 🟢 LISTO PARA PRODUCCIÓN  
**Última actualización:** 25 de enero de 2026

---

## 📋 En 5 Pasos

### 1️⃣ Ejecutar Script de Inicio

```powershell
.\start_integracion_bidireccional.ps1
```

Esto abrirá automáticamente:

- ✅ Auth Service (puerto 8001)
- ✅ REST API (puerto 8000)
- ✅ Payment Service (puerto 8002)
- ✅ ngrok (exposición pública)

### 2️⃣ Verificar Configuración

```bash
cd backend\rest-api
python verify_secrets_config.py
```

**Esperado:** ✅ TODA LA CONFIGURACIÓN ESTÁ CORRECTA

### 3️⃣ Obtener URL de ngrok

Acceder a: http://localhost:4040

**Ejemplo:** `https://abc123def45.ngrok.io`

### 4️⃣ Ejecutar Tests

```bash
python test_integracion_bidireccional_completa.py
```

**Esperado:** 5/5 ó 6/6 tests pasando

### 5️⃣ Compartir con Equipo B

**Información a enviar:**

```
URL: https://abc123def45.ngrok.io
Secret: integracion-turismo-2026-uleam
Documento: SOLICITUD_INTEGRACION_EQUIPO_B.md
```

---

## 🔐 Claves Secretas Sincronizadas

| Clave                  | Valor                                                           | Sincronizada |
| ---------------------- | --------------------------------------------------------------- | ------------ |
| JWT_SECRET_KEY         | `integracion-turismo-2026-uleam-jwt-secret-key-payment-service` | ✅ 3/3       |
| INTEGRACION_SECRET_KEY | `integracion-turismo-2026-uleam`                                | ✅ 3/3       |

---

## 📁 Archivos Importantes

| Archivo                                      | Propósito                        |
| -------------------------------------------- | -------------------------------- |
| `REFERENCIA_CLAVES_SECRETAS.md`              | Todas las claves y configuración |
| `INTEGRACION_STATUS_FINAL.md`                | Resumen ejecutivo                |
| `SOLICITUD_INTEGRACION_EQUIPO_B.md`          | Template para Equipo B           |
| `test_integracion_bidireccional_completa.py` | Suite de tests                   |
| `verify_secrets_config.py`                   | Verificador de claves            |
| `start_integracion_bidireccional.ps1`        | Script automatizado              |

---

## 🆘 Troubleshooting Rápido

**Error: "No se puede conectar a http://localhost:8000"**

- Solución: Ejecutar `.\start_integracion_bidireccional.ps1` nuevamente

**Error: "Claves no sincronizadas"**

- Solución: Ejecutar `python verify_secrets_config.py`

**Error: "Firma HMAC inválida"**

- Verificar que Equipo B usa el mismo secret: `integracion-turismo-2026-uleam`

**Error: "ngrok no encontrado"**

- Instalar: `scoop install ngrok`
- Iniciar manualmente: `ngrok http 8000`

---

## ✅ Checklist de Verificación

- [ ] Script de inicio ejecutado
- [ ] Todos los servicios corriendo
- [ ] Verificación de configuración pasó
- [ ] Tests locales pasaron
- [ ] URL de ngrok obtenida
- [ ] Información compartida con Equipo B
- [ ] URL de Equipo B recibida
- [ ] Tests bidireccionales pasaron

---

## 📞 Próximo Contacto con Equipo B

Esperar a que Equipo B comparta:

1. URL de ngrok de Equipo B
2. Confirmación que recibió nuestros webhooks
3. URL de endpoint de webhooks de Equipo B

---

## 🎯 Resumen de Status

```
✅ 4/4 Claves secretas sincronizadas
✅ 4/4 Endpoints implementados
✅ 4/4 Servicios configurados
✅ 3/3 Archivos .env actualizados
✅ 7/7 Scripts disponibles

🟢 LISTO PARA PRODUCCIÓN
```

---

Para más información, revisar `INTEGRACION_STATUS_FINAL.md`
