import { gql } from 'graphql-tag';

export const reporteTypeDefs = gql`
  type ReporteTourPopular {
    tourId: ID!
    nombreTour: String!
    totalReservas: Int!
    ingresoTotal: Float!
    promedioCalificacion: Float
    categoria: String
    reservasPorMes: [ReservaMensual]
  }

  type ReservaMensual {
    mes: String!
    cantidad: Int!
    ingreso: Float!
  }

  type ReporteReservasPeriodo {
    totalReservas: Int!
    reservasPendientes: Int!
    reservasConfirmadas: Int!
    reservasCanceladas: Int!
    reservasCompletadas: Int!
    ingresoTotal: Float!
    ingresoPromedio: Float!
    reservasPorDia: [ReservaDiaria]
  }

  type ReservaDiaria {
    fecha: String!
    cantidad: Int!
    ingreso: Float!
  }

  type ReporteGuia {
    guiaId: ID!
    nombreGuia: String!
    totalTours: Int!
    totalReservas: Int!
    ingresoGenerado: Float!
    calificacionPromedio: Float
    toursActivos: Int!
  }

  type ReporteDestino {
    destinoId: ID!
    nombreDestino: String!
    pais: String!
    totalVisitas: Int!
    calificacionPromedio: Float
    popularidad: Float!
    temporadaAlta: [String]
  }

  type ReporteServicio {
    servicioId: ID!
    nombreServicio: String!
    tipo: String!
    totalContrataciones: Int!
    ingresoTotal: Float!
    precioPromedio: Float!
  }

  type ReporteConsolidado {
    tours: EstadisticasTours!
    reservas: EstadisticasReservas!
    guias: EstadisticasGuias!
    destinos: EstadisticasDestinos!
    servicios: EstadisticasServicios!
    ingresoTotal: Float!
    periodo: Periodo!
  }

  type EstadisticasTours {
    total: Int!
    activos: Int!
    inactivos: Int!
    porCategoria: [CategoriaStats]
    promedioPrecios: Float!
  }

  type EstadisticasReservas {
    total: Int!
    pendientes: Int!
    confirmadas: Int!
    canceladas: Int!
    completadas: Int!
    tasaCancelacion: Float!
    tasaCompletado: Float!
  }

  type EstadisticasGuias {
    total: Int!
    activos: Int!
    promedioCalificacion: Float!
    conMasReservas: [ReporteGuia]
  }

  type EstadisticasDestinos {
    total: Int!
    masVisitados: [ReporteDestino]
    porPais: [PaisStats]
  }

  type EstadisticasServicios {
    total: Int!
    contratados: Int!
    ingresoTotal: Float!
    porTipo: [TipoServicioStats]
  }

  type CategoriaStats {
    categoria: String!
    cantidad: Int!
    porcentaje: Float!
  }

  type PaisStats {
    pais: String!
    cantidad: Int!
    destinosPopulares: [String]
  }

  type TipoServicioStats {
    tipo: String!
    cantidad: Int!
    ingresoTotal: Float!
  }

  type Periodo {
    fechaInicio: String!
    fechaFin: String!
  }

  type ReporteIngresos {
    ingresoTours: Float!
    ingresoServicios: Float!
    ingresoTotal: Float!
    porMes: [IngresoMensual]
    porCategoria: [IngresoPorCategoria]
  }

  type IngresoMensual {
    mes: String!
    tours: Float!
    servicios: Float!
    total: Float!
  }

  type IngresoPorCategoria {
    categoria: String!
    ingreso: Float!
    porcentaje: Float!
  }

  extend type Query {
    # Reportes de Tours
    reporteToursPopulares(limite: Int = 10): [ReporteTourPopular]
    reporteToursPorCategoria(categoria: String!): [ReporteTourPopular]
    
    # Reportes de Reservas
    reporteReservasPorPeriodo(fechaInicio: String!, fechaFin: String!): ReporteReservasPeriodo
    reporteReservasPorEstado: ReporteReservasPeriodo
    
    # Reportes de Guías
    reporteGuias(limite: Int = 10): [ReporteGuia]
    reporteGuiaMasExitoso: ReporteGuia
    
    # Reportes de Destinos
    reporteDestinosPopulares(limite: Int = 10): [ReporteDestino]
    reporteDestinosPorPais(pais: String!): [ReporteDestino]
    
    # Reportes de Servicios
    reporteServicios: [ReporteServicio]
    reporteServiciosMasContratados(limite: Int = 10): [ReporteServicio]
    
    # Reportes Consolidados
    reporteConsolidado(fechaInicio: String, fechaFin: String): ReporteConsolidado
    reporteIngresos(fechaInicio: String!, fechaFin: String!): ReporteIngresos
    
    # Estadísticas Rápidas
    estadisticasGenerales: ReporteConsolidado
  }

  extend type Mutation {
    # Utilidades
    limpiarCache: Boolean
    regenerarReportes: Boolean
  }
`;
