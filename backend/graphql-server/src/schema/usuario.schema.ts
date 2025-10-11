import { gql } from 'graphql-tag';

export const usuarioTypeDefs = gql`
  type Usuario {
    id_usuario: ID!
    nombre: String!
    email: String!
    contrasena: String
    pais: String
  }

  type Destino {
    id_destino: ID!
    nombre: String!
    descripcion: String
    ubicacion: String
    ruta: String
  }

  type Recomendacion {
    id_recomendacion: ID!
    fecha: String
    calificacion: Int!
    comentario: String
    id_usuario: Int!
    usuario: Usuario
  }

  input UsuarioInput {
    nombre: String!
    email: String!
    contrasena: String!
    pais: String
  }

  extend type Query {
    # Usuarios
    usuarios: [Usuario]
    usuario(id: ID!): Usuario
    
    # Destinos
    destinos: [Destino]
    destino(id: ID!): Destino
    
    # Recomendaciones
    recomendaciones: [Recomendacion]
    recomendacion(id: ID!): Recomendacion
    recomendacionesPorUsuario(usuarioId: ID!): [Recomendacion]
  }

  extend type Mutation {
    # Usuarios
    crearUsuario(input: UsuarioInput!): Usuario
  }
`;
