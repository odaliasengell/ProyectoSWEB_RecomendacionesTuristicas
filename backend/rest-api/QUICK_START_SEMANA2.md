# 🚀 QUICK START - Semana 2 (Nestor)

## ¿Qué se implementó?

✅ Cliente HTTP para conectar con Payment Service
✅ Controlador de lógica de pagos
✅ 4 endpoints REST para procesar pagos
✅ Firma HMAC-SHA256 para seguridad
✅ Documentación completa y tests

## 📂 Archivos Clave

| Archivo                                 | Propósito                 |
| --------------------------------------- | ------------------------- |
| `app/services/payment_client.py`        | Cliente HTTP + HMAC       |
| `app/controllers/payment_controller.py` | Lógica de negocio         |
| `app/routes/pago_routes.py`             | Endpoints REST            |
| `main.py`                               | ✅ Ya incluye pago_routes |
| `SEMANA2_NESTOR_PAYMENT_GUIDE.md`       | Guía completa             |
| `test_payment_integration.py`           | Suite de pruebas          |

## 🎯 Endpoints Implementados

```
POST   /api/pagos/reserva     ← Procesar pago de reserva
POST   /api/pagos/tour        ← Procesar pago de tour
GET    /api/pagos/estado/{id} ← Consultar estado del pago
POST   /api/pagos/reembolso   ← Procesar reembolso
```

Todos requieren JWT en header `Authorization: Bearer <TOKEN>`

## 🔧 Configuración (5 minutos)

### 1. Variables de Entorno

```bash
cp .env.example .env
# Editar .env:
PAYMENT_SERVICE_URL=http://localhost:8200
PAYMENT_SERVICE_SECRET=shared-secret-key
```

### 2. Instalar Dependencias

```bash
pip install -r requirements.txt
```

### 3. Ejecutar

```bash
python -m uvicorn main:app --reload --port 8000
```

## ✅ Testing (3 minutos)

```bash
# Opción 1: Suite completa
python test_payment_integration.py

# Opción 2: PowerShell (Windows)
.\test_payment_powershell.ps1

# Opción 3: Manual con curl
# Ver test_payment_curl.sh
```

## 🔄 Flujo Típico

```
1. Frontend envía: POST /api/pagos/reserva
2. REST API obtiene datos de MongoDB
3. Firma payload con HMAC
4. Envía a Payment Service (http://localhost:8200)
5. Payment Service retorna payment_id
6. REST API actualiza reserva en MongoDB
7. Retorna respuesta al frontend
```

## 📋 Tareas Pendientes

- [ ] Configurar `.env` con datos correctos
- [ ] Instalar requirements.txt
- [ ] Ejecutar test_payment_integration.py
- [ ] Hacer 5+ commits semanales
- [ ] Documentar problemas encontrados

## 🚨 Problemas Comunes

### "Connection refused"

→ Asegurar que Payment Service (Odalia) está en puerto 8200

### "Invalid signature"

→ Verificar que PAYMENT_SERVICE_SECRET es el mismo en ambos lados

### "JWT expired"

→ Obtener nuevo token con login

### "Reserva not found"

→ Usar IDs válidos de reservas existentes

## 📞 Contactos

- **Odalia:** Payment Service + n8n
- **Abigail:** Frontend con PaymentForm
- **Tú:** REST API + Integración

## 📚 Documentación

- **IMPLEMENTACION_SEMANA2.md** ← Comienza aquí
- **SEMANA2_NESTOR_PAYMENT_GUIDE.md** ← Detalles técnicos
- **ARQUITECTURA_SEMANA2.md** ← Diagramas
- **SEMANA2_TAREAS_NESTOR.md** ← Checklist

## 🎓 Conceptos Clave

| Concepto    | Descripción                                    |
| ----------- | ---------------------------------------------- |
| JWT         | Token de autenticación                         |
| HMAC-SHA256 | Firma de payloads para validar origen          |
| payment_id  | ID único del pago generado por Payment Service |
| Metadata    | Datos adicionales (reserva_id, tour_id, etc.)  |

## 💡 Tips

1. Usa Postman/Insomnia para testing interactivo
2. Guarda el token JWT en variable de entorno
3. Verifica logs de ambos servicios en paralelo
4. Coordina con Odalia antes de empezar testing

## 🎯 Objetivo Semana 2

Tener el cliente HTTP funcional y comunicando correctamente con Payment Service de Odalia, con todos los tests pasando.

---

**¿Dudas?** Revisa SEMANA2_NESTOR_PAYMENT_GUIDE.md o ejecuta test_payment_integration.py
