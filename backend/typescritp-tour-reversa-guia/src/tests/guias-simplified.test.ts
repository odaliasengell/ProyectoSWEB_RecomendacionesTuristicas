import { Repository } from 'typeorm';
import { TourTest, GuiaTest } from './entities/TestEntities';
import { TestDataSource } from './setup';
import { setupDefaultMocks, clearAllMocks, mockHttpClient } from './mocks/http-client.mock';

// Mock del GuiaService para usar entidades de prueba
class GuiaServiceTest {
  private guiaRepository: Repository<GuiaTest>;

  constructor() {
    this.guiaRepository = TestDataSource.getRepository(GuiaTest);
  }

  async findAll(): Promise<GuiaTest[]> {
    return await this.guiaRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<GuiaTest | null> {
    return await this.guiaRepository.findOne({
      where: { id_guia: id },
    });
  }

  async findAvailable(): Promise<GuiaTest[]> {
    return await this.guiaRepository.find({
      where: { disponible: true },
      order: { calificacion: 'DESC' },
    });
  }

  async create(createGuiaDto: any): Promise<GuiaTest> {
    // Verificar si el email ya existe
    const existingGuia = await this.guiaRepository.findOne({
      where: { email: createGuiaDto.email },
    });

    if (existingGuia) {
      throw new Error('Ya existe un guía con este email');
    }

    const guia = new GuiaTest();
    Object.assign(guia, createGuiaDto);
    return await this.guiaRepository.save(guia);
  }

  async update(id: number, updateGuiaDto: any): Promise<GuiaTest> {
    const guia = await this.findById(id);

    if (!guia) {
      throw new Error('Guía no encontrado');
    }

    // Si se está actualizando el email, verificar que no exista
    if (updateGuiaDto.email && updateGuiaDto.email !== guia.email) {
      const existingGuia = await this.guiaRepository.findOne({
        where: { email: updateGuiaDto.email },
      });

      if (existingGuia) {
        throw new Error('Ya existe un guía con este email');
      }
    }

    Object.assign(guia, updateGuiaDto);
    return await this.guiaRepository.save(guia);
  }

  async delete(id: number): Promise<void> {
    const guia = await this.findById(id);

    if (!guia) {
      throw new Error('Guía no encontrado');
    }

    await this.guiaRepository.remove(guia);
  }

  async toggleDisponibilidad(id: number): Promise<GuiaTest> {
    const guia = await this.findById(id);

    if (!guia) {
      throw new Error('Guía no encontrado');
    }

    guia.disponible = !guia.disponible;
    return await this.guiaRepository.save(guia);
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

describe('GuiaService (Simplified Tests)', () => {
  let guiaService: GuiaServiceTest;
  let guiaRepository: Repository<GuiaTest>;

  beforeAll(async () => {
    guiaRepository = TestDataSource.getRepository(GuiaTest);
    guiaService = new GuiaServiceTest();
  });

  beforeEach(() => {
    setupDefaultMocks();
  });

  afterEach(() => {
    clearAllMocks();
  });

  describe('findAll', () => {
    it('debería retornar todos los guías', async () => {
      // Arrange
      const mockGuia1 = createMockGuiaTest();
      const mockGuia2 = createMockGuiaTest({ 
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
      const mockGuia1 = createMockGuiaTest({
        nombre: 'Primer Guía',
        createdAt: new Date('2023-01-01'),
      });
      const mockGuia2 = createMockGuiaTest({
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
    it('debería retornar un guía específico', async () => {
      // Arrange
      const mockGuia = createMockGuiaTest();
      const savedGuia = await guiaRepository.save(mockGuia);

      // Act
      const result = await guiaService.findById(savedGuia.id_guia);

      // Assert
      expect(result).toMatchObject({
        id_guia: savedGuia.id_guia,
        nombre: savedGuia.nombre,
        email: savedGuia.email,
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
      const mockGuia1 = createMockGuiaTest({ disponible: true, calificacion: 4.5 });
      const mockGuia2 = createMockGuiaTest({ 
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
      const mockGuia1 = createMockGuiaTest({ 
        disponible: true, 
        calificacion: 4.0,
        nombre: 'Guía Calificación Baja',
      });
      const mockGuia2 = createMockGuiaTest({ 
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
      const createGuiaDto = {
        nombre: 'Carlos González',
        idiomas: 'Español, Inglés, Francés',
        experiencia: '8 años guiando turistas internacionales',
        email: 'carlos.gonzalez@example.com',
        telefono: '+51987123456',
      };

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
    });

    it('debería lanzar error cuando el email ya existe', async () => {
      // Arrange
      const mockGuia = createMockGuiaTest();
      await guiaRepository.save(mockGuia);
      
      const createGuiaDto = {
        nombre: 'Otro Guía',
        email: mockGuia.email,
        telefono: '+51987123456',
      };

      // Act & Assert
      await expect(guiaService.create(createGuiaDto)).rejects.toThrow('Ya existe un guía con este email');
    });

    it('debería crear guía con valores por defecto', async () => {
      // Arrange
      const createGuiaDto = {
        nombre: 'Carlos González',
        idiomas: 'Español',
        experiencia: '5 años',
        email: 'carlos.gonzalez@example.com',
        telefono: '+51987123456',
      };

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
      const mockGuia = createMockGuiaTest();
      const savedGuia = await guiaRepository.save(mockGuia);
      
      const updateGuiaDto = {
        nombre: 'Carlos González Actualizado',
        experiencia: '10 años de experiencia',
        calificacion: 4.8,
      };

      // Act
      const result = await guiaService.update(savedGuia.id_guia, updateGuiaDto);

      // Assert
      expect(result.nombre).toBe(updateGuiaDto.nombre);
      expect(result.experiencia).toBe(updateGuiaDto.experiencia);
      expect(result.calificacion).toBe(updateGuiaDto.calificacion);
    });

    it('debería lanzar error cuando el guía no existe', async () => {
      // Arrange
      const updateGuiaDto = {
        nombre: 'Guía Actualizado',
      };

      // Act & Assert
      await expect(guiaService.update(999, updateGuiaDto)).rejects.toThrow('Guía no encontrado');
    });

    it('debería actualizar email cuando es diferente', async () => {
      // Arrange
      const mockGuia = createMockGuiaTest();
      const savedGuia = await guiaRepository.save(mockGuia);
      
      const updateGuiaDto = { 
        email: 'nuevo.email@example.com' 
      };

      // Act
      const result = await guiaService.update(savedGuia.id_guia, updateGuiaDto);

      // Assert
      expect(result.email).toBe('nuevo.email@example.com');
    });

    it('debería lanzar error cuando el nuevo email ya existe', async () => {
      // Arrange
      const mockGuia1 = createMockGuiaTest();
      const mockGuia2 = createMockGuiaTest({ 
        id_guia: 2, 
        email: 'otro.guia@example.com' 
      });
      
      await guiaRepository.save(mockGuia1);
      const savedGuia2 = await guiaRepository.save(mockGuia2);
      
      const updateGuiaDto = { 
        email: mockGuia1.email 
      };

      // Act & Assert
      await expect(guiaService.update(savedGuia2.id_guia, updateGuiaDto))
        .rejects.toThrow('Ya existe un guía con este email');
    });

    it('debería permitir mantener el mismo email', async () => {
      // Arrange
      const mockGuia = createMockGuiaTest();
      const savedGuia = await guiaRepository.save(mockGuia);
      
      const updateGuiaDto = { 
        email: mockGuia.email,
        nombre: 'Nombre Actualizado'
      };

      // Act
      const result = await guiaService.update(savedGuia.id_guia, updateGuiaDto);

      // Assert
      expect(result.email).toBe(mockGuia.email);
      expect(result.nombre).toBe('Nombre Actualizado');
    });
  });

  describe('delete', () => {
    it('debería eliminar un guía exitosamente', async () => {
      // Arrange
      const mockGuia = createMockGuiaTest();
      const savedGuia = await guiaRepository.save(mockGuia);

      // Act
      await guiaService.delete(savedGuia.id_guia);

      // Assert
      const deletedGuia = await guiaRepository.findOne({
        where: { id_guia: savedGuia.id_guia }
      });
      expect(deletedGuia).toBeNull();
    });

    it('debería lanzar error cuando el guía no existe', async () => {
      // Act & Assert
      await expect(guiaService.delete(999)).rejects.toThrow('Guía no encontrado');
    });
  });

  describe('toggleDisponibilidad', () => {
    it('debería cambiar disponibilidad de true a false', async () => {
      // Arrange
      const mockGuia = createMockGuiaTest({ disponible: true });
      const savedGuia = await guiaRepository.save(mockGuia);

      // Act
      const result = await guiaService.toggleDisponibilidad(savedGuia.id_guia);

      // Assert
      expect(result.disponible).toBe(false);
    });

    it('debería cambiar disponibilidad de false a true', async () => {
      // Arrange
      const mockGuia = createMockGuiaTest({ disponible: false });
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