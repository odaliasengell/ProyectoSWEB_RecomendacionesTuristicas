import { DataSource } from 'typeorm';
import { config } from './environment';
import { Guia } from '../entities/Guia.entity';
import { Tour } from '../entities/Tour.entity';
import { Reserva } from '../entities/Reserva.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: config.database.database || './tours_reservas_dev.db',
  synchronize: true, // ⚠️ En producción debe ser false
  logging: config.server.env === 'development',
  entities: [Guia, Tour, Reserva],
  subscribers: [],
  migrations: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada correctamente');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    process.exit(1);
  }
};
