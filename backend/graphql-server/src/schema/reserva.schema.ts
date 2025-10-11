import { gql } from 'graphql-tag';

export const reservaTypeDefs = gql`
  type Reserva {
    id: ID!
    tourId: ID
    usuarioId: ID
    fechaReserva: String
    cantidadPersonas: Int
    precioTotal: Float
    estado: String
    comentarios: String
    tour: Tour
    createdAt: String
    updatedAt: String
  }

  enum EstadoReserva {
    pendiente
    confirmada
    cancelada
    completada
  }

  type Usuario {
    id: ID!
    nombre: String!
    apellido: String!
    email: String!
    telefono: String
    pais: String
    preferencias: [String]
  }

  extend type Query {
    reservas: [Reserva]
    reserva(id: ID!): Reserva
    reservasPorUsuario(usuarioId: ID!): [Reserva]
    reservasPorTour(tourId: ID!): [Reserva]
    reservasPorEstado(estado: EstadoReserva!): [Reserva]
    reservasPorFecha(fechaInicio: String!, fechaFin: String!): [Reserva]
  }

  extend type Mutation {
    crearReserva(input: CrearReservaInput!): Reserva
    actualizarReserva(id: ID!, input: ActualizarReservaInput!): Reserva
    cancelarReserva(id: ID!, motivo: String): Reserva
    confirmarReserva(id: ID!): Reserva
  }

  input CrearReservaInput {
    tourId: ID!
    usuarioId: ID!
    fechaTour: String!
    numeroPersonas: Int!
    metodoPago: String
    comentarios: String
  }

  input ActualizarReservaInput {
    fechaTour: String
    numeroPersonas: Int
    estado: EstadoReserva
    metodoPago: String
    comentarios: String
  }
`;
