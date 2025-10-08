import { Repository } from 'typeorm';
import { GuiaService } from '../modules/guias/guia.service';
import { Guia } from '../entities/Guia.entity';
import { TestDataSource } from './setup';
import { createMockGuia, createMockTour } from './fixtures/test-data';
import { setupDefaultMocks, clearAllMocks, mockHttpClient } from './mocks/http-client.mock';

// Mock de DTOs
const createMockCreateGuiaDto = (overrides: any = {}) => ({
  nombre: 'Carlos González',
  idiomas: 'Español, Inglés, Francés',
  experiencia: '8 años guiando turistas internacionales',
  email: 'carlos.gonzalez@example.com',
  telefono: '+51987123456',
  ...overrides,
});

const createMockUpdateGuiaDto = (overrides: any = {}) => ({
  nombre: 'Carlos González Actualizado',
  experiencia: '10 años de experiencia',
  calificacion: 4.8,
  ...overrides,
});

describe('GuiaService', () => {
  let guiaService: GuiaService;
  let guiaRepository: Repository<Guia>;

  beforeAll(async () => {
    guiaRepository = TestDataSource.getRepository(Guia);
    guiaService = new GuiaService();
  });

  beforeEach(() => {
    setupDefaultMocks();
  });

  afterEach(() => {
    clearAllMocks();
  });

  describe('findAll', () => {
    it('debería retornar todos los guías con sus tours', async () => {
      // Arrange
      const mockGuia1 = createMockGuia();
      const mockGuia2 = createMockGuia({ 
        id_guia: 2, 
        nombre: 'María García', 
        email: 'maria.garcia@example.com' 
      });
      
      await guiaRepository.save(mockGuia1);
      await guiaRepository.save(mockGuia2);

      // Act
      const result = await guiaService.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        nombre: expect.any(String),
        email: expect.any(String),
        tours: expect.any(Array),
      });
    });

    it('debería retornar array vacío cuando no hay guías', async () => {
      // Act
      const result = await guiaService.findAll();

      // Assert
      expect(result).toHaveLength(0);
    });

    it('debería ordenar por fecha de creación descendente', async () => {
      // Arrange
      const mockGuia1 = createMockGuia({
        nombre: 'Primer Guía',
        createdAt: new Date('2023-01-01'),
      });
      const mockGuia2 = createMockGuia({
        id_guia: 2,
        nombre: 'Segundo Guía',
        email: 'segundo@example.com',
        createdAt: new Date('2023-01-02'),
      });
      
      await guiaRepository.save(mockGuia1);
      await guiaRepository.save(mockGuia2);

      // Act
      const result = await guiaService.findAll();

      // Assert
      expect(result[0].nombre).toBe('Segundo Guía');
      expect(result[1].nombre).toBe('Primer Guía');
    });
  });

  describe('findById', () => {
    it('debería retornar un guía específico con sus tours', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const savedGuia = await guiaRepository.save(mockGuia);

      // Act
      const result = await guiaService.findById(savedGuia.id_guia);

      // Assert
      expect(result).toMatchObject({
        id_guia: savedGuia.id_guia,
        nombre: savedGuia.nombre,
        email: savedGuia.email,
        tours: expect.any(Array),
      });
    });

    it('debería retornar null cuando el guía no existe', async () => {
      // Act
      const result = await guiaService.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAvailable', () => {
    it('debería retornar solo guías disponibles', async () => {
      // Arrange
      const mockGuia1 = createMockGuia({ disponible: true, calificacion: 4.5 });
      const mockGuia2 = createMockGuia({ 
        id_guia: 2, 
        nombre: 'Guía No Disponible', 
        email: 'no.disponible@example.com',
        disponible: false,
        calificacion: 4.8,
      });
      
      await guiaRepository.save(mockGuia1);
      await guiaRepository.save(mockGuia2);

      // Act
      const result = await guiaService.findAvailable();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].disponible).toBe(true);
      expect(result[0].nombre).toBe('Juan Pérez');
    });

    it('debería ordenar por calificación descendente', async () => {
      // Arrange
      const mockGuia1 = createMockGuia({ 
        disponible: true, 
        calificacion: 4.0,
        nombre: 'Guía Calificación Baja',
      });
      const mockGuia2 = createMockGuia({ 
        id_guia: 2, 
        nombre: 'Guía Calificación Alta', 
        email: 'alta.calificacion@example.com',
        disponible: true, 
        calificacion: 4.9,
      });
      
      await guiaRepository.save(mockGuia1);
      await guiaRepository.save(mockGuia2);

      // Act
      const result = await guiaService.findAvailable();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].calificacion).toBe(4.9);
      expect(result[1].calificacion).toBe(4.0);
    });
  });

  describe('create', () => {
    it('debería crear un guía exitosamente', async () => {
      // Arrange
      const createGuiaDto = createMockCreateGuiaDto();

      // Act
      const result = await guiaService.create(createGuiaDto);

      // Assert
      expect(result).toMatchObject({
        nombre: createGuiaDto.nombre,
        idiomas: createGuiaDto.idiomas,
        experiencia: createGuiaDto.experiencia,
        email: createGuiaDto.email,
        telefono: createGuiaDto.telefono,
      });
      expect(mockHttpClient.notifyWebSocket).toHaveBeenCalledWith('guia_creado', {
        id_guia: result.id_guia,
        nombre: result.nombre,
      });
    });

    it('debería lanzar error cuando el email ya existe', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      await guiaRepository.save(mockGuia);
      
      const createGuiaDto = createMockCreateGuiaDto({ 
        email: mockGuia.email 
      });

      // Act & Assert
      await expect(guiaService.create(createGuiaDto)).rejects.toThrow('Ya existe un guía con este email');
    });

    it('debería crear guía con valores por defecto', async () => {
      // Arrange
      const createGuiaDto = createMockCreateGuiaDto();

      // Act
      const result = await guiaService.create(createGuiaDto);

      // Assert
      expect(result.disponible).toBe(true);
      expect(result.calificacion).toBe(0);
      expect(result.id_guia).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('update', () => {
    it('debería actualizar un guía exitosamente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const savedGuia = await guiaRepository.save(mockGuia);
      
      const updateGuiaDto = createMockUpdateGuiaDto();

      // Act
      const result = await guiaService.update(savedGuia.id_guia, updateGuiaDto);

      // Assert
      expect(result.nombre).toBe(updateGuiaDto.nombre);
      expect(result.experiencia).toBe(updateGuiaDto.experiencia);
      expect(result.calificacion).toBe(updateGuiaDto.calificacion);
      expect(mockHttpClient.notifyWebSocket).toHaveBeenCalledWith('guia_actualizado', {
        id_guia: result.id_guia,
        nombre: result.nombre,
      });
    });

    it('debería lanzar error cuando el guía no existe', async () => {
      // Arrange
      const updateGuiaDto = createMockUpdateGuiaDto();

      // Act & Assert
      await expect(guiaService.update(999, updateGuiaDto)).rejects.toThrow('Guía no encontrado');
    });

    it('debería actualizar email cuando es diferente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const savedGuia = await guiaRepository.save(mockGuia);
      
      const updateGuiaDto = createMockUpdateGuiaDto({ 
        email: 'nuevo.email@example.com' 
      });

      // Act
      const result = await guiaService.update(savedGuia.id_guia, updateGuiaDto);

      // Assert
      expect(result.email).toBe('nuevo.email@example.com');
    });

    it('debería lanzar error cuando el nuevo email ya existe', async () => {
      // Arrange
      const mockGuia1 = createMockGuia();
      const mockGuia2 = createMockGuia({ 
        id_guia: 2, 
        email: 'otro.guia@example.com' 
      });
      
      await guiaRepository.save(mockGuia1);
      const savedGuia2 = await guiaRepository.save(mockGuia2);
      
      const updateGuiaDto = createMockUpdateGuiaDto({ 
        email: mockGuia1.email 
      });

      // Act & Assert
      await expect(guiaService.update(savedGuia2.id_guia, updateGuiaDto))
        .rejects.toThrow('Ya existe un guía con este email');
    });

    it('debería permitir mantener el mismo email', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const savedGuia = await guiaRepository.save(mockGuia);
      
      const updateGuiaDto = createMockUpdateGuiaDto({ 
        email: mockGuia.email 
      });

      // Act
      const result = await guiaService.update(savedGuia.id_guia, updateGuiaDto);

      // Assert
      expect(result.email).toBe(mockGuia.email);
    });
  });

  describe('delete', () => {
    it('debería eliminar un guía exitosamente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const savedGuia = await guiaRepository.save(mockGuia);

      // Act
      await guiaService.delete(savedGuia.id_guia);

      // Assert
      const deletedGuia = await guiaRepository.findOne({
        where: { id_guia: savedGuia.id_guia }
      });
      expect(deletedGuia).toBeNull();
      expect(mockHttpClient.notifyWebSocket).toHaveBeenCalledWith('guia_eliminado', {
        id_guia: savedGuia.id_guia,
      });
    });

    it('debería lanzar error cuando el guía no existe', async () => {
      // Act & Assert
      await expect(guiaService.delete(999)).rejects.toThrow('Guía no encontrado');
    });
  });

  describe('toggleDisponibilidad', () => {
    it('debería cambiar disponibilidad de true a false', async () => {
      // Arrange
      const mockGuia = createMockGuia({ disponible: true });
      const savedGuia = await guiaRepository.save(mockGuia);

      // Act
      const result = await guiaService.toggleDisponibilidad(savedGuia.id_guia);

      // Assert
      expect(result.disponible).toBe(false);
    });

    it('debería cambiar disponibilidad de false a true', async () => {
      // Arrange
      const mockGuia = createMockGuia({ disponible: false });
      const savedGuia = await guiaRepository.save(mockGuia);

      // Act
      const result = await guiaService.toggleDisponibilidad(savedGuia.id_guia);

      // Assert
      expect(result.disponible).toBe(true);
    });

    it('debería lanzar error cuando el guía no existe', async () => {
      // Act & Assert
      await expect(guiaService.toggleDisponibilidad(999)).rejects.toThrow('Guía no encontrado');
    });
  });
});