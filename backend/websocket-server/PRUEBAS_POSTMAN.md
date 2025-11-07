# 🧪 PRUEBAS WEBSOCKET EN POSTMAN - GUÍA PASO A PASO

Esta guía te lleva por todas las pruebas necesarias para validar el servidor WebSocket.

---

## 📑 ÍNDICE RÁPIDO

### 🎯 **¿Qué quieres probar?**

**Opción A: Simular el backend REST enviando notificaciones** (Recomendado primero)
- 👉 Ve a **FASE 2** - Usa HTTP POST a `/notify`
- Útil para: Integración con Python/FastAPI
- Fácil de probar con una sola conexión

**Opción B: Probar comunicación directa entre clientes WebSocket** ⚡
- 👉 Ve a **FASE 3A** - WebSocket Directo
- Útil para: Chat, notificaciones peer-to-peer
- Necesitas: 2 conexiones WebSocket abiertas

**Opción C: Hacer todas las pruebas completas**
- 👉 Sigue el orden: FASE 1 → FASE 2 → FASE 3A → FASE 3B → FASE 4

---

## ✅ PRE-REQUISITOS

Antes de empezar, verifica:
- [ ] Servidor WebSocket corriendo en `http://localhost:8080`
- [ ] Postman instalado y abierto
- [ ] Navegador web disponible

---

## 📋 PLAN DE PRUEBAS COMPLETO

### **FASE 1: PRUEBAS BÁSICAS DE CONECTIVIDAD**

#### ✅ PRUEBA 1: Conexión WebSocket
**Objetivo:** Verificar que puedes conectarte al servidor

**Pasos:**
1. Abre Postman
2. Click en **"New"** → **"WebSocket Request"** (ícono ⚡)
3. En la URL escribe: `ws://localhost:8080/ws`
4. Click en **"Connect"**

**Resultado esperado:**
- ✅ Estado cambia a **"Connected"** (verde)
- ✅ En la terminal del servidor Go aparece: `✅ Nuevo cliente conectado`

---

#### ✅ PRUEBA 2: Interfaz Web
**Objetivo:** Verificar la página de prueba del servidor

**Pasos:**
1. Abre tu navegador (Chrome, Firefox, Edge)
2. Ve a: `http://localhost:8080/`
3. Click en el botón **"Conectar"**

**Resultado esperado:**
- ✅ Botón cambia a **"Conectado"** (verde)
- ✅ Aparece mensaje: **"Conexión establecida exitosamente"**
- ✅ Contador de notificaciones y tiempo conectado funcionando

---

### **FASE 2: ENVÍO DE MENSAJES VÍA HTTP** (Recomendado para simular backend)

> 💡 **Nota:** Estas pruebas usan el endpoint HTTP `/notify` para simular que el backend REST envía notificaciones.
> Si quieres probar **WebSocket directo** (cliente a cliente), ve a la **FASE 3A**.

#### ✅ PRUEBA 3: Mensaje HTTP básico
**Objetivo:** Enviar notificación desde el backend simulado

**Pasos:**
1. En Postman, crea una **nueva petición HTTP** (no WebSocket)
2. **Método:** POST
3. **URL:** `http://localhost:8080/notify`
4. **Headers:** Agrega `Content-Type: application/json`
5. **Body** → raw → JSON:
```json
{
  "type": "test",
  "message": "¡Prueba básica funcionando!",
  "data": {
    "test_id": 1,
    "timestamp": "2025-11-07"
  }
}
```
6. Click **"Send"**

**Resultado esperado:**
- ✅ Respuesta 200 OK:
```json
{
  "status": "success",
  "message": "Notificación enviada a todos los clientes"
}
```
- ✅ En el navegador (`http://localhost:8080/`) aparece la notificación
- ✅ En Postman WebSocket (si está conectado) aparece el mensaje en azul (↓)

---

#### ✅ PRUEBA 4: Usuario Registrado
**Objetivo:** Simular registro de nuevo usuario

**HTTP POST a:** `http://localhost:8080/notify`
```json
{
  "type": "usuario_registrado",
  "message": "Nuevo usuario registrado: María López",
  "data": {
    "userId": "user_001",
    "nombre": "María López",
    "email": "maria@example.com",
    "rol": "turista",
    "fecha": "2025-11-07T10:30:00"
  }
}
```

**Verificar:**
- [ ] Mensaje aparece en el navegador
- [ ] Tipo de notificación es `usuario_registrado`
- [ ] Datos completos visibles

---

#### ✅ PRUEBA 5: Reserva Creada
**Objetivo:** Simular creación de reserva

**HTTP POST a:** `http://localhost:8080/notify`
```json
{
  "type": "reserva_creada",
  "message": "Nueva reserva: Tour Los Frailes Experience",
  "data": {
    "reservaId": "res_001",
    "tourNombre": "Tour Los Frailes Experience",
    "tourId": "690bc0bae6a2a266250057ae",
    "usuarioNombre": "María López",
    "cantidad_personas": 2,
    "fecha_reserva": "2025-12-15",
    "total": 90,
    "estado": "pendiente"
  }
}
```

**Verificar:**
- [ ] Mensaje aparece en el navegador
- [ ] Información de la reserva visible
- [ ] Total y cantidad de personas correctos

---

#### ✅ PRUEBA 6: Promoción (Broadcast)
**Objetivo:** Enviar notificación masiva

**HTTP POST a:** `http://localhost:8080/notify`
```json
{
  "type": "promocion",
  "message": "¡OFERTA ESPECIAL! 30% de descuento en tours de playa",
  "data": {
    "descuento": 30,
    "valido_hasta": "2025-12-31",
    "codigo": "PLAYA30",
    "tours_incluidos": ["playa", "isla"],
    "url": "/promociones/playa30"
  }
}
```

**Verificar:**
- [ ] Todos los clientes conectados reciben el mensaje
- [ ] Datos de la promoción completos

---

#### ✅ PRUEBA 7: Reserva Actualizada
**Objetivo:** Notificar cambio de estado

**HTTP POST a:** `http://localhost:8080/notify`
```json
{
  "type": "reserva_actualizada",
  "message": "Tu reserva ha sido confirmada",
  "data": {
    "reservaId": "res_001",
    "tourNombre": "Tour Los Frailes Experience",
    "estado_anterior": "pendiente",
    "estado_nuevo": "confirmada",
    "fecha_actualizacion": "2025-11-07T11:00:00"
  }
}
```

**Verificar:**
- [ ] Mensaje de confirmación visible
- [ ] Cambio de estado claro

---

#### ✅ PRUEBA 8: Servicio Contratado
**Objetivo:** Notificar contratación de servicio

**HTTP POST a:** `http://localhost:8080/notify`
```json
{
  "type": "servicio_contratado",
  "message": "Servicio contratado: Spa Relajación Natural",
  "data": {
    "contratacionId": "cont_001",
    "servicioNombre": "Spa Relajación Natural",
    "servicioId": "690bcb10b63e3a4b72ef3b0a",
    "usuarioNombre": "María López",
    "cantidad_personas": 2,
    "total": 140,
    "fecha_inicio": "2025-11-20",
    "duracion": "4 horas"
  }
}
```

**Verificar:**
- [ ] Información del servicio correcta
- [ ] Detalles de contratación visibles

---

### **FASE 3: PRUEBAS AVANZADAS**

---

### **FASE 3A: WEBSOCKET DIRECTO (Cliente a Cliente)** ⚡

> 🎯 **IMPORTANTE:** Aquí comienzan las pruebas con **WebSocket directo** sin usar `/notify`.
> Necesitas **2 clientes conectados** para ver los mensajes (el que envía NO lo ve en su propia conexión).

#### ✅ PRUEBA 9A: Mensaje WebSocket Directo (2 Pestañas Postman)

**Objetivo:** Verificar broadcast directo entre clientes WebSocket

**Setup:**
1. **Pestaña 1:** Postman WebSocket → `ws://localhost:8080/ws` → Connect
2. **Pestaña 2:** Postman WebSocket → `ws://localhost:8080/ws` → Connect
3. (Opcional) **Navegador:** `http://localhost:8080/` → Conectar

**Paso 1:** En la **Pestaña 1**, envía:
```json
{
  "type": "test_directo",
  "message": "Mensaje directo desde WebSocket Pestaña 1",
  "data": {
    "origen": "postman_pestaña_1",
    "test_id": 1
  }
}
```

**Resultado esperado:**
- ✅ En **Pestaña 2** aparece el mensaje en **azul** (↓ recibido)
- ✅ En el **navegador** aparece la notificación
- ❌ En **Pestaña 1** (la que envió) NO aparece (comportamiento normal)

---

#### ✅ PRUEBA 9B: Usuario Registrado (WebSocket Directo)

**Envía desde cualquier pestaña WebSocket:**
```json
{
  "type": "usuario_registrado",
  "message": "Usuario registrado vía WebSocket directo",
  "data": {
    "userId": "user_ws_direct_001",
    "nombre": "Pedro Ramírez",
    "email": "pedro@example.com",
    "rol": "turista"
  }
}
```

**Verificar:**
- [ ] Todas las **OTRAS** conexiones reciben el mensaje
- [ ] Aparece en el navegador
- [ ] Datos completos visibles

---

#### ✅ PRUEBA 9C: Reserva Creada (WebSocket Directo)

```json
{
  "type": "reserva_creada",
  "message": "Reserva creada vía WebSocket directo",
  "data": {
    "reservaId": "res_ws_001",
    "tourNombre": "Tour Bosque de Pacoche",
    "cantidad_personas": 3,
    "total": 105,
    "fecha_reserva": "2025-12-20"
  }
}
```

---

#### ✅ PRUEBA 9D: Promoción (WebSocket Directo)

```json
{
  "type": "promocion",
  "message": "¡Promoción flash! 40% OFF",
  "data": {
    "descuento": 40,
    "codigo": "FLASH40",
    "valido_hasta": "2025-11-10",
    "urgente": true
  }
}
```

---

### **FASE 3B: PRUEBAS AVANZADAS COMBINADAS**

#### ✅ PRUEBA 9: Múltiples Clientes Conectados
**Objetivo:** Verificar broadcast a varios clientes

**Pasos:**
1. **Cliente 1:** Mantén el navegador conectado en `http://localhost:8080/`
2. **Cliente 2:** Abre Postman WebSocket conectado a `ws://localhost:8080/ws`
3. **Cliente 3:** Abre otra pestaña del navegador en modo incógnito con `http://localhost:8080/`
4. Envía un mensaje HTTP POST a `/notify`

**Resultado esperado:**
- ✅ **TODOS** los clientes reciben el mensaje simultáneamente
- ✅ Contador en el servidor muestra múltiples clientes conectados

---

#### ✅ PRUEBA 10: Secuencia de Eventos
**Objetivo:** Simular flujo completo de reserva

**Envía estos mensajes en orden:**

**1. Usuario inicia sesión:**
```json
{
  "type": "usuario_inicio_sesion",
  "message": "María López ha iniciado sesión",
  "data": {"usuarioNombre": "María López", "hora": "10:00"}
}
```

**2. Crea reserva (espera 5 segundos):**
```json
{
  "type": "reserva_creada",
  "message": "Nueva reserva creada",
  "data": {"reservaId": "res_002", "tourNombre": "Tour Bosque de Pacoche", "total": 70}
}
```

**3. Confirma reserva (espera 5 segundos):**
```json
{
  "type": "reserva_actualizada",
  "message": "Reserva confirmada",
  "data": {"reservaId": "res_002", "estado": "confirmada"}
}
```

**Verificar:**
- [ ] Los 3 mensajes aparecen en orden
- [ ] Secuencia lógica clara
- [ ] Tiempos de espera respetados

---

#### ✅ PRUEBA 11: Reconexión
**Objetivo:** Verificar manejo de desconexiones

**Pasos:**
1. Conecta el WebSocket en Postman
2. Click en **"Disconnect"**
3. Espera 3 segundos
4. Click en **"Connect"** nuevamente
5. Envía un mensaje HTTP

**Resultado esperado:**
- ✅ Reconexión exitosa
- ✅ Mensajes se reciben después de reconectar
- ✅ Sin errores en la terminal del servidor

---

### **FASE 4: PRUEBAS DE TIPOS DE EVENTOS**

#### ✅ PRUEBA 12: Recomendación Creada
```json
{
  "type": "recomendacion_creada",
  "message": "Nueva recomendación con 5 estrellas",
  "data": {
    "recomendacionId": "rec_001",
    "calificacion": 5,
    "comentario": "Excelente tour, muy recomendado",
    "usuarioNombre": "María López",
    "tipo": "tour",
    "referencia": "Tour Los Frailes"
  }
}
```

#### ✅ PRUEBA 13: Tour Creado (Admin)
```json
{
  "type": "tour_creado",
  "message": "Nuevo tour disponible: Galápagos Adventure",
  "data": {
    "tourId": "tour_new_001",
    "nombre": "Galápagos Adventure",
    "precio": 1200,
    "duracion": "5 días",
    "destino": "Islas Galápagos",
    "guia": "Carlos Mendoza"
  }
}
```

#### ✅ PRUEBA 14: Destino Actualizado
```json
{
  "type": "destino_actualizado",
  "message": "Destino actualizado: Playa Los Frailes",
  "data": {
    "destinoId": "690afb1a7511bb8838a8061c",
    "nombre": "Playa Los Frailes",
    "cambios": "Calificación actualizada a 5 estrellas",
    "calificacion_nueva": 5
  }
}
```

#### ✅ PRUEBA 15: Sistema - Mantenimiento
```json
{
  "type": "sistema",
  "message": "Mantenimiento programado del sistema",
  "data": {
    "fecha": "2025-11-10",
    "hora_inicio": "02:00 AM",
    "hora_fin": "04:00 AM",
    "afecta": "reservas y pagos",
    "duracion_estimada": "2 horas"
  }
}
```

---

## 📊 CHECKLIST DE VALIDACIÓN

Marca cada prueba completada:

### **Conectividad:**
- [ ] Prueba 1: Conexión WebSocket en Postman
- [ ] Prueba 2: Interfaz web funciona

### **Mensajes HTTP (simula backend):**
- [ ] Prueba 3: Mensaje básico
- [ ] Prueba 4: Usuario registrado
- [ ] Prueba 5: Reserva creada
- [ ] Prueba 6: Promoción
- [ ] Prueba 7: Reserva actualizada
- [ ] Prueba 8: Servicio contratado

### **WebSocket Directo (cliente a cliente):** ⚡
- [ ] Prueba 9A: Mensaje directo entre pestañas
- [ ] Prueba 9B: Usuario registrado (directo)
- [ ] Prueba 9C: Reserva creada (directo)
- [ ] Prueba 9D: Promoción (directo)

### **Avanzadas Combinadas:**
- [ ] Prueba 9: Múltiples clientes
- [ ] Prueba 10: Secuencia de eventos
- [ ] Prueba 11: Reconexión

### **Tipos de eventos:**
- [ ] Prueba 12: Recomendación
- [ ] Prueba 13: Tour creado
- [ ] Prueba 14: Destino actualizado
- [ ] Prueba 15: Sistema/Mantenimiento

---

## 💡 DIFERENCIAS CLAVE

### **Método HTTP (`/notify`):**
✅ Simula que el **backend REST** envía notificaciones
✅ Todos los clientes WebSocket reciben
✅ Útil para integración con Python/FastAPI
✅ **URL:** `POST http://localhost:8080/notify`

### **Método WebSocket Directo:**
✅ **Cliente a cliente** sin pasar por HTTP
✅ Broadcast automático a OTROS clientes
✅ El que envía NO lo ve (comportamiento normal)
✅ **URL:** `ws://localhost:8080/ws`

---

## 🎯 RESULTADOS ESPERADOS GLOBALES

Al completar todas las pruebas:

✅ **Funcionalidad básica:**
- Conexión y desconexión fluida
- Mensajes enviados y recibidos correctamente
- Broadcast funcionando

✅ **Tipos de eventos:**
- Todos los tipos de eventos implementados
- Datos correctamente formateados
- Mensajes descriptivos claros

✅ **Rendimiento:**
- Sin lag en la entrega de mensajes
- Múltiples clientes sin problemas
- Reconexión automática funciona

✅ **Integración:**
- Endpoint HTTP `/notify` funcional
- Listo para integrar con REST API
- Listo para integrar con Frontend React

---

## 📝 REGISTRO DE PRUEBAS

Documenta tus resultados:

| # | Prueba | Estado | Observaciones |
|---|--------|--------|---------------|
| 1 | Conexión WebSocket | ⬜ | |
| 2 | Interfaz Web | ⬜ | |
| 3 | Mensaje HTTP básico | ⬜ | |
| 4 | Usuario registrado | ⬜ | |
| 5 | Reserva creada | ⬜ | |
| 6 | Promoción | ⬜ | |
| 7 | Reserva actualizada | ⬜ | |
| 8 | Servicio contratado | ⬜ | |
| 9 | Múltiples clientes | ⬜ | |
| 10 | Secuencia eventos | ⬜ | |
| 11 | Reconexión | ⬜ | |
| 12 | Recomendación | ⬜ | |
| 13 | Tour creado | ⬜ | |
| 14 | Destino actualizado | ⬜ | |
| 15 | Sistema | ⬜ | |

---

## 🐛 TROUBLESHOOTING

### ❌ Error: "Cannot connect to ws://localhost:8080/ws"
**Solución:**
```powershell
# Verifica que el servidor esté corriendo:
cd backend/websocket-server
go run .
```

### ❌ Error: "No recibo mensajes en el navegador"
**Solución:**
1. Actualiza la página (F5)
2. Click en "Desconectar" y luego "Conectar"
3. Verifica la consola del navegador (F12) para errores

### ❌ Error: "Postman no se conecta"
**Solución:**
- Usa `ws://` NO `wss://`
- Verifica el puerto 8080 esté libre
- Reinicia Postman

---

**Última actualización:** Noviembre 2025
**Estado:** ✅ Guía completa de pruebas validada

### 1. Verificar que el servidor WebSocket está corriendo

El servidor debe estar ejecutándose en:
- **URL WebSocket:** `ws://localhost:8080/ws`
- **URL HTTP (notify):** `http://localhost:8080/notify`

### 2. Crear conexión WebSocket en Postman

1. **Click en "New"** → **"WebSocket Request"** (ícono de rayo ⚡)
2. **URL:** `ws://localhost:8080/ws`
3. **Click en "Connect"**
4. Verás: **"Connected to ws://localhost:8080/ws"**

---

## 🚀 MENSAJES DE PRUEBA

### 📝 Formato de Mensajes

Todos los mensajes WebSocket deben ser JSON con esta estructura:

```json
{
  "type": "TIPO_DE_EVENTO",
  "message": "Mensaje descriptivo",
  "data": {
    "campo1": "valor1",
    "campo2": "valor2"
  }
}
```

---

## 👤 EVENTOS DE USUARIO

### 1️⃣ Usuario Registrado

```json
{
  "type": "usuario_registrado",
  "message": "Nuevo usuario registrado: Odalis Sengel",
  "data": {
    "userId": "690aeaa89056ad64138ef8c5",
    "nombre": "Odalis",
    "email": "sengeloor14@gmail.com",
    "rol": "turista"
  }
}
```

### 2️⃣ Usuario Inició Sesión

```json
{
  "type": "usuario_inicio_sesion",
  "message": "Odalis ha iniciado sesión",
  "data": {
    "userId": "690aeaa89056ad64138ef8c5",
    "nombre": "Odalis",
    "email": "sengeloor14@gmail.com",
    "hora": "2025-11-07T10:30:00"
  }
}
```

---

## 🎫 EVENTOS DE RESERVA

### 3️⃣ Reserva Creada

```json
{
  "type": "reserva_creada",
  "message": "Nueva reserva para Tour Los Frailes Experience",
  "data": {
    "reservaId": "690bc8e6e6a2a266250057b0",
    "tourNombre": "Tour Los Frailes Experience",
    "tourId": "690bc0bae6a2a266250057ae",
    "usuarioNombre": "Odalis",
    "cantidad_personas": 2,
    "fecha_reserva": "2025-12-15",
    "total": 90
  }
}
```

### 4️⃣ Reserva Actualizada

```json
{
  "type": "reserva_actualizada",
  "message": "Reserva actualizada: estado cambiado a confirmada",
  "data": {
    "reservaId": "690bc8e6e6a2a266250057b0",
    "estado_anterior": "pendiente",
    "estado_nuevo": "confirmada",
    "fecha_actualizacion": "2025-11-07T11:00:00"
  }
}
```

### 5️⃣ Reserva Cancelada

```json
{
  "type": "reserva_cancelada",
  "message": "Reserva cancelada por el usuario",
  "data": {
    "reservaId": "690bc8e6e6a2a266250057b0",
    "tourNombre": "Tour Los Frailes Experience",
    "motivo": "Cambio de planes",
    "fecha_cancelacion": "2025-11-07T12:00:00"
  }
}
```

---

## 🛎️ EVENTOS DE CONTRATACIÓN DE SERVICIOS

### 6️⃣ Servicio Contratado

```json
{
  "type": "servicio_contratado",
  "message": "Servicio contratado: Spa Relajación Natural",
  "data": {
    "contratacionId": "690bcc87b63e3a4b72ef3b0c",
    "servicioNombre": "Spa Relajación Natural",
    "servicioId": "690bcb10b63e3a4b72ef3b0a",
    "usuarioNombre": "Odalis",
    "cantidad_personas": 2,
    "total": 140,
    "fecha_inicio": "2025-11-20"
  }
}
```

---

## ⭐ EVENTOS DE RECOMENDACIÓN

### 7️⃣ Recomendación Creada

```json
{
  "type": "recomendacion_creada",
  "message": "Nueva recomendación publicada con 5 estrellas",
  "data": {
    "recomendacionId": "690c3f1a3b94809991731f56",
    "calificacion": 5,
    "comentario": "Excelente experiencia, muy recomendado",
    "usuarioNombre": "Odalis",
    "tipo": "tour",
    "referencia": "Tour Los Frailes Experience"
  }
}
```

---

## 🎨 EVENTOS DE ADMINISTRACIÓN

### 8️⃣ Tour Creado

```json
{
  "type": "tour_creado",
  "message": "Nuevo tour disponible: Aventura en la Amazonía",
  "data": {
    "tourId": "123456789",
    "nombre": "Aventura en la Amazonía",
    "precio": 250,
    "duracion": "3 días",
    "destino": "Amazonía Ecuatoriana"
  }
}
```

### 9️⃣ Tour Actualizado

```json
{
  "type": "tour_actualizado",
  "message": "Tour actualizado: cambio de precio",
  "data": {
    "tourId": "690bc0bae6a2a266250057ae",
    "nombre": "Tour Los Frailes Experience",
    "precio_anterior": 45,
    "precio_nuevo": 50
  }
}
```

### 🔟 Destino Creado

```json
{
  "type": "destino_creado",
  "message": "Nuevo destino agregado: Quilotoa",
  "data": {
    "destinoId": "123456",
    "nombre": "Laguna del Quilotoa",
    "provincia": "Cotopaxi",
    "categoria": "sierra"
  }
}
```

---

## 📢 NOTIFICACIÓN BROADCAST (A TODOS)

### 1️⃣1️⃣ Promoción Especial

```json
{
  "type": "promocion",
  "message": "¡Oferta especial! 20% de descuento en todos los tours",
  "data": {
    "descuento": 20,
    "valido_hasta": "2025-12-31",
    "codigo": "PROMO2025",
    "tours_incluidos": ["todos"]
  }
}
```

### 1️⃣2️⃣ Mantenimiento del Sistema

```json
{
  "type": "sistema",
  "message": "Mantenimiento programado del sistema",
  "data": {
    "fecha": "2025-11-10",
    "hora_inicio": "02:00",
    "hora_fin": "04:00",
    "afecta": "reservas y pagos"
  }
}
```

---

## 🧪 PRUEBAS AVANZADAS

### Prueba 1: Múltiples Clientes Conectados

1. **Abre 3 pestañas de WebSocket** en Postman
2. Conecta todas a `ws://localhost:8080/ws`
3. Envía un mensaje desde una pestaña
4. **Verás que TODAS las pestañas reciben el mensaje** (broadcast)

### Prueba 2: Enviar desde HTTP (simular backend)

En lugar de usar WebSocket, envía desde HTTP POST:

**URL:** `http://localhost:8080/notify`
**Método:** POST
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "type": "test",
  "message": "Prueba desde HTTP",
  "data": {
    "origen": "postman_http"
  }
}
```

Las conexiones WebSocket abiertas recibirán esta notificación.

### Prueba 3: Simular Flujo Completo de Reserva

**Paso 1 - Conexión inicial:**
```json
{
  "type": "usuario_inicio_sesion",
  "message": "Usuario conectado al sistema",
  "data": {"userId": "test123", "nombre": "Usuario Test"}
}
```

**Paso 2 - Crear reserva:**
```json
{
  "type": "reserva_creada",
  "message": "Nueva reserva creada",
  "data": {"reservaId": "res123", "tourNombre": "Tour Test", "total": 100}
}
```

**Paso 3 - Confirmación:**
```json
{
  "type": "reserva_actualizada",
  "message": "Reserva confirmada",
  "data": {"reservaId": "res123", "estado": "confirmada"}
}
```

---

## 📊 VERIFICACIÓN DE RESPUESTAS

### Respuestas esperadas desde el servidor:

El servidor WebSocket puede responder con mensajes de confirmación:

```json
{
  "type": "ack",
  "message": "Mensaje recibido correctamente",
  "timestamp": "2025-11-07T10:30:00Z"
}
```

O mensajes de error:

```json
{
  "type": "error",
  "message": "Formato de mensaje inválido",
  "details": "Campo 'type' es requerido"
}
```

---

## 🎯 CHECKLIST DE PRUEBAS

✅ **Conectividad:**
- [ ] Conexión WebSocket exitosa
- [ ] Desconexión y reconexión automática
- [ ] Múltiples clientes simultáneos

✅ **Eventos de Usuario:**
- [ ] Usuario registrado
- [ ] Usuario inició sesión

✅ **Eventos de Reserva:**
- [ ] Reserva creada
- [ ] Reserva actualizada
- [ ] Reserva cancelada

✅ **Eventos de Servicios:**
- [ ] Servicio contratado

✅ **Eventos de Admin:**
- [ ] Tour creado/actualizado
- [ ] Destino creado/actualizado

✅ **Notificaciones Broadcast:**
- [ ] Promociones
- [ ] Alertas del sistema

✅ **Integración HTTP:**
- [ ] Envío desde endpoint `/notify`
- [ ] Recepción en clientes WebSocket

---

## 🐛 TROUBLESHOOTING

### Problema: "No se puede conectar al WebSocket"

✅ **Solución:**
1. Verificar que el servidor esté corriendo: `go run .`
2. Verificar que el puerto 8080 esté libre
3. Usar `ws://` y no `wss://` (sin SSL en desarrollo)

### Problema: "Mensaje no se envía a otros clientes"

✅ **Solución:**
- El servidor hace broadcast automáticamente
- Verifica que tienes múltiples pestañas WebSocket abiertas
- Revisa la consola del servidor Go para errores

### Problema: "Mensaje con formato incorrecto"

✅ **Solución:**
- Asegúrate de enviar JSON válido
- El campo `type` es obligatorio
- Usa comillas dobles (") no simples (')

---

## 📝 NOTAS IMPORTANTES

- ⚡ El WebSocket es **bidireccional**: puedes enviar y recibir
- 📡 **Broadcast automático**: todos los clientes reciben los mensajes
- 🔄 **Reconexión**: si pierdes conexión, recconecta manualmente en Postman
- 🎨 **Testing visual**: usa `http://localhost:8080/` en el navegador

---

**Última actualización:** Noviembre 2025
**Estado:** ✅ Todos los ejemplos probados y funcionando
