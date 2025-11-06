# 🚀 GraphQL Service - Sistema de Recomendaciones Turísticas

## 📋 Descripción

Servicio GraphQL desarrollado en **TypeScript** con **Apollo Server** que proporciona consultas analíticas y reportes complejos para el sistema de recomendaciones turísticas. Se conecta a la API REST de Python para obtener los datos y los procesa para generar estadísticas avanzadas.

## 🏗️ Tecnologías Utilizadas

- **Node.js** + **TypeScript**
- **Apollo Server** v4 - Servidor GraphQL
- **GraphQL** - Lenguaje de consultas
- **Axios** - Cliente HTTP para conectarse con REST API
- **dotenv** - Manejo de variables de entorno

## 📁 Estructura del Proyecto

```
graphql-service/
├── src/
│   ├── datasource/
│   │   └── restAPI.ts          # Conexión con la API REST de Python
│   ├── resolvers/
│   │   └── index.ts            # Lógica de resolución de queries
│   ├── schema/
│   │   └── index.ts            # Definición del schema GraphQL
│   ├── types.ts                # Interfaces y tipos TypeScript
│   └── server.ts               # Configuración de Apollo Server
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=4000
REST_API_URL=http://localhost:8000/api
```

### 3. Iniciar en modo desarrollo

```bash
npm run dev
```

### 4. Compilar y ejecutar en producción

```bash
npm run build
npm start
```

## 🌐 Acceso al Playground

Una vez iniciado el servidor, accede a:

```
http://localhost:4000
```

Aquí podrás explorar el schema y ejecutar queries interactivas.

## 📊 Queries Disponibles

### 🎯 Consultas Básicas

#### Obtener todos los usuarios
```graphql
query {
  usuarios {
    _id
    nombre
    email
    rol
  }
}
```

#### Obtener todos los tours
```graphql
query {
  tours {
    _id
    nombre
    precio
    duracion_dias
    destino {
      nombre
      ubicacion
    }
    guia {
      nombre
      especialidad
    }
  }
}
```

#### Obtener todas las reservas
```graphql
query {
  reservas {
    _id
    fecha_reserva
    num_personas
    precio_total
    estado
    tour {
      nombre
    }
    usuario {
      nombre
    }
  }
}
```

### 📈 Reportes Analíticos

#### 1. Top Tours Más Reservados
```graphql
query {
  toursTop(limit: 10) {
    tour {
      _id
      nombre
      precio
      destino {
        nombre
      }
    }
    total_reservas
    total_personas
    ingresos_totales
  }
}
```

#### 2. Guías Más Activos
```graphql
query {
  guiasTop(limit: 10) {
    guia {
      _id
      nombre
      especialidad
      experiencia_anios
    }
    total_tours
    total_reservas
    calificacion_promedio
  }
}
```

#### 3. Usuarios Más Activos
```graphql
query {
  usuariosTop(limit: 10) {
    usuario {
      _id
      nombre
      email
    }
    total_reservas
    total_gastado
    total_recomendaciones
  }
}
```

#### 4. Reservas por Mes
```graphql
query {
  reservasPorMes(anio: 2025) {
    mes
    anio
    total_reservas
    total_ingresos
  }
}
```

#### 5. Destinos Más Populares
```graphql
query {
  destinosPopulares(limit: 10) {
    destino {
      _id
      nombre
      ubicacion
      categoria
    }
    total_tours
    total_reservas
    calificacion_promedio
  }
}
```

#### 6. Servicios Más Contratados
```graphql
query {
  serviciosTop(limit: 10) {
    servicio {
      _id
      nombre
      tipo
      precio_base
    }
    total_contrataciones
    total_ingresos
  }
}
```

#### 7. Estadísticas Generales del Sistema
```graphql
query {
  estadisticasGenerales {
    total_usuarios
    total_destinos
    total_tours
    total_guias
    total_reservas
    total_ingresos
    reservas_pendientes
    reservas_confirmadas
    reservas_completadas
    reservas_canceladas
  }
}
```

### 🔄 Query Combinada (Dashboard Completo)
```graphql
query DashboardCompleto {
  estadisticas: estadisticasGenerales {
    total_usuarios
    total_tours
    total_reservas
    total_ingresos
  }
  
  topTours: toursTop(limit: 5) {
    tour {
      nombre
      precio
    }
    total_reservas
    ingresos_totales
  }
  
  topGuias: guiasTop(limit: 5) {
    guia {
      nombre
      especialidad
    }
    total_tours
    calificacion_promedio
  }
  
  destinosPopulares: destinosPopulares(limit: 5) {
    destino {
      nombre
      ubicacion
    }
    total_reservas
  }
}
```

## 🔌 Conexión con REST API

El servicio GraphQL se conecta automáticamente con la API REST de Python configurada en `REST_API_URL`. Los endpoints utilizados son:

- `GET /usuarios` - Lista de usuarios
- `GET /usuarios/:id` - Usuario por ID
- `GET /destinos` - Lista de destinos
- `GET /destinos/:id` - Destino por ID
- `GET /tours` - Lista de tours
- `GET /tours/:id` - Tour por ID
- `GET /guias` - Lista de guías
- `GET /guias/:id` - Guía por ID
- `GET /reservas` - Lista de reservas
- `GET /reservas/:id` - Reserva por ID
- `GET /servicios` - Lista de servicios
- `GET /servicios/:id` - Servicio por ID
- `GET /contrataciones` - Lista de contrataciones
- `GET /recomendaciones` - Lista de recomendaciones

## 🧪 Testing

Para probar el servicio, asegúrate de que:

1. ✅ La API REST de Python esté ejecutándose
2. ✅ MongoDB esté activo con datos de prueba
3. ✅ Las variables de entorno estén correctamente configuradas

## 🎨 Características Principales

### ✨ Resolvers Inteligentes
- Procesamiento de datos agregados
- Cálculo de promedios y totales
- Ordenamiento y limitación de resultados

### 🔗 Relaciones Anidadas
- Tours con sus destinos y guías
- Reservas con tours y usuarios
- Recomendaciones con entidades relacionadas

### 📊 Analítica Avanzada
- Rankings y tops
- Agrupación temporal (por mes)
- Métricas de ingresos y actividad

## 🤝 Integración con Frontend

Desde React, puedes consumir este servicio usando Apollo Client:

```typescript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache(),
});

// Ejemplo de query
const GET_TOP_TOURS = gql`
  query {
    toursTop(limit: 5) {
      tour {
        nombre
        precio
      }
      total_reservas
    }
  }
`;
```

## 📝 Scripts Disponibles

```bash
npm run dev      # Ejecutar en modo desarrollo con hot-reload
npm run build    # Compilar TypeScript a JavaScript
npm start        # Ejecutar versión compilada
```

## 🐛 Troubleshooting

### Error: Cannot connect to REST API
- Verifica que la API REST esté ejecutándose
- Comprueba la URL en el archivo `.env`

### Error: GraphQL syntax error
- Revisa la sintaxis de tus queries
- Usa el Playground para validar

### Error: Module not found
- Ejecuta `npm install` nuevamente
- Verifica que `node_modules` exista

## 👥 Autor

**Integrante 2 - Servicio GraphQL**  
Proyecto de Sistemas Web - Sistema de Recomendaciones Turísticas

## 📄 Licencia

MIT

---

🚀 **Happy Querying!**
