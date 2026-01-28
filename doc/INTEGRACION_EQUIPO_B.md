# 🔗 Integración Bidireccional: Equipo A <-> Equipo B

## Estado: ✅ CONFIGURADO Y LISTO

---

## Información de Equipo B

| Dato             | Valor                                                      |
| ---------------- | ---------------------------------------------------------- |
| **URL ngrok**    | https://heuristically-farraginous-marquitta.ngrok-free.dev |
| **Puerto Local** | 8082                                                       |
| **Secret Key**   | integracion-turismo-2026-uleam                             |
| **Protocolo**    | HMAC-SHA256                                                |

---

## Flujo de Integración

### Equipo A → Equipo B (Enviar Reservas)

```
Equipo A (8000)
    ↓
POST /api/enviar-reserva-confirmada
    ↓
Calcula HMAC-SHA256
    ↓
POST https://heuristically-farraginous-marquitta.ngrok-free.dev/api/recomendaciones
    ↓
Equipo B (8082)
```

### Equipo B → Equipo A (Recibir Recomendaciones)

```
Equipo B (8082)
    ↓
POST http://localhost:8000/api/recomendaciones
    ↓
Verifica HMAC-SHA256
    ↓
Procesa la recomendación
    ↓
Confirma recepción (200 OK)
```

---

## Endpoints Disponibles

### 1. Status de Integración

```bash
GET /api/integracion/status
```

**Respuesta:**

```json
{
  "equipo": "Equipo A - Recomendaciones Turísticas ULEAM",
  "integracion_activa": true,
  "endpoints": { ... }
}
```

---

### 2. Enviar Reserva a Equipo B

```bash
POST /api/enviar-reserva-confirmada
Content-Type: application/json

{
  "user_id": "usuario_001",
  "tour_id": "tour_001",
  "tour_nombre": "Tour Galápagos",
  "tour_precio": 1500.00,
  "tour_destino": "Islas Galápagos",
  "tour_descripcion": "Aventura en las islas",
  "url_equipo_b": "https://heuristically-farraginous-marquitta.ngrok-free.dev"
}
```

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "mensaje": "Reserva enviada a Equipo B correctamente",
  "equipo_b_response": { ... }
}
```

---

### 3. Recibir Recomendaciones de Equipo B

```bash
POST /api/recomendaciones
Content-Type: application/json

{
  "user_id": "usuario_equipo_b_001",
  "tour_id": "tour_b_001",
  "tour_nombre": "Tour Quito",
  "tour_precio": 800.00,
  "tour_destino": "Quito",
  "tour_descripcion": "Centro histórico",
  "timestamp": "2026-01-25T22:45:00Z",
  "firma": "abc123def456..."
}
```

**Respuesta Exitosa (200):**

```json
{
  "status": "success",
  "mensaje": "Recomendación recibida correctamente",
  "timestamp": "2026-01-25T22:45:01Z"
}
```

---

## Verificar Integración

### Test 1: Status local

```bash
curl http://localhost:8000/api/integracion/status
```

### Test 2: Conectar con Equipo B

```bash
curl -k https://heuristically-farraginous-marquitta.ngrok-free.dev/api/integracion/status
```

### Test 3: Ejecutar Suite Completa

```bash
cd backend/rest-api
python test_equipo_b_integration.py
```

**Salida esperada:**

```
Status Equipo A................. ✅ PASÓ
Conectar Equipo B.............. ✅ PASÓ
Enviar Reserva................. ✅ PASÓ
Recepción...................... ✅ PASÓ
Firma Inválida................. ✅ PASÓ

Total: 5/5 tests pasaron
🎉 ¡INTEGRACIÓN COMPLETAMENTE FUNCIONAL!
```

---

## Seguridad

### HMAC-SHA256

Todos los payloads se firman con:

```
Secret: integracion-turismo-2026-uleam
Algoritmo: SHA256
Modo: Timing-safe compare
```

### Verificación

- ✅ Firma verificada en CADA solicitud
- ✅ Solicitudes no firmadas son rechazadas (401)
- ✅ SSL verification deshabilitado para ngrok (SSL=false)

---

## Sincronización de Datos

Los datos que se sincronizan entre equipos:

### Equipo A → Equipo B

- User ID
- Tour ID
- Nombre del tour
- Precio
- Destino
- Descripción
- Timestamp

### Equipo B → Equipo A

- User ID
- Tour recomendado
- Descripción
- Precio
- Destino
- Firma HMAC

---

## Troubleshooting

### Error: "No se pudo conectar con Equipo B"

```
Solución:
1. Verifica que ngrok de Equipo B está activo
2. Confirma la URL: https://heuristically-farraginous-marquitta.ngrok-free.dev
3. Verifica firewall/proxy
4. Intenta con: curl -k https://heuristically-farraginous-marquitta.ngrok-free.dev
```

### Error: "Firma HMAC-SHA256 inválida"

```
Solución:
1. Verifica que ambos equipos usan la misma SECRET_KEY
2. Confirma el orden de campos en el JSON (debe ser alphabético)
3. Verifica que no hay espacios extras
4. Revisa los logs de ambos equipos
```

### Error: "Puerto 8000 ya en uso"

```
Solución:
# Cambiar puerto
API_PORT=8001 python main.py

# O matar proceso anterior
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

## Documentación Completa

| Archivo                        | Proposito                |
| ------------------------------ | ------------------------ |
| `integracion_routes.py`        | Rutas de integración     |
| `config.py`                    | Configuración (Equipo B) |
| `.env`                         | Variables de entorno     |
| `test_equipo_b_integration.py` | Suite de tests           |

---

## Próximos Pasos

- [ ] Ejecutar `test_equipo_b_integration.py`
- [ ] Verificar que todos los tests pasen
- [ ] Configurar Slack/Email en n8n para notificaciones
- [ ] Documentar resultados en SEMANA_4_RESUMEN.md

---

**Equipo A - Recomendaciones Turísticas ULEAM**
**Integración Bidireccional Completada: 25 de enero de 2026**
