import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { SocketHandler } from './handlers/socket.handler';
import { EventEmitter } from './events/event-emitter';
import { RoomManager } from './utils/room-manager';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configurar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Servir archivo index.html para pruebas
app.use(express.static(path.join(__dirname, '../')));

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

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WebSocket Server está funcionando',
    connections: roomManager.getTotalConnections(),
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

const PORT = process.env.PORT || 8081;

httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket Server corriendo en http://localhost:${PORT}`);
  console.log(`📡 Socket.IO escuchando conexiones...`);
  console.log(`🌐 Panel de pruebas disponible en http://localhost:${PORT}/index.html`);
});

export { io, httpServer };