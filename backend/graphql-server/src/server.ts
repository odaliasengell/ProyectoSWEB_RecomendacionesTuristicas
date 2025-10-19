import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { config } from 'dotenv';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { TypeScriptAPI } from './datasources/typescript-api';
import { PythonAPI } from './datasources/python-api';
import { GolangAPI } from './datasources/golang-api';

// Cargar variables de entorno
config();

// Crear instancias de DataSources
const dataSources = {
  typescriptAPI: new TypeScriptAPI(process.env.TYPESCRIPT_API_URL || 'http://localhost:3000'),
  pythonAPI: new PythonAPI(process.env.PYTHON_API_URL || 'http://localhost:8000'),
  golangAPI: new GolangAPI(process.env.GOLANG_API_URL || 'http://localhost:8080'),
};

// Crear servidor Apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      locations: error.locations,
      path: error.path,
      extensions: {
        code: error.extensions?.code,
        ...(process.env.NODE_ENV === 'development' && {
          stacktrace: error.extensions?.stacktrace,
        }),
      },
    };
  },
  introspection: process.env.NODE_ENV !== 'production',
  // Desactivar protección CSRF en desarrollo para permitir curl y otras herramientas
  csrfPrevention: process.env.NODE_ENV === 'production',
});

// Iniciar servidor
async function startServer() {
  const port = parseInt(process.env.PORT || '4000', 10);

  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: async () => ({
      dataSources,
    }),
  });

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║  🚀 Servidor GraphQL - Reportes Turísticos                    ║');
  console.log('║                                                                ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  📡 Servidor escuchando en: ${url.padEnd(31)} ║`);
  console.log('║                                                                ║');
  console.log('║  📚 Abre Apollo Studio para explorar el esquema:              ║');
  console.log(`║     ${url.padEnd(56)} ║`);
  console.log('║                                                                ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║  🔗 Microservicios conectados:                                ║');
  console.log('║                                                                ║');
  console.log(`║  • TypeScript API: ${(process.env.TYPESCRIPT_API_URL || 'http://localhost:3000').padEnd(37)} ║`);
  console.log(`║  • Python API:     ${(process.env.PYTHON_API_URL || 'http://localhost:8000').padEnd(37)} ║`);
  console.log(`║  • Golang API:     ${(process.env.GOLANG_API_URL || 'http://localhost:8080').padEnd(37)} ║`);
  console.log('║                                                                ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║  💡 Ejemplos de consultas:                                     ║');
  console.log('║                                                                ║');
  console.log('║  • Tours populares:                                            ║');
  console.log('║    query { reporteToursPopulares(limite: 5) { nombreTour } }  ║');
  console.log('║                                                                ║');
  console.log('║  • Estadísticas generales:                                     ║');
  console.log('║    query { estadisticasGenerales { tours { total } } }        ║');
  console.log('║                                                                ║');
  console.log('║  • Reporte consolidado:                                        ║');
  console.log('║    query { reporteConsolidado { ingresoTotal } }              ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidor GraphQL...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Cerrando servidor GraphQL...');
  process.exit(0);
});

// Iniciar el servidor
startServer().catch((error) => {
  console.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});
