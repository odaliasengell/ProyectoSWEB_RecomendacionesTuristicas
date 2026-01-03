import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { createRedisClient } from './config/redis';
import { authRoutes } from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { TokenBlacklist } from './entities/token-blacklist.entity';

dotenv.config();

// Inicializar TypeORM DataSource
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'authuser',
  password: process.env.DB_PASSWORD || 'authpassword',
  database: process.env.DB_NAME || 'auth_service',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, RefreshToken, TokenBlacklist],
  migrations: ['src/migrations/*.ts'],
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting para login
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '600000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'),
  message: 'Demasiados intentos de login. Intente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rutas
app.use('/auth', authRoutes(loginLimiter));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Error handling
app.use(errorHandler);

// Iniciar servidor
async function startServer() {
  try {
    // Conectar a base de datos
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ PostgreSQL conectado');
    }

    // Conectar a Redis
    const redisClient = await createRedisClient();
    console.log('✅ Redis conectado');

    // Limpiar tokens expirados cada hora
    setInterval(async () => {
      try {
        const manager = AppDataSource.manager;
        const result = await manager.query(
          'DELETE FROM refresh_tokens WHERE expires_at < NOW() AND revoked = true'
        );
        console.log(
          `🧹 Tokens expirados limpiados: ${result.affectedRows || 0}`
        );
      } catch (err) {
        console.error('Error limpiando tokens:', err);
      }
    }, 60 * 60 * 1000); // Cada hora

    app.listen(PORT, () => {
      console.log(`🚀 Auth Service ejecutándose en puerto ${PORT}`);
      console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 JWT expiration: ${process.env.JWT_EXPIRATION}s`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

export default app;
