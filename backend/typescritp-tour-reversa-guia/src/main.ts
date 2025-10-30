import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectToDatabase } from './config/database';
import { config } from './config/environment';
import guiaRoutes from './modules/guias/guia.routes';
import tourRoutes from './modules/tours/tour.routes';
import reservaRoutes from './modules/reservas/reserva.routes';
import uploadRoutes from './modules/upload/upload.routes';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

dotenv.config();

console.log(
  '🔍 Variables cargadas:',
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD
);


const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: '*', // Permitir todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false, // Cambiar a false cuando origin es *
  maxAge: 3600
}));
app.use(express.json());
app.use(loggerMiddleware);

// Middleware para archivos estáticos con headers CORS
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Servir archivos estáticos (imágenes subidas) - desde la raíz del proyecto
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
console.log('📁 Sirviendo archivos estáticos desde:', path.join(process.cwd(), 'uploads'));

// Rutas
app.use('/api/guias', guiaRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/admin/upload', uploadRoutes);

// Ruta raíz
app.get('/', (req: Request, res: Response) => {
  res.send('🚀 API de Recomendaciones Turísticas funcionando!');
});

// Middleware de manejo de errores global
app.use(errorMiddleware);

// Inicializar base de datos y arrancar servidor
const startServer = async () => {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();
