import api from './axios.config';
import { AxiosError } from 'axios';

export interface Recomendacion {
  id?: string;
  id_usuario: string;
  id_destino?: string;
  id_tour?: string;
  calificacion: number;
  comentario: string;
  fecha?: string;
  verificada?: boolean;
}

export interface CreateRecomendacionData {
  id_usuario: string;
  id_destino?: string;
  id_tour?: string;
  calificacion: number;
  comentario: string;
  fecha?: string;
}

export interface UpdateRecomendacionData extends Partial<Omit<CreateRecomendacionData, 'id_usuario'>> {
  verificada?: boolean;
}

export const getRecomendaciones = async (): Promise<Recomendacion[]> => {
  try {
    const response = await api.get('/recomendaciones/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudieron cargar las recomendaciones');
    }
    throw new Error('No se pudieron cargar las recomendaciones');
  }
};

export const getRecomendacionById = async (id: string): Promise<Recomendacion> => {
  try {
    const response = await api.get(`/recomendaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener recomendación:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Recomendación no encontrada');
      }
      throw new Error(error.response.data?.detail || 'No se pudo cargar la recomendación');
    }
    throw new Error('No se pudo cargar la recomendación');
  }
};

export const createRecomendacion = async (data: CreateRecomendacionData): Promise<Recomendacion> => {
  try {
    const response = await api.post('/recomendaciones/', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear recomendación:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudo crear la recomendación');
    }
    throw new Error('No se pudo crear la recomendación');
  }
};

// Alias para compatibilidad
export const crearRecomendacion = createRecomendacion;

export const updateRecomendacion = async (id: string, data: UpdateRecomendacionData): Promise<Recomendacion> => {
  try {
    const response = await api.put(`/recomendaciones/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar recomendación:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Recomendación no encontrada');
      }
      throw new Error(error.response.data?.detail || 'No se pudo actualizar la recomendación');
    }
    throw new Error('No se pudo actualizar la recomendación');
  }
};

export const deleteRecomendacion = async (id: string): Promise<void> => {
  try {
    await api.delete(`/recomendaciones/${id}`);
  } catch (error) {
    console.error('Error al eliminar recomendación:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Recomendación no encontrada');
      }
      throw new Error(error.response.data?.detail || 'No se pudo eliminar la recomendación');
    }
    throw new Error('No se pudo eliminar la recomendación');
  }
};

export const obtenerMisRecomendaciones = async (): Promise<Recomendacion[]> => {
  try {
    const userDataStr = localStorage.getItem('userData') || localStorage.getItem('user');
    
    if (!userDataStr) {
      throw new Error('Usuario no autenticado. Por favor inicia sesión.');
    }
    
    const userData = JSON.parse(userDataStr);
    const userId = userData.id || userData.id_usuario;
    
    if (!userId) {
      throw new Error('ID de usuario no encontrado');
    }
    
    const todasLasRecomendaciones = await getRecomendaciones();
    return todasLasRecomendaciones.filter(rec => rec.id_usuario === userId);
  } catch (error) {
    console.error('Error al obtener mis recomendaciones:', error);
    if (error instanceof Error && error.message.includes('autenticado')) {
      throw error;
    }
    throw new Error('No se pudieron cargar tus recomendaciones');
  }
};
