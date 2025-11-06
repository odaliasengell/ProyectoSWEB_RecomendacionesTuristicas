# 📊 EJEMPLOS DE QUERIES AVANZADAS - GraphQL Service

Este documento contiene ejemplos prácticos de queries GraphQL para diferentes casos de uso.

## 🎯 Dashboard de Administrador

### Query completa para dashboard principal
```graphql
query DashboardAdmin {
  # Estadísticas generales
  stats: estadisticasGenerales {
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
  
  # Top 5 tours más populares
  topTours: toursTop(limit: 5) {
    tour {
      _id
      nombre
      duracion
      precio
      guia_id
      destino_id
      descripcion
      capacidad_maxima
      disponible
      destino {
        nombre
        ubicacion
        provincia
        ciudad
      }
      guia {
        nombre
        email
        idiomas
      }
    }
    total_reservas
    total_personas
    ingresos_totales
  }
  
  # Guías destacados
  topGuias: guiasTop(limit: 5) {
    guia {
      _id
      id_guia
      nombre
      email
      idiomas
      experiencia
      disponible
      calificacion
    }
    total_tours
    total_reservas
    calificacion_promedio
  }
  
  # Destinos populares
  topDestinos: destinosPopulares(limit: 5) {
    destino {
      _id
      nombre
      descripcion
      ubicacion
      ruta
      provincia
      ciudad
      categoria
      calificacion_promedio
      activo
    }
    total_tours
    total_reservas
    calificacion_promedio
  }
}
```

## 📈 Análisis de Ventas

### Ingresos mensuales del año actual
```graphql
query IngresosMensuales {
  reservasPorMes(anio: 2025) {
    mes
    anio
    total_reservas
    total_ingresos
  }
}
```

### Comparación de rendimiento de tours
```graphql
query ComparacionTours {
  toursTop(limit: 10) {
    tour {
      nombre
      duracion
      precio
      capacidad_maxima
      disponible
      destino {
        nombre
        categoria
        provincia
        ciudad
      }
    }
    total_reservas
    total_personas
    ingresos_totales
  }
}
```

## 👥 Análisis de Usuarios

### Clientes VIP (más gastadores)
```graphql
query ClientesVIP {
  usuariosTop(limit: 20) {
    usuario {
      _id
      nombre
      apellido
      email
      username
      pais
      fecha_registro
    }
    total_reservas
    total_gastado
    total_recomendaciones
  }
}
```

## 🏆 Rankings y Clasificaciones

### Top 3 de cada categoría
```graphql
query TopGeneral {
  mejoresTours: toursTop(limit: 3) {
    tour {
      nombre
      precio
    }
    total_reservas
    ingresos_totales
  }
  
  mejoresGuias: guiasTop(limit: 3) {
    guia {
      nombre
      email
      idiomas
      experiencia
    }
    total_tours
    calificacion_promedio
  }
  
  mejoresDestinos: destinosPopulares(limit: 3) {
    destino {
      nombre
      ubicacion
      provincia
      ciudad
      categoria
    }
    total_reservas
    calificacion_promedio
  }
  
  mejoresServicios: serviciosTop(limit: 3) {
    servicio {
      nombre
      descripcion
      categoria
      precio
    }
    total_contrataciones
    total_ingresos
  }
}
```

## 🔍 Consultas Específicas

### Detalles completos de un tour específico
```graphql
query DetallleTour {
  tour(id: "TOUR_ID_AQUI") {
    _id
    nombre
    duracion
    precio
    guia_id
    destino_id
    descripcion
    capacidad_maxima
    disponible
    created_at
    destino {
      _id
      nombre
      descripcion
      ubicacion
      ruta
      provincia
      ciudad
      categoria
      calificacion_promedio
      activo
    }
    guia {
      _id
      id_guia
      nombre
      email
      idiomas
      experiencia
      disponible
      calificacion
      created_at
    }
  }
}
```

### Información de una guía con todos sus tours
```graphql
query DetalleGuia {
  guia(id: "GUIA_ID_AQUI") {
    _id
    id_guia
    nombre
    email
    idiomas
    experiencia
    disponible
    calificacion
    created_at
  }
  
  # Tours de esta guía
  tours {
    _id
    nombre
    duracion
    precio
    guia_id
    destino_id
    descripcion
    capacidad_maxima
    disponible
  }
}
```

## 📊 Reportes Personalizados

### Análisis de ocupación
```graphql
query AnalisisOcupacion {
  tours {
    _id
    nombre
    duracion
    capacidad_maxima
    disponible
  }
  
  reservas {
    _id
    tour_id
    usuario_id
    fecha_reserva
    cantidad_personas
    estado
  }
}
```

### Estado de todas las reservas
```graphql
query EstadoReservas {
  reservas {
    _id
    tour_id
    usuario_id
    fecha_reserva
    cantidad_personas
    estado
    tour {
      nombre
      duracion
      precio
      destino {
        nombre
        provincia
        ciudad
      }
    }
    usuario {
      nombre
      apellido
      email
      pais
    }
  }
}
```

## 🎨 Queries para Widgets del Frontend

### Widget: Ingresos Totales
```graphql
query WidgetIngresos {
  estadisticasGenerales {
    total_ingresos
    reservas_confirmadas
    reservas_completadas
  }
}
```

### Widget: Actividad Reciente
```graphql
query ActividadReciente {
  reservas {
    _id
    tour_id
    usuario_id
    fecha_reserva
    cantidad_personas
    estado
    usuario {
      nombre
      apellido
    }
    tour {
      nombre
      precio
    }
  }
}
```

### Widget: Tours Activos
```graphql
query ToursActivos {
  tours {
    _id
    nombre
    duracion
    precio
    capacidad_maxima
    disponible
    guia_id
    destino_id
  }
}
```

## 💡 Tips de Uso

### Variables en Queries
Puedes usar variables para hacer queries dinámicas:

```graphql
query ObtenerReporteMensual($anio: Int!, $limiteTours: Int) {
  reservasPorMes(anio: $anio) {
    mes
    total_reservas
    total_ingresos
  }
  
  toursTop(limit: $limiteTours) {
    tour {
      nombre
    }
    total_reservas
  }
}
```

Variables JSON:
```json
{
  "anio": 2025,
  "limiteTours": 10
}
```

### Fragmentos para Reutilización
```graphql
fragment TourBasico on Tour {
  _id
  nombre
  duracion
  precio
  capacidad_maxima
}

fragment DestinoBasico on Destino {
  _id
  nombre
  ubicacion
  provincia
  ciudad
  categoria
}

query {
  tours {
    ...TourBasico
    destino {
      ...DestinoBasico
    }
  }
}
```

### Aliases para Comparaciones
```graphql
query ComparacionAnual {
  anio2024: reservasPorMes(anio: 2024) {
    mes
    total_ingresos
  }
  
  anio2025: reservasPorMes(anio: 2025) {
    mes
    total_ingresos
  }
}
```

## 🔗 Integración con Frontend (React)

### Usando Apollo Client
```typescript
import { useQuery, gql } from '@apollo/client';

const GET_DASHBOARD_DATA = gql`
  query GetDashboard {
    estadisticasGenerales {
      total_usuarios
      total_tours
      total_ingresos
    }
    toursTop(limit: 5) {
      tour {
        nombre
        precio
      }
      total_reservas
    }
  }
`;

function Dashboard() {
  const { loading, error, data } = useQuery(GET_DASHBOARD_DATA);
  
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  return (
    <div>
      <h2>Total Ingresos: ${data.estadisticasGenerales.total_ingresos}</h2>
      {/* Renderizar datos */}
    </div>
  );
}
```

### Usando fetch nativo
```typescript
const query = `
  query {
    toursTop(limit: 5) {
      tour { nombre }
      total_reservas
    }
  }
`;

fetch('http://localhost:4000', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## 📝 Consultas de Recomendaciones

### Obtener todas las recomendaciones con detalles
```graphql
query RecomendacionesCompletas {
  recomendaciones {
    _id
    fecha
    calificacion
    comentario
    id_usuario
    id_tour
    id_servicio
    tipo_recomendacion
    nombre_referencia
    usuario {
      nombre
      apellido
      email
      pais
    }
    tour {
      nombre
      duracion
      precio
      destino {
        nombre
        provincia
      }
    }
    servicio {
      nombre
      descripcion
      categoria
      precio
    }
  }
}
```

### Recomendaciones de un usuario específico
```graphql
query RecomendacionesUsuario($usuarioId: ID!) {
  recomendaciones {
    _id
    fecha
    calificacion
    comentario
    tipo_recomendacion
    nombre_referencia
    id_usuario
  }
}
```

## 🛎️ Consultas de Servicios

### Listado completo de servicios
```graphql
query ServiciosDisponibles {
  servicios {
    _id
    nombre
    descripcion
    precio
    categoria
    destino
    duracion_dias
    capacidad_maxima
    disponible
    proveedor
    telefono_contacto
    email_contacto
    created_at
    updated_at
  }
}
```

### Servicios por categoría (filtrar en cliente)
```graphql
query ServiciosPorCategoria {
  servicios {
    _id
    nombre
    descripcion
    precio
    categoria
    destino
    disponible
  }
}
```

### Detalle de servicio específico
```graphql
query DetalleServicio($id: ID!) {
  servicio(id: $id) {
    _id
    nombre
    descripcion
    precio
    categoria
    destino
    duracion_dias
    capacidad_maxima
    disponible
    proveedor
    telefono_contacto
    email_contacto
    created_at
    updated_at
  }
}
```

## 📋 Consultas de Contrataciones de Servicios

### Historial de contrataciones
```graphql
query HistorialContrataciones {
  # Nota: Implementar query getAllContrataciones en el schema
  serviciosTop(limit: 50) {
    servicio {
      _id
      nombre
      descripcion
      categoria
      precio
    }
    total_contrataciones
    total_ingresos
  }
}
```

## 🔍 Consultas Combinadas Avanzadas

### Dashboard Completo de Turismo
```graphql
query DashboardTurismoCompleto {
  # Estadísticas generales
  stats: estadisticasGenerales {
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
  
  # Destinos con más actividad
  destinosPopulares: destinosPopulares(limit: 10) {
    destino {
      _id
      nombre
      ubicacion
      provincia
      ciudad
      categoria
      ruta
      calificacion_promedio
    }
    total_tours
    total_reservas
    calificacion_promedio
  }
  
  # Tours más exitosos
  toursExitosos: toursTop(limit: 10) {
    tour {
      _id
      nombre
      duracion
      precio
      capacidad_maxima
      destino {
        nombre
        provincia
      }
      guia {
        nombre
        experiencia
      }
    }
    total_reservas
    total_personas
    ingresos_totales
  }
  
  # Servicios complementarios
  serviciosPopulares: serviciosTop(limit: 10) {
    servicio {
      _id
      nombre
      categoria
      precio
      destino
    }
    total_contrataciones
    total_ingresos
  }
  
  # Usuarios más activos
  clientesVIP: usuariosTop(limit: 10) {
    usuario {
      _id
      nombre
      apellido
      email
      pais
    }
    total_reservas
    total_gastado
    total_recomendaciones
  }
}
```

### Análisis de Destino Completo
```graphql
query AnalisisDestinoCompleto($destinoId: ID!) {
  destino(id: $destinoId) {
    _id
    nombre
    descripcion
    ubicacion
    ruta
    provincia
    ciudad
    categoria
    calificacion_promedio
    activo
    fecha_creacion
  }
  
  # Tours en este destino (filtrar en cliente por destino_id)
  tours {
    _id
    nombre
    duracion
    precio
    destino_id
    capacidad_maxima
    disponible
    guia {
      nombre
      email
    }
  }
}
```

### Perfil Completo de Usuario con Actividad
```graphql
query PerfilUsuarioCompleto($usuarioId: ID!) {
  usuario(id: $usuarioId) {
    _id
    nombre
    apellido
    email
    username
    fecha_nacimiento
    pais
    fecha_registro
  }
  
  # Estadísticas del usuario
  usuariosTop(limit: 100) {
    usuario {
      _id
    }
    total_reservas
    total_gastado
    total_recomendaciones
  }
  
  # Reservas (filtrar en cliente por usuario_id)
  reservas {
    _id
    fecha_reserva
    cantidad_personas
    estado
    tour_id
    usuario_id
  }
}
```

---

📚 **Para más información, consulta el schema completo en el Apollo Playground**

💡 **Tip:** Todos los ejemplos están actualizados con los campos del REST API (MongoDB/Beanie)
