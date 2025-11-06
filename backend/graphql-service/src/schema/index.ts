// ============================================
// 📋 SCHEMA GRAPHQL
// ============================================

import gql from 'graphql-tag';

export const typeDefs = gql`
  # ============================================
  # TIPOS BASE - Alineados con REST API
  # ============================================

  type Usuario {
    _id: ID!
    nombre: String!
    apellido: String
    email: String!
    username: String
    contrasena: String!
    fecha_nacimiento: String
    pais: String
    fecha_registro: String
  }

  type Destino {
    _id: ID!
    nombre: String!
    descripcion: String
    ubicacion: String
    ruta: String
    provincia: String
    ciudad: String
    categoria: String
    calificacion_promedio: Float
    activo: Boolean
    fecha_creacion: String
  }

  type Tour {
    _id: ID!
    nombre: String!
    duracion: String
    precio: Float
    guia_id: String
    guia: Guia
    destino_id: String
    destino: Destino
    descripcion: String
    capacidad_maxima: Int
    disponible: Boolean
    created_at: String
  }

  type Guia {
    _id: ID!
    id_guia: Int
    nombre: String!
    email: String
    idiomas: [String]
    experiencia: String
    disponible: Boolean
    calificacion: Float
    created_at: String
  }

  type Reserva {
    _id: ID!
    tour_id: String
    tour: Tour
    usuario_id: String
    usuario: Usuario
    fecha_reserva: String
    cantidad_personas: Int
    estado: String
  }

  type Servicio {
    _id: ID!
    nombre: String!
    descripcion: String
    precio: Float
    categoria: String
    destino: String
    duracion_dias: Int
    capacidad_maxima: Int
    disponible: Boolean
    proveedor: String
    telefono_contacto: String
    email_contacto: String
    created_at: String
    updated_at: String
  }

  type ContratacionServicio {
    _id: ID!
    servicio_id: String
    servicio: Servicio
    usuario_id: String
    usuario: Usuario
    fecha_contratacion: String
    fecha_inicio: String
    fecha_fin: String
    cantidad_personas: Int
    total: Float
    estado: String
    cliente_nombre: String
    cliente_email: String
    cliente_telefono: String
    notas: String
  }

  type Recomendacion {
    _id: ID!
    fecha: String!
    calificacion: Int!
    comentario: String!
    id_usuario: String!
    usuario: Usuario
    id_tour: String
    tour: Tour
    id_servicio: String
    servicio: Servicio
    tipo_recomendacion: String
    nombre_referencia: String
  }

  # ============================================
  # TIPOS PARA REPORTES
  # ============================================

  type TourMasReservado {
    tour: Tour!
    total_reservas: Int!
    total_personas: Int!
    ingresos_totales: Float!
  }

  type GuiaMasActivo {
    guia: Guia!
    total_tours: Int!
    total_reservas: Int!
    calificacion_promedio: Float!
  }

  type UsuarioMasActivo {
    usuario: Usuario!
    total_reservas: Int!
    total_gastado: Float!
    total_recomendaciones: Int!
  }

  type ReservasPorMes {
    mes: String!
    anio: Int!
    total_reservas: Int!
    total_ingresos: Float!
  }

  type DestinoMasPopular {
    destino: Destino!
    total_tours: Int!
    total_reservas: Int!
    calificacion_promedio: Float!
  }

  type EstadisticaGeneral {
    total_usuarios: Int!
    total_destinos: Int!
    total_tours: Int!
    total_guias: Int!
    total_reservas: Int!
    total_ingresos: Float!
    reservas_pendientes: Int!
    reservas_confirmadas: Int!
    reservas_completadas: Int!
    reservas_canceladas: Int!
  }

  type ServicioMasContratado {
    servicio: Servicio!
    total_contrataciones: Int!
    total_ingresos: Float!
  }

  # ============================================
  # QUERIES
  # ============================================

  type Query {
    # Consultas básicas
    usuarios: [Usuario!]!
    usuario(id: ID!): Usuario
    
    destinos: [Destino!]!
    destino(id: ID!): Destino
    
    tours: [Tour!]!
    tour(id: ID!): Tour
    
    guias: [Guia!]!
    guia(id: ID!): Guia
    
    reservas: [Reserva!]!
    reserva(id: ID!): Reserva
    
    servicios: [Servicio!]!
    servicio(id: ID!): Servicio
    
    contrataciones: [ContratacionServicio!]!
    
    recomendaciones: [Recomendacion!]!

    # ============================================
    # 📊 REPORTES ANALÍTICOS
    # ============================================
    
    # Top 10 tours más reservados
    toursTop(limit: Int): [TourMasReservado!]!
    
    # Guías más activos con mejor calificación
    guiasTop(limit: Int): [GuiaMasActivo!]!
    
    # Usuarios más activos (más reservas y recomendaciones)
    usuariosTop(limit: Int): [UsuarioMasActivo!]!
    
    # Reservas agrupadas por mes
    reservasPorMes(anio: Int!): [ReservasPorMes!]!
    
    # Destinos más populares
    destinosPopulares(limit: Int): [DestinoMasPopular!]!
    
    # Servicios más contratados
    serviciosTop(limit: Int): [ServicioMasContratado!]!
    
    # Estadísticas generales del sistema
    estadisticasGenerales: EstadisticaGeneral!
  }
`;
