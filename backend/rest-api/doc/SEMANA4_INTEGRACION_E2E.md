# 📡 SEMANA 4: Integración E2E - Webhooks + WebSocket

**Autor:** Nestor Ayala  
**Fecha:** 24 de enero de 2026  
**Objetivo:** Integración completa de webhooks con WebSocket

---

## 📊 Arquitectura E2E - Semana 4

```
┌─────────────────────────────────────────────────────────────┐
│                    GRUPO PARTNER (RESERVAS ULEAM)           │
└────────────────────────────┬────────────────────────────────┘
                             │
                    Webhook: booking.confirmed
                    (JWT + HMAC signed)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   REST-API (NUESTRO SISTEMA)                │
│                                                              │
│  POST /webhooks/partner                                     │
│  ├─ 1. Extrae JWT del header                               │
│  ├─ 2. Valida JWT con JWTValidator                         │
│  ├─ 3. Valida HMAC del payload                             │
│  ├─ 4. Procesa evento booking.confirmed                    │
│  └─ 5. Crea Reserva en MongoDB                             │
│                                                              │
│  ├─ Auth Service: Valida usuario                           │
│  ├─ Payment Service: Puede procesar pago                   │
│  └─ WebSocket Server: Notifica al frontend en REAL-TIME    │
└────────────────────────────┬────────────────────────────────┘
                             │
                    Evento a través de WebSocket
                    broadcast: "reserva.creada"
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (NAVEGADOR)                      │
│                                                              │
│  Dashboard recibe evento en REAL-TIME                       │
│  • Actualiza lista de reservas                             │
│  • Muestra notificación al usuario                         │
│  • Envía confirmación de pago si aplica                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Flujo Completo de Integración E2E

### Paso 1: Usuario en Frontend Selecciona Tour

```javascript
// Frontend (chat-component.vue)
const selectTour = (tour) => {
  // Envía selección al backend
  POST /tours/select
  Body: {
    user_id: "user_123",
    tour_id: "tour_456",
    dates: ["2025-02-01", "2025-02-05"]
  }
}
```

---

### Paso 2: Backend Envía a Grupo Partner

```python
# Backend (rest-api/main.py)
@app.post("/tours/select")
async def select_tour(request: SelectTourRequest):
    # Crear WebhookClient
    client = PartnerWebhookClient()

    # Enviar webhook al grupo partner
    await client.send_tour_selected(
        user_id=request.user_id,
        tour_id=request.tour_id,
        dates=request.dates
    )

    return {"status": "tour_selection_sent_to_partner"}
```

---

### Paso 3: Grupo Partner Procesa y Confirma

```
Grupo Partner:
1. Recibe evento: tour.selected
2. Valida JWT + HMAC
3. Reserva hotel
4. Envía webhook: booking.confirmed

Headers:
- Authorization: Bearer <su_token>
- X-Webhook-Signature: <su_firma>
```

---

### Paso 4: Nuestro Sistema Recibe Confirmación

```python
# Backend (rest-api/app/routes/webhook_routes.py)
@router.post("/webhooks/partner")
async def receive_partner_webhook(
    request: Request,
    authorization: Optional[str] = Header(None),
    x_webhook_signature: Optional[str] = Header(None),
):
    # 1. Validar JWT del partner
    token = JWTValidator.extract_token_from_header(authorization)
    jwt_payload = JWTValidator.verify_token(token)

    # 2. Validar HMAC del payload
    body = await request.body()
    payload_str = body.decode('utf-8')
    is_valid = HMACValidator.verify_signature(
        payload_str,
        x_webhook_signature,
        PARTNER_SECRET
    )

    # 3. Si ambas válidas, procesar
    if is_valid:
        event_data = json.loads(payload_str)

        # Crear reserva en nuestro MongoDB
        await create_reservation(event_data)

        # Retornar ACK
        return {
            "status": "received",
            "security": {
                "jwt_validated": True,
                "hmac_validated": True,
                "validated_by": jwt_payload["user_id"]
            }
        }
```

---

### Paso 5: Backend Notifica Frontend vía WebSocket

```python
# Backend (rest-api/app/services/webhook_service.py)
async def process_booking_confirmed(event_data):
    # Crear reserva
    reservation = await create_reservation(event_data)

    # Conectar con WebSocket Server
    websocket_client = WebSocketNotifier()

    # Enviar evento a todos los clientes suscritos
    await websocket_client.broadcast_event(
        event_type="reserva.creada",
        data={
            "reservation_id": reservation["_id"],
            "user_id": event_data["user_id"],
            "hotel": event_data["hotel_name"],
            "dates": {
                "check_in": event_data["check_in"],
                "check_out": event_data["check_out"]
            },
            "status": "confirmed"
        }
    )

    return {
        "processed": True,
        "reservation_id": reservation["_id"],
        "notification_sent": True
    }
```

---

### Paso 6: Frontend Recibe Actualización en Real-Time

```javascript
// Frontend (websocket-listener.ts)
socket.on('reserva.creada', (data) => {
  console.log('🎉 Nueva reserva confirmada:', data);

  // Actualizar estado local
  reservations.push(data);

  // Mostrar notificación
  showNotification({
    type: 'success',
    message: `Reserva confirmada en ${data.hotel}`,
    duration: 5000,
  });

  // Actualizar UI
  updateReservationsList();
});
```

---

## 🏗️ Componentes de Integración E2E

### 1. **JWT Validator** ✅ (SEMANA 4)

- Genera tokens JWT
- Valida tokens recibidos
- Extrae identidad del usuario

### 2. **HMAC Validator** ✅ (SEMANA 3)

- Genera firmas HMAC-SHA256
- Valida integridad del payload
- Previene modificación

### 3. **Webhook Security Validator** ✅ (SEMANA 4)

- Combina JWT + HMAC
- Doble validación
- Metadata de auditoría

### 4. **Webhook Routes** ✅ (SEMANA 4)

- Recibe webhooks del partner
- Valida seguridad
- Procesa eventos

### 5. **WebSocket Integration** → (SEMANA 5)

- Conecta con WebSocket Server
- Broadcast eventos
- Notificación real-time

---

## 📝 Testing E2E - Semana 4

### Escenario Completo:

```bash
# Terminal 1: Iniciar REST API
cd backend/rest-api
python main.py

# Terminal 2: Iniciar WebSocket Server
cd backend/websocket-server
go run main.go

# Terminal 3: Tests
cd backend/rest-api

# 1. Generar token
TOKEN=$(curl -s -X POST http://localhost:8000/webhooks/generate-token \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "email": "user@example.com",
    "username": "john_doe"
  }' | jq -r '.access_token')

# 2. Crear payload
PAYLOAD='{"event_type":"booking.confirmed","data":{"booking_id":"book_123"}}'

# 3. Generar firma
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "my_secret_key_123" -hex | cut -d' ' -f2)

# 4. Enviar webhook
curl -X POST http://localhost:8000/webhooks/partner \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -H "X-Webhook-Source: reservas_system" \
  -d "$PAYLOAD"

# 5. Verificar en WebSocket que se recibió el evento
# (En frontend que esté conectado a ws://localhost:8080)
```

---

## ✅ Checklist E2E - Semana 4

- ✅ JWT Validator implementado
- ✅ Webhook Security (JWT + HMAC) implementado
- ✅ Endpoints actualizados para validar JWT
- ✅ Response incluye metadata de seguridad
- ✅ Tests de seguridad dual
- ✅ Documentación E2E
- ✅ Scripts de testing

### Próxima Semana (Semana 5):

- ⏳ Integración con WebSocket Server
- ⏳ Broadcast de eventos en real-time
- ⏳ Frontend listening a eventos
- ⏳ Testing E2E con frontend

---

## 🔐 Seguridad E2E - Semana 4

```
Usuario externo        Sistema nuestro         Frontend
     ↓                      ↓                      ↓
     └──JWT token────────────┘
              (identidad del usuario)

     └──HMAC payload────────→
              (integridad garantizada)

              ├─ Procesa evento
              ├─ Crea reserva
              └──WebSocket event─────────────────→
                   (notificación real-time)
```

---

## 📚 Referencias E2E

- **JWT:** [RFC 7519](https://tools.ietf.org/html/rfc7519)
- **HMAC:** [RFC 2104](https://tools.ietf.org/html/rfc2104)
- **WebSocket:** [RFC 6455](https://tools.ietf.org/html/rfc6455)
- **OAuth 2.0:** [RFC 6749](https://tools.ietf.org/html/rfc6749)

---

**Semana 4 E2E Architecture Documentada ✅**

Nestor Ayala | Enero 24, 2026
