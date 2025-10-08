import { Repository } from 'typeorm';
import { ReservaService } from '../modules/reservas/reserva.service';
import { Reserva, EstadoReserva } from '../entities/Reserva.entity';
import { Tour } from '../entities/Tour.entity';
import { Guia } from '../entities/Guia.entity';
import { TestDataSource } from './setup';
import { createMockReserva, createMockTour, createMockGuia } from './fixtures/test-data';
import { setupDefaultMocks, clearAllMocks, mockHttpClient } from './mocks/http-client.mock';

// Mock de DTOs
const createMockCreateReservaDto = (overrides: any = {}) => ({
  id_usuario: 1,
  id_tour: 1,
  fecha_reserva: new Date('2024-12-01'),
  cantidad_personas: 2,
  precio_total: 300.00,
  comentarios: 'Reserva de prueba',
  ...overrides,
});

const createMockUpdateReservaDto = (overrides: any = {}) => ({
  cantidad_personas: 3,
  estado: EstadoReserva.CONFIRMADA,
  comentarios: 'Reserva actualizada',
  ...overrides,
});

describe('ReservaService', () => {
  let reservaService: ReservaService;
  let reservaRepository: Repository<Reserva>;
  let tourRepository: Repository<Tour>;
  let guiaRepository: Repository<Guia>;

  beforeAll(async () => {
    reservaRepository = TestDataSource.getRepository(Reserva);
    tourRepository = TestDataSource.getRepository(Tour);
    guiaRepository = TestDataSource.getRepository(Guia);
    reservaService = new ReservaService();
  });

  beforeEach(() => {
    setupDefaultMocks();
  });

  afterEach(() => {
    clearAllMocks();
  });

  describe('findAll', () => {
    it('debería retornar todas las reservas con tour y guía', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      const mockReserva1 = createMockReserva();
      const mockReserva2 = createMockReserva({ 
        id_reserva: 2, 
        id_usuario: 2,
        estado: EstadoReserva.CONFIRMADA 
      });
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);
      
      mockReserva1.tour = savedTour;
      mockReserva2.tour = savedTour;
      
      await reservaRepository.save(mockReserva1);
      await reservaRepository.save(mockReserva2);

      // Act
      const result = await reservaService.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id_reserva: expect.any(Number),
        id_usuario: expect.any(Number),
        tour: expect.objectContaining({
          id_tour: expect.any(Number),
          nombre: expect.any(String),
        }),
      });
    });

    it('debería retornar array vacío cuando no hay reservas', async () => {
      // Act
      const result = await reservaService.findAll();

      // Assert
      expect(result).toHaveLength(0);
    });

    it('debería ordenar por fecha de creación descendente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);
      
      const mockReserva1 = createMockReserva({
        createdAt: new Date('2023-01-01'),
        tour: savedTour,
      });
      const mockReserva2 = createMockReserva({
        id_reserva: 2,
        id_usuario: 2,
        createdAt: new Date('2023-01-02'),
        tour: savedTour,
      });
      
      await reservaRepository.save(mockReserva1);
      await reservaRepository.save(mockReserva2);

      // Act
      const result = await reservaService.findAll();

      // Assert
      expect(result[0].id_reserva).toBe(2);
      expect(result[1].id_reserva).toBe(1);
    });
  });

  describe('findById', () => {
    it('debería retornar una reserva específica con tour y guía', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      const mockReserva = createMockReserva();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);
      
      mockReserva.tour = savedTour;
      const savedReserva = await reservaRepository.save(mockReserva);

      // Act
      const result = await reservaService.findById(savedReserva.id_reserva);

      // Assert
      expect(result).toMatchObject({
        id_reserva: savedReserva.id_reserva,
        id_usuario: savedReserva.id_usuario,
        tour: expect.objectContaining({
          id_tour: savedTour.id_tour,
          nombre: savedTour.nombre,
        }),
      });
    });

    it('debería retornar null cuando la reserva no existe', async () => {
      // Act
      const result = await reservaService.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('debería crear una reserva exitosamente', async () => {
      // Arrange
      const createReservaDto = createMockCreateReservaDto();

      // Act
      const result = await reservaService.create(createReservaDto);

      // Assert
      expect(result).toMatchObject({
        id_usuario: createReservaDto.id_usuario,
        id_tour: createReservaDto.id_tour,
        cantidad_personas: createReservaDto.cantidad_personas,
        precio_total: createReservaDto.precio_total,
        comentarios: createReservaDto.comentarios,
        estado: EstadoReserva.PENDIENTE,
      });
      expect(mockHttpClient.notifyWebSocket).toHaveBeenCalledWith('reserva_creada', {
        id_reserva: result.id_reserva,
        id_tour: result.id_tour,
      });
    });

    it('debería crear reserva con estado por defecto PENDIENTE', async () => {
      // Arrange
      const createReservaDto = createMockCreateReservaDto();

      // Act
      const result = await reservaService.create(createReservaDto);

      // Assert
      expect(result.estado).toBe(EstadoReserva.PENDIENTE);
    });

    it('debería crear reserva con estado específico', async () => {
      // Arrange
      const createReservaDto = createMockCreateReservaDto({
        estado: EstadoReserva.CONFIRMADA,
      });

      // Act
      const result = await reservaService.create(createReservaDto);

      // Assert
      expect(result.estado).toBe(EstadoReserva.CONFIRMADA);
    });

    it('debería asignar fechas de creación y actualización', async () => {
      // Arrange
      const createReservaDto = createMockCreateReservaDto();

      // Act
      const result = await reservaService.create(createReservaDto);

      // Assert
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.id_reserva).toBeDefined();
    });
  });

  describe('update', () => {
    it('debería actualizar una reserva exitosamente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      const mockReserva = createMockReserva();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);
      
      mockReserva.tour = savedTour;
      const savedReserva = await reservaRepository.save(mockReserva);
      
      const updateReservaDto = createMockUpdateReservaDto();

      // Act
      const result = await reservaService.update(savedReserva.id_reserva, updateReservaDto);

      // Assert
      expect(result.cantidad_personas).toBe(updateReservaDto.cantidad_personas);
      expect(result.estado).toBe(updateReservaDto.estado);
      expect(result.comentarios).toBe(updateReservaDto.comentarios);
      expect(mockHttpClient.notifyWebSocket).toHaveBeenCalledWith('reserva_actualizada', {
        id_reserva: result.id_reserva,
        estado: result.estado,
      });
    });

    it('debería lanzar error cuando la reserva no existe', async () => {
      // Arrange
      const updateReservaDto = createMockUpdateReservaDto();

      // Act & Assert
      await expect(reservaService.update(999, updateReservaDto)).rejects.toThrow('Reserva no encontrada');
    });

    it('debería actualizar solo campos proporcionados', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      const mockReserva = createMockReserva();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);
      
      mockReserva.tour = savedTour;
      const savedReserva = await reservaRepository.save(mockReserva);
      
      const updateReservaDto = { estado: EstadoReserva.CANCELADA };

      // Act
      const result = await reservaService.update(savedReserva.id_reserva, updateReservaDto);

      // Assert
      expect(result.estado).toBe(EstadoReserva.CANCELADA);
      expect(result.cantidad_personas).toBe(savedReserva.cantidad_personas); // Sin cambios
      expect(result.comentarios).toBe(savedReserva.comentarios); // Sin cambios
    });
  });

  describe('delete', () => {
    it('debería eliminar una reserva exitosamente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      const mockReserva = createMockReserva();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);
      
      mockReserva.tour = savedTour;
      const savedReserva = await reservaRepository.save(mockReserva);

      // Act
      await reservaService.delete(savedReserva.id_reserva);

      // Assert
      const deletedReserva = await reservaRepository.findOne({
        where: { id_reserva: savedReserva.id_reserva }
      });
      expect(deletedReserva).toBeNull();
      expect(mockHttpClient.notifyWebSocket).toHaveBeenCalledWith('reserva_eliminada', {
        id_reserva: savedReserva.id_reserva,
      });
    });

    it('debería lanzar error cuando la reserva no existe', async () => {
      // Act & Assert
      await expect(reservaService.delete(999)).rejects.toThrow('Reserva no encontrada');
    });
  });

  describe('findByUsuario', () => {
    it('debería retornar reservas de un usuario específico', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);
      
      const mockReserva1 = createMockReserva({ 
        id_usuario: 1, 
        tour: savedTour,
        fecha_reserva: new Date('2024-01-01'),
      });
      const mockReserva2 = createMockReserva({ 
        id_reserva: 2,
        id_usuario: 1, 
        tour: savedTour,
        fecha_reserva: new Date('2024-01-02'),
      });
      const mockReserva3 = createMockReserva({ 
        id_reserva: 3,
        id_usuario: 2, 
        tour: savedTour,
        fecha_reserva: new Date('2024-01-03'),
      });
      
      await reservaRepository.save(mockReserva1);
      await reservaRepository.save(mockReserva2);
      await reservaRepository.save(mockReserva3);

      // Act
      const result = await reservaService.findByUsuario(1);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(reserva => reserva.id_usuario === 1)).toBe(true);
    });

    it('debería ordenar por fecha de reserva descendente', async () => {
      // Arrange
      const mockGuia = createMockGuia();
      const mockTour = createMockTour();
      
      await guiaRepository.save(mockGuia);
      const savedTour = await tourRepository.save(mockTour);
      
      const mockReserva1 = createMockReserva({ 
        id_usuario: 1, 
        tour: savedTour,
        fecha_reserva: new Date('2024-01-01'),
      });
      const mockReserva2 = createMockReserva({ 
        id_reserva: 2,
        id_usuario: 1, 
        tour: savedTour,
        fecha_reserva: new Date('2024-01-03'),
      });
      
      await reservaRepository.save(mockReserva1);
      await reservaRepository.save(mockReserva2);

      // Act
      const result = await reservaService.findByUsuario(1);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].fecha_reserva.getTime()).toBeGreaterThan(result[1].fecha_reserva.getTime());
    });

    it('debería retornar array vacío cuando el usuario no tiene reservas', async () => {
      // Act
      const result = await reservaService.findByUsuario(999);

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});