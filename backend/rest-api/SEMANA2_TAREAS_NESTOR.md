# Tareas Semana 2 - Nestor Ayala

## ✅ Completado por Copilot

1. **Cliente HTTP Payment Service** (`app/services/payment_client.py`)

   - ✅ Conexión async con httpx
   - ✅ Firma HMAC-SHA256 de payloads
   - ✅ Manejo de errores
   - ✅ Métodos: process_payment, validate_payment, refund_payment

2. **Controlador de Pagos** (`app/controllers/payment_controller.py`)

   - ✅ procesar_pago_reserva()
   - ✅ procesar_pago_tour()
   - ✅ obtener_estado_pago()
   - ✅ reembolsar_pago()
   - ✅ Actualización de estado en MongoDB

3. **Rutas REST** (`app/routes/pago_routes.py`)

   - ✅ POST /api/pagos/reserva
   - ✅ POST /api/pagos/tour
   - ✅ GET /api/pagos/estado/{payment_id}
   - ✅ POST /api/pagos/reembolso
   - ✅ Documentación Swagger

4. **Integración en main.py**

   - ✅ Importar pago_routes
   - ✅ Montar router en app

5. **Documentación**
   - ✅ SEMANA2_NESTOR_PAYMENT_GUIDE.md
   - ✅ test_payment_integration.py

## 📋 Tú Debes Hacer

### Configuración Inicial

- [ ] Copiar `.env.example` a `.env` y llenar variables
- [ ] Instalar dependencias: `pip install -r requirements.txt`
- [ ] Asegurar que MongoDB está corriendo

### Testing

- [ ] Ejecutar `python test_payment_integration.py` cuando Payment Service esté listo
- [ ] Probar cada endpoint manualmente en Postman/curl
- [ ] Verificar que los pagos se actualizan en MongoDB

### Próximos Pasos (Semana 3)

- [ ] Crear endpoint para recibir webhooks del grupo partner
- [ ] Implementar validación HMAC en webhooks entrantes
- [ ] Conectar con ngrok para pruebas con grupo Reservas

## 📊 Estructura de Archivos Creados

```
backend/rest-api/
├── app/
│   ├── services/
│   │   └── payment_client.py          # ✅ Cliente HTTP
│   ├── controllers/
│   │   └── payment_controller.py       # ✅ Lógica de negocio
│   └── routes/
│       └── pago_routes.py              # ✅ Endpoints REST
├── test_payment_integration.py         # ✅ Script de pruebas
├── SEMANA2_NESTOR_PAYMENT_GUIDE.md    # ✅ Documentación
└── main.py                             # ✅ Actualizado

```

## 🔄 Flujo de Datos (Semana 2)

```
Cliente REST → pago_routes.py → payment_controller.py → payment_client.py → Payment Service (Odalia)
                                     ↓
                              MongoDB (actualizar reserva)
```

## 🧪 Cómo Probar

### Terminal 1 - REST API

```powershell
cd backend/rest-api
python -m uvicorn main:app --reload --port 8000
```

### Terminal 2 - Payment Service (Odalia debe hacer esto)

```powershell
# Odalia ejecuta desde su carpeta
cd backend/payment-service
npm run dev
# o
yarn dev
```

### Terminal 3 - Ejecutar Pruebas

```powershell
cd backend/rest-api
python test_payment_integration.py
```

## 📝 Commits Requeridos (Mínimo 5 por semana)

Sugerencias de commits:

```bash
git add app/services/payment_client.py
git commit -m "feat(payment): implementar cliente HTTP con firma HMAC"

git add app/controllers/payment_controller.py
git commit -m "feat(payment): agregar controlador de pagos"

git add app/routes/pago_routes.py
git commit -m "feat(api): crear endpoints de pagos /api/pagos"

git add main.py
git commit -m "feat(api): integrar rutas de pago en FastAPI"

git add test_payment_integration.py SEMANA2_NESTOR_PAYMENT_GUIDE.md
git commit -m "docs: agregar guía y tests de integración de pagos"
```

## 🔐 Seguridad

- ✅ JWT requerido en todos los endpoints de pago
- ✅ HMAC-SHA256 para firma de requests
- ✅ Validación de user_id en cada operación
- ✅ Manejo de errores sin exponer detalles internos

## ⚠️ Dependencias Externas

| Servicio        | Puerto | Estado        | Responsable    |
| --------------- | ------ | ------------- | -------------- |
| MongoDB         | 27017  | Tu setup      | Local          |
| REST API        | 8000   | En desarrollo | Tú (Nestor)    |
| Payment Service | 8200   | En desarrollo | Odalia         |
| GraphQL         | 4000   | Existente     | Abigail/Odalia |
| WebSocket       | 8080   | Existente     | Abigail/Odalia |

## 📞 Contacto y Coordinación

- **Odalia (Lider):** Coordina Payment Service y n8n
- **Abigail:** Frontend con formulario de pago
- **Tú (Nestor):** REST API y validación de webhooks

En Semana 3, coordina con Odalia para testear webhooks bidireccionales.

---

**Nota:** No hagas commits aún. Solo implementa el código, pruébalo localmente y cuando esté funcionando, haz los commits con mensajes descriptivos.
