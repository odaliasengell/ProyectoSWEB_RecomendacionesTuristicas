import axios, { AxiosInstance } from 'axios';

export class PythonAPI {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Usuarios
  async getUsuarios() {
    try {
      const response = await this.client.get('/usuarios/');
      const usuarios = response.data;
      // Convertir 'contraseña' a 'contrasena' para cada usuario
      return usuarios.map((u: any) => {
        if (u.contraseña !== undefined) {
          u.contrasena = u.contraseña;
          delete u.contraseña;
        }
        return u;
      });
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      return [];
    }
  }

  async getUsuarioById(id: string) {
    try {
      const response = await this.client.get(`/usuarios/${id}/`);
      const usuario = response.data;
      // Convertir 'contraseña' a 'contrasena'
      if (usuario.contraseña !== undefined) {
        usuario.contrasena = usuario.contraseña;
        delete usuario.contraseña;
      }
      return usuario;
    } catch (error) {
      console.error(`Error fetching usuario ${id}:`, error);
      return null;
    }
  }

  async createUsuario(usuarioData: any) {
    try {
      // Convertir 'contrasena' a 'contraseña' para Python
      const pythonData = {
        nombre: usuarioData.nombre,
        email: usuarioData.email,
        contraseña: usuarioData.contrasena,
        pais: usuarioData.pais || null
      };
      
      const response = await this.client.post('/usuarios/', pythonData);
      // El endpoint retorna { mensaje: "...", data: {...} }
      const userData = response.data.data || response.data;
      
      // Convertir 'contraseña' de vuelta a 'contrasena' para GraphQL
      if (userData.contraseña !== undefined) {
        userData.contrasena = userData.contraseña;
        delete userData.contraseña;
      }
      
      return userData;
    } catch (error: any) {
      console.error('Error creating usuario:', error.response?.data || error.message);
      throw new Error('No se pudo crear el usuario');
    }
  }

  // Destinos
  async getDestinos() {
    try {
      const response = await this.client.get('/destinos/');
      return response.data;
    } catch (error) {
      console.error('Error fetching destinos:', error);
      return [];
    }
  }

  async getDestinoById(id: string) {
    try {
      const response = await this.client.get(`/destinos/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching destino ${id}:`, error);
      return null;
    }
  }

  // Recomendaciones
  async getRecomendaciones() {
    try {
      const response = await this.client.get('/recomendaciones/');
      return response.data;
    } catch (error) {
      console.error('Error fetching recomendaciones:', error);
      return [];
    }
  }

  async getRecomendacionById(id: string) {
    try {
      const response = await this.client.get(`/recomendaciones/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching recomendacion ${id}:`, error);
      return null;
    }
  }

  async getRecomendacionesByUsuario(usuarioId: string) {
    try {
      const response = await this.client.get(`/recomendaciones/usuario/${usuarioId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching recomendaciones for usuario ${usuarioId}:`, error);
      return [];
    }
  }
}
