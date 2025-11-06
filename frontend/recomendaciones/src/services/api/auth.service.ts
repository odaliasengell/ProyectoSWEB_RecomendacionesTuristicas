import api from './axios.config';

export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  password: string;
  fecha_nacimiento?: string;
  pais?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    username: string;
  };
}

export const register = async (data: RegisterData) => {
  const res = await api.post('/usuarios/register', data);
  return res.data;
};

export const login = async (data: LoginData): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>('/usuarios/login', data);
  return res.data;
};
