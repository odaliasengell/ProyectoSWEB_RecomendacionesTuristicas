import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './environment';
import { Guia } from '../entities/Guia.entity';
import { Tour } from '../entities/Tour.entity';
import { Reserva } from '../entities/Reserva.entity';

export const AppDataSource = new DataSource({
  type: 'mongodb',
  url: config.database.uri || 'mongodb://localhost:27017/modulo_typescript',
  database: config.database.database || 'modulo_typescript',
  synchronize: true,
  logging: false,
  entities: [Guia, Tour, Reserva],
});

export const connectToDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ TypeORM conectado a MongoDB correctamente');
    console.log(`   Base de datos: ${config.database.database || 'modulo_typescript'}`);
  } catch (error) {
    console.error('❌ Error conectando TypeORM a MongoDB:', error);
    process.exit(1);
  }
};

export const closeDatabase = async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('❌ Conexión TypeORM cerrada');
    }
  } catch (error) {
    console.error('Error cerrando conexión TypeORM:', error);
  }
};


