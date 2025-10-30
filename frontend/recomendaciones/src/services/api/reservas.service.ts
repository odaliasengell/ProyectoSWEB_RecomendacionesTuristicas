import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_TYPESCRIPT_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Cambiar a false para evitar problemas con CORS
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

export interface Reserva {
  id_reserva?: number;
  id_usuario: number;
  id_tour: number;
  fecha_reserva: string;
  cantidad_personas: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  precio_total: number;
  comentarios?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReservaDto {
  id_tour: number;
  fecha_reserva: string;
  cantidad_personas: number;
  precio_total: number;
  comentarios?: string;
}

/**
 * Crea una nueva reserva
 */
export const crearReserva = async (reservaData: CreateReservaDto): Promise<Reserva> => {
  try {
    console.log('Creando reserva:', reservaData);
    
    // Obtener el id del usuario del localStorage o contexto de autenticación
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
    
    const reservaCompleta = {
      ...reservaData,
      id_usuario,
      estado: 'pendiente'
    };
    
    console.log('Enviando reserva completa:', reservaCompleta);
    console.log('Detalles de reserva:', JSON.stringify(reservaCompleta, null, 2));
    
    const response = await api.post('/api/reservas', reservaCompleta);
    console.log('Respuesta de creación de reserva:', response.data);
    
    // Extraer el objeto del campo 'data' si existe
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error al crear reserva:', error);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
      console.error('Errores de validación:', JSON.stringify(error.response.data, null, 2));
      throw new Error(error.response.data.message || 'No se pudo crear la reserva');
    }
    throw new Error('No se pudo crear la reserva. Por favor, intenta nuevamente.');
  }
};

/**
 * Obtiene todas las reservas del usuario actual
 */
export const obtenerMisReservas = async (): Promise<Reserva[]> => {
  try {
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
      
      console.log('Obteniendo reservas para usuario ID:', id_usuario);
    } catch (e) {
      console.error('Error al parsear datos del usuario:', e);
      throw new Error('Error al obtener datos del usuario. Por favor inicia sesión nuevamente.');
    }
    
    const response = await api.get(`/api/reservas/usuario/${id_usuario}`);
    console.log('Mis reservas (respuesta completa):', response.data);
    
    // Extraer el array del campo 'data' si existe
    if (response.data && response.data.data) {
      console.log('Reservas encontradas:', response.data.data.length);
      return response.data.data;
    }
    
    console.log('Reservas encontradas (sin estructura data):', response.data?.length || 0);
    return response.data || [];
  } catch (error: any) {
    console.error('Error al obtener reservas:', error);
    if (error.message.includes('autenticado')) {
      throw error; // Propagar el error de autenticación
    }
    throw new Error('No se pudieron cargar las reservas');
  }
};

/**
 * Obtiene una reserva específica por ID
 */
export const obtenerReservaPorId = async (id: number): Promise<Reserva> => {
  try {
    const response = await api.get(`/api/reservas/${id}`);
    console.log('Reserva obtenida:', response.data);
    
    // Extraer el objeto del campo 'data' si existe
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    throw new Error('No se pudo cargar la reserva');
  }
};

/**
 * Cancela una reserva
 */
export const cancelarReserva = async (id: number): Promise<Reserva> => {
  try {
    const response = await api.put(`/api/reservas/${id}`, {
      estado: 'cancelada'
    });
    
    console.log('Reserva cancelada:', response.data);
    
    // Extraer el objeto del campo 'data' si existe
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    throw new Error('No se pudo cancelar la reserva');
  }
};

/**
 * Actualiza una reserva
 */
export const actualizarReserva = async (id: number, updates: Partial<CreateReservaDto>): Promise<Reserva> => {
  try {
    const response = await api.put(`/api/reservas/${id}`, updates);
    console.log('Reserva actualizada:', response.data);
    
    // Extraer el objeto del campo 'data' si existe
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    throw new Error('No se pudo actualizar la reserva');
  }
};

/**
 * Obtiene todas las reservas (admin)
 */
export const obtenerTodasLasReservas = async (): Promise<Reserva[]> => {
  try {
    const response = await api.get('/api/reservas');
    console.log('Todas las reservas:', response.data);
    
    // Extraer el array del campo 'data' si existe
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener todas las reservas:', error);
    throw new Error('No se pudieron cargar las reservas');
  }
};

// Para compatibilidad con código existente
export const getReservas = obtenerTodasLasReservas;
