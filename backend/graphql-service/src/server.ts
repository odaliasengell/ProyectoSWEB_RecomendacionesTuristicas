// ============================================
// 🚀 APOLLO SERVER - GRAPHQL SERVICE
// ============================================

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { RestAPIDataSource } from './datasource/restAPI';

// Cargar variables de entorno
dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);
const REST_API_URL = process.env.REST_API_URL || 'http://localhost:8000';

async function startServer() {
  // Crear app Express
  const app = express();

  // Middlewares globales
  app.use(cors());
  app.use(express.json());

  // Servir archivos estáticos de PDFs
  const pdfsPath = path.join(__dirname, '../pdfs');
  app.use('/pdfs', express.static(pdfsPath));
  console.log('📂 Sirviendo PDFs desde:', pdfsPath);

  // Crear instancia de Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Iniciar Apollo Server
  await server.start();

  // Aplicar middleware de GraphQL
  app.use('/graphql', 
    cors<cors.CorsRequest>(),
    express.json(),
    // @ts-expect-error - Error conocido de tipos duplicados entre Apollo Server 4 y Express
    expressMiddleware(server, {
      context: async () => ({
        dataSources: {
          restAPI: new RestAPIDataSource(REST_API_URL),
        },
      }),
    })
  );

  // Iniciar servidor HTTP
  app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ============================================');
    console.log('   GraphQL Server - Sistema de Turismo');
    console.log('   ============================================');
    console.log(`   🌐 GraphQL Playground: http://localhost:${PORT}/graphql`);
    console.log(`   📡 Conectado a REST API: ${REST_API_URL}`);
    console.log(`   📄 PDFs disponibles en: http://localhost:${PORT}/pdfs/`);
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
    console.log('📄 Mutations disponibles:');
    console.log('   - generateReportPDF: Generar PDF de reporte');
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
    console.log('💡 Ejemplo de mutation:');
    console.log('   mutation {');
    console.log('     generateReportPDF(reportType: TOURS, limit: 10) {');
    console.log('       success');
    console.log('       filename');
    console.log('       url');
    console.log('     }');
    console.log('   }');
    console.log('');
  });
}

startServer().catch((error) => {
  console.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});
