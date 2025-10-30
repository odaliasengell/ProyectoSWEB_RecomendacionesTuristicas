import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_GOLANG_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Importante para CORS
});

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  destino: string;
  duracion_dias: number;
  capacidad_maxima: number;
  disponible: boolean;
  proveedor: string;
  telefono_contacto: string;
  email_contacto: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContratacionServicio {
  id?: string;
  servicio_id: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  fecha_contratacion: string;
  fecha_inicio: string;
  fecha_fin: string;
  num_viajeros: number;
  moneda: string;
  precio_unitario: number;
  descuento: number;
  total: number;
  estado: string;
  notas?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Obtiene todos los servicios disponibles
 */
export const getServicios = async (): Promise<Servicio[]> => {
  try {
    console.log('Llamando a la API de servicios...');
    console.log('URL base:', api.defaults.baseURL);
    const response = await api.get('/servicios');
    console.log('Servicios recibidos:', response.data);
    
    // La API de Golang devuelve directamente el array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Si viene envuelto en un objeto
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    throw new Error('No se pudieron cargar los servicios');
  }
};

/**
 * Obtiene un servicio por ID
 */
export const getServicioById = async (id: string): Promise<Servicio> => {
  try {
    console.log('Obteniendo servicio con ID:', id);
    const response = await api.get(`/servicios/${id}`);
    console.log('Servicio recibido:', response.data);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    throw new Error('No se pudo cargar el servicio');
  }
};

/**
 * Obtiene servicios por categoría
 */
export const getServiciosByCategoria = async (categoria: string): Promise<Servicio[]> => {
  try {
    const response = await api.get(`/servicios/categoria/${categoria}`);
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener servicios por categoría:', error);
    throw new Error('No se pudieron cargar los servicios');
  }
};

/**
 * Obtiene servicios por destino
 */
export const getServiciosByDestino = async (destino: string): Promise<Servicio[]> => {
  try {
    const response = await api.get(`/servicios/destino/${destino}`);
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener servicios por destino:', error);
    throw new Error('No se pudieron cargar los servicios');
  }
};

/**
 * Crea una contratación de servicio
 */
export const crearContratacion = async (contratacion: Omit<ContratacionServicio, 'id' | 'created_at' | 'updated_at'>): Promise<ContratacionServicio> => {
  try {
    console.log('Creando contratación:', contratacion);
    const response = await api.post('/contrataciones', contratacion);
    console.log('Contratación creada:', response.data);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error al crear contratación:', error);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
      throw new Error(error.response.data.message || 'No se pudo crear la contratación');
    }
    throw new Error('No se pudo crear la contratación. Por favor, intenta nuevamente.');
  }
};

/**
 * Obtiene todas las contrataciones de un cliente por email
 */
export const getContratacionesByEmail = async (email: string): Promise<ContratacionServicio[]> => {
  try {
    const response = await api.get(`/contrataciones/cliente/${email}`);
    console.log('Contrataciones recibidas:', response.data);
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener contrataciones:', error);
    throw new Error('No se pudieron cargar las contrataciones');
  }
};

/**
 * Obtiene todas las contrataciones
 */
export const getContrataciones = async (): Promise<ContratacionServicio[]> => {
  try {
    const response = await api.get('/contrataciones');
    console.log('Todas las contrataciones:', response.data);
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener contrataciones:', error);
    throw new Error('No se pudieron cargar las contrataciones');
  }
};

/**
 * Actualiza una contratación
 */
export const actualizarContratacion = async (id: string, updates: Partial<ContratacionServicio>): Promise<ContratacionServicio> => {
  try {
    const response = await api.put(`/contrataciones/${id}`, updates);
    console.log('Contratación actualizada:', response.data);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al actualizar contratación:', error);
    throw new Error('No se pudo actualizar la contratación');
  }
};

/**
 * Cancela una contratación
 */
export const cancelarContratacion = async (id: string): Promise<void> => {
  try {
    console.log('🚫 Cancelando contratación:', id);
    const response = await api.patch(`/contrataciones/${id}/cancel`);
    console.log('✅ Contratación cancelada:', response.data);
  } catch (error: any) {
    console.error('❌ Error al cancelar contratación:', error);
    if (error.response?.status === 404) {
      throw new Error('Contratación no encontrada');
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data || 'La contratación ya está cancelada o no se puede cancelar');
    }
    throw new Error('No se pudo cancelar la contratación. Por favor, intenta nuevamente.');
  }
};
