import { tourResolvers } from './tour.resolver';
import { reservaResolvers } from './reserva.resolver';
import { reporteResolvers } from './reporte.resolver';
import { usuarioResolvers } from './usuario.resolver';

export const resolvers = {
  Query: {
    ...tourResolvers.Query,
    ...reservaResolvers.Query,
    ...reporteResolvers.Query,
    ...usuarioResolvers.Query,
  },
  Mutation: {
    ...tourResolvers.Mutation,
    ...reservaResolvers.Mutation,
    ...reporteResolvers.Mutation,
    ...usuarioResolvers.Mutation,
  },
  Tour: tourResolvers.Tour,
  Guia: tourResolvers.Guia,
  Reserva: reservaResolvers.Reserva,
  Recomendacion: usuarioResolvers.Recomendacion,
};
