# 🌍 Backend TypeScript - Sistema de Recomendaciones Turísticas

## 📋 Descripción

Backend desarrollado en **TypeScript** con **Express.js** y **TypeORM** para gestionar tours turísticos, guías y reservas. Utiliza **PostgreSQL** como base de datos y proporciona una API REST completa.

## 🚀 Tecnologías Utilizadas

- **Node.js** v18+
- **TypeScript** v5.9
- **Express.js** v5.1 - Framework web
- **TypeORM** v0.3 - ORM para base de datos
- **PostgreSQL** - Base de datos principal
- **Class-validator** - Validación de DTOs
- **Class-transformer** - Transformación de objetos
- **Jest** - Testing framework
- **Nodemon** - Desarrollo en tiempo real

## 📁 Estructura del Proyecto

```
src/
├── config/
│   ├── database.ts         # Configuración de TypeORM
│   └── environment.ts      # Variables de entorno
├── entities/
│   ├── Guia.entity.ts      # Entidad Guía
│   ├── Tour.entity.ts      # Entidad Tour
│   └── Reserva.entity.ts   # Entidad Reserva
├── modules/
│   ├── guias/
│   │   ├── dto/
│   │   │   ├── create-guia.dto.ts
│   │   │   └── update-guia.dto.ts
│   │   ├── guia.controller.ts
│   │   ├── guia.service.ts
│   │   └── guia.routes.ts
│   ├── tours/
│   │   ├── dto/
│   │   │   ├── create-tour.dto.ts
│   │   │   └── update-tour.dto.ts
│   │   ├── tour.controller.ts
│   │   ├── tour.service.ts
│   │   └── tour.routes.ts
│   └── reservas/
│       ├── dto/
│       │   ├── create-reserva.dto.ts
│       │   └── update-reserva.dto.ts
│       ├── reserva.controller.ts
│       ├── reserva.service.ts
│       └── reserva.routes.ts
├── utils/
│   ├── http-client.util.ts  # Cliente HTTP para servicios externos
│   └── response.util.ts     # Utilidades de respuesta
├── tests/                   # Tests unitarios e integración
└── main.ts                  # Punto de entrada
```

## ⚙️ Configuración

### 1. **Variables de Entorno**

Crea un archivo `.env` basado en `.env.example`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=1234
DB_DATABASE=midb
PORT=3000
```

### 2. **Instalación de Dependencias**

```bash
npm install
```

### 3. **Ejecutar en Desarrollo**

```bash
npm run dev
```

### 4. **Ejecutar Tests**

```bash
# Todo los tests
npm test

# Tests de tours
npm run test:tours

# Tests de guías
npm run test:guias

# Tests con cobertura
npm run test:coverage
```

## 📡 API Endpoints

### **Base URL:** `http://localhost:3000/api`

---

## 🏃‍♂️ **GUÍAS**

### **GET /api/guias** - Listar todas las guías
```http
GET http://localhost:3000/api/guias
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Guías obtenidos exitosamente",
  "data": [
    {
      "id_guia": 1,
      "nombre": "Carlos Mendoza",
      "idiomas": "Español, Inglés",
      "experiencia": "8 años en turismo",
      "email": "carlos@ejemplo.com",
      "telefono": "+51 987123456",
      "disponible": true,
      "createdAt": "2025-10-08T04:20:00.000Z",
      "updatedAt": "2025-10-08T04:20:00.000Z"
    }
  ]
}
```

### **GET /api/guias/disponibles** - Listar guías disponibles
```http
GET http://localhost:3000/api/guias/disponibles
```

### **GET /api/guias/:id** - Obtener guía por ID
```http
GET http://localhost:3000/api/guias/1
```

### **POST /api/guias** - Crear nueva guía
```http
POST http://localhost:3000/api/guias
Content-Type: application/json

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

### **PUT /api/guias/:id** - Actualizar guía
```http
PUT http://localhost:3000/api/guias/1
Content-Type: application/json

{
  "nombre": "Carlos Mendoza Silva",
  "idiomas": "Español, Inglés, Francés",
  "experiencia": "9 años en turismo de aventura y cultural",
  "email": "carlos.mendoza.nuevo@gmail.com",
  "telefono": "+51 987123456",
  "disponible": false
}
```

### **PATCH /api/guias/:id/disponibilidad** - Cambiar disponibilidad
```http
PATCH http://localhost:3000/api/guias/1/disponibilidad
Content-Type: application/json

{
  "disponible": true
}
```

### **DELETE /api/guias/:id** - Eliminar guía
```http
DELETE http://localhost:3000/api/guias/1
```

---

## 🚌 **TOURS**

### **GET /api/tours** - Listar todos los tours
```http
GET http://localhost:3000/api/tours
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Tours obtenidos exitosamente",
  "data": [
    {
      "id_tour": 1,
      "nombre": "Tour Machu Picchu Clásico",
      "descripcion": "Descubre la maravilla del mundo",
      "duracion": "1 día completo (12 horas)",
      "precio": 250.00,
      "capacidad_maxima": 15,
      "disponible": true,
      "id_guia": 1,
      "guia": {
        "id_guia": 1,
        "nombre": "Carlos Mendoza"
      },
      "createdAt": "2025-10-08T04:25:00.000Z",
      "updatedAt": "2025-10-08T04:25:00.000Z"
    }
  ]
}
```

### **GET /api/tours/disponibles** - Listar tours disponibles
```http
GET http://localhost:3000/api/tours/disponibles
```

### **GET /api/tours/:id** - Obtener tour por ID
```http
GET http://localhost:3000/api/tours/1
```

### **POST /api/tours** - Crear nuevo tour
```http
POST http://localhost:3000/api/tours
Content-Type: application/json

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

### **PUT /api/tours/:id** - Actualizar tour
```http
PUT http://localhost:3000/api/tours/1
Content-Type: application/json

{
  "nombre": "Tour Valle Sagrado Premium",
  "descripcion": "Versión mejorada del tour al Valle Sagrado con transporte privado, guía exclusivo y almuerzo gourmet.",
  "duracion": "1 día (12 horas)",
  "precio": 150.00,
  "capacidad_maxima": 15,
  "disponible": true,
  "id_guia": 1
}
```

### **PATCH /api/tours/:id/disponibilidad** - Cambiar disponibilidad
```http
PATCH http://localhost:3000/api/tours/1/disponibilidad
Content-Type: application/json

{
  "disponible": false
}
```

### **DELETE /api/tours/:id** - Eliminar tour
```http
DELETE http://localhost:3000/api/tours/1
```

---

## 📅 **RESERVAS**

### **GET /api/reservas** - Listar todas las reservas
```http
GET http://localhost:3000/api/reservas
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Reservas obtenidas exitosamente",
  "data": [
    {
      "id_reserva": 1,
      "id_usuario": 1,
      "fecha_reserva": "2025-10-25T07:30:00.000Z",
      "cantidad_personas": 2,
      "estado": "confirmada",
      "tour": {
        "id_tour": 1,
        "nombre": "Tour Machu Picchu",
        "precio": 250.00
      },
      "createdAt": "2025-10-08T04:30:00.000Z",
      "updatedAt": "2025-10-08T04:30:00.000Z"
    }
  ]
}
```

### **GET /api/reservas/:id** - Obtener reserva por ID
```http
GET http://localhost:3000/api/reservas/1
```

### **GET /api/reservas/usuario/:id_usuario** - Reservas por usuario
```http
GET http://localhost:3000/api/reservas/usuario/1
```

### **POST /api/reservas** - Crear nueva reserva
```http
POST http://localhost:3000/api/reservas
Content-Type: application/json

{
  "id_reserva": 1,
  "id_tour": 1,
  "id_usuario": 1,
  "fecha_reserva": "2025-10-25T07:30:00.000Z",
  "cantidad_personas": 2,
  "estado": "pendiente"
}
```

### **PUT /api/reservas/:id** - Actualizar reserva
```http
PUT http://localhost:3000/api/reservas/1
Content-Type: application/json

{
  "id_tour": 1,
  "id_usuario": 1,
  "fecha_reserva": "2025-10-30T08:00:00.000Z",
  "cantidad_personas": 3,
  "estado": "confirmada"
}
```

### **DELETE /api/reservas/:id** - Cancelar reserva
```http
DELETE http://localhost:3000/api/reservas/1
```

---

## 📋 **Ejemplos de JSONs Adicionales**

### **🏃‍♂️ Más Ejemplos de Guías**

#### Guía Especializada
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

#### Guía Multiidioma
```json
{
  "id_guia": 3,
  "nombre": "Jean-Pierre Dubois",
  "idiomas": "Francés, Español, Inglés",
  "experiencia": "7 años en turismo gastronómico y cultural",
  "email": "jean.pierre@ejemplo.com",
  "telefono": "+51 965432187",
  "disponible": true
}
```

### **🚌 Más Ejemplos de Tours**

#### Tour Premium
```json
{
  "id_tour": 2,
  "nombre": "Tour Cusco Ciudad Imperial VIP",
  "descripcion": "Recorrido exclusivo por Cusco con transporte privado, guía personalizado, entradas a museos y cena en restaurante gourmet.",
  "duracion": "8 horas",
  "precio": 420.00,
  "capacidad_maxima": 6,
  "disponible": true,
  "id_guia": 2
}
```

#### Tour de Aventura
```json
{
  "id_tour": 3,
  "nombre": "Rafting en Urubamba + Almuerzo",
  "descripcion": "Aventura en aguas bravas del río Urubamba, nivel intermedio. Incluye equipo completo, instructor certificado y almuerzo campestre.",
  "duracion": "6 horas",
  "precio": 120.00,
  "capacidad_maxima": 12,
  "disponible": true,
  "id_guia": 3
}
```

### **📅 Más Ejemplos de Reservas**

#### Reserva de Pareja
```json
{
  "id_reserva": 2,
  "id_tour": 2,
  "id_usuario": 2,
  "fecha_reserva": "2025-11-10T08:00:00.000Z",
  "cantidad_personas": 2,
  "estado": "confirmada"
}
```

#### Reserva Grupal
```json
{
  "id_reserva": 3,
  "id_tour": 3,
  "id_usuario": 3,
  "fecha_reserva": "2025-12-05T09:00:00.000Z",
  "cantidad_personas": 8,
  "estado": "pendiente"
}
```

---

## 🎯 **Estados Válidos**

### **Estados de Reserva:**
- `"pendiente"` - Reserva creada, esperando confirmación
- `"confirmada"` - Reserva confirmada y lista
- `"cancelada"` - Reserva cancelada
- `"completada"` - Reserva completada

---

## 🔧 **Validaciones**

### **Guías:**
- `id_guia`: Número obligatorio, único
- `nombre`: String obligatorio, mínimo 3 caracteres, máximo 100
- `idiomas`: String obligatorio, máximo 50 caracteres
- `experiencia`: String obligatorio
- `email`: Email válido obligatorio
- `telefono`: String obligatorio, máximo 20 caracteres
- `disponible`: Boolean opcional, por defecto true

### **Tours:**
- `id_tour`: Número obligatorio, único
- `nombre`: String obligatorio, máximo 150 caracteres
- `descripcion`: String obligatorio
- `duracion`: String obligatorio, máximo 50 caracteres
- `precio`: Número obligatorio, mínimo 0
- `capacidad_maxima`: Número opcional, mínimo 1
- `disponible`: Boolean opcional, por defecto true
- `id_guia`: Número obligatorio, debe existir en tabla guías

### **Reservas:**
- `id_reserva`: Número obligatorio, único
- `id_tour`: Número obligatorio, debe existir en tabla tours
- `id_usuario`: Número obligatorio
- `fecha_reserva`: Fecha ISO string obligatoria
- `cantidad_personas`: Número obligatorio, mínimo 1
- `estado`: String opcional, valores válidos definidos

---

## 📊 **Códigos de Respuesta HTTP**

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa (GET, PUT, PATCH) |
| 201 | Created | Recurso creado exitosamente (POST) |
| 400 | Bad Request | Datos inválidos o incompletos |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

## 🧪 **Testing con Thunder Client**

### **1. Orden Recomendado de Pruebas:**
1. **Crear Guías** primero
2. **Verificar Guías** con GET
3. **Crear Tours** usando IDs de guías válidos
4. **Crear Reservas** usando IDs de tours válidos

### **2. Importar Colección:**
Si tienes un archivo `thunder-client-tests.json`, puedes importarlo directamente en Thunder Client.

### **3. Variables de Entorno:**
- `base_url`: `http://localhost:3000/api`
- `guia_id`: `1`
- `tour_id`: `1`
- `reserva_id`: `1`

---

## 🚨 **Troubleshooting**

### **Error: "El guía especificado no existe"**
- Asegúrate de crear guías antes de crear tours
- Verifica que el `id_guia` en el tour exista

### **Error: "Tour no encontrado"**
- Asegúrate de crear tours antes de crear reservas
- Verifica que el `id_tour` en la reserva exista

### **Error de conexión a base de datos**
- Verifica que PostgreSQL esté ejecutándose
- Revisa las credenciales en el archivo `.env`
- Confirma que la base de datos existe

### **Error de validación**
- Revisa que todos los campos obligatorios estén presentes
- Verifica los tipos de datos (números, strings, booleans)
- Asegúrate de que los emails tengan formato válido

---

## 📚 **Recursos Adicionales**

- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Guide](https://expressjs.com/)
- [Class-validator Documentation](https://github.com/typestack/class-validator)
- [Jest Testing Framework](https://jestjs.io/)

---

## 👨‍💻 **Desarrollo**

Para contribuir al proyecto:

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Configura variables de entorno
4. Ejecuta tests: `npm test`
5. Inicia desarrollo: `npm run dev`

---
