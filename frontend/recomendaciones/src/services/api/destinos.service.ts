import api from './axios.config';
import { AxiosError } from 'axios';

export interface Destino {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  ruta: string;
  provincia?: string;
  ciudad?: string;
  categoria?: string;
  calificacion_promedio?: number;
  activo?: boolean;
}

export const getDestinos = async (): Promise<Destino[]> => {
  try {
    console.log('Llamando a la API de destinos...');
    console.log('URL base:', api.defaults.baseURL);
    const response = await api.get('/admin/turismo/destinos');
    console.log('Respuesta recibida:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener destinos:', error);
    if (error instanceof AxiosError) {
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        console.error('Status:', error.response.status);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor');
      }
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
    }
    throw new Error('No se pudieron cargar los destinos');
  }
};

export const getDestinoById = async (id: string): Promise<Destino> => {
  try {
    console.log('Obteniendo destino con ID:', id);
    const response = await api.get(`/admin/turismo/destinos/${id}`);
    console.log('Destino recibido:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener destino:', error);
    if (error instanceof AxiosError) {
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        console.error('Status:', error.response.status);
      }
    }
    throw new Error('No se pudo cargar el destino');
  }
};
