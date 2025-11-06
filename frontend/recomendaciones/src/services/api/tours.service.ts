import api from './axios.config';
import { AxiosError } from 'axios';

export interface Tour {
  id?: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  precio: number;
  capacidad_maxima?: number;
  disponible?: boolean;
  guia_id?: string;
  destino_id?: string;
  imagen_url?: string;
  imagenes?: string[];
  categoria?: string;
  dificultad?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  incluye?: string[];
  no_incluye?: string[];
}

export interface CreateTourData {
  nombre: string;
  descripcion: string;
  duracion: string;
  precio: number;
  capacidad_maxima?: number;
  disponible?: boolean;
  guia_id?: string;
  destino_id?: string;
  imagen_url?: string;
  imagenes?: string[];
  categoria?: string;
  dificultad?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  incluye?: string[];
  no_incluye?: string[];
}

export interface UpdateTourData extends Partial<CreateTourData> {}

/**
 * Obtiene todos los tours
 */
export const getTours = async (): Promise<Tour[]> => {
  try {
    const response = await api.get('/tours/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener tours:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudieron cargar los tours');
    }
    throw new Error('No se pudieron cargar los tours');
  }
};

/**
 * Obtiene tours disponibles (filtra por disponible = true)
 */
export const getToursDisponibles = async (): Promise<Tour[]> => {
  try {
    const tours = await getTours();
    return tours.filter(tour => tour.disponible !== false);
  } catch (error) {
    console.error('Error al obtener tours disponibles:', error);
    throw new Error('No se pudieron cargar los tours disponibles');
  }
};

/**
 * Obtiene un tour por su ID
 */
export const getTourById = async (id: string): Promise<Tour> => {
  try {
    const response = await api.get(`/tours/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener tour:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Tour no encontrado');
      }
      throw new Error(error.response.data?.detail || 'No se pudo cargar el tour');
    }
    throw new Error('No se pudo cargar el tour');
  }
};

/**
 * Crea un nuevo tour
 */
export const createTour = async (data: CreateTourData): Promise<Tour> => {
  try {
    const response = await api.post('/tours/', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear tour:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudo crear el tour');
    }
    throw new Error('No se pudo crear el tour');
  }
};

/**
 * Actualiza un tour existente
 */
export const updateTour = async (id: string, data: UpdateTourData): Promise<Tour> => {
  try {
    const response = await api.put(`/tours/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar tour:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Tour no encontrado');
      }
      throw new Error(error.response.data?.detail || 'No se pudo actualizar el tour');
    }
    throw new Error('No se pudo actualizar el tour');
  }
};

/**
 * Elimina un tour
 */
export const deleteTour = async (id: string): Promise<void> => {
  try {
    await api.delete(`/tours/${id}`);
  } catch (error) {
    console.error('Error al eliminar tour:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Tour no encontrado');
      }
      throw new Error(error.response.data?.detail || 'No se pudo eliminar el tour');
    }
    throw new Error('No se pudo eliminar el tour');
  }
};

