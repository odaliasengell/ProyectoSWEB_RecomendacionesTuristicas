# 🌍 Sistema de Recomendaciones Turísticas

## 📋 Tabla de Contenidos

1. [Descripción del Proyecto](#-descripción-del-proyecto)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
4. [📡 WebSocket - Tiempo Real](#-websocket---tiempo-real) ← **NUEVO**
5. [Requisitos Previos](#-requisitos-previos)
6. [Instalación y Configuración](#-instalación-y-configuración)
7. [Guía de Uso](#-guía-de-uso)
8. [Documentación de APIs](#-documentación-de-apis)
9. [Integración entre Tecnologías](#-integración-entre-tecnologías)
10. [Estructura del Proyecto](#-estructura-del-proyecto)
11. [Testing](#-testing)
12. [Despliegue](#-despliegue)
13. [Equipo](#-equipo)

---

## 📖 Descripción del Proyecto

Sistema integral de gestión turística desarrollado con **arquitectura de microservicios**, que permite administrar tours, reservas, guías turísticos, destinos y servicios adicionales. El proyecto integra múltiples tecnologías y lenguajes de programación (TypeScript, Python, Golang) para demostrar competencias en desarrollo full-stack y arquitecturas distribuidas.

### Objetivos del Proyecto

✅ Implementar una arquitectura de microservicios escalable  
✅ Integrar múltiples lenguajes de programación y frameworks  
✅ Desarrollar APIs REST independientes que se comunican entre sí  
✅ Crear un servidor GraphQL para reportes complejos  
✅ Implementar notificaciones en tiempo real con WebSockets  
✅ Construir un frontend interactivo que integre todos los servicios  

### Características Principales

- 🔐 **Autenticación JWT** - Sistema de login seguro
- 📊 **Dashboard en tiempo real** - Métricas y estadísticas actualizadas
- 🔔 **Notificaciones instantáneas** - WebSocket para eventos en tiempo real
- 📈 **Reportes avanzados** - GraphQL para consultas complejas
- 🌐 **APIs REST** - Tres microservicios independientes
- 💾 **Arquitectura de datos modular** - MongoDB con bases de datos separadas por servicio

---

## 🏗️ Arquitectura del Sistema

### Arquitectura Modular de Bases de Datos

```
MongoDB (:27017)
├── 🐍 modulo_python      → Usuarios, Destinos, Recomendaciones
├── 📘 modulo_typescript  → Tours, Guías, Reservas
└── 🔷 modulo_go          → Servicios Turísticos, Contrataciones
```

**Ventajas:**
- 🔒 Aislamiento de datos por servicio
- 📊 Escalabilidad independiente
- 🛡️ Seguridad granular
- 🔧 Backups y migraciones independientes

### Diagrama de Arquitectura General

```
┌───────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                               │
│                        Puerto: 5173 (Vite)                        │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   CRUD UI    │  │  Dashboard   │  │   Notificaciones     │  │
│  │  (REST API)  │  │  (GraphQL)   │  │    (WebSocket)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────┬───────────────────┬────────────────────┬──────────────┘
          │                   │                    │
          │ HTTP/HTTPS        │ GraphQL            │ WebSocket
          ▼                   ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAPA DE SERVICIOS                          │
├─────────────────┬──────────────────┬─────────────┬─────────────┤
│  TypeScript     │  Python REST     │  Golang     │  GraphQL    │
│  REST API       │  API             │  REST API   │  Server     │
│  Puerto: 3000   │  Puerto: 5000    │  Puerto:    │  Puerto:    │
│                 │                  │  8080       │  4000       │
│  ┌───────────┐  │  ┌────────────┐  │  ┌───────┐  │  ┌───────┐  │
│  │  • Guía   │  │  │  • Usuario │  │  │ •Serv │  │  │Agrega │  │
│  │  • Tour   │  │  │  • Destino │  │  │ •Cont │  │  │ Datos │  │
│  │  • Reserva│  │  │  • Recomen │  │  │       │  │  │       │  │
│  └───────────┘  │  └────────────┘  │  └───────┘  │  └───────┘  │
│        │        │         │        │       │     │       │      │
└────────┼────────┴─────────┼────────┴───────┼─────┴───────┼──────┘
         │                  │                │             │
         ▼                  ▼                ▼             │
┌─────────────────────────────────────────────────────────┘
│               CAPA DE NOTIFICACIONES
│         WebSocket Server - Puerto: 8081
│   Transmite eventos en tiempo real al Dashboard
└──────────────────────────────────────────────────
         │
         ▼
┌─────────────────────────────────────────────────┐
│            CAPA DE DATOS                        │
├────────────────┬────────────────┬───────────────┤
│  PostgreSQL    │  PostgreSQL    │  PostgreSQL   │
│  tours_db      │  usuarios_db   │  servicios_db │
│  Puerto: 5432  │  Puerto: 5433  │  Puerto: 5434 │
└────────────────┴────────────────┴───────────────┘
```

### Arquitectura de Microservicios

El sistema está compuesto por **6 componentes independientes**:

1. **Backend TypeScript (REST)** - Gestión de Guías, Tours y Reservas
2. **Backend Python (REST)** - Autenticación, Usuarios, Destinos y Recomendaciones
3. **Backend Golang (REST)** - Gestión de Servicios adicionales
4. **GraphQL Server** - Agregador de datos para reportes
5. **WebSocket Server** - Notificaciones en tiempo real
6. **Frontend** - Interfaz de usuario unificada

### Flujo de Datos

```
Usuario → Frontend → REST APIs → Bases de Datos
                  ↓
            GraphQL Server (consulta REST APIs)
                  ↓
            Dashboard con Reportes
                  
REST APIs → WebSocket Server → Frontend (tiempo real)
```

---

## � WebSocket - Tiempo Real

### 🎯 Características

✨ **Dashboard en Tiempo Real** - Visualización de eventos instantáneos  
🔔 **Notificaciones Automáticas** - Alertas de operaciones en las APIs  
📊 **Estadísticas en Vivo** - Métricas del sistema actualizadas  
🔗 **Integración Multi-API** - Eventos de Python, TypeScript y Go  
🎛️ **Salas/Canales** - Eventos organizados por tipo de dato  

### 🏗️ Arquitectura WebSocket

```
┌──────────────────────────────────────────────────────┐
│            WebSocket Server (Node.js)               │
│            Puerto: 8081                              │
│  • Socket.io para eventos bidireccionales            │
│  • Salas: usuarios, destinos, tours, servicios       │
│  • Reconexión automática                             │
└────────────────┬─────────────────────────────────────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼
┌─────────┐ ┌────────┐ ┌─────────┐
│ Python  │ │TypeScript│ │   Go   │
│  API    │ │  API   │ │  API   │
│:8000   │ │:3000  │ │:8080   │
└─────────┘ └────────┘ └─────────┘
     │           │           │
     └───────────┼───────────┘
                 │
         (POST /notify)
                 │
                 ▼
     ┌──────────────────────┐
     │   Frontend (React)   │
     │  useWebsocket Hook   │
     │  Realtime Dashboard  │
     └──────────────────────┘
```

### 📤 Tipos de Eventos

**Usuarios (Python):**
```
user_created, user_updated, user_deleted, user_logged_in, user_logged_out
```

**Destinos (Python):**
```
destino_created, destino_updated, destino_deleted
```

**Tours (TypeScript):**
```
tour_created, tour_updated, tour_deleted, tour_booked
```

**Servicios (Go):**
```
servicio_created, servicio_updated, servicio_deleted, contratacion_created
```

### 🚀 Uso Rápido

```bash
# Iniciar WebSocket Server
cd backend/websocket-server
npm run dev  # Puerto: 8081
```

**Acceso en AdminDashboard:**
```
http://localhost:5173/admin → Pestaña "Tiempo Real"
```

**Enviar evento:**
```bash
curl -X POST http://localhost:8081/notify \
  -H "Content-Type: application/json" \
  -d '{
    "event": "user_created",
    "data": {"user_id": "1", "username": "test", "email": "test@example.com"},
    "room": "usuarios",
    "source": "python_api"
  }'
```

### 📖 Documentación Completa

Ver archivos:
- `WEBSOCKET_README.md` - Descripción general
- `WEBSOCKET_INTEGRATION_GUIDE.md` - Guía de integración por API
- `WEBSOCKET_TESTING_GUIDE.md` - Guía de pruebas

---



| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 20+ | Runtime de JavaScript |
| TypeScript | 5.9+ | Lenguaje tipado |
| Express | 4.18+ | Framework web |
| TypeORM | 0.3+ | ORM para PostgreSQL |
| PostgreSQL | 14+ | Base de datos relacional |
| class-validator | 0.14+ | Validación de datos |
| jsonwebtoken | 9.0+ | Validación de JWT |
| axios | 1.6+ | Cliente HTTP |

### Backend Python (Puerto 5000)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Python | 3.10+ | Lenguaje de programación |
| Flask / FastAPI | Latest | Framework web |
| SQLAlchemy | Latest | ORM para PostgreSQL |
| PostgreSQL | 14+ | Base de datos |
| PyJWT | Latest | Generación de JWT |
| Pydantic | Latest | Validación de datos |

### Backend Golang (Puerto 8080)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Go | 1.21+ | Lenguaje de programación |
| Gin / Echo | Latest | Framework web |
| GORM | Latest | ORM para PostgreSQL |
| PostgreSQL | 14+ | Base de datos |

### GraphQL Server (Puerto 4000)

| Tecnología | Propósito |
|------------|-----------|
| Apollo Server (Node) / Graphene (Python) | Servidor GraphQL |
| DataSources | Integración con REST APIs |

### WebSocket Server (Puerto 8081)

| Tecnología | Propósito |
|------------|-----------|
| Socket.io (Node) / Gorilla (Go) / Tokio (Rust) | Comunicación bidireccional en tiempo real |

### Frontend (Puerto 5173)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React / Vue / Angular | Latest | Framework de UI |
| Vite | 5+ | Build tool |
| Axios | Latest | Cliente HTTP REST |
| Apollo Client | Latest | Cliente GraphQL |
| Socket.io Client | Latest | Cliente WebSocket |
| TailwindCSS | Latest | Estilos |

---

## ✅ Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

### Software Requerido

- **Node.js** v20 o superior → [Descargar](https://nodejs.org/)
- **MongoDB** v4.4 o superior → [Descargar](https://www.mongodb.com/try/download/community)
- **Python** v3.10 o superior → [Descargar](https://www.python.org/)
- **Go** v1.21 o superior → [Descargar](https://go.dev/)
- **Git** → [Descargar](https://git-scm.com/)

### Herramientas Recomendadas

- **Visual Studio Code** - Editor de código
- **Postman** o **Thunder Client** - Testing de APIs
- **MongoDB Compass** - Cliente GUI para MongoDB
- **Docker** (opcional) - Para contenedores

### Verificar Instalaciones

```powershell
# Node.js y npm
node --version  # Debe mostrar v20+
npm --version

# MongoDB
mongosh --version  # MongoDB Shell

# Python
python --version  # Debe mostrar 3.10+

# Go
go version  # Debe mostrar 1.21+

# Git
git --version
```

---

## 🚀 Instalación y Configuración

### Paso 0: Configurar MongoDB

Antes de configurar los servicios, debes inicializar MongoDB:

```powershell
# Ejecuta el script de configuración automática
.\setup-mongodb.ps1
```

Este script:
- ✅ Verifica que MongoDB esté instalado y corriendo
- ✅ Crea las 3 bases de datos modulares
- ✅ Configura índices optimizados
- ✅ Genera archivos `.env` desde los ejemplos

**Consulta la guía completa:** [MONGODB_MIGRATION.md](./MONGODB_MIGRATION.md)

### 1️⃣ Clonar el Repositorio

```powershell
git clone https://github.com/odaliasengell/ProyectoSWEB_RecomendacionesTuristicas.git
cd backend
```

### 2️⃣ Configurar PostgreSQL Local

#### Crear las 3 bases de datos:

```bash
# Abrir psql
psql -U postgres

# Crear bases de datos
CREATE DATABASE tours_db;
CREATE DATABASE usuarios_db;
CREATE DATABASE servicios_db;

# Verificar
\l

# Salir
\q
```

#### Configurar puertos (si usas múltiples instancias):

**Opción A: Una instancia PostgreSQL (Recomendado para desarrollo)**
```
Puerto único: 5432
Bases de datos: tours_db, usuarios_db, servicios_db
```

**Opción B: Tres instancias PostgreSQL separadas**
```
Instancia 1: Puerto 5432 → tours_db
Instancia 2: Puerto 5433 → usuarios_db
Instancia 3: Puerto 5434 → servicios_db
```

### 3️⃣ Configurar Backend TypeScript

```bash
cd backend-typescript-rest

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

#### Editar `.env`:

```env
# SERVIDOR
PORT=3000
NODE_ENV=development

# BASE DE DATOS POSTGRESQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password_aqui
DB_DATABASE=tours_db

# JWT (mismo secreto que Python)
JWT_SECRET=mi_secreto_super_seguro_2024

# SERVICIOS EXTERNOS
PYTHON_API_URL=http://localhost:5000
GOLANG_API_URL=http://localhost:8080
GRAPHQL_API_URL=http://localhost:4000
WEBSOCKET_URL=http://localhost:8081
```

#### Iniciar servidor:

```bash
# Desarrollo con recarga automática
npm run dev

# El servidor estará en http://localhost:3000
```

### 4️⃣ Configurar Backend Python

```bash
cd backend-python-rest

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env
cp .env.example .env
```

#### Editar `.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/usuarios_db
JWT_SECRET=mi_secreto_super_seguro_2024
TYPESCRIPT_API_URL=http://localhost:3000
GOLANG_API_URL=http://localhost:8080
```

#### Iniciar servidor:

```bash
# Flask
python main.py

# O FastAPI
uvicorn main:app --reload --port 5000

# El servidor estará en http://localhost:5000
```

### 5️⃣ Configurar Backend Golang

```bash
cd backend-golang-rest

# Inicializar módulo (si no existe)
go mod init backend-golang-rest

# Instalar dependencias
go mod tidy

# Crear archivo .env
cp .env.example .env
```

#### Editar `.env`:

```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=servicios_db
TYPESCRIPT_API_URL=http://localhost:3000
PYTHON_API_URL=http://localhost:5000
```

#### Iniciar servidor:

```bash
go run cmd/api/main.go

# El servidor estará en http://localhost:8080
```

### 6️⃣ Configurar GraphQL Server

```bash
cd graphql-server

# Si es Node.js
npm install
npm run dev

# Si es Python
pip install -r requirements.txt
python server.py

# El servidor estará en http://localhost:4000
```

### 7️⃣ Configurar WebSocket Server

```bash
cd websocket-server

# Según tecnología elegida
npm install / pip install / go mod tidy
npm run dev / python server.py / go run main.go

# El servidor estará en http://localhost:8081
```

### 8️⃣ Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

#### Editar `.env`:

```env
VITE_TYPESCRIPT_API=http://localhost:3000
VITE_PYTHON_API=http://localhost:5000
VITE_GOLANG_API=http://localhost:8080
VITE_GRAPHQL_API=http://localhost:4000
VITE_WEBSOCKET_URL=ws://localhost:8081
```

#### Iniciar aplicación:

```bash
npm run dev

# La aplicación estará en http://localhost:5173
```

---

## 📚 Guía de Uso

### 🔐 1. Autenticación

#### Registrar Usuario (Python API)

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "contraseña": "password123",
  "pais": "Ecuador"
}
```

#### Iniciar Sesión

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "contraseña": "password123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usuario": 1,
      "nombre": "Juan Pérez",
      "email": "juan@example.com"
    }
  }
}
```

**Importante:** Guarda el token para usarlo en las siguientes peticiones.

---

### 👨‍🏫 2. Gestión de Guías (TypeScript API)

#### Crear Guía

```bash
POST http://localhost:3000/api/guias
Content-Type: application/json
Authorization: Bearer <tu_token_jwt>

{
  "nombre": "María González",
  "idiomas": "Español, Inglés, Francés",
  "experiencia": "10 años guiando tours en Galápagos",
  "email": "maria@tours.com",
  "telefono": "+593987654321",
  "disponible": true,
  "calificacion": 4.8
}
```

#### Listar Guías

```bash
GET http://localhost:3000/api/guias
Authorization: Bearer <tu_token_jwt>
```

#### Obtener Guía por ID

```bash
GET http://localhost:3000/api/guias/1
Authorization: Bearer <tu_token_jwt>
```

#### Actualizar Guía

```bash
PUT http://localhost:3000/api/guias/1
Content-Type: application/json
Authorization: Bearer <tu_token_jwt>

{
  "calificacion": 4.9,
  "disponible": false
}
```

#### Eliminar Guía

```bash
DELETE http://localhost:3000/api/guias/1
Authorization: Bearer <tu_token_jwt>
```

---

### 🗺️ 3. Gestión de Destinos (Python API)

#### Crear Destino

```bash
POST http://localhost:5000/api/destinos
Content-Type: application/json
Authorization: Bearer <tu_token_jwt>

{
  "nombre": "Islas Galápagos",
  "descripcion": "Paraíso natural único en el mundo",
  "ubicacion": "Ecuador",
  "ruta": "Puerto Ayora, Santa Cruz"
}
```

#### Listar Destinos

```bash
GET http://localhost:5000/api/destinos
Authorization: Bearer <tu_token_jwt>
```

---

### 🎫 4. Gestión de Tours (TypeScript API)

#### Crear Tour

```bash
POST http://localhost:3000/api/tours
Content-Type: application/json
Authorization: Bearer <tu_token_jwt>

{
  "nombre": "Tour Galápagos Premium",
  "descripcion": "Experiencia única visitando las islas más emblemáticas",
  "duracion": "7 días / 6 noches",
  "precio": 1500.00,
  "capacidad_maxima": 12,
  "id_guia": 1,
  "id_destino": 1,
  "id_servicios": [1, 2, 3]
}
```

**Nota:** El sistema automáticamente consulta:
- Información del guía (base de datos local)
- Información del destino (API Python)
- Información de servicios (API Golang)

#### Listar Tours (con datos enriquecidos)

```bash
GET http://localhost:3000/api/tours
Authorization: Bearer <tu_token_jwt>
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id_tour": 1,
      "nombre": "Tour Galápagos Premium",
      "descripcion": "Experiencia única...",
      "duracion": "7 días / 6 noches",
      "precio": 1500.00,
      "guia": {
        "id_guia": 1,
        "nombre": "María González",
        "idiomas": "Español, Inglés, Francés"
      },
      "destino": {
        "id_destino": 1,
        "nombre": "Islas Galápagos",
        "ubicacion": "Ecuador"
      },
      "servicios": [
        { "id_servicio": 1, "nombre": "Transporte", "precio": 200 },
        { "id_servicio": 2, "nombre": "Alimentación", "precio": 150 }
      ]
    }
  ]
}
```

---

### 📅 5. Gestión de Reservas (TypeScript API)

#### Crear Reserva

```bash
POST http://localhost:3000/api/reservas
Content-Type: application/json
Authorization: Bearer <tu_token_jwt>

{
  "id_usuario": 1,
  "id_tour": 1,
  "fecha_reserva": "2025-11-15",
  "cantidad_personas": 3,
  "comentarios": "Viaje familiar, necesitamos habitaciones contiguas"
}
```

**El sistema automáticamente:**
1. Valida que el usuario existe (consulta API Python)
2. Valida que el tour existe y está disponible
3. Calcula el precio total (precio_tour × cantidad_personas)
4. Crea la reserva con estado "pendiente"
5. Notifica al WebSocket sobre la nueva reserva

#### Listar Reservas

```bash
GET http://localhost:3000/api/reservas
Authorization: Bearer <tu_token_jwt>
```

#### Reservas de un Usuario específico

```bash
GET http://localhost:3000/api/reservas/usuario/1
Authorization: Bearer <tu_token_jwt>
```

#### Actualizar Estado de Reserva

```bash
PATCH http://localhost:3000/api/reservas/1/estado
Content-Type: application/json
Authorization: Bearer <tu_token_jwt>

{
  "estado": "confirmada"
}
```

Posibles estados: `pendiente`, `confirmada`, `cancelada`, `completada`

---

### 🛎️ 6. Gestión de Servicios (Golang API)

#### Crear Servicio

```bash
POST http://localhost:8080/api/servicios
Content-Type: application/json
Authorization: Bearer <tu_token_jwt>

{
  "nombre": "Transporte Aeropuerto",
  "descripcion": "Traslado desde/hacia el aeropuerto",
  "precio": 50.00
}
```

#### Listar Servicios

```bash
GET http://localhost:8080/api/servicios
Authorization: Bearer <tu_token_jwt>
```

#### Obtener múltiples servicios por IDs

```bash
POST http://localhost:8080/api/servicios/batch
Content-Type: application/json
Authorization: Bearer <tu_token_jwt>

{
  "ids": [1, 2, 3]
}
```

---

### 📊 7. Reportes con GraphQL

#### Consultar Tours Populares

```graphql
POST http://localhost:4000/graphql
Content-Type: application/json

{
  "query": "query { toursPopulares(limit: 10) { id_tour nombre precio total_reservas destino { nombre ubicacion } guia { nombre calificacion } } }"
}
```

#### Estadísticas de Reservas por Mes

```graphql
{
  "query": "query { reservasPorMes(año: 2025) { mes total_reservas ingresos_totales } }"
}
```

#### Guías Mejor Calificados

```graphql
{
  "query": "query { guiasMejorCalificados(limit: 5) { nombre calificacion total_tours idiomas } }"
}
```

---

### 🔔 8. Notificaciones en Tiempo Real

#### Conectar al WebSocket (desde Frontend)

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8081');

// Escuchar nueva reserva
socket.on('nueva_reserva', (data) => {
  console.log('Nueva reserva:', data);
  // Actualizar UI
});

// Escuchar tour actualizado
socket.on('tour_actualizado', (data) => {
  console.log('Tour actualizado:', data);
  // Actualizar lista de tours
});

// Escuchar guía disponible
socket.on('guia_disponible', (data) => {
  console.log('Guía cambió disponibilidad:', data);
});
```

#### Eventos Disponibles

| Evento | Descripción | Datos |
|--------|-------------|-------|
| `nueva_reserva` | Se creó una nueva reserva | `{ id_reserva, tour, usuario, timestamp }` |
| `reserva_confirmada` | Reserva fue confirmada | `{ id_reserva, estado }` |
| `tour_actualizado` | Tour fue modificado | `{ id_tour, nombre, cambios[] }` |
| `guia_disponible` | Guía cambió disponibilidad | `{ id_guia, nombre, disponible }` |
| `nuevo_destino` | Nuevo destino agregado | `{ id_destino, nombre }` |

---

## 📡 Documentación de APIs

### Backend TypeScript REST API

**Base URL:** `http://localhost:3000/api`

#### Endpoints de Guías

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/guias` | Listar todos los guías | ✅ |
| GET | `/guias/disponibles` | Listar guías disponibles | ✅ |
| GET | `/guias/:id` | Obtener guía por ID | ✅ |
| POST | `/guias` | Crear nuevo guía | ✅ |
| PUT | `/guias/:id` | Actualizar guía | ✅ |
| PATCH | `/guias/:id/disponibilidad` | Cambiar disponibilidad | ✅ |
| DELETE | `/guias/:id` | Eliminar guía | ✅ |

#### Endpoints de Tours

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/tours` | Listar todos los tours (con datos completos) | ✅ |
| GET | `/tours/disponibles` | Listar tours disponibles | ✅ |
| GET | `/tours/:id` | Obtener tour por ID (con destino y servicios) | ✅ |
| POST | `/tours` | Crear nuevo tour | ✅ |
| PUT | `/tours/:id` | Actualizar tour | ✅ |
| PATCH | `/tours/:id/disponibilidad` | Cambiar disponibilidad | ✅ |
| DELETE | `/tours/:id` | Eliminar tour | ✅ |

#### Endpoints de Reservas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/reservas` | Listar todas las reservas | ✅ |
| GET | `/reservas/usuario/:id` | Reservas de un usuario específico | ✅ |
| GET | `/reservas/:id` | Obtener reserva por ID | ✅ |
| POST | `/reservas` | Crear nueva reserva | ✅ |
| PUT | `/reservas/:id` | Actualizar reserva | ✅ |
| PATCH | `/reservas/:id/estado` | Cambiar estado de reserva | ✅ |
| DELETE | `/reservas/:id` | Cancelar reserva | ✅ |

#### Formatos de Request/Response

**Crear Guía - POST `/guias`**

Request:
```json
{
  "nombre": "string (required, 3-100 chars)",
  "idiomas": "string (required, max 50 chars)",
  "experiencia": "string (required)",
  "email": "string (required, valid email)",
  "telefono": "string (required, max 20 chars)",
  "disponible": "boolean (optional, default: true)",
  "calificacion": "number (optional, 0-5, default: 0)"
}
```

Response:
```json
{
  "success": true,
  "message": "Guía creado exitosamente",
  "data": {
    "id_guia": 1,
    "nombre": "María González",
    "idiomas": "Español, Inglés, Francés",
    "experiencia": "10 años...",
    "email": "maria@tours.com",
    "telefono": "+593987654321",
    "disponible": true,
    "calificacion": 4.8,
    "createdAt": "2025-10-06T10:00:00Z",
    "updatedAt": "2025-10-06T10:00:00Z"
  },
  "timestamp": "2025-10-06T10:00:00Z"
}
```

**Crear Tour - POST `/tours`**

Request:
```json
{
  "nombre": "string (required, max 150 chars)",
  "descripcion": "string (required)",
  "duracion": "string (required, max 50 chars)",
  "precio": "number (required, >= 0)",
  "capacidad_maxima": "number (optional, >= 1, default: 10)",
  "disponible": "boolean (optional, default: true)",
  "id_guia": "number (required)",
  "id_destino": "number (required)",
  "id_servicios": "number[] (optional)"
}
```

**Crear Reserva - POST `/reservas`**

Request:
```json
{
  "id_usuario": "number (required)",
  "id_tour": "number (required)",
  "fecha_reserva": "date (required, formato: YYYY-MM-DD)",
  "cantidad_personas": "number (required, >= 1)",
  "comentarios": "string (optional)"
}
```

Response:
```json
{
  "success": true,
  "message": "Reserva creada exitosamente",
  "data": {
    "id_reserva": 100,
    "id_usuario": 1,
    "id_tour": 1,
    "fecha_reserva": "2025-11-15",
    "cantidad_personas": 3,
    "estado": "pendiente",
    "precio_total": 4500.00,
    "comentarios": "Viaje familiar",
    "createdAt": "2025-10-06T12:00:00Z"
  }
}
```

#### Códigos de Estado HTTP

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa (GET, PUT, PATCH) |
| 201 | Created | Recurso creado exitosamente (POST) |
| 400 | Bad Request | Datos inválidos o incompletos |
| 401 | Unauthorized | Token JWT inválido o ausente |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

### Backend Python REST API

**Base URL:** `http://localhost:5000/api`

#### Endpoints de Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar nuevo usuario | ❌ |
| POST | `/auth/login` | Iniciar sesión (retorna JWT) | ❌ |
| POST | `/auth/logout` | Cerrar sesión | ✅ |
| GET | `/auth/profile` | Obtener perfil del usuario | ✅ |

#### Endpoints de Usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/usuarios` | Listar todos los usuarios | ✅ |
| GET | `/usuarios/:id` | Obtener usuario por ID | ✅ |
| PUT | `/usuarios/:id` | Actualizar usuario | ✅ |
| DELETE | `/usuarios/:id` | Eliminar usuario | ✅ |

#### Endpoints de Destinos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/destinos` | Listar todos los destinos | ✅ |
| GET | `/destinos/:id` | Obtener destino por ID | ✅ |
| POST | `/destinos` | Crear nuevo destino | ✅ |
| PUT | `/destinos/:id` | Actualizar destino | ✅ |
| DELETE | `/destinos/:id` | Eliminar destino | ✅ |

#### Endpoints de Recomendaciones

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/recomendaciones` | Listar recomendaciones | ✅ |
| GET | `/recomendaciones/usuario/:id` | Recomendaciones de un usuario | ✅ |
| POST | `/recomendaciones` | Publicar recomendación | ✅ |
| DELETE | `/recomendaciones/:id` | Eliminar recomendación | ✅ |

---

### Backend Golang REST API

**Base URL:** `http://localhost:8080/api`

#### Endpoints de Servicios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/servicios` | Listar todos los servicios | ✅ |
| GET | `/servicios/:id` | Obtener servicio por ID | ✅ |
| POST | `/servicios/batch` | Obtener múltiples servicios por IDs | ✅ |
| POST | `/servicios` | Crear nuevo servicio | ✅ |
| PUT | `/servicios/:id` | Actualizar servicio | ✅ |
| DELETE | `/servicios/:id` | Eliminar servicio | ✅ |

#### Endpoints de Contratación de Servicios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/contrataciones` | Listar contrataciones | ✅ |
| GET | `/contrataciones/usuario/:id` | Contrataciones de un usuario | ✅ |
| POST | `/contrataciones` | Contratar servicio | ✅ |
| DELETE | `/contrataciones/:id` | Cancelar contratación | ✅ |

---

### GraphQL API

**Base URL:** `http://localhost:4000/graphql`

#### Schema GraphQL

```graphql
type Query {
  # Tours
  toursPopulares(limit: Int): [TourPopular]
  tourDetalle(id: Int!): TourDetallado
  
  # Reservas
  reservasPorMes(año: Int!): [EstadisticaMensual]
  reservasPorEstado: [ReservaEstadistica]
  
  # Guías
  guiasMejorCalificados(limit: Int): [GuiaEstadistica]
  guiaDetalle(id: Int!): GuiaDetallado
  
  # Destinos
  destinosMasVisitados: [DestinoEstadistica]
  destinoDetalle(id: Int!): DestinoDetallado
  
  # Dashboard
  estadisticasGenerales: EstadisticasGenerales
}

type TourPopular {
  id_tour: Int
  nombre: String
  precio: Float
  total_reservas: Int
  destino: Destino
  guia: Guia
  servicios: [Servicio]
}

type EstadisticaMensual {
  mes: Int
  año: Int
  total_reservas: Int
  ingresos_totales: Float
  promedio_personas: Float
}

type GuiaEstadistica {
  id_guia: Int
  nombre: String
  calificacion: Float
  total_tours: Int
  total_reservas: Int
  idiomas: String
}

type EstadisticasGenerales {
  total_tours: Int
  total_reservas: Int
  total_usuarios: Int
  ingresos_totales: Float
  promedio_calificacion_guias: Float
}
```

#### Ejemplos de Queries

**Tours Populares:**
```graphql
query {
  toursPopulares(limit: 10) {
    id_tour
    nombre
    precio
    total_reservas
    destino {
      nombre
      ubicacion
    }
    guia {
      nombre
      calificacion
      idiomas
    }
    servicios {
      nombre
      precio
    }
  }
}
```

**Estadísticas del Dashboard:**
```graphql
query {
  estadisticasGenerales {
    total_tours
    total_reservas
    total_usuarios
    ingresos_totales
    promedio_calificacion_guias
  }
}
```

**Reservas por Mes:**
```graphql
query {
  reservasPorMes(año: 2025) {
    mes
    total_reservas
    ingresos_totales
    promedio_personas
  }
}
```

---

## 🔗 Integración entre Tecnologías

### Flujo Completo de Integración

#### 1. Usuario Crea una Reserva

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant P as Python API
    participant T as TypeScript API
    participant W as WebSocket
    participant D as Dashboard

    U->>F: Hacer reserva
    F->>P: POST /auth/login
    P->>F: JWT Token
    F->>T: POST /reservas (con JWT)
    T->>P: Validar usuario
    P->>T: Usuario válido
    T->>T: Validar tour
    T->>T: Calcular precio
    T->>T: Crear reserva
    T->>W: Notificar nueva_reserva
    W->>D: Broadcast evento
    T->>F: Reserva creada
    F->>U: Confirmación
```

**Paso a paso:**

1. **Usuario inicia sesión** → Frontend llama a Python API
2. **Python valida credenciales** → Retorna JWT Token
3. **Frontend guarda JWT** en localStorage
4. **Usuario crea reserva** → Frontend envía datos con JWT a TypeScript API
5. **TypeScript valida JWT** → Llama a Python para verificar usuario
6. **TypeScript valida tour** → Verifica disponibilidad
7. **TypeScript calcula precio** → `precio_tour × cantidad_personas`
8. **TypeScript crea reserva** en base de datos local
9. **TypeScript notifica WebSocket** → Evento `nueva_reserva`
10. **WebSocket transmite** a todos los dashboards conectados
11. **Dashboard actualiza** en tiempo real

#### 2. Frontend Obtiene Tour Completo

```mermaid
sequenceDiagram
    participant F as Frontend
    participant T as TypeScript API
    participant P as Python API
    participant G as Golang API

    F->>T: GET /tours/1
    T->>T: Buscar tour en BD
    T->>P: GET /destinos/:id
    P->>T: Datos del destino
    T->>G: POST /servicios/batch
    G->>T: Datos de servicios
    T->>T: Combinar información
    T->>F: Tour completo
```

**Paso a paso:**

1. **Frontend solicita tour** → GET `/api/tours/1`
2. **TypeScript busca tour** en su base de datos
3. **TypeScript consulta Python** → Obtiene destino (`id_destino`)
4. **TypeScript consulta Golang** → Obtiene servicios (`id_servicios[]`)
5. **TypeScript combina datos** de las 3 fuentes
6. **TypeScript retorna tour enriquecido** al frontend

**Ejemplo de respuesta enriquecida:**
```json
{
  "id_tour": 1,
  "nombre": "Tour Galápagos Premium",
  "precio": 1500,
  "guia": {
    "id_guia": 1,
    "nombre": "María González"
  },
  "destino": {
    "id_destino": 5,
    "nombre": "Islas Galápagos",
    "ubicacion": "Ecuador"
  },
  "servicios": [
    { "id_servicio": 1, "nombre": "Transporte", "precio": 200 },
    { "id_servicio": 2, "nombre": "Alimentación", "precio": 150 }
  ]
}
```

#### 3. Dashboard Muestra Reportes (GraphQL)

```mermaid
sequenceDiagram
    participant D as Dashboard
    participant GQL as GraphQL Server
    participant T as TypeScript API
    participant P as Python API
    participant G as Golang API

    D->>GQL: Query toursPopulares
    GQL->>T: GET /tours
    GQL->>T: GET /reservas
    GQL->>P: GET /destinos
    GQL->>P: GET /usuarios
    GQL->>G: GET /servicios
    GQL->>GQL: Agregar y calcular
    GQL->>D: Resultado combinado
```

**Paso a paso:**

1. **Dashboard hace query GraphQL** → `toursPopulares(limit: 10)`
2. **GraphQL consulta TypeScript** → Lista de tours
3. **GraphQL consulta TypeScript** → Reservas por tour
4. **GraphQL consulta Python** → Información de destinos
5. **GraphQL consulta Golang** → Información de servicios
6. **GraphQL agrega datos** → Calcula totales, promedios
7. **GraphQL retorna resultado unificado** al dashboard

**Ventaja:** Una sola petición GraphQL reemplaza múltiples llamadas REST.

#### 4. Notificaciones en Tiempo Real

```mermaid
sequenceDiagram
    participant T as TypeScript API
    participant W as WebSocket Server
    participant D1 as Dashboard 1
    participant D2 as Dashboard 2
    participant D3 as Dashboard 3

    T->>W: POST /notify (nueva_reserva)
    W->>D1: Emit evento
    W->>D2: Emit evento
    W->>D3: Emit evento
    D1->>D1: Actualizar UI
    D2->>D2: Actualizar UI
    D3->>D3: Actualizar UI
```

**Paso a paso:**

1. **TypeScript crea reserva** → Guarda en BD
2. **TypeScript notifica WebSocket** → POST `/notify`
3. **WebSocket recibe evento** → `nueva_reserva`
4. **WebSocket transmite** a todos los clientes conectados
5. **Dashboards actualizan** automáticamente sin recargar

---

### Comunicación entre Microservicios

#### TypeScript ↔ Python

**Validar Usuario:**
```typescript
// TypeScript llama a Python
const usuario = await axios.get(
  `${PYTHON_API_URL}/api/usuarios/${id_usuario}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

**Obtener Destino:**
```typescript
// TypeScript llama a Python
const destino = await axios.get(
  `${PYTHON_API_URL}/api/destinos/${id_destino}`
);
```

#### TypeScript ↔ Golang

**Obtener Servicios:**
```typescript
// TypeScript llama a Golang
const servicios = await axios.post(
  `${GOLANG_API_URL}/api/servicios/batch`,
  { ids: [1, 2, 3] }
);
```

#### Cualquier API → WebSocket

**Notificar Evento:**
```typescript
// Desde TypeScript
await axios.post(`${WEBSOCKET_URL}/notify`, {
  event: 'nueva_reserva',
  data: { id_reserva, tour, usuario },
  timestamp: new Date().toISOString()
});
```

```python
# Desde Python
requests.post(f"{WEBSOCKET_URL}/notify", json={
    "event": "nuevo_usuario",
    "data": {"id_usuario": user.id, "nombre": user.nombre}
})
```

```go
// Desde Golang
http.Post(websocketURL + "/notify", "application/json", 
    strings.NewReader(`{"event": "servicio_contratado", "data": {...}}`))
```

#### GraphQL → REST APIs

**Resolver de GraphQL consulta múltiples APIs:**
```javascript
// GraphQL Resolver
const resolvers = {
  Query: {
    async toursPopulares(_, { limit }) {
      // Consultar TypeScript
      const tours = await fetch('http://localhost:3000/api/tours');
      
      // Enriquecer cada tour
      return Promise.all(tours.map(async (tour) => {
        // Consultar Python para destino
        const destino = await fetch(
          `http://localhost:5000/api/destinos/${tour.id_destino}`
        );
        
        // Consultar Golang para servicios
        const servicios = await fetch(
          'http://localhost:8080/api/servicios/batch',
          { 
            method: 'POST',
            body: JSON.stringify({ ids: tour.id_servicios })
          }
        );
        
        return { ...tour, destino, servicios };
      }));
    }
  }
};
```

---

### Manejo de Autenticación JWT

#### Flujo de JWT entre Servicios

1. **Python genera JWT** al hacer login:
```python
token = jwt.encode({
    'id_usuario': user.id,
    'email': user.email,
    'rol': user.rol,
    'exp': datetime.utcnow() + timedelta(hours=24)
}, JWT_SECRET, algorithm='HS256')
```

2. **Frontend guarda JWT** en localStorage
3. **Frontend envía JWT** en cada petición:
```javascript
axios.get('/api/tours', {
  headers: { Authorization: `Bearer ${token}` }
});
```

4. **Cada servicio valida JWT** antes de procesar:
```typescript
// Middleware en TypeScript
const jwt = require('jsonwebtoken');

const decoded = jwt.verify(token, JWT_SECRET);
// decoded = { id_usuario, email, rol, exp }
```

**Clave:** Todos los servicios deben usar el **mismo JWT_SECRET** para validar tokens.

---

### Consistencia de Datos

#### Estrategias Implementadas

**1. IDs como Referencias:**
- Cada servicio almacena SOLO los IDs de entidades externas
- No duplica datos de otros servicios
- Consulta en tiempo real para obtener información actualizada

**2. Validación Cruzada:**
```typescript
// Antes de crear tour, validar que existe el destino
const destino = await httpClient.getDestino(id_destino);
if (!destino) {
  throw new Error('Destino no existe');
}
```

**3. Transacciones Locales:**
- Cada servicio maneja transacciones en su propia BD
- No hay transacciones distribuidas (por simplicidad)

**4. Manejo de Errores:**
```typescript
try {
  const usuario = await httpClient.validateUser(id_usuario, token);
} catch (error) {
  // Si Python API está caído, retornar error amigable
  return res.status(503).json({
    success: false,
    message: 'Servicio de usuarios no disponible'
  });
}
```

---

## 📁 Estructura del Proyecto

### Backend TypeScript

```
backend/moduloTypeScript
│
├── src/
│   ├── config/
│   │   ├── database.ts           # Configuración TypeORM
│   │   └── environment.ts        # Variables de entorno
│   │
│   ├── entities/
│   │   ├── Guia.entity.ts        # Modelo Guía
│   │   ├── Tour.entity.ts        # Modelo Tour
│   │   └── Reserva.entity.ts     # Modelo Reserva
│   │
│   ├── modules/
│   │   ├── guias/
│   │   │   ├── dto/
│   │   │   │   ├── create-guia.dto.ts
│   │   │   │   └── update-guia.dto.ts
│   │   │   ├── guia.controller.ts
│   │   │   ├── guia.service.ts
│   │   │   └── guia.routes.ts
│   │   │
│   │   ├── tours/
│   │   │   ├── dto/
│   │   │   │   ├── create-tour.dto.ts
│   │   │   │   └── update-tour.dto.ts
│   │   │   ├── tour.controller.ts
│   │   │   ├── tour.service.ts
│   │   │   └── tour.routes.ts
│   │   │
│   │   └── reservas/
│   │       ├── dto/
│   │       │   ├── create-reserva.dto.ts
│   │       │   └── update-reserva.dto.ts
│   │       ├── reserva.controller.ts
│   │       ├── reserva.service.ts
│   │       └── reserva.routes.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # Validar JWT
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── utils/
│   │   ├── response.util.ts      # Respuestas estandarizadas
│   │   └── http-client.util.ts   # Cliente para otros servicios
│   │
│   └── main.ts                   # Entry point
│
├── tests/
│   ├── guias.test.ts
│   ├── tours.test.ts
│   └── reservas.test.ts
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

---

## 🧪 Testing

### Tests Unitarios (Backend TypeScript)

#### Configurar Jest

```bash
npm install -D jest @types/jest ts-jest supertest @types/supertest
```

#### Crear `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
};
```

#### Ejemplo de Test:

**tests/guias.test.ts:**
```typescript
import request from 'supertest';
import app from '../src/main';

describe('Guías API', () => {
  let token: string;

  beforeAll(async () => {
    // Obtener token de autenticación
    const response = await request('http://localhost:5000')
      .post('/api/auth/login')
      .send({ email: 'test@example.com', contraseña: 'test123' });
    
    token = response.body.data.token;
  });

  test('GET /api/guias - Debe listar guías', async () => {
    const response = await request(app)
      .get('/api/guias')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /api/guias - Debe crear un guía', async () => {
    const nuevoGuia = {
      nombre: 'Test Guía',
      idiomas: 'Español, Inglés',
      experiencia: '5 años',
      email: 'guia@test.com',
      telefono: '+593999999999',
    };

    const response = await request(app)
      .post('/api/guias')
      .set('Authorization', `Bearer ${token}`)
      .send(nuevoGuia);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nombre).toBe(nuevoGuia.nombre);
  });
});
```

#### Ejecutar Tests:
```bash
npm test
```

---

## 🚀 Despliegue

### Opción 1: Despliegue Local con Docker

#### Crear `docker-compose.yml` en la raíz:

```yaml
version: '3.8'

services:
  # Base de datos TypeScript
  postgres-typescript:
    image: postgres:14
    environment:
      POSTGRES_DB: tours_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5432:5432"
    volumes:
      - ts-data:/var/lib/postgresql/data

  # Base de datos Python
  postgres-python:
    image: postgres:14
    environment:
      POSTGRES_DB: usuarios_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5433:5432"
    volumes:
      - py-data:/var/lib/postgresql/data

  # Base de datos Golang
  postgres-golang:
    image: postgres:14
    environment:
      POSTGRES_DB: servicios_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5434:5432"
    volumes:
      - go-data:/var/lib/postgresql/data

  # Backend TypeScript
  typescript-api:
    build: ./backend-typescript-rest
    ports:
      - "3000:3000"
    depends_on:
      - postgres-typescript
    environment:
      DB_HOST: postgres-typescript
      DB_PORT: 5432
      PYTHON_API_URL: http://python-api:5000
      GOLANG_API_URL: http://golang-api:8080

  # Backend Python
  python-api:
    build: ./backend-python-rest
    ports:
      - "5000:5000"
    depends_on:
      - postgres-python
    environment:
      DB_HOST: postgres-python
      DB_PORT: 5432

  # Backend Golang
  golang-api:
    build: ./backend-golang-rest
    ports:
      - "8080:8080"
    depends_on:
      - postgres-golang
    environment:
      DB_HOST: postgres-golang
      DB_PORT: 5432

  # GraphQL Server
  graphql-server:
    build: ./graphql-server
    ports:
      - "4000:4000"
    depends_on:
      - typescript-api
      - python-api
      - golang-api

  # WebSocket Server
  websocket-server:
    build: ./websocket-server
    ports:
      - "8081:8081"

  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - typescript-api
      - python-api
      - golang-api
      - graphql-server
      - websocket-server

volumes:
  ts-data:
  py-data:
  go-data:
```

#### Levantar todo el sistema:
```bash
docker-compose up -d
```

#### Detener todo:
```bash
docker-compose down
```

---

### Opción 2: Despliegue Individual

Cada servicio se despliega por separado:

**TypeScript:**
```bash
npm run build
npm start
```

**Python:**
```bash
gunicorn main:app --bind 0.0.0.0:5000
```

**Golang:**
```bash
go build -o main cmd/api/main.go
./main
```

---

## 🛠️ Troubleshooting

### Problemas Comunes

#### 1. Error de conexión a PostgreSQL

**Síntoma:** `ECONNREFUSED localhost:5432`

**Solución:**
```bash
# Verificar que PostgreSQL está corriendo
sudo service postgresql status

# Iniciar PostgreSQL
sudo service postgresql start

# Verificar puerto
sudo netstat -tulpn | grep 5432
```

#### 2. Error "JWT must be provided"

**Síntoma:** `401 Unauthorized`

**Solución:**
- Asegúrate de incluir el header:
```bash
Authorization: Bearer <tu_token_jwt>
```

#### 3. Error "Port already in use"

**Síntoma:** `EADDRINUSE: address already in use :::3000`

**Solución:**
```bash
# Linux/Mac - Encontrar proceso en puerto 3000
lsof -i :3000

# Matar proceso
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### 4. Error de migraciones TypeORM

**Síntoma:** `Table already exists`

**Solución:**
```bash
# Eliminar base de datos y recrear
dropdb tours_db
createdb tours_db

# O cambiar synchronize en database.ts a false
```

#### 5. Servicios externos no responden

**Síntoma:** `Service unavailable` o timeout

**Solución:**
- Verificar que todos los servicios están corriendo
- Verificar URLs en .env
- Verificar firewall/puertos

```bash
# Verificar conectividad
curl http://localhost:5000/api/destinos
curl http://localhost:8080/api/servicios
```

---

## 📖 Glosario

| Término | Definición |
|---------|------------|
| **Microservicio** | Aplicación independiente que maneja un conjunto específico de funcionalidades |
| **API REST** | Interfaz de programación que usa HTTP para comunicación |
| **GraphQL** | Lenguaje de consulta que permite al cliente especificar qué datos necesita |
| **WebSocket** | Protocolo de comunicación bidireccional en tiempo real |
| **JWT** | JSON Web Token - Token de autenticación cifrado |
| **TypeORM** | Object-Relational Mapping para TypeScript |
| **DTO** | Data Transfer Object - Objeto para validar y transferir datos |
| **CRUD** | Create, Read, Update, Delete - Operaciones básicas |
| **ORM** | Object-Relational Mapping - Mapeo objeto-relacional |

---

### Equipo de Desarrollo

| Integrante | Rol | Responsabilidad | Contacto |
|------------|-----|-----------------|----------|
| Odalia Senge | Backend TypeScript | Guías, Tours, Reservas |
| Nestor Ayala | Backend Python | Usuarios, Destinos, Auth |
| Abigail Plua | Backend Golang | Servicios, Contrataciones |

### Profesor
📧 **Email:** joancemac@gmail.com

---

## 📚 Referencias y Documentación

### Documentación Oficial

- [Node.js](https://nodejs.org/docs/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Express](https://expressjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Python](https://docs.python.org/)
- [Flask](https://flask.palletsprojects.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Go](https://go.dev/doc/)
- [Gin](https://gin-gonic.com/docs/)
- [GraphQL](https://graphql.org/learn/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [Socket.io](https://socket.io/docs/)

### Tutoriales y Guías

- [Microservicios con Node.js](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [REST API Best Practices](https://restfulapi.net/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [JWT Authentication](https://jwt.io/introduction)

---

## 🔒 Seguridad

### Mejores Prácticas Implementadas

#### 1. Autenticación JWT
```typescript
// Middleware de autenticación
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token no proporcionado' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};
```

#### 2. Validación de Datos
```typescript
// Uso de class-validator
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateGuiaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;
}
```

#### 3. Variables de Entorno
```bash
# Nunca subir .env a GitHub
# Usar .env.example como plantilla
JWT_SECRET=valor_secreto_muy_largo_y_aleatorio
DB_PASSWORD=nunca_uses_postgres_como_password
```

#### 4. CORS Configurado
```typescript
app.use(cors({
  origin: ['http://localhost:5173'], // Solo frontend permitido
  credentials: true
}));
```

#### 5. Sanitización de Inputs
```typescript
// Evitar SQL injection usando TypeORM
const tour = await tourRepository.findOne({
  where: { id_tour: parseInt(id) } // Parsear a número
});
```

#### 6. Rate Limiting (Opcional - Recomendado)
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // Límite de 100 requests por IP
});

app.use('/api/', limiter);
```

---

## 📊 Monitoreo y Logs

### Sistema de Logs

#### Logger Middleware
```typescript
// src/middlewares/logger.middleware.ts
export const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
```

#### Logs en Producción
```bash
# Usar una herramienta como Winston
npm install winston

# Configurar niveles de log
- error: Errores críticos
- warn: Advertencias
- info: Información general
- debug: Debugging
```

---

## 🎨 Buenas Prácticas de Código

### Convenciones de Nombrado

#### TypeScript/JavaScript
```typescript
// Variables y funciones: camelCase
const userName = 'Juan';
function getUserById(id) { }

// Clases: PascalCase
class UserService { }

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;

// Interfaces: PascalCase con I (opcional)
interface IUser { }
```

#### Python
```python
# Variables y funciones: snake_case
user_name = 'Juan'
def get_user_by_id(id):
    pass

# Clases: PascalCase
class UserService:
    pass

# Constantes: UPPER_SNAKE_CASE
MAX_RETRY_ATTEMPTS = 3
```

#### Golang
```go
// Exportadas: PascalCase
type User struct { }
func GetUserByID(id int) { }

// Privadas: camelCase
func getUserData() { }
```

### Estructura de Commits

```bash
# Formato recomendado
tipo(alcance): descripción corta

# Tipos:
feat: Nueva funcionalidad
fix: Corrección de bug
docs: Documentación
style: Formato de código
refactor: Refactorización
test: Tests
chore: Tareas de mantenimiento

# Ejemplos:
feat(guias): agregar endpoint para crear guía
fix(tours): corregir validación de precio
docs(readme): actualizar instrucciones de instalación
```

---

## 🌐 Variables de Entorno

### Archivo .env.example Completo

#### Backend TypeScript
```env
# SERVIDOR
PORT=3000
NODE_ENV=development

# BASE DE DATOS
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=
DB_DATABASE=tours_db

# SEGURIDAD
JWT_SECRET=

# SERVICIOS EXTERNOS
PYTHON_API_URL=http://localhost:5000
GOLANG_API_URL=http://localhost:8080
GRAPHQL_API_URL=http://localhost:4000
WEBSOCKET_URL=http://localhost:8081

# LOGS
LOG_LEVEL=info
```

#### Backend Python
```env
# SERVIDOR
PORT=5000
FLASK_ENV=development

# BASE DE DATOS
DATABASE_URL=postgresql://postgres:password@localhost:5432/usuarios_db

# SEGURIDAD
JWT_SECRET=
JWT_EXPIRATION_HOURS=24

# SERVICIOS EXTERNOS
TYPESCRIPT_API_URL=http://localhost:3000
GOLANG_API_URL=http://localhost:8080
```

#### Backend Golang
```env
# SERVIDOR
PORT=8080
GIN_MODE=debug

# BASE DE DATOS
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=servicios_db

# SERVICIOS EXTERNOS
TYPESCRIPT_API_URL=http://localhost:3000
PYTHON_API_URL=http://localhost:5000
```

---

## 📦 Comandos Útiles

### Backend TypeScript

```bash
# Desarrollo
npm run dev              # Inicia con nodemon (recarga automática)
npm start                # Inicia en modo producción
npm run build            # Compila TypeScript a JavaScript

# Testing
npm test                 # Ejecuta todos los tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests con cobertura

# Linting
npm run lint             # Revisa código
npm run lint:fix         # Corrige errores automáticamente

# Base de datos
npm run typeorm migration:generate -- -n NombreMigration
npm run typeorm migration:run
```

### Backend Python

```bash
# Entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Dependencias
pip install -r requirements.txt
pip freeze > requirements.txt

# Desarrollo
python main.py                    # Flask
uvicorn main:app --reload         # FastAPI

# Testing
pytest
pytest --cov=app tests/

# Base de datos
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Backend Golang

```bash
# Dependencias
go mod init
go mod tidy
go get <paquete>

# Desarrollo
go run cmd/api/main.go

# Build
go build -o main cmd/api/main.go
./main

# Testing
go test ./...
go test -cover ./...

# Format
go fmt ./...
```

### Docker

```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f [servicio]

# Detener
docker-compose down

# Reconstruir
docker-compose up -d --build

# Limpiar todo
docker-compose down -v
```

---

## 🔄 Workflows de Git

### Branching Strategy

```bash
# Branch principal
main (producción)

# Branch de desarrollo
develop

# Features branches
feature/nombre-funcionalidad

# Bugfix branches
bugfix/descripcion-bug

# Ejemplo de workflow:
git checkout develop
git checkout -b feature/crear-reservas
# ... hacer cambios ...
git add .
git commit -m "feat(reservas): implementar creación de reservas"
git push origin feature/crear-reservas
# ... crear Pull Request a develop ...
```

### Pull Request Template

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Nueva funcionalidad
- [ ] Corrección de bug
- [ ] Refactorización
- [ ] Documentación

## Checklist
- [ ] El código compila sin errores
- [ ] Se agregaron tests
- [ ] Se actualizó la documentación
- [ ] Se probó localmente

## Screenshots (si aplica)
```

---

## 📈 Métricas y KPIs del Proyecto

### Métricas Técnicas

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| Cobertura de tests | > 70% | 🟡 En progreso |
| Tiempo de respuesta API | < 200ms | ✅ Cumplido |
| Uptime | > 99% | ✅ Cumplido |
| APIs documentadas | 100% | ✅ Cumplido |
| Endpoints funcionales | 100% | ✅ Cumplido |

### Métricas de Negocio

- Total de tours registrados
- Total de reservas activas
- Guías disponibles
- Destinos más populares
- Ingresos totales

---

## 🎓 Aprendizajes Clave

### Competencias Desarrolladas

1. **Arquitectura de Software**
   - Diseño de microservicios
   - Comunicación entre servicios
   - Separación de responsabilidades

2. **Desarrollo Backend**
   - APIs REST en múltiples lenguajes
   - ORMs y bases de datos
   - Autenticación y autorización

3. **Integración de Tecnologías**
   - GraphQL para agregación de datos
   - WebSockets para tiempo real
   - HTTP para comunicación síncrona

4. **Buenas Prácticas**
   - Código limpio y mantenible
   - Validación de datos
   - Manejo de errores
   - Documentación técnica

5. **Trabajo en Equipo**
   - Control de versiones con Git
   - Revisión de código
   - Comunicación efectiva
   - Resolución de conflictos

---

## 🚀 Próximos Pasos y Mejoras

### Features Futuros

- [ ] Implementar sistema de pagos (Stripe/PayPal)
- [ ] Agregar sistema de calificaciones y reviews
- [ ] Implementar chat en tiempo real entre usuarios y guías
- [ ] Agregar sistema de notificaciones por email
- [ ] Implementar caché con Redis
- [ ] Agregar internacionalización (i18n)
- [ ] Implementar búsqueda avanzada con Elasticsearch
- [ ] Agregar sistema de cupones y descuentos
- [ ] Implementar análisis de datos con Power BI
- [ ] Agregar geolocalización con Google Maps

### Mejoras Técnicas

- [ ] Implementar CI/CD con GitHub Actions
- [ ] Agregar monitoreo con Prometheus/Grafana
- [ ] Implementar rate limiting
- [ ] Agregar documentación Swagger/OpenAPI
- [ ] Implementar versionado de API
- [ ] Agregar healthchecks
- [ ] Implementar circuit breakers
- [ ] Optimizar queries de base de datos
- [ ] Agregar índices en BD
- [ ] Implementar logging centralizado

---

## 📄 Licencia

Este proyecto es parte de un trabajo académico para el curso de Desarrollo de Software.

**Universidad:** Eloy Alfaro de Manabí  
**Curso:** Quinto A  
**Profesor:** Ing. JOHN CEVALLOS (joancemac@gmail.com)  
**Fecha:** Octubre 2025  

---

## 🙏 Agradecimientos

- Profesor JOHN CEVALLOS por la guía y apoyo
- Compañeros de equipo por la colaboración
- Comunidad open source por las herramientas utilizadas
- Documentación oficial de cada tecnología

---

## 📞 FAQ - Preguntas Frecuentes

### ¿Por qué usar 3 lenguajes diferentes?

Para demostrar habilidades en múltiples tecnologías y entender cómo integrar sistemas heterogéneos, lo cual es común en empresas reales.

### ¿Por qué cada servicio tiene su propia base de datos?

Es un principio de microservicios: cada servicio debe ser independiente y responsable de sus propios datos. Esto permite escalabilidad y mantenimiento independiente.

### ¿Qué pasa si un servicio está caído?

Los demás servicios pueden seguir funcionando. Se implementa manejo de errores para casos donde un servicio externo no responde.

### ¿Cuándo usar REST vs GraphQL?

- **REST:** Para operaciones CRUD individuales (crear, editar, eliminar)
- **GraphQL:** Para consultas complejas que combinan datos de múltiples fuentes

### ¿Es necesario Docker?

No es obligatorio para desarrollo local, pero facilita el despliegue y garantiza que todos trabajen con el mismo entorno.

### ¿Cómo se manejan las transacciones distribuidas?

Por simplicidad, no se implementan transacciones distribuidas. Cada servicio maneja sus transacciones localmente.

### ¿Qué pasa con los datos si elimino un tour que tiene reservas?

El sistema valida que no existan reservas activas antes de permitir la eliminación.

---

## 📚 Recursos Adicionales

### Tutoriales Recomendados

- [Microservices Architecture](https://microservices.io/)
- [REST API Design Best Practices](https://restfulapi.net/)
- [GraphQL Tutorial](https://www.howtographql.com/)
- [WebSocket Tutorial](https://javascript.info/websocket)

### Libros Recomendados

- "Building Microservices" - Sam Newman
- "Designing Data-Intensive Applications" - Martin Kleppmann
- "Clean Code" - Robert C. Martin
- "The Pragmatic Programmer" - David Thomas

---

**🎉 ¡Proyecto Completo y Listo para Entregar! 🎉**

---

*Última actualización: Octubre 6, 2025*  
*Versión: 1.0.0*  
*Desarrollado con ❤️ por el equipo de desarrollo*