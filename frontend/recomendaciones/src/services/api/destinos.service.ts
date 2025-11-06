import api from './axios.config';
import { AxiosError } from 'axios';

export interface Destino {
  id?: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  ruta?: string;
  provincia?: string;
  ciudad?: string;
  categoria?: string;
  calificacion_promedio?: number;
  activo?: boolean;
  imagenes?: string[];
}

export interface CreateDestinoData {
  nombre: string;
  descripcion: string;
  ubicacion: string;
  ruta?: string;
  provincia?: string;
  ciudad?: string;
  categoria?: string;
  activo?: boolean;
  imagenes?: string[];
}

export interface UpdateDestinoData extends Partial<CreateDestinoData> {}

/**
 * Obtiene todos los destinos
 */
export const getDestinos = async (): Promise<Destino[]> => {
  try {
    const response = await api.get('/destinos/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener destinos:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudieron cargar los destinos');
    }
    throw new Error('No se pudieron cargar los destinos');
  }
};

/**
 * Obtiene un destino por ID
 */
export const getDestinoById = async (id: string): Promise<Destino> => {
  try {
    const response = await api.get(`/destinos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener destino:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Destino no encontrado');
      }
      throw new Error(error.response.data?.detail || 'No se pudo cargar el destino');
    }
    throw new Error('No se pudo cargar el destino');
  }
};

/**
 * Crea un nuevo destino
 */
export const createDestino = async (data: CreateDestinoData): Promise<Destino> => {
  try {
    const response = await api.post('/destinos/', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear destino:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudo crear el destino');
    }
    throw new Error('No se pudo crear el destino');
  }
};

/**
 * Actualiza un destino existente
 */
export const updateDestino = async (id: string, data: UpdateDestinoData): Promise<Destino> => {
  try {
    const response = await api.put(`/destinos/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar destino:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Destino no encontrado');
      }
      throw new Error(error.response.data?.detail || 'No se pudo actualizar el destino');
    }
    throw new Error('No se pudo actualizar el destino');
  }
};

/**
 * Elimina un destino
 */
export const deleteDestino = async (id: string): Promise<void> => {
  try {
    await api.delete(`/destinos/${id}`);
  } catch (error) {
    console.error('Error al eliminar destino:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Destino no encontrado');
      }
      throw new Error(error.response.data?.detail || 'No se pudo eliminar el destino');
    }
    throw new Error('No se pudo eliminar el destino');
  }
};
