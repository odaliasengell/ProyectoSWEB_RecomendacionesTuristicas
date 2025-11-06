// ============================================
// 🚀 APOLLO SERVER - GRAPHQL SERVICE
// ============================================

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import dotenv from 'dotenv';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { RestAPIDataSource } from './datasource/restAPI';

// Cargar variables de entorno
dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);
const REST_API_URL = process.env.REST_API_URL || 'http://localhost:8000/api';

async function startServer() {
  // Crear instancia de Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Iniciar servidor
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: async () => {
      return {
        dataSources: {
          restAPI: new RestAPIDataSource(REST_API_URL),
        },
      };
    },
  });

  console.log('');
  console.log('🚀 ============================================');
  console.log('   GraphQL Server - Sistema de Turismo');
  console.log('   ============================================');
  console.log(`   🌐 GraphQL Playground: ${url}`);
  console.log(`   📡 Conectado a REST API: ${REST_API_URL}`);
  console.log('   ============================================');
  console.log('');
  console.log('📊 Queries disponibles:');
  console.log('   - toursTop: Top tours más reservados');
  console.log('   - guiasTop: Guías más activos');
  console.log('   - usuariosTop: Usuarios más activos');
  console.log('   - reservasPorMes: Estadísticas mensuales');
  console.log('   - destinosPopulares: Destinos más populares');
  console.log('   - serviciosTop: Servicios más contratados');
  console.log('   - estadisticasGenerales: Dashboard general');
  console.log('');
  console.log('💡 Ejemplo de query:');
  console.log('   query {');
  console.log('     toursTop(limit: 5) {');
  console.log('       tour { nombre precio }');
  console.log('       total_reservas');
  console.log('       ingresos_totales');
  console.log('     }');
  console.log('   }');
  console.log('');
}

startServer().catch((error) => {
  console.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});
