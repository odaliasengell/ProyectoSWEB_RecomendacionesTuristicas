import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Recomendacion {
  id?: string;
  fecha: string;
  calificacion: number;
  comentario: string;
  id_usuario: string;
  
  // Referencias opcionales a tours o servicios
  id_tour?: string;
  id_servicio?: string;
  tipo_recomendacion?: 'tour' | 'servicio';
  nombre_referencia?: string;
}

export interface CreateRecomendacionDto {
  calificacion: number;
  comentario: string;
  fecha?: string;
  
  // Referencias opcionales
  id_tour?: string;
  id_servicio?: string;
  tipo_recomendacion?: 'tour' | 'servicio';
  nombre_referencia?: string;
}

/**
 * Obtiene todas las recomendaciones
 */
export const getRecomendaciones = async (): Promise<Recomendacion[]> => {
  try {
    console.log('Obteniendo todas las recomendaciones...');
    const response = await api.get('/recomendaciones');
    console.log('Recomendaciones recibidas:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    throw new Error('No se pudieron cargar las recomendaciones');
  }
};

/**
 * Obtiene una recomendación por ID
 */
export const getRecomendacionById = async (id: string): Promise<Recomendacion> => {
  try {
    console.log('Obteniendo recomendación con ID:', id);
    const response = await api.get(`/recomendaciones/${id}`);
    console.log('Recomendación recibida:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener recomendación:', error);
    throw new Error('No se pudo cargar la recomendación');
  }
};

/**
 * Crea una nueva recomendación
 */
export const crearRecomendacion = async (recomendacionData: CreateRecomendacionDto): Promise<Recomendacion> => {
  try {
    console.log('Creando recomendación:', recomendacionData);
    
    // Obtener el id del usuario del localStorage
    const userDataStr = localStorage.getItem('userData') || localStorage.getItem('user');
    
    if (!userDataStr) {
      throw new Error('Usuario no autenticado. Por favor inicia sesión.');
    }
    
    let id_usuario;
    try {
      const userData = JSON.parse(userDataStr);
      id_usuario = userData.id || userData.id_usuario;
      
      if (!id_usuario) {
        throw new Error('ID de usuario no encontrado');
      }
      
      console.log('ID de usuario extraído:', id_usuario);
    } catch (e) {
      console.error('Error al parsear datos del usuario:', e);
      throw new Error('Error al obtener datos del usuario. Por favor inicia sesión nuevamente.');
    }
    
    const recomendacionCompleta = {
      ...recomendacionData,
      id_usuario,
      fecha: recomendacionData.fecha || new Date().toISOString().split('T')[0]
    };
    
    console.log('Enviando recomendación completa:', recomendacionCompleta);
    
    const response = await api.post('/recomendaciones', recomendacionCompleta);
    console.log('Recomendación creada:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('Error al crear recomendación:', error);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
      throw new Error(error.response.data.detail || 'No se pudo crear la recomendación');
    }
    if (error.message.includes('autenticado')) {
      throw error;
    }
    throw new Error('No se pudo crear la recomendación. Por favor, intenta nuevamente.');
  }
};

/**
 * Obtiene las recomendaciones del usuario actual
 */
export const getMisRecomendaciones = async (): Promise<Recomendacion[]> => {
  try {
    // Obtener el id del usuario
    const userDataStr = localStorage.getItem('userData') || localStorage.getItem('user');
    
    if (!userDataStr) {
      throw new Error('Usuario no autenticado. Por favor inicia sesión.');
    }
    
    let id_usuario;
    try {
      const userData = JSON.parse(userDataStr);
      id_usuario = userData.id || userData.id_usuario;
      
      if (!id_usuario) {
        throw new Error('ID de usuario no encontrado');
      }
      
      console.log('Obteniendo recomendaciones para usuario ID:', id_usuario);
    } catch (e) {
      console.error('Error al parsear datos del usuario:', e);
      throw new Error('Error al obtener datos del usuario. Por favor inicia sesión nuevamente.');
    }
    
    // Obtener todas las recomendaciones y filtrar por usuario
    const todasRecomendaciones = await getRecomendaciones();
    const misRecomendaciones = todasRecomendaciones.filter(r => r.id_usuario === id_usuario);
    
    console.log('Mis recomendaciones encontradas:', misRecomendaciones.length);
    return misRecomendaciones;
  } catch (error: any) {
    console.error('Error al obtener mis recomendaciones:', error);
    if (error.message.includes('autenticado')) {
      throw error;
    }
    throw new Error('No se pudieron cargar tus recomendaciones');
  }
};

/**
 * Elimina una recomendación
 */
export const eliminarRecomendacion = async (id: string): Promise<void> => {
  try {
    console.log('🗑️  Eliminando recomendación:', id);
    const response = await api.delete(`/recomendaciones/${id}`);
    console.log('✅ Recomendación eliminada exitosamente:', response.data);
  } catch (error: any) {
    console.error('❌ Error al eliminar recomendación:', error);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
      throw new Error(error.response.data.detail || 'No se pudo eliminar la recomendación');
    }
    throw new Error('No se pudo eliminar la recomendación');
  }
};

