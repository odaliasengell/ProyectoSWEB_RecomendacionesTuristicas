import gql from 'graphql-tag';

export const servicioTypeDefs = gql`
  """
  Servicio turístico
  """
  type Servicio {
    id: ID!
    nombre: String!
    descripcion: String!
    precio: Float!
    categoria: String!
    destino: String!
    duracion_dias: Int!
    capacidad_maxima: Int!
    disponible: Boolean!
    proveedor: String!
    telefono_contacto: String!
    email_contacto: String!
    created_at: String!
    updated_at: String!
  }

  """
  Contratación de servicio turístico
  """
  type ContratacionServicio {
    id: ID!
    servicio_id: ID!
    cliente_nombre: String!
    cliente_email: String!
    cliente_telefono: String!
    fecha_contratacion: String!
    fecha_inicio: String!
    fecha_fin: String!
    num_viajeros: Int!
    moneda: String!
    precio_unitario: Float!
    descuento: Float!
    total: Float!
    estado: String!
    notas: String!
    created_at: String!
    updated_at: String!
    servicio: Servicio
  }

  """
  Input para crear un servicio
  """
  input CrearServicioInput {
    nombre: String!
    descripcion: String!
    precio: Float!
    categoria: String!
    destino: String!
    duracion_dias: Int!
  }

  """
  Input para crear una contratación
  """
  input CrearContratacionInput {
    servicio_id: ID!
    cliente_nombre: String!
    cliente_email: String!
    cliente_telefono: String!
    fecha: String!
    fecha_inicio: String!
    fecha_fin: String!
    num_viajeros: Int!
    moneda: String!
  }

  extend type Query {
    servicios: [Servicio!]!
    contrataciones: [ContratacionServicio!]!
  }

  extend type Mutation {
    crearServicio(input: CrearServicioInput!): ID!
    crearContratacion(input: CrearContratacionInput!): ID!
  }
`;
