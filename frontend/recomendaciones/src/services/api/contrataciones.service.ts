import api from './axios.config';
import { AxiosError } from 'axios';

export interface ContratacionServicio {
  id?: string;
  usuario_id: string;
  servicio_id: string;
  fecha_contratacion: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  cantidad_personas: number;
  total: number;
  estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  notas?: string;
}

export interface CreateContratacionData {
  usuario_id: string;
  servicio_id: string;
  fecha_contratacion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  cantidad_personas: number;
  total: number;
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  notas?: string;
}

export interface UpdateContratacionData extends Partial<Omit<CreateContratacionData, 'usuario_id' | 'servicio_id'>> {
  estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
}

export const getContrataciones = async (): Promise<ContratacionServicio[]> => {
  try {
    const response = await api.get('/contrataciones/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener contrataciones:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudieron cargar las contrataciones');
    }
    throw new Error('No se pudieron cargar las contrataciones');
  }
};

export const getContratacionById = async (id: string): Promise<ContratacionServicio> => {
  try {
    const response = await api.get(`/contrataciones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener contratación:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Contratación no encontrada');
      }
      throw new Error(error.response.data?.detail || 'No se pudo cargar la contratación');
    }
    throw new Error('No se pudo cargar la contratación');
  }
};

export const createContratacion = async (data: CreateContratacionData): Promise<ContratacionServicio> => {
  try {
    const response = await api.post('/contrataciones/', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear contratación:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudo crear la contratación');
    }
    throw new Error('No se pudo crear la contratación');
  }
};

// Alias para compatibilidad
export const crearContratacion = createContratacion;

export const updateContratacion = async (id: string, data: UpdateContratacionData): Promise<ContratacionServicio> => {
  try {
    const response = await api.put(`/contrataciones/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar contratación:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Contratación no encontrada');
      }
      throw new Error(error.response.data?.detail || 'No se pudo actualizar la contratación');
    }
    throw new Error('No se pudo actualizar la contratación');
  }
};

export const deleteContratacion = async (id: string): Promise<void> => {
  try {
    await api.delete(`/contrataciones/${id}`);
  } catch (error) {
    console.error('Error al eliminar contratación:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Contratación no encontrada');
      }
      throw new Error(error.response.data?.detail || 'No se pudo eliminar la contratación');
    }
    throw new Error('No se pudo eliminar la contratación');
  }
};

export const cancelarContratacion = async (id: string): Promise<ContratacionServicio> => {
  return updateContratacion(id, { estado: 'cancelada' });
};

export const obtenerMisContrataciones = async (): Promise<ContratacionServicio[]> => {
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
    
    const todasLasContrataciones = await getContrataciones();
    return todasLasContrataciones.filter(cont => cont.usuario_id === userId);
  } catch (error) {
    console.error('Error al obtener mis contrataciones:', error);
    if (error instanceof Error && error.message.includes('autenticado')) {
      throw error;
    }
    throw new Error('No se pudieron cargar tus contrataciones');
  }
};
