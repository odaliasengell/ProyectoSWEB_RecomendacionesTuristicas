import { PythonAPI } from '../datasources/python-api';

export const usuarioResolvers = {
  Query: {
    // Usuarios
    usuarios: async (_: any, __: any, { dataSources }: { dataSources: { pythonAPI: PythonAPI } }) => {
      return await dataSources.pythonAPI.getUsuarios();
    },
    
    usuario: async (_: any, { id }: { id: string }, { dataSources }: { dataSources: { pythonAPI: PythonAPI } }) => {
      return await dataSources.pythonAPI.getUsuarioById(id);
    },

    // Destinos
    destinos: async (_: any, __: any, { dataSources }: { dataSources: { pythonAPI: PythonAPI } }) => {
      return await dataSources.pythonAPI.getDestinos();
    },
    
    destino: async (_: any, { id }: { id: string }, { dataSources }: { dataSources: { pythonAPI: PythonAPI } }) => {
      return await dataSources.pythonAPI.getDestinoById(id);
    },

    // Recomendaciones
    recomendaciones: async (_: any, __: any, { dataSources }: { dataSources: { pythonAPI: PythonAPI } }) => {
      return await dataSources.pythonAPI.getRecomendaciones();
    },

    recomendacion: async (_: any, { id }: { id: string }, { dataSources }: { dataSources: { pythonAPI: PythonAPI } }) => {
      return await dataSources.pythonAPI.getRecomendacionById(id);
    },

    recomendacionesPorUsuario: async (_: any, { usuarioId }: { usuarioId: string }, { dataSources }: { dataSources: { pythonAPI: PythonAPI } }) => {
      return await dataSources.pythonAPI.getRecomendacionesByUsuario(usuarioId);
    },
  },

  Mutation: {
    // Usuarios
    crearUsuario: async (_: any, { input }: { input: any }, { dataSources }: { dataSources: { pythonAPI: PythonAPI } }) => {
      return await dataSources.pythonAPI.createUsuario(input);
    },
  },

  // Resolvers de campo para relaciones
  Recomendacion: {
    usuario: async (parent: any, _: any, { dataSources }: { dataSources: { pythonAPI: PythonAPI } }) => {
      if (parent.usuario) return parent.usuario;
      return await dataSources.pythonAPI.getUsuarioById(String(parent.id_usuario));
    },
  },
};
