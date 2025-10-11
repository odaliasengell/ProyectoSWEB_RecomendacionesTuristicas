import axios, { AxiosInstance } from 'axios';

export class GolangAPI {
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

  // Servicios
  async getServicios() {
    try {
      const response = await this.client.get('/servicios');
      return response.data;
    } catch (error) {
      console.error('Error fetching servicios:', error);
      return [];
    }
  }

  async getServicioById(id: string) {
    try {
      const response = await this.client.get(`/servicios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching servicio ${id}:`, error);
      return null;
    }
  }

  async getServiciosByTipo(tipo: string) {
    try {
      const response = await this.client.get(`/servicios/tipo/${tipo}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching servicios by tipo ${tipo}:`, error);
      return [];
    }
  }

  async createServicio(servicioData: any) {
    try {
      const response = await this.client.post('/servicios', servicioData);
      return response.data;
    } catch (error) {
      console.error('Error creating servicio:', error);
      throw new Error('No se pudo crear el servicio');
    }
  }

  async updateServicio(id: string, servicioData: any) {
    try {
      const response = await this.client.put(`/servicios/${id}`, servicioData);
      return response.data;
    } catch (error) {
      console.error(`Error updating servicio ${id}:`, error);
      throw new Error('No se pudo actualizar el servicio');
    }
  }

  async deleteServicio(id: string) {
    try {
      await this.client.delete(`/servicios/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting servicio ${id}:`, error);
      return false;
    }
  }

  // Contrataciones
  async getContrataciones() {
    try {
      const response = await this.client.get('/contrataciones');
      return response.data;
    } catch (error) {
      console.error('Error fetching contrataciones:', error);
      return [];
    }
  }

  async getContratacionById(id: string) {
    try {
      const response = await this.client.get(`/contrataciones/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contratacion ${id}:`, error);
      return null;
    }
  }

  async getContratacionesByServicio(servicioId: string) {
    try {
      const response = await this.client.get(`/contrataciones/servicio/${servicioId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contrataciones for servicio ${servicioId}:`, error);
      return [];
    }
  }

  async getContratacionesByUsuario(usuarioId: string) {
    try {
      const response = await this.client.get(`/contrataciones/usuario/${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contrataciones for usuario ${usuarioId}:`, error);
      return [];
    }
  }

  async createContratacion(contratacionData: any) {
    try {
      const response = await this.client.post('/contrataciones', contratacionData);
      return response.data;
    } catch (error) {
      console.error('Error creating contratacion:', error);
      throw new Error('No se pudo crear la contratación');
    }
  }

  async updateContratacion(id: string, contratacionData: any) {
    try {
      const response = await this.client.put(`/contrataciones/${id}`, contratacionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating contratacion ${id}:`, error);
      throw new Error('No se pudo actualizar la contratación');
    }
  }

  async cancelContratacion(id: string) {
    try {
      const response = await this.client.patch(`/contrataciones/${id}/cancelar`);
      return response.data;
    } catch (error) {
      console.error(`Error canceling contratacion ${id}:`, error);
      throw new Error('No se pudo cancelar la contratación');
    }
  }

  // Estadísticas
  async getEstadisticasServicios() {
    try {
      const response = await this.client.get('/servicios/estadisticas');
      return response.data;
    } catch (error) {
      console.error('Error fetching service statistics:', error);
      return {
        total: 0,
        porTipo: [],
        masContratados: []
      };
    }
  }

  async getEstadisticasContrataciones(fechaInicio?: string, fechaFin?: string) {
    try {
      const response = await this.client.get('/contrataciones/estadisticas', {
        params: { fechaInicio, fechaFin }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching contratacion statistics:', error);
      return {
        total: 0,
        ingresoTotal: 0,
        porMes: []
      };
    }
  }
}
