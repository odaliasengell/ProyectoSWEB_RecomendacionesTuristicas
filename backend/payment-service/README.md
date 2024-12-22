# Payment Service - Microservicio de Pagos con Webhooks

## Descripción
Microservicio para gestión de pagos con patrón Adapter, soporte para múltiples pasarelas y webhooks bidireccionales B2B.

## Características
- ✅ Patrón Adapter para múltiples pasarelas
- ✅ MockAdapter, StripeAdapter, MercadoPagoAdapter
- ✅ Normalización de webhooks
- ✅ Registro de partners con HMAC
- ✅ Webhooks bidireccionales

## Arquitectura

```
payment-service/
├── src/
│   ├── adapters/
│   │   ├── payment_provider.py    # Interface abstracta
│   │   ├── mock_adapter.py        # Mock para desarrollo
│   │   └── stripe_adapter.py      # Adapter de Stripe
│   ├── models/
│   │   ├── payment.py
│   │   └── partner.py
│   ├── routes/
│   │   ├── payment_routes.py
│   │   └── partner_routes.py
│   ├── services/
│   │   ├── payment_service.py
│   │   └── webhook_service.py
│   └── main.py
├── requirements.txt
└── README.md
```

## Endpoints

### POST /payments/create
Crear nuevo pago
```json
{
  "amount": 100.00,
  "currency": "USD",
  "description": "Reserva Tour Galápagos",
  "customer_email": "cliente@example.com"
}
```

### POST /webhooks/payment
Recibir webhooks de pasarelas de pago

### POST /partners/register
Registrar partner para webhooks
```json
{
  "name": "Grupo Partner",
  "webhook_url": "https://partner.com/webhooks/events",
  "events": ["booking.confirmed", "payment.success"]
}
```

### POST /webhooks/partners/{partner_id}
Enviar webhook a partner

## Responsable
**Odalis Senge** - Implementación del Payment Service

## Fecha de Implementación
Semana 2: 29 Diciembre - 4 Enero 2026
