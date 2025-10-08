import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { TestDataSource } from '../setup';
import tourRoutes from '../../modules/tours/tour.routes';
import { createMockGuia, createMockTour } from '../fixtures/test-data';
import { setupDefaultMocks, clearAllMocks } from '../mocks/http-client.mock';
import { Repository } from 'typeorm';
import { Tour } from '../../entities/Tour.entity';
import { Guia } from '../../entities/Guia.entity';

// Crear app Express para pruebas
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/tours', tourRoutes);
  return app;
};

describe('Tour Integration Tests', () => {
  let app: express.Application;
  let tourRepository: Repository<Tour>;
  let guiaRepository: Repository<Guia>;

  beforeAll(async () => {
    app = createTestApp();
    tourRepository = TestDataSource.getRepository(Tour);
    guiaRepository = TestDataSource.getRepository(Guia);
  });

  beforeEach(() => {
    setupDefaultMocks();
  });

  afterEach(() => {
    clearAllMocks();
  });

  describe('GET /api/tours', () => {
    it('debería retornar todos los tours', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      
      await guiaRepository.save(mockGuia);
      await tourRepository.save(mockTour);

      // Act
      const response = await request(app)
        .get('/api/tours')
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        message: 'Tours obtenidos exitosamente',
        data: expect.arrayContaining([
          expect.objectContaining({
            id_tour: expect.any(Number),
            nombre: expect.any(String),
          }),
        ]),
      });
    });

    it('debería retornar array vacío cuando no hay tours', async () => {
      // Act
      const response = await request(app)
        .get('/api/tours')
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        data: [],
      });
    });
  });

  describe('GET /api/tours/:id', () => {
    it('debería retornar un tour específico', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);

      // Act
      const response = await request(app)
        .get(`/api/tours/${savedTour.id_tour}`)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        message: 'Tour obtenido exitosamente',
        data: expect.objectContaining({
          id_tour: savedTour.id_tour,
          nombre: savedTour.nombre,
        }),
      });
    });

    it('debería retornar 404 cuando el tour no existe', async () => {
      // Act
      const response = await request(app)
        .get('/api/tours/999')
        .expect(404);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        message: 'Tour no encontrado',
      });
    });

    it('debería retornar 400 para ID inválido', async () => {
      // Act
      const response = await request(app)
        .get('/api/tours/invalid-id')
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        message: 'ID de tour inválido',
      });
    });
  });

  describe('GET /api/tours/available', () => {
    it('debería retornar solo tours disponibles', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour1 = createMockTour({ disponible: true });
      const mockTour2 = createMockTour({ 
        id_tour: 2, 
        nombre: 'Tour No Disponible', 
        disponible: false 
      });
      
      await guiaRepository.save(mockGuia);
      await tourRepository.save(mockTour1);
      await tourRepository.save(mockTour2);

      // Act
      const response = await request(app)
        .get('/api/tours/available')
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        message: 'Tours disponibles obtenidos exitosamente',
        data: expect.arrayContaining([
          expect.objectContaining({
            disponible: true,
          }),
        ]),
      });
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/tours', () => {
    it('debería crear un tour exitosamente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      await guiaRepository.save(mockGuia);
      
      const newTourData = {
        nombre: 'Nuevo Tour',
        descripcion: 'Descripción del nuevo tour',
        duracion: '3 horas',
        precio: 125.00,
        capacidad_maxima: 15,
        id_guia: 1,
      };

      // Act
      const response = await request(app)
        .post('/api/tours')
        .send(newTourData)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        message: 'Tour creado exitosamente',
        data: expect.objectContaining({
          nombre: newTourData.nombre,
          descripcion: newTourData.descripcion,
          precio: newTourData.precio,
          id_guia: newTourData.id_guia,
        }),
      });
    });

    it('debería retornar 400 para datos inválidos', async () => {
      // Arrange
      const invalidTourData = {
        nombre: '', // Campo requerido vacío
        descripcion: 'Descripción',
        precio: -100, // Precio negativo
      };

      // Act
      const response = await request(app)
        .post('/api/tours')
        .send(invalidTourData)
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('Error de validación'),
      });
    });
  });

  describe('PUT /api/tours/:id', () => {
    it('debería actualizar un tour exitosamente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);
      
      const updateData = {
        nombre: 'Tour Actualizado',
        precio: 175.00,
      };

      // Act
      const response = await request(app)
        .put(`/api/tours/${savedTour.id_tour}`)
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        message: 'Tour actualizado exitosamente',
        data: expect.objectContaining({
          nombre: updateData.nombre,
          precio: updateData.precio,
        }),
      });
    });

    it('debería retornar 404 cuando el tour no existe', async () => {
      // Act
      const response = await request(app)
        .put('/api/tours/999')
        .send({ nombre: 'Tour Actualizado' })
        .expect(404);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        message: 'Tour no encontrado',
      });
    });
  });

  describe('DELETE /api/tours/:id', () => {
    it('debería eliminar un tour exitosamente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);

      // Act
      const response = await request(app)
        .delete(`/api/tours/${savedTour.id_tour}`)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        message: 'Tour eliminado exitosamente',
      });
    });

    it('debería retornar 404 cuando el tour no existe', async () => {
      // Act
      const response = await request(app)
        .delete('/api/tours/999')
        .expect(404);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        message: 'Tour no encontrado',
      });
    });
  });

  describe('PATCH /api/tours/:id/toggle-disponibilidad', () => {
    it('debería cambiar la disponibilidad de un tour', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour({ disponible: true });
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);

      // Act
      const response = await request(app)
        .patch(`/api/tours/${savedTour.id_tour}/toggle-disponibilidad`)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        message: 'Disponibilidad actualizada exitosamente',
        data: expect.objectContaining({
          disponible: false,
        }),
      });
    });
  });
});