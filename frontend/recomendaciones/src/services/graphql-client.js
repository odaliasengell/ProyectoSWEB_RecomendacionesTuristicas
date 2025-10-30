import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';

// Cliente Apollo para conectar con GraphQL Server
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

// ============== QUERIES ==============

// Estadísticas de Usuarios
export const GET_ESTADISTICAS_USUARIOS = gql`
  query GetEstadisticasUsuarios {
    estadisticasUsuarios {
      total_usuarios
      total_administradores
      usuarios_activos
    }
  }
`;

// Obtener todos los usuarios
export const GET_USUARIOS = gql`
  query GetUsuarios {
    usuarios {
      id_usuario
      nombre
      email
      pais
    }
  }
`;

// Obtener todos los destinos
export const GET_DESTINOS = gql`
  query GetDestinos {
    destinos {
      id_destino
      nombre
      descripcion
      ubicacion
      ruta
    }
  }
`;

// Obtener todos los tours
export const GET_TOURS = gql`
  query GetTours {
    tours {
      id
      nombre
      descripcion
      ubicacion
      duracion
      precio
      capacidadMaxima
      disponible
      categoria
      imagenes
      guiaId
      createdAt
      updatedAt
    }
  }
`;

// Obtener todas las guías
export const GET_GUIAS = gql`
  query GetGuias {
    guias {
      id
      nombre
      idiomas
      experiencia
      email
      telefono
      disponible
      calificacion
    }
  }
`;

// Obtener todas las reservas
export const GET_RESERVAS = gql`
  query GetReservas {
    reservas {
      id
      tourId
      usuarioId
      fechaReserva
      cantidadPersonas
      precioTotal
      estado
      comentarios
      createdAt
      updatedAt
    }
  }
`;

// Obtener todos los servicios
export const GET_SERVICIOS = gql`
  query GetServicios {
    servicios {
      id
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
`;

// Obtener todas las contrataciones
export const GET_CONTRATACIONES = gql`
  query GetContrataciones {
    contrataciones {
      id
      servicio_id
      cliente_nombre
      cliente_email
      cliente_telefono
      fecha_contratacion
      fecha_inicio
      fecha_fin
      num_viajeros
      moneda
      precio_unitario
      descuento
      total
      estado
      notas
      created_at
      updated_at
    }
  }
`;

// Obtener todas las recomendaciones
export const GET_RECOMENDACIONES = gql`
  query GetRecomendaciones {
    recomendaciones {
      id_recomendacion
      fecha
      calificacion
      comentario
      id_usuario
      id_tour
      id_servicio
      tipo
    }
  }
`;

// ============== QUERIES DE REPORTES AVANZADOS ==============

// Reporte de Tours Populares
export const GET_REPORTE_TOURS_POPULARES = gql`
  query GetReporteToursPopulares($limite: Int = 10) {
    reporteToursPopulares(limite: $limite) {
      tourId
      nombreTour
      totalReservas
      ingresoTotal
      promedioCalificacion
      categoria
    }
  }
`;

// Estadísticas Generales Consolidadas
export const GET_ESTADISTICAS_GENERALES = gql`
  query GetEstadisticasGenerales {
    estadisticasGenerales {
      tours {
        total
        activos
        inactivos
        promedioPrecios
        porCategoria {
          categoria
          cantidad
          porcentaje
        }
      }
      reservas {
        total
        pendientes
        confirmadas
        canceladas
        completadas
        tasaCancelacion
        tasaCompletado
      }
      guias {
        total
        activos
        promedioCalificacion
      }
      destinos {
        total
      }
      servicios {
        total
        contratados
        ingresoTotal
      }
      ingresoTotal
      periodo {
        fechaInicio
        fechaFin
      }
    }
  }
`;

// Reporte Consolidado con fechas
export const GET_REPORTE_CONSOLIDADO = gql`
  query GetReporteConsolidado($fechaInicio: String, $fechaFin: String) {
    reporteConsolidado(fechaInicio: $fechaInicio, fechaFin: $fechaFin) {
      tours {
        total
        activos
        inactivos
        promedioPrecios
      }
      reservas {
        total
        pendientes
        confirmadas
        canceladas
        completadas
      }
      guias {
        total
        activos
      }
      destinos {
        total
      }
      servicios {
        total
        contratados
        ingresoTotal
      }
      ingresoTotal
    }
  }
`;

// Reporte de Guías
export const GET_REPORTE_GUIAS = gql`
  query GetReporteGuias($limite: Int = 10) {
    reporteGuias(limite: $limite) {
      guiaId
      nombreGuia
      totalTours
      totalReservas
      ingresoGenerado
      calificacionPromedio
      toursActivos
    }
  }
`;

// Reporte de Destinos Populares
export const GET_REPORTE_DESTINOS_POPULARES = gql`
  query GetReporteDestinosPopulares($limite: Int = 10) {
    reporteDestinosPopulares(limite: $limite) {
      destinoId
      nombreDestino
      pais
      totalVisitas
      calificacionPromedio
      popularidad
    }
  }
`;

// Reporte de Servicios
export const GET_REPORTE_SERVICIOS = gql`
  query GetReporteServicios {
    reporteServicios {
      servicioId
      nombreServicio
      tipo
      totalContrataciones
      ingresoTotal
      precioPromedio
    }
  }
`;

// Reporte de Ingresos
export const GET_REPORTE_INGRESOS = gql`
  query GetReporteIngresos($fechaInicio: String!, $fechaFin: String!) {
    reporteIngresos(fechaInicio: $fechaInicio, fechaFin: $fechaFin) {
      ingresoTours
      ingresoServicios
      ingresoTotal
      porMes {
        mes
        tours
        servicios
        total
      }
      porCategoria {
        categoria
        ingreso
        porcentaje
      }
    }
  }
`;

// Reporte de Reservas por Periodo
export const GET_REPORTE_RESERVAS_PERIODO = gql`
  query GetReporteReservasPeriodo($fechaInicio: String!, $fechaFin: String!) {
    reporteReservasPorPeriodo(fechaInicio: $fechaInicio, fechaFin: $fechaFin) {
      totalReservas
      reservasPendientes
      reservasConfirmadas
      reservasCanceladas
      reservasCompletadas
      ingresoTotal
      ingresoPromedio
      reservasPorDia {
        fecha
        cantidad
        ingreso
      }
    }
  }
`;

// ============== FUNCIONES HELPER ==============

/**
 * Ejecuta una query GraphQL
 * @param {DocumentNode} query - Query GraphQL
 * @param {Object} variables - Variables de la query
 * @returns {Promise<Object>} - Resultado de la query
 */
export const executeQuery = async (query, variables = {}) => {
  try {
    const { data, error } = await client.query({
      query,
      variables,
      fetchPolicy: 'network-only',
    });
    
    if (error) {
      console.error('❌ Error en GraphQL query:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error ejecutando query GraphQL:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de usuarios
 */
export const fetchEstadisticasUsuarios = async () => {
  try {
    const data = await executeQuery(GET_ESTADISTICAS_USUARIOS);
    return data.estadisticasUsuarios;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      total_usuarios: 0,
      total_administradores: 0,
      usuarios_activos: 0,
    };
  }
};

/**
 * Obtener todos los usuarios
 */
export const fetchUsuarios = async () => {
  try {
    const data = await executeQuery(GET_USUARIOS);
    return data.usuarios || [];
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return [];
  }
};

/**
 * Obtener todos los destinos
 */
export const fetchDestinos = async () => {
  try {
    const data = await executeQuery(GET_DESTINOS);
    return data.destinos || [];
  } catch (error) {
    console.error('Error fetching destinos:', error);
    return [];
  }
};

/**
 * Obtener todos los tours
 */
export const fetchTours = async () => {
  try {
    const data = await executeQuery(GET_TOURS);
    return data.tours || [];
  } catch (error) {
    console.error('Error fetching tours:', error);
    return [];
  }
};

/**
 * Obtener todas las guías
 */
export const fetchGuias = async () => {
  try {
    const data = await executeQuery(GET_GUIAS);
    return data.guias || [];
  } catch (error) {
    console.error('Error fetching guias:', error);
    return [];
  }
};

/**
 * Obtener todas las reservas
 */
export const fetchReservas = async () => {
  try {
    const data = await executeQuery(GET_RESERVAS);
    return data.reservas || [];
  } catch (error) {
    console.error('Error fetching reservas:', error);
    return [];
  }
};

/**
 * Obtener todos los servicios
 */
export const fetchServicios = async () => {
  try {
    const data = await executeQuery(GET_SERVICIOS);
    return data.servicios || [];
  } catch (error) {
    console.error('Error fetching servicios:', error);
    return [];
  }
};

/**
 * Obtener todas las contrataciones
 */
export const fetchContrataciones = async () => {
  try {
    const data = await executeQuery(GET_CONTRATACIONES);
    return data.contrataciones || [];
  } catch (error) {
    console.error('Error fetching contrataciones:', error);
    return [];
  }
};

/**
 * Obtener todas las recomendaciones
 */
export const fetchRecomendaciones = async () => {
  try {
    const data = await executeQuery(GET_RECOMENDACIONES);
    return data.recomendaciones || [];
  } catch (error) {
    console.error('Error fetching recomendaciones:', error);
    return [];
  }
};

// ============== FUNCIONES HELPER PARA REPORTES AVANZADOS ==============

/**
 * Obtener reporte de tours populares
 */
export const fetchReporteToursPopulares = async (limite = 10) => {
  try {
    const data = await executeQuery(GET_REPORTE_TOURS_POPULARES, { limite });
    return data.reporteToursPopulares || [];
  } catch (error) {
    console.error('Error fetching reporte tours populares:', error);
    return [];
  }
};

/**
 * Obtener estadísticas generales consolidadas
 */
export const fetchEstadisticasGenerales = async () => {
  try {
    const data = await executeQuery(GET_ESTADISTICAS_GENERALES);
    return data.estadisticasGenerales || null;
  } catch (error) {
    console.error('Error fetching estadísticas generales:', error);
    return null;
  }
};

/**
 * Obtener reporte consolidado
 */
export const fetchReporteConsolidado = async (fechaInicio = null, fechaFin = null) => {
  try {
    const data = await executeQuery(GET_REPORTE_CONSOLIDADO, { fechaInicio, fechaFin });
    return data.reporteConsolidado || null;
  } catch (error) {
    console.error('Error fetching reporte consolidado:', error);
    return null;
  }
};

/**
 * Obtener reporte de guías
 */
export const fetchReporteGuias = async (limite = 10) => {
  try {
    const data = await executeQuery(GET_REPORTE_GUIAS, { limite });
    return data.reporteGuias || [];
  } catch (error) {
    console.error('Error fetching reporte guías:', error);
    return [];
  }
};

/**
 * Obtener reporte de destinos populares
 */
export const fetchReporteDestinosPopulares = async (limite = 10) => {
  try {
    const data = await executeQuery(GET_REPORTE_DESTINOS_POPULARES, { limite });
    return data.reporteDestinosPopulares || [];
  } catch (error) {
    console.error('Error fetching reporte destinos populares:', error);
    return [];
  }
};

/**
 * Obtener reporte de servicios
 */
export const fetchReporteServicios = async () => {
  try {
    const data = await executeQuery(GET_REPORTE_SERVICIOS);
    return data.reporteServicios || [];
  } catch (error) {
    console.error('Error fetching reporte servicios:', error);
    return [];
  }
};

/**
 * Obtener reporte de ingresos
 */
export const fetchReporteIngresos = async (fechaInicio, fechaFin) => {
  try {
    const data = await executeQuery(GET_REPORTE_INGRESOS, { fechaInicio, fechaFin });
    return data.reporteIngresos || null;
  } catch (error) {
    console.error('Error fetching reporte ingresos:', error);
    return null;
  }
};

/**
 * Obtener reporte de reservas por periodo
 */
export const fetchReporteReservasPeriodo = async (fechaInicio, fechaFin) => {
  try {
    const data = await executeQuery(GET_REPORTE_RESERVAS_PERIODO, { fechaInicio, fechaFin });
    return data.reporteReservasPorPeriodo || null;
  } catch (error) {
    console.error('Error fetching reporte reservas periodo:', error);
    return null;
  }
};

export default client;
