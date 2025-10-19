# 🧪 Ejemplos de JSONs para Thunder Client - Backend TypeScript

## 📋 Guía de Uso

### 1. **Importar en Thunder Client**
- Abre Thunder Client en VS Code


### 2. **Configurar Base URL**
- URL Base: `http://localhost:3000/api`
- Puerto por defecto: `3000`

---

## 🏃‍♂️ **GUÍAS** - Ejemplos de Request Bodies

### ➕ Crear Guía - POST /api/guias
```json
{
  "id_guia": 1,
  "nombre": "Carlos Mendoza",
  "idiomas": "Español, Inglés",
  "experiencia": "8 años en turismo de aventura",
  "email": "carlos.mendoza@gmail.com",
  "telefono": "+51 987123456",
  "disponible": true
}
```

### ➕ Crear Guía Especializada - POST /api/guias
```json
{
  "id_guia": 2,
  "nombre": "Ana Quispe",
  "idiomas": "Español, Quechua, Inglés",
  "experiencia": "10 años especializándose en turismo arqueológico",
  "email": "ana.quispe@outlook.com",
  "telefono": "+51 976543210",
  "disponible": true
}
```

### ✏️ Actualizar Guía - PUT /api/guias/1
```json
{
  "nombre": "Carlos Mendoza Silva",
  "idiomas": "Español, Inglés, Francés",
  "experiencia": "9 años en turismo de aventura y cultural",
  "email": "carlos.mendoza.nuevo@gmail.com",
  "telefono": "+51 987123456",
  "disponible": false
}
```

### 🔄 Cambiar Disponibilidad - PATCH /api/guias/1/disponibilidad
```json
{
  "disponible": true
}
```

---

## 🚌 **TOURS** - Ejemplos de Request Bodies

### ➕ Crear Tour Económico - POST /api/tours
```json
{
  "id_tour": 1,
  "nombre": "Tour Valle Sagrado Básico",
  "descripcion": "Visita los principales puntos del Valle Sagrado: Pisac, Ollantaytambo y Chinchero. Incluye transporte compartido y guía grupal.",
  "duracion": "1 día (10 horas)",
  "precio": 85.00,
  "capacidad_maxima": 25,
  "disponible": true,
  "id_guia": 1
}
```

### ➕ Crear Tour Premium - POST /api/tours
```json
{
  "nombre": "Tour Cusco Ciudad Imperial VIP",
  "descripcion": "Recorrido exclusivo por Cusco con transporte privado, guía personalizado, entradas a museos y cena en restaurante gourmet.",
  "duracion": "8 horas",
  "precio": 420.00,
  "capacidad_maxima": 6,
  "disponible": true,
  "id_guia": 1
}
```

### ➕ Crear Tour de Aventura - POST /api/tours
```json
{
  "nombre": "Rafting en Urubamba + Almuerzo",
  "descripcion": "Aventura en aguas bravas del río Urubamba, nivel intermedio. Incluye equipo completo, instructor certificado y almuerzo campestre.",
  "duracion": "6 horas",
  "precio": 120.00,
  "capacidad_maxima": 12,
  "disponible": true,
  "id_guia": 1
}
```

### ✏️ Actualizar Tour - PUT /api/tours/1
```json
{
  "nombre": "Tour Valle Sagrado Premium",
  "descripcion": "Versión mejorada del tour al Valle Sagrado con transporte privado, guía exclusivo, almuerzo en restaurant local y entrada a sitios arqueológicos.",
  "duracion": "1 día (12 horas)",
  "precio": 150.00,
  "capacidad_maxima": 15,
  "disponible": true,
  "id_guia": 1
}
```

---

## 📅 **RESERVAS** - Ejemplos de Request Bodies

### ➕ Crear Reserva Individual - POST /api/reservas
```json
{
  "id_reserva": 1,
  "id_tour": 1,
  "id_usuario": 3,
  "fecha_reserva": "2025-10-25T07:30:00.000Z",
  "cantidad_personas": 1,
  "precio_total": 85.00,
  "estado": "pendiente"
}
```

### ➕ Crear Reserva de Pareja - POST /api/reservas
```json
{
  "id_tour": 2,
  "id_usuario": 4,
  "fecha_reserva": "2025-11-10T08:00:00.000Z",
  "cantidad_personas": 2,
  "precio_total": 840.00,
  "estado": "confirmada"
}
```

### ➕ Crear Reserva Grupal - POST /api/reservas
```json
{
  "id_tour": 3,
  "id_usuario": 5,
  "fecha_reserva": "2025-12-05T09:00:00.000Z",
  "cantidad_personas": 8,
  "precio_total": 960.00,
  "estado": "pendiente"
}
```

### ✏️ Actualizar Reserva - PUT /api/reservas/1
```json
{
  "id_tour": 1,
  "id_usuario": 3,
  "fecha_reserva": "2025-10-30T08:00:00.000Z",
  "cantidad_personas": 2,
  "precio_total": 170.00,
  "estado": "confirmada"
}
```

---

## 🎯 **Estados de Reserva Válidos**
- `"pendiente"` - Reserva creada, esperando confirmación
- `"confirmada"` - Reserva confirmada y lista
- `"cancelada"` - Reserva cancelada

---

## 🔍 **URLs de Prueba Principales**

### Guías
- `GET http://localhost:3000/api/guias` - Todas las guías
- `GET http://localhost:3000/api/guias/disponibles` - Solo disponibles
- `GET http://localhost:3000/api/guias/1` - Guía específica

### Tours  
- `GET http://localhost:3000/api/tours` - Todos los tours
- `GET http://localhost:3000/api/tours/disponibles` - Solo disponibles
- `GET http://localhost:3000/api/tours/1` - Tour específico

### Reservas
- `GET http://localhost:3000/api/reservas` - Todas las reservas
- `GET http://localhost:3000/api/reservas/usuario/1` - Por usuario
- `GET http://localhost:3000/api/reservas/1` - Reserva específica

---

## ⚡ **Tips para las Pruebas**

1. **Orden recomendado:**
   - Crear guías primero
   - Luego crear tours
   - Finalmente crear reservas

2. **IDs de prueba:**
   - Usa IDs secuenciales (1, 2, 3...)
   - Los IDs en las URLs deben existir

3. **Fechas:**
   - Usa formato ISO: `"2025-10-15T09:00:00.000Z"`
   - Fechas futuras para reservas

4. **Validaciones:**
   - Nombres mínimo 3 caracteres
   - Emails válidos requeridos
   - Precios deben ser números positivos
   - **precio_total es requerido** en las reservas

5. **Cálculo de precio_total:**
   - precio_total = precio del tour × cantidad_personas
   - Ejemplo: Tour de $85 × 2 personas = $170

---

## 🚀 **Ejecutar el Servidor**
```bash
cd backend/typescritp-tour-reversa-guia
npm install
npm run dev
```

¡Listo para probar! 🎉