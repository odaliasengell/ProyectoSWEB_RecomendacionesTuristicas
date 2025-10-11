import { TypeScriptAPI } from '../datasources/typescript-api';
import { PythonAPI } from '../datasources/python-api';
import { cacheManager } from '../utils/cache';

export const tourResolvers = {
  Query: {
    tours: async (_: any, __: any, { dataSources }: any) => {
      return cacheManager.getOrSet('tours:all', async () => {
        return await dataSources.typescriptAPI.getTours();
      });
    },

    tour: async (_: any, { id }: { id: string }, { dataSources }: any) => {
      return cacheManager.getOrSet(`tour:${id}`, async () => {
        return await dataSources.typescriptAPI.getTourById(id);
      });
    },

    toursPorCategoria: async (_: any, { categoria }: { categoria: string }, { dataSources }: any) => {
      return cacheManager.getOrSet(`tours:categoria:${categoria}`, async () => {
        return await dataSources.typescriptAPI.getToursByCategory(categoria);
      });
    },

    toursPorPrecio: async (
      _: any,
      { precioMin, precioMax }: { precioMin?: number; precioMax?: number },
      { dataSources }: any
    ) => {
      const tours = await dataSources.typescriptAPI.getTours();
      return tours.filter((tour: any) => {
        if (precioMin && tour.precio < precioMin) return false;
        if (precioMax && tour.precio > precioMax) return false;
        return true;
      });
    },

    toursDisponibles: async (_: any, __: any, { dataSources }: any) => {
      return cacheManager.getOrSet('tours:disponibles', async () => {
        return await dataSources.typescriptAPI.getToursDisponibles();
      });
    },

    guias: async (_: any, __: any, { dataSources }: any) => {
      return cacheManager.getOrSet('guias:all', async () => {
        return await dataSources.typescriptAPI.getGuias();
      });
    },

    guia: async (_: any, { id }: { id: string }, { dataSources }: any) => {
      return cacheManager.getOrSet(`guia:${id}`, async () => {
        return await dataSources.typescriptAPI.getGuiaById(id);
      });
    },
  },

  Mutation: {
    crearTour: async (_: any, { input }: { input: any }, { dataSources }: any) => {
      const tour = await dataSources.typescriptAPI.createTour(input);
      // Invalidar cache
      cacheManager.delStartWith('tours:');
      return tour;
    },

    actualizarTour: async (_: any, { id, input }: { id: string; input: any }, { dataSources }: any) => {
      const tour = await dataSources.typescriptAPI.updateTour(id, input);
      // Invalidar cache
      cacheManager.del(`tour:${id}`);
      cacheManager.delStartWith('tours:');
      return tour;
    },

    eliminarTour: async (_: any, { id }: { id: string }, { dataSources }: any) => {
      const result = await dataSources.typescriptAPI.deleteTour(id);
      // Invalidar cache
      cacheManager.del(`tour:${id}`);
      cacheManager.delStartWith('tours:');
      return result;
    },
  },

  Tour: {
    // Mapeo de snake_case a camelCase
    id: (parent: any) => parent.id_tour || parent.id,
    nombre: (parent: any) => parent.nombre,
    descripcion: (parent: any) => parent.descripcion,
    ubicacion: (parent: any) => parent.ubicacion,
    duracion: (parent: any) => parent.duracion,
    precio: (parent: any) => parent.precio,
    capacidadMaxima: (parent: any) => parent.capacidad_maxima,
    disponible: (parent: any) => parent.disponible,
    categoria: (parent: any) => parent.categoria,
    imagenes: (parent: any) => parent.imagenes,
    guiaId: (parent: any) => parent.id_guia || parent.guiaId,
    createdAt: (parent: any) => parent.createdAt || parent.created_at,
    updatedAt: (parent: any) => parent.updatedAt || parent.updated_at,

    guia: async (parent: any, _: any, { dataSources }: any) => {
      const guiaId = parent.id_guia || parent.guiaId;
      if (!guiaId) return null;
      return cacheManager.getOrSet(`guia:${guiaId}`, async () => {
        return await dataSources.typescriptAPI.getGuiaById(guiaId);
      });
    },

    reservas: async (parent: any, _: any, { dataSources }: any) => {
      const tourId = parent.id_tour || parent.id;
      return cacheManager.getOrSet(`reservas:tour:${tourId}`, async () => {
        return await dataSources.typescriptAPI.getReservasByTour(tourId);
      });
    },
  },

  Guia: {
    // Mapeo de campos reales de la DB
    id: (parent: any) => parent.id_guia || parent.id,
    nombre: (parent: any) => parent.nombre,
    idiomas: (parent: any) => parent.idiomas,
    experiencia: (parent: any) => parent.experiencia,
    email: (parent: any) => parent.email,
    telefono: (parent: any) => parent.telefono,
    disponible: (parent: any) => parent.disponible,
    calificacion: (parent: any) => parent.calificacion,
  },
};
