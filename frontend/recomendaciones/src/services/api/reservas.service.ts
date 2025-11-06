import api from './axios.config';
import { AxiosError } from 'axios';

export interface Reserva {
  id?: string;
  usuario_id: string;
  tour_id: string;
  fecha_reserva: string;
  cantidad_personas: number;
  estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  precio_total: number;
  comentarios?: string;
  notas?: string;
}

export interface CreateReservaData {
  usuario_id: string;
  tour_id: string;
  fecha_reserva: string;
  cantidad_personas: number;
  precio_total: number;
  comentarios?: string;
  notas?: string;
}

export interface UpdateReservaData extends Partial<Omit<CreateReservaData, 'usuario_id' | 'tour_id'>> {
  estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
}

export const getReservas = async (): Promise<Reserva[]> => {
  try {
    const response = await api.get('/reservas/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudieron cargar las reservas');
    }
    throw new Error('No se pudieron cargar las reservas');
  }
};

export const getReservaById = async (id: string): Promise<Reserva> => {
  try {
    const response = await api.get(`/reservas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Reserva no encontrada');
      }
      throw new Error(error.response.data?.detail || 'No se pudo cargar la reserva');
    }
    throw new Error('No se pudo cargar la reserva');
  }
};

export const createReserva = async (data: CreateReservaData): Promise<Reserva> => {
  try {
    const response = await api.post('/reservas/', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear reserva:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudo crear la reserva');
    }
    throw new Error('No se pudo crear la reserva');
  }
};

export const updateReserva = async (id: string, data: UpdateReservaData): Promise<Reserva> => {
  try {
    const response = await api.put(`/reservas/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Reserva no encontrada');
      }
      throw new Error(error.response.data?.detail || 'No se pudo actualizar la reserva');
    }
    throw new Error('No se pudo actualizar la reserva');
  }
};

// Alias para compatibilidad
export const crearReserva = createReserva;
export const actualizarReserva = updateReserva;

export const deleteReserva = async (id: string): Promise<void> => {
  try {
    await api.delete(`/reservas/${id}`);
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Reserva no encontrada');
      }
      throw new Error(error.response.data?.detail || 'No se pudo eliminar la reserva');
    }
    throw new Error('No se pudo eliminar la reserva');
  }
};

export const cancelarReserva = async (id: string): Promise<Reserva> => {
  return actualizarReserva(id, { estado: 'cancelada' });
};

export const obtenerMisReservas = async (): Promise<Reserva[]> => {
  try {
    const userDataStr = localStorage.getItem('userData') || localStorage.getItem('user');
    
    if (!userDataStr) {
      throw new Error('Usuario no autenticado. Por favor inicia sesión.');
    }
    
    const userData = JSON.parse(userDataStr);
    const userId = userData.id || userData.usuario_id;
    
    if (!userId) {
      throw new Error('ID de usuario no encontrado');
    }
    
    const todasLasReservas = await getReservas();
    return todasLasReservas.filter(reserva => reserva.usuario_id === userId);
  } catch (error) {
    console.error('Error al obtener mis reservas:', error);
    if (error instanceof Error && error.message.includes('autenticado')) {
      throw error;
    }
    throw new Error('No se pudieron cargar tus reservas');
  }
};

export const obtenerTodasLasReservas = getReservas;
export const obtenerReservaPorId = getReservaById;
