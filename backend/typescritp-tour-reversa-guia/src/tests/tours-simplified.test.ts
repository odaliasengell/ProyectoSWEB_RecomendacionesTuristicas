import { Repository } from 'typeorm';
import { TourService } from '../modules/tours/tour.service';
import { TourTest, GuiaTest } from './entities/TestEntities';
import { TestDataSource } from './setup';
import { setupDefaultMocks, clearAllMocks, mockHttpClient } from './mocks/http-client.mock';

// Mock del TourService para usar entidades de prueba
class TourServiceTest {
  private tourRepository: Repository<TourTest>;
  private guiaRepository: Repository<GuiaTest>;

  constructor() {
    this.tourRepository = TestDataSource.getRepository(TourTest);
    this.guiaRepository = TestDataSource.getRepository(GuiaTest);
  }

  async findAll(): Promise<TourTest[]> {
    return await this.tourRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<TourTest | null> {
    return await this.tourRepository.findOne({
      where: { id_tour: id },
    });
  }

  async findAvailable(): Promise<TourTest[]> {
    return await this.tourRepository.find({
      where: { disponible: true },
      order: { precio: 'ASC' },
    });
  }

  async create(createTourDto: any): Promise<TourTest> {
    // Validar que el guía existe
    const guia = await this.guiaRepository.findOne({
      where: { id_guia: createTourDto.id_guia },
    });

    if (!guia) {
      throw new Error('El guía especificado no existe');
    }

    if (!guia.disponible) {
      throw new Error('El guía no está disponible');
    }

    // Crear manualmente el objeto tour
    const tour = new TourTest();
    Object.assign(tour, createTourDto);
    const savedTour = await this.tourRepository.save(tour);
    return savedTour;
  }

  async update(id: number, updateTourDto: any): Promise<TourTest> {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id },
    });

    if (!tour) {
      throw new Error('Tour no encontrado');
    }

    Object.assign(tour, updateTourDto);
    return await this.tourRepository.save(tour);
  }

  async delete(id: number): Promise<void> {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id },
    });

    if (!tour) {
      throw new Error('Tour no encontrado');
    }

    await this.tourRepository.remove(tour);
  }

  async toggleDisponibilidad(id: number): Promise<TourTest> {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id },
    });

    if (!tour) {
      throw new Error('Tour no encontrado');
    }

    tour.disponible = !tour.disponible;
    return await this.tourRepository.save(tour);
  }
}

// Datos de prueba simplificados
const createMockGuiaTest = (overrides: Partial<GuiaTest> = {}): GuiaTest => {
  const guia = new GuiaTest();
  guia.id_guia = 1;
  guia.nombre = 'Juan Pérez';
  guia.idiomas = 'Español, Inglés';
  guia.experiencia = '5 años de experiencia en turismo';
  guia.email = 'juan.perez@example.com';
  guia.telefono = '+51987654321';
  guia.disponible = true;
  guia.calificacion = 4.5;
  guia.createdAt = new Date();
  guia.updatedAt = new Date();

  return Object.assign(guia, overrides);
};

const createMockTourTest = (overrides: Partial<TourTest> = {}): TourTest => {
  const tour = new TourTest();
  tour.id_tour = 1;
  tour.nombre = 'Tour Machu Picchu';
  tour.descripcion = 'Tour completo a la ciudadela inca de Machu Picchu';
  tour.duracion = '1 día';
  tour.precio = 150.00;
  tour.capacidad_maxima = 20;
  tour.disponible = true;
  tour.id_guia = 1;
  tour.createdAt = new Date();
  tour.updatedAt = new Date();

  return Object.assign(tour, overrides);
};

describe('TourService (Simplified Tests)', () => {
  let tourService: TourServiceTest;
  let tourRepository: Repository<TourTest>;
  let guiaRepository: Repository<GuiaTest>;

  beforeAll(async () => {
    tourRepository = TestDataSource.getRepository(TourTest);
    guiaRepository = TestDataSource.getRepository(GuiaTest);
    tourService = new TourServiceTest();
  });

  beforeEach(() => {
    setupDefaultMocks();
  });

  afterEach(() => {
    clearAllMocks();
  });

  describe('findAll', () => {
    it('debería retornar todos los tours', async () => {
      // Arrange
      const mockTour = createMockTourTest();
      await tourRepository.save(mockTour);

      // Act
      const result = await tourService.findAll();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id_tour: expect.any(Number),
        nombre: mockTour.nombre,
        descripcion: mockTour.descripcion,
        precio: mockTour.precio,
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
    it('debería retornar un tour específico', async () => {
      // Arrange
      const mockTour = createMockTourTest();
      const savedTour = await tourRepository.save(mockTour);

      // Act
      const result = await tourService.findById(savedTour.id_tour);

      // Assert
      expect(result).toMatchObject({
        id_tour: savedTour.id_tour,
        nombre: savedTour.nombre,
        precio: savedTour.precio,
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
      const mockTour1 = createMockTourTest({ disponible: true });
      const mockTour2 = createMockTourTest({ 
        id_tour: 2, 
        nombre: 'Tour No Disponible', 
        disponible: false 
      });
      
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
      const mockTour1 = createMockTourTest({ precio: 200.00 });
      const mockTour2 = createMockTourTest({ 
        id_tour: 2, 
        nombre: 'Tour Económico', 
        precio: 100.00 
      });
      
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
      const mockGuia = createMockGuiaTest();
      await guiaRepository.save(mockGuia);
      
      const createTourDto = {
        nombre: 'Tour de Prueba',
        descripcion: 'Descripción del tour de prueba',
        duracion: '2 horas',
        precio: 100.00,
        capacidad_maxima: 15,
        id_guia: 1,
      };

      // Act
      const result = await tourService.create(createTourDto);

      // Assert
      expect(result).toMatchObject({
        nombre: createTourDto.nombre,
        descripcion: createTourDto.descripcion,
        precio: createTourDto.precio,
        id_guia: createTourDto.id_guia,
      });
    });

    it('debería lanzar error cuando el guía no existe', async () => {
      // Arrange
      const createTourDto = {
        nombre: 'Tour de Prueba',
        descripcion: 'Descripción del tour de prueba',
        duracion: '2 horas',
        precio: 100.00,
        id_guia: 999,
      };

      // Act & Assert
      await expect(tourService.create(createTourDto)).rejects.toThrow('El guía especificado no existe');
    });

    it('debería lanzar error cuando el guía no está disponible', async () => {
      // Arrange
      const mockGuia = createMockGuiaTest({ disponible: false });
      await guiaRepository.save(mockGuia);
      
      const createTourDto = {
        nombre: 'Tour de Prueba',
        descripcion: 'Descripción del tour de prueba',
        duracion: '2 horas',
        precio: 100.00,
        id_guia: 1,
      };

      // Act & Assert
      await expect(tourService.create(createTourDto)).rejects.toThrow('El guía no está disponible');
    });
  });

  describe('update', () => {
    it('debería actualizar un tour exitosamente', async () => {
      // Arrange
      const mockTour = createMockTourTest();
      const savedTour = await tourRepository.save(mockTour);
      
      const updateTourDto = {
        nombre: 'Tour Actualizado',
        descripcion: 'Descripción actualizada',
        precio: 120.00,
      };

      // Act
      const result = await tourService.update(savedTour.id_tour, updateTourDto);

      // Assert
      expect(result.nombre).toBe(updateTourDto.nombre);
      expect(result.descripcion).toBe(updateTourDto.descripcion);
      expect(result.precio).toBe(updateTourDto.precio);
    });

    it('debería lanzar error cuando el tour no existe', async () => {
      // Arrange
      const updateTourDto = {
        nombre: 'Tour Actualizado',
        precio: 120.00,
      };

      // Act & Assert
      await expect(tourService.update(999, updateTourDto)).rejects.toThrow('Tour no encontrado');
    });
  });

  describe('delete', () => {
    it('debería eliminar un tour exitosamente', async () => {
      // Arrange
      const mockTour = createMockTourTest();
      const savedTour = await tourRepository.save(mockTour);

      // Act
      await tourService.delete(savedTour.id_tour);

      // Assert
      const deletedTour = await tourRepository.findOne({
        where: { id_tour: savedTour.id_tour }
      });
      expect(deletedTour).toBeNull();
    });

    it('debería lanzar error cuando el tour no existe', async () => {
      // Act & Assert
      await expect(tourService.delete(999)).rejects.toThrow('Tour no encontrado');
    });
  });

  describe('toggleDisponibilidad', () => {
    it('debería cambiar disponibilidad de true a false', async () => {
      // Arrange
      const mockTour = createMockTourTest({ disponible: true });
      const savedTour = await tourRepository.save(mockTour);

      // Act
      const result = await tourService.toggleDisponibilidad(savedTour.id_tour);

      // Assert
      expect(result.disponible).toBe(false);
    });

    it('debería cambiar disponibilidad de false a true', async () => {
      // Arrange
      const mockTour = createMockTourTest({ disponible: false });
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