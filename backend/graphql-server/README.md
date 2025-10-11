# Servidor GraphQL - Reportes Turísticos

Servidor GraphQL que agrega datos de los tres microservicios (TypeScript, Python y Go) para generar reportes consolidados.

## 🚀 Características

- **Apollo Server 4**: Servidor GraphQL moderno y eficiente
- **Agregación de datos**: Consulta múltiples microservicios en una sola petición
- **Caché**: Sistema de caché para optimizar consultas frecuentes
- **TypeScript**: Código completamente tipado
- **Reportes avanzados**: Estadísticas y análisis de tours, reservas y contrataciones

## 📋 Requisitos Previos

- Node.js 18+ y npm/yarn
- Los tres microservicios deben estar corriendo:
  - TypeScript (Tours/Reservas): `http://localhost:3000`
  - Python (Usuarios/Destinos): `http://localhost:8000`
  - Go (Servicios/Contrataciones): `http://localhost:8080`

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las URLs correctas de tus microservicios

# Modo desarrollo
npm run dev

# Compilar para producción
npm run build
npm start
```

## 🌐 Uso

El servidor estará disponible en `http://localhost:4000`

Accede a Apollo Studio en tu navegador para explorar el esquema y hacer consultas:
`http://localhost:4000`

## � Inicio Rápido

**¿Primera vez usando el servidor?** Lee primero: **[CONSULTAS_INICIO.md](./CONSULTAS_INICIO.md)**

Este archivo contiene:
- ✅ Consultas que funcionan garantizadas
- 📝 Ejemplos paso a paso
- 🐛 Soluciones a errores comunes
- 💡 Tips para evitar problemas

## �📊 Ejemplos de Consultas

### ⚠️ Importante: No consultes campos anidados si el objeto padre puede ser null

Si un tour no tiene guía asignado, **NO** incluyas el campo `guia` con subcampos, o GraphQL devolverá un error. Usa las consultas básicas primero.

### ✅ Obtener todos los tours (consulta básica y segura)

```graphql
query {
  tours {
    id
    nombre
    descripcion
    precio
    duracion
    capacidadMaxima
    disponible
    ubicacion
  }
}
```

### Obtener tours con sus reservas (solo si existen reservas)

```graphql
query {
  tours {
    id
    nombre
    precio
    reservas {
      id
      fechaReserva
      estado
    }
  }
}
```

**Nota:** Si un tour no tiene reservas, devolverá un array vacío `[]`, lo cual es correcto.

### Ver todas las guías disponibles

```graphql
query {
  guias {
    id
    nombre
    apellido
    especialidad
    idiomas
    calificacion
    disponible
  }
}
```

### Obtener un tour específico

```graphql
query {
  tour(id: "1") {
    id
    nombre
    descripcion
    precio
    duracion
    capacidadMaxima
    ubicacion
    disponible
  }
}
```

### Tours disponibles

```graphql
query {
  toursDisponibles {
    id
    nombre
    precio
    duracion
    capacidadMaxima
  }
}
```

### 🎯 Reporte de tours más populares

```graphql
query {
  reporteToursPopulares(limite: 10) {
    tourId
    nombreTour
    totalReservas
    ingresoTotal
    promedioCalificacion
  }
}
```

### Reporte de reservas por período

```graphql
query {
  reporteReservasPorPeriodo(
    fechaInicio: "2025-01-01"
    fechaFin: "2025-12-31"
  ) {
    totalReservas
    reservasPendientes
    reservasConfirmadas
    reservasCanceladas
    ingresoTotal
  }
}
```

### Reporte consolidado

```graphql
query {
  reporteConsolidado {
    tours {
      total
      activos
    }
    reservas {
      total
      pendientes
      confirmadas
    }
    servicios {
      total
      contratados
    }
    ingresoTotal
  }
}
```

## 🏗️ Arquitectura

```
graphql-server/
├── src/
│   ├── schema/          # Definiciones de tipos GraphQL
│   ├── resolvers/       # Lógica de resolución de consultas
│   ├── datasources/     # Conectores a APIs REST
│   ├── utils/           # Utilidades (caché, etc.)
│   └── server.ts        # Configuración de Apollo Server
```

## 🔄 DataSources

El servidor utiliza DataSources para comunicarse con los microservicios:

- **TypeScriptAPI**: Tours, Reservas, Guías
- **PythonAPI**: Usuarios, Destinos, Recomendaciones
- **GolangAPI**: Servicios, Contrataciones

## 💾 Sistema de Caché

Se implementa caché en memoria con `node-cache` para optimizar consultas frecuentes. El TTL por defecto es de 5 minutos (configurable en `.env`).

## 🐛 Troubleshooting

### Error: "Cannot return null for non-nullable field"

**Problema:** Estás intentando consultar campos anidados de un objeto que es `null`.

**Ejemplo de error:**
```
Cannot return null for non-nullable field Guia.id
```

**Solución:** No consultes campos anidados si el objeto padre puede ser `null`. 

❌ **Incorrecto:**
```graphql
query {
  tours {
    id
    nombre
    guia {
      id        # ← Error si guia es null
      nombre
    }
  }
}
```

✅ **Correcto (Opción 1 - Solo campos básicos):**
```graphql
query {
  tours {
    id
    nombre
    descripcion
    precio
  }
}
```

✅ **Correcto (Opción 2 - Consultar guías por separado):**
```graphql
query {
  guias {
    id
    nombre
    apellido
    especialidad
  }
}
```

### Error de conexión a microservicios

**Problema:** El servidor GraphQL no puede conectarse a los microservicios.

**Solución:**
1. Verifica que todos los microservicios estén corriendo:
   - TypeScript API: http://localhost:3000
   - Python API: http://localhost:8000
   - Golang API: http://localhost:8080

2. Verifica las URLs en `.env`:
   ```env
   TYPESCRIPT_API_URL=http://localhost:3000
   PYTHON_API_URL=http://localhost:8000
   GOLANG_API_URL=http://localhost:8080
   ```

3. Prueba acceder directamente a las APIs:
   ```bash
   curl http://localhost:3000/api/tours
   curl http://localhost:8000/api/usuarios
   curl http://localhost:8080/servicios
   ```

### Error: "Expected Iterable, but did not find one"

**Problema:** La API devuelve un objeto en lugar de un array.

**Solución:** Ya está solucionado en los DataSources. El servidor extrae automáticamente el array del objeto `{ success, message, data }`.

### Errores de caché

Si los datos no se actualizan después de modificarlos, limpia la caché:

```graphql
mutation {
  limpiarCache
}
```

## 📝 Licencia

MIT
