# Diagrama de Integración - Semana 2

## 🏗️ Arquitectura General del Proyecto

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  (Abigail - LoginV2, PaymentForm, ChatBot, Dashboard)           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ChatBot.tsx      PaymentForm.tsx     Dashboard.tsx      │   │
│  │ (Chat + Pagos)   (Formulario pago)   (Admin panel)      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           ↓ HTTP (REST)        ↓ HTTP (REST)    ↓ WebSocket
    ┌──────────────────────────────────────────────────────────┐
    │               REST API (FastAPI - Nestor)               │
    │         ↙ POST /api/pagos/reserva                       │
    │       POST /api/pagos/tour                              │
    │       GET /api/pagos/estado/{id}                        │
    │       POST /api/pagos/reembolso                         │
    │                                                          │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │ pago_routes.py (Endpoints)                        │ │
    │  │  ├─ procesar_pago_reserva()                       │ │
    │  │  ├─ procesar_pago_tour()                          │ │
    │  │  ├─ obtener_estado_pago()                         │ │
    │  │  └─ reembolsar_pago()                             │ │
    │  └────────────────────────────────────────────────────┘ │
    │                       ↓                                  │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │ payment_controller.py (Lógica de Negocio)         │ │
    │  │  ├─ Obtener datos de reserva/tour de MongoDB      │ │
    │  │  ├─ Validar usuario                               │ │
    │  │  ├─ Llamar a Payment Service                      │ │
    │  │  └─ Actualizar estado en BD si es exitoso         │ │
    │  └────────────────────────────────────────────────────┘ │
    │                       ↓                                  │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │ payment_client.py (Cliente HTTP)                  │ │
    │  │  ├─ Firmar payload con HMAC-SHA256                │ │
    │  │  ├─ Enviar POST /payment/process                  │ │
    │  │  ├─ Validar respuesta                             │ │
    │  │  └─ Retornar payment_id                           │ │
    │  └────────────────────────────────────────────────────┘ │
    │                       ↓                                  │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │ MongoDB (Beanie ORM)                              │ │
    │  │  ├─ Usuario                                       │ │
    │  │  ├─ Reserva (actualizar: estado, fecha_pago)     │ │
    │  │  └─ Tour                                          │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────────────────────────────────────────────────────────┘
                           ↓ HTTP + Firma HMAC
    ┌──────────────────────────────────────────────────────────┐
    │        Payment Service (Node.js/TypeScript - Odalia)     │
    │                                                          │
    │  POST /payment/process ← payment_client.py              │
    │  │                                                       │
    │  ├─ Validar firma HMAC ✓                               │
    │  ├─ Procesar pago (MockAdapter o Stripe)               │
    │  ├─ Generar payment_id                                 │
    │  ├─ Enviar webhook a n8n → payment_handler             │
    │  └─ Retornar {"status": "success", ...}                │
    │                                                          │
    └──────────────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────────────────────┐
    │            n8n (Event Bus - Semana 4)                   │
    │                                                          │
    │  payment_handler.json                                  │
    │   ├─ Recibe webhook de Payment Service                 │
    │   ├─ Valida payload                                    │
    │   ├─ Activa servicio/reserva                           │
    │   ├─ Notifica via WebSocket                            │
    │   ├─ Envía email de confirmación                       │
    │   └─ Dispara webhook a grupo partner                   │
    │                                                          │
    │  partner_listener.json                                 │
    │   └─ Recibe webhooks del grupo Reservas ULEAM          │
    │                                                          │
    └──────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Pago (Semana 2)

### 1. Cliente solicita pago

```
Frontend → POST /api/pagos/reserva
{
  "reserva_id": "507f...",
  "monto": 150.00,
  "descripcion": "Pago de reserva"
}
Authorization: Bearer <JWT_TOKEN>
```

### 2. REST API valida y procesa

```
pago_routes.py
  ↓
payment_controller.py
  ├─ Obtener Reserva de MongoDB
  ├─ Obtener Usuario de MongoDB
  ├─ Crear payload con metadata
  └─ Llamar payment_client.py

payment_client.py
  ├─ Crear payload JSON
  ├─ Firmar con HMAC-SHA256
  ├─ Enviar POST /payment/process
  └─ Retornar respuesta

payment_controller.py
  ├─ Si status=success:
  │   └─ Actualizar Reserva (estado="pagada", payment_id)
  └─ Retornar resultado al cliente
```

### 3. Response al Frontend

```json
{
  "status": "success",
  "message": "Pago procesado exitosamente",
  "payment_id": "pay_1234567890",
  "reserva_id": "507f...",
  "monto": 150.0
}
```

## 📊 Flujo de Datos entre Servicios

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │         │   REST API   │         │   Payment   │
│   (React)   │         │   (Nestor)   │         │  (Odalia)   │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │                       │
       │  1. POST /pagos/reserva│                       │
       ├───────────────────────→│                       │
       │                        │                       │
       │                        │  2. Obtener Reserva  │
       │                        │     de MongoDB        │
       │                        │                       │
       │                        │  3. POST /payment/    │
       │                        │     process (HMAC)    │
       │                        ├──────────────────────→│
       │                        │                       │
       │                        │  4. Respuesta         │
       │                        │     {payment_id}      │
       │                        │←──────────────────────┤
       │                        │                       │
       │                        │  5. UPDATE Reserva   │
       │                        │     en MongoDB        │
       │                        │                       │
       │  6. Respuesta          │                       │
       │     {success}          │                       │
       │←───────────────────────┤                       │
       │                        │                       │
```

## 🔐 Seguridad - Firma HMAC

```
payment_client.py
  ├─ Payload: {"user_id": "...", "amount": 150, ...}
  ├─ Convertir a JSON: '{"amount":150,"user_id":"..."}'
  ├─ Secret: "shared-secret-key" (debe coincidir en Payment Service)
  ├─ Calcular: HMAC-SHA256(secret, payload)
  │   = "a1b2c3d4e5f6..."
  └─ Enviar Header: X-Signature: a1b2c3d6e5f6...

Payment Service
  └─ Recibe y verifica:
     ├─ Obtener payload del body
     ├─ Calcular HMAC con su secret
     ├─ Comparar con header X-Signature
     └─ Si coincide → procesar pago
```

## 📁 Estructura de Carpetas (Semana 2)

```
backend/rest-api/
│
├── main.py                          # ✅ App FastAPI principal
│
├── app/
│   │
│   ├── services/
│   │   └── payment_client.py        # ✅ NUEVO - Cliente HTTP Payment Service
│   │
│   ├── controllers/
│   │   ├── base_controller.py
│   │   ├── auth_controller.py
│   │   └── payment_controller.py    # ✅ NUEVO - Lógica de pagos
│   │
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── usuario_routes.py
│   │   ├── tour_routes.py
│   │   ├── reserva_routes.py
│   │   └── pago_routes.py           # ✅ NUEVO - Endpoints de pagos
│   │
│   └── models/
│       ├── usuario_model.py
│       ├── reserva_model.py
│       ├── tour_model.py
│       └── ...
│
├── SEMANA2_NESTOR_PAYMENT_GUIDE.md  # ✅ NUEVO - Documentación
├── SEMANA2_TAREAS_NESTOR.md         # ✅ NUEVO - Lista de tareas
├── test_payment_integration.py      # ✅ NUEVO - Script de pruebas
│
└── requirements.txt                 # ✅ Ya incluye httpx
```

## 🧪 Testing - Validación de Datos

```
Prueba 1: Pago con Reserva Existente
  ├─ Input: reserva_id válida + monto 150 USD
  ├─ Expected: status=success, payment_id retornado
  └─ Validar: Reserva en MongoDB tiene estado="pagada"

Prueba 2: Pago con Reserva No Encontrada
  ├─ Input: reserva_id inválida
  ├─ Expected: status=error, "Reserva no encontrada"
  └─ HTTP: 400 Bad Request

Prueba 3: Pago sin Token JWT
  ├─ Input: POST sin Authorization header
  ├─ Expected: HTTP 403 Unauthorized
  └─ Mensaje: "Token inválido o expirado"

Prueba 4: Payment Service No Disponible
  ├─ Input: POST a /pagos/reserva (Payment Service caído)
  ├─ Expected: status=error, "Connection refused"
  └─ HTTP: 500 Internal Server Error
```

## 🎯 Checklist de Integración Semana 2

- [ ] payment_client.py implementado con HMAC
- [ ] payment_controller.py con lógica de negocio
- [ ] pago_routes.py con 4 endpoints
- [ ] main.py integrando pago_routes
- [ ] test_payment_integration.py ejecutable
- [ ] Variables de entorno configuradas (.env)
- [ ] MongoDB actualiza estado de reservas
- [ ] Errores manejados correctamente
- [ ] Documentación completada
- [ ] Mínimo 5 commits realizados

## 📞 Comunicación Interdepartamental

### Reunión con Odalia (Semana 2)

- ¿Payment Service está listo en localhost:8200?
- ¿Cuál es el PAYMENT_SERVICE_SECRET exacto?
- ¿Qué campos espera en metadata?
- ¿Cómo formatea el response?

### Reunión con Abigail (Semana 2)

- El endpoint /api/pagos/reserva retorna payment_id
- El frontend puede consultar estado con /api/pagos/estado/{id}
- Se puede hacer reembolso con /api/pagos/reembolso
- El chat de Abigail puede notificar cuando el pago se completó (vía WebSocket)

### Reunión con Grupo Partner (Semana 3)

- Coordinar para recibir webhook cuando ellos realizan pago
- Compartir formato de eventos
- Implementar validación HMAC
- Enviar confirmación de tour_purchased

---

**Último Update:** 9 de enero de 2026
**Estado:** Semana 2 - Implementation Phase
**Responsable:** Nestor Ayala
