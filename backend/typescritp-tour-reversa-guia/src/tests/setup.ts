import { DataSource } from 'typeorm';
import { TourTest, GuiaTest } from './entities/TestEntities';

// Mock DataSource para pruebas usando entidades simplificadas sin relaciones
export const TestDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: [TourTest, GuiaTest],
  synchronize: true,
  logging: false,
});

// Mock para AppDataSource
jest.mock('../config/database', () => ({
  AppDataSource: TestDataSource,
}));

// Setup global para las pruebas
beforeAll(async () => {
  if (!TestDataSource.isInitialized) {
    await TestDataSource.initialize();
  }
});

afterAll(async () => {
  if (TestDataSource.isInitialized) {
    await TestDataSource.destroy();
  }
});

beforeEach(async () => {
  // Limpiar datos entre pruebas
  const entities = TestDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = TestDataSource.getRepository(entity.name);
    await repository.clear();
  }
});

// Mock para httpClient
jest.mock('../utils/http-client.util', () => ({
  httpClient: {
    notifyWebSocket: jest.fn(),
  },
}));