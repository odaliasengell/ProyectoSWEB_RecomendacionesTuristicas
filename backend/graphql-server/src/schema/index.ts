import { gql } from 'graphql-tag';
import { tourTypeDefs } from './tour.schema';
import { reservaTypeDefs } from './reserva.schema';
import { reporteTypeDefs } from './reporte.schema';
import { usuarioTypeDefs } from './usuario.schema';
import { servicioTypeDefs } from './servicio.schema';

// Schema base con Query y Mutation
const baseTypeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

// Combinar todos los schemas
export const typeDefs = [
  baseTypeDefs,
  tourTypeDefs,
  reservaTypeDefs,
  reporteTypeDefs,
  usuarioTypeDefs,
  servicioTypeDefs
];
