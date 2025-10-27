import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Imports internos
import { SocketHandler } from './handlers/socket.handler';
import { EventEmitter } from './events/event-emitter';
import { RoomManager } from './utils/room-manager';

// Gateway imports
import { AuthMiddleware } from './middlewares/auth.middleware';
import { RateLimitMiddleware } from './middlewares/rate-limit.middleware';
import { LoadBalancer } from './gateway/load-balancer';
import { ProxyGateway } from './gateway/proxy-gateway';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Inicializar gateway components
const loadBalancer = new LoadBalancer();
const proxyGateway = new ProxyGateway(loadBalancer);

// Middleware de seguridad y compresión
// app.use(helmet()); // Comentado por error de dependencia
// app.use(compression()); // Comentado por error de dependencia

// Middleware de logging (comentado por error de dependencia)
// if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
//   app.use(morgan('combined'));
// }

// Configurar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Rate limiting global (si está habilitado)
if (process.env.ENABLE_RATE_LIMITING === 'true') {
  app.use('/api', RateLimitMiddleware.general);
  app.use('/notify', RateLimitMiddleware.notifications);
}

// Transformadores de request/response (si están habilitados)
if (process.env.ENABLE_REQUEST_TRANSFORMATION === 'true') {
  app.use('/api', proxyGateway.requestTransformer());
}

if (process.env.ENABLE_RESPONSE_TRANSFORMATION === 'true') {
  app.use('/api', proxyGateway.responseTransformer());
}

// Servir archivo index.html para pruebas
app.use(express.static(path.join(__dirname, '../')));

// === RUTAS DEL API GATEWAY ===

// Ruta para generar token de prueba (solo desarrollo)
app.post('/auth/test-token', (req, res) => {
  const { userId = 'test-user', email = 'test@example.com', role = 'user' } = req.body;
  
  const token = AuthMiddleware.generateTestToken(userId, email, role);
  
  res.json({
    success: true,
    token,
    user: { userId, email, role },
    message: 'Token de prueba generado (solo para desarrollo)',
    expires: '24h'
  });
});

// Rutas protegidas con autenticación
app.use('/api/protected', AuthMiddleware.validateToken);

// Rutas específicas por servicio con auto-routing
app.use('/api/tours', proxyGateway.typescriptProxy);
app.use('/api/guias', proxyGateway.typescriptProxy);
app.use('/api/usuarios', proxyGateway.pythonProxy);
app.use('/api/recomendaciones', proxyGateway.pythonProxy);
app.use('/api/servicios', proxyGateway.golangProxy);
app.use('/api/contrataciones', proxyGateway.golangProxy);

// Auto-router para rutas que no coincidan con las específicas
app.use('/api/*', proxyGateway.autoRouter());

// === RUTAS DEL WEBSOCKET SERVER ===

// Configurar Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Inicializar managers
const roomManager = new RoomManager();
const eventEmitter = new EventEmitter(io, roomManager);
const socketHandler = new SocketHandler(io, roomManager, eventEmitter);

// Ruta de salud del WebSocket Server
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WebSocket Server está funcionando',
    connections: roomManager.getTotalConnections(),
    timestamp: new Date().toISOString()
  });
});

// Ruta de estadísticas del gateway
app.get('/gateway/stats', (req, res) => {
  const stats = proxyGateway.getGatewayStats();
  res.json({
    success: true,
    message: 'Estadísticas del API Gateway',
    data: stats
  });
});

// Ruta de salud del load balancer
app.get('/gateway/health', (req, res) => {
  const stats = loadBalancer.getServiceStats();
  const allServicesHealthy = Object.values(stats).every((service: any) => 
    service.healthy > 0
  );

  res.status(allServicesHealthy ? 200 : 503).json({
    success: allServicesHealthy,
    message: allServicesHealthy ? 'Todos los servicios están saludables' : 'Algunos servicios no están disponibles',
    services: stats,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para que los REST APIs notifiquen eventos
app.post('/notify', (req, res) => {
  const { event, data, room } = req.body;

  if (!event || !data) {
    return res.status(400).json({
      success: false,
      message: 'event y data son requeridos'
    });
  }

  try {
    eventEmitter.emit(event, data, room);
    
    res.json({
      success: true,
      message: 'Evento emitido exitosamente',
      event,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Manejar conexiones Socket.IO
socketHandler.initialize();

const PORT = process.env.PORT || 4001;

httpServer.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║  🚀 WebSocket Server + API Gateway                             ║');
  console.log('║                                                                ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  📡 Servidor escuchando en: http://localhost:${PORT}         ║`);
  console.log('║                                                                ║');
  console.log('║  � WebSocket disponible en: ws://localhost:4001              ║');
  console.log('║  🌐 Panel de pruebas: http://localhost:4001/index.html        ║');
  console.log('║                                                                ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║  🛡️  Funcionalidades del Gateway:                             ║');
  console.log('║                                                                ║');
  console.log('║  • ✅ Autenticación JWT                                        ║');
  console.log('║  • ✅ Rate Limiting                                            ║');
  console.log('║  • ✅ Load Balancing                                           ║');
  console.log('║  • ✅ Proxy/Routing                                            ║');
  console.log('║  • ✅ Request/Response Transformation                          ║');
  console.log('║                                                                ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║  🔗 Servicios conectados (Load Balanced):                     ║');
  console.log('║                                                                ║');
  console.log('║  • TypeScript API: http://localhost:3000                  ║');
  console.log('║    /api/tours/*, /api/guias/*                                  ║');
  console.log('║                                                                ║');
  console.log('║  • Python API:     http://localhost:8000                  ║');
  console.log('║    /api/usuarios/*, /api/recomendaciones/*                     ║');
  console.log('║                                                                ║');
  console.log('║  • Golang API:     http://localhost:8080                  ║');
  console.log('║    /api/servicios/*, /api/contrataciones/*                     ║');
  console.log('║                                                                ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║  💡 Endpoints del Gateway:                                     ║');
  console.log('║                                                                ║');
  console.log('║  • POST /auth/test-token - Generar token de prueba             ║');
  console.log('║  • GET  /gateway/stats   - Estadísticas del gateway           ║');
  console.log('║  • GET  /gateway/health  - Estado de servicios                ║');
  console.log('║  • GET  /health          - Estado del WebSocket               ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor gracefully...');
  loadBalancer.stop();
  httpServer.close(() => {
    console.log('✅ Servidor cerrado exitosamente');
    process.exit(0);
  });
});

export { io, httpServer, loadBalancer, proxyGateway };