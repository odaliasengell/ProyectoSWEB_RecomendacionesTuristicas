# 🚀 Panel WebSocket con Integración TypeScript API

## ✅ Cambios Realizados

He modificado el panel de pruebas del WebSocket (`backend/websocket-server/index.html`) para que **traiga información REAL** del servidor TypeScript en lugar de datos de prueba.

### 🎯 Funcionalidades Implementadas

1. **Carga de Datos Reales del API TypeScript**:
   - 🏝️ Cargar Tours
   - 👨‍🏫 Cargar Guías
   - 📅 Cargar Reservas

2. **Envío de Eventos con Datos Reales**:
   - Al hacer clic en "Enviar Evento", el sistema:
     1. Consulta el API TypeScript (`http://localhost:3000`)
     2. Obtiene datos reales (tours, guías, reservas)
     3. Envía esos datos al WebSocket vía `/notify`
     4. Los clientes conectados reciben el evento en tiempo real

3. **Fallback Automático**:
   - Si el servidor TypeScript no está disponible, usa datos de respaldo
   - Muestra mensajes claros de error en el log

### 📊 Arquitectura

```
┌─────────────────┐     1. GET /api/tours      ┌──────────────────┐
│                 │ ───────────────────────────> │                  │
│  Panel WebSocket│                              │ API TypeScript   │
│  (index.html)   │ <─────────────────────────── │ (puerto 3000)    │
│                 │     2. Datos reales          │                  │
└────────┬────────┘                              └──────────────────┘
         │
         │ 3. POST /notify + datos
         │
         ▼
┌─────────────────┐     4. Emit evento         ┌──────────────────┐
│                 │ ───────────────────────────> │                  │
│ WebSocket Server│                              │  Clientes        │
│  (puerto 8081)  │                              │  Conectados      │
│                 │                              │                  │
└─────────────────┘                              └──────────────────┘
```

## 🚀 Cómo Usar

### 1. Arrancar el Servidor WebSocket

```powershell
cd 'C:\Users\DESKTOP\ProyectoSWEB_RecomendacionesTuristicas\backend\websocket-server'
npm run dev
```

El servidor estará en: `http://localhost:8081`

### 2. Arrancar el Servidor TypeScript

```powershell
cd 'C:\Users\DESKTOP\ProyectoSWEB_RecomendacionesTuristicas\backend\typescritp-tour-reversa-guia'
npm run dev
```

El API estará en: `http://localhost:3000`

⚠️ **IMPORTANTE**: Debes configurar primero la base de datos PostgreSQL.

### 3. Abrir el Panel

Navega a: `http://localhost:8081/index.html`

### 4. Probar el Flujo Completo

1. **Conectar al WebSocket**:
   - Haz clic en "🔌 Conectar"
   - Verás el estado cambiar a "● Conectado"

2. **Unirte a una sala**:
   - Haz clic en "📥 Unirse a Sala"
   - Por defecto te unes a "dashboard"

3. **Cargar datos reales**:
   - Haz clic en "🏝️ Cargar Tours"
   - Verás la lista de tours en el log
   - Repite con Guías y Reservas

4. **Enviar evento con datos reales**:
   - Selecciona un tipo de evento (ej: "Tour Actualizado")
   - Haz clic en "🚀 Enviar Evento (Datos Reales)"
   - El sistema:
     - Consulta el API TypeScript
     - Obtiene un tour aleatorio
     - Lo envía al WebSocket
     - Los clientes conectados lo reciben

5. **Ver eventos en tiempo real**:
   - Los eventos aparecerán en el log con color naranja
   - Las estadísticas se actualizarán automáticamente

## 🔧 Configurar la Base de Datos

El servidor TypeScript necesita una base de datos PostgreSQL. Si no la tienes configurada:

### Opción 1: Configurar PostgreSQL

1. **Instala PostgreSQL** (si no lo tienes):
   - Descarga desde: https://www.postgresql.org/download/

2. **Crea un archivo `.env`** en `backend/typescritp-tour-reversa-guia`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
DB_DATABASE=turismo_db

# WebSocket
WEBSOCKET_URL=http://localhost:8081
```

3. **Crea la base de datos**:

```sql
CREATE DATABASE turismo_db;
```

4. **Reinicia el servidor TypeScript**:

```powershell
cd 'C:\Users\DESKTOP\ProyectoSWEB_RecomendacionesTuristicas\backend\typescritp-tour-reversa-guia'
npm run dev
```

### Opción 2: Usar SQLite (más sencillo para pruebas)

Si quieres evitar PostgreSQL, puedes modificar la configuración para usar SQLite:

1. Edita `backend/typescritp-tour-reversa-guia/src/config/database.ts`
2. Cambia el tipo de base de datos a `sqlite`
3. Reinicia el servidor

## 📋 Endpoints del API TypeScript

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/tours` | GET | Obtener todos los tours |
| `/api/tours/:id` | GET | Obtener un tour por ID |
| `/api/tours` | POST | Crear un nuevo tour |
| `/api/tours/:id` | PUT | Actualizar un tour |
| `/api/tours/:id` | DELETE | Eliminar un tour |
| `/api/guias` | GET | Obtener todas las guías |
| `/api/guias/:id` | GET | Obtener una guía por ID |
| `/api/reservas` | GET | Obtener todas las reservas |
| `/api/reservas/:id` | GET | Obtener una reserva por ID |

## 🎨 Tipos de Eventos Soportados

Todos estos eventos ahora usan **datos reales del API TypeScript**:

1. **nueva_reserva**: Trae una reserva real de `/api/reservas`
2. **tour_actualizado**: Trae un tour real de `/api/tours`
3. **guia_disponible**: Trae una guía real de `/api/guias`
4. **reserva_actualizada**: Trae una reserva real de `/api/reservas`
5. **servicio_contratado**: Usa datos de fallback (no hay endpoint aún)
6. **notificacion**: Notificación genérica
7. **custom**: Evento personalizado

## 🔍 Solución de Problemas

### Error: "No se puede conectar al API TypeScript"

**Causa**: El servidor TypeScript no está corriendo o la base de datos no está configurada.

**Solución**:
1. Verifica que el servidor TypeScript esté corriendo:
   ```powershell
   netstat -ano | findstr ":3000"
   ```
2. Si no está corriendo, arráncalo:
   ```powershell
   cd backend\typescritp-tour-reversa-guia
   npm run dev
   ```
3. Configura la base de datos (ver sección anterior)

### Error: "No hay datos disponibles"

**Causa**: La base de datos está vacía.

**Solución**: Inserta datos de prueba en la base de datos:

```sql
-- Insertar tours de prueba
INSERT INTO tours (nombre, descripcion, precio, disponible) VALUES
('Tour Galápagos', 'Explora las islas Galápagos', 500.00, true),
('Tour Quito Colonial', 'Recorrido por el centro histórico', 50.00, true);

-- Insertar guías de prueba
INSERT INTO guias (nombre, especialidad, idiomas, disponible) VALUES
('María González', 'Historia', '["Español", "Inglés"]', true),
('Juan Pérez', 'Naturaleza', '["Español", "Francés"]', true);
```

### El WebSocket no recibe eventos

**Causa**: No estás conectado o no te uniste a una sala.

**Solución**:
1. Haz clic en "🔌 Conectar"
2. Haz clic en "📥 Unirse a Sala"
3. Verifica que la sala coincida con la del evento

## 🎯 Próximos Pasos Sugeridos

1. **Autenticación JWT**: Proteger las conexiones WebSocket
2. **Más Endpoints**: Agregar servicios, destinos, usuarios
3. **Frontend React**: Integrar el WebSocket en el frontend
4. **Notificaciones Push**: Implementar notificaciones del navegador
5. **Dashboard en Tiempo Real**: Mostrar estadísticas actualizadas automáticamente

## 📚 Recursos

- Panel WebSocket: `http://localhost:8081/index.html`
- API TypeScript: `http://localhost:3000`
- Documentación WebSocket: `backend/websocket-server/README.md`
- Documentación TypeScript: `backend/typescritp-tour-reversa-guia/README.md`
