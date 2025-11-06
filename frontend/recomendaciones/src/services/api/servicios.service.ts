import api from './axios.config';
import { AxiosError } from 'axios';

export interface Servicio {
  id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria?: string;
  tipo?: string;
  duracion?: string;
  disponible?: boolean;
  proveedor?: string;
  ubicacion?: string;
  incluye?: string[];
  requisitos?: string[];
  imagen_url?: string;
}

export interface CreateServicioData {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria?: string;
  tipo?: string;
  duracion?: string;
  disponible?: boolean;
  proveedor?: string;
  ubicacion?: string;
  incluye?: string[];
  requisitos?: string[];
  imagen_url?: string;
}

export interface UpdateServicioData extends Partial<CreateServicioData> {}

export const getServicios = async (): Promise<Servicio[]> => {
  try {
    const response = await api.get('/servicios/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudieron cargar los servicios');
    }
    throw new Error('No se pudieron cargar los servicios');
  }
};

export const getServicioById = async (id: string): Promise<Servicio> => {
  try {
    const response = await api.get(`/servicios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Servicio no encontrado');
      }
      throw new Error(error.response.data?.detail || 'No se pudo cargar el servicio');
    }
    throw new Error('No se pudo cargar el servicio');
  }
};

export const createServicio = async (data: CreateServicioData): Promise<Servicio> => {
  try {
    const response = await api.post('/servicios/', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear servicio:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudo crear el servicio');
    }
    throw new Error('No se pudo crear el servicio');
  }
};

export const updateServicio = async (id: string, data: UpdateServicioData): Promise<Servicio> => {
  try {
    const response = await api.put(`/servicios/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Servicio no encontrado');
      }
      throw new Error(error.response.data?.detail || 'No se pudo actualizar el servicio');
    }
    throw new Error('No se pudo actualizar el servicio');
  }
};

export const deleteServicio = async (id: string): Promise<void> => {
  try {
    await api.delete(`/servicios/${id}`);
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Servicio no encontrado');
      }
      throw new Error(error.response.data?.detail || 'No se pudo eliminar el servicio');
    }
    throw new Error('No se pudo eliminar el servicio');
  }
};

export const getServiciosDisponibles = async (): Promise<Servicio[]> => {
  try {
    const servicios = await getServicios();
    return servicios.filter(servicio => servicio.disponible !== false);
  } catch (error) {
    console.error('Error al obtener servicios disponibles:', error);
    throw new Error('No se pudieron cargar los servicios disponibles');
  }
};
