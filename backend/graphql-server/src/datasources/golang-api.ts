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
      console.log(`🔍 Buscando servicio con ID: ${id} (tipo: ${typeof id})`);
      const response = await this.client.get(`/servicios/${id}`);
      console.log(`✅ Servicio encontrado:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error fetching servicio ${id}:`, error.message);
      if (error.response) {
        console.error(`❌ Status: ${error.response.status}, Data:`, error.response.data);
      }
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
      console.log('📤 Enviando datos a Go API:', JSON.stringify(servicioData));
      const response = await this.client.post('/servicios', servicioData);
      console.log('📥 Respuesta de Go API:', response.status, response.data);
      
      // Go devuelve 201 Created con el ID en el body
      if (response.data && response.data.id !== undefined) {
        console.log('✅ ID recibido:', response.data.id);
        return String(response.data.id);
      }
      // Fallback: intentar extraer del Location header
      const location = response.headers.location;
      if (location) {
        const id = location.split('/').pop();
        console.log('✅ ID extraído del header:', id);
        return id;
      }
      console.log('⚠️ Devolviendo data completo:', response.data);
      return String(response.data);
    } catch (error: any) {
      console.error('❌ Error creating servicio:', error.message);
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
        throw new Error(`Go API Error ${error.response.status}: ${error.response.data}`);
      } else if (error.request) {
        console.error('❌ No response from Go API:', error.request);
        throw new Error('Go API no está respondiendo - verifica que esté ejecutándose en localhost:8080');
      } else {
        console.error('❌ Error setting up request:', error.message);
        throw new Error(`Error de conexión: ${error.message}`);
      }
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
      console.log('📤 Enviando datos de contratación a Go API:', JSON.stringify(contratacionData));
      
      // Transformar servicio_id de string a número
      const payload = {
        ...contratacionData,
        servicio_id: parseInt(contratacionData.servicio_id, 10)
      };
      
      console.log('📤 Payload transformado:', JSON.stringify(payload));
      
      const response = await this.client.post('/contrataciones', payload);
      console.log('📥 Respuesta de Go API:', response.status, response.data);
      
      // Go devuelve 201 Created con el ID en el body
      if (response.data && response.data.id !== undefined) {
        console.log('✅ ID recibido:', response.data.id);
        return String(response.data.id);
      }
      // Fallback: intentar extraer del Location header
      const location = response.headers.location;
      if (location) {
        const id = location.split('/').pop();
        console.log('✅ ID extraído del header:', id);
        return id;
      }
      console.log('⚠️ Devolviendo data completo:', response.data);
      return String(response.data);
    } catch (error: any) {
      console.error('❌ Error creating contratacion:', error.message);
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
        throw new Error(`Go API Error ${error.response.status}: ${error.response.data}`);
      } else if (error.request) {
        console.error('❌ No response from Go API:', error.request);
        throw new Error('Go API no está respondiendo - verifica que esté ejecutándose en localhost:8080');
      } else {
        console.error('❌ Error setting up request:', error.message);
        throw new Error(`Error de conexión: ${error.message}`);
      }
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
