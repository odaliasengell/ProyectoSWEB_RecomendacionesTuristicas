import api from './axios.config';
import { AxiosError } from 'axios';

export interface Guia {
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  idiomas?: string[];
  especialidades?: string[];
  experiencia_anos?: number;
  calificacion_promedio?: number;
  certificaciones?: string[];
  disponible?: boolean;
  foto?: string;
}

export interface CreateGuiaData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  idiomas?: string[];
  especialidades?: string[];
  experiencia_anos?: number;
  certificaciones?: string[];
  disponible?: boolean;
  foto?: string;
}

export interface UpdateGuiaData extends Partial<CreateGuiaData> {}

/**
 * Obtiene todas las guías
 */
export const getGuias = async (): Promise<Guia[]> => {
  try {
    const response = await api.get('/guias/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener guías:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudieron cargar las guías');
    }
    throw new Error('No se pudieron cargar las guías');
  }
};

/**
 * Obtiene una guía por ID
 */
export const getGuiaById = async (id: string): Promise<Guia> => {
  try {
    const response = await api.get(`/guias/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener guía:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Guía no encontrada');
      }
      throw new Error(error.response.data?.detail || 'No se pudo cargar la guía');
    }
    throw new Error('No se pudo cargar la guía');
  }
};

/**
 * Crea una nueva guía
 */
export const createGuia = async (data: CreateGuiaData): Promise<Guia> => {
  try {
    const response = await api.post('/guias/', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear guía:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudo crear la guía');
    }
    throw new Error('No se pudo crear la guía');
  }
};

/**
 * Actualiza una guía existente
 */
export const updateGuia = async (id: string, data: UpdateGuiaData): Promise<Guia> => {
  try {
    const response = await api.put(`/guias/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar guía:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Guía no encontrada');
      }
      throw new Error(error.response.data?.detail || 'No se pudo actualizar la guía');
    }
    throw new Error('No se pudo actualizar la guía');
  }
};

/**
 * Elimina una guía
 */
export const deleteGuia = async (id: string): Promise<void> => {
  try {
    await api.delete(`/guias/${id}`);
  } catch (error) {
    console.error('Error al eliminar guía:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Guía no encontrada');
      }
      throw new Error(error.response.data?.detail || 'No se pudo eliminar la guía');
    }
    throw new Error('No se pudo eliminar la guía');
  }
};

/**
 * Obtiene guías disponibles
 */
export const getGuiasDisponibles = async (): Promise<Guia[]> => {
  try {
    const guias = await getGuias();
    return guias.filter(guia => guia.disponible !== false);
  } catch (error) {
    console.error('Error al obtener guías disponibles:', error);
    throw new Error('No se pudieron cargar las guías disponibles');
  }
};
