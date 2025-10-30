import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_TYPESCRIPT_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

export interface Tour {
  id_tour: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  precio: number;
  capacidad_maxima?: number;
  capacidadMaxima?: number;
  disponible: boolean;
  id_guia?: number;
  id_destino?: string;
  imagenUrl?: string;
  ubicacion?: string;
  categoria?: string;
  dificultad?: string;
  fechaInicio?: string;
  fechaFin?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Obtiene todos los tours
 */
export const getTours = async (): Promise<Tour[]> => {
  try {
    console.log('Llamando a la API de tours...');
    console.log('URL base:', api.defaults.baseURL);
    const response = await api.get('/api/tours');
    console.log('Tours recibidos:', response.data);
    
    // La API devuelve { success: true, data: [...], message: '...', timestamp: '...' }
    // Extraemos el array del campo 'data'
    if (response.data && response.data.data) {
      console.log('Array de tours:', response.data.data);
      return response.data.data;
    }
    
    // Si no hay campo 'data', devolvemos array vacío
    console.warn('No se encontró el campo data en la respuesta');
    return [];
  } catch (error) {
    console.error('Error al obtener tours:', error);
    throw new Error('No se pudieron cargar los tours');
  }
};

/**
 * Obtiene tours disponibles
 */
export const getToursDisponibles = async (): Promise<Tour[]> => {
  try {
    const response = await api.get('/api/tours/disponibles');
    
    // Extraemos el array del campo 'data'
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener tours disponibles:', error);
    throw new Error('No se pudieron cargar los tours disponibles');
  }
};

/**
 * Obtiene un tour por su ID
 */
export const getTourById = async (id: number): Promise<Tour> => {
  try {
    console.log('Obteniendo tour con ID:', id);
    const response = await api.get(`/api/tours/${id}`);
    console.log('Tour recibido:', response.data);
    
    // Extraemos el objeto del campo 'data'
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    throw new Error('Tour no encontrado');
  } catch (error) {
    console.error('Error al obtener tour:', error);
    throw new Error('No se pudo cargar el tour');
  }
};

