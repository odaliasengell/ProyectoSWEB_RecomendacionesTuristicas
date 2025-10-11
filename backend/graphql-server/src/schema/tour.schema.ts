import { gql } from 'graphql-tag';

export const tourTypeDefs = gql`
  type Tour {
    id: ID!
    nombre: String!
    descripcion: String
    ubicacion: String
    duracion: String
    precio: Float!
    capacidadMaxima: Int
    disponible: Boolean
    categoria: String
    imagenes: [String]
    guiaId: ID
    guia: Guia
    reservas: [Reserva]
    createdAt: String
    updatedAt: String
  }

  type Guia {
    id: ID
    nombre: String
    idiomas: String
    experiencia: String
    email: String
    telefono: String
    disponible: Boolean
    calificacion: Float
  }

  extend type Query {
    tours: [Tour]
    tour(id: ID!): Tour
    toursPorCategoria(categoria: String!): [Tour]
    toursPorPrecio(precioMin: Float, precioMax: Float): [Tour]
    toursDisponibles: [Tour]
    guias: [Guia]
    guia(id: ID!): Guia
  }

  extend type Mutation {
    crearTour(input: CrearTourInput!): Tour
    actualizarTour(id: ID!, input: ActualizarTourInput!): Tour
    eliminarTour(id: ID!): Boolean
  }

  input CrearTourInput {
    nombre: String!
    descripcion: String
    ubicacion: String
    duracion: String
    precio: Float!
    capacidadMaxima: Int
    disponible: Boolean
    categoria: String
    imagenes: [String]
    guiaId: ID
  }

  input ActualizarTourInput {
    nombre: String
    descripcion: String
    ubicacion: String
    duracion: String
    precio: Float
    capacidadMaxima: Int
    disponible: Boolean
    categoria: String
    imagenes: [String]
    guiaId: ID
  }
`;
