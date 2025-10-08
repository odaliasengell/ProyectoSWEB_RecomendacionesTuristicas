import { Guia } from '../../entities/Guia.entity';
import { Tour } from '../../entities/Tour.entity';
import { Reserva, EstadoReserva } from '../../entities/Reserva.entity';
import { CreateTourDto } from '../../modules/tours/dto/create-tour.dto';
import { UpdateTourDto } from '../../modules/tours/dto/update-tour.dto';

// Datos de prueba para Guías
export const createMockGuia = (overrides: Partial<Guia> = {}): Guia => {
  const guia = new Guia();
  guia.id_guia = 1;
  guia.nombre = 'Juan Pérez';
  guia.idiomas = 'Español, Inglés';
  guia.experiencia = '5 años de experiencia en turismo';
  guia.email = 'juan.perez@example.com';
  guia.telefono = '+51987654321';
  guia.disponible = true;
  guia.calificacion = 4.5;
  guia.tours = [];
  guia.createdAt = new Date();
  guia.updatedAt = new Date();

  return Object.assign(guia, overrides);
};

// Datos de prueba para Tours
export const createMockTour = (overrides: Partial<Tour> = {}): Tour => {
  const tour = new Tour();
  tour.id_tour = 1;
  tour.nombre = 'Tour Machu Picchu';
  tour.descripcion = 'Tour completo a la ciudadela inca de Machu Picchu';
  tour.duracion = '1 día';
  tour.precio = 150.00;
  tour.capacidad_maxima = 20;
  tour.disponible = true;
  tour.id_guia = 1;
  tour.reservas = [];
  tour.createdAt = new Date();
  tour.updatedAt = new Date();

  return Object.assign(tour, overrides);
};

// Datos de prueba para Reservas
export const createMockReserva = (overrides: Partial<Reserva> = {}): Reserva => {
  const reserva = new Reserva();
  reserva.id_reserva = 1;
  reserva.id_usuario = 1;
  reserva.id_tour = 1;
  reserva.fecha_reserva = new Date();
  reserva.cantidad_personas = 2;
  reserva.estado = EstadoReserva.PENDIENTE;
  reserva.precio_total = 300.00;
  reserva.comentarios = 'Reserva de prueba';
  reserva.createdAt = new Date();
  reserva.updatedAt = new Date();

  return Object.assign(reserva, overrides);
};

// DTOs de prueba
export const createMockCreateTourDto = (overrides: Partial<CreateTourDto> = {}): CreateTourDto => {
  return {
    id_tour: 1,
    nombre: 'Tour de Prueba',
    descripcion: 'Descripción del tour de prueba',
    duracion: '2 horas',
    precio: 100.00,
    capacidad_maxima: 15,
    id_guia: 1,
    ...overrides,
  };
};

export const createMockUpdateTourDto = (overrides: Partial<UpdateTourDto> = {}): UpdateTourDto => {
  return {
    nombre: 'Tour Actualizado',
    descripcion: 'Descripción actualizada',
    precio: 120.00,
    ...overrides,
  };
};

// Arrays de datos múltiples
export const createMockGuias = (count: number): Guia[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockGuia({
      id_guia: index + 1,
      nombre: `Guía ${index + 1}`,
      email: `guia${index + 1}@example.com`,
    })
  );
};

export const createMockTours = (count: number): Tour[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockTour({
      id_tour: index + 1,
      nombre: `Tour ${index + 1}`,
      precio: 100 + (index * 25),
    })
  );
};

export const createMockReservas = (count: number): Reserva[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockReserva({
      id_reserva: index + 1,
      id_usuario: index + 1,
      estado: index % 2 === 0 ? EstadoReserva.CONFIRMADA : EstadoReserva.PENDIENTE,
    })
  );
};