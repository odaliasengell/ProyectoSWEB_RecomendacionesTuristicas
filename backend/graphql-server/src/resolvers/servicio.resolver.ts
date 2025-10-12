import { GolangAPI } from '../datasources/golang-api';

export interface Context {
  dataSources: {
    golangAPI: GolangAPI;
  };
}

export const servicioResolvers = {
  Query: {
    servicios: async (_: any, __: any, { dataSources }: Context) => {
      try {
        const servicios = await dataSources.golangAPI.getServicios();
        return servicios;
      } catch (error) {
        console.error('Error al obtener servicios:', error);
        return [];
      }
    },

    contrataciones: async (_: any, __: any, { dataSources }: Context) => {
      try {
        const contrataciones = await dataSources.golangAPI.getContrataciones();
        return contrataciones;
      } catch (error) {
        console.error('Error al obtener contrataciones:', error);
        return [];
      }
    },
  },

  Mutation: {
    crearServicio: async (
      _: any,
      { input }: { input: any },
      { dataSources }: Context
    ) => {
      try {
        const id = await dataSources.golangAPI.createServicio(input);
        return id;
      } catch (error) {
        console.error('Error al crear servicio:', error);
        throw new Error('No se pudo crear el servicio');
      }
    },

    crearContratacion: async (
      _: any,
      { input }: { input: any },
      { dataSources }: Context
    ) => {
      try {
        const id = await dataSources.golangAPI.createContratacion(input);
        return id;
      } catch (error) {
        console.error('Error al crear contratación:', error);
        throw new Error('No se pudo crear la contratación');
      }
    },
  },

  ContratacionServicio: {
    servicio: async (parent: any, _: any, { dataSources }: Context) => {
      try {
        console.log(`🔗 Resolver ContratacionServicio.servicio llamado. Parent:`, {
          id: parent.id,
          servicio_id: parent.servicio_id,
          servicio_id_type: typeof parent.servicio_id
        });
        
        if (parent.servicio_id) {
          const servicio = await dataSources.golangAPI.getServicioById(
            parent.servicio_id
          );
          console.log(`🔗 Servicio obtenido:`, servicio ? 'encontrado' : 'null');
          return servicio;
        }
        console.log(`⚠️ No hay servicio_id en parent`);
        return null;
      } catch (error) {
        console.error(
          '❌ Error al obtener servicio de contratación:',
          error
        );
        return null;
      }
    },
  },
};
