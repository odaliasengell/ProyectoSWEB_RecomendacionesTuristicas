# Documentación Técnica - Servidor GraphQL

## 🏗️ Arquitectura

### Estructura del Proyecto

```
graphql-server/
├── src/
│   ├── schema/               # Definiciones de tipos GraphQL
│   │   ├── index.ts         # Exportación combinada de schemas
│   │   ├── tour.schema.ts   # Tipos de tours y guías
│   │   ├── reserva.schema.ts # Tipos de reservas
│   │   └── reporte.schema.ts # Tipos de reportes
│   │
│   ├── resolvers/            # Lógica de negocio
│   │   ├── index.ts         # Exportación combinada de resolvers
│   │   ├── tour.resolver.ts # Resolvers de tours
│   │   ├── reserva.resolver.ts # Resolvers de reservas
│   │   └── reporte.resolver.ts # Resolvers de reportes
│   │
│   ├── datasources/          # Conectores a APIs REST
│   │   ├── typescript-api.ts # Conexión a microservicio TypeScript
│   │   ├── python-api.ts    # Conexión a microservicio Python
│   │   └── golang-api.ts    # Conexión a microservicio Golang
│   │
│   ├── utils/                # Utilidades
│   │   └── cache.ts         # Sistema de caché en memoria
│   │
│   └── server.ts             # Configuración y arranque del servidor Apollo
│
├── package.json              # Dependencias y scripts
├── tsconfig.json            # Configuración de TypeScript
├── .env                     # Variables de entorno (no versionado)
├── .env.example             # Ejemplo de variables de entorno
├── .gitignore               # Archivos ignorados por git
├── README.md                # Documentación principal
├── EJEMPLOS_CONSULTAS.md   # Ejemplos de queries GraphQL
└── ARQUITECTURA.md          # Este archivo
```

## 🔄 Flujo de Datos

```
Cliente (Apollo Studio / App)
        ↓
[Servidor GraphQL Apollo]
        ↓
    [Resolvers]
    ↙    ↓    ↘
[TS API] [Py API] [Go API]
    ↓       ↓       ↓
[Cache Manager] (opcional)
```

### 1. Recepción de Consulta
- El cliente envía una consulta GraphQL
- Apollo Server recibe y valida la consulta contra el schema

### 2. Resolución
- Los resolvers procesan la consulta
- Se verifica si hay datos en caché
- Si no hay caché, se llama a los DataSources correspondientes

### 3. Agregación de Datos
- Los DataSources hacen peticiones HTTP a las APIs REST
- Los datos de múltiples fuentes se combinan
- Los cálculos y transformaciones se realizan

### 4. Respuesta
- Los datos se almacenan en caché (si aplica)
- La respuesta se envía al cliente en formato JSON

## 📦 Componentes Principales

### Schema (GraphQL Types)

Define la estructura de datos y operaciones disponibles:

- **Types**: Tour, Reserva, Guia, Usuario, ReporteTourPopular, etc.
- **Queries**: Operaciones de lectura
- **Mutations**: Operaciones de escritura
- **Inputs**: Tipos de entrada para mutaciones

### Resolvers

Funciones que implementan la lógica de cada campo del schema:

```typescript
{
  Query: {
    tours: async (parent, args, context) => {
      // Lógica para obtener tours
    }
  },
  Tour: {
    guia: async (parent, args, context) => {
      // Lógica para resolver el campo guía de un tour
    }
  }
}
```

### DataSources

Clases que encapsulan las llamadas a APIs externas:

- **TypeScriptAPI**: Tours, Reservas, Guías
- **PythonAPI**: Usuarios, Destinos, Recomendaciones
- **GolangAPI**: Servicios, Contrataciones

Ventajas:
- Reutilización de código
- Manejo centralizado de errores
- Fácil testing y mocking

### Cache Manager

Sistema de caché en memoria con `node-cache`:

```typescript
// Uso básico
cacheManager.set('key', data, ttl);
const data = cacheManager.get('key');

// Patrón getOrSet
const data = await cacheManager.getOrSet('key', 
  async () => await fetchFromAPI(),
  ttl
);
```

Estrategias:
- **Read-through**: Se busca primero en caché, si no existe se obtiene de la fuente
- **Write-through**: Al modificar datos se invalida el caché relacionado
- **TTL**: Tiempo de vida configurable por tipo de dato

## 🔐 Manejo de Errores

### Niveles de Error

1. **Error de DataSource**: 
   - Se captura en el DataSource
   - Se registra en logs
   - Se devuelve null o array vacío según el caso

2. **Error de Resolver**:
   - Se propaga al cliente
   - Se formatea con información útil
   - Se incluye stacktrace en desarrollo

3. **Error de Servidor**:
   - Se captura globalmente
   - Se previene caída del servidor
   - Se registra para debugging

### Formato de Error GraphQL

```json
{
  "errors": [
    {
      "message": "No se pudo obtener el tour",
      "locations": [{"line": 2, "column": 3}],
      "path": ["tour"],
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR"
      }
    }
  ],
  "data": {
    "tour": null
  }
}
```

## ⚡ Optimizaciones

### 1. Batching (Futuro)
DataLoader para agrupar peticiones similares:
```typescript
const tourLoader = new DataLoader(async (ids) => {
  return await batchGetTours(ids);
});
```

### 2. Caché Estratificado
- **L1**: Caché en memoria (actual)
- **L2**: Redis (futuro) para compartir entre instancias
- **L3**: CDN para respuestas estáticas

### 3. Query Complexity
Limitar consultas muy complejas:
```typescript
plugins: [
  ApolloServerPluginQueryComplexity({
    maximumComplexity: 1000
  })
]
```

### 4. Paginación
Implementar paginación con cursors:
```graphql
type TourConnection {
  edges: [TourEdge]
  pageInfo: PageInfo
}
```

## 🧪 Testing

### Estructura de Tests (Futuro)

```
tests/
├── unit/
│   ├── resolvers/
│   │   ├── tour.resolver.test.ts
│   │   ├── reserva.resolver.test.ts
│   │   └── reporte.resolver.test.ts
│   ├── datasources/
│   │   ├── typescript-api.test.ts
│   │   ├── python-api.test.ts
│   │   └── golang-api.test.ts
│   └── utils/
│       └── cache.test.ts
│
└── integration/
    ├── queries.test.ts
    └── mutations.test.ts
```

### Mocking de DataSources

```typescript
const mockDataSources = {
  typescriptAPI: {
    getTours: jest.fn().mockResolvedValue([mockTour]),
  },
  pythonAPI: {
    getUsuarios: jest.fn().mockResolvedValue([mockUsuario]),
  },
};
```

## 📊 Monitoreo

### Métricas Importantes

1. **Performance**:
   - Tiempo de respuesta por query
   - Tiempo de respuesta por resolver
   - Tasa de aciertos de caché

2. **Uso**:
   - Queries más frecuentes
   - Errores más comunes
   - Picos de tráfico

3. **Salud**:
   - Estado de conexiones a APIs
   - Uso de memoria
   - CPU

### Logging

```typescript
console.log('[GraphQL] Query:', queryName);
console.log('[Cache] Hit:', key);
console.error('[DataSource] Error:', error);
```

## 🚀 Despliegue

### Desarrollo Local

```bash
npm install
npm run dev
```

### Producción

```bash
# Compilar
npm run build

# Ejecutar
NODE_ENV=production npm start
```

### Docker (Futuro)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

### Variables de Entorno Requeridas

- `PORT`: Puerto del servidor
- `TYPESCRIPT_API_URL`: URL del servicio TypeScript
- `PYTHON_API_URL`: URL del servicio Python
- `GOLANG_API_URL`: URL del servicio Golang
- `CACHE_TTL`: TTL del caché en segundos
- `NODE_ENV`: Entorno (development/production)

## 🔄 Ciclo de Vida del Request

1. **Recepción**: Apollo Server recibe la petición HTTP POST
2. **Parsing**: Se parsea la query GraphQL
3. **Validación**: Se valida contra el schema
4. **Ejecución**:
   - Se ejecutan los resolvers en orden
   - Se consulta/actualiza caché
   - Se llaman DataSources si es necesario
5. **Formateo**: Se estructura la respuesta
6. **Respuesta**: Se envía JSON al cliente

## 💡 Mejores Prácticas

1. **Usar fragmentos** para reutilizar estructuras comunes
2. **Implementar paginación** para listas grandes
3. **Validar inputs** en los resolvers
4. **Manejar errores** de forma consistente
5. **Documentar queries** con descriptions
6. **Usar DataLoader** para evitar N+1 queries
7. **Implementar rate limiting** para prevenir abuso
8. **Monitorear performance** constantemente
9. **Escribir tests** para casos críticos
10. **Mantener el schema versionado**

## 🔗 Referencias

- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL Spec](https://spec.graphql.org/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Node Cache](https://github.com/node-cache/node-cache)
