# 🌩️ Ejemplos Thunder Client - API Go Servicios Turísticos

Ejemplos de peticiones para probar todos los endpoints del servidor Go en Thunder Client.

**Base URL:** `http://localhost:8080`

---

## 📋 ÍNDICE

1. [Health Check](#health-check)
2. [Servicios Turísticos](#servicios-turísticos)
3. [Contrataciones](#contrataciones)
4. [GraphQL](#graphql)

---

## 🏥 Health Check

### GET - Ping/Health Check
```
GET http://localhost:8080/ping
```

**Respuesta esperada:**
```
pong
```

---

## 🏨 Servicios Turísticos

### 1. GET - Listar Todos los Servicios
```
GET http://localhost:8080/servicios
```

---

### 2. POST - Crear Hotel en Cancún
```
POST http://localhost:8080/servicios
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Hotel Paradise Cancún",
  "descripcion": "Hotel todo incluido de 5 estrellas frente al mar Caribe con acceso directo a playa, 3 albercas, 8 restaurantes gourmet y spa de lujo",
  "precio": 250.00,
  "categoria": "hotel",
  "destino": "cancun",
  "duracion_dias": 7,
  "capacidad_maxima": 2,
  "disponible": true,
  "proveedor": "Paradise Hotels & Resorts",
  "telefono_contacto": "+52 998 123 4567",
  "email_contacto": "reservas@paradisecancun.com"
}
```

---

### 3. POST - Crear Tour a Chichén Itzá
```
POST http://localhost:8080/servicios
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Tour Chichén Itzá + Cenote + Comida Buffet",
  "descripcion": "Visita guiada a la maravilla del mundo Chichén Itzá, nado en cenote sagrado y deliciosa comida buffet yucateca. Incluye transporte desde Cancún",
  "precio": 89.00,
  "categoria": "tour",
  "destino": "chichen_itza",
  "duracion_dias": 1,
  "capacidad_maxima": 40,
  "disponible": true,
  "proveedor": "Maya Tours Experience",
  "telefono_contacto": "+52 999 888 7766",
  "email_contacto": "info@mayatours.com"
}
```

---

### 4. POST - Crear Tour a Tulum
```
POST http://localhost:8080/servicios
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Tour Tulum y Playa Paraíso",
  "descripcion": "Explora las ruinas mayas de Tulum con vista al mar Caribe y disfruta de tiempo libre en la hermosa Playa Paraíso",
  "precio": 75.00,
  "categoria": "tour",
  "destino": "tulum",
  "duracion_dias": 1,
  "capacidad_maxima": 30,
  "disponible": true,
  "proveedor": "Caribbean Adventures",
  "telefono_contacto": "+52 984 555 1234",
  "email_contacto": "tours@caribbeanadv.com"
}
```

---

### 5. POST - Crear Transporte (Traslado)
```
POST http://localhost:8080/servicios
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Traslado Aeropuerto Cancún - Hotel Zona Hotelera",
  "descripcion": "Servicio de transporte privado desde el aeropuerto internacional de Cancún a tu hotel en la zona hotelera. Vehículo climatizado y conductor bilingüe",
  "precio": 35.00,
  "categoria": "transporte",
  "destino": "cancun",
  "duracion_dias": 1,
  "capacidad_maxima": 8,
  "disponible": true,
  "proveedor": "Cancún VIP Transport",
  "telefono_contacto": "+52 998 765 4321",
  "email_contacto": "reservas@cancunviptransport.com"
}
```

---

### 6. POST - Crear Restaurante
```
POST http://localhost:8080/servicios
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Restaurante La Habichuela - Cocina Yucateca",
  "descripcion": "Experiencia gastronómica auténtica con los mejores platillos yucatecos en ambiente tropical. Especialidad en cochinita pibil y pescado a la tikin-xic",
  "precio": 45.00,
  "categoria": "restaurante",
  "destino": "cancun",
  "duracion_dias": 1,
  "capacidad_maxima": 4,
  "disponible": true,
  "proveedor": "Grupo Habichuela",
  "telefono_contacto": "+52 998 887 3158",
  "email_contacto": "reservas@lahabichuela.com"
}
```

---

### 7. POST - Crear Actividad de Aventura
```
POST http://localhost:8080/servicios
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Snorkel en Arrecife Mesoamericano",
  "descripcion": "Increíble experiencia de snorkel en el segundo arrecife de coral más grande del mundo. Incluye equipo completo y guía certificado",
  "precio": 65.00,
  "categoria": "aventura",
  "destino": "cozumel",
  "duracion_dias": 1,
  "capacidad_maxima": 15,
  "disponible": true,
  "proveedor": "Cozumel Dive & Snorkel",
  "telefono_contacto": "+52 987 654 3210",
  "email_contacto": "info@cozumeldive.com"
}
```

---

### 8. POST - Crear Spa
```
POST http://localhost:8080/servicios
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Spa Maya - Masaje Terapéutico y Temazcal",
  "descripcion": "Relájate con un masaje terapéutico de 90 minutos seguido de una sesión de temazcal tradicional maya. Experiencia de purificación total",
  "precio": 120.00,
  "categoria": "spa",
  "destino": "playa_del_carmen",
  "duracion_dias": 1,
  "capacidad_maxima": 2,
  "disponible": true,
  "proveedor": "Maya Wellness Center",
  "telefono_contacto": "+52 984 123 4567",
  "email_contacto": "reservas@mayawellness.com"
}
```

---

### 9. POST - Crear Evento (Boda)
```
POST http://localhost:8080/servicios
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Paquete Boda en la Playa - Todo Incluido",
  "descripcion": "Celebra tu boda soñada frente al mar Caribe. Incluye decoración, ceremonia, banquete para 50 personas, DJ y coordinador de eventos",
  "precio": 5500.00,
  "categoria": "evento",
  "destino": "cancun",
  "duracion_dias": 1,
  "capacidad_maxima": 50,
  "disponible": true,
  "proveedor": "Riviera Maya Weddings",
  "telefono_contacto": "+52 998 999 8888",
  "email_contacto": "bodas@rivieramayaweddings.com"
}
```

---

### 10. POST - Crear Tour Cultural
```
POST http://localhost:8080/servicios
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Tour Cultural Mérida + Hacienda + Cenote",
  "descripcion": "Descubre la Ciudad Blanca de Mérida, visita una hacienda henequenera restaurada y refréscate en un hermoso cenote. Incluye almuerzo regional",
  "precio": 95.00,
  "categoria": "cultural",
  "destino": "merida",
  "duracion_dias": 1,
  "capacidad_maxima": 25,
  "disponible": true,
  "proveedor": "Yucatán Heritage Tours",
  "telefono_contacto": "+52 999 123 7890",
  "email_contacto": "tours@yucatanheritage.com"
}
```

---

## 📅 Contrataciones

> **⚠️ IMPORTANTE - Formato de Contrataciones:**
> 
> El endpoint de contrataciones requiere **SOLO estos campos**:
> - `servicio_id` - ID del servicio a contratar (número)
> - `fecha` - Fecha de la contratación (RFC3339: `2025-10-11T10:00:00Z`)
> - `fecha_inicio` - Inicio del servicio (RFC3339: `2025-12-15T14:00:00Z`)
> - `fecha_fin` - Fin del servicio (RFC3339: `2025-12-22T12:00:00Z`)
> - `num_viajeros` - Número de personas (número)
> - `moneda` - Moneda (`USD`, `MXN`, o `EUR`)
>
> **El total se calcula AUTOMÁTICAMENTE** en el servidor basado en:
> - Precio del servicio × número de viajeros × duración en días
>
> ❌ **NO enviar:** `cliente_nombre`, `cliente_email`, `precio_unitario`, `descuento`, `total`, `estado`, `notas`

---

### 11. GET - Listar Todas las Contrataciones
```
GET http://localhost:8080/contrataciones
```

---

### 12. POST - Crear Contratación de Hotel (7 noches)
```
POST http://localhost:8080/contrataciones
Content-Type: application/json
```

**Body:**
```json
{
  "servicio_id": 1,
  "fecha": "2025-10-11T10:00:00Z",
  "fecha_inicio": "2025-12-15T14:00:00Z",
  "fecha_fin": "2025-12-22T12:00:00Z",
  "num_viajeros": 2,
  "moneda": "USD"
}
```

**Nota:** El total se calcula automáticamente en el servidor.

---

### 13. POST - Crear Contratación de Tour Chichén Itzá
```
POST http://localhost:8080/contrataciones
Content-Type: application/json
```

**Body:**
```json
{
  "servicio_id": 2,
  "fecha": "2025-10-11T10:00:00Z",
  "fecha_inicio": "2025-11-20T07:00:00Z",
  "fecha_fin": "2025-11-20T19:00:00Z",
  "num_viajeros": 4,
  "moneda": "USD"
}
```

**Nota:** El total se calcula automáticamente según el precio del servicio y número de viajeros.

---

### 14. POST - Crear Contratación de Transporte
```
POST http://localhost:8080/contrataciones
Content-Type: application/json
```

**Body:**
```json
{
  "servicio_id": 4,
  "fecha": "2025-10-11T10:00:00Z",
  "fecha_inicio": "2025-11-15T16:30:00Z",
  "fecha_fin": "2025-11-15T17:30:00Z",
  "num_viajeros": 3,
  "moneda": "USD"
}
```

---

### 15. POST - Crear Contratación de Restaurante
```
POST http://localhost:8080/contrataciones
Content-Type: application/json
```

**Body:**
```json
{
  "servicio_id": 6,
  "fecha": "2025-10-11T10:00:00Z",
  "fecha_inicio": "2025-12-01T20:00:00Z",
  "fecha_fin": "2025-12-01T22:30:00Z",
  "num_viajeros": 2,
  "moneda": "USD"
}
```

---

### 16. POST - Crear Contratación de Snorkel
```
POST http://localhost:8080/contrataciones
Content-Type: application/json
```

**Body:**
```json
{
  "servicio_id": 7,
  "fecha": "2025-10-11T10:00:00Z",
  "fecha_inicio": "2025-11-25T09:00:00Z",
  "fecha_fin": "2025-11-25T14:00:00Z",
  "num_viajeros": 6,
  "moneda": "USD"
}
```

---

### 17. POST - Crear Contratación de Spa
```
POST http://localhost:8080/contrataciones
Content-Type: application/json
```

**Body:**
```json
{
  "servicio_id": 8,
  "fecha": "2025-10-11T10:00:00Z",
  "fecha_inicio": "2025-12-10T15:00:00Z",
  "fecha_fin": "2025-12-10T18:00:00Z",
  "num_viajeros": 2,
  "moneda": "USD"
}
```

---

### 18. POST - Crear Contratación de Boda
```
POST http://localhost:8080/contrataciones
Content-Type: application/json
```

**Body:**
```json
{
  "servicio_id": 9,
  "fecha": "2025-10-11T10:00:00Z",
  "fecha_inicio": "2026-03-20T16:00:00Z",
  "fecha_fin": "2026-03-20T23:00:00Z",
  "num_viajeros": 50,
  "moneda": "USD"
}
```

---

### 19. POST - Crear Contratación de Tour Tulum
```
POST http://localhost:8080/contrataciones
Content-Type: application/json
```

**Body:**
```json
{
  "servicio_id": 3,
  "fecha": "2025-10-05T08:00:00Z",
  "fecha_inicio": "2025-10-15T08:00:00Z",
  "fecha_fin": "2025-10-15T17:00:00Z",
  "num_viajeros": 3,
  "moneda": "USD"
}
```

---

### 20. POST - Crear Contratación de Transporte Express
```
POST http://localhost:8080/contrataciones
Content-Type: application/json
```

**Body:**
```json
{
  "servicio_id": 5,
  "fecha": "2025-10-11T10:00:00Z",
  "fecha_inicio": "2025-11-10T07:00:00Z",
  "fecha_fin": "2025-11-10T19:00:00Z",
  "num_viajeros": 2,
  "moneda": "USD"
}
```

---

## 🔍 GraphQL

### 21. GraphQL - Consulta de Servicios
```
POST http://localhost:8080/graphql
Content-Type: application/json
```

**Body:**
```json
{
  "query": "query { servicios { id nombre descripcion precio categoria destino disponible proveedor } }"
}
```

---

### 22. GraphQL - Consulta de Servicios por Categoría
```
POST http://localhost:8080/graphql
Content-Type: application/json
```

**Body:**
```json
{
  "query": "query { serviciosPorCategoria(categoria: \"hotel\") { id nombre precio destino capacidad_maxima } }"
}
```

---

### 23. GraphQL - Consulta de Contrataciones
```
POST http://localhost:8080/graphql
Content-Type: application/json
```

**Body:**
```json
{
  "query": "query { contrataciones { id servicio_id cliente_nombre cliente_email fecha_inicio fecha_fin num_viajeros total estado } }"
}
```

---

### 24. GraphQL - Crear Servicio
```
POST http://localhost:8080/graphql
Content-Type: application/json
```

**Body:**
```json
{
  "query": "mutation { crearServicio(input: { nombre: \"Hotel Test GraphQL\", descripcion: \"Hotel de prueba\", precio: 150.00, categoria: \"hotel\", destino: \"cancun\", duracion_dias: 3, capacidad_maxima: 2, disponible: true, proveedor: \"Test Provider\", telefono_contacto: \"+52 998 000 0000\", email_contacto: \"test@test.com\" }) { id nombre precio } }"
}
```

---

## 📊 Categorías y Destinos Disponibles

### Categorías de Servicios:
- `hotel` - Hoteles y alojamiento
- `tour` - Tours y excursiones
- `transporte` - Transporte y traslados
- `restaurante` - Restaurantes
- `actividad` - Actividades generales
- `evento` - Eventos especiales
- `spa` - Spa y bienestar
- `aventura` - Actividades de aventura
- `cultural` - Tours culturales
- `gastronomico` - Experiencias gastronómicas

### Destinos Turísticos:
- `cancun` - Cancún
- `playa_del_carmen` - Playa del Carmen
- `tulum` - Tulum
- `cozumel` - Cozumel
- `merida` - Mérida
- `chichen_itza` - Chichén Itzá

### Estados de Contratación:
- `pendiente` - Reserva creada, pendiente de confirmación
- `confirmada` - Reserva confirmada por el proveedor
- `pagada` - Pago procesado exitosamente
- `en_progreso` - Servicio en curso
- `completada` - Servicio completado exitosamente
- `cancelada` - Reserva cancelada
- `reembolsada` - Reembolso procesado
- `vencida` - Reserva expirada

### Monedas Soportadas:
- `USD` - Dólar estadounidense
- `MXN` - Peso mexicano
- `EUR` - Euro

---

## 💡 Tips para Thunder Client

1. **Importar colección**: Puedes copiar estos ejemplos directamente en Thunder Client
2. **Variables de entorno**: Crea una variable `baseUrl` con valor `http://localhost:8080`
3. **Headers comunes**: Configura `Content-Type: application/json` en tu colección
4. **Orden de pruebas**: 
   - Primero crea servicios (ejemplos 2-10)
   - Luego crea contrataciones usando los IDs de servicios creados (ejemplos 12-20)
5. **Verificación**: Usa los GET (ejemplos 1, 11) para verificar tus datos creados

---

## 🚀 Pruebas Rápidas

### Secuencia recomendada para pruebas completas:

1. ✅ Health check (ejemplo 1)
2. 📝 Crear 3-4 servicios variados (ejemplos 2-5)
3. 📋 Listar servicios para ver los IDs (ejemplo 11)
4. 🎫 Crear 2-3 contrataciones (ejemplos 12-14)
5. 📊 Listar contrataciones para verificar (ejemplo 11)
6. 🔍 Probar GraphQL (ejemplos 21-24)

---

**¡Listo para probar! 🎉**

Todos estos ejemplos son funcionales y están listos para usar en Thunder Client o cualquier cliente REST.
