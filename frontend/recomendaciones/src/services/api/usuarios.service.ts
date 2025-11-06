import api from './axios.config';
import { AxiosError } from 'axios';

export interface Usuario {
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  fecha_nacimiento?: string;
  pais?: string;
  telefono?: string;
  preferencias?: string[];
  foto_perfil?: string;
}

export interface CreateUsuarioData {
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  contrasena: string;
  fecha_nacimiento?: string;
  pais?: string;
  telefono?: string;
  preferencias?: string[];
  foto_perfil?: string;
}

export interface UpdateUsuarioData {
  nombre?: string;
  apellido?: string;
  email?: string;
  username?: string;
  fecha_nacimiento?: string;
  pais?: string;
  telefono?: string;
  preferencias?: string[];
  foto_perfil?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    const response = await api.get('/usuarios/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudieron cargar los usuarios');
    }
    throw new Error('No se pudieron cargar los usuarios');
  }
};

export const getUsuarioById = async (id: string): Promise<Usuario> => {
  try {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      throw new Error(error.response.data?.detail || 'No se pudo cargar el usuario');
    }
    throw new Error('No se pudo cargar el usuario');
  }
};

export const createUsuario = async (data: CreateUsuarioData): Promise<Usuario> => {
  try {
    const response = await api.post('/usuarios/', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.detail || 'No se pudo crear el usuario');
    }
    throw new Error('No se pudo crear el usuario');
  }
};

export const updateUsuario = async (id: string, data: UpdateUsuarioData): Promise<Usuario> => {
  try {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      throw new Error(error.response.data?.detail || 'No se pudo actualizar el usuario');
    }
    throw new Error('No se pudo actualizar el usuario');
  }
};

export const deleteUsuario = async (id: string): Promise<void> => {
  try {
    await api.delete(`/usuarios/${id}`);
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      throw new Error(error.response.data?.detail || 'No se pudo eliminar el usuario');
    }
    throw new Error('No se pudo eliminar el usuario');
  }
};

export const getCurrentUser = async (): Promise<Usuario> => {
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
    
    return await getUsuarioById(userId);
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    if (error instanceof Error && error.message.includes('autenticado')) {
      throw error;
    }
    throw new Error('No se pudo cargar el usuario actual');
  }
};

export const updateCurrentUser = async (data: UpdateUsuarioData): Promise<Usuario> => {
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
    
    const updatedUser = await updateUsuario(userId, data);
    
    // Actualizar datos en localStorage
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    
    return updatedUser;
  } catch (error) {
    console.error('Error al actualizar usuario actual:', error);
    if (error instanceof Error && error.message.includes('autenticado')) {
      throw error;
    }
    throw new Error('No se pudo actualizar el usuario');
  }
};
