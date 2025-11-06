/**
 * Cliente GraphQL para consultas de reportes administrativos
 * Este archivo se usa específicamente para el panel de reportes
 * que requiere consultas complejas y agregaciones
 */

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_API_URL || 'http://localhost:4000/graphql';

/**
 * Ejecuta una query GraphQL
 */
export const executeQuery = async (query, variables = {}) => {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      throw new Error(result.errors[0]?.message || 'GraphQL query failed');
    }

    return result.data;
  } catch (error) {
    console.error('Error executing GraphQL query:', error);
    throw error;
  }
};

// ==================== QUERIES ====================

export const GET_TOURS = `
  query GetTours {
    tours {
      _id
      nombre
      descripcion
      duracion
      precio
      capacidad_maxima
      disponible
      guia_id
      destino_id
    }
  }
`;

export const GET_GUIAS = `
  query GetGuias {
    guias {
      _id
      id_guia
      nombre
      email
      idiomas
      experiencia
      calificacion
      disponible
    }
  }
`;

export const GET_DESTINOS = `
  query GetDestinos {
    destinos {
      _id
      nombre
      descripcion
      ubicacion
      provincia
      ciudad
      categoria
      calificacion_promedio
      activo
    }
  }
`;

export const GET_SERVICIOS = `
  query GetServicios {
    servicios {
      _id
      nombre
      descripcion
      precio
      categoria
      destino
      duracion_dias
      disponible
    }
  }
`;

export const GET_CONTRATACIONES = `
  query GetContrataciones {
    contrataciones {
      _id
      servicio_id
      usuario_id
      fecha_contratacion
      cantidad_personas
      total
      estado
    }
  }
`;

export const GET_RECOMENDACIONES = `
  query GetRecomendaciones {
    recomendaciones {
      _id
      id_usuario
      id_tour
      id_servicio
      calificacion
      comentario
      fecha
      tipo_recomendacion
    }
  }
`;

export const GET_RESERVAS = `
  query GetReservas {
    reservas {
      _id
      usuario_id
      tour_id
      fecha_reserva
      cantidad_personas
      estado
    }
  }
`;

export const GET_USUARIOS = `
  query GetUsuarios {
    usuarios {
      id
      nombre
      apellido
      email
      username
      fecha_nacimiento
      pais
    }
  }
`;

// Queries agregadas para reportes
export const GET_ESTADISTICAS_TOURS = `
  query GetEstadisticasTours {
    estadisticasTours {
      total
      disponibles
      masPopulares {
        id
        nombre
        reservas
      }
      promedioCalificacion
    }
  }
`;

export const GET_ESTADISTICAS_RESERVAS = `
  query GetEstadisticasReservas {
    estadisticasReservas {
      total
      porEstado {
        pendiente
        confirmada
        cancelada
        completada
      }
      ingresoTotal
      ingresoMensual
    }
  }
`;

export const GET_ESTADISTICAS_GUIAS = `
  query GetEstadisticasGuias {
    estadisticasGuias {
      total
      disponibles
      mejorCalificados {
        id
        nombre
        apellido
        calificacion_promedio
      }
      promedioExperiencia
    }
  }
`;

export const GET_REPORTE_COMPLETO = `
  query GetReporteCompleto {
    tours {
      id
      nombre
      precio
      disponible
    }
    guias {
      id
      nombre
      apellido
      disponible
      calificacion_promedio
    }
    destinos {
      id
      nombre
      categoria
      calificacion_promedio
    }
    reservas {
      id
      estado
      precio_total
      fecha_reserva
    }
    recomendaciones {
      id
      calificacion
      fecha
    }
  }
`;

export default {
  executeQuery,
  GET_TOURS,
  GET_GUIAS,
  GET_DESTINOS,
  GET_SERVICIOS,
  GET_CONTRATACIONES,
  GET_RECOMENDACIONES,
  GET_RESERVAS,
  GET_USUARIOS,
  GET_ESTADISTICAS_TOURS,
  GET_ESTADISTICAS_RESERVAS,
  GET_ESTADISTICAS_GUIAS,
  GET_REPORTE_COMPLETO,
};
