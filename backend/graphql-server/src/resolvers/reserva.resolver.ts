import { cacheManager } from '../utils/cache';

export const reservaResolvers = {
  Query: {
    reservas: async (_: any, __: any, { dataSources }: any) => {
      return cacheManager.getOrSet('reservas:all', async () => {
        return await dataSources.typescriptAPI.getReservas();
      });
    },

    reserva: async (_: any, { id }: { id: string }, { dataSources }: any) => {
      return cacheManager.getOrSet(`reserva:${id}`, async () => {
        return await dataSources.typescriptAPI.getReservaById(id);
      });
    },

    reservasPorUsuario: async (_: any, { usuarioId }: { usuarioId: string }, { dataSources }: any) => {
      return cacheManager.getOrSet(`reservas:usuario:${usuarioId}`, async () => {
        return await dataSources.typescriptAPI.getReservasByUsuario(usuarioId);
      });
    },

    reservasPorTour: async (_: any, { tourId }: { tourId: string }, { dataSources }: any) => {
      return cacheManager.getOrSet(`reservas:tour:${tourId}`, async () => {
        return await dataSources.typescriptAPI.getReservasByTour(tourId);
      });
    },

    reservasPorEstado: async (_: any, { estado }: { estado: string }, { dataSources }: any) => {
      return cacheManager.getOrSet(`reservas:estado:${estado}`, async () => {
        return await dataSources.typescriptAPI.getReservasByEstado(estado);
      });
    },

    reservasPorFecha: async (
      _: any,
      { fechaInicio, fechaFin }: { fechaInicio: string; fechaFin: string },
      { dataSources }: any
    ) => {
      return await dataSources.typescriptAPI.getReservasByDateRange(fechaInicio, fechaFin);
    },
  },

  Mutation: {
    crearReserva: async (_: any, { input }: { input: any }, { dataSources }: any) => {
      const reserva = await dataSources.typescriptAPI.createReserva(input);
      // Invalidar cache
      cacheManager.delStartWith('reservas:');
      return reserva;
    },

    actualizarReserva: async (
      _: any,
      { id, input }: { id: string; input: any },
      { dataSources }: any
    ) => {
      const reserva = await dataSources.typescriptAPI.updateReserva(id, input);
      // Invalidar cache
      cacheManager.del(`reserva:${id}`);
      cacheManager.delStartWith('reservas:');
      return reserva;
    },

    cancelarReserva: async (
      _: any,
      { id, motivo }: { id: string; motivo?: string },
      { dataSources }: any
    ) => {
      const reserva = await dataSources.typescriptAPI.cancelReserva(id, motivo);
      // Invalidar cache
      cacheManager.del(`reserva:${id}`);
      cacheManager.delStartWith('reservas:');
      return reserva;
    },

    confirmarReserva: async (_: any, { id }: { id: string }, { dataSources }: any) => {
      const reserva = await dataSources.typescriptAPI.confirmarReserva(id);
      // Invalidar cache
      cacheManager.del(`reserva:${id}`);
      cacheManager.delStartWith('reservas:');
      return reserva;
    },
  },

  Reserva: {
    // Mapeo de campos reales de la DB TypeScript
    id: (parent: any) => parent.id_reserva || parent.id,
    tourId: (parent: any) => parent.id_tour || parent.tourId,
    usuarioId: (parent: any) => parent.id_usuario || parent.usuarioId,
    fechaReserva: (parent: any) => parent.fecha_reserva || parent.fechaReserva,
    cantidadPersonas: (parent: any) => parent.cantidad_personas || parent.cantidadPersonas,
    precioTotal: (parent: any) => parent.precio_total || parent.precioTotal,
    estado: (parent: any) => parent.estado,
    comentarios: (parent: any) => parent.comentarios,
    createdAt: (parent: any) => parent.createdAt || parent.created_at,
    updatedAt: (parent: any) => parent.updatedAt || parent.updated_at,

    tour: async (parent: any, _: any, { dataSources }: any) => {
      const tourId = parent.id_tour || parent.tourId;
      if (!tourId) return null;
      return cacheManager.getOrSet(`tour:${tourId}`, async () => {
        return await dataSources.typescriptAPI.getTourById(tourId);
      });
    },
  },
};
