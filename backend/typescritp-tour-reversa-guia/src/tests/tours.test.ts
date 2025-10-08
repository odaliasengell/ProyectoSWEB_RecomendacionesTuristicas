import { Repository } from 'typeorm';
import { TourService } from '../modules/tours/tour.service';
import { Tour } from '../entities/Tour.entity';
import { Guia } from '../entities/Guia.entity';
import { TestDataSource } from './setup';
import { 
  createMockTour, 
  createMockGuia, 
  createMockCreateTourDto, 
  createMockUpdateTourDto,
  createMockReserva
} from './fixtures/test-data';
import { setupDefaultMocks, clearAllMocks, mockHttpClient } from './mocks/http-client.mock';

describe('TourService', () => {
  let tourService: TourService;
  let tourRepository: Repository<Tour>;
  let guiaRepository: Repository<Guia>;

  beforeAll(async () => {
    tourRepository = TestDataSource.getRepository(Tour);
    guiaRepository = TestDataSource.getRepository(Guia);
    tourService = new TourService();
  });

  beforeEach(() => {
    setupDefaultMocks();
  });

  afterEach(() => {
    clearAllMocks();
  });

  describe('findAll', () => {
    it('debería retornar todos los tours con datos enriquecidos', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);

      // Act
      const result = await tourService.findAll();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id_tour: savedTour.id_tour,
        nombre: savedTour.nombre,
      });
    });

    it('debería retornar array vacío cuando no hay tours', async () => {
      // Act
      const result = await tourService.findAll();

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('debería retornar un tour específico con datos enriquecidos', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);

      // Act
      const result = await tourService.findById(savedTour.id_tour);

      // Assert
      expect(result).toMatchObject({
        id_tour: savedTour.id_tour,
        nombre: savedTour.nombre,
      });
    });

    it('debería retornar null cuando el tour no existe', async () => {
      // Act
      const result = await tourService.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAvailable', () => {
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
      const result = await tourService.findAvailable();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].disponible).toBe(true);
      expect(result[0].nombre).toBe('Tour Machu Picchu');
    });

    it('debería retornar tours ordenados por precio ascendente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour1 = createMockTour({ precio: 200.00 });
      const mockTour2 = createMockTour({ 
        id_tour: 2, 
        nombre: 'Tour Económico', 
        precio: 100.00 
      });
      
      await guiaRepository.save(mockGuia);
      await tourRepository.save(mockTour1);
      await tourRepository.save(mockTour2);

      // Act
      const result = await tourService.findAvailable();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].precio).toBe(100.00);
      expect(result[1].precio).toBe(200.00);
    });
  });

  describe('create', () => {
    it('debería crear un tour exitosamente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      await guiaRepository.save(mockGuia);
      
      const createTourDto = createMockCreateTourDto();

      // Act
      const result = await tourService.create(createTourDto);

      // Assert
      expect(result).toMatchObject({
        nombre: createTourDto.nombre,
        descripcion: createTourDto.descripcion,
        precio: createTourDto.precio,
        id_guia: createTourDto.id_guia,
      });
      expect(mockHttpClient.notifyWebSocket).toHaveBeenCalledWith('tour_creado', {
        id_tour: result.id_tour,
        nombre: result.nombre,
        precio: result.precio,
      });
    });

    it('debería lanzar error cuando el guía no existe', async () => {
      // Arrange
      const createTourDto = createMockCreateTourDto({ id_guia: 999 });

      // Act & Assert
      await expect(tourService.create(createTourDto)).rejects.toThrow('El guía especificado no existe');
    });

    it('debería lanzar error cuando el guía no está disponible', async () => {
      // Arrange
      const mockGuia = createMockGuia({ disponible: false });
      await guiaRepository.save(mockGuia);
      
      const createTourDto = createMockCreateTourDto();

      // Act & Assert
      await expect(tourService.create(createTourDto)).rejects.toThrow('El guía no está disponible');
    });


  });

  describe('update', () => {
    it('debería actualizar un tour exitosamente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);
      
      const updateTourDto = createMockUpdateTourDto();

      // Act
      const result = await tourService.update(savedTour.id_tour, updateTourDto);

      // Assert
      expect(result.nombre).toBe(updateTourDto.nombre);
      expect(result.descripcion).toBe(updateTourDto.descripcion);
      expect(result.precio).toBe(updateTourDto.precio);
      expect(mockHttpClient.notifyWebSocket).toHaveBeenCalledWith('tour_actualizado', {
        id_tour: result.id_tour,
        nombre: result.nombre,
      });
    });

    it('debería lanzar error cuando el tour no existe', async () => {
      // Arrange
      const updateTourDto = createMockUpdateTourDto();

      // Act & Assert
      await expect(tourService.update(999, updateTourDto)).rejects.toThrow('Tour no encontrado');
    });

    it('debería validar guía cuando se actualiza id_guia', async () => {
      // Arrange
      const mockGuia1 = createMockGuia();
      const mockGuia2 = createMockGuia({ id_guia: 2, nombre: 'Guía 2', email: 'guia2@example.com' });
      const mockTour = createMockTour();
      
      await guiaRepository.save(mockGuia1);
      await guiaRepository.save(mockGuia2);
      const savedTour = await tourRepository.save(mockTour);
      
      const updateTourDto = createMockUpdateTourDto({ id_guia: 2 });

      // Act
      const result = await tourService.update(savedTour.id_tour, updateTourDto);

      // Assert
      expect(result.id_guia).toBe(2);
    });

    it('debería lanzar error cuando el nuevo guía no existe', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);
      
      const updateTourDto = createMockUpdateTourDto({ id_guia: 999 });

      // Act & Assert
      await expect(tourService.update(savedTour.id_tour, updateTourDto)).rejects.toThrow('El guía especificado no existe');
    });
  });

  describe('delete', () => {
    it('debería eliminar un tour exitosamente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);

      // Act
      await tourService.delete(savedTour.id_tour);

      // Assert
      const deletedTour = await tourRepository.findOne({
        where: { id_tour: savedTour.id_tour }
      });
      expect(deletedTour).toBeNull();
      expect(mockHttpClient.notifyWebSocket).toHaveBeenCalledWith('tour_eliminado', {
        id_tour: savedTour.id_tour,
      });
    });

    it('debería lanzar error cuando el tour no existe', async () => {
      // Act & Assert
      await expect(tourService.delete(999)).rejects.toThrow('Tour no encontrado');
    });

    it('debería lanzar error cuando el tour tiene reservas activas', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      const mockReserva = createMockReserva();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);
      
      // Simular que el tour tiene reservas
      savedTour.reservas = [mockReserva];
      await tourRepository.save(savedTour);

      // Act & Assert
      await expect(tourService.delete(savedTour.id_tour)).rejects.toThrow('No se puede eliminar un tour con reservas activas');
    });
  });

  describe('toggleDisponibilidad', () => {
    it('debería cambiar disponibilidad de true a false', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour({ disponible: true });
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);

      // Act
      const result = await tourService.toggleDisponibilidad(savedTour.id_tour);

      // Assert
      expect(result.disponible).toBe(false);
    });

    it('debería cambiar disponibilidad de false a true', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour({ disponible: false });
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);

      // Act
      const result = await tourService.toggleDisponibilidad(savedTour.id_tour);

      // Assert
      expect(result.disponible).toBe(true);
    });

    it('debería lanzar error cuando el tour no existe', async () => {
      // Act & Assert
      await expect(tourService.toggleDisponibilidad(999)).rejects.toThrow('Tour no encontrado');
    });
  });
});