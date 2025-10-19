import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { config } from './config/environment';
import guiaRoutes from './modules/guias/guia.routes';
import tourRoutes from './modules/tours/tour.routes';
import reservaRoutes from './modules/reservas/reserva.routes';
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
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Rutas
app.use('/api/guias', guiaRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/reservas', reservaRoutes);

// Ruta raíz
app.get('/', (req: Request, res: Response) => {
  res.send('🚀 API de Recomendaciones Turísticas funcionando!');
});

// Middleware de manejo de errores global
app.use(errorMiddleware);

// Inicializar base de datos y arrancar servidor
const startServer = async () => {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();
