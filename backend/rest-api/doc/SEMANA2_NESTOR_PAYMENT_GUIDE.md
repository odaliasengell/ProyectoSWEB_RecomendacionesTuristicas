# Payment Service Integration - REST API (Semana 2)

## Descripción General

Como **Nestor**, tu responsabilidad en la Semana 2 es implementar el cliente HTTP que conecta la REST API con el Payment Service de Odalia. Esto incluye:

1. **Cliente HTTP** (`payment_client.py`) - Comunica con http://localhost:8200
2. **Controlador de Pagos** (`payment_controller.py`) - Lógica de negocio para procesar pagos
3. **Rutas de Pagos** (`pago_routes.py`) - Endpoints REST para exponer la funcionalidad
4. **Integración en main.py** - Montar las rutas en la aplicación

## Archivos Creados

### 1. `app/services/payment_client.py`

Cliente HTTP para comunicarse con el Payment Service.

**Métodos disponibles:**

```python
# Procesar un pago
await payment_client.process_payment(
    user_id="507f1f77bcf86cd799439011",
    amount=150.00,
    currency="USD",
    description="Pago de reserva",
    metadata={"reserva_id": "..."}
)

# Validar estado de un pago
await payment_client.validate_payment(payment_id="pay_1234567890")

# Procesar reembolso
await payment_client.refund_payment(
    payment_id="pay_1234567890",
    reason="Cliente solicitó cancelación"
)
```

**Características:**

- ✅ Firma HMAC-SHA256 de payloads
- ✅ Manejo de errores de conexión
- ✅ Timeout configurable
- ✅ Usa variables de entorno para URL y secret

### 2. `app/controllers/payment_controller.py`

Controlador que orquesta la lógica de pagos.

**Funciones:**

```python
# Procesar pago de una reserva
await procesar_pago_reserva(
    reserva_id="507f1f77bcf86cd799439011",
    user_id="507f1f77bcf86cd799439012",
    monto=150.00,
    descripcion="Pago de reserva"
)

# Procesar pago de un tour
await procesar_pago_tour(
    tour_id="507f1f77bcf86cd799439013",
    user_id="507f1f77bcf86cd799439012",
    cantidad_personas=2,
    precio_por_persona=75.00
)

# Obtener estado del pago
await obtener_estado_pago(payment_id="pay_1234567890")

# Reembolsar
await reembolsar_pago(payment_id="pay_1234567890", razón="Cancelación")
```

**Lógica:**

- Obtiene datos de la reserva/tour de MongoDB
- Verifica que el usuario existe
- Envía el pago al Payment Service (con firma HMAC)
- Si es exitoso, actualiza el estado en la DB

### 3. `app/routes/pago_routes.py`

Endpoints REST que exponen la funcionalidad.

## Endpoints Disponibles

### POST `/api/pagos/reserva`

Procesar pago de una reserva.

**Request:**

```json
{
  "reserva_id": "507f1f77bcf86cd799439011",
  "monto": 150.0,
  "descripcion": "Pago de reserva de tour"
}
```

**Response (éxito):**

```json
{
  "status": "success",
  "message": "Pago procesado exitosamente",
  "payment_id": "pay_1234567890",
  "reserva_id": "507f1f77bcf86cd799439011",
  "monto": 150.0
}
```

**Response (error):**

```json
{
  "status": "error",
  "message": "Reserva no encontrada"
}
```

---

### POST `/api/pagos/tour`

Procesar pago de un tour.

**Request:**

```json
{
  "tour_id": "507f1f77bcf86cd799439013",
  "cantidad_personas": 2,
  "precio_por_persona": 75.0
}
```

**Cálculo:**

- Monto total = 2 × 75.00 = 150.00 USD

---

### GET `/api/pagos/estado/{payment_id}`

Obtener el estado de un pago.

**Response:**

```json
{
  "status": "success",
  "payment_id": "pay_1234567890",
  "estado": "completado",
  "monto": 150.0,
  "fecha": "2024-01-09T10:30:00"
}
```

---

### POST `/api/pagos/reembolso`

Procesar un reembolso.

**Request:**

```json
{
  "payment_id": "pay_1234567890",
  "razon": "Cliente solicitó cancelación"
}
```

**Response:**

```json
{
  "status": "success",
  "refund_id": "ref_1234567890",
  "payment_id": "pay_1234567890",
  "monto_reembolsado": 150.0
}
```

---

## Configuración de Variables de Entorno

Crea o actualiza tu archivo `.env` en `backend/rest-api/`:

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=turismo

# Payment Service
PAYMENT_SERVICE_URL=http://localhost:8200
PAYMENT_SERVICE_SECRET=shared-secret-key

# JWT
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
```

## Pruebas Locales

### Usando curl:

```bash
# 1. Obtener token de autenticación
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# 2. Procesar pago de reserva (reemplaza TOKEN y IDs)
curl -X POST http://localhost:8000/api/pagos/reserva \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "reserva_id": "507f1f77bcf86cd799439011",
    "monto": 150.00,
    "descripcion": "Pago de reserva"
  }'

# 3. Verificar estado del pago
curl -X GET http://localhost:8000/api/pagos/estado/pay_1234567890 \
  -H "Authorization: Bearer TOKEN"
```

### Usando Postman:

1. **Colección:** Importa los endpoints en Postman
2. **Autenticación:** Usa el token obtenido en login
3. **Variables:** Guarda `payment_id` para consultar estado

## Próximos Pasos (Semana 3)

En la Semana 3, **integrarás webhooks con el grupo partner (Reservas ULEAM)**:

1. Odalia configurará los webhooks en n8n
2. Tú crearás un endpoint para recibir webhooks del grupo partner
3. Implementarás validación de firma HMAC en las notificaciones entrantes

## Checklist de la Semana 2

- [x] Cliente HTTP implementado con firma HMAC
- [x] Controlador de pagos con lógica de negocio
- [x] Rutas REST para procesar pagos
- [x] Integración en main.py
- [ ] Pruebas locales (tu responsabilidad)
- [ ] Commits semanales (mínimo 5)
- [ ] Documentación de los endpoints

## Troubleshooting

### Error: "Connection refused" en Payment Service

```
Error de conexión con Payment Service: Connection refused
```

**Solución:** Asegúrate de que:

1. El Payment Service de Odalia está corriendo en `http://localhost:8200`
2. La variable `PAYMENT_SERVICE_URL` en `.env` es correcta
3. No hay firewall bloqueando la conexión

### Error: "InvalidSignatureError"

```
Error: Firma HMAC inválida
```

**Solución:** Verifica que:

1. `PAYMENT_SERVICE_SECRET` en tu `.env` coincide con el de Odalia
2. El payload se firma antes de enviarse

### Error: "JWT expired"

```
Error 401: Token expirado
```

**Solución:** Obtén un nuevo token con login o usa refresh token.

## Referencias

- [FastAPI - Security](https://fastapi.tiangolo.com/tutorial/security/)
- [HMAC-SHA256 Documentation](https://docs.python.org/3/library/hmac.html)
- [httpx - Async HTTP Client](https://www.python-httpx.org/)
