import api from './axios.config';

export interface RegisterData {
  nombre: string;
  email: string;
  contraseña: string;
  pais: string;
}

export interface LoginData {
  email: string;
  contraseña: string;
}

export const register = async (data: RegisterData) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const login = async (data: LoginData) => {
  const res = await api.post('/auth/token', data);
  return res.data;
};
